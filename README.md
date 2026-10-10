# CareFlow AI — Hospital Operations & Intelligent Capacity Planning

**CareFlow AI** is an enterprise-grade hospital operations and intelligent capacity planning platform built with Java 21, Spring Boot 3.2 microservices, PostgreSQL 16 persistence, Google Gemini AI synthesis, and a React 18 / TypeScript operations dashboard.

---

## 1. System Architecture

```
               +-------------------------------------------------------+
               |        React 18 / TypeScript Operations Console       |
               |                     (Port: 3000)                      |
               +---------------------------+---------------------------+
                                           | HTTP REST
                                           v
    +-----------------------------------------------------------------------------+
    |               Service 3: Forecast and Intelligence Service                 |
    |                                (Port: 8083)                                 |
    |  - Numerical Demand Forecasting (7-day MA + day-of-week seasonal ensemble)   |
    |  - Capacity Planning & Mathematical Shortage Projection (Projected = C+P-D) |
    |  - Explainable Clinical Triage Engine (ESI Levels 1 to 5)                   |
    |  - Google Gemini API Narrative Explanations (with deterministic fallback)   |
    +-----------------------+-----------------------------+-----------------------+
                            | HTTP REST                   | HTTP REST
                            v                             v
+---------------------------------------+   +---------------------------------------+
|      Service 1: Patient Service       |   |   Service 2: Bed & Resource Service   |
|              (Port: 8081)             |   |              (Port: 8082)             |
|  - Synthetic Inpatient Admissions     |   |  - Real-time Bed Census               |
|  - Historical Date-Range Queries      |   |  - Invariant: Avail = Total - Occupied|
|  - 10,000+ Pre-seeded Records         |   |  - Scheduled 24h Discharges           |
|  - Department Historical Trends       |   |  - ICU & Critical Equipment Tracking  |
+-------------------+-------------------+   +-------------------+-------------------+
                    |                                           |
                    +---------------------+---------------------+
                                          | JDBC
                                          v
                    +-------------------------------------------+
                    |           PostgreSQL 16 Database          |
                    |             (Port: 5432, careflow)        |
                    +-------------------------------------------+
```

---

## 2. Microservice Portfolio

| Service Name | Port | Primary Responsibilities | Key Endpoints |
|--------------|------|--------------------------|---------------|
| **Patient Service** | `8081` | Anonymized patient visits, historical admissions by department and date range, synthetic seed generator (10,000+ records). | `GET /api/patients/visits`<br>`POST /api/patients/visits`<br>`GET /api/patients/admissions/history`<br>`GET /actuator/health` |
| **Bed & Resource Service** | `8082` | Department bed inventory, real-time occupancy updates, scheduled discharges, ICU capacity, life-support equipment tracking (ventilators, monitors, pumps). Enforces `availableBeds = totalBeds - occupiedBeds`. | `GET /api/beds/occupancy`<br>`POST /api/beds/occupancy`<br>`GET /api/beds/availability`<br>`GET /api/resources`<br>`GET /actuator/health` |
| **Forecast & Intelligence Service** | `8083` | Inter-service HTTP orchestration via RestClient/WebClient, statistical demand baseline, mathematical capacity model, explainable triage rule engine, Gemini AI narrative synthesis. | `GET /api/analytics/forecast`<br>`GET /api/analytics/capacity`<br>`POST /api/analytics/triage`<br>`GET /api/analytics/alerts`<br>`GET /actuator/health` |
| **CareFlow Operations Dashboard** | `3000` | Enterprise React 18 + TypeScript + Tailwind CSS UI with Recharts, interactive census adjustment, live triage model, real-time health badges. | `http://localhost:3000/` |

---

## 3. Mathematical Consistency & Forecasting Model

### Capacity Projection Formula
$$\text{Projected Occupancy} = \text{Current Occupancy} + \text{Predicted Admissions} - \text{Expected Discharges}$$

$$\text{Projected Shortage} = \max(0, \text{Projected Occupancy} - \text{Total Licensed Capacity})$$

- **Invariant Guarantee**: `availableBeds = totalBeds - occupiedBeds` is enforced in the persistence layer. Occupancy cannot be negative or exceed total beds.

### Forecasting Baseline
- **Ensemble Methodology**: 40% same-weekday average + 40% 7-day moving average + 20% 14-day moving average with trend acceleration factor.
- **Transparency**: Every forecast includes evaluated sample size, 90% confidence bounds, and contributing factor weights.
- **Explainability**: Google Gemini API generates structured operational summaries. If the API key is not supplied or network fails, a deterministic statistical explanation is seamlessly provided without breaking runtime workflows.

### Triage Rules Engine
- Inspired by Emergency Severity Index (ESI Levels 1 to 5).
- Urgent symptoms (cardiac arrest, respiratory failure, stroke signs, SpO2 < 90%) are **never down-ranked**.
- Mandatory clinical decision-support disclaimer included on all evaluations.

---

## 4. Quickstart: Running All Services

### Prerequisites
- Java 21 JDK
- Apache Maven 3.9+
- PostgreSQL 16 (or running local instance on port 5432)
- Node.js 20+

### Step 1: Start PostgreSQL
```powershell
# Default credentials:
# URL: jdbc:postgresql://localhost:5432/careflow
# User: careflow / Password: careflow123
```

### Step 2: Build & Start Microservices
```powershell
# From the project root:
mvn clean package -DskipTests

# Terminal 1 — Patient Service (Port 8081):
java -jar patient-service/target/patient-service-1.0.0-SNAPSHOT.jar

# Terminal 2 — Bed & Resource Service (Port 8082):
java -jar bed-resource-service/target/bed-resource-service-1.0.0-SNAPSHOT.jar

# Terminal 3 — Forecast & Intelligence Service (Port 8083):
# (Optional: set GEMINI_API_KEY environment variable)
java -jar forecast-intelligence-service/target/forecast-intelligence-service-1.0.0-SNAPSHOT.jar
```

### Step 3: Start React Dashboard
```powershell
cd careflow-dashboard
npm install
npm run dev -- --port 3000
```
Open **`http://localhost:3000`** in your browser.

---

## 5. Verification & Test Evidence

- **Patient Service Health**: `http://localhost:8081/actuator/health` -> `{"status":"UP","components":{"db":{"status":"UP"}}}`
- **Bed Service Health**: `http://localhost:8082/actuator/health` -> `{"status":"UP"}`
- **Forecast Service Health**: `http://localhost:8083/actuator/health` -> `{"status":"UP"}`
- **Inter-service REST Call**: `http://localhost:8083/api/analytics/capacity?department=General%20Medicine&date=2026-10-11` executes real HTTP GET requests to `8081` and `8082`, returning projected capacity with full mathematical consistency.
