"""
Soil Health API Router for AgriSmart AI.
Provides agronomic screening and nutrient analysis based on ICAR and FAO benchmarks.
"""
import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ApiResponse, SoilAnalysisRequest, SoilHealthReport
from app.services.soil_service import analyze_soil_health
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.SoilRouter")

router = APIRouter(tags=["Soil Health"])

@router.post(
    "/analyze",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Analyze soil test parameters (pH, NPK, Soil Type, Moisture)",
    description="""
    Evaluates soil health based on standard ICAR (Indian Council of Agricultural Research) 
    and FAO agronomic classifications.
    
    Accepts:
    * **ph**: Soil pH (0.0 - 14.0)
    * **nitrogen**: Available Nitrogen (kg/ha)
    * **phosphorus**: Available Phosphorus P2O5 (kg/ha)
    * **potassium**: Available Potassium K2O (kg/ha)
    * **soil_type** *(optional)*: e.g. "Red Soil", "Black Soil", "Sandy Loam", "Clayey", "Laterite"
    * **soil_moisture_pct** *(optional)*: Volumetric moisture percentage (0 - 100%)
    * **organic_carbon_pct** *(optional)*: Soil organic carbon percentage
    
    Returns:
    * pH classification & corrective amendment
    * Nutrient deficiency / excess status for N, P, and K
    * Soil texture insights and characteristics
    * Overall Soil Health Score (0 - 100) and grade (EXCELLENT, GOOD, FAIR, POOR)
    * Beginner-friendly actionable recommendations & official agronomic disclaimer
    """
)
def analyze_soil(payload: SoilAnalysisRequest):
    try:
        report: SoilHealthReport = analyze_soil_health(payload)
        return format_response(
            data=report.model_dump(),
            message="Soil health analysis completed successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error in analyze_soil: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while analyzing soil health."
        )
