# SparkEV: A Personalized, Predictive, and Explainable Framework for Intelligent Electric Vehicle Management

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-blue.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Federated Learning](https://img.shields.io/badge/FL-FedPer-purple.svg)](https://flower.ai/)
[![Explainable AI](https://img.shields.io/badge/XAI-SHAP-emerald.svg)](https://shap.readthedocs.io/)
[![Hardware: ESP32 + MCP2515](https://img.shields.io/badge/Hardware-ESP32%20%7C%20CAN--Bus-cyan.svg)](https://www.espressif.com/)

> **Academic Research Deliverable**  
> Developed at **Amrita Vishwa Vidyapeetham, Coimbatore, India**  
> Joint initiative by the **School of Computing (Dept. of CSE)** and the **School of Engineering (Dept. of EEE)**.

---

## 🌟 Interactive Documentation Portal & Website

Explore the full documentation portal with interactive decision simulations, architecture inspection, and mathematical derivations:

- **[Project Portal / Website (index.html)](index.html)** — Project overview, problem statement, objectives, architecture diagram, live What-If simulator, team details, and progress roadmap.
- **[Methodology Deep Dive (methodology.html)](methodology.html)** — Research workflow, temporal feature engineering, FedPer split architecture, SHAP Shapley values, and benchmark metrics.
- **[Technical Reference Manual (documentation.html)](documentation.html)** — System requirements, folder layout, step-by-step setup, environment variables, REST API specs, model I/O, and hardware CAN-bus pinouts.

---

## 👥 Research Team & Contributions

| Member | Roll Number | Module / Role | GitHub Profile | Amrita Email |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Ramya G. R.** | Supervisor | Assistant Professor, Dept. of CSE | — | `gr_ramya@cb.amrita.edu` |
| **Dr. Umashankar S.** | Co-Supervisor | Professor, Dept. of EEE | — | `s_umashankar@cb.amrita.edu` |
| **Gayathri U** | `CB.SC.U4CSE23026` | **Federated Learning Lead (FedPer)** | [@gayathriuthamaraj](https://github.com/gayathriuthamaraj/) | `cb.sc.u4cse23026@cb.students.amrita.edu` |
| **Rithanya K A** | `CB.SC.U4CSE23140` | **Module 1: Driving Behaviour Recommendation** | [@Rithanya-08](https://github.com/Rithanya-08) | `cb.sc.u4cse23140@cb.students.amrita.edu` |
| **Shravanthi S** | `CB.SC.U4CSE23147` | **Module 3: Battery Health Forecasting & SHAP** | [@Shravanthi20](https://github.com/Shravanthi20/) | `cb.sc.u4cse23147@cb.students.amrita.edu` |
| **Saravanapriyaa C R** | `CB.SC.U4CSE23149` | **Hardware Integration & CAN Telemetry** | [@saravanapriyaa21](https://github.com/saravanapriyaa21) | `cb.sc.u4cse23149@cb.students.amrita.edu` |
| **Irene Divya J** | `CB.SC.U4CSE23167` | **Module 2: Predictive Charging Recommendation** | [@IreneDivyaJ](https://github.com/IreneDivyaJ) | `cb.sc.u4cse23167@cb.students.amrita.edu` |

---

## 🏛️ System Architecture

SparkEV is organized into five interconnected computational tiers:

```
+-----------------------------------------------------------------------------------+
|                           Layer 6: User Decision Support & HMI                    |
|       [Web Portal] · [Mobile Cluster HUD] · [Proactive Nudges] · [Simulator]      |
+-----------------------------------------------------------------------------------+
                                          ▲
+-----------------------------------------------------------------------------------+
|                        Layer 5: Federated Personalization (FedPer)                 |
|   Shared Base Feature Reps (\theta) <---> Local Driver Personalization Heads (\phi^k) |
+-----------------------------------------------------------------------------------+
                                          ▲
+-----------------------------------------------------------------------------------+
|                        Layer 4: Explainable AI & SHAP Engine                      |
|         TreeSHAP Local Attributions · Root Cause Natural Language Explainer        |
+-----------------------------------------------------------------------------------+
                                          ▲
+-----------------------------------------------------------------------------------+
|                  Layer 3: Predictive Intelligence Core (4 Modules)                |
|  [Mod 1: Driving Behavior] · [Mod 2: Smart Charging] · [Mod 3: SOH Risk] · [What-If] |
+-----------------------------------------------------------------------------------+
                                          ▲
+-----------------------------------------------------------------------------------+
|               Layer 2: Preprocessing & Temporal Feature Engineering               |
|     SOH Lags (t-1, t-7, t-30) · Thermal Stress Integral · Aggressive Driving Index |
+-----------------------------------------------------------------------------------+
                                          ▲
+-----------------------------------------------------------------------------------+
|                      Layer 1: Data Acquisition & Edge Sensing                     |
|        ESP32 Gateway · MCP2515 CAN Bus 2.0B · BMS Telemetry · OpenChargeMap API    |
+-----------------------------------------------------------------------------------+
```

---

## 🚀 Quick Start Guide

### 1. Clone & Set Up Python Environment

```bash
git clone https://github.com/Shravanthi20/spark-ev.git
cd spark-ev

# Create virtual environment
python -m venv venv

# On Linux/macOS:
source venv/bin/activate
# On Windows (PowerShell):
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment

```bash
cp .env.example .env
```

### 3. Launch Local Documentation Portal

You can view the portal immediately in any browser or launch a local web server:

```bash
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 4. Launch FastAPI Microservice

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger API docs will be available at **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📊 Modules Overview

- **Module 1 (Driving Guidance - Rithanya K A):** Uses LightGBM to analyze throttle and braking telemetry against the driver's historical baseline. Delivers non-intrusive eco-nudges to prevent excessive battery drain.
- **Module 2 (Predictive Charging - Irene Divya J):** Multi-Attribute Utility Optimization (MCDM / TOPSIS) balancing station queue delays, tariffs, detour penalties, and battery thermal stress. Includes an automated **80% cutoff recommendation** to avoid unnecessary cell wear.
- **Module 3 (Battery Health & SHAP - Shravanthi S):** Temporal SOH regression incorporating cycle lags ($SOH_{t-1}, SOH_{t-7}, SOH_{t-30}$) and TreeSHAP explainability to attribute degradation to high temperature, C-rate, and deep discharges.
- **Module 4 (What-If Simulator - Saravanapriyaa C R & Team):** Counterfactual evaluation engine allowing drivers to preview the trade-offs of alternative driving styles, ambient conditions, and charging power levels before making decisions.
- **Federated Backbone (FedPer - Gayathri U):** Distributes learning across edge vehicles while keeping driver-specific heads private on each car, transmitting only base gradients to preserve complete trip privacy.
- **Hardware Integration (Saravanapriyaa C R):** Dual-core ESP32 microcontroller with MCP2515 CAN transceiver tapping into vehicle OBD-II ports (ISO 15765-4 protocol) to stream high-frequency telematics via MQTT.

---

## 📜 Citation

If you use or reference SparkEV in your research, please cite:

```bibtex
@article{ramya2026sparkev,
  title={SparkEV: A Personalized, Predictive, and Explainable Framework for Intelligent Electric Vehicle Management},
  author={Ramya, G. R. and Umashankar, S. and Shravanthi, S. and Gayathri, U. and Saravanapriyaa, C. R. and Rithanya, K. A. and Irene Divya, J.},
  journal={Department of Computer Science and Engineering & Department of Electrical and Electronics Engineering, Amrita Vishwa Vidyapeetham},
  year={2026},
  address={Coimbatore, India}
}
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
