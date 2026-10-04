import datetime
import numpy as np
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import models
import schemas

TIMEFRAME_DELTAS = {
    "15m": datetime.timedelta(minutes=15),
    "1h": datetime.timedelta(hours=1),
    "24h": datetime.timedelta(hours=24),
}

class TelemetryAggregator:
    @staticmethod
    def calculate_window_metrics(
        readings: List[models.RawSensorReading],
        machine_id: str,
        timeframe: str,
        window_start: datetime.datetime,
        window_end: datetime.datetime
    ) -> schemas.AggregationSummary:
        if not readings:
            return schemas.AggregationSummary(
                machine_id=machine_id,
                timeframe=timeframe,
                window_start=window_start,
                window_end=window_end,
                samples_count=0,
                avg_temperature=0.0,
                max_temperature=0.0,
                avg_vibration_rms=0.0,
                max_vibration_rms=0.0,
                avg_drill_speed_rpm=0,
                avg_power_kw=0.0,
                avg_torque_nm=0.0,
                energy_kwh=0.0,
                minutes_running=0.0,
                minutes_idle=0.0,
                minutes_overload=0.0,
                minutes_abnormal=0.0,
            )

        count = len(readings)
        temps = [r.temperature for r in readings]
        vibs = [r.vibration for r in readings]
        rpms = [r.drill_speed_rpm for r in readings]
        powers = [r.power_kw for r in readings]
        torques = [r.torque_nm for r in readings]

        # Basic Averages & Extremes
        avg_temp = float(np.mean(temps))
        max_temp = float(np.max(temps))
        
        # True Root Mean Square (RMS) for vibration
        vibration_rms = float(np.sqrt(np.mean(np.square(vibs))))
        max_vib = float(np.max(vibs))

        avg_rpm = int(np.mean(rpms))
        avg_power = float(np.mean(powers))
        avg_torque = float(np.mean(torques))

        # Energy consumption = Power (kW) * Time (hours)
        total_seconds = (window_end - window_start).total_seconds()
        hours_in_window = total_seconds / 3600.0
        energy_kwh = float(round(avg_power * hours_in_window, 4))

        # State breakdown
        # Estimate duration per packet slice based on total sample density
        slice_minutes = (total_seconds / count) / 60.0 if count > 0 else 0.0

        min_running = sum(slice_minutes for r in readings if r.operational_state == "RUNNING_NORMAL")
        min_idle = sum(slice_minutes for r in readings if r.operational_state == "IDLE")
        min_overload = sum(slice_minutes for r in readings if r.operational_state == "OVERLOAD")
        min_abnormal = sum(slice_minutes for r in readings if r.operational_state in ["ABNORMAL_VIBRATION", "OVERHEATING"])

        return schemas.AggregationSummary(
            machine_id=machine_id,
            timeframe=timeframe,
            window_start=window_start,
            window_end=window_end,
            samples_count=count,
            avg_temperature=round(avg_temp, 2),
            max_temperature=round(max_temp, 2),
            avg_vibration_rms=round(vibration_rms, 2),
            max_vibration_rms=round(max_vib, 2),
            avg_drill_speed_rpm=avg_rpm,
            avg_power_kw=round(avg_power, 2),
            avg_torque_nm=round(avg_torque, 2),
            energy_kwh=energy_kwh,
            minutes_running=round(min_running, 2),
            minutes_idle=round(min_idle, 2),
            minutes_overload=round(min_overload, 2),
            minutes_abnormal=round(min_abnormal, 2),
        )

    @classmethod
    def compute_rolling_aggregate(
        cls, db: Session, machine_id: str, timeframe: str
    ) -> schemas.AggregationSummary:
        delta = TIMEFRAME_DELTAS.get(timeframe, datetime.timedelta(minutes=15))
        now = datetime.datetime.utcnow()
        start_time = now - delta

        readings = (
            db.query(models.RawSensorReading)
            .filter(
                models.RawSensorReading.machine_id == machine_id,
                models.RawSensorReading.timestamp >= start_time
            )
            .order_by(models.RawSensorReading.timestamp.asc())
            .all()
        )

        return cls.calculate_window_metrics(readings, machine_id, timeframe, start_time, now)

    @classmethod
    def persist_aggregate(
        cls, db: Session, summary: schemas.AggregationSummary
    ) -> models.AggregatedTelemetry:
        db_record = models.AggregatedTelemetry(
            machine_id=summary.machine_id,
            timeframe=summary.timeframe,
            window_start=summary.window_start,
            window_end=summary.window_end,
            samples_count=summary.samples_count,
            avg_temperature=summary.avg_temperature,
            max_temperature=summary.max_temperature,
            avg_vibration_rms=summary.avg_vibration_rms,
            max_vibration_rms=summary.max_vibration_rms,
            avg_drill_speed_rpm=summary.avg_drill_speed_rpm,
            avg_power_kw=summary.avg_power_kw,
            avg_torque_nm=summary.avg_torque_nm,
            energy_kwh=summary.energy_kwh,
            minutes_running=summary.minutes_running,
            minutes_idle=summary.minutes_idle,
            minutes_overload=summary.minutes_overload,
            minutes_abnormal=summary.minutes_abnormal
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)
        return db_record