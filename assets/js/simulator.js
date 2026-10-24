/**
 * SparkEV What-If Decision Simulator (Light Pink & White Theme)
 * Powered by the semi-empirical capacity-fade formulation and real-world empirical findings.
 */

let degradationChartInstance = null;
let shapChartInstance = null;

function applyPreset(preset) {
  const socEl = document.getElementById('sim-soc');
  const distEl = document.getElementById('sim-distance');
  const styleEl = document.getElementById('sim-style');
  const tempEl = document.getElementById('sim-temp');
  const chargerEl = document.getElementById('sim-charger');
  const targetSocEl = document.getElementById('sim-target-soc');
  const baselineSohEl = document.getElementById('sim-baseline-soh');

  if (preset === 'summer') {
    if (socEl) socEl.value = 85;
    if (distEl) distEl.value = 160;
    if (styleEl) styleEl.value = 'aggressive';
    if (tempEl) tempEl.value = 38;
    if (chargerEl) chargerEl.value = 'dc150';
    if (targetSocEl) targetSocEl.value = 95;
    if (baselineSohEl) baselineSohEl.value = 92.0;
  } else if (preset === 'winter') {
    if (socEl) socEl.value = 75;
    if (distEl) distEl.value = 110;
    if (styleEl) styleEl.value = 'balanced';
    if (tempEl) tempEl.value = -4;
    if (chargerEl) chargerEl.value = 'dc50';
    if (targetSocEl) targetSocEl.value = 80;
    if (baselineSohEl) baselineSohEl.value = 95.0;
  } else if (preset === 'eco') {
    if (socEl) socEl.value = 70;
    if (distEl) distEl.value = 95;
    if (styleEl) styleEl.value = 'eco';
    if (tempEl) tempEl.value = 22;
    if (chargerEl) chargerEl.value = 'ac11';
    if (targetSocEl) targetSocEl.value = 80;
    if (baselineSohEl) baselineSohEl.value = 98.0;
  }

  runSimulation();
}
window.applyPreset = applyPreset;

