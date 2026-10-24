"""
Module 2: Predictive Charging Recommender
Lead: Irene Divya J (CB.SC.U4CSE23167)
Implements Multi-Attribute Decision Making (MCDM) for contextual station routing and 80% cutoff optimization.
"""

from typing import List, Dict, Any


class PredictiveChargingRecommender:
    """Ranks charging station alternatives considering queue time, tariff, detour, and battery longevity."""

    def __init__(self, battery_capacity_kwh: float = 60.0):
        self.battery_capacity = battery_capacity_kwh

    def recommend(self, current_soc: float, trip_distance_km: float, stations: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Calculates optimal station and optimal charging cutoff percentage.
        """
        # Determine if 80% cutoff is sufficient for remaining trip
        energy_needed_kwh = (trip_distance_km * 16.0) / 100.0
        soc_needed_pct = (energy_needed_kwh / self.battery_capacity) * 100.0 + 15.0  # with 15% safety buffer

        recommend_80_cutoff = soc_needed_pct <= 80.0

        best_station = None
        best_score = float("inf")

        for s in stations:
            # Objective penalty: Detour + Wait Time + Stress Penalty (high power in extreme temp)
            stress_penalty = 10.0 if s.get("power_kw", 50) > 100 else 2.0
            total_penalty = (
                s.get("detour_km", 2.0) * 1.5 +
                s.get("wait_time_mins", 5.0) * 0.8 +
                s.get("cost_per_kwh", 0.25) * 12.0 +
                stress_penalty
            )
            if total_penalty < best_score:
                best_score = total_penalty
                best_station = s

        return {
            "recommended_station": best_station or {"name": "Default Hub", "power_kw": 50},
            "target_soc_pct": 80.0 if recommend_80_cutoff else 95.0,
            "reason": (
                "Recommended 80% charging cutoff to minimize lithium plating and save ~35% session time."
                if recommend_80_cutoff else
                "Recommended 95% charging cutoff due to extended journey range demand."
            )
        }
