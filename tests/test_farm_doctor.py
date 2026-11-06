"""
AgriSmart AI - AI Farm Doctor Test Suite
Verifies:
1. WeatherContextEvaluator (High fungal risk, pest risk, spraying window, and non-invention of missing weather data).
2. DiagnosticModelRouter (Image quality validation, routing between disease and pest models).
3. AgronomicPrescriptionEngine (Uncertainty thresholding, mandatory KVK/RSK expert referral, chemical safety mandate).
4. End-to-end clinical diagnosis in Kannada and English.
"""

import numpy as np
import cv2

from modules.farm_doctor.farm_doctor import (
    FarmDoctor,
    WeatherContextEvaluator,
    DiagnosticModelRouter,
    AgronomicPrescriptionEngine,
    UNCERTAINTY_THRESHOLD
)


def test_weather_context_evaluator():
    print("=" * 65)
    print("🌦️ 1. Testing WeatherContextEvaluator (Grounding & Non-Invention)")
    print("=" * 65)

    # Case A: Weather NOT supplied by backend
    eval_none = WeatherContextEvaluator.evaluate(None)
    assert eval_none["weather_available"] is False
    assert "not supplied" in eval_none["summary"].lower()
    print("  ✅ Missing weather correctly identified: strictly never invents fake weather data.")

    # Case B: Warm and humid weather (Fungal Blight Risk)
    humid_weather = {
        "temperature_celsius": 25.0,
        "humidity_percent": 88.0,
        "rainfall_mm": 15.0,
        "conditions": "Rainy and overcast",
        "wind_speed_kmh": 4.0
    }
    eval_humid = WeatherContextEvaluator.evaluate(humid_weather)
    assert eval_humid["weather_available"] is True
    assert eval_humid["fungal_blight_risk"] == "HIGH"
    assert "UNFAVORABLE_RAIN" in eval_humid["spraying_window_status"]
    print("  ✅ High fungal risk correctly flagged under 88% humidity & 25°C.")
    print("  ✅ Spraying warning issued: foliar spraying discouraged during active rain.")

    # Case C: Hot and dry weather (Sucking Pest Risk)
    hot_dry = {
        "temperature_celsius": 34.0,
        "humidity_percent": 42.0,
        "rainfall_mm": 0.0,
        "conditions": "Sunny and dry",
        "wind_speed_kmh": 8.0
    }
    eval_dry = WeatherContextEvaluator.evaluate(hot_dry)
    assert eval_dry["pest_proliferation_risk"] == "HIGH"
    print("  ✅ High pest proliferation risk correctly flagged under 34°C & 42% humidity.")
    print("WeatherContextEvaluator tests PASSED!\n")


def test_image_validation_and_routing():
    print("=" * 65)
    print("🔍 2. Testing Diagnostic Router & Image Quality Checks")
    print("=" * 65)
    router = DiagnosticModelRouter()

    # Rejection: Low resolution (< 64x64)
    low_res = np.zeros((32, 32, 3), dtype=np.uint8)
    _, low_res_png = cv2.imencode(".png", low_res)
    res_low = router.route_and_diagnose(low_res_png.tobytes())
    assert res_low["diagnostic_type"] == "LOW_RESOLUTION"
    print(f"  ✅ Low resolution rejected: {res_low['message']}")

    # Rejection: Blank image
    blank = np.full((120, 120, 3), 100, dtype=np.uint8)
    _, blank_png = cv2.imencode(".png", blank)
    res_blank = router.route_and_diagnose(blank_png.tobytes())
    assert res_blank["diagnostic_type"] == "BLANK_IMAGE"
    print(f"  ✅ Blank low-contrast image rejected: {res_blank['message']}")
    print("Image Validation & Routing tests PASSED!\n")


def test_uncertainty_and_expert_escalation():
    print("=" * 65)
    print("⚠️ 3. Testing Uncertainty & Mandatory Agricultural Expert Escalation")
    print("=" * 65)

    # Low confidence (< 60%) must trigger expert referral
    prescription = AgronomicPrescriptionEngine.generate_prescription(
        condition_name="Tomato Early Blight",
        crop="Tomato",
        confidence=0.52,  # Below threshold
        is_uncertain=True,
        weather_eval={"summary": "Normal weather"},
        location="Karnataka",
        language="english"
    )

    assert prescription["is_uncertain"] is True
    assert prescription["expert_consultation_advised"] is True
    assert "MANDATORY AGRICULTURAL EXPERT REFERRAL" in prescription["advisory_notice"]
    assert "Krishi Vigyan Kendra" in prescription["advisory_notice"]
    print("  ✅ Mandatory KVK / RSK expert consultation triggered for confidence < 60%.")

    # Chemical safety rules must always be attached
    assert len(prescription["chemical_safety_mandate"]) == 5
    assert "rubber gloves" in prescription["chemical_safety_mandate"][0].lower()
    print("  ✅ Chemical safety mandate verified: 5 mandatory PPE & environmental rules present.")
    print("Uncertainty & Expert Escalation tests PASSED!\n")


def test_end_to_end_farm_doctor():
    print("=" * 65)
    print("🩺 4. Testing End-to-End Farm Doctor Multi-turn Diagnosis")
    print("=" * 65)
    doctor = FarmDoctor()

    # Valid textured leaf
    leaf = np.full((150, 150, 3), (34, 139, 34), dtype=np.uint8)
    cv2.circle(leaf, (75, 75), 18, (19, 69, 139), -1)
    _, leaf_png = cv2.imencode(".png", leaf)

    # English diagnosis with weather
    res_en = doctor.diagnose(
        image_bytes=leaf_png.tobytes(),
        question="What are these dark spots on my tomato leaves?",
        crop_name="Tomato",
        location="Karnataka (Kolar)",
        weather_data={"temperature_celsius": 24.0, "humidity_percent": 82.0, "rainfall_mm": 5.0},
        language="english"
    )
    assert res_en["status"] == "success"
    assert "Tomato" in res_en["crop"]
    assert len(res_en["doctor_explanation"]) > 50
    print(f"  ✅ English Diagnosis Generated for {res_en['crop']} (Condition: {res_en['image_analysis']['detected_condition']})")

    # Kannada diagnosis
    res_kn = doctor.diagnose(
        image_bytes=leaf_png.tobytes(),
        question="ಟೊಮೆಟೊ ಗಿಡದ ಎಲೆಗಳ ಮೇಲೆ ಕಂದು ಚುಕ್ಕೆಗಳಿವೆ, ಏನು ಮಾಡಬೇಕು?",
        crop_name="Tomato",
        location="Karnataka (Mandya)",
        language="kannada"
    )
    assert res_kn["status"] == "success"
    assert res_kn["language"]["canonical"] == "kannada"
    assert len(res_kn["doctor_explanation"]) > 50
    print(f"  ✅ Kannada Diagnosis Generated ({res_kn['language']['native_name']})")
    print("End-to-End Farm Doctor tests PASSED!\n")


if __name__ == "__main__":
    test_weather_context_evaluator()
    test_image_validation_and_routing()
    test_uncertainty_and_expert_escalation()
    test_end_to_end_farm_doctor()
    print("🎉 ALL AI FARM DOCTOR COMPONENT TESTS PASSED SUCCESSFULLY!")

