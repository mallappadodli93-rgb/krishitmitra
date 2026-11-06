"""
Smart Crop Calendar API Router for AgriSmart AI.
Endpoints for generating and retrieving crop growth timelines,
stage-wise irrigation reminders, and crop monitoring calendars.
"""
import logging
from typing import List
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    ApiResponse,
    CropCalendarGeneratedResponse,
    GenerateCropCalendarRequest,
)
from app.services.calendar_service import (
    generate_crop_calendar_service,
    get_farmer_calendars_service,
)
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.CalendarRouter")

router = APIRouter(tags=["Crop Calendar & Growth Stages"])

@router.post(
    "/generate",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Generate a smart crop growth calendar",
    description="""
    Generates a personalized stage-by-stage crop growth timeline from sowing to harvesting.
    
    Accepts:
    * **crop_name**: Maize, Paddy / Rice, Ragi, Cotton, Sugarcane, etc.
    * **sowing_date** *(optional)*: YYYY-MM-DD format (defaults to current date)
    * **variety** *(optional)*: Crop variety or duration group (e.g. 'GPU-28' for Ragi, 'Jaya' for Paddy)
    * **season** *(optional)*: Kharif, Rabi, Summer / Zaid
    * **district** & **state** *(optional)*: Farm location
    * **farmer_id** *(optional)*: Identifier to link calendar for retrieval
    
    Returns:
    * Milestone dates with explicit estimated date markers
    * Irrigation reminders and critical moisture window alerts per stage
    * Monitoring reminders for pests, blast, and weeds per stage
    * Fertilizer guidance per stage
    * Expected harvest window
    """
)
def generate_crop_calendar(payload: GenerateCropCalendarRequest):
    try:
        calendar: CropCalendarGeneratedResponse = generate_crop_calendar_service(payload)
        return format_response(
            data=calendar.model_dump(),
            message=f"Crop calendar for {calendar.crop_name} generated and saved successfully."
        )
    except ValueError as ve:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"Unexpected error in generate_crop_calendar: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while generating the crop calendar."
        )

@router.get(
    "/{farmer_id}",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Retrieve crop calendars by Farmer ID or Crop Name",
    description="Fetches saved crop calendars for a registered farmer, or generates a dynamic calendar if a crop name is supplied."
)
def get_farmer_crop_calendar(farmer_id: str):
    try:
        calendars = get_farmer_calendars_service(farmer_id)
        if not calendars:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No crop calendars found for '{farmer_id}'."
            )
        # Return first calendar if single or list
        data = calendars[0] if len(calendars) == 1 else calendars
        return format_response(
            data=data,
            message=f"Crop calendar retrieved successfully for '{farmer_id}'."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in get_farmer_crop_calendar: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving the crop calendar."
        )
