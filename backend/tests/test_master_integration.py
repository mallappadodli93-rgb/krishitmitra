"""
AgriSmart AI - Member 3 Master Integration Test Suite.
Tests all 10 Member 3 modules across 16+ API endpoints, including
input validation, error handling, status codes, and JSON response contracts.
"""
import sys
import unittest
from pathlib import Path

# Set up project path
backend_dir = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(backend_dir))

from fastapi.testclient import TestClient
from app.main import app
from app.database.firebase import init_firebase, get_database_status

client = TestClient(app)

class TestAgriSmartAIMasterIntegration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n========================================================")
        print(" AGRI-SMART AI (MEMBER 3) - MASTER INTEGRATION TEST SUITE")
        print("========================================================")
        init_firebase()
        db_stat = get_database_status()
        print(f"[*] Database Status: {db_stat['status']} (Engine: {db_stat['engine']})")
        print(f"[*] Collections Available: {list(db_stat['collections'].keys())}")

    # -------------------------------------------------------------------------
    # 1. System, Health & Documentation Endpoints
    # -------------------------------------------------------------------------
    def test_01_root_welcome(self):
        """Test GET / welcome message."""
        res = client.get("/")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["message"], "Welcome to AgriSmart AI Backend")
        self.assertIn("documentation", data)
        self.assertIn("health", data)
        print("  [PASS] 01. Root welcome endpoint verified.")

    def test_02_health_checks(self):
        """Test GET /health and /api/health."""
        res1 = client.get("/health")
        self.assertEqual(res1.status_code, 200)
        self.assertEqual(res1.json()["status"], "healthy")

        res2 = client.get("/api/health")
        self.assertEqual(res2.status_code, 200)
        self.assertEqual(res2.json()["status"], "healthy")
        print("  [PASS] 02. Health check endpoints verified.")

    def test_03_api_documentation_endpoints(self):
        """Test OpenAPI documentation schema at /openapi.json."""
        res = client.get("/openapi.json")
        self.assertEqual(res.status_code, 200)
        schema = res.json()
        self.assertIn("paths", schema)
        self.assertIn("/api/weather/current", schema["paths"])
        self.assertIn("/api/soil/analyze", schema["paths"])
        self.assertIn("/api/crops/recommend", schema["paths"])
        self.assertIn("/api/irrigation/recommend", schema["paths"])
        self.assertIn("/api/calendar/generate", schema["paths"])
        self.assertIn("/api/water/register", schema["paths"])
        self.assertIn("/api/location/farmers", schema["paths"])
        print("  [PASS] 03. Swagger / OpenAPI schema verified with all Member 3 endpoints.")

    # -------------------------------------------------------------------------
    # 2. Weather Forecasting & Alert Module
    # -------------------------------------------------------------------------
    def test_04_weather_current_mysuru(self):
        """Test GET /api/weather/current with Mysuru coordinates."""
        # Mysuru: 12.2958 N, 76.6394 E
        res = client.get("/api/weather/current?latitude=12.2958&longitude=76.6394")
        self.assertIn(res.status_code, (200, 503)) # 503 if offline sandbox, 200 if online
        if res.status_code == 200:
            body = res.json()
            self.assertTrue(body["success"])
            d = body["data"]
            self.assertIn("temperature_c", d)
            self.assertIn("humidity_pct", d)
            self.assertIn("weather_condition", d)
            self.assertIn("agricultural_conditions", d)
            self.assertIn(d["agricultural_conditions"]["spray_window_status"], ["SUITABLE", "MARGINAL", "UNSUITABLE"])
            print(f"  [PASS] 04. Current weather for Mysuru verified: {d['temperature_c']}°C, {d['weather_condition']}.")
        else:
            print("  [PASS] 04. Current weather returned proper 503 error during offline sandbox.")

    def test_05_weather_forecast_mysuru(self):
        """Test GET /api/weather/forecast with 7-day analytics."""
        res = client.get("/api/weather/forecast?latitude=12.2958&longitude=76.6394")
        self.assertIn(res.status_code, (200, 503))
        if res.status_code == 200:
            body = res.json()
            self.assertTrue(body["success"])
            d = body["data"]
            self.assertEqual(len(d["daily_forecast"]), 7)
            self.assertIn("agricultural_summary", d)
            self.assertIn("total_7day_rainfall_mm", d["agricultural_summary"])
            print(f"  [PASS] 05. 7-Day weather forecast verified (7 daily items, total rain {d['agricultural_summary']['total_7day_rainfall_mm']}mm).")
        else:
            print("  [PASS] 05. 7-Day weather forecast handled gracefully.")

    def test_06_weather_alerts(self):
        """Test GET /api/weather/alerts."""
        res = client.get("/api/weather/alerts?latitude=12.2958&longitude=76.6394")
        self.assertIn(res.status_code, (200, 503))
        if res.status_code == 200:
            body = res.json()
            self.assertTrue(body["success"])
            d = body["data"]
            self.assertIn(d["safety_status"], ["CLEAR", "ADVISORY", "CRITICAL"])
            print(f"  [PASS] 06. Weather hazard alerts verified: Safety status '{d['safety_status']}'.")
        else:
            print("  [PASS] 06. Weather alerts handled gracefully.")

    def test_07_weather_validation(self):
        """Test weather endpoint latitude/longitude validation error (422)."""
        res = client.get("/api/weather/current?latitude=999.0&longitude=76.6394")
        self.assertEqual(res.status_code, 422)
        print("  [PASS] 07. Weather validation properly returned 422 for out-of-range latitude.")

    # -------------------------------------------------------------------------
    # 3. Soil Health Analyzer Module
    # -------------------------------------------------------------------------
    def test_08_soil_analyzer_red_soil(self):
        """Test POST /api/soil/analyze with user's Red Soil sample."""
        payload = {
            "ph": 6.5,
            "nitrogen": 240,
            "phosphorus": 25,
            "potassium": 180,
            "soil_type": "Red Soil"
        }
        res = client.post("/api/soil/analyze", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        d = body["data"]
        self.assertEqual(d["overall_health_score"], 85.0)
        self.assertEqual(d["ph_assessment"]["status"], "OPTIMAL")
        # Check that Nitrogen is identified as deficient
        nitrogen_analysis = next(n for n in d["nutrient_analysis"] if "Nitrogen" in n["nutrient"])
        self.assertIn("DEFICIENT", nitrogen_analysis["level"])
        self.assertGreater(len(d["actionable_recommendations"]), 0)
        print("  [PASS] 08. Soil Health Analyzer verified with User's Red Soil sample.")

    def test_09_soil_analyzer_validation(self):
        """Test POST /api/soil/analyze validation for out-of-range pH."""
        invalid_payload = {
            "ph": 16.5, # Invalid pH > 14
            "nitrogen": 200,
            "phosphorus": 20,
            "potassium": 150
        }
        res = client.post("/api/soil/analyze", json=invalid_payload)
        self.assertEqual(res.status_code, 422)
        print("  [PASS] 09. Soil Analyzer rejected invalid pH 16.5 with 422 Unprocessable Entity.")

    # -------------------------------------------------------------------------
    # 4. Location-Based Crop Recommendation Module
    # -------------------------------------------------------------------------
    def test_10_crop_recommendation_mandya(self):
        """Test POST /api/crops/recommend for Mandya (Canal, Red Soil, Kharif)."""
        payload = {
            "latitude": 12.5218,
            "longitude": 76.8951,
            "district": "Mandya",
            "state": "Karnataka",
            "season": "Kharif",
            "soil_type": "Red Soil",
            "soil_ph": 6.8,
            "water_availability": "Abundant / Canal"
        }
        res = client.post("/api/crops/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        d = body["data"]
        self.assertGreater(len(d["recommended_crops"]), 0)
        top_crop = d["recommended_crops"][0]
        self.assertIn(top_crop["crop_name"], ["Paddy / Rice", "Sugarcane", "Maize", "Ragi (Finger Millet)"])
        self.assertGreaterEqual(top_crop["suitability_score"], 70)
        self.assertIn("water_requirements", top_crop)
        self.assertIn("reasons_for_recommendation", top_crop)
        print(f"  [PASS] 10. Crop recommendation verified: Top crop '{top_crop['crop_name']}' ({top_crop['suitability_score']}%).")

    # -------------------------------------------------------------------------
    # 5. Smart Irrigation Recommendation Module
    # -------------------------------------------------------------------------
    def test_11_irrigation_recommendation_flowering(self):
        """Test POST /api/irrigation/recommend with dry soil and dry forecast."""
        payload = {
            "crop_name": "Maize",
            "crop_stage": "Flowering / Panicle",
            "soil_type": "Red Soil",
            "soil_moisture_pct": 14.0, # Dry / water-stressed
            "rainfall_forecast_mm": 0.0,
            "water_availability": "Moderate / Borewell"
        }
        res = client.post("/api/irrigation/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        d = body["data"]
        self.assertEqual(d["irrigation_status"], "IRRIGATE_NOW")
        self.assertEqual(d["urgency"], "HIGH")
        self.assertIn("water_saving_suggestions", d)
        print("  [PASS] 11. Smart Irrigation correctly advised IRRIGATE_NOW for water-stressed flowering Maize.")

    def test_12_irrigation_rain_warning(self):
        """Test POST /api/irrigation/recommend when heavy rainfall is forecast."""
        payload = {
            "crop_name": "Paddy",
            "crop_stage": "Vegetative",
            "soil_type": "Clayey",
            "soil_moisture_pct": 45.0,
            "rainfall_forecast_mm": 45.0, # Heavy rain forecast
            "water_availability": "Abundant / Canal"
        }
        res = client.post("/api/irrigation/recommend", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        d = body["data"]
        self.assertIn(d["irrigation_status"], ["SKIP_IRRIGATION", "DELAY_IRRIGATION"])
        self.assertTrue(d["weather_impact"]["rainfall_warning"])
        print(f"  [PASS] 12. Smart Irrigation rain warning triggered: '{d['irrigation_status']}'.")

    # -------------------------------------------------------------------------
    # 6. Smart Crop Calendar Module
    # -------------------------------------------------------------------------
    def test_13_crop_calendar_generate_maize(self):
        """Test POST /api/calendar/generate for Maize."""
        payload = {
            "crop_name": "Maize",
            "sowing_date": "2026-06-15",
            "variety": "Deccan-103",
            "season": "Kharif",
            "district": "Mysuru",
            "state": "Karnataka",
            "farmer_id": "FARMER-TEST-MAIZE"
        }
        res = client.post("/api/calendar/generate", json=payload)
        self.assertEqual(res.status_code, 200)
        body = res.json()
        self.assertTrue(body["success"])
        d = body["data"]
        self.assertEqual(d["crop_name"], "Maize (Corn)")
        self.assertEqual(d["total_duration_days"], 105)
        self.assertGreater(len(d["stages"]), 3)
        self.assertIn("estimated_harvest_window", d)
        print(f"  [PASS] 13. Crop calendar generated for {d['crop_name']} ({d['total_duration_days']} days).")

    def test_14_crop_calendar_get_by_farmer_or_crop(self):
        """Test GET /api/calendar/{farmer_id}."""
        # 1. Existing saved farmer calendar
        res1 = client.get("/api/calendar/FARMER-TEST-MAIZE")
        self.assertEqual(res1.status_code, 200)
        self.assertTrue(res1.json()["success"])

        # 2. Dynamic crop calendar generation by crop name
        res2 = client.get("/api/calendar/ragi")
        self.assertEqual(res2.status_code, 200)
        self.assertTrue(res2.json()["success"])

        # 3. Non-existent farmer ID returns 404
        res3 = client.get("/api/calendar/NON_EXISTENT_FARMER_12345")
        self.assertEqual(res3.status_code, 404)
        print("  [PASS] 14. Crop calendar retrieval verified (farmer lookup, dynamic crop lookup, 404 handling).")

    # -------------------------------------------------------------------------
    # 7. Water Availability Management Module
    # -------------------------------------------------------------------------
    def test_15_water_profile_register_and_get(self):
        """Test POST /api/water/register and GET /api/water/{farmer_id}."""
        farmer_id = "FARMER-WATER-99"
        payload = {
            "farmer_id": farmer_id,
            "farm_name": "Mysuru Eco Farm",
            "total_farm_acres": 4.5,
            "water_sources": [
                {
                    "source_type": "borewell",
                    "status": "ACTIVE",
                    "daily_capacity_liters": 15000.0,
                    "operating_hours_per_day": 4.0,
                    "depth_feet": 280.0
                },
                {
                    "source_type": "pond",
                    "status": "ACTIVE",
                    "storage_capacity_liters": 50000.0,
                    "current_level_pct": 75.0
                }
            ],
            "has_drip_irrigation": True,
            "self_assessed_security": "Moderate"
        }
        reg_res = client.post("/api/water/register", json=payload)
        self.assertEqual(reg_res.status_code, 201)
        reg_data = reg_res.json()["data"]
        self.assertEqual(reg_data["registered_sources_count"], 2)
        self.assertIn("overall_water_security", reg_data)

        # Retrieve dashboard
        get_res = client.get(f"/api/water/{farmer_id}")
        self.assertEqual(get_res.status_code, 200)
        get_data = get_res.json()["data"]
        self.assertEqual(get_data["farmer_id"], farmer_id)
        self.assertEqual(get_data["registered_sources_count"], 2)
        print(f"  [PASS] 15. Water registration & dashboard retrieved: Security '{get_data['overall_water_security']}'.")

    def test_16_water_profile_update(self):
        """Test PUT /api/water/{farmer_id} updating water sources."""
        farmer_id = "FARMER-WATER-99"
        update_payload = {
            "has_drip_irrigation": True,
            "self_assessed_security": "Abundant",
            "notes": "Added rainwater harvesting system."
        }
        res = client.put(f"/api/water/{farmer_id}", json=update_payload)
        self.assertEqual(res.status_code, 200)
        d = res.json()["data"]
        self.assertEqual(d["farmer_id"], farmer_id)
        print("  [PASS] 16. Water availability profile updated successfully.")

    def test_17_water_unknown_farmer(self):
        """Test GET /api/water/{farmer_id} for unknown farmer returns 404."""
        res = client.get("/api/water/UNKNOWN_WATER_FARMER_XYZ")
        self.assertEqual(res.status_code, 404)
        print("  [PASS] 17. Unknown farmer water query properly returned 404 Not Found.")

    # -------------------------------------------------------------------------
    # 8. Farmer Location & Database Status Module
    # -------------------------------------------------------------------------
    def test_18_farmer_profile_create_and_list(self):
        """Test POST /api/location/farmers and GET /api/location/farmers."""
        new_farmer = {
            "name": "Basavaraju Patil",
            "phone": "9876543210",
            "village": "Nanjangud",
            "district": "Mysuru",
            "state": "Karnataka",
            "latitude": 12.1192,
            "longitude": 76.6806,
            "farm_size_acres": 3.5,
            "soil_type": "Red Soil",
            "primary_crops": ["Maize", "Ragi"]
        }
        post_res = client.post("/api/location/farmers", json=new_farmer)
        self.assertEqual(post_res.status_code, 201)
        created = post_res.json()["data"]
        farmer_id = created["farmer_id"]
        self.assertIsNotNone(farmer_id)

        # Fetch single farmer
        single_res = client.get(f"/api/location/farmers/{farmer_id}")
        self.assertEqual(single_res.status_code, 200)
        self.assertEqual(single_res.json()["data"]["name"], "Basavaraju Patil")

        # List all farmers
        list_res = client.get("/api/location/farmers")
        self.assertEqual(list_res.status_code, 200)
        self.assertGreater(len(list_res.json()["data"]), 0)
        print(f"  [PASS] 18. Farmer profile created ({farmer_id}), fetched, and listed successfully.")

    def test_19_database_status_diagnostics(self):
        """Test GET /api/location/database/status for Firestore diagnostics."""
        res = client.get("/api/location/database/status")
        self.assertEqual(res.status_code, 200)
        status_data = res.json()["data"]
        self.assertIn("status", status_data)
        self.assertIn("engine", status_data)
        self.assertEqual(len(status_data["collections"]), 7)
        # Ensure credentials are NOT leaked
        self.assertNotIn("private_key", str(status_data))
        self.assertNotIn("client_email", str(status_data))
        print(f"  [PASS] 19. Database diagnostics confirmed ({status_data['engine']}, 7 collections).")

    # -------------------------------------------------------------------------
    # 9. CORS & Security Verification
    # -------------------------------------------------------------------------
    def test_20_cors_headers(self):
        """Verify CORS headers for frontend teammates on localhost:3000 and localhost:5173."""
        headers = {
            "Origin": "http://localhost:5173",
            "Access-Control-Request-Method": "POST"
        }
        res = client.options("/api/soil/analyze", headers=headers)
        self.assertIn(res.status_code, (200, 204))
        self.assertIn("access-control-allow-origin", res.headers)
        print("  [PASS] 20. CORS headers verified for React/Vite development server.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
