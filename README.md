# 🌱 AgriSmart AI — AI & Machine Learning Module

An end-to-end AI and Machine Learning backend engine built for **AgriSmart AI** (Hackathon Project).

This repository contains **strictly the AI/ML services and FastAPI endpoints** that expose intelligent agricultural capabilities to frontend and mobile development teammates.

---

## 📋 Table of Contents
- [Project Overview](#-project-overview)
- [Module Architecture & Folder Structure](#-module-architecture--folder-structure)
- [Detailed File Guide](#-detailed-file-guide)
- [Tech Stack & Responsibilities](#-tech-stack--responsibilities)
- [Quick Start & Setup](#-quick-start--setup)
- [API Documentation & Endpoints](#-api-documentation--endpoints)
- [Multilingual Support](#-multilingual-support)
- [Security & Best Practices](#-security--best-practices)
- [Next Steps (Model Training)](#-next-steps-model-training)

---

## 🌾 Project Overview

The AI/ML module delivers 10 core agricultural capabilities:
1. **Crop Disease Detection**: Leaf image diagnosis using TensorFlow/Keras & OpenCV.
2. **Pest Identification**: Insect identification from farm photos with damage analysis.
3. **Crop Image Classification**: Automated crop variety classification from images.
4. **Crop Yield Prediction**: Tabular regression based on climate, soil, area, and inputs using Scikit-learn.
5. **AI Farming Chatbot**: Intelligent Q&A engine powered by Google Gemini API.
6. **AI Farm Doctor**: Clinical plant health pathology reports with emergency first-aid and prescriptions.
7. **Voice Question Understanding**: Transcribes farmer audio in native dialects.
8. **Multilingual Responses**: Native support for **Kannada (ಕನ್ನಡ)**, **English**, **Hindi (हिन्दी)**, **Tamil (தமிழ்)**, and **Telugu (తెలుగు)**.
9. **Confidence Scores**: Exact probability and confidence metrics for all classifications.
10. **Actionable Recommendations**: Scientifically grounded organic, cultural, and chemical prevention measures.

---

## 📁 Module Architecture & Folder Structure

```text
AgriSmart-AI/
├── .env.example                               # Environment template for API keys & settings
├── .gitignore                                 # Prevents credentials, models, and cache from being committed
├── README.md                                  # Complete architecture & developer documentation
├── requirements.txt                           # Python project dependencies
│
├── app/                                       # FastAPI Web Service
│   ├── __init__.py
│   ├── config.py                              # Environment configuration loader
│   ├── main.py                                # App entrypoint, CORS setup, and router mounting
│   └── routes/                                # API Endpoint Controllers
│       ├── __init__.py
│       ├── disease_routes.py                  # Endpoints: /api/v1/disease/*
│       ├── pest_routes.py                     # Endpoints: /api/v1/pest/*
│       ├── crop_routes.py                     # Endpoints: /api/v1/crop/*
│       ├── yield_routes.py                    # Endpoints: /api/v1/yield/*
│       ├── chatbot_routes.py                  # Endpoints: /api/v1/chatbot/*
│       ├── farm_doctor_routes.py              # Endpoints: /api/v1/farm-doctor/*
│       └── voice_routes.py                    # Endpoints: /api/v1/voice/*
│
├── modules/                                   # Dedicated AI/ML Domain Modules
│   ├── __init__.py
│   ├── disease_detection/                     # 1. Crop Disease Detection Module
│   │   ├── __init__.py
│   │   ├── detector.py                        # TensorFlow/Keras inference + confidence scoring
│   │   ├── recommendations.py                 # Disease prevention & treatment knowledge base
│   │   └── train_disease_model.py             # Model training script template
│   │
│   ├── pest_identification/                   # 2. Pest Identification Module
│   │   ├── __init__.py
│   │   ├── identifier.py                      # TF/Keras inference for agricultural pests
│   │   ├── recommendations.py                 # Integrated Pest Management (IPM) guidelines
│   │   └── train_pest_model.py                # Pest training script template
│   │
│   ├── crop_classification/                   # 3. Crop Classification Module
│   │   ├── __init__.py
│   │   ├── classifier.py                      # Crop variety image classifier
│   │   └── train_crop_model.py                # Crop classification training script template
│   │
│   ├── yield_prediction/                      # 4. Crop Yield Prediction Module
│   │   ├── __init__.py
│   │   ├── predictor.py                       # Scikit-learn regression inference engine
│   │   └── train_yield_model.py               # Tabular model training pipeline (RandomForest)
│   │
│   ├── chatbot/                               # 5. AI Farming Chatbot Module
│   │   ├── __init__.py
│   │   ├── bot.py                             # Google Gemini API agronomic prompt handler
│   │   └── languages.py                       # Multilingual prompt configurations
│   │
│   ├── farm_doctor/                           # 6. AI Farm Doctor Module
│   │   ├── __init__.py
│   │   └── doctor.py                          # Clinical plant health diagnosis & prescription
│   │
│   └── voice_assistant/                       # 7. Voice Understanding Module
│       ├── __init__.py
│       └── voice_processor.py                 # Speech-to-text processing for regional languages
│
├── saved_models/                              # Serialized Model Weights (.keras, .h5, .pkl)
│   ├── disease_models/
│   ├── pest_models/
│   ├── crop_models/
│   └── yield_models/
│
├── data/                                      # Datasets directory (Raw & Processed)
│   ├── raw/
│   └── processed/
│
└── utils/                                     # Shared Helper Utilities
    ├── __init__.py
    ├── image_utils.py                         # OpenCV image decoding, resizing, and normalization
    └── logger.py                              # Centralized logging configuration
```

---

## 📖 Detailed File Guide

### Root Files
| File | Description |
| :--- | :--- |
| `.env.example` | Template detailing all necessary environment variables (e.g. `GEMINI_API_KEY`, model paths). Copy to `.env` before running. |
| `.gitignore` | Prevents secrets (`.env`), dataset folders (`data/raw/*`), and heavy model weight binaries from being committed to Git. |
| `requirements.txt` | Lists all necessary Python packages with version constraints. |
| `README.md` | Comprehensive architectural documentation and integration guide for teammates. |

### `app/` (FastAPI Service Layer)
| File | Description |
| :--- | :--- |
| `app/config.py` | Central configuration object (`Settings`) reading strictly from `.env` using `python-dotenv`. |
| `app/main.py` | Initializes FastAPI, adds permissive CORS for web/mobile team members, mounts all modular sub-routers, and defines root health checks. |
| `app/routes/disease_routes.py` | Exposes `/api/v1/disease/detect` for leaf image upload and `/api/v1/disease/recommendations/{disease_name}`. |
| `app/routes/pest_routes.py` | Exposes `/api/v1/pest/identify` and `/api/v1/pest/recommendations/{pest_name}`. |
| `app/routes/crop_routes.py` | Exposes `/api/v1/crop/classify` to recognize crop species from photographs. |
| `app/routes/yield_routes.py` | Exposes `/api/v1/yield/predict` using Pydantic JSON input payloads for tabular yield regression. |
| `app/routes/chatbot_routes.py` | Exposes `/api/v1/chatbot/ask` for farming Q&A and `/api/v1/chatbot/languages` for supported regional languages. |
| `app/routes/farm_doctor_routes.py` | Exposes `/api/v1/farm-doctor/diagnose` supporting multimodal (text symptoms + photo upload) clinical plant health checks. |
| `app/routes/voice_routes.py` | Exposes `/api/v1/voice/transcribe` and an end-to-end `/api/v1/voice/ask-voice` pipeline (farmer audio in -> advice out). |

### `modules/` (Core AI/ML Algorithms)
| Module / File | Description |
| :--- | :--- |
| `disease_detection/detector.py` | Decodes uploaded leaf images using OpenCV, scales them, and runs inference with a TensorFlow/Keras model. Calculates class probabilities and exact confidence scores. |
| `disease_detection/recommendations.py` | Structured knowledge base providing preventative cultural practices, bio-fungicides/organic remedies, and approved chemical treatments. |
| `disease_detection/train_disease_model.py` | Training template utilizing MobileNetV2 transfer learning on crop disease datasets. |
| `pest_identification/identifier.py` | Deep learning classifier using TensorFlow/Keras and OpenCV to classify agricultural pests and report confidence percentages. |
| `pest_identification/recommendations.py` | Integrated Pest Management (IPM) knowledge base covering biological control (predatory insects, bio-pesticides) and chemical control. |
| `pest_identification/train_pest_model.py` | Training pipeline for insect pest recognition. |
| `crop_classification/classifier.py` | Identifies crop species (Rice, Wheat, Corn, Cotton, Sugarcane, etc.) from field images with confidence distributions. |
| `crop_classification/train_crop_model.py` | CNN training script template for crop classification. |
| `yield_prediction/predictor.py` | Scikit-learn tabular regression inference engine that estimates metric tons per hectare and total farm output based on environmental and input parameters. |
| `yield_prediction/train_yield_model.py` | Scikit-learn training script using `Pipeline`, `ColumnTransformer`, `StandardScaler`, `OneHotEncoder`, and `RandomForestRegressor`. Evaluates with R², MAE, and RMSE. |
| `chatbot/bot.py` | Integrates Google Gemini API with agricultural system instructions, enforcing multilingual outputs in Indian regional languages. |
| `chatbot/languages.py` | Configures language instructions, ISO codes, and native representations for Kannada, English, Hindi, Tamil, and Telugu. |
| `farm_doctor/doctor.py` | Clinical diagnostic engine producing comprehensive reports (diagnosis, severity level, immediate emergency actions, and organic/chemical prescriptions). Supports multimodal image input. |
| `voice_assistant/voice_processor.py` | Transcribes farmer audio recordings into text using Gemini's multimodal audio perception or SpeechRecognition. |

### `utils/` (Shared Helpers)
| File | Description |
| :--- | :--- |
| `utils/image_utils.py` | Contains OpenCV helpers: `decode_image_bytes` (decodes raw byte stream into OpenCV BGR matrix) and `preprocess_for_model` (BGR to RGB, resizing, normalization, batch expansion). |
| `utils/logger.py` | Standardized application logger with formatting and timestamps. |

---

## 🛠️ Tech Stack & Responsibilities

| Technology | Purpose in Project |
| :--- | :--- |
| **Python 3.10+** | Core programming language for all AI/ML modules. |
| **TensorFlow / Keras** | Image classification models (Crop Disease, Pest Identification, Crop Classification). |
| **OpenCV (`cv2`)** | Image decoding, color transformations (BGR -> RGB), resizing, and computer vision preprocessing. |
| **Scikit-learn** | Tabular regression pipeline for Crop Yield Prediction (`Pipeline`, `RandomForestRegressor`). |
| **Google Gemini API** | Natural language reasoning for the AI Farming Chatbot, AI Farm Doctor, and multilingual advisory. |
| **FastAPI + Uvicorn** | High-performance asynchronous API server exposing endpoints to frontend/mobile teammates. |
| **Pydantic** | Strict data validation and schema documentation for requests and responses. |

---

## 🚀 Quick Start & Setup

### 1. Clone & Navigate to Repository
```bash
cd AgriSmart-AI
```

### 2. Create and Activate Virtual Environment
```bash
# Windows (PowerShell)
python -m venv venv
.\venv\Scripts\Activate.ps1

# Linux / macOS
python3 -m venv venv
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Open `.env` and set your secret Google Gemini API key:
```env
GEMINI_API_KEY=AIzaSy...your_actual_key_here
```
> **Security Notice**: Never commit your `.env` file or hardcode secret keys into Python code!

### 5. Launch the FastAPI AI Server
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
Once started, the API is available at:
- **Root URL**: `http://localhost:8000/`
- **Interactive Swagger Docs**: `http://localhost:8000/docs`
- **Alternative ReDoc UI**: `http://localhost:8000/redoc`

---

## 🌐 API Documentation & Endpoints

All endpoints are prefixed with `/api/v1`:

### 1. Crop Disease Detection
- `POST /api/v1/disease/detect` (Multipart Form: `file` image)
  - Returns: Predicted disease, confidence score, confidence percentage, prevention advice, organic and chemical treatments.
- `GET /api/v1/disease/recommendations/{disease_name}`
- `GET /api/v1/disease/status`

### 2. Pest Identification
- `POST /api/v1/pest/identify` (Multipart Form: `file` image)
  - Returns: Pest name, confidence score, damage symptoms, biological control, and chemical options.
- `GET /api/v1/pest/recommendations/{pest_name}`
- `GET /api/v1/pest/status`

### 3. Crop Classification
- `POST /api/v1/crop/classify` (Multipart Form: `file` image)
  - Returns: Crop variety name and full confidence score distribution.
- `GET /api/v1/crop/status`

### 4. Crop Yield Prediction
- `POST /api/v1/yield/predict` (JSON Payload)
  ```json
  {
    "crop": "Rice",
    "season": "Kharif",
    "state": "Karnataka",
    "area_hectares": 2.5,
    "rainfall_mm": 1200.0,
    "fertilizer_kg": 150.0,
    "pesticide_kg": 12.5,
    "temperature_celsius": 28.5
  }
  ```
  - Returns: `predicted_yield_per_hectare_tons`, `total_estimated_production_tons`.
- `GET /api/v1/yield/status`

### 5. AI Farming Chatbot (Gemini)
- `POST /api/v1/chatbot/ask` (JSON Payload)
  ```json
  {
    "question": "ಟೊಮೆಟೊ ಗಿಡಗಳಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
    "language": "kannada"
  }
  ```
  - Returns: AI answer in requested regional language.
- `GET /api/v1/chatbot/languages`

### 6. AI Farm Doctor
- `POST /api/v1/farm-doctor/diagnose` (Multipart Form: `symptoms`, optional `crop_name`, optional `language`, optional `file` image)
  - Returns: Structured clinical report (Diagnosis, Severity, Immediate Emergency Care, Organic Remedies, Chemical Solutions, Long-term Prevention).

### 7. Voice Question Understanding
- `POST /api/v1/voice/transcribe` (Multipart Form: `file` audio, `language_hint`)
  - Returns: Transcribed text in regional language.
- `POST /api/v1/voice/ask-voice` (Multipart Form: `file` audio, `language`)
  - Transcribes spoken audio question and returns both transcription and chatbot advisory in one call.

---

## 🗣️ Multilingual Support

The AI Chatbot and Farm Doctor modules support 5 key languages:
- **Kannada (ಕನ್ನಡ)** (`kannada` / `kn`)
- **English** (`english` / `en`)
- **Hindi (हिन्दी)** (`hindi` / `hi`)
- **Tamil (தமிழ்)** (`tamil` / `ta`)
- **Telugu (తెలుగు)** (`telugu` / `te`)

Language instructions are managed centrally in `modules/chatbot/languages.py`.

---

## 🔒 Security & Best Practices
- **No Hardcoded Secrets**: All API tokens are read from environment variables via `app/config.py`.
- **No Fake Predictions**: Detection and classification modules require actual model weights and will not fabricate synthetic predictions. When models are not yet trained, endpoints return explicit HTTP 503 notifications explaining how to train them.
- **CORS Enabled**: Cross-Origin Resource Sharing is configured in `app/main.py` so web and mobile frontend teammates can query the endpoints without origin blocking.

---

## ⏳ Next Steps (Model Training)

When ready to train models:
1. **Crop Disease Model**: Place images in `data/raw/crop_diseases/<class_name>/` and run:
   ```bash
   python modules/disease_detection/train_disease_model.py
   ```
2. **Pest Model**: Place images in `data/raw/pests/<class_name>/` and run:
   ```bash
   python modules/pest_identification/train_pest_model.py
   ```
3. **Crop Classifier**: Place images in `data/raw/crop_types/<class_name>/` and run:
   ```bash
   python modules/crop_classification/train_crop_model.py
   ```
4. **Crop Yield Pipeline**: Place tabular CSV in `data/raw/crop_yield.csv` and run:
   ```bash
   python modules/yield_prediction/train_yield_model.py
   ```

