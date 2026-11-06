"""
AgriSmart AI - FastAPI Core AI Endpoint Test Suite
Verifies:
1. OpenAPI Schema Specification (all 6 endpoints registered with full documentation).
2. GET / - Root API directory & health status.
3. POST /ai/disease-detection - Vision leaf disease classification.
4. POST /ai/pest-detection - Agricultural insect & pest identification.
5. POST /ai/yield-prediction - Tabular Random Forest harvest forecasting.
6. POST /ai/chatbot - Multilingual Gemini farming consultation.
7. POST /ai/farm-doctor - Integrated clinical diagnostics with weather context.
8. POST /ai/voice-assistant - Speech-to-text -> Chatbot -> Speech synthesis loop.
"""

import asyncio
import io
import json
import cv2
import numpy as np
from fastapi import UploadFile

from app.main import app, root
from app.routes.ai_service_routes import (
    detect_crop_disease,
    detect_agricultural_pest,
    predict_crop_yield,
    ask_agricultural_chatbot,
    consult_farm_doctor,
    process_voice_assistant_query,
    YieldPredictionPayload,
    ChatbotQueryPayload
)


def test_openapi_documentation_spec():
    print("=" * 65)
    print("📋 1. Testing OpenAPI / Swagger Specification Generation")
    print("=" * 65)
    spec = app.openapi()
    assert spec["info"]["title"] == "AgriSmart AI - AI & ML Engine"
    paths = spec["paths"]

    required_endpoints = [
        "/ai/disease-detection",
        "/ai/pest-detection",
        "/ai/yield-prediction",
        "/ai/chatbot",
        "/ai/farm-doctor",
        "/ai/voice-assistant"
    ]

    for ep in required_endpoints:
        assert ep in paths, f"Endpoint {ep} missing from OpenAPI schema!"
        assert "post" in paths[ep], f"Endpoint {ep} must support HTTP POST method!"
        summary = paths[ep]["post"].get("summary", "")
        print(f"  ✅ {ep:<25} -> POST supported | Summary: '{summary}'")

    print("OpenAPI Specification tests PASSED!\n")


def test_root_endpoint():
    print("=" * 65)
    print("🌐 2. Testing Root Directory (GET /)")
    print("=" * 65)
    res = root()
    assert res["status"] == "online"
    assert "primary_ai_endpoints" in res
    assert res["primary_ai_endpoints"]["yield_prediction"] == "POST /ai/yield-prediction"
    print("  ✅ Root directory returned online status and complete endpoint directory.")
    print("Root Endpoint Test PASSED!\n")


def test_yield_prediction_endpoint():
    print("=" * 65)
    print("🌾 3. Testing POST /ai/yield-prediction")
    print("=" * 65)
    payload = YieldPredictionPayload(
        crop="Rice",
        location="Karnataka",
        land_area_hectares=3.0,
        rainfall_mm=1200.0,
        temperature_celsius=26.5,
        soil_type="Clay Loam",
        soil_ph=6.2,
        season="Kharif",
        fertilizer_kg=330.0,
        pesticide_kg=10.5
    )
    res = predict_crop_yield(payload)
    assert res["success"] is True
    forecast = res["data"]
    assert forecast["crop"] == "Rice"
    assert forecast["yield_per_hectare"]["value"] > 0
    assert forecast["total_estimated_production"]["metric_tons"] > 0
    assert "disclaimer" in forecast
    print(f"  ✅ Rice Forecast: {forecast['yield_per_hectare']['value']} Tons/ha | Total: {forecast['total_estimated_production']['metric_tons']} Metric Tons ({forecast['total_estimated_production']['quintals']} Quintals)")
    print("Yield Prediction Endpoint Test PASSED!\n")


def test_chatbot_endpoint():
    print("=" * 65)
    print("💬 4. Testing POST /ai/chatbot")
    print("=" * 65)
    payload = ChatbotQueryPayload(
        question="ನನ್ನ ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
        language="kannada"
    )
    res = ask_agricultural_chatbot(payload)
    assert res["success"] is True
    data = res["data"]
    assert data["language"]["canonical"] == "kannada"
    assert len(data["reply"]) > 30
    print(f"  ✅ Kannada Reply Generated: '{data['reply'][:75]}...'")
    print("Chatbot Endpoint Test PASSED!\n")


