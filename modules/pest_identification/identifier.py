"""
AgriSmart AI - Pest Identifier
Loads a trained TensorFlow/Keras model and identifies agricultural insect pests from images with confidence scores.
"""

import os
from typing import Dict, Any, List, Optional
import numpy as np

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes, preprocess_for_model
from modules.pest_identification.recommendations import get_pest_recommendations

logger = get_logger("PestIdentifier")


class PestIdentifier:
    """
    Handles image-based pest classification and integrated pest management (IPM) recommendations.
    """

    def __init__(self, model_path: Optional[str] = None, class_labels: Optional[List[str]] = None):
        """
        Initializes the pest identifier.

        Args:
            model_path (str, optional): Path to the saved Keras/TensorFlow model (.keras or .h5).
            class_labels (List[str], optional): List of pest class names.
        """
        self.model_path = model_path or os.getenv(
            "PEST_MODEL_PATH",
            "saved_models/pest_models/pest_model.keras"
        )
        self.class_labels = class_labels or [
            "Aphids",
            "Fall_Armyworm",
            "Whitefly",
            "Stem_Borer",
            "Spider_Mites"
        ]
        self.model = None
        self._load_model()

    def _load_model(self) -> None:
        """
        Loads the trained TensorFlow/Keras model from disk if present.
        """
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Pest model not found at '{self.model_path}'. "
                f"Prediction requests will require a trained model first."
            )
            self.model = None
            return

        try:
            import tensorflow as tf
            logger.info(f"Loading pest identification model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            logger.info("Pest model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load pest model from {self.model_path}: {str(e)}")
            self.model = None

    def is_model_loaded(self) -> bool:
        """Checks if the model is ready for inference."""
        return self.model is not None

    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Performs pest classification on raw uploaded image bytes.

        Args:
            image_bytes (bytes): Binary content of an uploaded image file.

        Returns:
            Dict[str, Any]: Contains pest diagnosis, confidence score, and management recommendations.
        """
        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained pest model '{self.model_path}' is not yet available. "
                f"Please train the model using 'modules/pest_identification/train_pest_model.py' "
                f"or place your trained weights in '{self.model_path}'."
            )

        # Decode image using OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            raise ValueError("Invalid image file: could not decode image with OpenCV.")

        # Preprocess image
        input_tensor = preprocess_for_model(image, target_size=(224, 224), normalize=True)

        # Model inference
        predictions = self.model.predict(input_tensor, verbose=0)
        probabilities = predictions[0]

        # Extract top prediction and confidence
        predicted_idx = int(np.argmax(probabilities))
        confidence_score = float(probabilities[predicted_idx])

        predicted_label = (
            self.class_labels[predicted_idx]
            if predicted_idx < len(self.class_labels)
            else f"Pest_Class_{predicted_idx}"
        )

        # Retrieve management recommendations
        recommendations = get_pest_recommendations(predicted_label)

        return {
            "pest_name": predicted_label,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%",
            "recommendations": recommendations,
            "all_probabilities": {
                self.class_labels[i]: round(float(prob), 4)
                for i, prob in enumerate(probabilities)
                if i < len(self.class_labels)
            }
        }

