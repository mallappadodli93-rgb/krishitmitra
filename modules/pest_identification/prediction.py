"""
AgriSmart AI - Pest Identification & Prediction Engine
Accepts insect and pest images, validates quality, runs deep learning inference,
outputs prediction confidence, detects unknown/unsupported categories,
and details affected crops and IPM control protocols.
"""

import os
import json
from typing import Dict, Any, List, Optional, Tuple
import numpy as np
import cv2

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes, preprocess_for_model
from modules.pest_identification.pest_data import get_pest_info, PEST_KNOWLEDGE_BASE

logger = get_logger("PestPrediction")

# Default supported pest classes
DEFAULT_PEST_CLASSES = [
    "Aphids",
    "Fall_Armyworm",
    "Whitefly",
    "Stem_Borer",
    "Spider_Mites",
    "Bollworm",
    "Thrips",
    "Beneficial_Or_Healthy"
]


def validate_pest_image(image: np.ndarray) -> Tuple[bool, Optional[str]]:
    """
    OpenCV image validation to filter out non-image, corrupted, low-resolution, or blank files.
    """
    if image is None or not isinstance(image, np.ndarray):
        return False, "Failed to decode image. Corrupted or invalid image format."

    height, width = image.shape[:2]
    if height < 64 or width < 64:
        return False, f"Image resolution too low ({width}x{height}). Minimum required is 64x64."

    if len(image.shape) != 3 or image.shape[2] != 3:
        return False, "Image must be a color photo (3 RGB channels)."

    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    std_dev = float(np.std(gray))
    if std_dev < 5.0:
        return False, "Image lacks contrast or is blank. Please capture a clear photo of the insect or crop damage."

    return True, None


class PestPredictor:
    """
    Inference class for agricultural pest classification.
    """

    def __init__(
        self,
        model_path: Optional[str] = None,
        labels_path: Optional[str] = None,
        confidence_threshold: float = 0.60
    ):
        """
        Initializes the pest predictor.

        Args:
            model_path (str, optional): Path to .keras / .h5 trained model.
            labels_path (str, optional): Path to classes.json file.
            confidence_threshold (float): Rejection threshold for unknown/unsupported categories.
        """
        self.model_path = model_path or os.getenv(
            "PEST_MODEL_PATH",
            "saved_models/pest_models/pest_model.keras"
        )
        self.labels_path = labels_path or "saved_models/pest_models/classes.json"
        self.confidence_threshold = confidence_threshold
        self.class_labels = self._load_labels()
        self.model = None

        self._load_model()

    def _load_labels(self) -> List[str]:
        """Loads pest class labels from JSON or default list."""
        if os.path.exists(self.labels_path):
            try:
                with open(self.labels_path, "r", encoding="utf-8") as f:
                    labels = json.load(f)
                    logger.info(f"Loaded {len(labels)} pest labels from {self.labels_path}")
                    return labels
            except Exception as e:
                logger.warning(f"Could not load labels from {self.labels_path}: {e}")
        return DEFAULT_PEST_CLASSES

    def _load_model(self) -> None:
        """Loads trained deep learning model if available."""
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Pest model weights '{self.model_path}' not found. "
                f"Prediction requests will require trained weights first."
            )
            self.model = None
            return

        try:
            import tensorflow as tf
            logger.info(f"Loading pest model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            logger.info("Pest model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load pest model: {str(e)}")
            self.model = None

    def is_ready(self) -> bool:
        """Returns True if model weights are loaded and ready."""
        return self.model is not None

    def predict_image(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Analyzes an uploaded insect or crop damage image and returns structured diagnosis.

        Returns:
            Dict containing pest name, confidence score, unknown handling, affected crops, and IPM advice.
        """
        # Step 1: Decode image with OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            return {
                "status": "error",
                "error_code": "INVALID_IMAGE_BYTES",
                "message": "Could not decode uploaded file into an image."
            }

        # Step 2: Validate image quality
        is_valid, err_msg = validate_pest_image(image)
        if not is_valid:
            return {
                "status": "rejected",
                "error_code": "IMAGE_VALIDATION_FAILED",
                "message": err_msg
            }

        # Step 3: Check model readiness (Strict honesty: never invent classifications)
        if not self.is_ready():
            return {
                "status": "model_not_ready",
                "error_code": "WEIGHTS_NOT_FOUND",
                "message": (
                    f"Pest classification model '{self.model_path}' is not yet trained. "
                    f"Please run 'python modules/pest_identification/train_pest_model.py' to generate weights."
                ),
                "supported_pests": list(PEST_KNOWLEDGE_BASE.keys())
            }

        # Step 4: Preprocess for model
        input_tensor = preprocess_for_model(image, target_size=(224, 224), normalize=True)

        # Step 5: Model inference
        probabilities = self.model.predict(input_tensor, verbose=0)[0]

        # Step 6: Rank top predictions
        top_indices = np.argsort(probabilities)[::-1]
        top_k = min(5, len(self.class_labels))

        top_predictions = []
        for rank in range(top_k):
            idx = int(top_indices[rank])
            score = float(probabilities[idx])
            pest_key = self.class_labels[idx] if idx < len(self.class_labels) else f"Class_{idx}"
            info = get_pest_info(pest_key)
            top_predictions.append({
                "rank": rank + 1,
                "pest_key": pest_key,
                "pest_name": info["display_name"],
                "confidence": round(score, 4),
                "confidence_percentage": f"{round(score * 100, 2)}%",
                "affected_crops": info["affected_crops"],
                "threat_level": info["threat_level"]
            })

        best = top_predictions[0]
        top_score = best["confidence"]

        # Step 7: Handle Unknown / Unsupported Categories
        # If the highest confidence score is below the threshold, classify as unknown/unsupported
        if top_score < self.confidence_threshold:
            logger.info(f"Pest prediction confidence {top_score:.2f} is below threshold {self.confidence_threshold}")
            return {
                "status": "unknown_or_unsupported",
                "message": (
                    f"Unrecognized or unsupported insect pest (Confidence: {round(top_score * 100, 1)}%). "
                    f"The image does not closely match known agricultural pests. "
                    f"Please take a clearer, close-up photograph of the insect or consult local agricultural extension."
                ),
                "confidence_score": round(top_score, 4),
                "threshold_applied": self.confidence_threshold,
                "closest_match": best["pest_name"],
                "top_predictions": top_predictions,
                "supported_categories": list(PEST_KNOWLEDGE_BASE.keys())
            }

        # Step 8: Fetch full profile and management recommendations
        pest_profile = get_pest_info(best["pest_key"])

        return {
            "status": "success",
            "pest_key": best["pest_key"],
            "pest_name": pest_profile["display_name"],
            "scientific_name": pest_profile["scientific_name"],
            "confidence_score": best["confidence"],
            "confidence_percentage": best["confidence_percentage"],
            "threat_level": pest_profile["threat_level"],
            "affected_crops": pest_profile["affected_crops"],
            "damage_symptoms": pest_profile["damage_symptoms"],
            "economic_threshold": pest_profile["economic_threshold"],
            "top_predictions": top_predictions,
            "ipm_recommendations": {
                "biological_control": pest_profile["biological_control"],
                "organic_remedies": pest_profile["organic_remedies"],
                "chemical_control": pest_profile["chemical_control"]
            }
        }


# Convenience singleton
pest_predictor = PestPredictor()
predictor = pest_predictor


def identify_pest(image_bytes: bytes) -> Dict[str, Any]:
    """Helper function to directly identify pest from image bytes."""
    return pest_predictor.predict_image(image_bytes)

