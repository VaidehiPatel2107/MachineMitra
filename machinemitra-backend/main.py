import json
import asyncio
from typing import List, Dict
from datetime import datetime, timedelta
from fastapi import FastAPI, Depends, HTTPException, WebSocket, WebSocketDisconnect, Query, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

import models
import schemas
from database import engine, get_db
from state_classifier import classify_drill_state
from aggregation_service import TelemetryAggregator

# Create tables automatically on startup
models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="MachineMitra Industrial IoT Core API",
    description="Real-Time Telemetry Ingestion, Aggregation Engine & Digital Twin Endpoint Suite",
    version="2.4.0"
)

# ----------------- CORS CONFIGURATION -----------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- WEBSOCKET BROADCASTER -----------------
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, machine_id: str, websocket: WebSocket):
        await websocket.accept()
        if machine_id not in self.active_connections:
            self.active_connections[machine_id] = []
        self.active_connections[machine_id].append(websocket)

    def disconnect(self, machine_id: str, websocket: WebSocket):
        if machine_id in self.active_connections:
            self.active_connections[machine_id].remove(websocket)
            if not self.active_connections[machine_id]:
                del self.active_connections[machine_id]

    async def broadcast_telemetry(self, machine_id: str, message: dict):
        if machine_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[machine_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.append(connection)
            for dead in dead_connections:
                self.disconnect(machine_id, dead)

ws_manager = ConnectionManager()


# ----------------- LIFECYCLE SEEDING -----------------
@app.on_event("startup")
def bootstrap_database():
    """Ensure the target prototype machine exists in registry."""
    from database import SessionLocal
    db = SessionLocal()
    existing = db.query(models.Machine).filter(models.Machine.machine_id == "MM-DRL-001").first()
    if not existing:
        seed_machine = models.Machine(
            machine_id="MM-DRL-001",
            machine_name="CNC Industrial Drilling Machine",
            machine_model="Automated Precision Drill Unit",
            rated_power_kw=7.5,
            location_bay="Bay 3 — Precision Fabrication",
            current_status="RUNNING_NORMAL",
            health_score=93.0
        )
        db.add(seed_machine)
        db.commit()
    db.close()


# ----------------- TELEMETRY INGESTION -----------------
@app.post(
    "/api/v1/telemetry/ingest",
    response_model=schemas.TelemetryPacketOut,
    status_code=status.HTTP_201_CREATED,
    tags=["Ingestion"]
)
async def ingest_telemetry_packet(packet: schemas.TelemetryPacketIn, db: Session = Depends(get_db)):
    """
    Ingests live JSON telemetry from ESP32/Edge sensors, infers operating state,
    persists raw reading, and broadcasts to active dashboard WebSockets.
    """
    machine = db.query(models.Machine).filter(models.Machine.machine_id == packet.machineId).first()
    if not machine:
        raise HTTPException(status_code=404, detail=f"Machine {packet.machineId} not registered.")

    # Infer physical state
    inferred_state = classify_drill_state(
        power_kw=packet.powerKw,
        rpm=packet.drillSpeedRpm,
        vibration=packet.vibration,
        temp=packet.temperature
    )

    # Save reading
    record = models.RawSensorReading(
        machine_id=packet.machineId,
        timestamp=packet.timestamp,
        temperature=packet.temperature,
        vibration=packet.vibration,
        drill_speed_rpm=packet.drillSpeedRpm,
        power_kw=packet.powerKw,
        torque_nm=packet.torqueNm,
        sound_db=packet.soundDb,
        operational_state=inferred_state
    )
    db.add(record)

    # Update machine status
    machine.current_status = inferred_state
    db.commit()
    db.refresh(record)

    # Broadcast payload to connected WebSockets
    payload = {
        "timestamp": record.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
        "temperature": record.temperature,
        "vibration": record.vibration,
        "drillSpeedRpm": record.drill_speed_rpm,
        "powerKw": record.power_kw,
        "torqueNm": record.torque_nm,
        "soundDb": record.sound_db,
        "status": record.operational_state
    }
    await ws_manager.broadcast_telemetry(packet.machineId, payload)

    return record


# ----------------- HISTORICAL & LIVE TELEMETRY -----------------
@app.get("/api/v1/telemetry/live/{machine_id}", tags=["Telemetry"])
def get_live_machine_telemetry(machine_id: str, db: Session = Depends(get_db)):
    """Fetch instantaneous sensor reading and operating state."""
    latest = (
        db.query(models.RawSensorReading)
        .filter(models.RawSensorReading.machine_id == machine_id)
        .order_by(models.RawSensorReading.timestamp.desc())
        .first()
    )
    if not latest:
        raise HTTPException(status_code=404, detail="No telemetry logged yet for this asset.")

    return {
        "machine_id": latest.machine_id,
        "timestamp": latest.timestamp.isoformat(),
        "temperature": latest.temperature,
        "vibration": latest.vibration,
        "drillSpeedRpm": latest.drill_speed_rpm,
        "powerKw": latest.power_kw,
        "torqueNm": latest.torque_nm,
        "soundDb": latest.sound_db,
        "operational_state": latest.operational_state
    }


@app.get("/api/v1/telemetry/history/{machine_id}", response_model=List[schemas.TelemetryPacketOut], tags=["Telemetry"])
def get_historical_telemetry_logs(
    machine_id: str,
    limit: int = Query(25, ge=1, le=500),
    status_filter: str = Query(None),
    db: Session = Depends(get_db)
):
    """Returns paginated historical records formatted for the React table log."""
    query = (
        db.query(models.RawSensorReading)
        .filter(models.RawSensorReading.machine_id == machine_id)
    )
    if status_filter:
        query = query.filter(models.RawSensorReading.operational_state == status_filter)

    records = query.order_by(models.RawSensorReading.timestamp.desc()).limit(limit).all()
    return records


# ----------------- AGGREGATION ENDPOINTS -----------------
@app.get(
    "/api/v1/telemetry/aggregates/{machine_id}",
    response_model=schemas.AggregationSummary,
    tags=["Aggregates"]
)
def get_telemetry_rolling_aggregates(
    machine_id: str,
    timeframe: str = Query("15m", regex="^(15m|1h|24h)$"),
    db: Session = Depends(get_db)
):
    """
    Computes rolling averages, RMS vibration, energy (kWh), and state minutes
    over the selected timeframe (15m, 1h, 24h).
    """
    summary = TelemetryAggregator.compute_rolling_aggregate(db, machine_id, timeframe)
    return summary


@app.post("/api/v1/telemetry/aggregates/sync", tags=["Aggregates"])
def sync_aggregates_to_database(
    payload: schemas.SyncAggregatesRequest,
    db: Session = Depends(get_db)
):
    """
    Calculates rolling window statistics and writes them directly into the
    aggregated_telemetry table for permanent persistence.
    """
    summary = TelemetryAggregator.compute_rolling_aggregate(db, payload.machineId, payload.timeframe)
    if summary.samples_count == 0:
        raise HTTPException(status_code=400, detail="Cannot sync aggregates: no raw samples in specified window.")

    record = TelemetryAggregator.persist_aggregate(db, summary)
    return {
        "status": "SUCCESS",
        "message": f"Aggregates for {payload.timeframe} saved to database.",
        "record_id": record.id,
        "computed_at": record.window_end.isoformat(),
        "energy_kwh": record.energy_kwh
    }


# ----------------- MACHINE HEALTH & PENALTY ENGINE -----------------
@app.get("/api/v1/machines/{machine_id}/health", response_model=schemas.MachineHealthResponse, tags=["Diagnostics"])
def evaluate_machine_health(machine_id: str, db: Session = Depends(get_db)):
    """
    Calculates dynamic health score (0-100) using vibration, thermal, and overload penalties.
    """
    machine = db.query(models.Machine).filter(models.Machine.machine_id == machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    recent_summary = TelemetryAggregator.compute_rolling_aggregate(db, machine_id, "15m")

    # Base health score
    base_score = 100.0
    penalties = {}
    active_alarms = []

    # 1. Thermal Degradation Check
    if recent_summary.avg_temperature > 75.0:
        penalty = min(25.0, (recent_summary.avg_temperature - 75.0) * 2.5)
        penalties["thermal_penalty"] = round(penalty, 1)
        base_score -= penalty
        active_alarms.append(f"Thermal elevated ({recent_summary.avg_temperature}°C)")

    # 2. Vibration Severity Check (ISO standard)
    if recent_summary.avg_vibration_rms > 2.2:
        penalty = min(30.0, (recent_summary.avg_vibration_rms - 2.2) * 20.0)
        penalties["vibration_penalty"] = round(penalty, 1)
        base_score -= penalty
        active_alarms.append(f"Vibration harmonic breach ({recent_summary.avg_vibration_rms} mm/s)")

    # 3. Excessive Idle Penalty
    if recent_summary.minutes_idle > 8.0:
        penalties["idle_wastage_penalty"] = 5.0
        base_score -= 5.0
        active_alarms.append(f"Idle energy wastage detected ({recent_summary.minutes_idle} min)")

    final_score = max(10.0, min(100.0, round(base_score, 1)))
    machine.health_score = final_score
    db.commit()

    return schemas.MachineHealthResponse(
        machine_id=machine_id,
        current_status=machine.current_status,
        health_score=final_score,
        penalties=penalties,
        active_alarms=active_alarms,
        last_evaluated_at=datetime.utcnow()
    )


# ----------------- MAINTENANCE LOGGING -----------------
@app.post("/api/v1/maintenance/log", response_model=schemas.MaintenanceLogOut, tags=["Maintenance"])
def log_machine_maintenance(payload: schemas.MaintenanceLogIn, db: Session = Depends(get_db)):
    """Logs technician maintenance, updates next inspection date, and restores asset health."""
    machine = db.query(models.Machine).filter(models.Machine.machine_id == payload.machine_id).first()
    if not machine:
        raise HTTPException(status_code=404, detail="Machine not found")

    log_entry = models.MaintenanceLog(
        machine_id=payload.machine_id,
        technician=payload.technician,
        tasks_performed=payload.tasks_performed,
        next_scheduled_inspection=payload.next_scheduled_inspection,
        post_maintenance_health=payload.post_maintenance_health
    )
    db.add(log_entry)

    # Restores machine health rating post-overhaul
    machine.health_score = payload.post_maintenance_health
    db.commit()
    db.refresh(log_entry)

    return log_entry


# ----------------- WEBSOCKET STREAMING -----------------
@app.websocket("/ws/telemetry/{machine_id}")
async def telemetry_websocket_stream(websocket: WebSocket, machine_id: str):
    """Direct low-latency WebSocket connection for React waveform oscilloscope charts."""
    await ws_manager.connect(machine_id, websocket)
    try:
        while True:
            # Keep connection open; incoming packets ingested via POST broadcast automatically
            await websocket.receive_text()
    except WebSocketDisconnect:
        ws_manager.disconnect(machine_id, websocket)