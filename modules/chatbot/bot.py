"""
AgriSmart AI - Farming Chatbot (Gemini API)
Wrapper exposing AgriChatbot and ChatSession from chatbot.py.
Maintains full backwards compatibility with FastAPI routes and existing test suites.
"""

from modules.chatbot.chatbot import (
    AgriChatbot,
    ChatSession,
    get_agri_chatbot,
    SYSTEM_INSTRUCTION_TEMPLATE
)

__all__ = [
    "AgriChatbot",
    "ChatSession",
    "get_agri_chatbot",
    "SYSTEM_INSTRUCTION_TEMPLATE"
]
