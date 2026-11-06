"""
FastAPI Routes for Multilingual Voice Question Understanding & Speech Synthesis
"""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status
from typing import Dict, Any, Optional

from modules.voice_assistant.voice_assistant import VoiceAssistant, get_voice_assistant
from utils.logger import get_logger

logger = get_logger("VoiceRoutes")
router = APIRouter(prefix="/voice", tags=["7. Voice Question Understanding"])

# Initialize Voice Assistant singleton
voice_assistant = get_voice_assistant()


@router.post("/transcribe", summary="Transcribe Spoken Voice Question (STT)")
async def transcribe_voice(
    file: UploadFile = File(..., description="Farmer voice recording file (.wav, .mp3, .m4a)"),
    language_hint: Optional[str] = Form("kannada", description="Expected language: kannada, english, hindi, tamil, telugu")
) -> Dict[str, Any]:
    """
    Transcribes spoken farmer voice audio into written text in regional Indian languages.
    """
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/wav"

        result = voice_assistant.speech_to_text(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            language=language_hint or "kannada"
        )
        return {
            "success": result["status"] == "success",
            "filename": file.filename,
            "data": result
        }
    except Exception as e:
        logger.error(f"Voice transcription error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/ask-voice", summary="End-to-End Voice Advisory (Voice in -> Text & Speech Audio out)")
async def voice_to_advisory(
    file: UploadFile = File(..., description="Farmer voice question audio"),
    language: Optional[str] = Form("kannada", description="Language of question and answer")
) -> Dict[str, Any]:
    """
    Full end-to-end voice loop:
    1. Transcribes farmer's spoken audio question in their regional language.
    2. Answers the transcribed question using the AI Farming Chatbot.
    3. Synthesizes spoken audio response in the farmer's language.
    4. Returns both structured text and playable audio payload.
    """
    try:
        audio_bytes = await file.read()
        mime_type = file.content_type or "audio/wav"

        result = voice_assistant.process_voice_query(
            audio_bytes=audio_bytes,
            mime_type=mime_type,
            language=language or "kannada"
        )

        return {
            "success": result["status"] == "success",
            "data": result
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except Exception as e:
        logger.error(f"Voice to advisory pipeline error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/text-to-speech", summary="Convert Text to Speech Audio (TTS)")
def convert_text_to_speech(
    text: str = Form(..., description="Agricultural text to convert into speech"),
    language: Optional[str] = Form("kannada", description="Target language: kannada, english, hindi, tamil, telugu")
) -> Dict[str, Any]:
    """
    Converts agricultural advice into spoken audio in the selected regional language.
    """
    try:
        tts_result = voice_assistant.text_to_speech(text=text, language=language or "kannada")
        return {
            "success": True,
            "data": tts_result
        }
    except Exception as e:
        logger.error(f"Text-to-speech error: {str(e)}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))
