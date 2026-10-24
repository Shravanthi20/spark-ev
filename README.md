# SparkEV: A Personalized, Predictive, and Explainable Framework for Intelligent Electric Vehicle Management

[![Python 3.10+](https://img.shields.io/badge/python-3.10%2B-rose.svg)](https://www.python.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-pink.svg)](https://opensource.org/licenses/MIT)
[![Edge AI: ESP32 @ 240MHz](https://img.shields.io/badge/Edge%20AI-ESP32%208.65ms-rose.svg)](https://www.espressif.com/)
[![Federated Learning](https://img.shields.io/badge/FL-FedPer-pink.svg)](https://flower.ai/)
[![Explainable AI](https://img.shields.io/badge/XAI-TreeSHAP-rose.svg)](https://shap.readthedocs.io/)

> **Academic Research Deliverable**  
> Developed at **Amrita Vishwa Vidyapeetham, Coimbatore, India**  
> Joint research initiative by the **Department of Computer Science and Engineering** (School of Computing) and the **Department of Electrical and Electronics Engineering** (School of Engineering).

---

## 🌸 Interactive Documentation Portal (Light Pink & White Theme)

Explore the web documentation portal with interactive decision simulations, architecture inspection, and mathematical derivations:

- **[Project Website / Showcase Portal (index.html)](index.html)** — Project overview, problem statement, four module objectives, interactive architecture inspector, embedded What-If simulator, research team details, and progress milestones.
- **[Methodology Deep Dive (methodology.html)](methodology.html)** — Full research workflow, semi-empirical capacity-fade equations ($Q_{\text{loss}} = B e^{-E_a/RT} C^m (Ah)^z$), Direct AR SOH forecasting, FedPer split architecture ($\theta_B$ vs $\theta_{P,k}$), TreeSHAP feature attributions, and complete benchmark tables (Tables 1–7).
- **[Technical Reference Manual (documentation.html)](documentation.html)** — System requirements, repository layout, step-by-step setup, `.env` configuration, REST API schemas, dataset ETL scripts, model artifacts, and ESP32 OLED wiring guide.
- **[What-If Decision Sandbox (simulator.html)](simulator.html)** — Interactive sandbox with scenario presets (*Summer Highway*, *Winter Munich*, *Optimal Eco*), real-time battery thermal stress gauge, SOH degradation curves, and dynamic SHAP feature attributions.

---

## 👥 Research Team & Authors

| Author | Register Number | Role / Module | GitHub Profile | Amrita Email |
| :--- | :--- | :--- | :--- | :--- |
| **Dr. Ramya G. R.** | Supervisor | Assistant Professor, Dept. of CSE | — | `gr_ramya@cb.amrita.edu` |
| **Dr. Umashankar S.** | Co-Supervisor | Professor, Dept. of EEE | — | `s_umashankar@cb.amrita.edu` |
| **Shravanthi S** | `CB.SC.U4CSE23147` | **Module 3: Battery Health Forecasting & SHAP** | [@Shravanthi20](https://github.com/Shravanthi20/) | `cb.sc.u4cse23147@cb.students.amrita.edu` |
| **Saravana Priyaa C. R.** | `CB.SC.U4CSE23149` | **Hardware Integration (ESP32) & Module 4** | [@saravanapriyaa21](https://github.com/saravanapriyaa21) | `cb.sc.u4cse23149@cb.students.amrita.edu` |
| **Gayathri U** | `CB.SC.U4CSE23026` | **Federated Learning Lead (FedPer)** | [@gayathriuthamaraj](https://github.com/gayathriuthamaraj/) | `cb.sc.u4cse23026@cb.students.amrita.edu` |
| **Rithanya K. A.** | `CB.SC.U4CSE23140` | **Module 1: Driving-to-Stress Prediction** | [@Rithanya-08](https://github.com/Rithanya-08) | `cb.sc.u4cse23140@cb.students.amrita.edu` |
| **Irene Divya J.** | `CB.SC.U4CSE23167` | **Module 2: Charging Anomaly Detection** | [@IreneDivyaJ](https://github.com/IreneDivyaJ) | `cb.sc.u4cse23167@cb.students.amrita.edu` |

---

## 📊 Core Empirical Highlights (From Research Paper)

1. **Module 1: Driving Behavior to Battery Stress (XGBoost):**
   - Physics-informed Battery Stress Index (BSI) replaces heuristic weights with semi-empirical capacity-fade model fitted to NASA and CALCE cells ($m = 0.80, z = 0.54, E_a = 27.8\text{ kJ/mol}$; explains 88.6% calibration variance).
   - Raises CV $R^2$ from **$0.708 \pm 0.094$ to $0.831 \pm 0.040$** (held-out $R^2 = 0.805$, MAE = 3.23).
   - In SHAP explanations, ambient temperature drops from rank 1 to rank 5, elevating driver-controllable factors (**maximum speed, average speed, mean acceleration**) to the top 3 drivers.

2. **Module 2: Charging-Session Anomaly Detection (XGBoost):**
   - Trained on 2,649 real sessions (Autosun & PolyU; 10.2% anomalies).
   - Weighted XGBoost achieves **99.62% accuracy, Precision = 1.000, Recall = 0.963, F1 = 0.981, ROC-AUC = 0.999** (detects 52/54 faults with 0 false alarms, beating LSTM, TCN, and Isolation Forest).

3. **Module 3: Battery State-of-Health Forecasting (Direct AR):**
   - Direct Autoregressive (AR) model forecasts SOH ten cycles ahead with **$R^2 = 0.9591$ and MAE = 0.00657** on 18,065 targets (Zenodo NMC/LFP data).
   - Causal rolling median rate acceleration detector ($\Delta_{\text{acc}} = r_{\text{recent}} - r_{\text{long}}$) identifies rapid degradation early.

4. **Module 4: Trip Energy Consumption & Arrival SOC (Elastic Net):**
   - Stable-23 Elastic Net predicts energy with **$R^2 = 0.897$ (MAE 0.0077 kWh/km)** on 70 Munich trips (TUM).
   - In-trip arrival SOC predictor estimates final SOC from first 50% of trip with **$R^2 = 0.976$ (MAE 1.48 pp)**, rising to $R^2 = 0.984$ at 75%.

5. **Personalized Federated Learning (FedPer):**
   - Evaluated across 51 client trips.
   - FedAvg matches centralized arrival-SOC accuracy ($\Delta R^2 \le 0.03$).
   - FedPer lowers local error for **32 of 51 established clients** (median MAE 2.81 vs 3.51 for FedAvg).

6. **On-Device Edge Deployment on ESP32 Microcontroller:**
   - 3 XGBoost models compiled to C headers and executed on an ESP32 at 240 MHz:
     - M1 Battery Stress: **3.35 ms**
     - M2 Charging Anomaly: **1.92 ms**
     - M3 SOH / Degradation Risk: **3.38 ms**
     - **Total sequential inference: 8.65 ms** (displayed on an SH1106 OLED screen and sent as JSON over Wi-Fi).

---

## 🚀 Quick Start Guide

### 1. Clone & Set Up Python Environment

```bash
git clone https://github.com/Shravanthi20/spark-ev.git
cd spark-ev

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
.\venv\Scripts\Activate.ps1
# On Linux/macOS:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Launch Local Documentation Portal

```bash
python -m http.server 3000
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser!

### 3. Launch FastAPI Recommendation Server

```bash
uvicorn src.api.main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive Swagger docs: **[http://localhost:8000/docs](http://localhost:8000/docs)**.

---

## 📜 Citation

```bibtex
@article{sparkev2026,
  title={SparkEV: A Personalized, Predictive, and Explainable Framework for Intelligent Electric Vehicle Management},
  author={Ramya, G. R. and Umashankar, S. and Shravanthi, S. and Priyaa, Saravana C. R. and Gayathri, U. and Rithanya, K. A. and Irene Divya, J.},
  journal={Department of Computer Science and Engineering & Department of Electrical and Electronics Engineering, Amrita Vishwa Vidyapeetham},
  year={2026},
  address={Coimbatore, India}
}
```

---

## 📄 License
This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
