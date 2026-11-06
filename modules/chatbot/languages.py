"""
AgriSmart AI - Multilingual Configuration
Supports regional Indian languages for farming Q&A: Kannada, English, Hindi, Tamil, and Telugu.
"""

from typing import Dict, Any

SUPPORTED_LANGUAGES: Dict[str, Dict[str, str]] = {
    "kannada": {
        "code": "kn",
        "native_name": "ಕನ್ನಡ",
        "description": "Kannada language support for Karnataka farmers",
        "instruction": "Respond entirely in clear, simple, and polite Kannada (ಕನ್ನಡ). Use terminology commonly understood by local farmers."
    },
    "english": {
        "code": "en",
        "native_name": "English",
        "description": "Standard English support",
        "instruction": "Respond in clear, accessible, and practical English suitable for farmers and agricultural students."
    },
    "hindi": {
        "code": "hi",
        "native_name": "हिन्दी",
        "description": "Hindi language support for North/Central Indian farmers",
        "instruction": "Respond entirely in simple, respectful, and standard Hindi (हिन्दी / सरल हिन्दी). Avoid overly complex academic jargon."
    },
    "tamil": {
        "code": "ta",
        "native_name": "தமிழ்",
        "description": "Tamil language support for Tamil Nadu farmers",
        "instruction": "Respond entirely in fluent, practical Tamil (தமிழ்). Use common agrarian terms familiar to Tamil Nadu farmers."
    },
    "telugu": {
        "code": "te",
        "native_name": "తెలుగు",
        "description": "Telugu language support for Andhra Pradesh & Telangana farmers",
        "instruction": "Respond entirely in friendly and authentic Telugu (తెలుగు) using practical farming vocabulary."
    }
}


def normalize_language(language: str) -> str:
    """
    Normalizes language input string (e.g. 'kn', 'kannada', 'KANNADA') to the canonical key.
    Defaults to 'english' if not matched.
    """
    clean_lang = language.strip().lower()

    # Direct match
    if clean_lang in SUPPORTED_LANGUAGES:
        return clean_lang

    # Match by ISO code
    for key, data in SUPPORTED_LANGUAGES.items():
        if data["code"] == clean_lang or data["native_name"].lower() == clean_lang:
            return key

    # Substring match
    for key in SUPPORTED_LANGUAGES:
        if clean_lang in key:
            return key

    return "english"


def get_language_instructions(language: str) -> str:
    """
    Returns the system prompt language enforcement string.
    """
    canonical_key = normalize_language(language)
    return SUPPORTED_LANGUAGES[canonical_key]["instruction"]

