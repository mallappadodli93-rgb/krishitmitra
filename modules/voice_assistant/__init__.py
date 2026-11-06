"""
AgriSmart AI - Multilingual Voice Assistant Package
"""

from .language_support import (
    SUPPORTED_VOICE_LANGUAGES,
    normalize_language,
    get_bcp47_locale,
    get_tts_language_tag,
    get_language_metadata,
    get_recognition_error_message
)
from .voice_assistant import (
    VoiceAssistant,
    get_voice_assistant
)

__all__ = [
    "SUPPORTED_VOICE_LANGUAGES",
    "normalize_language",
    "get_bcp47_locale",
    "get_tts_language_tag",
    "get_language_metadata",
    "get_recognition_error_message",
    "VoiceAssistant",
    "get_voice_assistant"
]
