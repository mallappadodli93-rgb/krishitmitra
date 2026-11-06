"""
Live test script for Weather Forecasting module using Mysuru coordinates.
"""
import sys
import time
import threading
from pathlib import Path
import requests

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

import uvicorn
from app.main import app

def run_live_test():
    server_config = uvicorn.Config(app, host="127.0.0.1", port=8000, log_level="warning")
    server = uvicorn.Server(server_config)

    thread = threading.Thread(target=server.run, daemon=True)
    thread.start()
    time.sleep(2)

    base = "http://127.0.0.1:8000"
    lat, lon = 12.2958, 76.6394  # Mysuru, Karnataka

    try:
        print("=== 1. TESTING /api/weather/current (Mysuru) ===")
        r_curr = requests.get(f"{base}/api/weather/current?latitude={lat}&longitude={lon}")
        print("Status Code:", r_curr.status_code)
        assert r_curr.status_code == 200
        data_curr = r_curr.json()["data"]
        print(f"Location: {data_curr['latitude']}, {data_curr['longitude']} ({data_curr['timezone']})")
        print(f"Current Temp: {data_curr['temperature_c']}°C (Feels like: {data_curr['apparent_temperature_c']}°C)")
        print(f"Today's Min: {data_curr['temp_min_today_c']}°C | Max: {data_curr['temp_max_today_c']}°C")
        print(f"Humidity: {data_curr['humidity_pct']}% | Wind: {data_curr['wind_speed_kmh']} km/h | Rain: {data_curr['rainfall_mm']} mm")
        print(f"Weather Condition: {data_curr['weather_condition']} (Code: {data_curr['weather_code']})")
        agri = data_curr["agricultural_conditions"]
        print(f"Spray Window Status: {agri['spray_window_status']} ({agri['spray_window_reason']})")
        print(f"Crop Heat Stress: {agri['heat_stress_level']}")
        print(f"Fungal Infection Risk: {agri['fungal_disease_risk']}")

        print("\n=== 2. TESTING /api/weather/forecast (7-Day Mysuru) ===")
        r_fc = requests.get(f"{base}/api/weather/forecast?latitude={lat}&longitude={lon}")
        print("Status Code:", r_fc.status_code)
        assert r_fc.status_code == 200
        data_fc = r_fc.json()["data"]
        print(f"Total Forecast Days: {len(data_fc['daily_forecast'])}")
        for day in data_fc["daily_forecast"][:3]:
            print(f" - {day['date']}: {day['weather_condition']} | Min: {day['temp_min_c']}°C, Max: {day['temp_max_c']}°C | Rain: {day['precipitation_sum_mm']} mm (Prob: {day['precipitation_probability_max_pct']}%)")
            print(f"   Advisory: {day['farming_advisory']}")

        agri_sum = data_fc["agricultural_summary"]
        print(f"\nPandas 7-Day Total Rain: {agri_sum['total_7day_rainfall_mm']} mm")
        print(f"Pandas 7-Day Average Temp: {agri_sum['average_temp_c']}°C")
        print(f"Rainiest Day: {agri_sum['rainiest_day']} ({agri_sum['rainiest_day_amount_mm']} mm)")
        print(f"Hottest Day: {agri_sum['hottest_day']} ({agri_sum['max_temp_peak_c']}°C)")
        print(f"Irrigation Outlook: {agri_sum['irrigation_outlook']}")
        print(f"Overall Outlook: {agri_sum['overall_farming_outlook']}")

        print("\n=== 3. TESTING /api/weather/alerts (Mysuru) ===")
        r_alt = requests.get(f"{base}/api/weather/alerts?latitude={lat}&longitude={lon}")
        print("Status Code:", r_alt.status_code)
        assert r_alt.status_code == 200
        data_alt = r_alt.json()["data"]
        print(f"Safety Status: {data_alt['safety_status']} | Active Alerts: {data_alt['active_alerts_count']}")
        for a in data_alt["alerts"]:
            print(f"  [{a['severity']}] {a['alert_type']}: {a['message']}")
            print(f"  Observed: {a['observed_value']} (Threshold: {a['threshold_value']})")
            print(f"  Action: {a['recommended_action']}")

        print("\n=== 4. TESTING COORDINATE VALIDATION ===")
        r_invalid = requests.get(f"{base}/api/weather/current?latitude=150.0&longitude={lon}")
        print("Invalid Latitude 150.0 -> HTTP Status:", r_invalid.status_code)
        assert r_invalid.status_code == 422
        print("Coordinate validation confirmed!")

        print("\n=== ALL WEATHER MODULE TESTS PASSED! ===")

    finally:
        server.should_exit = True
        thread.join(timeout=2)

if __name__ == "__main__":
    run_live_test()

