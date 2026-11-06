"""
Firebase Firestore Database Module for AgriSmart AI.
Manages secure connections to Google Cloud Firestore via Firebase Admin SDK.
Maintains separate collections for:
  1. farmers
  2. soil_records
  3. weather_records
  4. crop_recommendations
  5. irrigation_records
  6. crop_calendars
  7. water_records

Provides transparent, high-performance in-memory fallback when credentials
are not yet configured so the backend functions seamlessly during development.
"""
from datetime import datetime
import logging
import os
from typing import Any, Dict, List, Optional
import uuid

from app.config import settings

logger = logging.getLogger("AgriSmartAI.Database")

# Standard Collection Names
COLLECTIONS = {
    "farmers": "farmers",
    "soil_records": "soil_records",
    "weather_records": "weather_records",
    "crop_recommendations": "crop_recommendations",
    "irrigation_records": "irrigation_records",
    "crop_calendars": "crop_calendars",
    "water_records": "water_records",
}

# In-memory storage structures for each of the 7 collections
_MOCK_STORAGE: Dict[str, Dict[str, Any]] = {
    "farmers": {},
    "soil_records": {},
    "weather_records": {},
    "crop_recommendations": {},
    "irrigation_records": {},
    "crop_calendars": {},
    "water_records": {},
    "farms": {}, # alias
    "water_profiles": {} # alias
}

_firestore_client = None

def init_firebase():
    """
    Initializes Firebase Admin SDK using secure service account credentials.
    Credentials path is loaded exclusively from environment configuration.
    Never hardcodes secrets. Falls back safely if file is absent.
    """
    global _firestore_client
    cred_path = settings.FIREBASE_CREDENTIALS_PATH

    if cred_path and os.path.exists(cred_path):
        try:
            import firebase_admin
            from firebase_admin import credentials, firestore

            if not firebase_admin._apps:
                cred = credentials.Certificate(cred_path)
                firebase_admin.initialize_app(cred, {
                    "databaseURL": settings.FIREBASE_DATABASE_URL
                } if settings.FIREBASE_DATABASE_URL else None)

            _firestore_client = firestore.client()
            logger.info("Firebase Firestore connected successfully.")
            return _firestore_client
        except Exception as e:
            logger.warning(f"Could not connect to Firebase: {e}. Operating in safe in-memory fallback mode.")
            _firestore_client = None
    else:
        logger.info("No Firebase service account file provided. Operating in safe in-memory fallback mode.")
        _firestore_client = None

    return None

def get_db():
    """Retrieve Firestore client or None if running in fallback."""
    return _firestore_client

def get_database_status() -> Dict[str, Any]:
    """
    Diagnostic status of database connection and collection counts.
    Never exposes secret paths or private keys.
    """
    is_cloud = _firestore_client is not None
    counts = {}
    for col_key, col_name in COLLECTIONS.items():
        if is_cloud:
            try:
                counts[col_name] = len(list(_firestore_client.collection(col_name).limit(100).stream()))
            except Exception:
                counts[col_name] = 0
        else:
            counts[col_name] = len(_MOCK_STORAGE.get(col_key, {}))

    return {
        "status": "connected" if is_cloud else "fallback_active",
        "engine": "Google Cloud Firestore" if is_cloud else "Safe In-Memory Mock Store",
        "credentials_configured": bool(settings.FIREBASE_CREDENTIALS_PATH and os.path.exists(settings.FIREBASE_CREDENTIALS_PATH)),
        "collections": counts,
        "note": "Production connects to Google Cloud Firestore using FIREBASE_CREDENTIALS_PATH service account JSON."
    }

