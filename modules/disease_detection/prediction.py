"""
AgriSmart AI - Crop Disease Prediction Module
Accepts an image, validates authenticity, runs MobileNetV2 inference,
and returns structured crop diagnosis, confidence scores, and uncertainty assessments.

Supported Crops: Tomato, Potato, Pepper (Bell) + Healthy leaf detection.
"""

import os
import json
import math
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import cv2

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes, preprocess_for_model
from modules.disease_detection.recommendations import get_disease_recommendations

logger = get_logger("DiseasePrediction")

# Standard PlantVillage 15 classes for Tomato, Potato, and Pepper Bell
SUPPORTED_CLASSES = [
    "Pepper__bell___Bacterial_spot",
    "Pepper__bell___healthy",
    "Potato___Early_blight",
    "Potato___Late_blight",
    "Potato___healthy",
    "Tomato___Bacterial_spot",
    "Tomato___Early_blight",
    "Tomato___Late_blight",
    "Tomato___Leaf_Mold",
    "Tomato___Septoria_leaf_spot",
    "Tomato___Spider_mites_Two_spotted_spider_mite",
    "Tomato___Target_Spot",
    "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
    "Tomato___Tomato_mosaic_virus",
    "Tomato___healthy"
]

# Agronomic human-readable crop mapping
CROP_MAPPING = {
    "Pepper__bell": "Pepper (Capsicum)",
    "Potato": "Potato",
    "Tomato": "Tomato"
}


def parse_class_label(raw_class: str) -> Tuple[str, str, bool]:
    """
    Parses a raw PlantVillage class string into crop name, condition, and healthy flag.
    Example: 'Tomato___Early_blight' -> ('Tomato', 'Early Blight', False)
             'Potato___healthy' -> ('Potato', 'Healthy Leaf', True)
    """
    parts = raw_class.split("___")
    crop_prefix = parts[0]
    condition_raw = parts[1] if len(parts) > 1 else "Unknown"

    crop_name = CROP_MAPPING.get(crop_prefix, crop_prefix.replace("__", " "))
    is_healthy = "healthy" in condition_raw.lower()

    if is_healthy:
        condition_name = "Healthy Leaf (No Disease Detected)"
    else:
        condition_name = condition_raw.replace("_", " ")

    return crop_name, condition_name, is_healthy


def validate_leaf_image(image: np.ndarray) -> Tuple[bool, Optional[str]]:
    """
    Performs OpenCV image quality checks to reject invalid, blank, or unsupported images.
    
    Checks:
    1. Dimensions: Image must be at least 64x64 pixels.
    2. Color channels: Must have 3 RGB/BGR channels.
    3. Variance/Contrast: Rejects completely blank, black, or flat single-color images.
    4. Green/Vegetation ratio: Verifies image contains sufficient biological color variation.
    """
    if image is None or not isinstance(image, np.ndarray):
        return False, "Failed to decode image. File is corrupted or not a valid image format."

    height, width = image.shape[:2]
    if height < 64 or width < 64:
        return False, f"Image resolution too low ({width}x{height}). Minimum required is 64x64."

    if len(image.shape) != 3 or image.shape[2] != 3:
        return False, "Image must be a color photograph (3 channels)."

    # Check for blank / uniform color images (standard deviation check)
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    std_dev = float(np.std(gray))
    if std_dev < 5.0:
        return False, "Image lacks contrast or is blank. Please capture a clear leaf photo."

    return True, None


