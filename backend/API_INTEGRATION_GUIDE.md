# AgriSmart AI – Member 3: Backend API Integration Guide
**Module:** Weather Forecasting, Soil Health Analysis, Crop Recommendations, Smart Irrigation, Crop Calendar & Water Availability Management  
**Framework:** FastAPI (Python 3.10+)  
**Database:** Google Cloud Firestore (Firebase Admin SDK) with High-Performance Memory Fallback  
**Base URL (Local):** `http://localhost:8000`  
**Interactive Swagger UI:** `http://localhost:8000/docs`  
**ReDoc Documentation:** `http://localhost:8000/redoc`  
**JSON Response Standard Envelope:**
All API responses strictly adhere to the unified envelope:
```json
{
  "success": true,
  "message": "Human-readable status summary",
  "data": { ... }
}
```

---

## 1. System & Health Endpoints

### 1.1 Root Welcome
* **Method:** `GET`
* **URL:** `/`
* **Purpose:** Initial server ping and documentation directory.
* **Headers:** None required
* **Request Body:** None
* **Example Response (`200 OK`):**
```json
{
  "message": "Welcome to AgriSmart AI Backend",
  "documentation": "/docs",
  "health": "/health",
  "version": "1.0.0"
}
```

---

### 1.2 Health Check
* **Method:** `GET`
* **URL:** `/health` (also accessible at `/api/health`)
* **Purpose:** Uptime monitoring, container health, and database connection state.
* **Headers:** None required
* **Request Body:** None
* **Example Response (`200 OK`):**
```json
{
  "status": "healthy",
  "message": "AgriSmart AI Backend is running smoothly",
  "service": "AgriSmart AI - Weather, Soil & Location Intelligence",
  "database": "active (Firebase / memory fallback)"
}
```

---

## 2. Weather Intelligence Module

### 2.1 Get Current Weather & Agricultural Spraying Conditions
* **Method:** `GET`
* **URL:** `/api/weather/current`
* **Query Parameters:**
  * `latitude` (float, required): Farm latitude (-90.0 to 90.0), e.g. `12.2958`
  * `longitude` (float, required): Farm longitude (-180.0 to 180.0), e.g. `76.6394`
* **Example Request:**
  `GET /api/weather/current?latitude=12.2958&longitude=76.6394`
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Current weather observations retrieved successfully.",
  "data": {
    "latitude": 12.2958,
    "longitude": 76.6394,
    "timezone": "Asia/Kolkata",
    "timestamp": "2026-11-06T12:00:00",
    "temperature_c": 28.4,
    "apparent_temperature_c": 30.1,
    "temp_min_today_c": 21.0,
    "temp_max_today_c": 31.2,
    "humidity_pct": 64.0,
    "rainfall_mm": 0.0,
    "wind_speed_kmh": 11.5,
    "weather_code": 1,
    "weather_condition": "Mainly clear",
    "agricultural_conditions": {
      "spray_window_status": "SUITABLE",
      "spray_window_reason": "Wind speed (11.5 km/h) and zero precipitation provide safe spraying conditions.",
      "heat_stress_level": "NORMAL",
      "fungal_disease_risk": "LOW",
      "evaporation_rate": "MODERATE"
    }
  }
}
```
* **Error Responses:**
  * `400 Bad Request`: `{"detail": "Invalid coordinate range."}`
  * `422 Unprocessable Entity`: Validation failure (e.g. missing query parameters).
  * `503 Service Unavailable`: `{"detail": "Open-Meteo weather service is currently unreachable."}`

---

### 2.2 Get 7-Day Weather Forecast & Agronomic Trends
* **Method:** `GET`
* **URL:** `/api/weather/forecast`
* **Query Parameters:**
  * `latitude` (float, required): e.g. `12.2958`
  * `longitude` (float, required): e.g. `76.6394`
* **Example Request:**
  `GET /api/weather/forecast?latitude=12.2958&longitude=76.6394`
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "7-day agricultural weather forecast generated successfully.",
  "data": {
    "latitude": 12.2958,
    "longitude": 76.6394,
    "timezone": "Asia/Kolkata",
    "daily_forecast": [
      {
        "date": "2026-11-06",
        "temp_max_c": 31.2,
        "temp_min_c": 21.0,
        "avg_temp_c": 26.1,
        "precipitation_sum_mm": 0.0,
        "precipitation_probability_max_pct": 10,
        "max_wind_speed_kmh": 12.4,
        "weather_code": 1,
        "weather_condition": "Mainly clear",
        "farming_advisory": "Favorable dry weather. Suitable for field operations, harvesting, and pest scouting."
      }
    ],
    "agricultural_summary": {
      "total_7day_rainfall_mm": 14.5,
      "average_temp_c": 25.8,
      "hottest_day": "2026-11-08",
      "max_temp_peak_c": 32.5,
      "coldest_night": "2026-11-10",
      "min_temp_nadir_c": 19.8,
      "rainiest_day": "2026-11-09",
      "rainiest_day_amount_mm": 11.2,
      "irrigation_outlook": "Moderate rainfall anticipated (14.5 mm). Adjust scheduled irrigation to conserve pump power.",
      "overall_farming_outlook": "Favorable conditions for standing Kharif crops."
    }
  }
}
```

