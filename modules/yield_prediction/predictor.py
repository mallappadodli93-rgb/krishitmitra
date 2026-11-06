"""
AgriSmart AI - Crop Yield Predictor
Wrapper exposing CropYieldPredictor and helper functions from prediction.py.
Maintains backwards compatibility across existing routes and test suites.
"""

from modules.yield_prediction.prediction import (
    CropYieldPredictor,
    get_yield_predictor,
    predict_crop_yield,
    ACRES_PER_HECTARE,
    QUINTALS_PER_METRIC_TON
)

__all__ = [
    "CropYieldPredictor",
    "get_yield_predictor",
    "predict_crop_yield",
    "ACRES_PER_HECTARE",
    "QUINTALS_PER_METRIC_TON"
]
