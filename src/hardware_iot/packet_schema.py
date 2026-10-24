"""
SparkEV Hardware Telemetry Schema
Defines the standard data structure for CAN bus / OBD-II frames ingested from the ESP32 gateway.
"""

from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class VehicleTelemetryFrame(BaseModel):
    vehicle_id: str = Field(..., description="Unique hardware or vehicle identifier")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="UTC acquisition timestamp")
    
    # Kinematics (OBD-II PIDs 0x0D, 0x49, 0x0C)
    speed_kmh: float = Field(..., ge=0.0, le=280.0, description="Vehicle instantaneous speed in km/h")
    throttle_pct: float = Field(..., ge=0.0, le=100.0, description="Accelerator pedal position percentage")
    brake_pressure_bar: float = Field(default=0.0, ge=0.0, description="Hydraulic/electronic braking pressure")
    motor_rpm: Optional[float] = Field(default=0.0, description="Electric motor rotational velocity")
    power_demand_kw: float = Field(..., description="Instantaneous mechanical/electrical power drawn")

    # Battery Management System (BMS Frame)
    pack_voltage_v: float = Field(..., ge=200.0, le=950.0, description="Traction battery pack voltage")
    pack_current_a: float = Field(..., description="Pack net current (positive discharge, negative charging)")
    state_of_charge_pct: float = Field(..., ge=0.0, le=100.0, description="Current BMS estimated SoC percentage")
    temp_max_c: float = Field(..., description="Highest individual thermistor reading across battery pack")
    temp_min_c: float = Field(..., description="Lowest individual thermistor reading across battery pack")
    
    # Ambient / Environment
    ambient_temp_c: Optional[float] = Field(default=25.0, description="External weather sensor temperature")


class DrivingGuidanceResponse(BaseModel):
    driving_style: str
    confidence: float
    personal_divergence_zscore: float
    guidance_message: str


class BatteryHealthRiskResponse(BaseModel):
    predicted_soh_pct: float
    battery_stress_score: float
    risk_tier: str
    shap_top_features: dict[str, float]
    recommendation: str
