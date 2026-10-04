import datetime
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, ForeignKey, Index, Text
)
from sqlalchemy.orm import relationship
from database import Base

class Machine(Base):
    __tablename__ = "machines"

    machine_id = Column(String(50), primary_key=True, index=True)
    machine_name = Column(String(100), nullable=False)
    machine_model = Column(String(100), nullable=False)
    rated_power_kw = Column(Float, nullable=False, default=7.5)
    location_bay = Column(String(100), nullable=False)
    commission_date = Column(DateTime, default=datetime.datetime.utcnow)
    current_status = Column(String(50), default="IDLE")
    health_score = Column(Float, default=100.0)

    # Relationships
    raw_readings = relationship("RawSensorReading", back_populates="machine", cascade="all, delete-orphan")
    aggregates = relationship("AggregatedTelemetry", back_populates="machine", cascade="all, delete-orphan")
    events = relationship("MachineEvent", back_populates="machine", cascade="all, delete-orphan")
    maintenance_records = relationship("MaintenanceLog", back_populates="machine", cascade="all, delete-orphan")


class RawSensorReading(Base):
    __tablename__ = "raw_sensor_readings"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False, index=True)
    
    # Transducer telemetry channels
    temperature = Column(Float, nullable=False)      # °C
    vibration = Column(Float, nullable=False)        # mm/s RMS
    drill_speed_rpm = Column(Integer, nullable=False)# RPM
    power_kw = Column(Float, nullable=False)         # kW
    torque_nm = Column(Float, nullable=False)        # Nm
    sound_db = Column(Float, nullable=False)         # dB SPL
    
    # Inferred Operating State
    operational_state = Column(String(50), nullable=False, default="RUNNING_NORMAL")

    machine = relationship("Machine", back_populates="raw_readings")

    # Multi-column index for fast time-range slice queries
    __table_args__ = (
        Index("idx_machine_time", "machine_id", "timestamp"),
    )


class AggregatedTelemetry(Base):
    __tablename__ = "aggregated_telemetry"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id"), nullable=False, index=True)
    timeframe = Column(String(10), nullable=False) # '15m', '1h', '24h'
    window_start = Column(DateTime, nullable=False)
    window_end = Column(DateTime, nullable=False)
    samples_count = Column(Integer, nullable=False)

    # Statistical rollups
    avg_temperature = Column(Float, nullable=False)
    max_temperature = Column(Float, nullable=False)
    avg_vibration_rms = Column(Float, nullable=False)
    max_vibration_rms = Column(Float, nullable=False)
    avg_drill_speed_rpm = Column(Integer, nullable=False)
    avg_power_kw = Column(Float, nullable=False)
    avg_torque_nm = Column(Float, nullable=False)
    
    # Energy calculations
    energy_kwh = Column(Float, nullable=False)

    # Cumulative state duration (minutes)
    minutes_running = Column(Float, default=0.0)
    minutes_idle = Column(Float, default=0.0)
    minutes_overload = Column(Float, default=0.0)
    minutes_abnormal = Column(Float, default=0.0)

    machine = relationship("Machine", back_populates="aggregates")

    __table_args__ = (
        Index("idx_agg_machine_window", "machine_id", "timeframe", "window_end"),
    )


class MachineEvent(Base):
    __tablename__ = "machine_events"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    event_type = Column(String(50), nullable=False) # 'THERMAL_OVERRUN', 'EXCESSIVE_VIBRATION', 'OVERLOAD'
    severity = Column(String(20), nullable=False)   # 'INFO', 'WARNING', 'CRITICAL'
    description = Column(Text, nullable=False)
    health_penalty = Column(Float, default=0.0)

    machine = relationship("Machine", back_populates="events")


class MaintenanceLog(Base):
    __tablename__ = "maintenance_logs"

    id = Column(Integer, primary_key=True, autoincrement=True)
    machine_id = Column(String(50), ForeignKey("machines.machine_id"), nullable=False, index=True)
    logged_at = Column(DateTime, default=datetime.datetime.utcnow, nullable=False)
    technician = Column(String(100), nullable=False)
    tasks_performed = Column(Text, nullable=False)
    next_scheduled_inspection = Column(DateTime, nullable=False)
    post_maintenance_health = Column(Float, default=100.0)

    machine = relationship("Machine", back_populates="maintenance_records")