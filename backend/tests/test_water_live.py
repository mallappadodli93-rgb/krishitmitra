"""
Live test suite for Water Availability Management module.
Tests POST /api/water/register, GET /api/water/{farmer_id},
and PUT /api/water/{farmer_id} across normal, shortage, and invalid input scenarios.
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

def run_water_tests():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000/api/water"

    try:
        # 1. REGISTER WATER PROFILE (Borewell + Farm Pond + Rainwater Storage)
        print("=== TEST 1: Register Water Profile (POST /api/water/register) ===")
        register_payload = {
            "farmer_id": "FARMER-MYS-88",
            "farm_name": "Cauvery Green Valley Farm",
            "total_farm_acres": 3.0,
            "has_drip_irrigation": True,
            "has_sprinkler_irrigation": False,
            "self_assessed_security": "Moderate",
            "water_sources": [
                {
                    "source_type": "borewell",
                    "status": "ACTIVE",
                    "operating_hours_per_day": 4.5,
                    "daily_capacity_liters": 25000.0,
                    "notes": "Main borewell depth 450 ft"
                },
                {
                    "source_type": "pond",
                    "status": "ACTIVE",
                    "storage_capacity_liters": 150000.0,
                    "notes": "Krishi Honda farm pond lined with silpaulin"
                },
                {
                    "source_type": "rainwater_storage",
                    "status": "ACTIVE",
                    "storage_capacity_liters": 30000.0,
                    "notes": "Farmhouse rooftop harvesting cistern"
                }
            ]
        }
        r1 = requests.post(f"{base}/register", json=register_payload)
        print("Status Code:", r1.status_code)
        assert r1.status_code == 201
        d1 = r1.json()["data"]
        print(f"Farmer ID: {d1['farmer_id']} | Farm: {d1['farm_name']}")
        print(f"Registered Sources: {d1['registered_sources_count']}")
        print(f"Overall Water Security: {d1['overall_water_security']}")
        print(f"Daily Available: {d1['daily_estimated_availability_liters']:,} Liters")
        print(f"Storage Capacity: {d1['total_storage_capacity_liters']:,} Liters")
        print(f"Feasibility: {d1['irrigation_feasibility']}")
        print("Conservation Recommendations:")
        for tip in d1["water_conservation_methods"][:2]:
            print(f"  * {tip}")
        assert d1["overall_water_security"] in ("ADEQUATE", "ABUNDANT")
        assert d1["registered_sources_count"] == 3

        # 2. RETRIEVE WATER DASHBOARD (GET /api/water/{farmer_id})
        print("\n=== TEST 2: Retrieve Water Dashboard (GET /api/water/FARMER-MYS-88) ===")
        r2 = requests.get(f"{base}/FARMER-MYS-88")
        print("Status Code:", r2.status_code)
        assert r2.status_code == 200
        d2 = r2.json()["data"]
        print(f"Retrieved farmer: {d2['farmer_id']} | Security: {d2['overall_water_security']}")
        assert d2["farmer_id"] == "FARMER-MYS-88"

        # 3. UPDATE TO WATER SHORTAGE (PUT /api/water/{farmer_id})
        print("\n=== TEST 3: Update to Water Shortage Condition (PUT /api/water/FARMER-MYS-88) ===")
        update_payload = {
            "self_assessed_security": "Critical",
            "water_sources": [
                {
                    "source_type": "borewell",
                    "status": "DRY", # Borewell dried up
                    "daily_capacity_liters": 0.0,
                    "operating_hours_per_day": 0.0,
                    "notes": "Borewell casing dried due to regional summer groundwater decline"
                },
                {
                    "source_type": "pond",
                    "status": "LIMITED",
                    "storage_capacity_liters": 15000.0, # Pond nearly depleted
                    "notes": "Reservoir water down to last 10%"
                }
            ]
        }
        r3 = requests.put(f"{base}/FARMER-MYS-88", json=update_payload)
        print("Status Code:", r3.status_code)
        assert r3.status_code == 200
        d3 = r3.json()["data"]
        print(f"Updated Water Security: {d3['overall_water_security']}")
        print(f"Shortage Warning: {d3['shortage_warning']}")
        print(f"Recommended Method: {d3['recommended_irrigation_method']}")
        assert d3["overall_water_security"] == "CRITICAL_SHORTAGE"
        assert d3["shortage_warning"] is not None

        # 4. DATA VALIDATION TEST (Unsupported Source Type)
        print("\n=== TEST 4: Validation Guardrail (Unsupported Source Type) ===")
        invalid_payload = {
            "farmer_id": "FARMER-INVALID",
            "water_sources": [
                {
                    "source_type": "unverified_ocean_stream", # Invalid
                    "status": "ACTIVE"
                }
            ]
        }
        r4 = requests.post(f"{base}/register", json=invalid_payload)
        print("Invalid Source Status Code:", r4.status_code)
        assert r4.status_code == 400
        print("Validation properly caught unsupported water source with 400 Bad Request!")

        print("\n=== ALL WATER AVAILABILITY MANAGEMENT TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_water_tests()

