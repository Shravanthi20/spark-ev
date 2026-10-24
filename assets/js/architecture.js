/**
 * SparkEV Architecture Inspector (Updated for Real-World Research Paper Data)
 * Reflects M1-M4 modules, ESP32 on-device benchmarks (8.65 ms), FedPer, and real datasets.
 */

const ARCHITECTURE_DATA = {
  layer1: {
    title: "1. Real-World Telemetry Ingestion Layer",
    badge: "Hardware & Empirical Datasets",
    lead: "Saravana Priyaa C. R. & Team",
    github: "https://github.com/saravanapriyaa21",
    summary: "Built entirely on real-world telemetry across 4 empirical benchmarks: TUM Munich EV drive cycles (70 trips, 1,355 km), Autosun/PolyU charging sessions (2,649 sessions), Zenodo EV SOH cycles (18,065 samples), and NASA/CALCE battery aging cells.",
    inputs: [
      "TUM Battery & Heating Dataset: 70 trips in Munich (-3°C to 33.5°C, 10 Hz, 28 signals, 60 Ah pack)",
      "Autosun & PolyU Dataset: 2,649 charging sessions (2,378 Normal, 271 Faulty; 10.2% anomalies)",
      "Zenodo Real-World EV SOH Dataset: 18,065 chronological cycles across NMC & LFP battery chemistries",
      "NASA Ames & CALCE Aging Data: 842 cycles from 8 cells for semi-empirical capacity-fade calibration"
    ],
    algorithms: [
      "Coulomb counting with 60 Ah nominal capacity reconstruction for missing SOC",
      "Trip segmentation: 60 s sliding windows with 30 s step (3,193 driving windows)",
      "Stationary window filtering (351 near-stationary windows removed)",
      "Chronological per-battery 80/20 train/test data partitioning"
    ],
    outputs: [
      "Cleaned, synchronized 10 Hz vehicular time-series vectors",
      "Stratified session feature matrices (57 charging features)",
      "Lagged SOH degradation chronological matrices (282 features)"
    ]
  },
  layer2: {
    title: "2. Physics-Informed Feature Engineering Layer",
    badge: "Semi-Empirical Science",
    lead: "Shravanthi S & Rithanya K. A.",
    github: "https://github.com/Shravanthi20/",
    summary: "Replaces arbitrary heuristic weights with a semi-empirical capacity-fade model fitted to NASA and CALCE aging cells, and builds stable feature subsets (Stable-23) for energy prediction.",
    inputs: [
      "Windowed vehicle speed, acceleration, and jerk statistics",
      "Peak cell temperatures, peak C-rates, and cumulative delivered charge (Ah)",
      "Depth-of-Discharge (DoD) and 20–80% SOC band excursion tracking"
    ],
    algorithms: [
      "Semi-Empirical Capacity-Fade Equation: Q_loss = B * exp(-E_a / RT) * C^m * (Ah)^z (R^2 = 88.6% calibration variance)",
      "Physics-Informed Battery Stress Index (BSI): 0–100 scale replacing heuristic w_T and w_C weights",
      "Causal Rolling Median smoothing for SOH with recent vs long-term rate comparison (Delta_acc = r_recent - r_long)",
      "Stable-23 Feature Selection: 23 features consistent across all 50 cross-validation folds"
    ],
    outputs: [
      "Physics-informed Battery Stress Index labels (LOW < 40, MODERATE 40–70, HIGH >= 70)",
      "Leakage-safe in-trip arrival SOC feature sets (85 features computed strictly before cutoff)",
      "Accelerated degradation anomaly flags"
    ]
  },
  layer3: {
    title: "3. Predictive Intelligence Core (Modules M1 – M4)",
    badge: "Machine Learning Core",
    lead: "M1 (Rithanya), M2 (Irene Divya), M3 (Shravanthi), M4 & Hardware (Saravana Priyaa)",
    github: "https://github.com/Shravanthi20/spark-ev",
    summary: "Four interconnected data-driven models predicting battery stress from driving, detecting charging faults, forecasting SOH 10 cycles ahead, and estimating arrival SOC.",
    inputs: [
      "14 driving-behavior & context features (excluding internal signals to prevent leakage)",
      "57 charging-session features across SOC, voltage, current, and thermals",
      "SOH lag drops and rolling trends across battery cycles",
      "First 25%, 50%, or 75% observed trip telemetry for arrival SOC"
    ],
    algorithms: [
      "M1: XGBoost Regressor (300 trees, depth 4) predicting BSI with R^2 = 0.831 (held-out 0.805, MAE 3.23)",
      "M2: Weighted XGBoost Classifier (depth 5) detecting faults with 99.62% accuracy, F1 = 0.981, ROC-AUC = 0.999",
      "M3: Direct Autoregressive SOH(t+10) model achieving R^2 = 0.9591 (MAE = 0.00657) without recursive error",
      "M4: Stable-23 Elastic Net for energy (R^2 = 0.897) and arrival SOC (R^2 = 0.976 at 50% trip horizon)"
    ],
    outputs: [
      "Driving Battery Stress Index (BSI) & risk tier",
      "Session Fault Detection alert with 0 false alarms on 530 test sessions",
      "Ten-cycle ahead SOH forecast & accelerated-degradation risk level",
      "In-trip arrival SOC estimate (MAE 1.48 pp at halfway point)"
    ]
  },
  layer4: {
    title: "4. Explainable AI & SHAP Attribution Layer",
    badge: "Driver-Controllable Explanations",
    lead: "Shravanthi S & Team",
    github: "https://github.com/Shravanthi20/",
    summary: "TreeSHAP attribution explains every prediction. With the physics-informed BSI, ambient temperature drops from rank 1 to rank 5, making driver-controllable factors (max speed, avg speed, acceleration) the top 3 drivers.",
    inputs: [
      "Trained XGBoost models from M1, M2, and M3",
      "Trip-level feature vectors"
    ],
    algorithms: [
      "TreeSHAP exact local feature attribution",
      "Feature ranking: shifts explanations to actionable driver behaviors (speed, acceleration, HVAC)",
      "Top positive SHAP contributor extraction translated into plain-language guidance"
    ],
    outputs: [
      "Exact quantitative SHAP value breakdowns per trip",
      "Controllable recommendation drivers (e.g., 'Reducing peak highway speed from 130 to 110 km/h lowers battery stress by 18%')",
      "Fault root-cause attribution across voltage, current, and thermal anomalies"
    ]
  },
  layer5: {
    title: "5. Personalized Federated Learning (FedPer)",
    badge: "Privacy-Preserving Personalization",
    lead: "Gayathri U (CB.SC.U4CSE23026)",
    github: "https://github.com/gayathriuthamaraj/",
    summary: "Keeps raw driving and charging telemetry on the vehicle. Uses FedPer to split models into shared base parameters (theta_B) and client-specific personalization heads (theta_P,k).",
    inputs: [
      "51 decentralized client trips (trips with >= 20 windows acting as clients)",
      "On-vehicle local gradients computed over 80 communication rounds"
    ],
    algorithms: [
      "Split Architecture: 2 hidden layers form shared base theta_B; output layer forms local head theta_P,k",
      "FedPer lowers local MAE for 32 of 51 established clients (median 2.81 vs 3.51 for FedAvg)",
      "FedAvg achieves arrival SOC R^2 = 0.973, nearly matching centralized 0.976 (Delta R^2 <= 0.03)",
      "Early stopping at round 30 to mitigate cold-start overfitting"
    ],
    outputs: [
      "Shared base representation extracted across fleet",
      "Personalized edge models adapted to specific vehicle routes and drivers",
      "Zero raw telemetry egress"
    ]
  },
  layer6: {
    title: "6. On-Device Edge Deployment (ESP32 at 240 MHz)",
    badge: "8.65 ms Total Inference",
    lead: "Saravana Priyaa C. R. & Team",
    github: "https://github.com/saravanapriyaa21",
    summary: "All three XGBoost models (M1, M2, M3) converted into C header files and run on an ESP32 microcontroller at 240 MHz in 8.65 ms total, displaying on an SH1106 OLED screen.",
    inputs: [
      "Quantized feature vectors received via local CAN/OBD-II interface"
    ],
    algorithms: [
      "Lightweight C tree-traversal routine without dynamic memory allocation",
      "On-chip microsecond hardware timer benchmarking",
      "Wi-Fi JSON asynchronous transport to FastAPI recommendation backend (17.5 ms server processing)"
    ],
    outputs: [
      "M1 Battery Stress Inference: 3.35 ms (Sample output: BSI 62.39, 'MODERATE')",
      "M2 Charging Anomaly Inference: 1.92 ms (Sample output: P(faulty) = 1.000, 'Faulty')",
      "M3 SOH & Degradation Risk: 3.38 ms (Sample output: SOH 91.76%, 'LOW')",
      "Total On-Device Latency: 8.65 ms; end-to-end cycle finishes in < 1 second"
    ]
  }
};

