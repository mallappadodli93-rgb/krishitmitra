"""
AgriSmart AI - Crop Yield Prediction Module (prediction.py)
Loads the trained Scikit-learn Random Forest regression pipeline and performs
reliable crop yield inference for farmers, agronomists, and agricultural policymakers.

Inputs accepted:
- crop: Crop name (e.g. Rice, Wheat, Maize, Cotton, Sugarcane, Tomato, Potato, etc.)
- location: State / region (e.g. Karnataka, Punjab, Maharashtra, Uttar Pradesh, etc.)
- area_hectares: Farm land size in hectares
- rainfall_mm: Seasonal / annual rainfall in mm
- temperature_celsius: Mean ambient temperature in °C
- soil_type: Soil classification (e.g. Alluvial, Black Soil, Red Soil, Clay Loam, Sandy Loam, Laterite)
- soil_ph: Soil pH value (e.g. 5.5 to 8.2, optional, defaults to 6.5)
- season: Cropping season ('Kharif', 'Rabi', 'Summer', 'Whole Year', optional)
- fertilizer_kg: Applied fertilizer in kilograms (optional, auto-estimated if omitted)
- pesticide_kg: Applied pesticide in kilograms (optional, auto-estimated if omitted)

Returns:
- Yield per hectare (Metric Tons / ha)
- Yield per acre (Quintals / acre)
- Total estimated production (Metric Tons & Quintals)
- Confidence estimate interval (expected lower and upper bound)
- Clear agronomic disclaimer highlighting that predictions are estimates, not guarantees.
"""

import os
from typing import Dict, Any, Optional
import numpy as np
import joblib

from utils.logger import get_logger

logger = get_logger("CropYieldPrediction")


# Standard agricultural unit conversions:
# 1 Hectare ≈ 2.47105 Acres
# 1 Metric Ton = 1,000 kg = 10 Quintals (1 Quintal = 100 kg)
ACRES_PER_HECTARE = 2.47105
QUINTALS_PER_METRIC_TON = 10.0

# Typical input benchmarks per hectare (used as fallbacks if farmer does not know exact kg)
DEFAULT_INPUT_BENCHMARKS = {
    "Sugarcane": {"fert": 240.0, "pest": 5.0, "season": "Whole Year", "soil": "Alluvial", "ph": 6.8},
    "Tomato": {"fert": 190.0, "pest": 5.5, "season": "Kharif", "soil": "Red Soil", "ph": 6.4},
    "Potato": {"fert": 180.0, "pest": 4.5, "season": "Rabi", "soil": "Sandy Loam", "ph": 5.8},
    "Onion": {"fert": 150.0, "pest": 4.0, "season": "Rabi", "soil": "Clay Loam", "ph": 6.6},
    "Wheat": {"fert": 120.0, "pest": 2.5, "season": "Rabi", "soil": "Alluvial", "ph": 6.8},
    "Rice": {"fert": 110.0, "pest": 3.5, "season": "Kharif", "soil": "Clay Loam", "ph": 6.2},
    "Maize": {"fert": 105.0, "pest": 3.0, "season": "Kharif", "soil": "Sandy Loam", "ph": 6.5},
    "Cotton": {"fert": 95.0, "pest": 6.5, "season": "Kharif", "soil": "Black Soil", "ph": 7.2},
    "Soybean": {"fert": 80.0, "pest": 3.8, "season": "Kharif", "soil": "Black Soil", "ph": 6.5},
    "Mustard": {"fert": 75.0, "pest": 2.0, "season": "Rabi", "soil": "Sandy Loam", "ph": 6.8},
    "Groundnut": {"fert": 70.0, "pest": 3.0, "season": "Kharif", "soil": "Sandy Loam", "ph": 6.4},
    "Pulses": {"fert": 45.0, "pest": 2.2, "season": "Rabi", "soil": "Sandy Loam", "ph": 7.0}
}


