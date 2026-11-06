"""
FastAPI Routes for Crop Yield Prediction
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional

from modules.yield_prediction.prediction import CropYieldPredictor, get_yield_predictor
from utils.logger import get_logger

logger = get_logger("YieldRoutes")
router = APIRouter(prefix="/yield", tags=["4. Crop Yield Prediction"])

# Initialize yield predictor
predictor = get_yield_predictor()


class YieldPredictionRequest(BaseModel):
    """Pydantic schema defining input features for crop yield prediction."""
    crop: str = Field(..., example="Rice", description="Crop name (e.g. Rice, Wheat, Maize, Cotton, Sugarcane, Tomato)")
    location: Optional[str] = Field(None, example="Karnataka", description="State or agricultural region")
    state: Optional[str] = Field(None, example="Karnataka", description="Alias for location")
    season: Optional[str] = Field("Kharif", example="Kharif", description="Cropping season (Kharif, Rabi, Summer, Whole Year)")
    area_hectares: float = Field(..., gt=0, example=2.5, description="Cultivated land area in hectares")
    rainfall_mm: float = Field(..., ge=0, example=1200.0, description="Annual or seasonal rainfall in mm")
    temperature_celsius: Optional[float] = Field(28.0, example=28.5, description="Average temperature during growing season")
    soil_type: Optional[str] = Field(None, example="Clay Loam", description="Soil classification (Alluvial, Black Soil, Red Soil, Clay Loam, Sandy Loam, Laterite)")
    soil_ph: Optional[float] = Field(None, ge=3.5, le=10.0, example=6.5, description="Soil pH acidity/alkalinity level")
    fertilizer_kg: Optional[float] = Field(None, ge=0, example=150.0, description="Total fertilizer used in kg")
    pesticide_kg: Optional[float] = Field(None, ge=0, example=12.5, description="Total pesticide used in kg")


@router.get("/status", summary="Check Yield Prediction Model Status")
def check_status() -> Dict[str, Any]:
    """Returns status of the Scikit-learn tabular regression pipeline."""
    return {
        "module": "Crop Yield Prediction",
        "model_loaded": predictor.is_model_loaded(),
        "model_path": predictor.model_path,
        "framework": "Scikit-learn"
    }


@router.post("/predict", summary="Predict Crop Harvest Yield")
def predict_yield(payload: YieldPredictionRequest) -> Dict[str, Any]:
    """
    Submits agronomic, soil, and climatic parameters to forecast crop yield
    in metric tons per hectare and total farm harvest volume.
    """
    try:
        result = predictor.predict(
            crop=payload.crop,
            location=payload.location,
            state=payload.state,
            season=payload.season,
            area_hectares=payload.area_hectares,
            rainfall_mm=payload.rainfall_mm,
            temperature_celsius=payload.temperature_celsius if payload.temperature_celsius is not None else 28.0,
            soil_type=payload.soil_type,
            soil_ph=payload.soil_ph,
            fertilizer_kg=payload.fertilizer_kg,
            pesticide_kg=payload.pesticide_kg
        )
        return {
            "success": True,
            "data": result
        }
    except FileNotFoundError as fnf:
        raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(fnf))
    except Exception as e:
        logger.error(f"Yield prediction error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