---

### 2.3 Get Weather Hazard & Extreme Alerts
* **Method:** `GET`
* **URL:** `/api/weather/alerts`
* **Query Parameters:**
  * `latitude` (float, required)
  * `longitude` (float, required)
* **Example Request:**
  `GET /api/weather/alerts?latitude=12.2958&longitude=76.6394`
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Weather alert evaluation complete. Status: CLEAR (0 active alerts).",
  "data": {
    "latitude": 12.2958,
    "longitude": 76.6394,
    "timestamp": "2026-11-06T12:00:00",
    "safety_status": "CLEAR",
    "active_alerts_count": 0,
    "alerts": []
  }
}
```

---

## 3. Soil Health Analyzer Module

### 3.1 Analyze Soil Test Parameters
* **Method:** `POST`
* **URL:** `/api/soil/analyze`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "ph": 6.5,
  "nitrogen": 240,
  "phosphorus": 25,
  "potassium": 180,
  "soil_type": "Red Soil",
  "soil_moisture_pct": 28.0,
  "organic_carbon_pct": 0.55
}
```
* **Field Specifications:**
  * `ph` (float, 0.0 – 14.0, required): Soil acidity/alkalinity
  * `nitrogen` or `nitrogen_n` (float, >= 0, required): Available N (kg/ha)
  * `phosphorus` or `phosphorus_p` (float, >= 0, required): Available P2O5 (kg/ha)
  * `potassium` or `potassium_k` (float, >= 0, required): Available K2O (kg/ha)
  * `soil_type` (string, optional): e.g. "Red Soil", "Black Soil", "Sandy Loam", "Clayey", "Laterite"
  * `soil_moisture_pct` (float, 0.0 – 100.0, optional): Soil moisture
  * `organic_carbon_pct` (float, >= 0, optional): Organic carbon %
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Soil health analysis completed successfully.",
  "data": {
    "overall_health_score": 85.0,
    "health_rating": "EXCELLENT",
    "summary_verdict": "Your soil is fertile, nutrient-balanced, and primed for high crop productivity.",
    "ph_assessment": {
      "value": 6.5,
      "category": "Neutral / Optimal",
      "status": "OPTIMAL",
      "actionable_advice": "Soil pH is in the optimal range (6.5 - 7.5). Micronutrients and primary macronutrients are highly bioavailable.",
      "amendment_needed": "None"
    },
    "nutrient_analysis": [
      {
        "nutrient": "Nitrogen (N)",
        "value": 240.0,
        "unit": "kg/ha",
        "level": "DEFICIENT / LOW",
        "reference_range": "280.0 - 560.0 kg/ha",
        "status_color": "RED",
        "simple_explanation": "Nitrogen is low at 240.0 kg/ha. Plants may show yellowing on older lower leaves and slow, stunted growth."
      },
      {
        "nutrient": "Phosphorus (P2O5)",
        "value": 25.0,
        "unit": "kg/ha",
        "level": "OPTIMAL / MEDIUM",
        "reference_range": "23.0 - 57.0 kg/ha",
        "status_color": "GREEN",
        "simple_explanation": "Phosphorus (P2O5) level is balanced and healthy at 25.0 kg/ha."
      },
      {
        "nutrient": "Potassium (K2O)",
        "value": 180.0,
        "unit": "kg/ha",
        "level": "OPTIMAL / MEDIUM",
        "reference_range": "145.0 - 337.0 kg/ha",
        "status_color": "GREEN",
        "simple_explanation": "Potassium (K2O) level is balanced and healthy at 180.0 kg/ha."
      }
    ],
    "soil_type_insight": {
      "soil_type": "Red Soil (Alfisols)",
      "drainage": "Well-drained to rapid drainage",
      "water_holding_capacity": "Low to Moderate",
      "nutrient_retention": "Moderate cation exchange capacity",
      "key_challenge": "Prone to phosphorus fixation (binding with iron/aluminum). Band placement of phosphate fertilizers and organic matter addition are essential."
    },
    "moisture_status": {
      "measured_moisture_pct": 28.0,
      "moisture_class": "OPTIMAL",
      "advisory": "Adequate moisture for seed germination, nutrient uptake, and root respiration."
    },
    "actionable_recommendations": [
      "Nitrogen (N) Boost: Supplement nitrogen using organic compost, vermicompost, and biofertilizers (Azotobacter for cereals, Rhizobium for legumes). For synthetic supplementation, use split urea or neem-coated urea applications to prevent leaching.",
      "Maintain Organic Matter: Incorporate farmyard manure (FYM) or green manuring (Dhaincha/Sunhemp) at 5 tons/acre before sowing to increase soil moisture holding capacity."
    ],
    "agronomic_disclaimer": "Diagnostic screening based on ICAR & FAO soil guidelines. For precise chemical fertilizer blending, consult your nearest Krishi Vigyan Kendra (KVK)."
  }
}
```
* **Error Responses:**
  * `422 Unprocessable Entity`: Input validation failure (e.g. `ph: 16.0` or negative NPK).

---

## 4. Location-Based Crop Recommendation Module

### 4.1 Get Crop Suitability Recommendations
* **Method:** `POST`
* **URL:** `/api/crops/recommend`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "latitude": 12.5218,
  "longitude": 76.8951,
  "district": "Mandya",
  "state": "Karnataka",
  "season": "Kharif",
  "soil_type": "Red Soil",
  "soil_ph": 6.8,
  "water_availability": "Abundant / Canal",
  "rainfall_mm": 650.0,
  "temperature_c": 27.5
}
```
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Location-based crop recommendations generated successfully.",
  "data": {
    "location": {
      "latitude": 12.5218,
      "longitude": 76.8951,
      "district": "Mandya",
      "state": "Karnataka",
      "agro_climatic_zone": "Southern Dry Zone (Zone 6)"
    },
    "season": "Kharif",
    "scoring_model_reference": "ICAR & UAS (Bangalore/Dharwad) multi-factor suitability scoring model (0-100 scale).",
    "recommended_crops": [
      {
        "crop_name": "Paddy / Rice",
        "variety_suggestions": ["Jaya", "IR-64", "KPR-1", "BPT-5204"],
        "suitability_score": 93.0,
        "suitability_category": "HIGHLY_SUITABLE",
        "required_soil_conditions": {
          "ideal_ph_range": "5.5 - 7.5",
          "preferred_soil_types": ["Clayey", "Clay Loam", "Red Soil with clay subsoil"],
          "drainage": "Poorly to moderately drained (holds standing water)"
        },
        "water_requirements": {
          "water_demand_level": "High (1200 - 1500 mm)",
          "irrigation_strategy": "Maintain 2-5 cm standing water during vegetative and tillering stages; alternate wetting and drying (AWD) recommended for water saving."
        },
        "suitable_growing_season": "Kharif (June - Nov), Summer (Jan - May)",
        "reasons_for_recommendation": [
          "District Mandya is an established canal-irrigated command area with optimal agro-climatic support for Paddy.",
          "Soil pH of 6.8 is within the ideal 5.5 - 7.5 range.",
          "Water availability (Abundant / Canal) satisfies high water requirements."
        ]
      },
      {
        "crop_name": "Sugarcane",
        "variety_suggestions": ["Co-86032", "Co-62175", "VCF-0517"],
        "suitability_score": 88.0,
        "suitability_category": "HIGHLY_SUITABLE",
        "required_soil_conditions": {
          "ideal_ph_range": "6.5 - 7.5",
          "preferred_soil_types": ["Red Loam", "Heavy Clay", "Alluvial"],
          "drainage": "Well-drained with good moisture retention"
        },
        "water_requirements": {
          "water_demand_level": "Very High (1500 - 2500 mm)",
          "irrigation_strategy": "Drip fertigation yields 30-40% water savings over flood furrow irrigation."
        },
        "suitable_growing_season": "Annual (12-14 months)",
        "reasons_for_recommendation": [
          "Thrives under canal command with high solar radiation in Southern Karnataka.",
          "Well-matched to existing sugar mill procurement network in Mandya basin."
        ]
      }
    ],
    "alternative_crops": [
      {
        "crop_name": "Ragi (Finger Millet)",
        "suitability_score": 78.0,
        "suitability_category": "MODERATELY_SUITABLE",
        "rationale": "Resilient drought-tolerant staple crop requiring lower input cost and minimal water."
      }
    ],
    "agronomic_disclaimer": "Crop recommendations are computed using regional agro-climatic databases and empirical research from ICAR and UAS Karnataka."
  }
}
```

---

## 5. Smart Irrigation Recommendation Module

### 5.1 Get Dynamic Irrigation Recommendation
* **Method:** `POST`
* **URL:** `/api/irrigation/recommend` (legacy alias: `/api/irrigation/advice`)
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "crop_name": "Maize",
  "crop_stage": "Flowering / Panicle",
  "soil_type": "Red Soil",
  "soil_moisture_pct": 18.0,
  "is_sensor_data": true,
  "sensor_id": "SOIL-NODE-04",
  "rainfall_forecast_mm": 0.0,
  "water_availability": "Moderate / Borewell"
}
```
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Irrigation analysis complete. Action: IRRIGATE_NOW (Urgency: HIGH).",
  "data": {
    "crop_name": "Maize",
    "crop_stage": "Flowering / Panicle",
    "irrigation_status": "IRRIGATE_NOW",
    "urgency": "HIGH",
    "recommended_action": "Schedule immediate irrigation within 12 to 24 hours.",
    "reason": "Soil moisture (18.0%) has fallen below critical threshold (25.0%) during flowering stage, and 0.0 mm rain is predicted over 48 hours.",
    "weather_impact": {
      "rainfall_forecast_next_48h_mm": 0.0,
      "rainfall_warning": false,
      "weather_advisory": "No rain expected in the next 48 hours. Crops depend entirely on managed irrigation."
    },
    "soil_moisture_information": {
      "measured_moisture_pct": 18.0,
      "critical_depletion_threshold_pct": 25.0,
      "stress_status": "WATER_STRESSED",
      "data_source": "IoT Soil Sensor (Node ID: SOIL-NODE-04)"
    },
    "critical_stage_warning": "CRITICAL MOISTURE WINDOW: Maize is in tasseling/silking phase. Moisture stress at this stage causes poor pollination and up to 40% yield penalty.",
    "water_saving_tips": [
      "Operate pumps during early morning or evening hours (before 9 AM or after 5 PM) to reduce evaporation by 20-30%.",
      "Use furrow or drip irrigation instead of flood irrigation to save 35-50% water.",
      "Check pipeline joints and drip emitters for leaks before starting pump."
    ]
  }
}
```

---

## 6. Smart Crop Calendar Module

### 6.1 Generate Stage-by-Stage Crop Calendar
* **Method:** `POST`
* **URL:** `/api/calendar/generate`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "crop_name": "Maize",
  "sowing_date": "2026-06-15",
  "variety": "Deccan-103",
  "season": "Kharif",
  "district": "Mysuru",
  "state": "Karnataka",
  "farmer_id": "FARMER-MYS-01"
}
```
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Crop calendar for Maize (Corn) generated and saved successfully.",
  "data": {
    "calendar_id": "CAL-7A8B9C10",
    "farmer_id": "FARMER-MYS-01",
    "crop_name": "Maize (Corn)",
    "variety": "Deccan-103",
    "season": "Kharif",
    "location": "Mysuru, Karnataka",
    "sowing_date": "2026-06-15",
    "total_duration_days": 105,
    "estimated_harvest_window": "2026-09-13 to 2026-09-27 (Estimated)",
    "stages": [
      {
        "stage_name": "Sowing & Seedling Emergence",
        "day_start": 1,
        "day_end": 12,
        "duration_days": 12,
        "estimated_start_date": "2026-06-15",
        "estimated_end_date": "2026-06-26",
        "is_date_estimated": true,
        "water_need": "Light to Moderate",
        "irrigation_reminder": "Keep seed zone moist for uniform emergence; avoid standing water to prevent seed rotting.",
        "monitoring_reminder": "Scout for cutworms and early Fall Armyworm (FAW) egg clusters on tender leaf undersides.",
        "fertilizer_guidance": "Apply full basal Phosphorus, Potassium, and 1/3rd Nitrogen dose at furrow sowing.",
        "critical_activities": [
          "Seed treatment with Trichoderma / Thiamethoxam",
          "Line sowing with 60x20 cm spacing",
          "Ensure light initial irrigation"
        ]
      },
      {
        "stage_name": "Knee-High / Rapid Vegetative Growth",
        "day_start": 13,
        "day_end": 40,
        "duration_days": 28,
        "estimated_start_date": "2026-06-27",
        "estimated_end_date": "2026-07-24",
        "is_date_estimated": true,
        "water_need": "Moderate",
        "irrigation_reminder": "Irrigate when top 2-3 inches feel dry. Avoid moisture stress as leaf area is expanding.",
        "monitoring_reminder": "Scout closely for Fall Armyworm central whorl damage.",
        "fertilizer_guidance": "Top-dress 1/3rd Nitrogen dose at 30 days after sowing followed by earthing-up.",
        "critical_activities": [
          "Inter-cultivation with blade harrow",
          "Hand weeding at 20-25 DAS",
          "Earthing-up along crop rows"
        ]
      }
    ]
  }
}
```

---

### 6.2 Retrieve Saved Crop Calendar by Farmer ID or Crop Name
* **Method:** `GET`
* **URL:** `/api/calendar/{farmer_id}`
* **Example Requests:**
  * `GET /api/calendar/FARMER-MYS-01` (retrieves saved calendar)
  * `GET /api/calendar/ragi` (generates calendar dynamically for Ragi)
* **Example Response (`200 OK`):** Returns the generated/saved crop calendar JSON object.
* **Error Response:** `404 Not Found` if farmer ID does not exist and is not a known crop name.

---

## 7. Water Availability Management Module

### 7.1 Register Farmer Water Profile & Assets
* **Method:** `POST`
* **URL:** `/api/water/register`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "farmer_id": "FARMER-MYS-01",
  "farm_name": "Cauvery Green Valley",
  "total_farm_acres": 4.0,
  "water_sources": [
    {
      "source_type": "borewell",
      "status": "ACTIVE",
      "daily_capacity_liters": 18000.0,
      "operating_hours_per_day": 5.0,
      "depth_feet": 320.0
    },
    {
      "source_type": "pond",
      "status": "ACTIVE",
      "storage_capacity_liters": 60000.0,
      "current_level_pct": 80.0
    }
  ],
  "has_drip_irrigation": true,
  "self_assessed_security": "Moderate"
}
```
* **Supported `source_type` values:** `borewell`, `well`, `pond`, `canal`, `rainwater_storage`
* **Example Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Water availability profile registered successfully.",
  "data": {
    "farmer_id": "FARMER-MYS-01",
    "farm_name": "Cauvery Green Valley",
    "registered_sources_count": 2,
    "water_sources": [
      {
        "source_type": "borewell",
        "status": "ACTIVE",
        "daily_capacity_liters": 18000.0,
        "operating_hours_per_day": 5.0,
        "depth_feet": 320.0
      },
      {
        "source_type": "pond",
        "status": "ACTIVE",
        "storage_capacity_liters": 60000.0,
        "current_level_pct": 80.0
      }
    ],
    "overall_water_security": "SECURE",
    "shortage_warning": null,
    "daily_estimated_availability_liters": 18000.0,
    "total_storage_capacity_liters": 60000.0,
    "irrigation_feasibility": "HIGH",
    "recommended_irrigation_method": "Micro-irrigation / Drip System",
    "water_conservation_methods": [
      "Micro-Irrigation Priority: Continue utilizing installed drip system to maintain 90%+ water application efficiency.",
      "Organic Mulching: Spread 3-4 inches of dry paddy straw or sugarcane trash along crop beds to reduce surface evaporation by up to 35%.",
      "Nighttime Irrigation: Operate pumps between 7:00 PM and 6:00 AM to eliminate wind drift and daytime evaporative loss."
    ],
    "last_updated": "2026-11-06T12:00:00"
  }
}
```

---

### 7.2 Get Farmer Water Dashboard
* **Method:** `GET`
* **URL:** `/api/water/{farmer_id}`
* **Example Request:** `GET /api/water/FARMER-MYS-01`
* **Example Response (`200 OK`):** Returns full water asset profile, active discharge rates, storage levels, and drought advisories.
* **Error Response:** `404 Not Found` if farmer ID is not found.

---

### 7.3 Update Water Availability Profile
* **Method:** `PUT`
* **URL:** `/api/water/{farmer_id}`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "has_drip_irrigation": true,
  "self_assessed_security": "Abundant",
  "notes": "Rainwater recharge pit added to borewell."
}
```
* **Example Response (`200 OK`):** Returns recalculated water dashboard with updated status.