class CropYieldPredictor:
    """
    Handles machine learning crop yield inference using a trained Scikit-learn Random Forest pipeline.
    """

    def __init__(self, model_path: Optional[str] = None):
        """
        Initializes the predictor with model weights.

        Args:
            model_path (str, optional): Path to saved pipeline (.pkl).
        """
        self.model_path = model_path or os.getenv(
            "YIELD_MODEL_PATH",
            "saved_models/yield_models/crop_yield_model.pkl"
        )
        self.pipeline = None
        self._load_model()

    def _load_model(self) -> None:
        """Loads serialized Scikit-learn pipeline from disk."""
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Yield model not found at '{self.model_path}'. "
                f"Run 'modules/yield_prediction/train_yield_model.py' to generate model weights."
            )
            self.pipeline = None
            return

        try:
            logger.info(f"Loading yield pipeline from {self.model_path}...")
            self.pipeline = joblib.load(self.model_path)
            logger.info("Crop yield model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load crop yield model: {str(e)}")
            self.pipeline = None

    def is_model_loaded(self) -> bool:
        """Returns True if the underlying Scikit-learn model is ready for inference."""
        return self.pipeline is not None

    def predict(
        self,
        crop: str,
        location: Optional[str] = None,
        area_hectares: float = 1.0,
        rainfall_mm: float = 1000.0,
        temperature_celsius: float = 25.0,
        soil_type: Optional[str] = None,
        soil_ph: Optional[float] = None,
        season: Optional[str] = None,
        fertilizer_kg: Optional[float] = None,
        pesticide_kg: Optional[float] = None,
        state: Optional[str] = None,  # Alias for location for backwards compatibility
        **kwargs
    ) -> Dict[str, Any]:
        """
        Generates crop yield and production forecasts.

        Args:
            crop (str): Crop type (e.g. 'Rice', 'Wheat', 'Tomato', 'Sugarcane').
            location (str): State / region (e.g. 'Karnataka', 'Punjab', 'Maharashtra').
            area_hectares (float): Total land area in hectares (> 0).
            rainfall_mm (float): Total rainfall expected or recorded in mm.
            temperature_celsius (float): Mean ambient temperature during growing season in °C.
            soil_type (str, optional): Soil classification (e.g. 'Alluvial', 'Clay Loam', 'Red Soil').
            soil_ph (float, optional): Soil pH value (defaults to 6.5 or crop-specific standard).
            season (str, optional): Season ('Kharif', 'Rabi', 'Summer', 'Whole Year').
            fertilizer_kg (float, optional): Applied fertilizer in kg (estimated if None).
            pesticide_kg (float, optional): Applied pesticide in kg (estimated if None).
            state (str, optional): Backwards-compatible alias for location.

        Returns:
            Dict[str, Any]: Comprehensive yield forecast, unit conversions, and agronomic disclaimer.
        """
        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained yield model '{self.model_path}' is not yet available. "
                f"Please run 'modules/yield_prediction/train_yield_model.py' to train and save the model."
            )

        # Resolve location alias if provided
        final_location = (location or state or "Karnataka").strip()
        clean_crop = crop.strip()

        # Land area validation
        area = float(area_hectares)
        if area <= 0:
            raise ValueError(f"Land area must be greater than 0, got {area_hectares}")

        # Crop profile defaults
        prof = DEFAULT_INPUT_BENCHMARKS.get(clean_crop, {
            "fert": 100.0, "pest": 3.0, "season": "Kharif", "soil": "Alluvial", "ph": 6.5
        })

        # Fill missing optional parameters with agronomic estimates
        final_season = (season or prof["season"]).strip()
        final_soil_type = (soil_type or prof["soil"]).strip()
        final_soil_ph = float(soil_ph) if soil_ph is not None else float(prof["ph"])
        final_fert_kg = float(fertilizer_kg) if fertilizer_kg is not None else round(area * prof["fert"], 1)
        final_pest_kg = float(pesticide_kg) if pesticide_kg is not None else round(area * prof["pest"], 2)
        final_rainfall = float(rainfall_mm)
        final_temp = float(temperature_celsius)

        # Build feature vector matching the ColumnTransformer schema:
        # [0: Crop, 1: Location, 2: Season, 3: Soil_Type,
        #  4: Area_Hectares, 5: Rainfall_mm, 6: Temperature_C, 7: Soil_pH, 8: Fertilizer_kg, 9: Pesticide_kg]
        features = [[
            clean_crop,
            final_location,
            final_season,
            final_soil_type,
            area,
            final_rainfall,
            final_temp,
            final_soil_ph,
            final_fert_kg,
            final_pest_kg
        ]]

        # Run inference through Random Forest pipeline
        raw_prediction = float(self.pipeline.predict(features)[0])
        yield_per_hectare_tons = max(0.1, round(raw_prediction, 2))

        # Total estimated production = yield per hectare * area in hectares
        total_production_tons = round(yield_per_hectare_tons * area, 2)

        # Unit conversions:
        # 1 Metric Ton = 10 Quintals
        total_production_quintals = round(total_production_tons * QUINTALS_PER_METRIC_TON, 1)

        # Per acre calculations:
        # Yield per acre (tons) = Yield per ha / 2.47105
        # Yield per acre (quintals) = Yield per ha * 10 / 2.47105
        yield_per_acre_quintals = round((yield_per_hectare_tons * QUINTALS_PER_METRIC_TON) / ACRES_PER_HECTARE, 2)
        area_acres = round(area * ACRES_PER_HECTARE, 2)

        # Confidence bounds (±12% realistic agronomic margin of error based on model RMSE)
        lower_bound_tons = max(0.0, round(total_production_tons * 0.88, 2))
        upper_bound_tons = round(total_production_tons * 1.12, 2)

        # Explicit agronomic disclaimer as required
        disclaimer_text = (
            "IMPORTANT NOTICE: These yield predictions are scientific estimates generated by a machine learning "
            "model based on historical regional averages and provided input parameters. They are NOT guaranteed "
            "harvest figures. Actual field outcomes can vary substantially depending on localized microclimates, "
            "unseasonal weather anomalies (droughts, floods, hail), unforeseen pest or disease outbreaks, timely "
            "irrigation scheduling, seed quality, and specific on-field crop management practices."
        )

        return {
            "status": "success",
            "crop": clean_crop,
            "location": final_location,
            "season": final_season,
            "land_area": {
                "hectares": area,
                "acres": area_acres
            },
            "yield_per_hectare": {
                "value": yield_per_hectare_tons,
                "unit": "Metric Tons / Hectare"
            },
            "yield_per_acre": {
                "value": yield_per_acre_quintals,
                "unit": "Quintals / Acre"
            },
            "total_estimated_production": {
                "metric_tons": total_production_tons,
                "quintals": total_production_quintals,
                "primary_unit": "Metric Tons"
            },
            "estimated_production_range": {
                "lower_bound_metric_tons": lower_bound_tons,
                "upper_bound_metric_tons": upper_bound_tons,
                "unit": "Metric Tons"
            },
            # Backwards-compatible fields for existing test suites & frontend
            "predicted_yield_per_hectare_tons": yield_per_hectare_tons,
            "total_estimated_production_tons": total_production_tons,
            "unit": "Metric Tons",
            "environmental_and_soil_inputs": {
                "crop": clean_crop,
                "location": final_location,
                "season": final_season,
                "area_hectares": area,
                "rainfall_mm": final_rainfall,
                "temperature_celsius": final_temp,
                "soil_type": final_soil_type,
                "soil_ph": final_soil_ph,
                "fertilizer_kg": final_fert_kg,
                "pesticide_kg": final_pest_kg
            },
            "disclaimer": disclaimer_text
        }


