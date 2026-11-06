"""
Utility and Helper Functions for AgriSmart AI.
"""
from typing import Any, Dict
from app.models.schemas import ApiResponse

def format_response(data: Any = None, message: str = "Success", success: bool = True) -> Dict[str, Any]:
    """Helper to wrap any payload into standard ApiResponse format."""
    return ApiResponse(success=success, message=message, data=data).model_dump()

def round_val(value: float, decimals: int = 2) -> float:
    """Safe rounding for float numbers."""
    try:
        return round(float(value), decimals)
    except (ValueError, TypeError):
        return 0.0

