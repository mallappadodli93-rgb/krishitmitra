"""
AgriSmart AI - FastAPI Main Application Entrypoint
Exposes all AI/ML microservices for team integration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any

from app.config import settings
from app.routes.ai_service_routes import router as ai_router
from app.routes.disease_routes import router as disease_router
from app.routes.pest_routes import router as pest_router
from app.routes.crop_routes import router as crop_router
from app.routes.yield_routes import router as yield_router
from app.routes.chatbot_routes import router as chatbot_router
from app.routes.farm_doctor_routes import router as farm_doctor_router
from app.routes.voice_routes import router as voice_router
from utils.logger import get_logger

logger = get_logger("AppMain")

# Initialize FastAPI app with rich OpenAPI/Swagger documentation
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
# 🌾 AgriSmart AI - Machine Learning Microservices Suite

Welcome to the backend AI/ML service layer for AgriSmart AI!
This API exposes 6 primary endpoints under the **`/ai`** prefix designed for easy integration by team members:

1. **`POST /ai/disease-detection`** — Deep learning crop leaf disease classification (MobileNetV2, PlantVillage).
2. **`POST /ai/pest-detection`** — Agricultural pest identification, damage analysis, and IPM protocols.
3. **`POST /ai/yield-prediction`** — Scikit-learn Random Forest regression for crop harvest yield forecasting.
4. **`POST /ai/chatbot`** — Multilingual conversational advisory via Google Gemini API (Kannada, English, Hindi, Telugu, Tamil).
5. **`POST /ai/farm-doctor`** — Clinical diagnostic engine combining vision, backend weather telemetry, and prescriptions.
6. **`POST /ai/voice-assistant`** — End-to-end voice loop (Speech-to-Text $\\rightarrow$ Chatbot $\\rightarrow$ Spoken Audio Response).

### 🛠️ Developer Notes:
- **Interactive Swagger UI**: Explore and test requests live at [`/docs`](/docs).
- **ReDoc Documentation**: Detailed schema specifications at [`/redoc`](/redoc).
- **CORS Enabled**: `Access-Control-Allow-Origin: *` is active for web browsers and mobile clients.
    """,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for seamless integration with frontend web & mobile clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 1. Primary AI Service Endpoints: /ai/*
app.include_router(ai_router)

# 2. Modular Grouped Endpoints: /api/v1/* (Backwards compatibility)
API_PREFIX = "/api/v1"
app.include_router(disease_router, prefix=API_PREFIX)
app.include_router(pest_router, prefix=API_PREFIX)
app.include_router(crop_router, prefix=API_PREFIX)
app.include_router(yield_router, prefix=API_PREFIX)
app.include_router(chatbot_router, prefix=API_PREFIX)
app.include_router(farm_doctor_router, prefix=API_PREFIX)
app.include_router(voice_router, prefix=API_PREFIX)


@app.get("/", summary="Root Health & Directory")
def root() -> Dict[str, Any]:
    """Root endpoint welcoming developers and providing API navigation links."""
    return {
        "status": "online",
        "project": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "interactive_docs": "/docs",
        "redoc_docs": "/redoc",
        "primary_ai_endpoints": {
            "disease_detection": "POST /ai/disease-detection",
            "pest_detection": "POST /ai/pest-detection",
            "yield_prediction": "POST /ai/yield-prediction",
            "chatbot": "POST /ai/chatbot",
            "farm_doctor": "POST /ai/farm-doctor",
            "voice_assistant": "POST /ai/voice-assistant"
        }
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
