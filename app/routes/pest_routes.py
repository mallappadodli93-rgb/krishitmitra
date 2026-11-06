"""
FastAPI Routes for Agricultural Pest Identification
Exposes endpoints for insect identification, confidence scoring,
affected crops, and IPM management protocols.
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Dict, Any

from modules.pest_identification.prediction import pest_predictor, identify_pest
from modules.pest_identification.pest_data import get_pest_info, PEST_KNOWLEDGE_BASE
from utils.logger import get_logger

logger = get_logger("PestRoutes")
router = APIRouter(prefix="/pest", tags=["2. Pest Identification"])


@router.get("/status", summary="Check Pest Model Status")
def check_status() -> Dict[str, Any]:
    """Returns pest model readiness, supported categories, and threshold settings."""
    return {
        "module": "Pest Identification",
        "model_loaded": pest_predictor.is_ready(),
        "model_path": pest_predictor.model_path,
        "confidence_threshold": pest_predictor.confidence_threshold,
        "supported_pests": list(PEST_KNOWLEDGE_BASE.keys())
    }


@router.get("/supported-pests", summary="List Supported Agricultural Pests & Affected Crops")
def list_supported_pests() -> Dict[str, Any]:
    """Lists all supported pests, scientific names, and susceptible crops."""
    return {
        "total_supported": len(PEST_KNOWLEDGE_BASE),
        "pests": [
            {
                "key": key,
                "name": data["display_name"],
                "scientific_name": data["scientific_name"],
                "affected_crops": data["affected_crops"],
                "threat_level": data["threat_level"]
            }
            for key, data in PEST_KNOWLEDGE_BASE.items()
        ]
    }


@router.get("/details/{pest_name}", summary="Get Complete Pest Agronomic Profile")
def get_pest_details(pest_name: str) -> Dict[str, Any]:
    """Returns affected crops, damage symptoms, economic threshold, and IPM measures."""
    return get_pest_info(pest_name)


@router.post("/identify", summary="Identify Insect Pest from Photograph")
async def identify_pest_endpoint(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload an insect or damaged crop image to:
    1. Validate image resolution and contrast (rejects blank/invalid files).
    2. Classify pest species and compute prediction confidence.
    3. Detect unknown/unsupported categories if confidence is below threshold.
    4. Provide susceptible crops, damage symptoms, and IPM recommendations.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Uploaded file must be a valid image format (JPEG, PNG, WebP)."
        )

    try:
        image_bytes = await file.read()
        result = identify_pest(image_bytes)

        if result.get("status") == "rejected":
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=result.get("message")
            )

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
        logger.error(f"Pest identification error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