---

### 7.4 Get Regional Macro Water Availability Index
* **Method:** `GET`
* **URL:** `/api/water/regional/availability`
* **Query Parameters:** `latitude` (float), `longitude` (float)
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Regional water availability evaluated successfully.",
  "data": {
    "latitude": 12.2958,
    "longitude": 76.6394,
    "water_stress_index": "MODERATE",
    "rainfall_deficit_percentage": 25.0,
    "groundwater_status": "Adequate for seasonal crops",
    "conservation_advisory": "Follow scheduled smart irrigation intervals."
  }
}
```

---

## 8. Farmer Location & Profile Module (Firebase Firestore)

### 8.1 Register Farmer & Farm GPS Coordinates
* **Method:** `POST`
* **URL:** `/api/location/farmers`
* **Headers:** `Content-Type: application/json`
* **Request Body:**
```json
{
  "name": "Basavaraju Patil",
  "phone": "9876543210",
  "village": "Nanjangud",
  "district": "Mysuru",
  "state": "Karnataka",
  "latitude": 12.1192,
  "longitude": 76.6806,
  "farm_size_acres": 3.5,
  "soil_type": "Red Soil",
  "primary_crops": ["Maize", "Ragi"]
}
```
* **Example Response (`201 Created`):**
```json
{
  "success": true,
  "message": "Farmer profile created successfully with ID: FARMER-B1C2D3E4.",
  "data": {
    "farmer_id": "FARMER-B1C2D3E4",
    "name": "Basavaraju Patil",
    "phone": "9876543210",
    "village": "Nanjangud",
    "district": "Mysuru",
    "state": "Karnataka",
    "latitude": 12.1192,
    "longitude": 76.6806,
    "farm_size_acres": 3.5,
    "soil_type": "Red Soil",
    "primary_crops": ["Maize", "Ragi"],
    "created_at": "2026-11-06T12:00:00",
    "updated_at": "2026-11-06T12:00:00"
  }
}
```

---

### 8.2 List Registered Farmers for Map Display
* **Method:** `GET`
* **URL:** `/api/location/farmers`
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Registered farmers retrieved successfully.",
  "data": [
    {
      "farmer_id": "FARMER-B1C2D3E4",
      "name": "Basavaraju Patil",
      "village": "Nanjangud",
      "district": "Mysuru",
      "latitude": 12.1192,
      "longitude": 76.6806,
      "farm_size_acres": 3.5
    }
  ]
}
```