# Global singleton instance for quick modular import
_global_predictor: Optional[CropYieldPredictor] = None


def get_yield_predictor() -> CropYieldPredictor:
    """Returns singleton instance of CropYieldPredictor."""
    global _global_predictor
    if _global_predictor is None:
        _global_predictor = CropYieldPredictor()
    return _global_predictor


def predict_crop_yield(**kwargs) -> Dict[str, Any]:
    """Helper function to perform yield prediction directly."""
    predictor = get_yield_predictor()
    return predictor.predict(**kwargs)


if __name__ == "__main__":
    print("=" * 70)
    print("🌾 AgriSmart AI - Crop Yield Prediction Inference Demo (prediction.py)")
    print("=" * 70)

    demo_predictor = CropYieldPredictor()

    test_queries = [
        {
            "crop": "Rice",
            "location": "Karnataka",
            "season": "Kharif",
            "area_hectares": 3.0,
            "rainfall_mm": 1150.0,
            "temperature_celsius": 26.5,
            "soil_type": "Clay Loam",
            "soil_ph": 6.2,
            "fertilizer_kg": 330.0,
            "pesticide_kg": 10.5
        },
        {
            "crop": "Wheat",
            "location": "Punjab",
            "season": "Rabi",
            "area_hectares": 5.0,
            "rainfall_mm": 520.0,
            "temperature_celsius": 19.5,
            "soil_type": "Alluvial",
            "soil_ph": 6.8,
            "fertilizer_kg": 600.0,
            "pesticide_kg": 12.0
        },
        {
            "crop": "Sugarcane",
            "location": "Maharashtra",
            "season": "Whole Year",
            "area_hectares": 2.5,
            "rainfall_mm": 1350.0,
            "temperature_celsius": 31.0,
            "soil_type": "Black Soil",
            "soil_ph": 7.0,
            "fertilizer_kg": 600.0,
            "pesticide_kg": 12.5
        },
        {
            "crop": "Tomato",
            "location": "Andhra Pradesh",
            "season": "Kharif",
            "area_hectares": 1.5,
            "rainfall_mm": 720.0,
            "temperature_celsius": 25.0,
            "soil_type": "Red Soil",
            "soil_ph": 6.5,
            "fertilizer_kg": 280.0,
            "pesticide_kg": 8.0
        }
    ]

    for idx, q in enumerate(test_queries, 1):
        print(f"\n--- Scenario {idx}: {q['crop']} in {q['location']} ({q['area_hectares']} ha) ---")
        pred = demo_predictor.predict(**q)
        print(f"  • Yield per Hectare : {pred['yield_per_hectare']['value']} {pred['yield_per_hectare']['unit']}")
        print(f"  • Yield per Acre    : {pred['yield_per_acre']['value']} {pred['yield_per_acre']['unit']}")
        print(f"  • Total Production  : {pred['total_estimated_production']['metric_tons']} Metric Tons ({pred['total_estimated_production']['quintals']} Quintals)")
        print(f"  • Expected Range    : {pred['estimated_production_range']['lower_bound_metric_tons']} - {pred['estimated_production_range']['upper_bound_metric_tons']} Metric Tons")
        print(f"  • Soil & Inputs     : Soil={pred['environmental_and_soil_inputs']['soil_type']}, pH={pred['environmental_and_soil_inputs']['soil_ph']}, Rain={pred['environmental_and_soil_inputs']['rainfall_mm']} mm")

    print("\n" + "=" * 70)
    print("Disclaimer Sample:")
    print(pred["disclaimer"])
    print("=" * 70)
