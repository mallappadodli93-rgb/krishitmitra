"""
AgriSmart AI - Unified AI/ML Microservice Routes (/ai)
Exposes the core machine learning endpoints requested for team integration:
1. POST /ai/disease-detection  - Vision-based crop leaf disease detection & severity
2. POST /ai/pest-detection     - Agricultural pest identification & IPM guidelines
3. POST /ai/yield-prediction   - Tabular Random Forest crop harvest yield forecasting
4. POST /ai/chatbot            - Multilingual Gemini conversational farming advisor
5. POST /ai/farm-doctor        - Integrated clinical diagnostics (Vision + Weather + Prescriptions)
6. POST /ai/voice-assistant    - End-to-end voice loop (Speech-in -> Chatbot -> Text & Speech-out)

Designed for easy integration with frontend web, mobile apps, and backend services.
"""

import json
from typing import Dict, Any, Optional, List
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from pydantic import BaseModel, Field

# Model & Engine Singletons
from modules.disease_detection.prediction import predictor as disease_predictor
from modules.pest_identification.prediction import predictor as pest_predictor
from modules.yield_prediction.prediction import get_yield_predictor
from modules.chatbot.chatbot import get_agri_chatbot
from modules.farm_doctor.farm_doctor import get_farm_doctor
from modules.voice_assistant.voice_assistant import get_voice_assistant
from utils.logger import get_logger

logger = get_logger("AIServiceRoutes")

router = APIRouter(prefix="/ai", tags=["AgriSmart AI Core Microservices"])

# Lazy singletons
yield_predictor = get_yield_predictor()
chatbot_engine = get_agri_chatbot()
farm_doctor_engine = get_farm_doctor()
voice_assistant_engine = get_voice_assistant()


def _safe_read_upload_file(upload_file: UploadFile) -> bytes:
    """
    Safely reads bytes from an UploadFile without threadpool blocking.
    Directly accesses the underlying synchronous SpooledTemporaryFile or BytesIO.
    """
    if hasattr(upload_file, "file") and hasattr(upload_file.file, "read"):
        content = upload_file.file.read()
        if isinstance(content, bytes):
            return content
        elif isinstance(content, str):
            return content.encode("utf-8")
    return b""


# =========================================================================
# PYDANTIC SCHEMAS WITH COMPREHENSIVE SWAGGER EXAMPLES
# =========================================================================

class YieldPredictionPayload(BaseModel):
    """Input payload for tabular machine learning crop yield prediction."""
    crop: str = Field(..., example="Rice", description="Crop variety (e.g. Rice, Wheat, Maize, Cotton, Sugarcane, Tomato, Potato)")
    location: str = Field(..., example="Karnataka", description="State or agricultural district")
    land_area_hectares: float = Field(..., gt=0, example=3.0, description="Total cultivated land area in hectares (> 0)")
    rainfall_mm: float = Field(..., ge=0, example=1150.0, description="Annual or seasonal rainfall in mm")
    temperature_celsius: float = Field(26.5, example=26.5, description="Mean temperature during growing season in °C")
    soil_type: Optional[str] = Field("Clay Loam", example="Clay Loam", description="Soil type: Alluvial, Black Soil, Red Soil, Clay Loam, Sandy Loam, Laterite")
    soil_ph: Optional[float] = Field(6.2, ge=4.0, le=9.0, example=6.2, description="Soil pH level (acidity/alkalinity)")
    season: Optional[str] = Field("Kharif", example="Kharif", description="Cropping season: Kharif, Rabi, Summer, Whole Year")
    fertilizer_kg: Optional[float] = Field(None, ge=0, example=330.0, description="Applied fertilizer in kg (estimated automatically if omitted)")
    pesticide_kg: Optional[float] = Field(None, ge=0, example=10.5, description="Applied pesticide in kg (estimated automatically if omitted)")

    model_config = {
        "json_schema_extra": {
            "example": {
                "crop": "Rice",
                "location": "Karnataka",
                "land_area_hectares": 3.0,
                "rainfall_mm": 1150.0,
                "temperature_celsius": 26.5,
                "soil_type": "Clay Loam",
                "soil_ph": 6.2,
                "season": "Kharif",
                "fertilizer_kg": 330.0,
                "pesticide_kg": 10.5
            }
        }
    }


class ChatbotQueryPayload(BaseModel):
    """Input payload for the Gemini multilingual agricultural chatbot."""
    question: str = Field(..., min_length=2, example="ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಉತ್ತಮ ಇಳುವರಿ ಬರಲು ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?", description="Farmer's question in natural language")
    language: Optional[str] = Field("kannada", example="kannada", description="Target language: kannada, english, hindi, telugu, tamil")
    conversation_history: Optional[List[Dict[str, Any]]] = Field(
        None,
        description="Optional list of prior conversation turns for multi-turn conversational context"
    )

    model_config = {
        "json_schema_extra": {
            "example": {
                "question": "What is the best irrigation schedule for maize during flowering?",
                "language": "english",
                "conversation_history": None
            }
        }
    }


