"""
Configuration Module for AgriSmart AI (Member 3).
Loads settings from environment variables or .env file with safe defaults.
"""
import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent

load_dotenv(BASE_DIR / ".env")

class Settings:
    """Central configuration class."""
    APP_NAME: str = os.getenv("APP_NAME", "AgriSmart AI - Weather, Soil & Location Intelligence")
    APP_ENV: str = os.getenv("APP_ENV", "development")
    DEBUG: bool = os.getenv("DEBUG", "True").lower() in ("true", "1", "yes")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # CORS: Allowed origins for teammates connecting from Web or Mobile frontend
    _allowed_origins_str: str = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:3000,http://localhost:5173,http://127.0.0.1:3000,http://127.0.0.1:5173,*"
    )
    ALLOWED_ORIGINS: List[str] = [origin.strip() for origin in _allowed_origins_str.split(",") if origin.strip()]

    # Weather API Configuration (Open-Meteo is open & free)
    OPEN_METEO_BASE_URL: str = os.getenv("OPEN_METEO_BASE_URL", "https://api.open-meteo.com/v1/forecast")
    WEATHER_REQUEST_TIMEOUT_SECONDS: int = int(os.getenv("WEATHER_REQUEST_TIMEOUT_SECONDS", "10"))

    # Configurable Weather Alert Thresholds
    ALERT_HEAVY_RAIN_MM: float = float(os.getenv("ALERT_HEAVY_RAIN_MM", "30.0"))
    ALERT_EXTREME_HEAT_C: float = float(os.getenv("ALERT_EXTREME_HEAT_C", "38.0"))
    ALERT_STRONG_WIND_KMH: float = float(os.getenv("ALERT_STRONG_WIND_KMH", "35.0"))
    ALERT_FROST_C: float = float(os.getenv("ALERT_FROST_C", "4.0"))
    ALERT_HIGH_HUMIDITY_PCT: float = float(os.getenv("ALERT_HIGH_HUMIDITY_PCT", "85.0"))

    # Firebase Configuration
    _raw_cred_path: str = os.getenv("FIREBASE_CREDENTIALS_PATH", "")
    if _raw_cred_path:
        _p = Path(_raw_cred_path)
        FIREBASE_CREDENTIALS_PATH: str = str((BASE_DIR / _p).resolve()) if not _p.is_absolute() else str(_p)
    elif (BASE_DIR / "serviceAccountKey.json").exists():
        FIREBASE_CREDENTIALS_PATH: str = str((BASE_DIR / "serviceAccountKey.json").resolve())
    else:
        FIREBASE_CREDENTIALS_PATH: str = ""

    FIREBASE_DATABASE_URL: str = os.getenv("FIREBASE_DATABASE_URL", "")

settings = Settings()
