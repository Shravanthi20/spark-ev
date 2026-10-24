/**
 * SparkEV Interactive Architecture Inspector
 * Provides interactive layer inspection, telemetry flow simulation, and component detail modals
 */

const ARCHITECTURE_DATA = {
  layer1: {
    title: "1. Data Acquisition Layer",
    badge: "Hardware & Edge Telemetry",
    lead: "Saravanapriyaa C R & Team",
    github: "https://github.com/saravanapriyaa21",
    summary: "Captures high-frequency electrical, mechanical, and contextual telemetry from on-board vehicle sensors, BMS, and external APIs without transmitting raw private observations to the cloud.",
    inputs: [
      "CAN Bus 2.0B / OBD-II PID stream (10 Hz - 50 Hz)",
      "BMS Pack Telemetry (Cell Voltages, Shunt Current, Pack SoC, Thermistor array)",
      "IMU Telemetry (3-axis Accelerometer, Gyroscope for harsh braking & acceleration detection)",
      "External Context (OpenChargeMap API, Google Routes API, Weather OpenMeteo)"
    ],
    algorithms: [
      "ISO 15765-4 CAN frame parsing on ESP32 Microcontroller",
      "Kalman Filter SoC estimation & Noise Suppression",
      "Ring-buffer edge caching with local circular storage"
    ],
    outputs: [
      "Standardized EV Telemetry Stream (JSON/Protobuf packet)",
      "Driving dynamics vector [speed, accel_x, accel_y, brake_pressure, throttle_pos]",
      "Battery operational frame [V_pack, I_load, T_max, T_min, SoC_est]"
    ]
  },
  layer2: {
    title: "2. Preprocessing & Temporal Feature Engineering Layer",
    badge: "Time-Series Transformation",
    lead: "Shravanthi S & Rithanya K A",
    github: "https://github.com/Shravanthi20",
    summary: "Transforms raw time-series sensor points into rich temporal lag variables, degradation indices, and driving anomaly indicators necessary for accurate forecasting.",
    inputs: [
      "Normalized raw telemetry stream from Layer 1",
      "Historical cycle logs and previous SOH measurements"
    ],
    algorithms: [
      "Autoregressive temporal lag generator (SOH_{t-1}, SOH_{t-7}, SOH_{t-30})",
      "Coulomb counting integration: Q = \\int I(t) dt and dV/dQ differential capacity analysis",
      "Thermal stress integral: Cumulative time spent above critical temperature (>38°C)",
      "Aggressive Driving Index (ADI): Exponential moving average of jerk and hard braking"
    ],
    outputs: [
      "32-dimensional engineered feature vector",
      "Rolling degradation matrix",
      "Trip energy efficiency coefficient (Wh/km)"
    ]
  },
  layer3: {
    title: "3. Predictive Intelligence Layer (Core Modules)",
    badge: "Machine Learning Core",
    lead: "Module 1 (Rithanya), Module 2 (Irene Divya), Module 3 (Shravanthi), Module 4",
    github: "https://github.com/Shravanthi20/spark-ev",
    summary: "Contains four interconnected AI/ML modules designed to provide holistic, user-tailored guidance across driving, charging, and long-term battery preservation.",
    inputs: [
      "Engineered feature vectors from Layer 2",
      "Driver historical baseline profile",
      "Candidate charging station graph & route itinerary"
    ],
    algorithms: [
      "Module 1: Driver Behavior Classifier (LightGBM / Random Forest) detecting eco-divergence",
      "Module 2: Multi-Criteria Charging Optimization (MCDM + Utility Theory balancing cost, wait time, battery preservation)",
      "Module 3: Temporal Battery Health & Risk Forecaster (Multi-step Gradient Boosting & SOH Autoregressor)",
      "Module 4: What-If Simulation Engine (Parametric state-space forward model)"
    ],
    outputs: [
      "Personalized driving nudges ('Ease throttle on highway grade')",
      "Optimal charging station stop & 80% cutoff recommendation",
      "Battery Health-Risk Score (0-100) and discrete risk tier (Low / Moderate / High)",
      "Counterfactual scenario outcomes"
    ]
  },
  layer4: {
    title: "4. Explainable AI (XAI) & SHAP Layer",
    badge: "Transparent Decision Reasoning",
    lead: "Shravanthi S (Module 3 Lead)",
    github: "https://github.com/Shravanthi20/",
    summary: "Bridges the gap between black-box predictions and driver trust by attributing exact mathematical weights (Shapley values) to the operational factors inducing battery stress.",
    inputs: [
      "Model inference outputs from Battery Risk & Driving models",
      "Input operational feature vector"
    ],
    algorithms: [
      "TreeSHAP (TreeExplainer) with polynomial complexity O(TLD^2)",
      "Shapley Value formulation: \\phi_i(v) = \\sum_{S \\subseteq N \\setminus \\{i\\}} \\frac{|S|!(|N|-|S|-1)!}{|N|!} [v(S \\cup \\{i\\}) - v(S)]",
      "Natural Language Explainer: maps high SHAP contributions into human-actionable preventive alerts"
    ],
    outputs: [
      "SHAP feature importance ranking & waterfall visualization coordinates",
      "Driver explanation: 'Elevated ambient temperature (+28.4%) and frequent 3C DC fast charging (+19.1%) contributed to HIGH battery risk'",
      "Preventive mitigation recommendations"
    ]
  },
  layer5: {
    title: "5. Personalized Federated Learning Layer (FedPer)",
    badge: "Privacy-Preserving Edge AI",
    lead: "Gayathri U",
    github: "https://github.com/gayathriuthamaraj/",
    summary: "Implements Federated Personalization (FedPer) to collaboratively learn universal EV dynamics while preserving privacy and adapting locally to each individual driver's unique patterns.",
    inputs: [
      "Decentralized edge model checkpoints across participating EV fleet",
      "Local loss gradients computed on on-board vehicle compute"
    ],
    algorithms: [
      "Split-Architecture Neural Network: Base layers f_{base}(\\theta) + Personalization head g_{head}(\\phi^k)",
      "FedAvg on Base Weights: \\theta_{t+1} = \\sum_{k=1}^K \\frac{n_k}{N} \\theta_t^k",
      "Private Local Adaptation: Personalization head weights \\phi^k stay strictly on vehicle edge device",
      "Zero raw telemetry transmission: Provably differential privacy compliant"
    ],
    outputs: [
      "Fleet-wide aggregated base feature extractor",
      "Highly personalized vehicle decision models tuned to user heterogeneity",
      "Communication-efficient gradient delta packets (<450 KB per round)"
    ]
  },
  layer6: {
    title: "6. User Decision Support & Application Layer",
    badge: "Driver HMI & Interactive Portal",
    lead: "SparkEV Team",
    github: "https://github.com/Shravanthi20/spark-ev",
    summary: "Delivers actionable, transparent intelligence to EV drivers and fleet managers through web portals, in-car HMI dashboards, and mobile notifications.",
    inputs: [
      "Predictions, SHAP explanations, optimized charging routes, and What-If queries"
    ],
    algorithms: [
      "Contextual Notification Prioritizer (avoids driver cognitive overload)",
      "Interactive SVG Telemetry Dashboards & What-If Canvas",
      "RESTful API & WebSocket bidirectional streaming"
    ],
    outputs: [
      "Interactive Documentation & Showcase Portal",
      "Driver HMI instrument cluster HUD cards",
      "Fleet battery longevity advisory reports"
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
    leadEl.innerHTML = `<span class="text-slate-400">Lead:</span> <a href="${data.github}" target="_blank" class="text-cyan-400 hover:underline font-medium">${data.lead} <i class="fab fa-github text-xs ml-1"></i></a>`;
  }
  if (summaryEl) summaryEl.innerText = data.summary;

  if (inputsEl) {
    inputsEl.innerHTML = data.inputs.map(item => `<li class="flex items-start gap-2"><i class="fas fa-arrow-right text-cyan-400 text-xs mt-1"></i><span>${item}</span></li>`).join('');
  }
  if (algosEl) {
    algosEl.innerHTML = data.algorithms.map(item => `<li class="flex items-start gap-2"><i class="fas fa-microchip text-emerald-400 text-xs mt-1"></i><span>${item}</span></li>`).join('');
  }
  if (outputsEl) {
    outputsEl.innerHTML = data.outputs.map(item => `<li class="flex items-start gap-2"><i class="fas fa-check-circle text-blue-400 text-xs mt-1"></i><span>${item}</span></li>`).join('');
  }

  // Highlight active layer button
  document.querySelectorAll('.arch-layer-btn').forEach(btn => {
    if (btn.getAttribute('data-layer') === layerId) {
      btn.classList.add('ring-2', 'ring-cyan-400', 'bg-cyan-500/10');
    } else {
      btn.classList.remove('ring-2', 'ring-cyan-400', 'bg-cyan-500/10');
    }
  });

  // Smooth scroll to inspector if on mobile
  if (window.innerWidth < 1024) {
    const inspector = document.getElementById('architecture-inspector');
    if (inspector) {
      inspector.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Setup click listeners for layer buttons
  document.querySelectorAll('.arch-layer-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const layerId = btn.getAttribute('data-layer');
      inspectLayer(layerId);
    });
  });

  // Default inspection
  inspectLayer('layer3');
});