# =========================================================================
# 1. POST /ai/disease-detection
# =========================================================================
@router.post(
    "/disease-detection",
    summary="Detect Crop Leaf Disease from Image",
    response_description="Structured diagnosis, confidence score, and preventive recommendations"
)
def detect_crop_disease(
    image: UploadFile = File(..., description="Photograph of affected plant leaf (JPG or PNG format)")
) -> Dict[str, Any]:
    """
    **Crop Disease Detection Microservice**:
    - Accepts an uploaded leaf photograph.
    - Validates image resolution ($\ge 64\\times64$) and contrast using OpenCV.
    - Runs MobileNetV2 deep learning inference trained on PlantVillage.
    - Supports Tomato, Potato, and Pepper (Bell) across 15 healthy and diseased classes.
    - Returns diagnosis, confidence score, and ICAR-benchmarked preventive recommendations.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (image/jpeg, image/png)."
        )

    image_bytes = _safe_read_upload_file(image)
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty (0 bytes)."
        )

    try:
        diagnosis = disease_predictor.predict_image(image_bytes)
        status_code = status.HTTP_200_OK
        if diagnosis.get("status") == "error":
            status_code = status.HTTP_422_UNPROCESSABLE_ENTITY

        return {
            "success": diagnosis.get("status") in ("success", "model_not_ready"),
            "filename": image.filename,
            "data": diagnosis
        }
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =========================================================================
# 2. POST /ai/pest-detection
# =========================================================================
@router.post(
    "/pest-detection",
    summary="Identify Agricultural Pests from Image",
    response_description="Identified pest species, confidence score, affected crops, and IPM guidelines"
)
def detect_agricultural_pest(
    image: UploadFile = File(..., description="Photograph of insect or crop pest damage (JPG or PNG format)")
) -> Dict[str, Any]:
    """
    **Agricultural Pest Identification Microservice**:
    - Identifies major agricultural pests (Fall Armyworm, Aphids, Whiteflies, Stem Borers, Spider Mites, Bollworms, Thrips).
    - Detects unknown / unsupported insect categories safely without hallucinating.
    - Returns pest name, scientific name, confidence score, susceptible crops, and IPM control protocols.
    """
    if not image.content_type or not image.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be an image format (image/jpeg, image/png)."
        )

    image_bytes = _safe_read_upload_file(image)
    if len(image_bytes) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded image file is empty (0 bytes)."
        )

    try:
        pest_result = pest_predictor.predict_image(image_bytes)
        return {
            "success": pest_result.get("status") in ("success", "model_not_ready"),
            "filename": image.filename,
            "data": pest_result
        }
    except Exception as e:
        logger.error(f"Pest detection error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =========================================================================
# 3. POST /ai/yield-prediction
# =========================================================================
@router.post(
    "/yield-prediction",
    summary="Forecast Crop Harvest Yield using Machine Learning",
    response_description="Estimated harvest yield in Metric Tons per Hectare and Quintals per Acre"
)
def predict_crop_yield(payload: YieldPredictionPayload) -> Dict[str, Any]:
    """
    **Crop Yield Prediction Microservice**:
    - Preprocesses missing values and categorical features using Scikit-learn Pipeline.
    - Predicts harvest tonnage using a Random Forest Regressor ($R^2 = 0.9695$, evaluated against baselines).
    - Accepts crop, location, area, rainfall, temperature, soil type, and soil pH.
    - Returns estimated yield per hectare, total farm production, and explicit agronomic disclaimer.
    """
    if not yield_predictor.is_model_loaded():
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Trained yield model pipeline is not yet loaded on server."
        )

    try:
        forecast = yield_predictor.predict(
            crop=payload.crop,
            location=payload.location,
            area_hectares=payload.land_area_hectares,
            rainfall_mm=payload.rainfall_mm,
            temperature_celsius=payload.temperature_celsius,
            soil_type=payload.soil_type,
            soil_ph=payload.soil_ph,
            season=payload.season,
            fertilizer_kg=payload.fertilizer_kg,
            pesticide_kg=payload.pesticide_kg
        )
        return {
            "success": True,
            "data": forecast
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Yield prediction error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =========================================================================
# 4. POST /ai/chatbot
# =========================================================================
@router.post(
    "/chatbot",
    summary="Ask Agricultural Chatbot (Multilingual Gemini API)",
    response_description="Expert agronomic answer in Kannada, English, Hindi, Telugu, or Tamil"
)
def ask_agricultural_chatbot(payload: ChatbotQueryPayload) -> Dict[str, Any]:
    """
    **Multilingual AI Farming Chatbot Microservice**:
    - Powered by the official Google Gemini API (with robust offline expert fallback).
    - Answers questions on crops, soil, pests, diseases, irrigation, and fertilizers.
    - Supports Kannada (ಕನ್ನಡ), English, Hindi (हिन्दी), Telugu (తెలుగు), and Tamil (தமிழ்).
    - Strictly enforces chemical safety rules: never invents dosages, mandates protective gear.
    - Preserves multi-turn conversation memory through `conversation_history`.
    """
    try:
        response = chatbot_engine.ask(
            question=payload.question,
            language=payload.language or "kannada",
            conversation_history=payload.conversation_history
        )
        return {
            "success": True,
            "data": response
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Chatbot query error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =========================================================================
# 5. POST /ai/farm-doctor
# =========================================================================
@router.post(
    "/farm-doctor",
    summary="Comprehensive AI Farm Doctor Clinical Diagnosis",
    response_description="Integrated clinical report combining vision analysis, weather telemetry, and prescriptions"
)
def consult_farm_doctor(
    symptoms: str = Form(..., description="Farmer's question or observed plant symptoms"),
    crop_name: Optional[str] = Form(None, description="Affected crop variety (e.g. Tomato, Potato, Pepper, Maize)"),
    location: Optional[str] = Form("Karnataka", description="State or agricultural district"),
    weather_json: Optional[str] = Form(None, description="Optional backend weather telemetry as JSON string (temperature, humidity, rainfall, wind)"),
    language: Optional[str] = Form("kannada", description="Target response language: kannada, english, hindi, tamil, telugu"),
    image: Optional[UploadFile] = File(None, description="Optional photo of affected crop leaf or pest damage")
) -> Dict[str, Any]:
    """
    **AI Farm Doctor Microservice**:
    - Integrates the Crop Disease Model, Pest Model, Gemini Chatbot, and Backend Weather Telemetry.
    - Evaluates epidemiological risk: high humidity ($>75\%$) + warm temp triggers fungal blight alert.
    - Never invents weather data if not provided by backend.
    - Emits structured 7-part prescription: Diagnosis, Severity, Weather Impact, First-Aid, Organic, Chemical, and Prevention.
    - **Recommends consulting local Krishi Vigyan Kendra (KVK) / Raitha Samparka Kendra (RSK) when confidence is below 60%.**
    """
    image_bytes = None
    if image:
        if not image.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be a valid image format (image/jpeg, image/png)."
            )
        image_bytes = _safe_read_upload_file(image)

    weather_data = None
    if weather_json:
        try:
            weather_data = json.loads(weather_json)
        except Exception:
            logger.warning(f"Could not parse weather_json: {weather_json}")

    try:
        report = farm_doctor_engine.diagnose(
            image_bytes=image_bytes,
            question=symptoms,
            crop_name=crop_name,
            location=location,
            weather_data=weather_data,
            language=language or "kannada"
        )
        return {
            "success": True,
            "data": report
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Farm Doctor diagnosis error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


# =========================================================================
# 6. POST /ai/voice-assistant
# =========================================================================
@router.post(
    "/voice-assistant",
    summary="Multilingual Voice AI Loop (Speech in -> Text & Audio out)",
    response_description="Spoken audio transcription, agricultural advice text, and synthesized voice audio payload"
)
def process_voice_assistant_query(
    audio_file: UploadFile = File(..., description="Farmer's voice audio recording (.wav, .mp3, .ogg, .webm)"),
    language: Optional[str] = Form("kannada", description="Language spoken by farmer: kannada, english, hindi, telugu, tamil")
) -> Dict[str, Any]:
    """
    **Multilingual Voice AI Assistant Microservice**:
    - Converts farmer's spoken audio into written text across 5 Indian languages.
    - Consults the Gemini agricultural expert in the farmer's native dialect.
    - Synthesizes the response into playable speech audio (WAV / MP3).
    - Gracefully handles silence and corrupted audio with empathetic native voice guidance.
    """
    audio_bytes = _safe_read_upload_file(audio_file)
    mime_type = audio_file.content_type or "audio/wav"

    try:
        voice_result = voice_assistant_engine.process_voice_query(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            language=language or "kannada"
        )
        return {
            "success": voice_result.get("status") == "success",
            "filename": audio_file.filename,
            "data": voice_result
        }
    except Exception as e:
        logger.error(f"Voice assistant processing error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
