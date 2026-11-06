"""
FastAPI Routes for Crop Disease Detection
Modular endpoint exposing Tomato, Potato, and Pepper disease classification.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Dict, Any

from modules.disease_detection.prediction import predictor, predict
from modules.disease_detection.recommendations import get_disease_recommendations
from utils.logger import get_logger

logger = get_logger("DiseaseRoutes")
router = APIRouter(prefix="/disease", tags=["1. Crop Disease Detection"])


@router.get("/status", summary="Check Crop Disease Model Status")
def check_status() -> Dict[str, Any]:
    """Returns model loading status, supported crops, and classes."""
    return {
        "module": "Crop Disease Detection",
        "model_loaded": predictor.is_ready(),
        "model_path": predictor.model_path,
        "supported_crops": ["Tomato", "Potato", "Pepper (Bell)"],
        "confidence_threshold": predictor.confidence_threshold,
        "classes": predictor.class_labels
    }


@router.post("/detect", summary="Detect Crop Disease from Leaf Image")
async def detect_disease(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a leaf photograph to:
    1. Validate image quality and color variance (rejects invalid/blank/non-leaf images).
    2. Classify crop (Tomato, Potato, Pepper) and specific disease (or Healthy Leaf).
    3. Calculate prediction confidence scores and top predictions.
    4. Communicate uncertainty if confidence is below threshold.
    5. Provide actionable prevention and treatment recommendations.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WebP)."
        )

    try:
        image_bytes = await file.read()
        result = predict(image_bytes)

        # Handle rejection of invalid/blank images
        if result.get("status") == "rejected":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("message")
            )

        # Handle model not ready (no synthetic/fake predictions)
        if result.get("status") == "model_not_ready":
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=result.get("message")
            )

        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Disease detection error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.get("/recommendations/{disease_name}", summary="Get Disease Prevention Recommendations")
def get_recommendations(disease_name: str) -> Dict[str, Any]:
    """Directly fetch agronomic prevention, organic, and chemical control guidance for a disease."""
    return get_disease_recommendations(disease_name)

    """Directly fetch agronomic prevention, organic, and chemical control guidance for a disease."""
    return get_disease_recommendations(disease_name)

