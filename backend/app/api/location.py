"""
Farmer & Farm Location API Router for AgriSmart AI.
Stores and manages farmer profiles, farm coordinates, and database status.
"""
import logging
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import ApiResponse, FarmProfileCreate
from app.database.firebase import (
    get_database_status,
    get_farmer,
    list_farmers,
    save_farmer,
)
from app.utils.helpers import format_response

logger = logging.getLogger("AgriSmartAI.LocationRouter")

router = APIRouter(tags=["Farmer & Farm Location"])

@router.post(
    "/farmers",
    response_model=ApiResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register farmer profile and farm GPS coordinates",
    description="Stores farmer contact details, farm name, cultivated acres, and GPS location in Firestore (farmers collection)."
)
def create_farmer_profile(payload: FarmProfileCreate):
    try:
        saved_profile = save_farmer(payload.model_dump())
        return format_response(
            data=saved_profile,
            message=f"Farmer profile created successfully with ID: {saved_profile['farmer_id']}."
        )
    except Exception as e:
        logger.error(f"Error creating farmer profile: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save farmer profile to database."
        )

@router.get(
    "/farmers",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="List registered farmers",
    description="Retrieves registered farmers and their farm GPS coordinates for mapping and regional analytics."
)
def get_all_farmers():
    try:
        farmers = list_farmers()
        return format_response(
            data=farmers,
            message="Registered farmers retrieved successfully."
        )
    except Exception as e:
        logger.error(f"Error listing farmers: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch registered farmers."
        )

@router.get(
    "/farmers/{farmer_id}",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get single farmer profile",
    description="Retrieves a specific farmer profile by ID."
)
def get_single_farmer(farmer_id: str):
    try:
        farmer = get_farmer(farmer_id)
        if not farmer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Farmer with ID '{farmer_id}' not found."
            )
        return format_response(
            data=farmer,
            message=f"Farmer profile retrieved for '{farmer_id}'."
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching farmer {farmer_id}: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred while retrieving farmer record."
        )

@router.get(
    "/database/status",
    response_model=ApiResponse,
    status_code=status.HTTP_200_OK,
    summary="Get Firestore database connection and collection diagnostics",
    description="Checks Firestore connection status and reports counts across all 7 collections without exposing secret keys."
)
def get_db_status():
    try:
        status_data = get_database_status()
        return format_response(
            data=status_data,
            message="Database status retrieved successfully."
        )
    except Exception as e:
        logger.error(f"Error reading database status: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to read database diagnostics."
        )

# Backward compatibility aliases for /farms
@router.post("/farms", response_model=ApiResponse, status_code=status.HTTP_201_CREATED, include_in_schema=False)
def create_farm_legacy(payload: FarmProfileCreate):
    return create_farmer_profile(payload)

@router.get("/farms", response_model=ApiResponse, status_code=status.HTTP_200_OK, include_in_schema=False)
def get_farms_legacy():
    return get_all_farmers()
