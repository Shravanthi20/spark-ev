/**
 * SparkEV What-If Simulator Engine
 * Implements interactive parametric simulation of driving behavior, charging rates,
 * ambient temperature, and battery degradation with dynamic SHAP explainability.
 */

let degradationChartInstance = null;
let shapChartInstance = null;

function runSimulation() {
  // Read inputs
  const soc = parseFloat(document.getElementById('sim-soc')?.value || 65);
  const distance = parseFloat(document.getElementById('sim-distance')?.value || 120);
  const drivingStyle = document.getElementById('sim-style')?.value || 'balanced';
  const ambientTemp = parseFloat(document.getElementById('sim-temp')?.value || 32);
  const chargerType = document.getElementById('sim-charger')?.value || 'dc50';
  const targetSoc = parseFloat(document.getElementById('sim-target-soc')?.value || 80);
  const baselineSoh = parseFloat(document.getElementById('sim-baseline-soh')?.value || 94.0);

  // Update label displays
  updateElementText('disp-soc', `${soc}%`);
  updateElementText('disp-distance', `${distance} km`);
  updateElementText('disp-temp', `${ambientTemp}°C`);
  updateElementText('disp-target-soc', `${targetSoc}%`);
  updateElementText('disp-baseline-soh', `${baselineSoh}%`);

  // 1. Calculate Driving Energy Consumption
  // Base consumption: 15 kWh / 100km for normal 60kWh pack
  let consumptionMultiplier = 1.0;
  let drivingStressFactor = 12;

  if (drivingStyle === 'eco') {
    consumptionMultiplier = 0.88;
    drivingStressFactor = 4;
  } else if (drivingStyle === 'balanced') {
    consumptionMultiplier = 1.0;
    drivingStressFactor = 12;
  } else if (drivingStyle === 'aggressive') {
    consumptionMultiplier = 1.28;
    drivingStressFactor = 28;
  }

  // Thermal impact on consumption (HVAC or battery heating)
  let thermalConsumptionPenalty = 0;
  if (ambientTemp < 10) {
    thermalConsumptionPenalty = (10 - ambientTemp) * 0.15; // cold penalty
  } else if (ambientTemp > 30) {
    thermalConsumptionPenalty = (ambientTemp - 30) * 0.12; // AC penalty
  }

  const baseRate = 15.2; // kWh/100km
  const actualRate = (baseRate * consumptionMultiplier) + thermalConsumptionPenalty;
  const energyNeeded = (actualRate * distance) / 100; // kWh
  const batteryCapacity = 60; // 60 kWh standard EV battery

  const socConsumed = (energyNeeded / batteryCapacity) * 100;
  const arrivalSoc = Math.max(0, soc - socConsumed);

  // 2. Charging Session Calculation
  let chargerPowerKW = 11;
  let chargerStress = 3;
  if (chargerType === 'ac11') {
    chargerPowerKW = 11;
    chargerStress = 3;
  } else if (chargerType === 'dc50') {
    chargerPowerKW = 50;
    chargerStress = 16;
  } else if (chargerType === 'dc150') {
    chargerPowerKW = 150;
    chargerStress = 32;
  }

  // Charging time from current or arrival to targetSoc
  const chargeStartSoc = Math.min(soc, 80);
  const socToGain = Math.max(0, targetSoc - chargeStartSoc);
  const energyToCharge = (socToGain / 100) * batteryCapacity;
  
  // Taper factor: Charging beyond 80% slows down by 3x
  let effectivePower = chargerPowerKW;
  let chargeTimeHours = 0;
  if (targetSoc <= 80) {
    chargeTimeHours = energyToCharge / effectivePower;
  } else {
    const energyUpTo80 = (Math.max(0, 80 - chargeStartSoc) / 100) * batteryCapacity;
    const energyAbove80 = ((targetSoc - 80) / 100) * batteryCapacity;
    chargeTimeHours = (energyUpTo80 / effectivePower) + (energyAbove80 / (effectivePower * 0.35));
  }
  const chargeTimeMinutes = Math.round(chargeTimeHours * 60);

  // 3. Battery Stress Score (0 - 100)
  // Factors: High Temp, High Charging Rate, Aggressive Acceleration, 100% Saturation, Low SOC Deep Discharge
  let tempStress = 0;
  if (ambientTemp > 25) {
    tempStress = Math.pow((ambientTemp - 25), 1.25) * 1.5;
  } else if (ambientTemp < 5) {
    tempStress = (5 - ambientTemp) * 1.2;
  }

  let saturationStress = 0;
  if (targetSoc > 80) {
    saturationStress = (targetSoc - 80) * 1.4; // High voltage stress at >80%
  }

  let deepDischargeStress = 0;
  if (arrivalSoc < 15) {
    deepDischargeStress = (15 - arrivalSoc) * 2.2;
  }

  let rawStressScore = 15 + drivingStressFactor + chargerStress + tempStress + saturationStress + deepDischargeStress;
  const stressScore = Math.min(98, Math.max(10, Math.round(rawStressScore)));

  // Risk categorization
  let riskLevel = "LOW";
  let riskColor = "emerald";
  let riskBg = "bg-emerald-500/10 text-emerald-400 border-emerald-500/30";
  if (stressScore >= 70) {
    riskLevel = "HIGH RISK";
    riskColor = "red";
    riskBg = "bg-rose-500/10 text-rose-400 border-rose-500/30";
  } else if (stressScore >= 45) {
    riskLevel = "MODERATE RISK";
    riskColor = "amber";
    riskBg = "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }

  // 4. Update UI Display Elements
  updateElementText('res-consumption', `${actualRate.toFixed(1)} kWh/100km`);
  updateElementText('res-energy-needed', `${energyNeeded.toFixed(1)} kWh`);
  updateElementText('res-arrival-soc', `${arrivalSoc.toFixed(1)}%`);
  updateElementText('res-charge-time', `${chargeTimeMinutes} mins`);
  updateElementText('res-stress-score', `${stressScore} / 100`);

  const riskBadge = document.getElementById('res-risk-badge');
  if (riskBadge) {
    riskBadge.className = `px-3 py-1 text-xs font-bold rounded-full border ${riskBg}`;
    riskBadge.innerText = riskLevel;
  }

  // Recommendation engine advice
  generateSmartAdvice(arrivalSoc, targetSoc, chargerType, ambientTemp, drivingStyle, stressScore);

  // 5. SHAP Explanation Breakdown
  const shapBase = 15.0;
  const shapDriving = drivingStressFactor;
  const shapCharging = chargerStress;
  const shapTemp = parseFloat(tempStress.toFixed(1));
  const shapSocRange = parseFloat((saturationStress + deepDischargeStress).toFixed(1));

  updateShapChart(shapBase, shapDriving, shapCharging, shapTemp, shapSocRange, stressScore);

  // 6. SOH Degradation Curve Projection
  updateDegradationChart(baselineSoh, stressScore);
}

function updateElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function generateSmartAdvice(arrivalSoc, targetSoc, chargerType, ambientTemp, drivingStyle, stressScore) {
  const adviceEl = document.getElementById('res-smart-advice');
  if (!adviceEl) return;

  const points = [];

  if (targetSoc > 80) {
    points.push("<strong>Battery Preservation Tip:</strong> Setting charging target to 80% reduces high-voltage cathode oxidation and saves ~35% of charging wait time.");
  }
  if (ambientTemp > 35 && chargerType === 'dc150') {
    points.push("<strong>Thermal Pre-conditioning Warning:</strong> High ambient heat (>" + ambientTemp + "°C) paired with 150kW DC fast charging significantly accelerates lithium plating. Consider 50kW or charging during cooler evening hours.");
  }
  if (drivingStyle === 'aggressive') {
    points.push("<strong>Eco-Guidance:</strong> High acceleration jerk spikes C-rate load by 42%. Shifting to Balanced driving increases journey range by ~18 km.");
  }
  if (arrivalSoc < 12) {
    points.push("<strong>Range Alert:</strong> Projected arrival SoC is below 12%. SparkEV recommends inserting an intermediate 12-minute top-up at an en-route charging hub.");
  }

  if (points.length === 0) {
    points.push("<strong>Optimal EV Health:</strong> Current simulation parameters follow best-practice eco-driving and cell longevity patterns. Battery degradation is within minimal threshold.");
  }

  adviceEl.innerHTML = points.map(p => `<li class="flex items-start gap-2 mb-2"><i class="fas fa-sparkles text-cyan-400 mt-1"></i><span>${p}</span></li>`).join('');
}

function updateShapChart(base, driving, charging, temp, socExtremes, total) {
  const ctx = document.getElementById('sim-shap-chart')?.getContext('2d');
  if (!ctx) return;

  const labels = [
    'Baseline Model Risk',
    'Driving Dynamics',
    'Charging C-Rate',
    'Ambient Temperature',
    'SOC High/Low Extremes'
  ];

  const values = [base, driving, charging, temp, socExtremes];
  const bgColors = values.map(v => v > 15 ? 'rgba(239, 68, 68, 0.75)' : (v > 8 ? 'rgba(245, 158, 11, 0.75)' : 'rgba(16, 185, 129, 0.75)'));

  if (shapChartInstance) {
    shapChartInstance.destroy();
  }

  shapChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'SHAP Contribution to Battery Stress (+Points)',
        data: values,
        backgroundColor: bgColors,
        borderColor: bgColors.map(c => c.replace('0.75', '1')),
        borderWidth: 1,
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` +${context.raw.toFixed(1)} stress impact`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9CA3AF' }
        },
        y: {
          grid: { display: false },
          ticks: { color: '#E5E7EB', font: { family: "'Plus Jakarta Sans', sans-serif" } }
        }
      }
    }
  });
}

