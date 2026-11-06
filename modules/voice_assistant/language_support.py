"""
AgriSmart AI - Multilingual Voice Language Support Configuration (language_support.py)
Provides language registries, BCP-47 locale tags, TTS dialect codes, and localized
error recovery messages for Kannada, English, Hindi, Telugu, and Tamil.
"""

from typing import Dict, Any, Optional

# Supported regional languages with full speech metadata
SUPPORTED_VOICE_LANGUAGES: Dict[str, Dict[str, Any]] = {
    "kannada": {
        "code": "kn",
        "bcp47_locale": "kn-IN",
        "native_name": "ಕನ್ನಡ",
        "tts_tag": "kn",
        "description": "Kannada (Karnataka regional dialect)",
        "default_question": "ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಯಾವ ಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
        "error_messages": {
            "silence": "ಕ್ಷಮಿಸಿ, ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮೈಕ್ರೊಫೋನ್ ಹತ್ತಿರ ಇಟ್ಟುಕೊಂಡು ಮಾತನಾಡಿ.",
            "unintelligible": "ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಮಾತು ಸ್ಪಷ್ಟವಾಗಿ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಪುನಃ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.",
            "format_error": "ಆಡಿಯೋ ಫಾರ್ಮ್ಯಾಟ್ ಬೆಂಬಲಿಸುತ್ತಿಲ್ಲ. ದಯವಿಟ್ಟು ಸರಿಯಾದ WAV ಅಥವಾ MP3 ಆಡಿಯೋ ಬಳಸಿ.",
            "service_error": "ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆಯಲ್ಲಿ ತಾಂತ್ರಿಕ ದೋಷ ಕಂಡುಬಂದಿದೆ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಟೈಪ್ ಮಾಡಿ."
        }
    },
    "english": {
        "code": "en",
        "bcp47_locale": "en-IN",
        "native_name": "English",
        "tts_tag": "en-in",
        "description": "Indian English (Agronomic Standard)",
        "default_question": "What is the best fertilizer and irrigation schedule for tomato crops?",
        "error_messages": {
            "silence": "No voice input detected. Please check your microphone and speak clearly.",
            "unintelligible": "Sorry, could not clearly understand the audio. Please speak closer to the microphone.",
            "format_error": "Unsupported audio format. Please provide a standard WAV, MP3, or OGG file.",
            "service_error": "Speech recognition service encountered an error. Please try again or type your question."
        }
    },
    "hindi": {
        "code": "hi",
        "bcp47_locale": "hi-IN",
        "native_name": "हिन्दी",
        "tts_tag": "hi",
        "description": "Standard Hindi for North & Central Indian farmers",
        "default_question": "टमाटर की फसल के लिए कौन सी खाद सबसे अच्छी है?",
        "error_messages": {
            "silence": "कोई आवाज सुनाई नहीं दी। कृपया माइक्रोफ़ोन की जांच करें और पुनः बोलें।",
            "unintelligible": "क्षमा करें, आपकी बात स्पष्ट रूप से समझ नहीं आई। कृपया दोबारा बोलें।",
            "format_error": "असमर्थित ऑडियो प्रारूप। कृपया वैध WAV या MP3 फ़ाइल का उपयोग करें।",
            "service_error": "आवाज पहचानने में तकनीकी त्रुटि हुई। कृपया अपना प्रश्न लिखकर पूछें।"
        }
    },
    "telugu": {
        "code": "te",
        "bcp47_locale": "te-IN",
        "native_name": "తెలుగు",
        "tts_tag": "te",
        "description": "Telugu for Andhra Pradesh & Telangana farmers",
        "default_question": "టమోటా పంటకు ఏ ఎరువు వేయాలి?",
        "error_messages": {
            "silence": "ఎటువంటి వాయిస్ రికార్డ్ కాలేదు. దయచేసి మైక్రోఫోన్ చెక్ చేసి మళ్లీ మాట్లాడండి.",
            "unintelligible": "క్షమించండి, మీ వాయిస్ స్పష్టంగా అర్థం కాలేదు. దయచేసి మళ్లీ మాట్లాడండి.",
            "format_error": "ఆడియో ఫార్మాట్ సపోర్ట్ చేయలేదు. దయచేసి WAV లేదా MP3 ఫైల్ వాడండి.",
            "service_error": "వాయిస్ రికగ్నిషన్ లో లోపం ఏర్పడింది. దయచేసి టైప్ చేసి ప్రయత్నించండి."
        }
    },
    "tamil": {
        "code": "ta",
        "bcp47_locale": "ta-IN",
        "native_name": "தமிழ்",
        "tts_tag": "ta",
        "description": "Tamil for Tamil Nadu farmers",
        "default_question": "தக்காளி பயிருக்கு என்ன உரம் போட வேண்டும்?",
        "error_messages": {
            "silence": "குரல் எதுவும் கேட்கவில்லை. மைக்ரோஃபோன் சரியாக உள்ளதா எனப் பார்த்து மீண்டும் பேசவும்.",
            "unintelligible": "மன்னிக்கவும், உங்கள் பேச்சு தெளிவாகப் புரியவில்லை. தயவுசெய்து மீண்டும் பேசவும்.",
            "format_error": "ஆடியோ வடிவம் பொருந்தவில்லை. தயவுசெய்து WAV அல்லது MP3 கோப்பைப் பயன்படுத்தவும்.",
            "service_error": "குரல் ஏற்பி சேவையில் பிழை ஏற்பட்டது. தயவுசெய்து தட்டச்சு செய்து அனுப்பவும்."
        }
    }
}


def normalize_language(language: str) -> str:
    """
    Normalizes input language string (e.g. 'kn', 'kannada', 'KN-IN', 'ಕನ್ನಡ') to the canonical key.
    Defaults to 'kannada' as primary regional dialect.
    """
    if not language:
        return "kannada"

    clean = language.strip().lower()

    # Direct match
    if clean in SUPPORTED_VOICE_LANGUAGES:
        return clean

    # Match by ISO code or BCP-47 locale
    for key, data in SUPPORTED_VOICE_LANGUAGES.items():
        if (
            clean == data["code"].lower()
            or clean == data["bcp47_locale"].lower()
            or clean == data["native_name"].lower()
            or clean.startswith(data["code"] + "-")
        ):
            return key

    # Substring match
    for key in SUPPORTED_VOICE_LANGUAGES:
        if clean in key:
            return key

    return "kannada"


def get_bcp47_locale(language: str) -> str:
    """Returns standard BCP-47 locale (e.g. 'kn-IN', 'hi-IN', 'en-IN')."""
    canonical = normalize_language(language)
    return SUPPORTED_VOICE_LANGUAGES[canonical]["bcp47_locale"]


def get_tts_language_tag(language: str) -> str:
    """Returns TTS engine language code (e.g. 'kn', 'hi', 'ta', 'te', 'en-in')."""
    canonical = normalize_language(language)
    return SUPPORTED_VOICE_LANGUAGES[canonical]["tts_tag"]


def get_language_metadata(language: str) -> Dict[str, Any]:
    """Returns complete configuration metadata for a language."""
    canonical = normalize_language(language)
    return SUPPORTED_VOICE_LANGUAGES[canonical]


def get_recognition_error_message(language: str, error_type: str = "unintelligible") -> str:
    """
    Returns localized, empathetic error message for speech recognition failures.
    Supported error_types: 'silence', 'unintelligible', 'format_error', 'service_error'.
    """
    canonical = normalize_language(language)
    errors = SUPPORTED_VOICE_LANGUAGES[canonical]["error_messages"]
    return errors.get(error_type, errors["unintelligible"])

