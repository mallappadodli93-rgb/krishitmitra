"""
Weather API Router for AgriSmart AI.
Provides real-time observations, 7-day agricultural forecasts, and hazard alerts.
"""
import logging
from fastapi import APIRouter, HTTPException, Query, status

from app.models.schemas import (
    ApiResponse,
    CurrentWeatherResponse,
    WeatherAlertsResponse,
    WeatherForecastResponse,
)
from app.services.weather_service import (
    get_7day_forecast_service,
    get_current_weather_service,
    get_weather_alerts_service,
)
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.WeatherRouter")

router = APIRouter(tags=["Weather Intelligence"])

@router.get(
    "/current",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get current weather and agricultural conditions",
    description="Fetches live meteorological observations (temperature, apparent temp, min/max, humidity, rainfall, wind, weather condition) and computes spraying suitability and crop stress indicators."
)
def get_current_weather(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Farm Latitude in decimal degrees (-90 to 90)",
        examples=[12.2958]
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Farm Longitude in decimal degrees (-180 to 180)",
        examples=[76.6394]
    )
):
    try:
        weather_data: CurrentWeatherResponse = get_current_weather_service(latitude, longitude)
        return format_response(
            data=weather_data.model_dump(),
            message="Current weather observations retrieved successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_current_weather: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while fetching current weather data."
        )

@router.get(
    "/forecast",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get 7-day weather forecast with agricultural analytics",
    description="Returns daily projections (min/max temps, rainfall sum, probability, wind speed) and Pandas-aggregated farming analytics (rainiest day, hottest day, irrigation outlook)."
)
def get_weather_forecast(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Farm Latitude in decimal degrees (-90 to 90)",
        examples=[12.2958]
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Farm Longitude in decimal degrees (-180 to 180)",
        examples=[76.6394]
    )
):
    try:
        forecast_data: WeatherForecastResponse = get_7day_forecast_service(latitude, longitude)
        return format_response(
            data=forecast_data.model_dump(),
            message="7-day agricultural weather forecast generated successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_weather_forecast: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the 7-day weather forecast."
        )

@router.get(
    "/alerts",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get weather hazards and agricultural alerts",
    description="Evaluates conditions against configurable thresholds for heavy rainfall, extreme heat, strong winds, frost, and fungal risk."
)
def get_weather_alerts(
    latitude: float = Query(
        ...,
        ge=-90.0,
        le=90.0,
        description="Farm Latitude in decimal degrees (-90 to 90)",
        examples=[12.2958]
    ),
    longitude: float = Query(
        ...,
        ge=-180.0,
        le=180.0,
        description="Farm Longitude in decimal degrees (-180 to 180)",
        examples=[76.6394]
    )
):
    try:
        alerts_data: WeatherAlertsResponse = get_weather_alerts_service(latitude, longitude)
        return format_response(
            data=alerts_data.model_dump(),
            message=f"Weather alert evaluation complete. Status: {alerts_data.safety_status} ({alerts_data.active_alerts_count} active alerts)."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except RuntimeError as re:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(re)
        )
    except Exception as e:
        logger.error(f"Unexpected error in get_weather_alerts: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while evaluating weather alerts."
        )
