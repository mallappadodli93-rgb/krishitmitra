"""
Crop Recommendation API Router for AgriSmart AI.
Provides location- and agro-climatic-based crop suitability recommendations.
"""
import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ApiResponse, CropRecommendationRequest, CropRecommendationResponse
from app.services.crop_service import recommend_crops_service
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.CropsRouter")

router = APIRouter(tags=["Crop Recommendation"])

@router.post(
    "/recommend",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Recommend crops based on location, climate, and soil conditions",
    description="""
    Evaluates agricultural suitability using an ICAR & UAS (Bangalore/Dharwad) calibrated
    multi-factor decision scoring model.
    
    Accepts:
    * **latitude** & **longitude**: Coordinates of the farm
    * **district** *(optional)*: e.g. Mysuru, Mandya, Dharwad, Kolar, Belagavi
    * **state** *(optional)*: Defaults to Karnataka
    * **soil_type** *(optional)*: Red Soil, Black Soil, Sandy Loam, Clayey, Laterite
    * **soil_ph** *(optional)*: pH value (0.0 to 14.0)
    * **water_availability** *(optional)*: "Abundant / Canal", "Moderate / Borewell", "Rainfed / Limited"
    * **season** *(optional)*: "Kharif", "Rabi", "Zaid", or "All-Season"
    * **rainfall_mm** & **temperature_c** *(optional)*: Prevailing weather metrics
    
    Returns:
    * Recommended Primary Crops with detailed suitability scores and categories
    * Required soil conditions (ideal pH range, preferred textures, drainage)
    * Water requirements and irrigation guidance
    * Detailed, clear reasons for each recommendation
    * Viable Alternative / Secondary crop suggestions
    * Documented scoring model reference and official agronomic disclaimer
    """
)
def get_crop_recommendations(payload: CropRecommendationRequest):
    try:
        recommendations: CropRecommendationResponse = recommend_crops_service(payload)
        return format_response(
            data=recommendations.model_dump(),
            message="Location-based crop recommendations generated successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_crop_recommendations: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating crop recommendations."
        )
