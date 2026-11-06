"""
FastAPI Routes for Crop Image Classification
"""

from fastapi import APIRouter, UploadFile, File, HTTPException, status
from typing import Dict, Any

from modules.crop_classification.classifier import CropClassifier
from utils.logger import get_logger

logger = get_logger("CropRoutes")
router = APIRouter(prefix="/crop", tags=["3. Crop Image Classification"])

# Initialize crop classifier
classifier = CropClassifier()


@router.get("/status", summary="Check Crop Classification Model Status")
def check_status() -> Dict[str, Any]:
    """Returns whether the crop classification model is loaded."""
    return {
        "module": "Crop Classification",
        "model_loaded": classifier.is_model_loaded(),
        "model_path": classifier.model_path,
        "classes": classifier.class_labels
    }


@router.post("/classify", summary="Classify Crop Variety from Image")
async def classify_crop(file: UploadFile = File(...)) -> Dict[str, Any]:
    """
    Upload a crop or field photo to classify crop variety (e.g., Rice, Wheat, Corn, Cotton)
    along with confidence score distribution.
    """
    if not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File must be an image."
        )

    try:
        image_bytes = await file.read()
        result = classifier.predict_from_bytes(image_bytes)
        return {
            "success": True,
            "filename": file.filename,
            "data": result
        }
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(fnf))
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Crop classification error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

