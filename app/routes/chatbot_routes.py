"""
FastAPI Routes for AI Farming Chatbot (Gemini API)
"""

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from modules.chatbot.bot import AgriChatbot
from modules.chatbot.languages import SUPPORTED_LANGUAGES
from utils.logger import get_logger

logger = get_logger("ChatbotRoutes")
router = APIRouter(prefix="/chatbot", tags=["5. AI Farming Chatbot"])

# Initialize chatbot instance
bot = AgriChatbot()


class ChatQueryRequest(BaseModel):
    """Pydantic schema for farmer chatbot queries."""
    question: str = Field(..., example="ಟೊಮೆಟೊ ಗಿಡಗಳಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ ಹಾಕಬೇಕು?", description="Farmer's question")
    language: Optional[str] = Field(
        "kannada",
        example="kannada",
        description="Target response language: 'kannada', 'english', 'hindi', 'tamil', 'telugu'"
    )


@router.get("/languages", summary="List Supported Regional Languages")
def list_languages() -> Dict[str, Any]:
    """Returns all supported regional languages for agricultural Q&A."""
    return {
        "supported_languages": [
            {
                "key": key,
                "name": data["native_name"],
                "code": data["code"],
                "description": data["description"]
            }
            for key, data in SUPPORTED_LANGUAGES.items()
        ]
    }


@router.get("/status", summary="Check Gemini Chatbot Status")
def check_status() -> Dict[str, Any]:
    """Returns Gemini API configuration status."""
    return {
        "module": "AI Farming Chatbot",
        "api_configured": bot.client_ready,
        "model_name": bot.model_name
    }


@router.post("/ask", summary="Ask Agricultural Question")
def ask_question(payload: ChatQueryRequest) -> Dict[str, Any]:
    """
    Submits a farming question and returns an agronomic advisory in the chosen language:
    Kannada, English, Hindi, Tamil, or Telugu.
    """
    try:
        response = bot.ask(
            question=payload.question,
            language=payload.language
        )
        return {
            "success": True,
            "data": response
        }
    except ValueError as ve:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(ve))
    except RuntimeError as re:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(re))