---

### 8.3 Get Single Farmer Profile
* **Method:** `GET`
* **URL:** `/api/location/farmers/{farmer_id}`
* **Example Response (`200 OK`):** Returns the farmer's full contact and farm specification object.
* **Error Response:** `404 Not Found` if farmer ID is not found.

---

### 8.4 Get Firestore Database Connection & Collection Diagnostics
* **Method:** `GET`
* **URL:** `/api/location/database/status`
* **Security Feature:** Confirms database engine and document counts across all 7 collections without leaking secret credentials or private keys.
* **Example Response (`200 OK`):**
```json
{
  "success": true,
  "message": "Database status retrieved successfully.",
  "data": {
    "status": "connected",
    "engine": "Google Cloud Firestore",
    "credentials_configured": true,
    "collections": {
      "farmers": 5,
      "soil_records": 8,
      "weather_records": 12,
      "crop_recommendations": 6,
      "irrigation_records": 10,
      "crop_calendars": 4,
      "water_records": 5
    },
    "note": "Production connects to Google Cloud Firestore using FIREBASE_CREDENTIALS_PATH service account JSON."
  }
}
```

---

## 9. Error Handling & HTTP Status Codes Summary

| Status Code | Meaning | Example Trigger | Expected Client Handling |
|:---|:---|:---|:---|
| `200 OK` | Request succeeded | Valid GET / POST / PUT requests | Parse `data` payload |
| `201 Created` | Resource created | Farmer registration, Water registration | Store returned ID |
| `400 Bad Request` | Invalid query parameter logic | Invalid latitude range, unrecognized water source | Display friendly alert |
| `404 Not Found` | Entity not found | Unknown `farmer_id` queried | Show empty state or registration prompt |
| `422 Unprocessable` | Pydantic Schema Validation failure | Out of range pH (>14) or missing required fields | Check request body format |
| `500 Server Error` | Unhandled backend exception | Database connection error | Notify user to retry shortly |
| `503 Unavailable` | External service down | Open-Meteo API unreachable | Inform farmer weather service is temporarily offline |