# ==============================================================================
# 1. FARMERS COLLECTION
# ==============================================================================
def save_farmer(data: Dict[str, Any]) -> Dict[str, Any]:
    """Store or update farmer profile and location coordinates."""
    farmer_id = data.get("farmer_id") or data.get("id") or f"FARMER-{str(uuid.uuid4())[:8].upper()}"
    data["farmer_id"] = farmer_id
    data["id"] = farmer_id
    data["updated_at"] = datetime.utcnow().isoformat()
    if "created_at" not in data:
        data["created_at"] = data["updated_at"]

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["farmers"]).document(farmer_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing farmer {farmer_id}: {e}")

    _MOCK_STORAGE["farmers"][farmer_id] = data
    _MOCK_STORAGE["farms"][farmer_id] = data
    return data

def get_farmer(farmer_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve farmer profile by ID."""
    if _firestore_client:
        try:
            doc = _firestore_client.collection(COLLECTIONS["farmers"]).document(farmer_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.error(f"Firestore error reading farmer {farmer_id}: {e}")

    return _MOCK_STORAGE["farmers"].get(farmer_id)

def list_farmers(limit: int = 50) -> List[Dict[str, Any]]:
    """List registered farmers with their farm locations."""
    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["farmers"]).limit(limit).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error listing farmers: {e}")

    return list(_MOCK_STORAGE["farmers"].values())[:limit]

# Aliases
save_farm_profile = save_farmer
list_farm_profiles = list_farmers

# ==============================================================================
# 2. SOIL_RECORDS COLLECTION
# ==============================================================================
def save_soil_record(farmer_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Store soil test analysis report linked to a farmer."""
    record_id = data.get("record_id") or f"SOIL-{str(uuid.uuid4())[:8].upper()}"
    data["record_id"] = record_id
    data["farmer_id"] = farmer_id
    data["created_at"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["soil_records"]).document(record_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing soil record: {e}")

    _MOCK_STORAGE["soil_records"][record_id] = data
    return data

def get_soil_records_by_farmer(farmer_id: str) -> List[Dict[str, Any]]:
    """Retrieve historical soil health test records for a farmer."""
    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["soil_records"]).where("farmer_id", "==", farmer_id).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error querying soil records: {e}")

    return [r for r in _MOCK_STORAGE["soil_records"].values() if r.get("farmer_id") == farmer_id]

# ==============================================================================
# 3. WEATHER_RECORDS COLLECTION
# ==============================================================================
def save_weather_record(data: Dict[str, Any]) -> Dict[str, Any]:
    """Store meteorological snapshot, observation, or weather hazard alert."""
    record_id = data.get("record_id") or f"WX-{str(uuid.uuid4())[:8].upper()}"
    data["record_id"] = record_id
    data["timestamp"] = data.get("timestamp") or datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["weather_records"]).document(record_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing weather record: {e}")

    _MOCK_STORAGE["weather_records"][record_id] = data
    return data

def get_recent_weather_records(limit: int = 20) -> List[Dict[str, Any]]:
    """Retrieve recent weather records or logged alerts."""
    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["weather_records"]).limit(limit).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error reading weather records: {e}")

    return list(_MOCK_STORAGE["weather_records"].values())[-limit:]

# ==============================================================================
# 4. CROP_RECOMMENDATIONS COLLECTION
# ==============================================================================
def save_crop_recommendation(farmer_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Store generated crop suitability recommendations for a farmer."""
    record_id = data.get("recommendation_id") or f"CROP-REC-{str(uuid.uuid4())[:8].upper()}"
    data["recommendation_id"] = record_id
    data["farmer_id"] = farmer_id
    data["created_at"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["crop_recommendations"]).document(record_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing crop recommendation: {e}")

    _MOCK_STORAGE["crop_recommendations"][record_id] = data
    return data

def get_crop_recommendations_by_farmer(farmer_id: str) -> List[Dict[str, Any]]:
    """Retrieve saved crop recommendation reports for a farmer."""
    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["crop_recommendations"]).where("farmer_id", "==", farmer_id).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error querying crop recommendations: {e}")

    return [r for r in _MOCK_STORAGE["crop_recommendations"].values() if r.get("farmer_id") == farmer_id]

# ==============================================================================
# 5. IRRIGATION_RECORDS COLLECTION
# ==============================================================================
def save_irrigation_record(farmer_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Store smart irrigation decision and sensor/forecast telemetry."""
    record_id = data.get("record_id") or f"IRR-{str(uuid.uuid4())[:8].upper()}"
    data["record_id"] = record_id
    data["farmer_id"] = farmer_id
    data["created_at"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["irrigation_records"]).document(record_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing irrigation record: {e}")

    _MOCK_STORAGE["irrigation_records"][record_id] = data
    return data

def get_irrigation_records_by_farmer(farmer_id: str) -> List[Dict[str, Any]]:
    """Retrieve irrigation history and watering advisories for a farmer."""
    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["irrigation_records"]).where("farmer_id", "==", farmer_id).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error querying irrigation records: {e}")

    return [r for r in _MOCK_STORAGE["irrigation_records"].values() if r.get("farmer_id") == farmer_id]

# ==============================================================================
# 6. CROP_CALENDARS COLLECTION
# ==============================================================================
def save_crop_calendar(farmer_id: str, calendar_data: Dict[str, Any]) -> Dict[str, Any]:
    """Store generated crop growth calendar linked to a farmer ID."""
    calendar_id = calendar_data.get("calendar_id") or f"CAL-{str(uuid.uuid4())[:8].upper()}"
    calendar_data["calendar_id"] = calendar_id
    calendar_data["farmer_id"] = farmer_id
    calendar_data["created_at"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["crop_calendars"]).document(calendar_id).set(calendar_data)
            return calendar_data
        except Exception as e:
            logger.error(f"Firestore error writing calendar to Firestore: {e}")

    _MOCK_STORAGE["crop_calendars"][calendar_id] = calendar_data
    return calendar_data

def get_crop_calendars_by_farmer(farmer_id: str) -> List[Dict[str, Any]]:
    """Retrieve saved crop growth calendars for a farmer."""
    results: List[Dict[str, Any]] = []

    if _firestore_client:
        try:
            docs = _firestore_client.collection(COLLECTIONS["crop_calendars"]).where("farmer_id", "==", farmer_id).stream()
            return [doc.to_dict() for doc in docs]
        except Exception as e:
            logger.error(f"Firestore error querying calendars from Firestore: {e}")

    for cal in _MOCK_STORAGE["crop_calendars"].values():
        if cal.get("farmer_id") == farmer_id:
            results.append(cal)
    return results

# ==============================================================================
# 7. WATER_RECORDS COLLECTION
# ==============================================================================
def save_water_record(farmer_id: str, data: Dict[str, Any]) -> Dict[str, Any]:
    """Store farmer water assets and capacity profile."""
    data["farmer_id"] = farmer_id
    data["last_updated"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["water_records"]).document(farmer_id).set(data)
            return data
        except Exception as e:
            logger.error(f"Firestore error writing water record to Firestore: {e}")

    _MOCK_STORAGE["water_records"][farmer_id] = data
    _MOCK_STORAGE["water_profiles"][farmer_id] = data
    return data

def get_water_record(farmer_id: str) -> Optional[Dict[str, Any]]:
    """Retrieve farmer water availability profile."""
    if _firestore_client:
        try:
            doc = _firestore_client.collection(COLLECTIONS["water_records"]).document(farmer_id).get()
            if doc.exists:
                return doc.to_dict()
        except Exception as e:
            logger.error(f"Firestore error reading water record from Firestore: {e}")

    return _MOCK_STORAGE["water_records"].get(farmer_id) or _MOCK_STORAGE["water_profiles"].get(farmer_id)

def update_water_record(farmer_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    """Update water assets and storage levels."""
    existing = get_water_record(farmer_id)
    if not existing:
        return None

    existing.update(updates)
    existing["last_updated"] = datetime.utcnow().isoformat()

    if _firestore_client:
        try:
            _firestore_client.collection(COLLECTIONS["water_records"]).document(farmer_id).set(existing)
            return existing
        except Exception as e:
            logger.error(f"Firestore error updating water record in Firestore: {e}")

    _MOCK_STORAGE["water_records"][farmer_id] = existing
    _MOCK_STORAGE["water_profiles"][farmer_id] = existing
    return existing

# Aliases
save_water_profile = save_water_record
get_water_profile = get_water_record
update_water_profile = update_water_record