def test_disease_detection_endpoint():
    print("=" * 65)
    print("🍃 5. Testing POST /ai/disease-detection")
    print("=" * 65)
    # Synthetic leaf image
    leaf = np.full((120, 120, 3), (34, 139, 34), dtype=np.uint8)
    cv2.circle(leaf, (60, 60), 15, (19, 69, 139), -1)
    _, leaf_png = cv2.imencode(".png", leaf)

    upload_file = UploadFile(
        file=io.BytesIO(leaf_png.tobytes()),
        filename="tomato_leaf.png",
        headers={"content-type": "image/png"}
    )
    res = detect_crop_disease(image=upload_file)
    assert "data" in res
    print(f"  ✅ Image Disease Analysis executed (Status: {res['data'].get('status')})")
    print("Disease Detection Endpoint Test PASSED!\n")


def test_pest_detection_endpoint():
    print("=" * 65)
    print("🦗 6. Testing POST /ai/pest-detection")
    print("=" * 65)
    # Synthetic insect image
    insect = np.full((100, 100, 3), (25, 25, 25), dtype=np.uint8)
    cv2.circle(insect, (50, 50), 20, (180, 180, 180), -1)
    _, insect_png = cv2.imencode(".png", insect)

    upload_file = UploadFile(
        file=io.BytesIO(insect_png.tobytes()),
        filename="armyworm.png",
        headers={"content-type": "image/png"}
    )
    res = detect_agricultural_pest(image=upload_file)
    assert "data" in res
    print(f"  ✅ Pest Identification executed (Status: {res['data'].get('status')})")
    print("Pest Detection Endpoint Test PASSED!\n")


def test_farm_doctor_endpoint():
    print("=" * 65)
    print("🩺 7. Testing POST /ai/farm-doctor")
    print("=" * 65)
    weather_str = json.dumps({
        "temperature_celsius": 24.5,
        "humidity_percent": 86.0,
        "rainfall_mm": 12.0
    })
    res = consult_farm_doctor(
        symptoms="Dark brown target spots with concentric rings on lower leaves",
        crop_name="Tomato",
        location="Karnataka (Kolar)",
        weather_json=weather_str,
        language="english",
        image=None
    )
    assert res["success"] is True
    report = res["data"]
    assert report["weather_context"]["weather_available"] is True
    assert report["weather_context"]["fungal_blight_risk"] == "HIGH"
    assert len(report["doctor_explanation"]) > 30
    print(f"  ✅ Farm Doctor Diagnosis Generated (Fungal Risk: {report['weather_context']['fungal_blight_risk']})")
    print("Farm Doctor Endpoint Test PASSED!\n")


def test_voice_assistant_endpoint():
    print("=" * 65)
    print("🎙️ 8. Testing POST /ai/voice-assistant")
    print("=" * 65)
    from modules.voice_assistant.voice_assistant import get_voice_assistant
    sample_wav = get_voice_assistant()._synthesize_wav_audio("Sample voice audio")

    upload_file = UploadFile(
        file=io.BytesIO(sample_wav),
        filename="query.wav",
        headers={"content-type": "audio/wav"}
    )
    res = process_voice_assistant_query(audio_file=upload_file, language="kannada")
    assert res["success"] is True
    data = res["data"]
    assert len(data["farmer_speech_transcription"]) > 0
    assert len(data["chatbot_text_response"]) > 0
    assert data["speech_audio_response"]["audio_size_bytes"] > 1000
    print(f"  ✅ Voice In -> Transcription: '{data['farmer_speech_transcription']}'")
    print(f"  ✅ Voice Out -> Generated Audio: {data['speech_audio_response']['audio_size_bytes']} bytes ({data['speech_audio_response']['mime_type']})")
    print("Voice Assistant Endpoint Test PASSED!\n")


if __name__ == "__main__":
    test_openapi_documentation_spec()
    test_root_endpoint()
    test_yield_prediction_endpoint()
    test_chatbot_endpoint()
    test_disease_detection_endpoint()
    test_pest_detection_endpoint()
    test_farm_doctor_endpoint()
    test_voice_assistant_endpoint()
    print("🎉 ALL 6 CORE AI FASTAPI ENDPOINTS PASSED WITH 100% SUCCESS!")
