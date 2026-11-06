"""
FastAPI Routes for AI Farm Doctor
"""

import json
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Dict, Any, Optional

from modules.farm_doctor.farm_doctor import FarmDoctor, get_farm_doctor
from utils.logger import get_logger

logger = get_logger("FarmDoctorRoutes")
router = APIRouter(prefix="/farm-doctor", tags=["6. AI Farm Doctor"])

# Initialize Farm Doctor instance
doctor = get_farm_doctor()


@router.get("/status", summary="Check Farm Doctor Status")
def check_status() -> Dict[str, Any]:
    """Returns Farm Doctor initialization and integration status."""
    return {
        "module": "AI Farm Doctor",
        "ready": doctor.is_ready,
        "disease_model_connected": doctor.router.disease_predictor.is_ready(),
        "pest_model_connected": doctor.router.pest_predictor.is_ready(),
        "gemini_chatbot_connected": doctor.chatbot.is_api_ready()
    }


@router.post("/diagnose", summary="Comprehensive Plant Health Diagnosis")
async def diagnose_crop(
    symptoms: str = Form(..., description="Observed plant symptoms or farmer's question"),
    crop_name: Optional[str] = Form(None, description="Name of crop (e.g. Tomato, Potato, Pepper, Maize)"),
    location: Optional[str] = Form(None, description="State / region (e.g. Karnataka, Punjab, Maharashtra)"),
    weather_json: Optional[str] = Form(None, description="JSON string of backend weather telemetry (temperature, humidity, rainfall, wind)"),
    language: Optional[str] = Form("kannada", description="Target language: kannada, english, hindi, tamil, telugu"),
    file: Optional[UploadFile] = File(None, description="Optional photo of the affected plant or pest for visual diagnosis")
) -> Dict[str, Any]:
    """
    Connects disease detection, pest identification, backend weather telemetry,
    and Gemini agricultural advisory to generate structured clinical prescriptions.
    """
    image_bytes = None
    if file:
        if not file.content_type.startswith("image/"):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Uploaded file must be an image format."
            )
        image_bytes = await file.read()

    # Safely parse backend weather telemetry if provided
    weather_data = None
    if weather_json:
        try:
            weather_data = json.loads(weather_json)
        except Exception:
            logger.warning(f"Could not parse weather_json: {weather_json}")

    try:
        report = doctor.diagnose(
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
        logger.error(f"Farm Doctor diagnosis failed: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
