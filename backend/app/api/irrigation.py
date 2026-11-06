"""
Smart Irrigation API Router for AgriSmart AI.
Provides agro-hydrological irrigation recommendations considering crop stage,
soil moisture measurements, and 48-hour rainfall forecasts.
"""
import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    ApiResponse,
    IrrigationRecommendationRequest,
    IrrigationRecommendationResponse,
)
from app.services.irrigation_service import calculate_smart_irrigation_recommendation
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.IrrigationRouter")

router = APIRouter(tags=["Smart Irrigation"])

@router.post(
    "/recommend",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get smart irrigation recommendation",
    description="""
    Determines whether irrigation is needed (`IRRIGATE_NOW`, `DELAY_IRRIGATION`, 
    `SKIP_IRRIGATION`, or `DRAIN_EXCESS_WATER`).
    
    Accepts:
    * **crop_name**: e.g. Rice, Maize, Tomato, Cotton, Sugarcane, Ragi
    * **crop_stage**: Sowing, Vegetative, Flowering / Panicle, Grain Filling, Maturity, Harvest
    * **soil_type**: Red Soil, Black Soil, Sandy Loam, Clayey, Laterite
    * **soil_moisture_pct** *(optional)*: Volumetric soil moisture percentage
    * **is_sensor_data** *(optional)*: Boolean flag distinguishing IoT sensor readings from manual estimates
    * **sensor_id** *(optional)*: Sensor identifier
    * **rainfall_forecast_mm** *(optional)*: 48-hour expected precipitation
    * **water_availability** *(optional)*: Abundant / Canal, Moderate / Borewell, Rainfed / Limited
    * **latitude** & **longitude** *(optional)*: Used to fetch live Open-Meteo rainfall forecast if rainfall_forecast_mm is not provided
    
    Returns:
    * Irrigation action and urgency level
    * Clear agricultural rationale
    * 48-hour rainfall impact and rain warnings
    * Soil moisture stress status and sensor/manual data provenance
    * Critical growth stage sensitivity notes
    * Practical water- and electricity-saving suggestions
    """
)
def get_irrigation_recommendation(payload: IrrigationRecommendationRequest):
    try:
        recommendation: IrrigationRecommendationResponse = calculate_smart_irrigation_recommendation(payload)
        return format_response(
            data=recommendation.model_dump(),
            message=f"Irrigation analysis complete. Action: {recommendation.irrigation_status} (Urgency: {recommendation.urgency})."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_irrigation_recommendation: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while calculating irrigation recommendations."
        )

# Backward compatibility alias
@router.post(
    "/advice",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    include_in_schema=False
)
def get_irrigation_advice(payload: IrrigationRecommendationRequest):
    return get_irrigation_recommendation(payload)
