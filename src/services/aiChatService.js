/**
 * KrishiMitra Unified AI Chatbot Service Adapter
 * Connects React frontend directly to Google Gemini AI with Google Search Grounding.
 */

import {
  sendChatMessage as sendGeminiChatMessage,
  generateOfflineAgronomyAnswer
} from './geminiChatService.js';

export {
  sendGeminiChatMessage,
  generateOfflineAgronomyAnswer
};

// Helper to detect language script from text
export function detectLanguageFromText(text) {
  if (!text) return null;
  // Kannada Unicode block: \u0C80 - \u0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Devanagari / Hindi Unicode block: \u0900 - \u097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return null;
}

/**
 * Primary Chatbot API Gateway
 */
export async function sendChatMessage(userMessage, chatHistory = [], currentLanguage = 'en', extraContext = {}) {
  let lang = currentLanguage;
  if (!lang) {
    try {
      lang = localStorage.getItem('krishimitra_language') || 'en';
    } catch {
      lang = 'en';
    }
  }

  return await sendGeminiChatMessage(userMessage, chatHistory, lang, extraContext);
}
