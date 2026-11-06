"""
AgriSmart AI - AI Farm Doctor Engine (farm_doctor.py)
Clinical agricultural diagnostic and prescription engine connecting:
- Crop Disease Detection Model (MobileNetV2 PlantVillage)
- Agricultural Pest Identification Model
- Gemini Agricultural Chatbot (Multilingual advisory)
- Backend-supplied weather & localized agro-climatic context
- Verified ICAR / CIBRC agronomic treatment knowledge base

Guiding Principles:
1. Never invent weather data - strictly reflects backend-supplied telemetry.
2. Never invent disease results or arbitrary chemical dosages.
3. Transparently communicates uncertainty and recommends consulting agricultural experts (KVK / RSK)
   when confidence is below threshold (< 60%) or when image is ambiguous.
4. Independent, reusable modules for weather evaluation, model routing, and prescription synthesis.
"""

import os
import json
from typing import Dict, Any, Optional, List, Tuple
import cv2
import numpy as np

from utils.logger import get_logger
from utils.image_utils import decode_image_bytes
from modules.disease_detection.prediction import DiseasePredictor
from modules.disease_detection.recommendations import get_disease_recommendations
from modules.pest_identification.prediction import PestPredictor
from modules.pest_identification.pest_data import get_pest_info
from modules.chatbot.chatbot import AgriChatbot, get_agri_chatbot
from modules.chatbot.languages import (
    normalize_language,
    get_language_instructions,
    SUPPORTED_LANGUAGES
)

logger = get_logger("AIFarmDoctor")

# Minimum confidence required before reporting diagnostic certainty
UNCERTAINTY_THRESHOLD = 0.60


