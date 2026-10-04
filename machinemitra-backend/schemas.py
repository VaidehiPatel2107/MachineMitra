from pydantic import BaseModel, Field, ConfigDict
from typing import Optional, List, Literal
from datetime import datetime

# ----------------- INGESTION SCHEMAS -----------------
class TelemetryPacketIn(BaseModel):
    machineId: str = Field(..., example="MM-DRL-001")
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    temperature: float = Field(..., ge=-20.0, le=200.0, description="°C")
    vibration: float = Field(..., ge=0.0, le=50.0, description="mm/s RMS")
    drillSpeedRpm: int = Field(..., ge=0, le=10000, description="RPM")
    powerKw: float = Field(..., ge=0.0, le=100.0, description="Active Power kW")
    torqueNm: float = Field(..., ge=0.0, le=500.0, description="Nm")
    soundDb: float = Field(..., ge=30.0, le=140.0, description="dB Sound Pressure")

    model_config = ConfigDict(populate_by_name=True)


class TelemetryPacketOut(BaseModel):
    id: int
    machine_id: str
    timestamp: datetime
    temperature: float
    vibration: float
    drill_speed_rpm: int
    power_kw: float
    torque_nm: float
    sound_db: float
    operational_state: str

    model_config = ConfigDict(from_attributes=True)


# ----------------- AGGREGATION SCHEMAS -----------------
class AggregationSummary(BaseModel):
    machine_id: str
    timeframe: str
    window_start: datetime
    window_end: datetime
    samples_count: int
    avg_temperature: float
    max_temperature: float
    avg_vibration_rms: float
    max_vibration_rms: float
    avg_drill_speed_rpm: int
    avg_power_kw: float
    avg_torque_nm: float
    energy_kwh: float
    minutes_running: float
    minutes_idle: float
    minutes_overload: float
    minutes_abnormal: float

    model_config = ConfigDict(from_attributes=True)


class SyncAggregatesRequest(BaseModel):
    machineId: str = Field(default="MM-DRL-001")
    timeframe: Literal["15m", "1h", "24h"] = "15m"


# ----------------- MACHINE HEALTH & EVENT SCHEMAS -----------------
class MachineHealthResponse(BaseModel):
    machine_id: str
    current_status: str
    health_score: float = Field(..., ge=0.0, le=100.0)
    penalties: dict
    active_alarms: List[str]
    last_evaluated_at: datetime


# ----------------- MAINTENANCE SCHEMAS -----------------
class MaintenanceLogIn(BaseModel):
    machine_id: str = Field(default="MM-DRL-001")
    technician: str = Field(..., min_length=2)
    tasks_performed: str = Field(..., min_length=5)
    next_scheduled_inspection: datetime
    post_maintenance_health: Optional[float] = 100.0


class MaintenanceLogOut(BaseModel):
    id: int
    machine_id: str
    logged_at: datetime
    technician: str
    tasks_performed: str
    next_scheduled_inspection: datetime
    post_maintenance_health: float

    model_config = ConfigDict(from_attributes=True)