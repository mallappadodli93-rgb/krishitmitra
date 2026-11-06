"""
Basic structure, logic, and weather unit tests for AgriSmart AI backend.
"""
import sys
from pathlib import Path
from unittest.mock import patch

# Add backend directory to path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

def test_imports_and_app_initialization():
    """Verify that the FastAPI application and all modules load cleanly."""
    from app.main import app
    assert app.title == "AgriSmart AI - Weather, Soil & Location Intelligence"
    assert len(app.routes) > 0

def test_wmo_code_decoding():
    """Verify WMO weather code mapping to human-readable text."""
    from app.services.weather_service import decode_weather_condition
    assert decode_weather_condition(0) == "Clear sky"
    assert decode_weather_condition(61) == "Slight rain"
    assert decode_weather_condition(95) == "Thunderstorm"

def test_agricultural_conditions_logic():
    """Verify agricultural insight calculations."""
    from app.services.weather_service import analyze_agricultural_conditions

    # Favorable spraying condition
    c1 = analyze_agricultural_conditions(temp=25.0, humidity=50.0, wind_speed=8.0, rain=0.0)
    assert c1.spray_window_status == "SUITABLE"
    assert c1.heat_stress_level == "NORMAL"
    assert c1.fungal_disease_risk == "LOW"

    # High wind condition -> Unsuitable for spraying
    c2 = analyze_agricultural_conditions(temp=28.0, humidity=60.0, wind_speed=25.0, rain=0.0)
    assert c2.spray_window_status == "UNSUITABLE"

    # Rain condition -> Unsuitable for spraying
    c3 = analyze_agricultural_conditions(temp=22.0, humidity=85.0, wind_speed=10.0, rain=5.0)
    assert c3.spray_window_status == "UNSUITABLE"
    assert c3.fungal_disease_risk == "HIGH"

def test_weather_alerts_logic_thresholds():
    """Verify alert generation when extreme weather thresholds are breached."""
    from app.services.weather_service import get_weather_alerts_service

    mock_raw = {
        "latitude": 12.2958,
        "longitude": 76.6394,
        "current": {
            "time": "2026-11-06T12:00",
            "temperature_2m": 41.5,     # > 38°C threshold (Extreme heat)
            "relative_humidity_2m": 90, # > 85% threshold (Fungal risk)
            "precipitation": 45.0,      # > 30mm threshold (Heavy rain)
            "weather_code": 95,
            "wind_speed_10m": 42.0      # > 35 km/h threshold (Strong wind)
        },
        "daily": {
            "temperature_2m_max": [41.5],
            "temperature_2m_min": [24.0],
            "precipitation_sum": [45.0],
            "wind_speed_10m_max": [42.0],
            "weather_code": [95]
        }
    }

    with patch("app.services.weather_service.fetch_weather_raw", return_value=mock_raw):
        alerts_resp = get_weather_alerts_service(12.2958, 76.6394)
        assert alerts_resp.active_alerts_count >= 3
        assert alerts_resp.safety_status in ("CRITICAL", "ADVISORY")
        alert_types = [a.alert_type for a in alerts_resp.alerts]
        assert "Extreme Heat Warning" in alert_types
        assert "Heavy Rainfall / Waterlogging Alert" in alert_types
        assert "Strong Wind Advisory" in alert_types

def test_soil_analysis_logic():
    """Verify soil evaluation service logic."""
    from app.services.soil_service import analyze_soil_health
    from app.models.schemas import SoilAnalysisRequest

    sample_req = SoilAnalysisRequest(
        nitrogen_n=300,
        phosphorus_p=15,
        potassium_k=150,
        ph=6.8,
        organic_carbon_pct=0.6
    )
    report = analyze_soil_health(sample_req)
    assert report.ph_category == "Neutral / Optimal"
    assert report.overall_health_score == 100.0

def test_crop_recommendation_logic():
    """Verify crop recommendation ranking."""
    from app.services.crop_service import recommend_crops
    from app.models.schemas import CropRecommendationRequest

    req = CropRecommendationRequest(latitude=12.9716, longitude=77.5946, season="Kharif")
    response = recommend_crops(req)
    assert len(response.recommendations) > 0
    assert response.recommendations[0].suitability_score > 0
