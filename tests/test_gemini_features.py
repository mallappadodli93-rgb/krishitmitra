"""
AgriSmart AI - Gemini AI Features Test Script
Tests the AI Farming Chatbot (Multilingual) and AI Farm Doctor modules using Google Gemini API.
"""

import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from modules.chatbot.bot import AgriChatbot
from modules.farm_doctor.doctor import FarmDoctor


def run_gemini_tests():
    api_key = os.getenv("GEMINI_API_KEY")
    if not api_key or api_key == "your_gemini_api_key_here":
        print("\n❌ GEMINI_API_KEY is not configured in your .env file!")
        print("👉 Please open the '.env' file in your project folder and set:")
        print("   GEMINI_API_KEY=AIzaSy...your_actual_key_here")
        print("   (Get a free API key at: https://aistudio.google.com/)\n")
        return False

    print("==================================================")
    print("🌾 1. Testing AI Farming Chatbot (Kannada)")
    print("==================================================")
    chatbot = AgriChatbot()
    kannada_query = "ಟೊಮೆಟೊ ಗಿಡಗಳಿಗೆ ಯಾವ ರೀತಿಯ ಸಾವಯವ ಗೊಬ್ಬರ ಉತ್ತಮ ಮತ್ತು ಎಷ್ಟು ಪ್ರಮಾಣದಲ್ಲಿ ಹಾಕಬೇಕು?"
    print(f"Farmer Query (Kannada): {kannada_query}")
    
    try:
        chat_res = chatbot.ask(question=kannada_query, language="kannada")
        print("\n🤖 AI Chatbot Reply (Kannada):")
        print(chat_res["reply"])
        print(f"\nLanguage: {chat_res['language_name']} | Model: {chat_res['model_used']}")
        print("✅ Kannada Chatbot Test PASSED!\n")
    except Exception as e:
        print(f"❌ Chatbot test failed: {str(e)}\n")
        return False

    print("==================================================")
    print("🌾 2. Testing AI Farming Chatbot (Hindi)")
    print("==================================================")
    hindi_query = "धान की फसल में कीट नियंत्रण के लिए क्या उपाय करें?"
    print(f"Farmer Query (Hindi): {hindi_query}")
    try:
        chat_res_hi = chatbot.ask(question=hindi_query, language="hindi")
        print("\n🤖 AI Chatbot Reply (Hindi):")
        print(chat_res_hi["reply"])
        print("✅ Hindi Chatbot Test PASSED!\n")
    except Exception as e:
        print(f"❌ Hindi Chatbot test failed: {str(e)}\n")
        return False

    print("==================================================")
    print("🩺 3. Testing AI Farm Doctor Clinical Diagnosis")
    print("==================================================")
    doctor = FarmDoctor()
    symptoms = (
        "Leaves have brown concentric rings with yellow halos. Lower leaves are drying out and curling. "
        "The weather has been warm and humid with morning dew."
    )
    print(f"Crop: Tomato | Symptoms: {symptoms}")
    
    try:
        doctor_res = doctor.diagnose(
            crop_name="Tomato",
            symptoms=symptoms,
            language="kannada"
        )
        print("\n🩺 Farm Doctor Clinical Diagnosis (Kannada):")
        print(doctor_res["diagnosis_report"])
        print("✅ Farm Doctor Test PASSED!\n")
    except Exception as e:
        print(f"❌ Farm Doctor test failed: {str(e)}\n")
        return False

    print("🎉 ALL GEMINI AI FEATURES TESTED AND PASSED SUCCESSFULLY!\n")
    return True


if __name__ == "__main__":
    run_gemini_tests()

