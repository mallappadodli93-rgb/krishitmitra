"""
Crop Image Classification Module
Provides image-based identification of crop varieties (e.g., Rice, Wheat, Corn, Cotton, Sugarcane) with confidence scores.
"""
from .classifier import CropClassifier

__all__ = ["CropClassifier"]

