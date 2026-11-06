"""
Live test script for Location-Based Crop Recommendation module across
representative Karnataka agro-climatic zones (Mandya, Dharwad, Kolar, Kalaburagi).
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

def run_crop_tests():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000/api/crops/recommend"

    try:
        # 1. MANDYA / MYSURU (Cauvery Basin - Canal Irrigated)
        print("=== TEST 1: Mandya District (Canal Irrigated, Red Soil, Kharif) ===")
        mandya_payload = {
            "latitude": 12.5218,
            "longitude": 76.8951,
            "district": "Mandya",
            "state": "Karnataka",
            "season": "Kharif",
            "soil_type": "Red Soil",
            "soil_ph": 6.8,
            "water_availability": "Abundant / Canal"
        }
        r1 = requests.post(base, json=mandya_payload)
        print("Status Code:", r1.status_code)
        assert r1.status_code == 200
        d1 = r1.json()["data"]
        print("Scoring Model:", d1["scoring_model_reference"][:80], "...")
        print("\nPrimary Recommended Crops:")
        for c in d1["recommended_crops"]:
            print(f"  * {c['crop_name']} -> Score: {c['suitability_score']}% ({c['suitability_category']})")
            print(f"    Water Demand: {c['water_requirements']['water_demand_level']}")
            print(f"    Soil Prerequisites: pH {c['required_soil_conditions']['ideal_ph_range']} ({', '.join(c['required_soil_conditions']['preferred_soil_types'])})")
            print(f"    Key Reasons: {'; '.join(c['reasons_for_recommendation'][:2])}")
        print("\nViable Alternative Crops:")
        for alt in d1["alternative_crops"]:
            print(f"  - {alt['crop_name']} (Score: {alt['suitability_score']}%) - {alt['quick_rationale']}")

        # 2. DHARWAD (Northern Transition Zone - Black Soil, Kharif)
        print("\n=== TEST 2: Dharwad District (Black Soil, Moderate Water, Kharif) ===")
        dharwad_payload = {
            "latitude": 15.4589,
            "longitude": 75.0078,
            "district": "Dharwad",
            "state": "Karnataka",
            "season": "Kharif",
            "soil_type": "Black Soil",
            "soil_ph": 7.6,
            "water_availability": "Moderate / Borewell"
        }
        r2 = requests.post(base, json=dharwad_payload)
        print("Status Code:", r2.status_code)
        assert r2.status_code == 200
        d2 = r2.json()["data"]
        print("Top 3 Crops for Dharwad:")
        for c in d2["recommended_crops"][:3]:
            print(f"  * {c['crop_name']} -> Score: {c['suitability_score']}% ({c['suitability_category']})")

        # 3. KOLAR (Eastern Dry Zone - Rainfed / Drought-hardy, Red Sandy Loam)
        print("\n=== TEST 3: Kolar District (Rainfed / Limited Water, Red Sandy Loam, Kharif) ===")
        kolar_payload = {
            "latitude": 13.1367,
            "longitude": 78.1291,
            "district": "Kolar",
            "state": "Karnataka",
            "season": "Kharif",
            "soil_type": "Red Sandy Loam",
            "soil_ph": 6.2,
            "water_availability": "Rainfed / Limited"
        }
        r3 = requests.post(base, json=kolar_payload)
        print("Status Code:", r3.status_code)
        assert r3.status_code == 200
        d3 = r3.json()["data"]
        print("Top Crops for Kolar (Water-stressed):")
        for c in d3["recommended_crops"][:3]:
            print(f"  * {c['crop_name']} -> Score: {c['suitability_score']}% ({c['suitability_category']})")
            print(f"    Reason: {c['reasons_for_recommendation'][0]}")

        # 4. KALABURAGI (Rabi Season Pulses, Black Soil)
        print("\n=== TEST 4: Kalaburagi District (Rabi Season, Black Soil) ===")
        kalaburagi_payload = {
            "latitude": 17.3297,
            "longitude": 76.8343,
            "district": "Kalaburagi",
            "state": "Karnataka",
            "season": "Rabi",
            "soil_type": "Black Soil",
            "soil_ph": 7.8,
            "water_availability": "Moderate / Borewell"
        }
        r4 = requests.post(base, json=kalaburagi_payload)
        print("Status Code:", r4.status_code)
        assert r4.status_code == 200
        d4 = r4.json()["data"]
        print("Top Crops for Kalaburagi in Rabi:")
        for c in d4["recommended_crops"][:2]:
            print(f"  * {c['crop_name']} -> Score: {c['suitability_score']}% ({c['suitability_category']})")

        print("\n=== ALL KARNATAKA CROP RECOMMENDATION TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_crop_tests()

