"""
AgriSmart AI - Crop Classifier
Loads a trained TensorFlow/Keras model and identifies the crop species from images with confidence scores.
"""

import os
from typing import Dict, Any, List, Optional
import numpy as np

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes, preprocess_for_model

logger = get_logger("CropClassifier")


class CropClassifier:
    """
    Handles image-based crop type classification using Deep Learning.
    """

    def __init__(self, model_path: Optional[str] = None, class_labels: Optional[List[str]] = None):
        """
        Initializes the crop classifier.

        Args:
            model_path (str, optional): Path to the saved Keras/TensorFlow model.
            class_labels (List[str], optional): List of crop category names.
        """
        self.model_path = model_path or os.getenv(
            "CROP_MODEL_PATH",
            "saved_models/crop_models/crop_classifier_model.keras"
        )
        self.class_labels = class_labels or [
            "Rice",
            "Wheat",
            "Corn",
            "Cotton",
            "Sugarcane",
            "Soybean",
            "Tomato",
            "Potato"
        ]
        self.model = None
        self._load_model()

    def _load_model(self) -> None:
        """
        Loads the trained TensorFlow/Keras model from disk if present.
        """
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Crop model not found at '{self.model_path}'. "
                f"Prediction requests will require a trained model first."
            )
            self.model = None
            return

        try:
            import tensorflow as tf
            logger.info(f"Loading crop classification model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            logger.info("Crop classification model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load crop model from {self.model_path}: {str(e)}")
            self.model = None

    def is_model_loaded(self) -> bool:
        """Checks if the model is loaded."""
        return self.model is not None

    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Performs crop type prediction on raw image bytes.

        Args:
            image_bytes (bytes): Image bytes received from client.

        Returns:
            Dict[str, Any]: Crop name, confidence score, and distribution.
        """
        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained crop classifier '{self.model_path}' is not yet available. "
                f"Please train the model using 'modules/crop_classification/train_crop_model.py' "
                f"or place your trained weights in '{self.model_path}'."
            )

        # Decode image using OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            raise ValueError("Invalid image file: could not decode image with OpenCV.")

        # Preprocess
        input_tensor = preprocess_for_model(image, target_size=(224, 224), normalize=True)

        # Predict
        predictions = self.model.predict(input_tensor, verbose=0)
        probabilities = predictions[0]

        predicted_idx = int(np.argmax(probabilities))
        confidence_score = float(probabilities[predicted_idx])

        predicted_label = (
            self.class_labels[predicted_idx]
            if predicted_idx < len(self.class_labels)
            else f"Crop_Class_{predicted_idx}"
        )

        return {
            "crop_name": predicted_label,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%",
            "all_probabilities": {
                self.class_labels[i]: round(float(prob), 4)
                for i, prob in enumerate(probabilities)
                if i < len(self.class_labels)
            }
        }

