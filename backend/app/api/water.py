"""
Water Availability API Router for AgriSmart AI.
Endpoints for registering, retrieving, and updating farmer-specific water assets
(borewells, wells, farm ponds, canals, rainwater storage), shortage warnings, and conservation.
"""
import logging
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import (
    ApiResponse,
    WaterAvailabilityResponse,
    WaterDashboardResponse,
    WaterProfileRegisterRequest,
    WaterProfileUpdateRequest,
)
from app.services.water_service import (
    get_farmer_water_dashboard,
    register_farmer_water_profile,
    update_farmer_water_profile_service,
)
from app.services.weather_service import fetch_weather_forecast
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.WaterRouter")

router = APIRouter(tags=["Water Availability"])

@router.post(
    "/register",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register farmer water sources and capacities",
    description="""
    Stores verified farmer water assets:
    * **borewell**: Tube wells with discharge/pumping hours
    * **well**: Open agricultural wells
    * **pond**: Farm ponds / Krishi Honda
    * **canal**: Irrigation command channel release
    * **rainwater_storage**: Rainwater harvesting cisterns/tanks
    
    Computes overall water security rating, shortage alerts, and tailored conservation tips.
    """
)
def register_water_profile(payload: WaterProfileRegisterRequest):
    try:
        dashboard: WaterDashboardResponse = register_farmer_water_profile(payload)
        return format_response(
            data=dashboard.model_dump(),
            message="Water availability profile registered successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error registering water profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while registering the water profile."
        )

@router.get(
    "/{farmer_id}",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get farmer water availability dashboard",
    description="Retrieves registered water assets, active daily discharge, storage capacity, and water shortage advisories."
)
def get_water_dashboard(farmer_id: str):
    try:
        dashboard: WaterDashboardResponse = get_farmer_water_dashboard(farmer_id)
        return format_response(
            data=dashboard.model_dump(),
            message=f"Water dashboard retrieved successfully for '{farmer_id}'."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error fetching water dashboard: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the water dashboard."
        )

@router.put(
    "/{farmer_id}",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Update farmer water availability profile",
    description="Updates source status (e.g. seasonal drying, borewell yield change, pond filling) and recalculates water security."
)
def update_water_dashboard(farmer_id: str, payload: WaterProfileUpdateRequest):
    try:
        dashboard: WaterDashboardResponse = update_farmer_water_profile_service(farmer_id, payload)
        return format_response(
            data=dashboard.model_dump(),
            message=f"Water profile updated successfully for '{farmer_id}'."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Error updating water profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while updating the water profile."
        )

@router.get(
    "/regional/availability",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get regional macro water availability index",
    description="Evaluates regional precipitation balance and drought vulnerability using Open-Meteo."
)
def get_regional_water_availability(
    latitude: float = Query(..., ge=-90.0, le=90.0, description="Farm Latitude"),
    longitude: float = Query(..., ge=-180.0, le=180.0, description="Farm Longitude")
):
    try:
        raw = fetch_weather_forecast(latitude, longitude)
        daily = raw.get("daily", {})
        rain_sum_list = daily.get("precipitation_sum", [0.0])
        total_week_rain = sum(rain_sum_list) if rain_sum_list else 0.0

        if total_week_rain < 5.0:
            stress = "HIGH"
            groundwater = "Stressed / Heavy extraction likely"
            advisory = "Conserve water using drip irrigation and mulching. Minimize runoff."
        elif total_week_rain < 20.0:
            stress = "MODERATE"
            groundwater = "Adequate for seasonal crops"
            advisory = "Follow scheduled smart irrigation intervals."
        else:
            stress = "LOW"
            groundwater = "Recharging / Abundant"
            advisory = "Ample water detected. Focus on soil drainage and rainwater harvesting."

        result = WaterAvailabilityResponse(
            latitude=latitude,
            longitude=longitude,
            water_stress_index=stress,
            rainfall_deficit_percentage=round(max(0.0, 100.0 - (total_week_rain * 2)), 1),
            groundwater_status=groundwater,
            conservation_advisory=advisory
        )
        return format_response(data=result.model_dump(), message="Regional water availability evaluated successfully.")
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Regional water availability evaluation failed: {str(e)}"
        )
