"""
AgriSmart AI - Application Configuration
Loads environment variables and sets system defaults.
"""

import os
from dotenv import load_dotenv

# Load variables from .env file
load_dotenv()


class Settings:
    """Central configuration class for AgriSmart AI application."""

    # Project Information
    PROJECT_NAME: str = "AgriSmart AI - AI & ML Engine"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = (
        "Comprehensive AI/ML API for agriculture: Crop Disease Detection, "
        "Pest Identification, Crop Classification, Yield Prediction, "
        "AI Farming Chatbot, AI Farm Doctor, and Voice Processing."
    )

    # Server Settings
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", 8000))
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    # Secret API Keys (Loaded strictly from environment)
    GEMINI_API_KEY: str = os.getenv("GEMINI_API_KEY", "")
    GEMINI_MODEL: str = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")

    # Model Storage Paths
    DISEASE_MODEL_PATH: str = os.getenv(
        "DISEASE_MODEL_PATH",
        "saved_models/disease_models/crop_disease_model.keras"
    )
    PEST_MODEL_PATH: str = os.getenv(
        "PEST_MODEL_PATH",
        "saved_models/pest_models/pest_model.keras"
    )
    CROP_MODEL_PATH: str = os.getenv(
        "CROP_MODEL_PATH",
        "saved_models/crop_models/crop_classifier_model.keras"
    )
    YIELD_MODEL_PATH: str = os.getenv(
        "YIELD_MODEL_PATH",
        "saved_models/yield_models/crop_yield_model.pkl"
    )


settings = Settings()

