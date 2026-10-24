"""
SparkEV Unified REST API Service
Exposes endpoints for driving behavior guidance, predictive charging recommendation,
battery health forecasting with SHAP explainability, and What-If scenario simulations.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

from src.module1_driving.guidance_engine import PersonalizedDrivingGuidanceEngine
from src.module2_charging.recommender import PredictiveChargingRecommender
from src.module3_battery.soh_predictor import BatteryHealthRiskPredictor

app = FastAPI(
    title="SparkEV Intelligence API",
    description="Personalized, Predictive, and Explainable Electric Vehicle Decision Support Engine",
    version="1.0.0"
)

# Enable CORS for local testing and web portal integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Instantiate Module Engines
driving_engine = PersonalizedDrivingGuidanceEngine()
charging_engine = PredictiveChargingRecommender()
battery_engine = BatteryHealthRiskPredictor()


# Pydantic Request Models
class DrivingTelemetryWindow(BaseModel):
    vehicle_id: str = "EV-Amrita-01"
    telemetry: List[Dict[str, float]]


class BatteryRiskRequest(BaseModel):
    vehicle_id: str = "EV-Amrita-01"
    pack_temp_avg_c: float = Field(32.0, ge=-20.0, le=65.0)
    fast_charge_ratio: float = Field(0.4, ge=0.0, le=1.0)
    avg_dod_pct: float = Field(70.0, ge=10.0, le=100.0)
    cycle_count: int = Field(200, ge=0)
    aggressive_driving_idx: float = Field(1.2, ge=0.0, le=5.0)


class ChargingRecommendRequest(BaseModel):
    current_soc_pct: float = Field(35.0, ge=5.0, le=100.0)
    trip_distance_km: float = Field(90.0, ge=5.0)
    candidate_stations: Optional[List[Dict[str, Any]]] = None


class WhatIfSimulationRequest(BaseModel):
    current_soc: float = 65.0
    trip_distance_km: float = 120.0
    driving_style: str = "balanced"  # eco, balanced, aggressive
    ambient_temp_c: float = 32.0
    charger_kw: float = 50.0
    target_soc: float = 80.0
    baseline_soh: float = 94.0


@app.get("/")
def root():
    return {
        "system": "SparkEV Intelligence API",
        "status": "online",
        "version": "1.0.0",
        "institution": "Amrita Vishwa Vidyapeetham, Coimbatore",
        "docs_url": "/docs"
    }


@app.post("/api/v1/predict-driving")
def predict_driving(payload: DrivingTelemetryWindow):
    result = driving_engine.evaluate_driving_window(payload.telemetry)
    return {"status": "success", "vehicle_id": payload.vehicle_id, "data": result}


@app.post("/api/v1/battery-health-risk")
def predict_battery_risk(payload: BatteryRiskRequest):
    features = payload.dict()
    stress_score, risk_tier, shap_vals = battery_engine.predict_risk(features)
    explanation = battery_engine.generate_explanation(risk_tier, shap_vals)
    return {
        "status": "success",
        "stress_score": stress_score,
        "risk_tier": risk_tier,
        "shap_attributions": shap_vals,
        "explanation": explanation
    }


@app.post("/api/v1/recommend-charging")
def recommend_charging(payload: ChargingRecommendRequest):
    default_stations = [
        {"id": "st-1", "name": "Coimbatore Hub Fast DC", "power_kw": 50, "detour_km": 1.2, "wait_time_mins": 8, "cost_per_kwh": 0.22},
        {"id": "st-2", "name": "Highway Supercharger 150kW", "power_kw": 150, "detour_km": 4.5, "wait_time_mins": 2, "cost_per_kwh": 0.35},
        {"id": "st-3", "name": "Campus Level 2 Destination", "power_kw": 11, "detour_km": 0.5, "wait_time_mins": 0, "cost_per_kwh": 0.14}
    ]
    stations = payload.candidate_stations or default_stations
    result = charging_engine.recommend(payload.current_soc_pct, payload.trip_distance_km, stations)
    return {"status": "success", "data": result}


@app.post("/api/v1/what-if")
def simulate_what_if(payload: WhatIfSimulationRequest):
    # Parametric forward projection
    style_mult = 0.88 if payload.driving_style == "eco" else (1.28 if payload.driving_style == "aggressive" else 1.0)
    rate = 15.2 * style_mult
    if payload.ambient_temp_c > 30:
        rate += (payload.ambient_temp_c - 30) * 0.12
    energy_kwh = (rate * payload.trip_distance_km) / 100.0
    arrival_soc = max(0.0, payload.current_soc - (energy_kwh / 60.0) * 100.0)

    # Battery stress score
    features = {
        "pack_temp_avg_c": payload.ambient_temp_c + 6.0,
        "fast_charge_ratio": 0.8 if payload.charger_kw > 100 else 0.3,
        "avg_dod_pct": 100.0 - arrival_soc,
        "cycle_count": 250,
        "aggressive_driving_idx": 2.0 if payload.driving_style == "aggressive" else 1.0
    }
    stress_score, risk_tier, shap_vals = battery_engine.predict_risk(features)
    explanation = battery_engine.generate_explanation(risk_tier, shap_vals)

    return {
        "status": "success",
        "projected_consumption_kwh_100km": round(rate, 2),
        "total_energy_needed_kwh": round(energy_kwh, 2),
        "arrival_soc_pct": round(arrival_soc, 2),
        "battery_stress_score": stress_score,
        "risk_tier": risk_tier,
        "shap_attributions": shap_vals,
        "explanation": explanation
    }
