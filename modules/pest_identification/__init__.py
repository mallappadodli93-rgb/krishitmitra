"""
Agricultural Pest Identification Module
Provides image-based insect/pest diagnosis, confidence scoring,
rejection of invalid images, unknown/unsupported category detection,
affected crops identification, and Integrated Pest Management (IPM) guidance.
"""

from .prediction import PestPredictor, identify_pest
from .pest_data import get_pest_info, PEST_KNOWLEDGE_BASE

__all__ = [
    "PestPredictor",
    "identify_pest",
    "get_pest_info",
    "PEST_KNOWLEDGE_BASE"
]
