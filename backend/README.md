# AgriSmart AI – Member 3: Weather, Soil & Location Intelligence

Welcome to the backend module for **Member 3** of the **AgriSmart AI** hackathon project.

This service is built using **Python** and **FastAPI**. It delivers agricultural intelligence for farm management, including live Open-Meteo weather forecasting, ICAR-calibrated soil health analysis, location-based crop recommendations, smart irrigation advisories, personalized crop growth calendars, farm water asset tracking, and Google Cloud Firestore database integration.

---

## 📁 Project Structure

```text
backend/
├── app/
│   ├── main.py                    # FastAPI application entry point, CORS, routers & exception handlers
│   ├── config.py                  # Environment settings, thresholds, and database configuration
│   │
│   ├── api/                       # API Route Handlers (FastAPI Endpoints)
│   │   ├── weather.py             # Weather observations, 7-day forecast & alerts
│   │   ├── soil.py                # Soil test analysis (pH, NPK, moisture) & health scoring
│   │   ├── crops.py               # Location & season-based crop recommendations
│   │   ├── irrigation.py          # Smart irrigation recommendations & 48h rain warnings
│   │   ├── calendar.py            # Crop growth calendar schedules & monitoring reminders
│   │   ├── water.py               # Water asset tracking & shortage risk dashboard
│   │   └── location.py            # Farmer GPS coordinates, profiles & Firestore diagnostics
│   │
│   ├── services/                  # Agronomic Algorithms & External Integrations
│   │   ├── weather_service.py     # Open-Meteo API communication & alert rules
│   │   ├── soil_service.py        # ICAR/FAO soil screening & fertilizer advice
│   │   ├── crop_service.py        # 100-point multi-factor crop suitability scoring model
│   │   ├── irrigation_service.py  # Agro-hydrological water balance & sensor provenance
│   │   ├── calendar_service.py    # Variety growth stages, dates & farm activity reminders
│   │   └── water_service.py       # Farm water asset analytics & conservation tips
│   │
│   ├── models/
│   │   └── schemas.py             # Strict Pydantic models for request validation & JSON responses
│   │
│   ├── database/
│   │   └── firebase.py            # Google Cloud Firestore client (7 collections) with fallback
│   │
│   └── utils/
│       └── helpers.py             # Reusable JSON formatting & response wrappers
│
├── tests/
│   ├── test_master_integration.py # Comprehensive test suite covering all 20 API operations
│   ├── test_structure.py          # Unit tests verifying structure and core logic
│   ├── test_weather_live.py       # Live Open-Meteo API test for Mysuru, Karnataka
│   ├── test_soil_live.py          # Multi-sample soil test (Red, Black, Laterite, Alluvial)
│   ├── test_crops_live.py         # Multi-zone Karnataka crop recommendation test
│   ├── test_irrigation_live.py    # Growth-stage and rain warning test scenarios
│   ├── test_calendar_live.py      # Maize, Paddy, and Ragi growth calendar tests
│   ├── test_water_live.py         # Farm water source registration and shortage tests
│   └── test_firebase_operations.py# Firestore 7-collection read/write verification
│
├── requirements.txt               # Production Python dependencies
├── .env.example                   # Template for environment settings
├── .gitignore                     # Ignores venv, .env, and serviceAccountKey.json
├── API_INTEGRATION_GUIDE.md       # Complete API documentation guide for frontend teammates
└── README.md                      # This documentation guide
```

---

## 📖 File-by-File Explanation (Beginner Friendly)

| File | What it does |
| :--- | :--- |
| `app/main.py` | The main server entry point. Sets up CORS (allowing React / Vite / Next.js on `localhost:3000` and `localhost:5173`), handles global errors, and registers all feature routers. |
| `app/config.py` | Loads settings safely from `.env` or system environment variables with smart defaults. |
| `app/models/schemas.py` | Defines data models with Pydantic. Validates all inputs (e.g., latitude between -90 and 90, pH between 0 and 14) and generates OpenAPI Swagger schemas. |
| `app/database/firebase.py` | Connects to Google Cloud Firestore across 7 distinct collections. If credentials are not present, it transparently operates in **safe in-memory fallback mode** so the backend always runs. |
| `app/services/weather_service.py` | Connects to Open-Meteo API (free, no API key needed) to fetch real-time weather and evaluates agricultural hazard alerts (frost, extreme heat, flood, strong wind). |
| `app/services/soil_service.py` | Evaluates soil nutrients (N, P, K, pH, moisture) against ICAR & FAO agronomic benchmarks and produces actionable biofertilizer recommendations. |
| `app/services/crop_service.py` | Ranks crop suitability using a 100-point multi-factor model considering location, soil pH, texture, water availability, and season. |
| `app/services/irrigation_service.py` | Calculates whether irrigation is needed today. Warns farmers when 48-hour rainfall is predicted to save water and pump electricity. |
| `app/services/calendar_service.py` | Generates stage-by-stage growth timelines for crops (Maize, Paddy, Ragi, etc.) with estimated dates, irrigation alerts, and monitoring reminders. |
| `app/services/water_service.py` | Tracks farmer water assets (borewell, open well, farm pond, canal, rainwater cistern) and provides water shortage alerts and conservation techniques. |

---