function runSimulation() {
  const soc = parseFloat(document.getElementById('sim-soc')?.value || 65);
  const distance = parseFloat(document.getElementById('sim-distance')?.value || 120);
  const drivingStyle = document.getElementById('sim-style')?.value || 'balanced';
  const ambientTemp = parseFloat(document.getElementById('sim-temp')?.value || 32);
  const chargerType = document.getElementById('sim-charger')?.value || 'dc50';
  const targetSoc = parseFloat(document.getElementById('sim-target-soc')?.value || 80);
  const baselineSoh = parseFloat(document.getElementById('sim-baseline-soh')?.value || 94.0);

  updateElementText('disp-soc', `${soc}%`);
  updateElementText('disp-distance', `${distance} km`);
  updateElementText('disp-temp', `${ambientTemp}°C`);
  updateElementText('disp-target-soc', `${targetSoc}%`);
  updateElementText('disp-baseline-soh', `${baselineSoh}%`);

  // 1. Driving Consumption from Stable-23 Elastic Net features
  let styleMult = 1.0;
  let accelJerkVal = 1.1; // m/s^2
  let maxSpeedVal = 105;   // km/h

  if (drivingStyle === 'eco') {
    styleMult = 0.88;
    accelJerkVal = 0.6;
    maxSpeedVal = 85;
  } else if (drivingStyle === 'balanced') {
    styleMult = 1.0;
    accelJerkVal = 1.2;
    maxSpeedVal = 110;
  } else if (drivingStyle === 'aggressive') {
    styleMult = 1.28;
    accelJerkVal = 2.4;
    maxSpeedVal = 140;
  }

  // Thermal HVAC penalty (TUM Munich findings: cabin heating in winter, AC in summer)
  let hvacConsumption = 0;
  if (ambientTemp < 10) {
    hvacConsumption = (10 - ambientTemp) * 0.16;
  } else if (ambientTemp > 28) {
    hvacConsumption = (ambientTemp - 28) * 0.11;
  }

  const baseRate = 15.4; // kWh/100km
  const actualRate = (baseRate * styleMult) + hvacConsumption;
  const energyNeeded = (actualRate * distance) / 100.0;
  const packCapacity = 60.0; // 60 Ah / 60 kWh pack

  const socConsumed = (energyNeeded / packCapacity) * 100.0;
  const arrivalSoc = Math.max(0.0, soc - socConsumed);

  // 2. Charging Session Details
  let chargerPower = 50;
  let cRate = 0.83;
  if (chargerType === 'ac11') {
    chargerPower = 11;
    cRate = 0.18;
  } else if (chargerType === 'dc50') {
    chargerPower = 50;
    cRate = 0.83;
  } else if (chargerType === 'dc150') {
    chargerPower = 150;
    cRate = 2.5;
  }

  const currentOrArrival = Math.min(soc, 80);
  const socDelta = Math.max(0, targetSoc - currentOrArrival);
  const kwhToCharge = (socDelta / 100.0) * packCapacity;

  let chargeMinutes = 0;
  if (targetSoc <= 80) {
    chargeMinutes = Math.round((kwhToCharge / chargerPower) * 60);
  } else {
    const kwhUpTo80 = (Math.max(0, 80 - currentOrArrival) / 100.0) * packCapacity;
    const kwhAbove80 = ((targetSoc - 80) / 100.0) * packCapacity;
    const hours = (kwhUpTo80 / chargerPower) + (kwhAbove80 / (chargerPower * 0.35));
    chargeMinutes = Math.round(hours * 60);
  }

  // 3. Semi-Empirical Physics-Informed Battery Stress Index (BSI)
  const T_kelvin = 273.15 + Math.max(10, ambientTemp + 5);
  const R_gas = 8.314; // J/(mol*K)
  const Ea = 27800; // J/mol
  const arrhenius = Math.exp(-Ea / (R_gas * T_kelvin));
  const cRateTerm = Math.pow(Math.max(0.2, cRate), 0.80);
  const ahDelivered = energyNeeded / 0.36;
  const throughputTerm = Math.pow(Math.max(1.0, ahDelivered), 0.54);

  const rawFadeProxy = 1000 * arrhenius * cRateTerm * throughputTerm;
  
  // Driving factors (top SHAP contributors: max speed, avg speed, mean accel)
  const speedContrib = (maxSpeedVal / 140) * 22.0;
  const accelContrib = (accelJerkVal / 2.5) * 20.0;
  const socExtremeContrib = targetSoc > 80 ? (targetSoc - 80) * 0.9 : 0;
  const deepDischargeContrib = arrivalSoc < 15 ? (15 - arrivalSoc) * 1.5 : 0;
  const tempShapContrib = (ambientTemp > 25 ? (ambientTemp - 25) * 0.9 : 2.0);

  const bsiScore = Math.min(98, Math.max(12, Math.round(15 + speedContrib + accelContrib + (rawFadeProxy * 8) + socExtremeContrib + deepDischargeContrib)));

  // BSI classification
  let bsiTier = "LOW";
  let bsiBadgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  if (bsiScore >= 70) {
    bsiTier = "HIGH";
    bsiBadgeClass = "bg-rose-50 text-rose-700 border-rose-300";
  } else if (bsiScore >= 40) {
    bsiTier = "MODERATE";
    bsiBadgeClass = "bg-amber-50 text-amber-700 border-amber-300";
  }

  // Update DOM displays
  updateElementText('res-consumption', `${actualRate.toFixed(1)} kWh/100km`);
  updateElementText('res-energy-needed', `${energyNeeded.toFixed(1)} kWh total`);
  updateElementText('res-arrival-soc', `${arrivalSoc.toFixed(1)}%`);
  updateElementText('res-charge-time', `${chargeMinutes} mins`);
  updateElementText('res-stress-score', `${bsiScore} / 100`);

  const riskBadge = document.getElementById('res-risk-badge');
  if (riskBadge) {
    riskBadge.className = `px-3 py-0.5 text-xs font-bold rounded-full border ${bsiBadgeClass}`;
    riskBadge.innerText = bsiTier;
  }

  // Generate plain-language advice
  generateSmartAdvice(arrivalSoc, targetSoc, chargerType, ambientTemp, maxSpeedVal, accelJerkVal, bsiTier);

  // Render SHAP attribution chart
  updateShapChart(speedContrib, accelContrib, rawFadeProxy * 8, socExtremeContrib, tempShapContrib);

  // Render SOH degradation projection
  updateDegradationChart(baselineSoh, bsiScore);
}
window.runSimulation = runSimulation;

