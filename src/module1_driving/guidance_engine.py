"""
Module 1: Personalized Driving Behavior Prediction & Guidance Engine
Lead: Rithanya K A (CB.SC.U4CSE23140)
"""

from typing import Dict, Any, List


class PersonalizedDrivingGuidanceEngine:
    """Classifies driving behavior and evaluates divergence against personal driver baseline."""

    def __init__(self, user_baseline_kwh_per_100km: float = 15.2):
        self.user_baseline = user_baseline_kwh_per_100km

    def evaluate_driving_window(self, telemetry_window: List[Dict[str, float]]) -> Dict[str, Any]:
        """
        Analyzes a 10-second telemetry window for speed variance, throttle jerk, and power.
        """
        if not telemetry_window:
            return {"style": "Normal", "divergence_zscore": 0.0, "guidance": "Normal operation."}

        avg_speed = sum(p.get("speed_kmh", 0.0) for p in telemetry_window) / len(telemetry_window)
        max_throttle = max(p.get("throttle_pct", 0.0) for p in telemetry_window)
        avg_power = sum(p.get("power_kw", 0.0) for p in telemetry_window) / len(telemetry_window)

        # Estimate instantaneous energy rate in kWh/100km
        estimated_energy_rate = (avg_power / max(10.0, avg_speed)) * 100.0 if avg_speed > 5.0 else 15.0

        # Divergence z-score from user baseline
        divergence = (estimated_energy_rate - self.user_baseline) / 2.5

        if max_throttle > 80.0 or divergence > 1.8:
            style = "Aggressive"
            guidance = "Aggressive throttle spikes detected. Easing acceleration saves ~15% energy on this route segment."
        elif divergence < -0.8 and max_throttle < 45.0:
            style = "Eco"
            guidance = "Excellent eco-driving. Regenerative deceleration is optimizing your journey efficiency."
        else:
            style = "Normal"
            guidance = "Driving within normal baseline profile. Cruise speed is optimal."

        return {
            "style": style,
            "avg_speed_kmh": round(avg_speed, 1),
            "estimated_rate_kwh_100km": round(estimated_energy_rate, 2),
            "divergence_zscore": round(divergence, 2),
            "guidance": guidance
        }