function updateDegradationChart(baselineSoh, stressScore) {
  const ctx = document.getElementById('sim-degradation-chart')?.getContext('2d');
  if (!ctx) return;

  const cycles = [0, 100, 200, 300, 400, 500];
  
  // Unmanaged rate vs SparkEV FedPer guided rate
  const unmanagedRatePer100 = 0.8 + (stressScore * 0.022); // steeper drop with higher stress
  const sparkevRatePer100 = 0.7 + (stressScore * 0.009); // flatter drop with FedPer optimization

  const unmanagedData = cycles.map(c => Math.max(70, baselineSoh - ((c / 100) * unmanagedRatePer100)));
  const sparkevData = cycles.map(c => Math.max(70, baselineSoh - ((c / 100) * sparkevRatePer100)));

  if (degradationChartInstance) {
    degradationChartInstance.destroy();
  }

  degradationChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: cycles.map(c => `${c} Cycles`),
      datasets: [
        {
          label: 'SparkEV FedPer Guided Operation',
          data: sparkevData,
          borderColor: '#10B981',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          borderWidth: 2.5,
          tension: 0.3,
          fill: true
        },
        {
          label: 'Unmanaged Standard EV Operation',
          data: unmanagedData,
          borderColor: '#EF4444',
          backgroundColor: 'transparent',
          borderWidth: 2,
          borderDash: [5, 5],
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          labels: { color: '#E5E7EB' }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.dataset.label}: ${context.raw.toFixed(2)}% SOH`;
            }
          }
        }
      },
      scales: {
        x: {
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: { color: '#9CA3AF' }
        },
        y: {
          min: 75,
          max: 100,
          grid: { color: 'rgba(255, 255, 255, 0.05)' },
          ticks: {
            color: '#9CA3AF',
            callback: value => `${value}%`
          }
        }
      }
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  // Bind input listeners
  const inputIds = [
    'sim-soc', 'sim-distance', 'sim-style', 'sim-temp',
    'sim-charger', 'sim-target-soc', 'sim-baseline-soh'
  ];

  inputIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', runSimulation);
      el.addEventListener('change', runSimulation);
    }
  });

  // Run initial simulation
  setTimeout(runSimulation, 200);
});
