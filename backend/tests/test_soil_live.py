"""
Test suite for Soil Health Analyzer endpoint POST /api/soil/analyze.
Tests multiple realistic soil samples across diverse agro-climatic conditions.
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

def run_soil_tests():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000/api/soil/analyze"

    try:
        # SAMPLE 1: User's Example Input (Red Soil with low Nitrogen)
        print("=== SAMPLE 1: Red Soil (User's Example) ===")
        sample1 = {
            "ph": 6.5,
            "nitrogen": 240,
            "phosphorus": 25,
            "potassium": 180,
            "soil_type": "Red Soil"
        }
        r1 = requests.post(base, json=sample1)
        print("Status Code:", r1.status_code)
        assert r1.status_code == 200
        d1 = r1.json()["data"]
        print(f"Soil Type: {d1['soil_type_insight']['soil_type']}")
        print(f"Health Score: {d1['overall_health_score']} / 100 ({d1['health_rating']})")
        print(f"pH Category: {d1['ph_assessment']['category']} (Status: {d1['ph_assessment']['status']})")
        print("Nutrient Levels:")
        for n in d1["nutrient_analysis"]:
            print(f"  - {n['nutrient']}: {n['value']} {n['unit']} -> {n['level']}")
            print(f"    Simple Note: {n['simple_explanation']}")
        print(f"Verdict: {d1['summary_verdict']}")
        print("Top Recommendations:")
        for rec in d1["actionable_recommendations"][:2]:
            print(f"  * {rec}")

        # SAMPLE 2: Alkaline Black Soil with Low Phosphorus and High Potassium
        print("\n=== SAMPLE 2: Alkaline Black Soil ===")
        sample2 = {
            "ph": 8.2,
            "nitrogen": 320,
            "phosphorus": 8,
            "potassium": 350,
            "soil_type": "Black Soil",
            "soil_moisture_pct": 32.0,
            "organic_carbon_pct": 0.4
        }
        r2 = requests.post(base, json=sample2)
        print("Status Code:", r2.status_code)
        assert r2.status_code == 200
        d2 = r2.json()["data"]
        print(f"Health Score: {d2['overall_health_score']} / 100 ({d2['health_rating']})")
        print(f"pH Category: {d2['ph_assessment']['category']}")
        print(f"Moisture: {d2['soil_type_insight']['moisture_status']}")
        print("Phosphorus Status:", [n['level'] for n in d2['nutrient_analysis'] if 'Phosphorus' in n['nutrient']][0])
        print("Potassium Status:", [n['level'] for n in d2['nutrient_analysis'] if 'Potassium' in n['nutrient']][0])

        # SAMPLE 3: Acidic Laterite Soil with Severe Deficiencies
        print("\n=== SAMPLE 3: Strongly Acidic Laterite Soil ===")
        sample3 = {
            "ph": 4.8,
            "nitrogen": 190,
            "phosphorus": 6,
            "potassium": 80,
            "soil_type": "Laterite Soil",
            "soil_moisture_pct": 12.0
        }
        r3 = requests.post(base, json=sample3)
        print("Status Code:", r3.status_code)
        assert r3.status_code == 200
        d3 = r3.json()["data"]
        print(f"Health Score: {d3['overall_health_score']} / 100 ({d3['health_rating']})")
        print(f"pH Amendment: {d3['ph_assessment']['corrective_amendment']}")
        print(f"Moisture Status: {d3['soil_type_insight']['moisture_status']}")

        # SAMPLE 4: Ideal Balanced Alluvial Soil
        print("\n=== SAMPLE 4: Ideal Balanced Alluvial Soil ===")
        sample4 = {
            "ph": 7.0,
            "nitrogen": 380,
            "phosphorus": 20,
            "potassium": 220,
            "soil_type": "Alluvial Soil",
            "soil_moisture_pct": 25.0,
            "organic_carbon_pct": 0.8
        }
        r4 = requests.post(base, json=sample4)
        print("Status Code:", r4.status_code)
        assert r4.status_code == 200
        d4 = r4.json()["data"]
        print(f"Health Score: {d4['overall_health_score']} / 100 ({d4['health_rating']})")
        print(f"Verdict: {d4['summary_verdict']}")

        # SAMPLE 5: Validation Check (Invalid pH and negative Nitrogen)
        print("\n=== SAMPLE 5: Validation Check ===")
        sample5 = {
            "ph": 15.5,     # Invalid: > 14
            "nitrogen": -20, # Invalid: < 0
            "phosphorus": 25,
            "potassium": 180
        }
        r5 = requests.post(base, json=sample5)
        print("Invalid Sample Status Code:", r5.status_code)
        assert r5.status_code == 422
        print("Input validation confirmed: properly rejected invalid input with 422 Unprocessable Entity.")

        print("\n=== ALL SOIL HEALTH ANALYZER TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_soil_tests()

