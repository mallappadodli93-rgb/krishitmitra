# 🌾 AgriSmart AI - Team API Integration Guide

This guide provides complete documentation, schemas, and code examples for integrating the **AgriSmart AI Machine Learning Backend** into the web frontend, mobile application, and backend orchestration services.

---

## 🚀 Quick Start & Server Access

| Feature | URL | Description |
| :--- | :--- | :--- |
| **Interactive Swagger UI** | `http://localhost:8000/docs` | Test all endpoints directly in the browser with live file upload & parameter forms |
| **ReDoc Documentation** | `http://localhost:8000/redoc` | Full OpenAPI technical documentation |
| **Root Health Status** | `GET http://localhost:8000/` | Confirms server is running and lists active AI endpoints |

### Launch Command (From Project Root)
```powershell
# Using the project's virtual environment:
.\.venv_tf\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

> **CORS Enabled**: Cross-Origin Resource Sharing (`Access-Control-Allow-Origin: *`) is already active, so frontend web apps (React, Next.js, Vue) can call the API directly from `http://localhost:3000` or any origin.

---

## 📌 Summary of Core AI Endpoints

All 6 microservices accept HTTP `POST` requests under the `/ai` prefix:

| Endpoint | Method | Content-Type | Purpose |
| :--- | :---: | :--- | :--- |
| [`/ai/disease-detection`](#1-post-aidisease-detection) | `POST` | `multipart/form-data` | Vision-based leaf disease detection (Tomato, Potato, Pepper) |
| [`/ai/pest-detection`](#2-post-aipest-detection) | `POST` | `multipart/form-data` | Agricultural pest & insect identification with IPM guidelines |
| [`/ai/yield-prediction`](#3-post-aiyield-prediction) | `POST` | `application/json` | Harvest tonnage forecasting using Random Forest regression |
| [`/ai/chatbot`](#4-post-aichatbot) | `POST` | `application/json` | Multilingual farming advice powered by Google Gemini (5 languages) |
| [`/ai/farm-doctor`](#5-post-aifarm-doctor) | `POST` | `multipart/form-data` | Integrated clinical diagnostics combining vision, weather & prescriptions |
| [`/ai/voice-assistant`](#6-post-aivoice-assistant) | `POST` | `multipart/form-data` | End-to-end voice loop (Speech-to-Text $\rightarrow$ Chatbot $\rightarrow$ Audio synthesis) |

---

## 1. `POST /ai/disease-detection`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image` *(File, Required)*: JPEG or PNG photograph of the affected plant leaf.

### cURL Example
```bash
curl -X POST "http://localhost:8000/ai/disease-detection" \
  -F "image=@/path/to/tomato_leaf.jpg;type=image/jpeg"
```

### JavaScript (Fetch) Example
```javascript
const formData = new FormData();
formData.append("image", fileInput.files[0]);

const response = await fetch("http://localhost:8000/ai/disease-detection", {
  method: "POST",
  body: formData
});
const result = await response.json();
console.log(result.data.diagnosis);
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "filename": "tomato_early_blight.jpg",
  "data": {
    "status": "success",
    "crop": "Tomato",
    "disease": "Early Blight",
    "is_healthy": false,
    "confidence_score": 0.9412,
    "confidence_percentage": "94.1%",
    "severity": "Moderate",
    "top_predictions": [
      {
        "rank": 1,
        "crop": "Tomato",
        "condition": "Early Blight",
        "confidence_score": 0.9412,
        "confidence_percentage": "94.1%"
      },
      {
        "rank": 2,
        "crop": "Tomato",
        "condition": "Late Blight",
        "confidence_score": 0.0421,
        "confidence_percentage": "4.2%"
      }
    ],
    "recommendations": {
      "organic_control": "Apply Copper Hydroxide (2.5 g/L) or Bacillus subtilis bio-fungicide.",
      "chemical_control": "Mancozeb 75 WP @ 2.5 g/L water or Chlorothalonil 75 WP @ 2.0 g/L.",
      "prevention": "Ensure wide spacing (60x45 cm) for airflow, avoid overhead sprinkler irrigation."
    }
  }
}
```

---

## 2. `POST /ai/pest-detection`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `image` *(File, Required)*: Insect or crop damage photo (JPEG or PNG).

### cURL Example
```bash
curl -X POST "http://localhost:8000/ai/pest-detection" \
  -F "image=@/path/to/fall_armyworm.jpg;type=image/jpeg"
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "filename": "fall_armyworm.jpg",
  "data": {
    "status": "success",
    "pest_name": "Fall Armyworm",
    "scientific_name": "Spodoptera frugiperda",
    "confidence_score": 0.915,
    "confidence_percentage": "91.5%",
    "is_supported": true,
    "affected_crops": ["Maize", "Sorghum", "Rice", "Sugarcane", "Cotton"],
    "damage_symptoms": "Pinholes in young leaves, skeletonized leaf margins, frass inside whorls.",
    "ipm_recommendations": {
      "cultural_control": "Intercrop maize with cowpea or desmodium (push-pull strategy).",
      "biological_control": "Release egg parasitoids Trichogramma pretiosum @ 50,000/ha; spray Neem Oil 1500 ppm @ 5 ml/L.",
      "chemical_control": "Emamectin benzoate 5% SG @ 0.4 g/L or Chlorantraniliprole 18.5% SC @ 0.4 ml/L.",
      "safety_instructions": "Wear face mask and rubber gloves. Never spray against wind."
    }
  }
}
```

---

## 3. `POST /ai/yield-prediction`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Payload Schema**:
```typescript
interface YieldPredictionPayload {
  crop: string;                  // e.g. "Rice", "Wheat", "Maize", "Cotton", "Sugarcane", "Tomato", "Potato"
  location: string;              // State or agricultural district (e.g. "Karnataka", "Punjab")
  land_area_hectares: number;    // Cultivated area in hectares (> 0)
  rainfall_mm: number;           // Rainfall in mm (>= 0)
  temperature_celsius?: number;  // Mean temperature in °C (Default: 26.5)
  soil_type?: string;            // "Alluvial", "Black Soil", "Red Soil", "Clay Loam", "Sandy Loam", "Laterite"
  soil_ph?: number;              // Soil pH scale 3.0 to 10.0 (Default: 6.5)
  season?: string;               // "Kharif", "Rabi", "Zaid", "Whole Year" (Default: "Kharif")
  fertilizer_kg?: number;        // Optional total fertilizer in kg (Default: auto-estimated)
  pesticide_kg?: number;         // Optional total pesticide in kg (Default: auto-estimated)
}
```

### cURL Example
```bash
curl -X POST "http://localhost:8000/ai/yield-prediction" \
  -H "Content-Type: application/json" \
  -d '{
    "crop": "Rice",
    "location": "Karnataka",
    "land_area_hectares": 3.0,
    "rainfall_mm": 1150.0,
    "temperature_celsius": 26.5,
    "soil_type": "Clay Loam",
    "soil_ph": 6.2,
    "season": "Kharif"
  }'
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "crop": "Rice",
    "location": "Karnataka",
    "cultivated_area": {
      "hectares": 3.0,
      "acres": 7.41
    },
    "yield_per_hectare": {
      "value": 3.19,
      "unit": "Metric Tons/Hectare"
    },
    "yield_per_acre": {
      "value": 1.29,
      "unit": "Metric Tons/Acre",
      "quintals_per_acre": 12.9
    },
    "total_estimated_production": {
      "metric_tons": 9.57,
      "quintals": 95.7,
      "kilograms": 9570.0
    },
    "model_metadata": {
      "model_type": "Random Forest Regressor",
      "r2_score": 0.9695,
      "mae": 1.5156,
      "rmse": 3.006
    },
    "disclaimer": "Predictions are machine learning statistical estimates based on historical agronomic patterns and standard weather conditions, not absolute guarantees."
  }
}
```

---

## 4. `POST /ai/chatbot`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `application/json`
- **Payload Schema**:
```typescript
interface ChatbotQueryPayload {
  question: string;               // Farmer question in plain language
  language?: string;              // "kannada", "english", "hindi", "telugu", "tamil" (Default: "kannada")
  conversation_history?: Array<{ // Optional for multi-turn chats
    role: "user" | "model";
    parts: string[];
  }>;
}
```

### cURL Example (Kannada Query)
```bash
curl -X POST "http://localhost:8000/ai/chatbot" \
  -H "Content-Type: application/json" \
  -d '{
    "question": "ನನ್ನ ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
    "language": "kannada"
  }'
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "reply": "🌱 **ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಸಮಗ್ರ ಪೋಷಕಾಂಶಗಳ ನಿರ್ವಹಣೆ (ಗೊಬ್ಬರದ ವೇಳಾಪಟ್ಟಿ):**\n\n1. **ಬುಡ ಗೊಬ್ಬರ (ನಾಟಿಗೆ ಮುನ್ನ):**\n   - ಪ್ರತಿ ಎಕರೆಗೆ 10-12 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಬೆರೆಸಿ.\n   - ನಾಟಿ ಮಾಡುವಾಗ ಡಿಎಪಿ (DAP) 50 ಕೆಜಿ, ಪೊಟ್ಯಾಶ್ 40 ಕೆಜಿ ಹಾಕಿ.\n\n2. **ಬೆಳವಣಿಗೆ ಹಂತದಲ್ಲಿ:**\n   - ಯೂರಿಯಾ 25 ಕೆಜಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಕೊಡಿ ಅಥವಾ 19:19:19 ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ 5 ಗ್ರಾಂ ಸಿಂಪಡಿಸಿ.",
    "language": {
      "canonical": "kannada",
      "native_name": "ಕನ್ನಡ",
      "bcp47": "kn-IN"
    },
    "safety_instructions_included": true
  }
}
```

---

## 5. `POST /ai/farm-doctor`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `symptoms` *(Form text, Required)*: Farmer's question or observed plant symptoms.
  - `crop_name` *(Form text, Optional)*: e.g. "Tomato", "Potato", "Maize".
  - `location` *(Form text, Optional)*: e.g. "Karnataka (Kolar)".
  - `weather_json` *(Form text, Optional)*: Backend weather JSON string.
  - `language` *(Form text, Optional)*: "kannada", "english", "hindi", "telugu", "tamil".
  - `image` *(File, Optional)*: Photograph of diseased leaf or pest.

### cURL Example
```bash
curl -X POST "http://localhost:8000/ai/farm-doctor" \
  -F "symptoms=Dark brown target spots with concentric rings on lower leaves" \
  -F "crop_name=Tomato" \
  -F "location=Karnataka (Kolar)" \
  -F 'weather_json={"temperature_celsius": 24.5, "humidity_percent": 86.0, "rainfall_mm": 12.0}' \
  -F "language=english"
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "data": {
    "doctor_explanation": "Based on observed symptoms and current micro-climate telemetry...",
    "weather_context": {
      "weather_available": true,
      "fungal_blight_risk": "HIGH",
      "rain_warning": "Rain expected in 24h. Postpone foliar spraying to avoid pesticide runoff.",
      "wind_warning": "Safe for spraying."
    },
    "treatment_plan": {
      "first_aid": "Immediately prune and safely destroy infected lower leaves.",
      "organic_solution": "Spray Trichoderma harzianum @ 5 g/L or Neem Oil 1500 ppm @ 4 ml/L.",
      "chemical_solution": "Mancozeb 75 WP @ 2.5 g/L or Azoxystrobin 23 SC @ 1 ml/L.",
      "safety_precautions": "Mandatory PPE: face mask, chemical-resistant gloves, eye protection."
    },
    "expert_escalation_required": false,
    "expert_referral_notice": "If symptoms persist beyond 5-7 days, visit your nearest Raitha Samparka Kendra (RSK) or Krishi Vigyan Kendra (KVK)."
  }
}
```

---

## 6. `POST /ai/voice-assistant`

### Request Specification
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `audio_file` *(File, Required)*: Recorded speech audio (.wav, .mp3, .ogg, .webm).
  - `language` *(Form text, Optional)*: Spoken language: "kannada", "english", "hindi", "telugu", "tamil".

### cURL Example
```bash
curl -X POST "http://localhost:8000/ai/voice-assistant" \
  -F "audio_file=@/path/to/farmer_query.wav;type=audio/wav" \
  -F "language=kannada"
```

### Sample Response (HTTP 200)
```json
{
  "success": true,
  "filename": "farmer_query.wav",
  "data": {
    "status": "success",
    "language": {
      "canonical": "kannada",
      "native_name": "ಕನ್ನಡ",
      "bcp47": "kn-IN"
    },
    "farmer_speech_transcription": "ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
    "chatbot_text_response": "ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಸಮಗ್ರ ಪೋಷಕಾಂಶಗಳ ನಿರ್ವಹಣೆ...",
    "speech_audio_response": {
      "available": true,
      "audio_base64": "UklGRi4AAABXQVZFZm10IBAAAAABAAEA...",
      "mime_type": "audio/wav",
      "audio_size_bytes": 160044
    }
  }
}
```

### Audio Playback in JavaScript
```javascript
// Playing the returned base64 audio in the browser:
const audioSrc = `data:${result.data.speech_audio_response.mime_type};base64,${result.data.speech_audio_response.audio_base64}`;
const audio = new Audio(audioSrc);
audio.play();
```

---

## 🛡️ Error Handling & HTTP Status Codes

All endpoints follow consistent REST error formats:

| HTTP Status | Meaning | Typical Cause |
| :---: | :--- | :--- |
| **`200 OK`** | Success | Request processed and valid prediction/advice returned |
| **`400 Bad Request`** | Input validation failure | Missing required fields, invalid image format, or empty file |
| **`422 Unprocessable`** | Semantic validation failure | Corrupted image or image failed quality/contrast check |
| **`503 Service Unavailable`** | Engine not loaded | Model file is missing or still training |
| **`500 Internal Error`** | Server-side exception | Unhandled error (logged with stack trace in server logs) |

### Error Response Schema
```json
{
  "detail": "Uploaded file must be a valid image format (image/jpeg, image/png)."
}
```