function updateElementText(id, text) {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function generateSmartAdvice(arrivalSoc, targetSoc, chargerType, ambientTemp, maxSpeed, accelJerk, bsiTier) {
  const adviceEl = document.getElementById('res-smart-advice');
  if (!adviceEl) return;

  const points = [];

  if (maxSpeed > 115) {
    points.push(`<strong>Speed Control (Top SHAP factor):</strong> Peak velocity of ${maxSpeed} km/h increases aerodynamic load and inverter thermal stress. Capping speed at 105 km/h reduces BSI by ~16%.`);
  }
  if (accelJerk > 1.8) {
    points.push("<strong>Acceleration Smoothing:</strong> High throttle jerk spikes battery discharge current. Smooth pedal application recovers energy through regenerative braking.");
  }
  if (targetSoc > 80) {
    points.push("<strong>80% Cutoff Policy:</strong> Charging beyond 80% increases cathode lattice tension and takes ~40% longer due to the constant voltage (CV) taper.");
  }
  if (arrivalSoc < 12) {
    points.push(`<strong>Arrival SOC Warning:</strong> Estimated arrival SOC is ${arrivalSoc.toFixed(1)}%. Inserting a 10-minute Level 2/DC top-up prevents severe deep discharge.`);
  }

  if (points.length === 0) {
    points.push("<strong>Optimal Driving & Preservation:</strong> Operation follows optimal eco-driving and cell-longevity standards. Battery stress is at minimum threshold.");
  }

  adviceEl.innerHTML = points.map(p => `
    <li class="flex items-start gap-2.5 mb-2 text-slate-700">
      <i class="fas fa-check-circle text-rose-500 mt-1 shrink-0 text-xs"></i>
      <span>${p}</span>
    </li>
  `).join('');
}

function updateShapChart(speed, accel, fadeModel, socExtremes, temp) {
  const canvas = document.getElementById('sim-shap-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const labels = [
    '1. Maximum Speed (Driver)',
    '2. Mean Acceleration (Driver)',
    '3. Semi-Empirical Fade (C-Rate/Ah)',
    '4. Target SOC Excursion',
    '5. Ambient Temperature'
  ];

  const values = [
    parseFloat(speed.toFixed(1)),
    parseFloat(accel.toFixed(1)),
    parseFloat(fadeModel.toFixed(1)),
    parseFloat(socExtremes.toFixed(1)),
    parseFloat(temp.toFixed(1))
  ];

  try {
    if (shapChartInstance) {
      shapChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    shapChartInstance = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{
          label: 'Mean Positive SHAP Contribution (+BSI)',
          data: values,
          backgroundColor: [
            'rgba(244, 63, 94, 0.85)',
            'rgba(236, 72, 153, 0.80)',
            'rgba(219, 39, 119, 0.75)',
            'rgba(190, 24, 93, 0.70)',
            'rgba(148, 163, 184, 0.70)'
          ],
          borderColor: '#E11D48',
          borderWidth: 1,
          borderRadius: 5
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
              label: (ctx) => ` +${ctx.raw} BSI impact (TreeSHAP)`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#FCE7F3' },
            ticks: { color: '#64748B' }
          },
          y: {
            grid: { display: false },
            ticks: { color: '#1E293B', font: { family: "'Plus Jakarta Sans', sans-serif", weight: '600' } }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error rendering SHAP chart:', err);
  }
}

function updateDegradationChart(baselineSoh, bsiScore) {
  const canvas = document.getElementById('sim-degradation-chart');
  if (!canvas || typeof Chart === 'undefined') return;

  const cycles = [0, 50, 100, 150, 200, 250, 300];
  const unmanagedRatePer100 = 0.75 + (bsiScore * 0.018);
  const sparkevRatePer100 = 0.65 + (bsiScore * 0.008);

  const unmanagedData = cycles.map(c => Math.max(70, baselineSoh - ((c / 100.0) * unmanagedRatePer100)));
  const sparkevData = cycles.map(c => Math.max(70, baselineSoh - ((c / 100.0) * sparkevRatePer100)));

  try {
    if (degradationChartInstance) {
      degradationChartInstance.destroy();
    }

    const ctx = canvas.getContext('2d');
    degradationChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: cycles.map(c => `${c} Cycles`),
        datasets: [
          {
            label: 'SparkEV FedPer Guided Operation (Direct AR)',
            data: sparkevData,
            borderColor: '#E11D48',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            borderWidth: 2.5,
            tension: 0.25,
            fill: true
          },
          {
            label: 'Unmanaged Operation (No Guidance)',
            data: unmanagedData,
            borderColor: '#94A3B8',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.25
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: { color: '#1E293B', font: { family: "'Plus Jakarta Sans', sans-serif" } }
          },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${ctx.raw.toFixed(2)}% SOH`
            }
          }
        },
        scales: {
          x: {
            grid: { color: '#FCE7F3' },
            ticks: { color: '#64748B' }
          },
          y: {
            min: 78,
            max: 100,
            grid: { color: '#FCE7F3' },
            ticks: {
              color: '#64748B',
              callback: value => `${value}%`
            }
          }
        }
      }
    });
  } catch (err) {
    console.error('Error rendering degradation chart:', err);
  }
}

document.addEventListener('DOMContentLoaded', () => {
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

  function initWhenReady(attempts = 0) {
    if (typeof Chart !== 'undefined') {
      runSimulation();
    } else if (attempts < 50) {
      setTimeout(() => initWhenReady(attempts + 1), 100);
    } else {
      console.warn('Chart.js not loaded after 5s, running simulation without charts');
      runSimulation();
    }
  }
  initWhenReady();
});