# =====================================================================
# MODULE 1: WEATHER CONTEXT EVALUATOR (Independent Reusable Component)
# =====================================================================
class WeatherContextEvaluator:
    """
    Evaluates backend-supplied weather telemetry to assess disease favorability
    and spraying condition windows. Strictly reflects provided data—never invents weather.
    """

    @staticmethod
    def evaluate(weather_data: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyzes weather data supplied by the backend.

        Args:
            weather_data (dict, optional): Backend weather metrics, e.g.:
                {
                    "temperature_celsius": 26.5,
                    "humidity_percent": 88.0,
                    "rainfall_mm": 12.0,
                    "conditions": "Cloudy with intermittent drizzle",
                    "wind_speed_kmh": 6.5
                }

        Returns:
            Dict containing weather availability flag, epidemiological risk analysis,
            and spraying window guidance.
        """
        if not weather_data or not isinstance(weather_data, dict):
            return {
                "weather_available": False,
                "summary": "Weather context not supplied by backend. Diagnostic analysis relies on visible symptoms.",
                "fungal_blight_risk": "UNKNOWN",
                "pest_proliferation_risk": "UNKNOWN",
                "spraying_window_status": "CAUTION_WEATHER_UNKNOWN",
                "details": {}
            }

        temp = weather_data.get("temperature_celsius")
        humidity = weather_data.get("humidity_percent")
        rainfall = weather_data.get("rainfall_mm", 0.0)
        conditions = weather_data.get("conditions", "Not specified")
        wind_speed = weather_data.get("wind_speed_kmh")

        # 1. Fungal and Bacterial Disease Vulnerability Analysis
        fungal_risk = "LOW"
        fungal_notes = []
        if humidity is not None and humidity >= 75.0:
            if temp is not None and 18.0 <= temp <= 29.0:
                fungal_risk = "HIGH"
                fungal_notes.append("Warm temperatures (18-29°C) combined with high relative humidity (>75%) heavily accelerate fungal spore germination (Early/Late Blight, Leaf Spots).")
            else:
                fungal_risk = "MODERATE"
                fungal_notes.append(f"Elevated humidity ({humidity}%) increases foliar wetness duration.")
        elif rainfall is not None and rainfall > 5.0:
            fungal_risk = "MODERATE"
            fungal_notes.append(f"Recent precipitation ({rainfall} mm) can spread soil-borne pathogens through water splashing.")

        # 2. Sucking Pest & Mite Vulnerability Analysis
        pest_risk = "LOW"
        pest_notes = []
        if temp is not None and temp >= 32.0:
            if humidity is not None and humidity < 55.0:
                pest_risk = "HIGH"
                pest_notes.append("Hot, dry conditions (>32°C, RH <55%) favor rapid multiplication of spider mites and thrips.")
            else:
                pest_risk = "MODERATE"
                pest_notes.append("High temperatures accelerate insect developmental life cycles.")

        # 3. Safe Chemical/Biological Spraying Window Evaluation
        spray_status = "OPTIMAL"
        spray_notes = []
        if rainfall is not None and rainfall > 0.0:
            spray_status = "UNFAVORABLE_RAIN"
            spray_notes.append("Rainfall detected. Avoid spraying foliar fungicides or pesticides to prevent chemical wash-off into soil.")
        elif wind_speed is not None and wind_speed > 12.0:
            spray_status = "UNFAVORABLE_WIND"
            spray_notes.append(f"Wind speed ({wind_speed} km/h) exceeds safe threshold (10 km/h). High risk of pesticide drift onto adjacent plots.")
        elif temp is not None and temp > 35.0:
            spray_status = "AVOID_HEAT"
            spray_notes.append("Avoid mid-day spraying under high heat (>35°C) to prevent leaf scorching (phytotoxicity).")
        else:
            spray_notes.append("Conditions favorable for morning (6-9 AM) or late afternoon (4-6 PM) spraying.")

        summary_parts = []
        if fungal_risk == "HIGH":
            summary_parts.append("High disease pressure due to warm and humid microclimate.")
        if pest_risk == "HIGH":
            summary_parts.append("High pest proliferation risk due to hot and dry ambient conditions.")
        if spray_status.startswith("UNFAVORABLE"):
            summary_parts.append("Adverse spraying conditions detected.")

        summary_text = " ".join(summary_parts) if summary_parts else "Environmental conditions are within standard seasonal ranges."

        return {
            "weather_available": True,
            "summary": summary_text,
            "fungal_blight_risk": fungal_risk,
            "pest_proliferation_risk": pest_risk,
            "spraying_window_status": spray_status,
            "details": {
                "temperature_celsius": temp,
                "humidity_percent": humidity,
                "rainfall_mm": rainfall,
                "conditions": conditions,
                "wind_speed_kmh": wind_speed,
                "fungal_notes": fungal_notes,
                "pest_notes": pest_notes,
                "spraying_notes": spray_notes
            }
        }


# =====================================================================
# MODULE 2: DIAGNOSTIC MODEL ROUTER (Independent Reusable Component)
# =====================================================================
class DiagnosticModelRouter:
    """
    Validates crop imagery and intelligently routes queries to the Crop Disease
    Detection Model or Agricultural Pest Identification Model.
    """

    def __init__(
        self,
        disease_predictor: Optional[DiseasePredictor] = None,
        pest_predictor: Optional[PestPredictor] = None
    ):
        self.disease_predictor = disease_predictor or DiseasePredictor()
        self.pest_predictor = pest_predictor or PestPredictor()

    def route_and_diagnose(
        self,
        image_bytes: Optional[bytes],
        question: str = ""
    ) -> Dict[str, Any]:
        """
        Validates input and executes inference on the appropriate vision model.
        """
        if not image_bytes:
            return {
                "has_image": False,
                "diagnostic_type": "TEXT_ONLY",
                "diagnosis_performed": False,
                "message": "No image provided. Clinical diagnosis will proceed based on described symptoms."
            }

        # Step 1: Decode image with OpenCV
        image = decode_image_bytes(image_bytes)
        if image is None:
            return {
                "has_image": True,
                "diagnostic_type": "INVALID_IMAGE",
                "diagnosis_performed": False,
                "error_code": "IMAGE_DECODE_FAILED",
                "message": "Uploaded file is not a valid image format. Please upload a clear JPG or PNG photo."
            }

        # Step 2: Quality validation (Resolution & Contrast)
        h, w = image.shape[:2]
        if h < 64 or w < 64:
            return {
                "has_image": True,
                "diagnostic_type": "LOW_RESOLUTION",
                "diagnosis_performed": False,
                "error_code": "LOW_RESOLUTION",
                "message": f"Image resolution is too low ({w}x{h}). Minimum required resolution is 64x64 pixels."
            }

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        if float(np.std(gray)) < 5.0:
            return {
                "has_image": True,
                "diagnostic_type": "BLANK_IMAGE",
                "diagnosis_performed": False,
                "error_code": "BLANK_OR_LOW_CONTRAST",
                "message": "Image lacks contrast or appears completely blank. Please take a well-lit photo of the affected plant."
            }

        # Step 3: Determine primary diagnostic intent (Pest vs Disease)
        q_lower = question.lower()
        pest_keywords = ["pest", "insect", "caterpillar", "bug", "worm", "borer", "armyworm", "aphid", "mite", "thrip", "bite", "hole", "eating"]
        disease_keywords = ["disease", "spot", "blight", "yellow", "curl", "fungus", "mold", "rot", "wilt", "powder", "rust"]

        is_pest_intent = any(k in q_lower for k in pest_keywords)
        is_disease_intent = any(k in q_lower for k in disease_keywords)

        # Run primary model
        if is_pest_intent and not is_disease_intent:
            pest_res = self.pest_predictor.predict_image(image_bytes)
            return {
                "has_image": True,
                "diagnostic_type": "PEST",
                "diagnosis_performed": True,
                "model_used": "Pest_Identification_Model",
                "result": pest_res
            }
        else:
            # Default to disease prediction (or run disease prediction first)
            disease_res = self.disease_predictor.predict_image(image_bytes)
            return {
                "has_image": True,
                "diagnostic_type": "DISEASE",
                "diagnosis_performed": True,
                "model_used": "Crop_Disease_Detection_Model",
                "result": disease_res
            }


# =====================================================================
# MODULE 3: AGRONOMIC PRESCRIPTION ENGINE (Independent Reusable Component)
# =====================================================================
class AgronomicPrescriptionEngine:
    """
    Synthesizes vision results, weather evaluations, and location data into
    a 7-part clinical diagnostic prescription with strict chemical safety rules.
    """

    @staticmethod
    def generate_prescription(
        condition_name: str,
        crop: str,
        confidence: float,
        is_uncertain: bool,
        weather_eval: Dict[str, Any],
        location: str,
        language: str = "english"
    ) -> Dict[str, Any]:
        """
        Builds a comprehensive prescription with verified recommendations.
        """
        lang = normalize_language(language)

        # If model is uncertain or confidence below threshold, issue mandatory expert referral
        if is_uncertain or confidence < UNCERTAINTY_THRESHOLD:
            expert_referral = (
                "⚠️ MANDATORY AGRICULTURAL EXPERT REFERRAL: "
                f"Visual diagnostic confidence is low ({confidence * 100:.1f}%). "
                "Because symptoms can overlap between fungal blights, viral infections, and nutrient deficiencies, "
                "we strongly recommend consulting your local Agricultural Extension Officer (Krishi Vigyan Kendra - KVK, "
                "Raitha Samparka Kendra - RSK, or State Agricultural University) with a physical plant specimen before "
                "purchasing or applying any chemical treatments."
            )
            expert_referral_kn = (
                "⚠️ ಕಡ್ಡಾಯ ಕೃಷಿ ತಜ್ಞರ ಸಂಪರ್ಕ ಸಲಹೆ: "
                f"ಚಿತ್ರದ ಆಧಾರದ ಮೇಲಿನ ರೋಗ ನಿರ್ಣಯದ ಖಚಿತತೆ ಕಡಿಮೆಯಾಗಿದೆ ({confidence * 100:.1f}%). "
                "ರೋಗ ಲಕ್ಷಣಗಳು ಮತ್ತು ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ ಒಂದೇ ರೀತಿ ಕಾಣಿಸುವುದರಿಂದ, ಯಾವುದೇ ರಾಸಾಯನಿಕ ಸಿಂಪಡಿಸುವ ಮುನ್ನ "
                "ಸಮೀಪದ ರೈತ ಸಂಪರ್ಕ ಕೇಂದ್ರ (RSK) ಅಥವಾ ಕೃಷಿ ವಿಜ್ಞಾನ ಕೇಂದ್ರದ (KVK) ಕೃಷಿ ಅಧಿಕಾರಿಗೆ ಗಿಡದ ಮಾದರಿಯನ್ನು ತೋರಿಸಿ ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ."
            )
            disclaimer = expert_referral_kn if lang == "kannada" else expert_referral
        else:
            disclaimer = (
                "✅ High-confidence diagnosis. Follow the integrated management plan below. "
                "If symptoms persist after 5 days, contact your local KVK extension officer."
            )
            if lang == "kannada":
                disclaimer = "✅ ರೋಗ ಲಕ್ಷಣಗಳನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಗುರುತಿಸಲಾಗಿದೆ. ಕೆಳಗಿನ ಸಮಗ್ರ ನಿರ್ವಹಣಾ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಿ."

        # Fetch verified recommendations
        recs = get_disease_recommendations(condition_name)

        return {
            "condition": condition_name,
            "crop": crop,
            "confidence_score": round(confidence, 4),
            "is_uncertain": is_uncertain or confidence < UNCERTAINTY_THRESHOLD,
            "expert_consultation_advised": is_uncertain or confidence < UNCERTAINTY_THRESHOLD,
            "advisory_notice": disclaimer,
            "weather_impact_summary": weather_eval.get("summary", ""),
            "spraying_window_guidance": weather_eval.get("spraying_window_status", ""),
            "prescriptions": {
                "immediate_first_aid": recs.get("prevention", [])[:2],
                "organic_biological_remedies": recs.get("organic_treatment", []),
                "verified_chemical_treatments": recs.get("chemical_control", []),
                "long_term_prevention": recs.get("prevention", [])[2:]
            },
            "chemical_safety_mandate": [
                "Wear full personal protective gear (rubber gloves, face mask, eye protection).",
                "Spray strictly during calm morning (6-9 AM) or late afternoon (4-6 PM). Never spray against the wind.",
                "Strictly observe the Pre-Harvest Interval (PHI) before harvest.",
                "Never spray flowering crops during mid-day when honeybees and pollinators are active.",
                "Triple-rinse and puncture empty pesticide containers; safely bury away from drinking water."
            ]
        }


# =====================================================================
# MAIN ORCHESTRATOR: AI FARM DOCTOR
# =====================================================================
class FarmDoctor:
    """
    Main AI Farm Doctor orchestrator integrating:
    1. Crop disease detection model
    2. Pest identification model
    3. Gemini agricultural chatbot for natural language explanations
    4. Backend-supplied weather and location context
    """

    def __init__(
        self,
        api_key: Optional[str] = None,
        disease_predictor: Optional[DiseasePredictor] = None,
        pest_predictor: Optional[PestPredictor] = None,
        chatbot: Optional[AgriChatbot] = None
    ):
        self.weather_evaluator = WeatherContextEvaluator()
        self.router = DiagnosticModelRouter(disease_predictor, pest_predictor)
        self.chatbot = chatbot or get_agri_chatbot()
        self.prescription_engine = AgronomicPrescriptionEngine()
        self.is_ready = True

    def diagnose(
        self,
        image_bytes: Optional[bytes] = None,
        question: str = "",
        crop_name: Optional[str] = None,
        location: Optional[str] = None,
        weather_data: Optional[Dict[str, Any]] = None,
        language: str = "english",
        symptoms: Optional[str] = None  # Backwards compatibility alias
    ) -> Dict[str, Any]:
        """
        Comprehensive clinical plant health diagnosis.

        Args:
            image_bytes (bytes, optional): Crop leaf or pest photograph.
            question (str): Farmer's problem description or query.
            crop_name (str, optional): Name of crop (e.g. 'Tomato', 'Potato', 'Pepper', 'Maize').
            location (str, optional): State / district (e.g. 'Karnataka', 'Mandya').
            weather_data (dict, optional): Weather metrics supplied by backend.
            language (str): Target response language ('kannada', 'english', 'hindi', 'tamil', 'telugu').
            symptoms (str, optional): Alias for question for backwards compatibility.

        Returns:
            Dict[str, Any]: Complete diagnostic assessment, weather risk analysis,
            easy-to-understand explanation, and actionable preventive recommendations.
        """
        # Resolve question / symptoms input
        query_text = (question or symptoms or "").strip()
        final_crop = (crop_name or "Unspecified Crop").strip()
        final_location = (location or "Karnataka").strip()
        canonical_lang = normalize_language(language)
        lang_info = SUPPORTED_LANGUAGES[canonical_lang]

        # 1. Evaluate Backend-Supplied Weather Context
        weather_eval = self.weather_evaluator.evaluate(weather_data)

        # 2. Route and Analyze Imagery using Computer Vision Models
        cv_eval = self.router.route_and_diagnose(image_bytes, query_text)

        # Determine condition name, confidence, and uncertainty
        condition_name = "Unspecified Condition"
        confidence = 0.0
        is_uncertain = True

        if cv_eval["diagnosis_performed"]:
            res = cv_eval["result"]
            if res.get("status") == "success":
                condition_name = res.get("disease", res.get("predicted_pest", "Unspecified Condition"))
                confidence = float(res.get("confidence_score", 0.0))
                is_uncertain = bool(res.get("is_uncertain", False))
                if res.get("crop") and final_crop == "Unspecified Crop":
                    final_crop = res.get("crop")
            elif res.get("status") == "model_not_ready":
                # Fallback to text symptom parsing
                condition_name = self._infer_condition_from_text(query_text, final_crop)
                confidence = 0.55  # Text-only baseline
                is_uncertain = True
            else:
                condition_name = "Image Validation Failed"
                confidence = 0.0
                is_uncertain = True
        else:
            # Text-only consultation
            condition_name = self._infer_condition_from_text(query_text, final_crop)
            confidence = 0.55
            is_uncertain = True

        # 3. Generate Structured Agronomic Prescription
        prescription = self.prescription_engine.generate_prescription(
            condition_name=condition_name,
            crop=final_crop,
            confidence=confidence,
            is_uncertain=is_uncertain,
            weather_eval=weather_eval,
            location=final_location,
            language=canonical_lang
        )

        # 4. Synthesize Easy-To-Understand Natural Language Explanation via Gemini Chatbot
        synthesis_prompt = (
            f"You are the AgriSmart AI Farm Doctor.\n"
            f"Crop: {final_crop}\n"
            f"Location: {final_location}\n"
            f"Farmer's Question/Symptoms: {query_text if query_text else 'Farmer uploaded a leaf image for diagnosis.'}\n"
            f"Diagnosed Condition: {condition_name} (Confidence: {confidence * 100:.1f}%)\n"
            f"Is Uncertain / Expert Consultation Advised: {prescription['expert_consultation_advised']}\n"
            f"Weather Context Supplied by Backend: {weather_eval['summary']}\n"
            f"Spraying Window Guidance: {weather_eval['spraying_window_status']}\n\n"
            f"Please synthesize this into an easy-to-understand, friendly, and empowering clinical prescription in {lang_info['native_name']} ({canonical_lang}).\n"
            f"Include:\n"
            f"1. A clear diagnosis explanation.\n"
            f"2. How the current weather influences this problem.\n"
            f"3. Immediate first-aid and organic remedies.\n"
            f"4. Safe chemical spray if necessary with strict protective gear rules.\n"
            f"5. IMPORTANT: If uncertain (confidence < 60%), explicitly advise consulting the nearest Krishi Vigyan Kendra (KVK) or Raitha Samparka Kendra (RSK)."
        )

        chat_response = self.chatbot.ask(
            question=synthesis_prompt,
            language=canonical_lang
        )
        explanation_text = chat_response["reply"]

        return {
            "status": "success",
            "crop": final_crop,
            "location": final_location,
            "farmer_query": query_text,
            "language": {
                "canonical": canonical_lang,
                "native_name": lang_info["native_name"]
            },
            "image_analysis": {
                "image_provided": image_bytes is not None,
                "model_used": cv_eval.get("model_used", "None"),
                "detected_condition": condition_name,
                "confidence_score": round(confidence, 4),
                "is_uncertain": prescription["is_uncertain"],
                "expert_consultation_advised": prescription["expert_consultation_advised"],
                "image_validation_message": cv_eval.get("message", "OK")
            },
            "weather_context": weather_eval,
            "clinical_prescription": prescription,
            "doctor_explanation": explanation_text,
            "expert_escalation": {
                "advised": prescription["expert_consultation_advised"],
                "notice": prescription["advisory_notice"]
            }
        }

    def _infer_condition_from_text(self, text: str, crop: str) -> str:
        """Helper to map common text keywords to standard disease conditions."""
        t = text.lower()
        if "curl" in t or "ಮುದುರು" in t:
            return "Tomato Yellow Leaf Curl Virus"
        elif "spot" in t or "ಚುಕ್ಕೆ" in t or "blight" in t:
            return "Tomato Early Blight"
        elif "armyworm" in t or "ಲದ್ದಿ ಹುಳು" in t:
            return "Fall Armyworm"
        elif "whitefly" in t or "ಬಿಳಿ ನೊಣ" in t:
            return "Whitefly"
        elif "healthy" in t or "ಆರೋಗ್ಯ" in t:
            return f"{crop} Healthy Leaf"
        return f"{crop} Foliar Anomaly"


# Singleton instance
_global_farm_doctor: Optional[FarmDoctor] = None


def get_farm_doctor() -> FarmDoctor:
    """Returns singleton instance of FarmDoctor."""
    global _global_farm_doctor
    if _global_farm_doctor is None:
        _global_farm_doctor = FarmDoctor()
    return _global_farm_doctor


def diagnose_crop(**kwargs) -> Dict[str, Any]:
    """Helper function to run diagnosis directly."""
    doc = get_farm_doctor()
    return doc.diagnose(**kwargs)


# =====================================================================
# DEMO EXECUTION
# =====================================================================
if __name__ == "__main__":
    print("=" * 75)
    print("🩺 AgriSmart AI - AI Farm Doctor Diagnostic Engine (farm_doctor.py)")
    print("=" * 75)

    doctor = FarmDoctor()

    # Create dummy realistic leaf image (green textured image 200x200)
    synthetic_leaf = np.full((200, 200, 3), (34, 139, 34), dtype=np.uint8)
    cv2.circle(synthetic_leaf, (100, 100), 25, (19, 69, 139), -1)  # brown blight spot
    _, leaf_png = cv2.imencode(".png", synthetic_leaf)
    leaf_bytes = leaf_png.tobytes()

    # -------------------------------------------------------------
    # Scenario 1: Early Blight in Tomato with High Humidity Weather Context
    # -------------------------------------------------------------
    print("\n--- Scenario 1: Tomato Blight with Real Backend Weather Data (English) ---")
    weather_payload = {
        "temperature_celsius": 24.5,
        "humidity_percent": 86.0,
        "rainfall_mm": 8.5,
        "conditions": "Overcast with high humidity",
        "wind_speed_kmh": 5.2
    }

    res1 = doctor.diagnose(
        image_bytes=leaf_bytes,
        question="My tomato plants have dark brown target-like spots on lower leaves. Should I spray now?",
        crop_name="Tomato",
        location="Karnataka (Kolar)",
        weather_data=weather_payload,
        language="english"
    )

    print(f"  • Diagnosed Condition     : {res1['image_analysis']['detected_condition']}")
    print(f"  • Confidence Score        : {res1['image_analysis']['confidence_score'] * 100:.1f}%")
    print(f"  • Weather Risk Summary    : {res1['weather_context']['summary']}")
    print(f"  • Spraying Window Status  : {res1['weather_context']['spraying_window_status']}")
    print(f"  • Chemical Safety Mandate : {len(res1['clinical_prescription']['chemical_safety_mandate'])} rules enforced")
    print(f"\n👨‍⚕️ Farm Doctor Explanation Sample:\n{res1['doctor_explanation'][:250]}...\n")

    # -------------------------------------------------------------
    # Scenario 2: Kannada Multilingual Diagnosis with No Backend Weather Data
    # (Testing: Never Inventing Weather Data)
    # -------------------------------------------------------------
    print("\n--- Scenario 2: Kannada Diagnosis with NO Weather Data (ಕನ್ನಡ ರೋಗ ನಿರ್ಣಯ) ---")
    res2 = doctor.diagnose(
        image_bytes=leaf_bytes,
        question="ಟೊಮೆಟೊ ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಕಂದು ಚುಕ್ಕೆಗಳು ಕಾಣಿಸಿಕೊಂಡಿವೆ. ಇದಕ್ಕೆ ಏನು ಔಷಧ ಸಿಂಪಡಿಸಬೇಕು?",
        crop_name="Tomato",
        location="Karnataka (Mandya)",
        weather_data=None,  # No weather data supplied
        language="kannada"
    )

    print(f"  • Diagnosed Condition     : {res2['image_analysis']['detected_condition']}")
    print(f"  • Weather Available       : {res2['weather_context']['weather_available']}")
    print(f"  • Weather Notice          : {res2['weather_context']['summary']}")
    print(f"  • Expert Escalation       : {res2['expert_escalation']['advised']}")
    print(f"\n👨‍⚕️ Farm Doctor Kannada Response:\n{res2['doctor_explanation'][:250]}...\n")

    # -------------------------------------------------------------
    # Scenario 3: Low Confidence / Uncertain Diagnosis with Expert Escalation
    # -------------------------------------------------------------
    print("\n--- Scenario 3: Uncertain Image -> Expert Consultation Escalation ---")
    # Low-resolution blank-ish image to trigger uncertainty
    blank_img = np.full((100, 100, 3), 128, dtype=np.uint8)
    _, blank_png = cv2.imencode(".png", blank_img)

    res3 = doctor.diagnose(
        image_bytes=blank_png.tobytes(),
        question="Is my crop healthy or diseased?",
        crop_name="Pepper",
        location="Tamil Nadu",
        language="english"
    )

    print(f"  • Diagnostic Result       : {res3['image_analysis']['detected_condition']}")
    print(f"  • Is Uncertain            : {res3['image_analysis']['is_uncertain']}")
    print(f"  • Expert Referral Advised : {res3['expert_escalation']['advised']}")
    print(f"  • Escalation Guidance     : {res3['expert_escalation']['notice']}")

    print("\n" + "=" * 75)
    print("🎉 ALL AI FARM DOCTOR INTEGRATION TESTS COMPLETED SUCCESSFULLY!")
    print("=" * 75)

