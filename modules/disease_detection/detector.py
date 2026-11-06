"""
AgriSmart AI - Crop Disease Detector
Loads a trained TensorFlow/Keras model and performs image-based disease diagnosis with confidence scores.
"""

import os
from typing import Dict, Any, List, Optional
import numpy as np

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes, preprocess_for_model
from modules.disease_detection.recommendations import get_disease_recommendations

logger = get_logger("CropDiseaseDetector")


class CropDiseaseDetector:
    """
    Handles crop leaf disease classification using a trained deep learning model.
    """

    def __init__(self, model_path: Optional[str] = None, class_labels: Optional[List[str]] = None):
        """
        Initializes the disease detector.

        Args:
            model_path (str, optional): Path to the saved Keras/TensorFlow model (.keras or .h5).
            class_labels (List[str], optional): List of class names corresponding to model output indices.
        """
        self.model_path = model_path or os.getenv(
            "DISEASE_MODEL_PATH",
            "saved_models/disease_models/crop_disease_model.keras"
        )
        # Default representative agricultural disease classes (can be overridden during training)
        self.class_labels = class_labels or [
            "Tomato_Early_Blight",
            "Tomato_Late_Blight",
            "Potato_Late_Blight",
            "Rice_Blast",
            "Wheat_Rust",
            "Corn_Common_Rust",
            "Healthy"
        ]
        self.model = None
        self._load_model()

    def _load_model(self) -> None:
        """
        Safely attempts to load the trained TensorFlow/Keras model from disk.
        """
        if not os.path.exists(self.model_path):
            logger.warning(
                f"Model file not found at '{self.model_path}'. "
                f"Prediction requests will require a trained model first."
            )
            self.model = None
            return

        try:
            # Lazy import TensorFlow so the application starts quickly
            import tensorflow as tf
            logger.info(f"Loading disease detection model from {self.model_path}...")
            self.model = tf.keras.models.load_model(self.model_path)
            logger.info("Crop disease model loaded successfully.")
        except Exception as e:
            logger.error(f"Failed to load model from {self.model_path}: {str(e)}")
            self.model = None

    def is_model_loaded(self) -> bool:
        """Checks if the deep learning model is loaded and ready for inference."""
        return self.model is not None

    def predict_from_bytes(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Performs inference on raw image bytes.

        Args:
            image_bytes (bytes): Image file bytes received via API upload.

        Returns:
            Dict[str, Any]: Contains diagnosis, confidence score, recommendations, and status.
        """
        # Step 1: Ensure trained model is available (no fake predictions)
        if not self.is_model_loaded():
            raise FileNotFoundError(
                f"Trained model file '{self.model_path}' is not yet available. "
                f"Please train the model using 'modules/disease_detection/train_disease_model.py' "
                f"or place your trained weights in '{self.model_path}'."
            )

        # Step 2: Decode raw image using OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            raise ValueError("Invalid image file: could not decode image with OpenCV.")

        # Step 3: Preprocess image to model input shape (224x224 RGB normalized)
        input_tensor = preprocess_for_model(image, target_size=(224, 224), normalize=True)

        # Step 4: Run TensorFlow model prediction
        predictions = self.model.predict(input_tensor, verbose=0)
        probabilities = predictions[0]

        # Step 5: Extract predicted class index and confidence
        predicted_idx = int(np.argmax(probabilities))
        confidence_score = float(probabilities[predicted_idx])

        # Step 6: Map index to class label
        predicted_label = (
            self.class_labels[predicted_idx]
            if predicted_idx < len(self.class_labels)
            else f"Class_{predicted_idx}"
        )

        # Step 7: Retrieve actionable agronomic recommendations
        recommendations = get_disease_recommendations(predicted_label)

        # Step 8: Return structured response
        return {
            "prediction": predicted_label,
            "confidence": round(confidence_score, 4),
            "confidence_percentage": f"{round(confidence_score * 100, 2)}%",
            "recommendations": recommendations,
            "all_probabilities": {
                self.class_labels[i]: round(float(prob), 4)
                for i, prob in enumerate(probabilities)
                if i < len(self.class_labels)
            }
        }

