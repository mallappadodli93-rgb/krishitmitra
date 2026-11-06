"""
Live test suite for Smart Crop Calendar module.
Validates dynamic stage duration, estimated date calculation, irrigation reminders,
and monitoring advisories for Maize, Paddy, and Ragi.
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

def run_calendar_tests():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000/api/calendar"

    try:
        # 1. TEST MAIZE (105 Days)
        print("=== TEST 1: Smart Crop Calendar for MAIZE ===")
        maize_req = {
            "crop_name": "Maize",
            "sowing_date": "2026-11-15",
            "variety": "Deccan-103 Hybrid",
            "season": "Kharif",
            "district": "Davanagere",
            "state": "Karnataka",
            "farmer_id": "FARMER-DVG-01"
        }
        r1 = requests.post(f"{base}/generate", json=maize_req)
        print("Status Code:", r1.status_code)
        assert r1.status_code == 200
        d1 = r1.json()["data"]
        print(f"Crop: {d1['crop_name']} | Variety: {d1['variety']}")
        print(f"Sowing Date: {d1['sowing_date']} | Total Lifecycle: {d1['total_duration_days']} Days")
        print(f"Harvest Window: {d1['estimated_harvest_window']}")
        print("Growth Stages:")
        for s in d1["stages"]:
            print(f"  [{s['stage_name']}] Days {s['day_start']}-{s['day_end']} ({s['estimated_start_date']} to {s['estimated_end_date']})")
            print(f"    * Water Need: {s['water_need']} | Reminder: {s['irrigation_reminder'][:65]}...")
            print(f"    * Monitoring: {s['monitoring_reminder'][:65]}...")
        assert d1["total_duration_days"] == 105

        # 2. TEST PADDY (130 Days)
        print("\n=== TEST 2: Smart Crop Calendar for PADDY (RICE) ===")
        paddy_req = {
            "crop_name": "Paddy",
            "sowing_date": "2026-11-15",
            "variety": "Jaya (Medium Duration)",
            "season": "Kharif",
            "district": "Mandya",
            "state": "Karnataka",
            "farmer_id": "FARMER-MDY-02"
        }
        r2 = requests.post(f"{base}/generate", json=paddy_req)
        print("Status Code:", r2.status_code)
        assert r2.status_code == 200
        d2 = r2.json()["data"]
        print(f"Crop: {d2['crop_name']} | Total Lifecycle: {d2['total_duration_days']} Days")
        print(f"Harvest Window: {d2['estimated_harvest_window']}")
        panicle_stage = [s for s in d2["stages"] if "Panicle" in s["stage_name"]][0]
        print(f"Critical Stage: {panicle_stage['stage_name']} ({panicle_stage['estimated_start_date']} to {panicle_stage['estimated_end_date']})")
        print(f"Panicle Water Reminder: {panicle_stage['irrigation_reminder']}")
        assert d2["total_duration_days"] == 130

        # 3. TEST RAGI (115 Days)
        print("\n=== TEST 3: Smart Crop Calendar for RAGI (FINGER MILLET) ===")
        ragi_req = {
            "crop_name": "Ragi",
            "sowing_date": "2026-11-15",
            "variety": "GPU-28",
            "season": "Kharif",
            "district": "Mysuru",
            "state": "Karnataka",
            "farmer_id": "FARMER-MYS-03"
        }
        r3 = requests.post(f"{base}/generate", json=ragi_req)
        print("Status Code:", r3.status_code)
        assert r3.status_code == 200
        d3 = r3.json()["data"]
        print(f"Crop: {d3['crop_name']} | Total Lifecycle: {d3['total_duration_days']} Days")
        print(f"Harvest Window: {d3['estimated_harvest_window']}")
        earhead_stage = [s for s in d3["stages"] if "Earhead" in s["stage_name"]][0]
        print(f"Earhead Stage: {earhead_stage['stage_name']} ({earhead_stage['estimated_start_date']} to {earhead_stage['estimated_end_date']})")
        print(f"Earhead Monitoring Reminder: {earhead_stage['monitoring_reminder']}")
        assert d3["total_duration_days"] == 115

        # 4. TEST RETRIEVING CALENDAR BY FARMER ID
        print("\n=== TEST 4: Retrieve Saved Calendar by Farmer ID ===")
        r_get = requests.get(f"{base}/FARMER-DVG-01")
        print("Status Code:", r_get.status_code)
        assert r_get.status_code == 200
        d_get = r_get.json()["data"]
        print(f"Retrieved saved calendar for {d_get['farmer_id']}: {d_get['crop_name']} ({d_get['total_duration_days']} days)")
        assert d_get["farmer_id"] == "FARMER-DVG-01"

        print("\n=== ALL SMART CROP CALENDAR TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_calendar_tests()

