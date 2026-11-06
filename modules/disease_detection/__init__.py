"""
Crop Disease Detection Module
Provides image-based crop disease diagnosis for Tomato, Potato, and Pepper,
MobileNetV2 transfer learning, prediction scoring, rejection of invalid images,
and agronomic prevention recommendations.
"""
from .detector import CropDiseaseDetector
from .prediction import CropDiseasePredictor, predict
from .recommendations import get_disease_recommendations

__all__ = [
    "CropDiseaseDetector",
    "CropDiseasePredictor",
    "predict",
    "get_disease_recommendations"
]
