"""
Live test suite for Smart Irrigation Recommendation endpoint POST /api/irrigation/recommend.
Validates rainfall warnings, critical crop stages, sensor data provenance,
and data-sufficiency guardrails.
"""
import sys
import time
import threading
from pathlib import Path
import requests

backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import uvicorn
from app.main import app

def run_irrigation_tests():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000/api/irrigation/recommend"

    try:
        # SCENARIO 1: Rain Forecast Warning (Farmer should skip irrigation)
        print("=== SCENARIO 1: Heavy Rainfall Expected (Rain Warning) ===")
        scen1 = {
            "crop_name": "Tomato",
            "crop_stage": "Vegetative",
            "soil_type": "Red Soil",
            "rainfall_forecast_mm": 22.0,
            "soil_moisture_pct": 18.0
        }
        r1 = requests.post(base, json=scen1)
        print("Status Code:", r1.status_code)
        assert r1.status_code == 200
        d1 = r1.json()["data"]
        print(f"Status: {d1['irrigation_status']} (Urgency: {d1['urgency']})")
        print(f"Reason: {d1['reason_for_recommendation']}")
        print(f"Rain Warning: {d1['weather_impact']['rainfall_warning']}")
        print(f"Water Depth Needed: {d1['estimated_water_depth_mm']} mm")
        assert d1["irrigation_status"] == "SKIP_IRRIGATION"
        assert d1["weather_impact"]["rainfall_warning"] is not None

        # SCENARIO 2: Critical Stage (Flowering) + Dry Soil from IoT Sensor
        print("\n=== SCENARIO 2: Critical Flowering Stage with Dry Sensor Reading ===")
        scen2 = {
            "crop_name": "Rice",
            "crop_stage": "Flowering",
            "soil_type": "Clayey",
            "soil_moisture_pct": 12.5,
            "is_sensor_data": True,
            "sensor_id": "IOT-MOIST-SENSOR-04",
            "rainfall_forecast_mm": 0.0
        }
        r2 = requests.post(base, json=scen2)
        print("Status Code:", r2.status_code)
        assert r2.status_code == 200
        d2 = r2.json()["data"]
        print(f"Status: {d2['irrigation_status']} (Urgency: {d2['urgency']})")
        print(f"Data Source Mode: {d2['soil_moisture_information']['data_source_mode']}")
        print(f"Crop Sensitivity: Is Critical? {d2['crop_stage_sensitivity']['is_critical_water_period']}")
        print(f"Stage Advisory: {d2['crop_stage_sensitivity']['stage_advisory']}")
        print(f"Estimated Water Replenishment: {d2['estimated_water_depth_mm']} mm")
        print(f"Quantity Note: {d2['quantity_estimation_note']}")
        assert d2["irrigation_status"] == "IRRIGATE_NOW"
        assert d2["urgency"] == "HIGH"
        assert "IoT Sensor Measured" in d2["soil_moisture_information"]["data_source_mode"]

        # SCENARIO 3: Soil Saturated (Waterlogging Risk)
        print("\n=== SCENARIO 3: Saturated Soil in Black Cotton Soil ===")
        scen3 = {
            "crop_name": "Cotton",
            "crop_stage": "Vegetative",
            "soil_type": "Black Soil",
            "soil_moisture_pct": 44.0, # Field capacity is 38%
            "is_sensor_data": False,
            "rainfall_forecast_mm": 4.0
        }
        r3 = requests.post(base, json=scen3)
        print("Status Code:", r3.status_code)
        assert r3.status_code == 200
        d3 = r3.json()["data"]
        print(f"Status: {d3['irrigation_status']} (Urgency: {d3['urgency']})")
        print(f"Reason: {d3['reason_for_recommendation']}")
        print(f"Soil Stress Status: {d3['soil_moisture_information']['moisture_stress_status']}")
        assert d3["irrigation_status"] in ("DRAIN_EXCESS_WATER", "SKIP_IRRIGATION")

        # SCENARIO 4: Harvest Stage Water Cutoff
        print("\n=== SCENARIO 4: Crop Maturity / Harvest Stage ===")
        scen4 = {
            "crop_name": "Maize",
            "crop_stage": "Harvest",
            "soil_type": "Red Soil",
            "rainfall_forecast_mm": 0.0
        }
        r4 = requests.post(base, json=scen4)
        print("Status Code:", r4.status_code)
        assert r4.status_code == 200
        d4 = r4.json()["data"]
        print(f"Status: {d4['irrigation_status']}")
        print(f"Reason: {d4['reason_for_recommendation']}")
        assert d4["irrigation_status"] == "SKIP_IRRIGATION"

        # SCENARIO 5: Without Soil Moisture Data (Transparent Guardrail)
        print("\n=== SCENARIO 5: Guardrail - No Soil Moisture Data Provided ===")
        scen5 = {
            "crop_name": "Ragi",
            "crop_stage": "Vegetative",
            "soil_type": "Sandy Loam",
            "rainfall_forecast_mm": 0.0
        }
        r5 = requests.post(base, json=scen5)
        print("Status Code:", r5.status_code)
        assert r5.status_code == 200
        d5 = r5.json()["data"]
        print(f"Status: {d5['irrigation_status']}")
        print(f"Estimated Water Depth mm: {d5['estimated_water_depth_mm']}")
        print(f"Quantity Note: {d5['quantity_estimation_note']}")
        assert d5["estimated_water_depth_mm"] is None # Guardrail confirmed: no exact quantities without data!

        print("\n=== ALL SMART IRRIGATION TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_irrigation_tests()

