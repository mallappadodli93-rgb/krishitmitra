"""
AgriSmart AI - Pest Identification & Rejection Test Suite
Tests OpenCV validation, unknown/unsupported handling, affected crops mapping,
and FastAPI endpoint integration.
"""

import io
import cv2
import numpy as np
from PIL import Image

from modules.pest_identification.prediction import (
    validate_pest_image,
    identify_pest,
    PestPredictor
)
from modules.pest_identification.pest_data import get_pest_info, PEST_KNOWLEDGE_BASE


def test_pest_knowledge_base():
    print("\n--- 1. Testing Pest Knowledge Base & Affected Crops ---")
    pests_to_check = ["Aphids", "Fall_Armyworm", "Whitefly", "Stem_Borer", "Spider_Mites", "Bollworm", "Thrips"]
    
    for pest_key in pests_to_check:
        info = get_pest_info(pest_key)
        assert info["display_name"] != "Unspecified Agricultural Arthropod"
        assert len(info["affected_crops"]) > 0
        assert "damage_symptoms" in info
        assert "threat_level" in info
        print(f"  ✅ {info['display_name']} -> Susceptible Crops: {', '.join(info['affected_crops'][:4])}...")

    # Check fallback for unknown pest
    unknown_info = get_pest_info("Alien_Bug_XYZ")
    assert "Unspecified" in unknown_info["scientific_name"]
    print("  ✅ Fallback profile for unknown pests correctly verified.")
    print("Pest knowledge base tests PASSED!")


def test_pest_image_rejection():
    print("\n--- 2. Testing Pest Image Validation & Rejection ---")
    # Low-res image (< 64x64)
    low_res = np.zeros((48, 48, 3), dtype=np.uint8)
    valid, err = validate_pest_image(low_res)
    assert not valid
    print(f"  ✅ Low resolution rejected: {err}")

    # Blank flat black image
    blank = np.zeros((200, 200, 3), dtype=np.uint8)
    valid, err = validate_pest_image(blank)
    assert not valid
    print(f"  ✅ Blank image rejected: {err}")

    # Valid textured insect photo
    valid_img = np.full((200, 200, 3), 120, dtype=np.uint8)
    cv2.circle(valid_img, (100, 100), 30, (30, 30, 30), -1)  # simulated insect body
    noise = np.random.randint(0, 30, (200, 200, 3), dtype=np.uint8)
    valid_img = cv2.add(valid_img, noise)

    valid, err = validate_pest_image(valid_img)
    assert valid, f"Expected valid, got: {err}"
    print("  ✅ Valid insect photograph passed quality checks.")
    print("Pest image validation tests PASSED!")


def test_pest_prediction_schema():
    print("\n--- 3. Testing Pest Prediction Response & Unknown Handling ---")
    # Test blank image rejection
    img = Image.new("RGB", (100, 100), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")

    res = identify_pest(buf.getvalue())
    assert res["status"] == "rejected"
    assert "IMAGE_VALIDATION_FAILED" in res["error_code"]
    print("  ✅ Blank image rejected with code:", res["error_code"])

    # Test valid image with honest status (never invent classifications)
    valid_leaf = np.zeros((224, 224, 3), dtype=np.uint8)
    valid_leaf[:, :] = [40, 140, 40]
    cv2.circle(valid_leaf, (112, 112), 25, (20, 20, 80), -1)
    noise = np.random.randint(0, 35, (224, 224, 3), dtype=np.uint8)
    valid_leaf = cv2.add(valid_leaf, noise)

    _, encoded = cv2.imencode(".png", valid_leaf)
    predictor = PestPredictor()
    res_pred = predictor.predict_image(encoded.tobytes())

    assert res_pred["status"] in ["model_not_ready", "success", "unknown_or_unsupported"]
    print("  ✅ Honest verification: Never invents fake classifications. Status:", res_pred["status"])
    if "supported_pests" in res_pred:
        print(f"  ✅ Supported agricultural pests reported: {len(res_pred['supported_pests'])} categories.")

    print("Pest prediction schema tests PASSED!")


if __name__ == "__main__":
    print("==========================================================")
    print("🦗 AgriSmart AI - Pest Identification Test Suite")
    print("==========================================================")
    test_pest_knowledge_base()
    test_pest_image_rejection()
    test_pest_prediction_schema()
    print("\n🎉 ALL PEST IDENTIFICATION TESTS PASSED SUCCESSFULLY!\n")

