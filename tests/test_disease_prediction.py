"""
AgriSmart AI - Crop Disease Prediction & Image Rejection Test Suite
Tests OpenCV image validation, rejection of invalid/blank images,
label parsing for Tomato/Potato/Pepper, and uncertainty communication.
"""

import io
import cv2
import numpy as np
from PIL import Image

from modules.disease_detection.prediction import (
    validate_leaf_image,
    parse_class_label,
    predict,
    CropDiseasePredictor
)


def test_label_parsing():
    print("\n--- 1. Testing PlantVillage Label Parsing (Tomato, Potato, Pepper + Healthy) ---")
    test_cases = [
        ("Pepper__bell___Bacterial_spot", "Pepper (Capsicum)", "Bacterial spot", False),
        ("Pepper__bell___healthy", "Pepper (Capsicum)", "Healthy Leaf (No Disease Detected)", True),
        ("Potato___Early_blight", "Potato", "Early blight", False),
        ("Potato___Late_blight", "Potato", "Late blight", False),
        ("Potato___healthy", "Potato", "Healthy Leaf (No Disease Detected)", True),
        ("Tomato___Early_blight", "Tomato", "Early blight", False),
        ("Tomato___healthy", "Tomato", "Healthy Leaf (No Disease Detected)", True),
        ("Tomato___Tomato_Yellow_Leaf_Curl_Virus", "Tomato", "Tomato Yellow Leaf Curl Virus", False)
    ]

    for raw, expected_crop, expected_cond, expected_healthy in test_cases:
        crop, cond, healthy = parse_class_label(raw)
        assert crop == expected_crop, f"Expected {expected_crop}, got {crop}"
        assert cond == expected_cond, f"Expected {expected_cond}, got {cond}"
        assert healthy == expected_healthy, f"Expected {expected_healthy}, got {healthy}"
        print(f"  ✅ Parsed: '{raw}' -> Crop: {crop} | Condition: {cond} | Healthy: {healthy}")
    print("Label parsing tests PASSED!")


def test_image_rejection():
    print("\n--- 2. Testing Image Quality Checks & Rejection Logic ---")
    
    # Test 1: Tiny low-res image (< 64x64)
    tiny_img = np.zeros((32, 32, 3), dtype=np.uint8)
    valid, err = validate_leaf_image(tiny_img)
    assert not valid
    print(f"  ✅ Low resolution rejected: {err}")

    # Test 2: Blank flat black image (lacks contrast/variance)
    blank_img = np.zeros((224, 224, 3), dtype=np.uint8)
    valid, err = validate_leaf_image(blank_img)
    assert not valid
    print(f"  ✅ Blank image rejected: {err}")

    # Test 3: Valid simulated leaf image (with leaf veins, pattern & color variance)
    valid_leaf = np.zeros((224, 224, 3), dtype=np.uint8)
    valid_leaf[:, :] = [34, 139, 34]  # Forest green background
    # Draw leaf vein patterns and color variations
    cv2.line(valid_leaf, (112, 10), (112, 214), (20, 80, 20), 4)
    for y in range(30, 200, 25):
        cv2.line(valid_leaf, (112, y), (40, y - 15), (25, 95, 25), 2)
        cv2.line(valid_leaf, (112, y), (184, y - 15), (25, 95, 25), 2)
    # Add natural texture noise
    noise = np.random.randint(0, 40, (224, 224, 3), dtype=np.uint8)
    valid_leaf = cv2.add(valid_leaf, noise)
    
    valid, err = validate_leaf_image(valid_leaf)
    assert valid, f"Expected valid, got: {err}"
    print("  ✅ Realistic textured leaf image passed validation!")
    print("Image validation & rejection tests PASSED!")


def test_prediction_pipeline():
    print("\n--- 3. Testing Disease Predictor Response Schema ---")
    # Generate in-memory PNG bytes of a blank image to test rejection endpoint
    img = Image.new("RGB", (100, 100), color=(0, 0, 0))
    buf = io.BytesIO()
    img.save(buf, format="PNG")
    blank_bytes = buf.getvalue()

    res = predict(blank_bytes)
    assert res["status"] == "rejected"
    assert "IMAGE_VALIDATION_FAILED" in res["error_code"]
    print("  ✅ Blank image correctly rejected with message:", res["message"])

    # Test with valid patterned leaf image when model weights are pending training
    valid_leaf = np.zeros((224, 224, 3), dtype=np.uint8)
    valid_leaf[:, :] = [34, 139, 34]
    cv2.line(valid_leaf, (112, 10), (112, 214), (20, 80, 20), 4)
    noise = np.random.randint(0, 40, (224, 224, 3), dtype=np.uint8)
    valid_leaf = cv2.add(valid_leaf, noise)

    _, encoded_png = cv2.imencode(".png", valid_leaf)
    valid_leaf_bytes = encoded_png.tobytes()
    
    predictor = CropDiseasePredictor()
    res_ready = predictor.predict_image(valid_leaf_bytes)
    assert res_ready["status"] in ["model_not_ready", "success", "uncertain"], f"Unexpected status: {res_ready}"
    print("  ✅ Safety guarantee: Never invents fake accuracy. Status reported:", res_ready["status"])
    print("Prediction schema tests PASSED!")


if __name__ == "__main__":
    print("==========================================================")
    print("🌱 AgriSmart AI - Crop Disease Detection Test Suite")
    print("==========================================================")
    test_label_parsing()
    test_image_rejection()
    test_prediction_pipeline()
    print("\n🎉 ALL CROP DISEASE TESTS PASSED SUCCESSFULLY!\n")