## 🚀 Windows PowerShell Quickstart Guide

### 1. Open PowerShell and Navigate to the Backend Directory
```powershell
cd d:\hackathon\backend
```

### 2. Create and Activate Virtual Environment
```powershell
# Create virtual environment (if not already created)
python -m venv venv

# Set execution policy for the current PowerShell session (if script execution is restricted)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# Activate the virtual environment
.\venv\Scripts\Activate.ps1
```
*(Your prompt will now show `(venv)`).*

### 3. Install Dependencies
```powershell
pip install -r requirements.txt
```

### 4. Run the Master Integration Test Suite
Verify that all 20 test cases across all modules pass cleanly:
```powershell
python tests\test_master_integration.py
```
*(You will see all 20 tests pass with `OK`).*

### 5. Start the FastAPI Development Server
```powershell
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### 6. Access Interactive API Documentation
Open your web browser and visit:
* **Interactive Swagger UI:** [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
* **ReDoc Documentation:** [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)
* **Service Health Check:** [http://127.0.0.1:8000/health](http://127.0.0.1:8000/health)

---

## 🔥 Firebase Firestore Setup Instructions

The backend is configured to use Google Cloud Firestore via the Firebase Admin SDK across 7 separate collections:
1. `farmers` – Farmer contact details, farm name, cultivated acres, and GPS coordinates.
2. `soil_records` – Soil pH, NPK analysis, health scores, and biofertilizer advice.
3. `weather_records` – Meteorological snapshots and extreme weather hazard alerts.
4. `crop_recommendations` – Location- and agro-climatic-based crop suitability rankings.
5. `irrigation_records` – Dynamic watering decisions, sensor readings, and rain-triggered skip logs.
6. `crop_calendars` – Growth stage timelines, estimated dates, and stage reminders.
7. `water_records` – Registered water assets (borewell, well, pond, canal, rainwater storage).

### Connecting Google Cloud Firestore:
1. Open the [Firebase Console](https://console.firebase.google.com/).
2. Select your project (e.g. `agrismart-ai-hackathon`).
3. Navigate to **Project Settings** (gear icon) $\rightarrow$ **Service accounts** tab.
4. Click **Generate new private key** and download the `.json` file.
5. Save the file inside `d:\hackathon\backend\` as `serviceAccountKey.json`.
   *(This file is protected in `.gitignore` and will never be committed to git).*
6. In `d:\hackathon\backend\.env`:
   ```env
   FIREBASE_CREDENTIALS_PATH="serviceAccountKey.json"
   ```
7. Start the backend. Firestore will automatically connect. Check diagnostic status at `http://127.0.0.1:8000/api/location/database/status`.

> **Note on Offline / Fallback Mode:** When running offline or without credentials, the system automatically runs in **Safe In-Memory Fallback Mode** so development, demos, and tests never crash.

---

## 📡 Registered API Endpoints Summary

| Module | Method | Endpoint | Description |
| :--- | :---: | :--- | :--- |
| **System** | `GET` | `/` | Root welcome message & documentation directory |
| **System** | `GET` | `/health` | Service health status check |
| **Weather** | `GET` | `/api/weather/current` | Real-time weather, temperature, humidity & spraying window |
| **Weather** | `GET` | `/api/weather/forecast` | 7-day weather forecast with Pandas analytics |
| **Weather** | `GET` | `/api/weather/alerts` | Extreme heat, heavy rainfall, frost & wind alerts |
| **Soil Health** | `POST` | `/api/soil/analyze` | Soil pH & NPK analysis, health rating, ICAR amendments |
| **Crop Recommendation** | `POST` | `/api/crops/recommend` | Location- and season-based crop suitability ranking |
| **Smart Irrigation** | `POST` | `/api/irrigation/recommend` | Dynamic watering action, 48h rain warnings & water savings |
| **Crop Calendar** | `POST` | `/api/calendar/generate` | Stage-by-stage growth timeline with dates & reminders |
| **Crop Calendar** | `GET` | `/api/calendar/{farmer_id}` | Retrieve saved crop calendar or dynamic crop lookup |
| **Water Management** | `POST` | `/api/water/register` | Register farm water sources (borewell, pond, canal, cistern) |
| **Water Management** | `GET` | `/api/water/{farmer_id}` | Retrieve farmer water security dashboard & alerts |
| **Water Management** | `PUT` | `/api/water/{farmer_id}` | Update water source status & available quantities |
| **Water Management** | `GET` | `/api/water/regional/availability` | Regional groundwater and precipitation balance index |
| **Farmer Location** | `POST` | `/api/location/farmers` | Store farmer profile & farm GPS coordinates |
| **Farmer Location** | `GET` | `/api/location/farmers` | List all registered farmers and farm coordinates |
| **Farmer Location** | `GET` | `/api/location/farmers/{farmer_id}` | Retrieve specific farmer profile by ID |
| **Database Diagnostics**| `GET` | `/api/location/database/status` | Connection status & counts across all 7 collections |

---

## 🤝 Teammate API Integration Guide
For full request payloads, query parameters, response examples, and status codes for React/Vite/Next.js frontend integration, see:  
👉 [`API_INTEGRATION_GUIDE.md`](file:///d:/hackathon/backend/API_INTEGRATION_GUIDE.md)