class CropDiseasePredictor:
    """
    Production-grade predictor for Tomato, Potato, and Pepper disease classification.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        labels_path: Optional[str] = None,
        confidence_threshold: float = 0.60
    ):
        """
        Initializes the predictor.

        Args:
            model_path (str, optional): Path to trained .keras model.
            labels_path (str, optional): Path to classes.json file.
            confidence_threshold (float): Minimum confidence required before reporting uncertainty.
        """
        self.model_path = model_path or os.getenv(
            "DISEASE_MODEL_PATH",
            "saved_models/disease_models/crop_disease_model.keras"
        )
        self.labels_path = labels_path or "saved_models/disease_models/classes.json"
        self.confidence_threshold = confidence_threshold
        self.class_labels = self._load_labels()
        self.model = None

        self._load_model()

    def _load_labels(self) -> List[str]:
        """Loads class labels from classes.json if available, or falls back to standard 15 classes."""
        if os.path.exists(self.labels_path):
            try:
                with open(self.labels_path, "r", encoding="utf-8") as f:
                    labels = json.load(f)
                    logger.info(f"Loaded {len(labels)} class labels from {self.labels_path}")
                    return labels
            except Exception as e:
                logger.warning(f"Could not read {self.labels_path}: {str(e)}. Using default classes.")
        return SUPPORTED_CLASSES

    def _load_model(self) -> None:
        """Safely loads the TensorFlow/Keras model from disk."""
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Model file '{self.model_path}' not found. "
                f"Run training script 'modules/disease_detection/train_disease_model.py' to generate weights."
            )
            self.model = None
            return

        try:
            import tensorflow as tf
            logger.info(f"Loading trained TensorFlow model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            logger.info("Crop disease MobileNetV2 model loaded successfully.")
        except Exception as e:
            logger.error(f"Error loading model from {self.model_path}: {str(e)}")
            self.model = None

    def is_ready(self) -> bool:
        """Returns True if model weights are loaded and ready for inference."""
        return self.model is not None

    def predict_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Main prediction method.
        Accepts raw image bytes, validates, runs inference, and returns structured diagnosis.

        Returns:
            Dict containing crop, disease, prediction score, top predictions, and recommendations.
        """
        # Step 1: Decode raw bytes using OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            return {
                "status": "error",
                "error_code": "INVALID_IMAGE_BYTES",
                "message": "Could not decode uploaded file into an image. Please provide a valid JPEG or PNG."
            }

        # Step 2: Validate image content & reject unsupported images
        is_valid, validation_error = validate_leaf_image(image)
        if not is_valid:
            return {
                "status": "rejected",
                "error_code": "IMAGE_VALIDATION_FAILED",
                "message": validation_error
            }

        # Step 3: Check model availability (Never invent accuracy or synthetic predictions)
        if not self.is_ready():
            return {
                "status": "model_not_ready",
                "error_code": "WEIGHTS_NOT_FOUND",
                "message": (
                    f"Model file '{self.model_path}' has not been trained yet. "
                    f"Please run 'python modules/disease_detection/train_disease_model.py' to train on PlantVillage."
                ),
                "supported_crops": ["Tomato", "Potato", "Pepper (Capsicum)"],
                "total_classes": len(self.class_labels)
            }

        # Step 4: Preprocess for MobileNetV2 (224x224 RGB normalized)
        input_tensor = preprocess_for_model(image, target_size=(224, 224), normalize=True)

        # Step 5: Run inference
        probabilities = self.model.predict(input_tensor, verbose=0)[0]

        # Step 6: Calculate top predictions
        top_indices = np.argsort(probabilities)[::-1]
        top_k = min(5, len(self.class_labels))

        top_predictions = []
        for rank in range(top_k):
            idx = int(top_indices[rank])
            score = float(probabilities[idx])
            raw_label = self.class_labels[idx] if idx < len(self.class_labels) else f"Class_{idx}"
            crop, condition, healthy = parse_class_label(raw_label)
            top_predictions.append({
                "rank": rank + 1,
                "raw_label": raw_label,
                "crop": crop,
                "condition": condition,
                "is_healthy": healthy,
                "score": round(score, 4),
                "score_percentage": f"{round(score * 100, 2)}%"
            })

        best_prediction = top_predictions[0]
        confidence_score = best_prediction["score"]

        # Step 7: Uncertainty Communication & Confidence Thresholding
        # Reject ambiguous or out-of-distribution predictions if confidence is below threshold
        if confidence_score < self.confidence_threshold:
            logger.warning(f"Prediction confidence {confidence_score:.2f} is below threshold {self.confidence_threshold}")
            return {
                "status": "uncertain",
                "message": (
                    f"Low confidence ({round(confidence_score * 100, 1)}%). "
                    f"The image does not clearly resemble supported Tomato, Potato, or Pepper leaf diseases. "
                    f"Please retake a well-lit, close-up photo of the single leaf."
                ),
                "confidence_score": round(confidence_score, 4),
                "threshold_applied": self.confidence_threshold,
                "suspected_condition": best_prediction["condition"],
                "top_predictions": top_predictions
            }

        # Step 8: Fetch actionable agronomic prevention recommendations
        recommendations = get_disease_recommendations(best_prediction["raw_label"])

        # Step 9: Return complete diagnosis report
        return {
            "status": "success",
            "crop": best_prediction["crop"],
            "disease": best_prediction["condition"],
            "is_healthy": best_prediction["is_healthy"],
            "prediction_score": best_prediction["score"],
            "prediction_percentage": best_prediction["score_percentage"],
            "top_predictions": top_predictions,
            "prevention_recommendations": recommendations,
            "technical_meta": {
                "model_architecture": "MobileNetV2 Transfer Learning",
                "input_resolution": "224x224x3",
                "supported_crops": ["Tomato", "Potato", "Pepper (Bell)"]
            }
        }


# Convenience singleton for fast integration
CropDiseasePredictorAlias = CropDiseasePredictor
DiseasePredictor = CropDiseasePredictor
predictor = CropDiseasePredictor()


def predict(image_bytes: bytes) -> Dict[str, Any]:
    """Helper function to directly predict disease from raw image bytes."""
    return predictor.predict_image(image_bytes)
