"""
AgriSmart AI - Gemini AI Pipeline Test Suite
Validates prompt engineering, multilingual routing (Kannada, Hindi, Tamil, Telugu),
multi-turn context maintenance, chemical safety verification, and clinical plant health reports.
"""

from modules.chatbot.chatbot import AgriChatbot
from modules.chatbot.languages import SUPPORTED_LANGUAGES, normalize_language, get_language_instructions
from modules.farm_doctor.doctor import FarmDoctor
from modules.voice_assistant.voice_processor import VoiceProcessor


def test_multilingual_routing():
    print("=" * 65)
    print("🌐 1. Testing Multilingual Routing & Normalization")
    print("=" * 65)
    test_cases = [
        ("kn", "kannada", "ಕನ್ನಡ"),
        ("Kannada", "kannada", "ಕನ್ನಡ"),
        ("hi", "hindi", "हिन्दी"),
        ("Tamil", "tamil", "தமிழ்"),
        ("Telugu", "telugu", "తెలుగు"),
        ("en", "english", "English"),
        ("unknown_dialect", "english", "English")  # Fallback to English
    ]
    for raw_input, expected_key, expected_native in test_cases:
        norm = normalize_language(raw_input)
        assert norm == expected_key, f"Failed for {raw_input}: expected {expected_key}, got {norm}"
        instr = get_language_instructions(norm)
        assert len(instr) > 10
        print(f"  ✅ Language input '{raw_input}' correctly resolved to '{norm}' ({expected_native})")
    print("All multilingual routing tests PASSED!\n")


def test_chatbot_pipeline():
    print("=" * 65)
    print("🌾 2. Testing AI Farming Chatbot Pipeline & Safety")
    print("=" * 65)
    chatbot = AgriChatbot()

    # Turn 1 in Kannada
    res1 = chatbot.ask(
        question="ಟೊಮೆಟೊ ಗಿಡಗಳಿಗೆ ಯಾವ ರಸಗೊಬ್ಬರ ಹಾಕಬೇಕು?",
        language="kannada"
    )
    assert res1["status"] == "success"
    assert res1["language"]["canonical"] == "kannada"
    assert res1["language"]["native_name"] == "ಕನ್ನಡ"
    assert len(res1["reply"]) > 50
    assert "conversation_history" in res1
    print(f"  ✅ Kannada Turn 1 Answered ({res1['language']['native_name']}):")
    print(f"     Preview: {res1['reply'][:85]}...")

    # Multi-turn Context Test (Turn 2)
    res2 = chatbot.ask(
        question="ಎಲೆಗಳು ಮುದುರಿಕೊಳ್ಳುತ್ತಿವೆ ಮತ್ತು ಬಿಳಿ ನೊಣಗಳಿವೆ, ಏನು ಮಾಡಬೇಕು?",
        language="kannada",
        conversation_history=res1["conversation_history"]
    )
    assert res2["status"] == "success"
    assert res2["conversation_turns"] == 2
    assert res2["chemical_safety_verified"] is True
    print(f"  ✅ Context maintained across 2 turns (Turns: {res2['conversation_turns']})")
    print(f"  ✅ Chemical safety verification: {res2['chemical_safety_verified']}")
    print("Chatbot Pipeline Test PASSED!\n")


def test_farm_doctor_pipeline():
    print("=" * 65)
    print("🩺 3. Testing AI Farm Doctor Clinical Plant Health Diagnosis")
    print("=" * 65)
    doctor = FarmDoctor()

    res = doctor.diagnose(
        symptoms="Circular brown leaf spots with concentric target-board rings on lower tomato foliage",
        crop_name="Tomato",
        language="english"
    )
    assert res["status"] == "success"
    assert res["crop"] == "Tomato"
    report = res["diagnosis_report"]
    assert "DIAGNOSIS" in report or "ರೋಗ ನಿರ್ಣಯ" in report
    assert "SEVERITY" in report or "ತೀವ್ರತೆ" in report
    assert "FIRST AID" in report or "ಪ್ರಥಮ ಚಿಕಿತ್ಸೆ" in report
    assert "ORGANIC" in report or "ಜೈವಿಕ" in report
    assert "CHEMICAL" in report or "ರಾಸಾಯನಿಕ" in report
    print(f"  ✅ Farm Doctor generated structured 7-part prescription for {res['crop']}")
    print("Farm Doctor Pipeline Test PASSED!\n")


def test_voice_processor_pipeline():
    print("=" * 65)
    print("🎙️ 4. Testing Voice Question Processor")
    print("=" * 65)
    voice = VoiceProcessor()

    dummy_audio = b"RIFF....WAVEfmt ...."
    res = voice.transcribe_audio(
        audio_bytes=dummy_audio,
        mime_type="audio/wav",
        language="kannada"
    )
    assert res["status"] == "success"
    assert res["detected_language"] == "kannada"
    assert len(res["transcription"]) > 0
    print(f"  ✅ Transcribed Audio ({res['language_name']}): '{res['transcription']}'")
    print("Voice Processor Pipeline Test PASSED!\n")


if __name__ == "__main__":
    test_multilingual_routing()
    test_chatbot_pipeline()
    test_farm_doctor_pipeline()
    test_voice_processor_pipeline()
    print("🎉 ALL GEMINI MULTILINGUAL PIPELINE TESTS PASSED SUCCESSFULLY!")
