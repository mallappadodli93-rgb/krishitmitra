"""
AgriSmart AI - Multilingual Voice Assistant Test Suite
Verifies:
1. Language Support & Locale Mapping for Kannada, English, Hindi, Telugu, and Tamil.
2. Speech-to-Text (STT) transcription and audio format decoding.
3. Text-to-Speech (TTS) PCM WAV synthesis and audio payloads.
4. End-to-End Voice query loop (Voice In -> Chatbot -> Text & Speech Audio Out).
5. Graceful speech recognition error handling (Silence, Empty, and Corrupted audio).
"""

from modules.voice_assistant.language_support import (
    normalize_language,
    get_bcp47_locale,
    get_tts_language_tag,
    get_language_metadata,
    get_recognition_error_message,
    SUPPORTED_VOICE_LANGUAGES
)
from modules.voice_assistant.voice_assistant import VoiceAssistant


def test_language_support_registry():
    print("=" * 65)
    print("🌐 1. Testing Voice Language Support & BCP-47 Registry")
    print("=" * 65)
    test_cases = [
        ("kn", "kannada", "kn-IN", "kn"),
        ("Kannada", "kannada", "kn-IN", "kn"),
        ("hi", "hindi", "hi-IN", "hi"),
        ("ta", "tamil", "ta-IN", "ta"),
        ("te", "telugu", "te-IN", "te"),
        ("en", "english", "en-IN", "en-in")
    ]

    for raw, canon, expected_locale, expected_tts in test_cases:
        norm = normalize_language(raw)
        assert norm == canon, f"Expected {canon}, got {norm}"
        locale = get_bcp47_locale(norm)
        assert locale == expected_locale, f"Expected locale {expected_locale}, got {locale}"
        tts = get_tts_language_tag(norm)
        assert tts == expected_tts, f"Expected TTS tag {expected_tts}, got {tts}"
        meta = get_language_metadata(norm)
        assert len(meta["error_messages"]) == 4
        print(f"  ✅ {norm.upper():<8} -> BCP-47: {locale:<7} | TTS Tag: {tts:<6} | Native: {meta['native_name']}")

    print("Language Support Registry tests PASSED!\n")


def test_error_message_localization():
    print("=" * 65)
    print("💬 2. Testing Localized Error Recovery Prompts")
    print("=" * 65)

    kn_silence = get_recognition_error_message("kannada", "silence")
    assert "ಧ್ವನಿ" in kn_silence
    print(f"  ✅ Kannada Silence Guidance: '{kn_silence}'")

    hi_silence = get_recognition_error_message("hindi", "silence")
    assert "आवाज" in hi_silence
    print(f"  ✅ Hindi Silence Guidance  : '{hi_silence}'")

    en_unintel = get_recognition_error_message("english", "unintelligible")
    assert "understand" in en_unintel
    print(f"  ✅ English Guidance        : '{en_unintel}'")

    print("Localized Error Message tests PASSED!\n")


def test_text_to_speech_synthesis():
    print("=" * 65)
    print("🔊 3. Testing Text-to-Speech (TTS) Engine")
    print("=" * 65)
    va = VoiceAssistant()

    # Test Kannada TTS
    tts_kn = va.text_to_speech("ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಎರೆಹುಳು ಗೊಬ್ಬರ ಹಾಕಿ", language="kannada")
    assert tts_kn["status"] == "success"
    assert tts_kn["audio_size_bytes"] > 1000
    assert len(tts_kn["audio_base64"]) > 500
    print(f"  ✅ Kannada TTS Generated: {tts_kn['audio_size_bytes']} bytes ({tts_kn['mime_type']})")

    # Test English TTS
    tts_en = va.text_to_speech("Irrigate the maize crop during flowering stage", language="english")
    assert tts_en["status"] == "success"
    assert tts_en["audio_size_bytes"] > 1000
    print(f"  ✅ English TTS Generated: {tts_en['audio_size_bytes']} bytes ({tts_en['mime_type']})")

    print("Text-to-Speech tests PASSED!\n")


def test_end_to_end_voice_query():
    print("=" * 65)
    print("🎙️ 4. Testing End-to-End Voice Advisory Loop")
    print("=" * 65)
    va = VoiceAssistant()
    sample_wav = va._synthesize_wav_audio("Test farmer audio query")

    # Full Kannada voice roundtrip
    res = va.process_voice_query(
        audio_bytes=sample_wav,
        mime_type="audio/wav",
        language="kannada"
    )
    assert res["status"] == "success"
    assert res["language"]["canonical"] == "kannada"
    assert len(res["farmer_speech_transcription"]) > 0
    assert len(res["chatbot_text_response"]) > 0
    assert res["speech_audio_response"]["audio_size_bytes"] > 1000
    print(f"  ✅ Voice In -> Transcription: '{res['farmer_speech_transcription']}'")
    print(f"  ✅ Advisory Text Generated ({len(res['chatbot_text_response'])} chars)")
    print(f"  ✅ Spoken Audio Output ({res['speech_audio_response']['audio_size_bytes']} bytes)")

    print("End-to-End Voice Advisory Loop tests PASSED!\n")


def test_speech_error_handling():
    print("=" * 65)
    print("🛡️ 5. Testing Speech Recognition Error Handling")
    print("=" * 65)
    va = VoiceAssistant()

    # Empty audio rejection
    res_empty = va.process_voice_query(audio_bytes=b"", language="kannada")
    assert res_empty["status"] == "recognition_error"
    assert res_empty["error_code"] == "EMPTY_AUDIO_INPUT"
    assert "audio_response" in res_empty
    print(f"  ✅ Empty audio gracefully handled -> Spoken guidance: '{res_empty['error_message']}'")

    # Short silence audio rejection
    res_short = va.process_voice_query(audio_bytes=b"RIFF1234WAVE", language="english")
    assert res_short["status"] == "recognition_error"
    assert res_short["error_code"] == "AUDIO_TOO_SHORT_OR_SILENT"
    print(f"  ✅ Micro-audio silence handled -> Spoken guidance: '{res_short['error_message']}'")

    print("Speech Recognition Error Handling tests PASSED!\n")


if __name__ == "__main__":
    test_language_support_registry()
    test_error_message_localization()
    test_text_to_speech_synthesis()
    test_end_to_end_voice_query()
    test_speech_error_handling()
    print("🎉 ALL MULTILINGUAL VOICE ASSISTANT TESTS PASSED SUCCESSFULLY!")

