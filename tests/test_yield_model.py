"""
AgriSmart AI - Crop Yield Prediction Test Suite
Verifies Scikit-learn Random Forest model loading, feature preprocessing,
soil parameters, unit conversions, production ranges, and agronomic disclaimers.
"""

from modules.yield_prediction.prediction import CropYieldPredictor, get_yield_predictor


def test_crop_yield_prediction():
    print("=" * 65)
    print("🌾 Testing Crop Yield Prediction System")
    print("=" * 65)

    predictor = get_yield_predictor()
    assert predictor.is_model_loaded(), "Model must be loaded from 'saved_models/yield_models/crop_yield_model.pkl'"
    print("  ✅ Crop yield model pipeline successfully loaded.")

    # 1. Test Rice with complete environmental and soil features
    res_rice = predictor.predict(
        crop="Rice",
        location="Karnataka",
        season="Kharif",
        area_hectares=3.0,
        rainfall_mm=1250.0,
        temperature_celsius=26.5,
        soil_type="Clay Loam",
        soil_ph=6.2,
        fertilizer_kg=330.0,
        pesticide_kg=10.5
    )
    assert res_rice["status"] == "success"
    assert res_rice["crop"] == "Rice"
    assert res_rice["yield_per_hectare"]["value"] > 0
    assert res_rice["total_estimated_production"]["metric_tons"] > 0
    assert res_rice["total_estimated_production"]["quintals"] == round(res_rice["total_estimated_production"]["metric_tons"] * 10, 1)
    assert "disclaimer" in res_rice
    assert "estimates" in res_rice["disclaimer"].lower()
    print(f"  ✅ Rice Forecast: {res_rice['yield_per_hectare']['value']} Tons/ha | Total: {res_rice['total_estimated_production']['metric_tons']} Metric Tons ({res_rice['total_estimated_production']['quintals']} Quintals)")

    # 2. Test Wheat in Punjab (Rabi Season, Alluvial Soil)
    res_wheat = predictor.predict(
        crop="Wheat",
        location="Punjab",
        season="Rabi",
        area_hectares=4.5,
        rainfall_mm=550.0,
        temperature_celsius=19.0,
        soil_type="Alluvial",
        soil_ph=6.8
    )
    assert res_wheat["status"] == "success"
    assert res_wheat["crop"] == "Wheat"
    assert res_wheat["yield_per_hectare"]["value"] > 0
    print(f"  ✅ Wheat Forecast: {res_wheat['yield_per_hectare']['value']} Tons/ha | Total: {res_wheat['total_estimated_production']['metric_tons']} Metric Tons")

    # 3. Test Sugarcane (Cash crop, Black Soil, high production tonnage)
    res_cane = predictor.predict(
        crop="Sugarcane",
        location="Maharashtra",
        season="Whole Year",
        area_hectares=2.0,
        rainfall_mm=1350.0,
        temperature_celsius=31.0,
        soil_type="Black Soil",
        soil_ph=7.0
    )
    assert res_cane["status"] == "success"
    assert res_cane["yield_per_hectare"]["value"] > 30.0  # Sugarcane typically 45-80 tons/ha
    print(f"  ✅ Sugarcane Forecast: {res_cane['yield_per_hectare']['value']} Tons/ha | Total: {res_cane['total_estimated_production']['metric_tons']} Metric Tons")

    # 4. Verify disclaimer and warning are present
    assert "NOT guaranteed" in res_cane["disclaimer"]
    print("  ✅ Mandatory disclaimer verified: explicitly warns that predictions are estimates, not guarantees.")

    print("\n🎉 ALL CROP YIELD PREDICTION TESTS PASSED SUCCESSFULLY!\n")


if __name__ == "__main__":
    test_crop_yield_prediction()