function inspectLayer(layerId) {
  const data = ARCHITECTURE_DATA[layerId];
  if (!data) return;

  const titleEl = document.getElementById('arch-inspector-title');
  const badgeEl = document.getElementById('arch-inspector-badge');
  const leadEl = document.getElementById('arch-inspector-lead');
  const summaryEl = document.getElementById('arch-inspector-summary');
  const inputsEl = document.getElementById('arch-inspector-inputs');
  const algosEl = document.getElementById('arch-inspector-algos');
  const outputsEl = document.getElementById('arch-inspector-outputs');

  if (titleEl) titleEl.innerText = data.title;
  if (badgeEl) badgeEl.innerText = data.badge;
  if (leadEl) {
    leadEl.innerHTML = `<span class="text-slate-500">Lead:</span> <a href="${data.github}" target="_blank" class="text-rose-600 hover:underline font-semibold">${data.lead} <i class="fab fa-github text-xs ml-1"></i></a>`;
  }
  if (summaryEl) summaryEl.innerText = data.summary;

  if (inputsEl) {
    inputsEl.innerHTML = data.inputs.map(item => `<li class="flex items-start gap-2 text-slate-700"><i class="fas fa-arrow-right text-rose-500 text-xs mt-1 shrink-0"></i><span>${item}</span></li>`).join('');
  }
  if (algosEl) {
    algosEl.innerHTML = data.algorithms.map(item => `<li class="flex items-start gap-2 text-slate-700"><i class="fas fa-microchip text-pink-600 text-xs mt-1 shrink-0"></i><span>${item}</span></li>`).join('');
  }
  if (outputsEl) {
    outputsEl.innerHTML = data.outputs.map(item => `<li class="flex items-start gap-2 text-slate-700"><i class="fas fa-check-circle text-emerald-600 text-xs mt-1 shrink-0"></i><span>${item}</span></li>`).join('');
  }

  // Update active state on layer buttons
  document.querySelectorAll('.arch-layer-btn').forEach(btn => {
    if (btn.getAttribute('data-layer') === layerId) {
      btn.classList.add('active', 'border-rose-500', 'bg-rose-50/70');
    } else {
      btn.classList.remove('active', 'border-rose-500', 'bg-rose-50/70');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.arch-layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerId = btn.getAttribute('data-layer');
      inspectLayer(layerId);
    });
  });

  // Default view: Layer 3
  inspectLayer('layer3');
});
