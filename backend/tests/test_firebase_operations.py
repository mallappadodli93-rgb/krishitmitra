"""
Verification suite for Firebase Firestore database operations.
Tests read/write/query operations across all 7 collections:
  1. farmers
  2. soil_records
  3. weather_records
  4. crop_recommendations
  5. irrigation_records
  6. crop_calendars
  7. water_records
"""
import sys
from pathlib import Path

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from app.database.firebase import (
    init_firebase,
    get_database_status,
    save_farmer,
    get_farmer,
    list_farmers,
    save_soil_record,
    get_soil_records_by_farmer,
    save_weather_record,
    get_recent_weather_records,
    save_crop_recommendation,
    get_crop_recommendations_by_farmer,
    save_irrigation_record,
    get_irrigation_records_by_farmer,
    save_crop_calendar,
    get_crop_calendars_by_farmer,
    save_water_record,
    get_water_record,
    update_water_record,
    COLLECTIONS,
)

def test_firebase_all_collections():
    init_firebase()
    print("=== 0. DATABASE STATUS & CREDENTIAL SAFETY ===")
    status = get_database_status()
    print("Database Engine:", status["engine"])
    print("Status:", status["status"])
    print("Collections tracked:", list(status["collections"].keys()))
    assert len(status["collections"]) == 7
    # Ensure no secrets leaked
    assert "private_key" not in str(status)
    assert "client_email" not in str(status)

    test_farmer_id = "FARMER-TEST-99"

    print("\n=== 1. FARMERS COLLECTION ===")
    farmer_data = {
        "farmer_id": test_farmer_id,
        "farmer_name": "Ramesh Gowda",
        "phone": "+91 98450 12345",
        "farm_name": "Cauvery Siri Farm",
        "latitude": 12.2958,
        "longitude": 76.6394,
        "area_acres": 4.5,
        "primary_crops": ["Ragi", "Paddy", "Sugarcane"]
    }
    saved_farmer = save_farmer(farmer_data)
    print("Saved Farmer ID:", saved_farmer["farmer_id"])
    assert saved_farmer["farmer_id"] == test_farmer_id
    retrieved_farmer = get_farmer(test_farmer_id)
    assert retrieved_farmer["farmer_name"] == "Ramesh Gowda"
    assert retrieved_farmer["latitude"] == 12.2958

    print("\n=== 2. SOIL_RECORDS COLLECTION ===")
    soil_data = {
        "ph": 6.6,
        "nitrogen": 260.0,
        "phosphorus": 18.0,
        "potassium": 195.0,
        "soil_type": "Red Soil",
        "health_score": 85.0,
        "rating": "EXCELLENT"
    }
    saved_soil = save_soil_record(test_farmer_id, soil_data)
    print("Saved Soil Record ID:", saved_soil["record_id"])
    soil_list = get_soil_records_by_farmer(test_farmer_id)
    assert len(soil_list) >= 1
    assert soil_list[0]["health_score"] == 85.0

    print("\n=== 3. WEATHER_RECORDS COLLECTION ===")
    weather_data = {
        "latitude": 12.2958,
        "longitude": 76.6394,
        "temperature_c": 28.5,
        "rainfall_mm": 0.0,
        "wind_speed_kmh": 12.0,
        "condition": "Clear sky",
        "alert": "None"
    }
    saved_wx = save_weather_record(weather_data)
    print("Saved Weather Record ID:", saved_wx["record_id"])
    recent_wx = get_recent_weather_records(5)
    assert len(recent_wx) >= 1

    print("\n=== 4. CROP_RECOMMENDATIONS COLLECTION ===")
    rec_data = {
        "season": "Kharif",
        "recommended_crops": ["Ragi (Finger Millet)", "Maize", "Groundnut"],
        "top_score": 98.0
    }
    saved_rec = save_crop_recommendation(test_farmer_id, rec_data)
    print("Saved Crop Recommendation ID:", saved_rec["recommendation_id"])
    rec_list = get_crop_recommendations_by_farmer(test_farmer_id)
    assert len(rec_list) >= 1
    assert rec_list[0]["top_score"] == 98.0

    print("\n=== 5. IRRIGATION_RECORDS COLLECTION ===")
    irr_data = {
        "crop_name": "Tomato",
        "crop_stage": "Flowering",
        "action": "IRRIGATE_NOW",
        "water_depth_mm": 35.0,
        "soil_moisture_pct": 14.0
    }
    saved_irr = save_irrigation_record(test_farmer_id, irr_data)
    print("Saved Irrigation Record ID:", saved_irr["record_id"])
    irr_list = get_irrigation_records_by_farmer(test_farmer_id)
    assert len(irr_list) >= 1
    assert irr_list[0]["action"] == "IRRIGATE_NOW"

    print("\n=== 6. CROP_CALENDARS COLLECTION ===")
    cal_data = {
        "crop_name": "Ragi",
        "variety": "GPU-28",
        "total_duration_days": 115,
        "sowing_date": "2026-11-15",
        "stages_count": 5
    }
    saved_cal = save_crop_calendar(test_farmer_id, cal_data)
    print("Saved Crop Calendar ID:", saved_cal["calendar_id"])
    cal_list = get_crop_calendars_by_farmer(test_farmer_id)
    assert len(cal_list) >= 1
    assert cal_list[0]["crop_name"] == "Ragi"

    print("\n=== 7. WATER_RECORDS COLLECTION ===")
    water_data = {
        "farm_name": "Cauvery Siri Farm",
        "overall_security": "ADEQUATE",
        "water_sources": [
            {"source_type": "borewell", "status": "ACTIVE", "daily_capacity_liters": 25000},
            {"source_type": "pond", "status": "ACTIVE", "storage_capacity_liters": 120000}
        ]
    }
    saved_water = save_water_record(test_farmer_id, water_data)
    print("Saved Water Record for:", saved_water["farmer_id"])
    retrieved_water = get_water_record(test_farmer_id)
    assert retrieved_water["overall_security"] == "ADEQUATE"

    # Update water status
    update_water_record(test_farmer_id, {"overall_security": "CRITICAL_SHORTAGE"})
    updated_water = get_water_record(test_farmer_id)
    assert updated_water["overall_security"] == "CRITICAL_SHORTAGE"
    print("Successfully updated water record status to CRITICAL_SHORTAGE!")

    print("\n=== ALL 7 FIREBASE FIRESTORE COLLECTIONS VERIFIED SUCCESSFULLY! ===")

if __name__ == "__main__":
    test_firebase_all_collections()

