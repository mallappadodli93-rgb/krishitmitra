"""
AgriSmart AI - Voice Processor Wrapper
Maintains backwards compatibility for existing voice routes by wrapping VoiceAssistant.
"""

from typing import Dict, Any, Optional
from modules.voice_assistant.voice_assistant import VoiceAssistant, get_voice_assistant
from modules.voice_assistant.language_support import normalize_language


class VoiceProcessor:
    """Wrapper exposing transcribe_audio and process_voice_query."""

    def __init__(self, api_key: Optional[str] = None):
        self.assistant = VoiceAssistant(api_key=api_key)

    def transcribe_audio(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/wav",
        language_hint: Optional[str] = None,
        language: str = "kannada"
    ) -> Dict[str, Any]:
        """Transcribes farmer speech audio into text."""
        lang = language_hint or language
        return self.assistant.speech_to_text(audio_bytes, mime_type=mime_type, language=lang)

    def process_voice_query(
        self,
        audio_bytes: bytes,
        mime_type: str = "audio/wav",
        language: str = "kannada"
    ) -> Dict[str, Any]:
        """Runs complete STT -> Chatbot -> TTS pipeline."""
        return self.assistant.process_voice_query(audio_bytes, mime_type=mime_type, language=language)


__all__ = ["VoiceProcessor"]
