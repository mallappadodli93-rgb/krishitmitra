# KrishiMitra (ಕೃಷಿಮಿತ್ರ) – Smart Farming Assistant 🌱🌾

> An AI-powered, farmer-centric progressive web application and full-stack machine learning suite designed to empower Indian agriculture with smart crop yield predictions, real-time leaf disease diagnosis, insect pest identification, clinical farm doctor advisory, dynamic weather insights, voice interaction, multilingual support, offline storage, farmer profile & record management, and an agronomy reminder calendar.

---

## 🌟 Key Features

### 🖥️ Frontend (PWA & Client Application)
1. **Multilingual Interface (ಕನ್ನಡ, English, हिन्दी)**:
   - Built-in language switcher with persistent user preferences in `LocalStorage`.
   - Default language: **Kannada (ಕನ್ನಡ)** with authentic agronomy terminology.
   - Comprehensive translations across navigation, dashboards, advisory tips, disease remedies, and chatbot responses.

2. **AI-Based Crop Recommendation & Planning**:
   - Location, soil type, soil pH, water availability, temperature, rainfall, and land size inputs.
   - Interactive recommendation cards displaying crop season, water requirement, duration, and farming tips.

3. **Plant Disease Detection & Camera Scanner**:
   - Dual-mode image capture: **Live Rear/Front Camera preview** (MediaDevices API) and **Photo Gallery Upload** (JPG, PNG).
   - High-confidence diagnostics identifying disease symptoms, biological treatments, and preventive measures.

4. **AI Farming Assistant Chatbot with Voice Interaction**:
   - Speech-to-Text input using browser Web Speech API with microphone control.
   - Text-to-Speech audio output reading advice aloud in Kannada, English, or Hindi.
   - Suggested farmer questions and 24/7 guided agricultural knowledge.

5. **Farmer Data Management System (IndexedDB Protected)**:
   - **Farmer Profile**: Personal details, mobile, village, district, state, and farm details (land size, soil type, irrigation source, active crops).
   - **My Farming Records**: Organized Card View and Table View for crop logs, acres cultivated, and uploaded photo records.
   - **Data Portability**: Full JSON and CSV export/import capabilities.

6. **Smart Farming Calendar & Reminders**:
   - Crop schedule generator with agronomic templates (Wheat, Chickpea, Basmati Rice, Tomato).
   - 6-Stage visual crop growth timeline (Germination, Vegetative, Tillering, Heading, Grain Filling, Maturity).
   - Reminders for **Irrigation**, **Fertilizer**, **Pest Scouting**, and **Crop Inspection**.

---

### 🧠 Backend AI & Machine Learning Services (FastAPI)
The backend service layer provides 6 unified production-ready microservice endpoints under the `/ai` prefix:

1. **`POST /ai/disease-detection`** — Deep learning crop leaf disease classification (MobileNetV2, PlantVillage: Tomato, Potato, Pepper).
2. **`POST /ai/pest-detection`** — Agricultural pest identification, damage symptoms, and IPM protocols (Fall Armyworm, Aphids, Mites, Borers).
3. **`POST /ai/yield-prediction`** — Scikit-learn Random Forest regression ($R^2 = 0.9695$) for harvest tonnage forecasting based on soil and climate.
4. **`POST /ai/chatbot`** — Multilingual farming advisor powered by Google Gemini API with CIBRC chemical safety protocols (Kannada, English, Hindi, Telugu, Tamil).
5. **`POST /ai/farm-doctor`** — Clinical diagnostic engine combining vision analysis, backend weather telemetry, and KVK/RSK escalation.
6. **`POST /ai/voice-assistant`** — End-to-end voice loop: Speech-to-Text $\rightarrow$ Gemini Chatbot $\rightarrow$ Dual Text and playable Speech Audio.

---

## 🛠️ Full-Stack Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, Vite 6, Tailwind CSS, Lucide Icons |
| **Local Storage** | IndexedDB (native wrapper) & LocalStorage (preferences) |
| **Browser APIs** | MediaDevices API, Web Speech Recognition & Synthesis, Service Worker (PWA) |
| **Backend API** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 |
| **Machine Learning** | Scikit-learn, OpenCV, TensorFlow/Keras, NumPy |
| **Generative AI** | Google Gemini API (with offline expert fallback) |
| **Documentation** | Interactive Swagger UI (`/docs`), ReDoc (`/redoc`) |

---

## 🚀 Getting Started

### 1. Start the Frontend (Vite + React)

```bash
# Install dependencies
npm install

# Start frontend development server
npm run dev
```
The frontend application will be live at `http://localhost:3000` (or `http://localhost:5173`).

---

### 2. Start the AI/ML Backend (FastAPI)

```bash
# Create and activate Python virtual environment
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate

# Install requirements
pip install -r requirements.txt

# Start FastAPI server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Once running:
- **Interactive Swagger UI**: Explore and test all 6 AI endpoints live at **[http://localhost:8000/docs](http://localhost:8000/docs)**.
- **Integration Guide**: Detailed request/response payloads and cURL examples are in [`docs/AI_API_INTEGRATION_GUIDE.md`](docs/AI_API_INTEGRATION_GUIDE.md).

---

## 📡 Core AI Endpoints Summary

| Endpoint | Method | Input Type | Description |
| :--- | :---: | :--- | :--- |
| `/ai/disease-detection` | `POST` | `multipart/form-data` | Vision leaf disease diagnosis |
| `/ai/pest-detection` | `POST` | `multipart/form-data` | Agricultural pest identification |
| `/ai/yield-prediction` | `POST` | `application/json` | Harvest tonnage forecasting |
| `/ai/chatbot` | `POST` | `application/json` | Multilingual farming advice |
| `/ai/farm-doctor` | `POST` | `multipart/form-data` | Clinical diagnosis + weather context |
| `/ai/voice-assistant` | `POST` | `multipart/form-data` | Spoken audio in $\rightarrow$ Text & Audio out |

---

## 📄 License
This project is created for the empowerment of Indian farmers and agricultural communities.
