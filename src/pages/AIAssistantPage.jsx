import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  Trash2,
  ArrowLeft,
  Copy,
  Check,
  PhoneCall,
  Sprout,
  HelpCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  RotateCcw,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Radio,
  AlertCircle,
  WifiOff,
  Globe,
  ChevronDown
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { sendChatMessage } from '../services/aiChatService';
import { getActiveUser } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';

export default function AIAssistantPage({ onNavigateHome, onNavigateDashboard }) {
  const { language, changeLanguage, t, languages } = useLanguage();
  const { isOffline, openOfflineGuide } = useOffline();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();
  const farmerName = activeUser?.name || 'Kisan';

  // Dynamic suggested questions from current language
  const suggestedQuestions = t('chatQuestions') || [
    'Which crop should I grow?',
    'How to control plant diseases?',
    'When should I water my crops?',
    'Which fertilizer is suitable?',
    'What is the best season for growing rice?'
  ];

  const getInitialMessage = () => [
    {
      id: 1,
      sender: 'bot',
      text: t('chatInitialGreeting'),
      timestamp: 'Just now'
    }
  ];

  const [messages, setMessages] = useState(getInitialMessage);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [showUnsupportedModal, setShowUnsupportedModal] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Check browser Web Speech API support
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSpeechSynthesisSupported =
    typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  // DOM & Service Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Language mapping for Web Speech API
  const speechLangMap = {
    kn: 'kn-IN',
    hi: 'hi-IN',
    en: 'en-IN'
  };

  const currentSpeechLang = speechLangMap[language] || 'kn-IN';

  // Load available speech synthesis voices
  useEffect(() => {
    if (isSpeechSynthesisSupported) {
      const updateVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        setAvailableVoices(voices);
      };
      updateVoices();
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
  }, [isSpeechSynthesisSupported]);

  // Clean up speech recognition & text-to-speech on unmount
  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {
          console.error(e);
        }
      }
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Update initial message when language changes if only 1 message exists
  useEffect(() => {
    setMessages(prev => {
      if (prev.length <= 1) {
        return getInitialMessage();
      }
      return prev;
    });
  }, [language]);

  // Auto-scroll to bottom of chat when new message arrives
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, isListening]);

  // Focus input on initial mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Start voice recognition (Web Speech API)
  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported) {
      setShowUnsupportedModal(true);
      return;
    }

    // Stop active audio read-aloud before listening
    if (isSpeechSynthesisSupported) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
    }

    setSpeechError('');

    try {
      const SpeechRecognitionClass = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionClass();

      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = currentSpeechLang;

      recognition.onstart = () => {
        setIsListening(true);
        setSpeechError('');
      };

      recognition.onresult = (event) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        if (transcript) {
          setInputText(transcript);
        }
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error event:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(
            language === 'kn'
              ? 'ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ನಿರಾಕರಿಸಲಾಗಿದೆ. ಬ್ರೌಸರ್ ಸೆಟ್ಟಿಂಗ್‌ಗಳಲ್ಲಿ ಅನುಮತಿ ನೀಡಿ.'
              : language === 'hi'
              ? 'माइक्रोफ़ोन की अनुमति अस्वीकृत है। कृपया ब्राउज़र में अनुमति दें।'
              : 'Microphone permission was denied. Please allow microphone access in your browser.'
          );
        } else if (event.error === 'no-speech') {
          setSpeechError(
            language === 'kn'
              ? 'ಯಾವುದೇ ಧ್ವನಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೊಮ್ಮೆ ಸ್ಪಷ್ಟವಾಗಿ ಮಾತನಾಡಿ.'
              : language === 'hi'
              ? 'कोई आवाज नहीं मिली। कृपया माइक्रोफ़ोन के पास आकर दोबारा बोलें।'
              : 'No speech was detected. Please speak closer to your microphone.'
          );
        } else {
          setSpeechError(`Voice input: ${event.error}`);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to initialize SpeechRecognition:', err);
      setSpeechError('Could not start microphone. Please check your browser permissions.');
      setIsListening(false);
    }
  };

  // Stop voice recognition
  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        console.error(e);
      }
    }
    setIsListening(false);
  };

  // Toggle voice recognition
  const handleToggleVoiceInput = () => {
    if (isListening) {
      handleStopListening();
    } else {
      handleStartListening();
    }
  };

  // Text-to-Speech (TTS) Read Aloud Handler
  const handleToggleReadAloud = (msgId, textToRead) => {
    if (!isSpeechSynthesisSupported) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    // If currently speaking this message, cancel/pause
    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    // Cancel any existing speech
    window.speechSynthesis.cancel();

    // Clean text: strip markdown symbols (*, #, _, []), URLs, emojis for natural reading
    const cleanText = textToRead
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // link text
      .replace(/[*#_`~]/g, '')                 // markdown formatting
      .replace(/[•\-\t]/g, ' ')                // bullets
      .replace(/🙏|🌱|🛡️|💧|🧪|🌾|🌦️|🏛️|📊|💡/g, '') // icons
      .replace(/\n+/g, '. ')                   // newlines to pauses
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentSpeechLang;
    utterance.rate = 0.95; // Slightly measured pace for agricultural clarity
    utterance.pitch = 1.0;

    // Select suitable voice if available for language
    if (availableVoices.length > 0) {
      const langPrefix = currentSpeechLang.slice(0, 2).toLowerCase();
      const matchedVoice = availableVoices.find(v => {
        const vLang = v.lang.replace('_', '-').toLowerCase();
        return vLang.startsWith(currentSpeechLang.toLowerCase()) || vLang.startsWith(langPrefix);
      });
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }
    }

    utterance.onstart = () => {
      setSpeakingMessageId(msgId);
    };

    utterance.onend = () => {
      setSpeakingMessageId(null);
    };

    utterance.onerror = (e) => {
      console.warn('TTS speech error:', e);
      setSpeakingMessageId(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  // Send message handler
  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend.trim() : inputText.trim();
    if (!query || isTyping) return;

    // Stop listening or speaking when sending
    if (isListening) handleStopListening();
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    // 1. Add Farmer Message
    const farmerMessage = {
      id: Date.now(),
      sender: 'farmer',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, farmerMessage]);
    setInputText('');
    setIsTyping(true);
    setSpeechError('');

    try {
      // 2. Fetch Bot Response from Service in active language
      const botReply = await sendChatMessage(query, messages, language);

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply.text,
        timestamp: botReply.timestamp
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'An error occurred while generating advice. Please try again or call the Kisan Call Center at 1800-180-1551.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Clear Chat Button Handler
  const handleClearChat = () => {
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    if (isListening) handleStopListening();
    setMessages(getInitialMessage());
    setInputText('');
    setIsTyping(false);
    setSpeechError('');
    setFeedbackGiven({});
  };

  // Copy bot response text
  const handleCopyText = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleFeedback = (msgId, type) => {
    setFeedbackGiven(prev => ({ ...prev, [msgId]: type }));
  };

  // Format simple markdown for message bubbles
  const renderFormattedText = (text) => {
    return text.split('\n').map((line, idx) => {
      let formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      formattedLine = formattedLine.replace(/\*(.*?)\*/g, '<em>$1</em>');

      if (line.startsWith('- ') || line.startsWith('• ')) {
        return (
          <li
            key={idx}
            className="ml-4 list-disc text-slate-700"
            dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[-•]\s*/, '') }}
          />
        );
      }

      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      return (
        <p
          key={idx}
          className="leading-relaxed"
          dangerouslySetInnerHTML={{ __html: formattedLine }}
        />
      );
    });
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 flex flex-col">
      
      {/* 1. Top Navigation Bar */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('dashBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.name || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    ಆಯ್ಕೆ / Language:
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center justify-between ${
                        language === lang.code ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Active Voice Setting Badge */}
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 text-xs font-bold text-emerald-900">
              <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
              <span>
                {language === 'kn' ? 'ಧ್ವನಿ: ಕನ್ನಡ (kn-IN)' : language === 'hi' ? 'आवाज: हिन्दी (hi-IN)' : 'Voice: English (en-IN)'}
              </span>
            </div>

            {/* Online / Offline Indicator */}
            {isOffline ? (
              <div className="flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1.5 rounded-full border border-amber-300 font-bold text-xs">
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
                <span>{language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಮೋಡ್' : language === 'hi' ? 'ऑफलाइन मोड' : 'Offline Mode'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-extrabold text-emerald-900">
                  {t('chatStatusOnline')}
                </span>
              </div>
            )}

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition"
              title={t('chatClearBtn')}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col justify-between">
        
        {/* Offline Notice Disclaimer */}
        {isOffline && (
          <div className="mb-4 p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm animate-in fade-in">
            <div className="flex items-start sm:items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 sm:mt-0" />
              <span>
                <strong>{language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಗಮನಿಸಿ:' : language === 'hi' ? 'ऑफलाइन सूचना:' : 'Offline Notice:'}</strong>{' '}
                {language === 'kn'
                  ? 'ಲೈವ್ ಕ್ಲೌಡ್ AI ಮಾದರಿಗಳಿಗೆ ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯವಿದೆ. ಸ್ಥಳೀಯವಾಗಿ ಸಂಗ್ರಹಿಸಲಾದ ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ಮಾತ್ರ ಇಲ್ಲಿ ಒದಗಿಸಲಾಗಿದೆ.'
                  : language === 'hi'
                  ? 'लाइव क्लाउड AI मॉडल के लिए इंटरनेट आवश्यक है। यहां केवल स्थानीय रूप से सहेजी गई कृषि जानकारी प्रदर्शित होती है।'
                  : 'Live cloud AI models require an internet connection. Only pre-cached offline agricultural advice is shown.'}
              </span>
            </div>
            <button
              type="button"
              onClick={openOfflineGuide}
              className="px-3.5 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition shrink-0"
            >
              {language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಮಾರ್ಗದರ್ಶಿ' : language === 'hi' ? 'ऑफलाइन गाइड' : 'Open Offline Guide'}
            </button>
          </div>
        )}

        {/* Suggested Questions Bar */}
        <div className="mb-4 bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('chatSuggestedTitle')}</span>
            </span>
            <span className="text-[10px] text-slate-400">1-Tap Answers</span>
          </div>

          {/* 5 Required Suggested Question Chips */}
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question) => (
              <button
                key={question}
                type="button"
                disabled={isTyping}
                onClick={() => handleSendMessage(question)}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-700 border border-slate-200 hover:border-emerald-600 transition shadow-sm active:scale-95 text-left disabled:opacity-50"
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        {/* 3 & 4. Chat History Container (Message Bubbles) */}
        <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-6 overflow-y-auto max-h-[520px] min-h-[380px] space-y-4">
          
          {messages.map((msg) => {
            const isBot = msg.sender === 'bot';
            const isSpeakingThis = speakingMessageId === msg.id;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 animate-in fade-in duration-200 ${
                  isBot ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* Bot Avatar Icon */}
                {isBot && (
                  <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20 text-xs">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-3xl p-4 text-xs sm:text-sm space-y-2 shadow-sm ${
                    isBot
                      ? 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-sm'
                      : 'bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-tr-sm shadow-emerald-600/20'
                  }`}
                >
                  {/* Sender Label & Timestamp */}
                  <div className="flex items-center justify-between text-[11px] font-bold opacity-80 pb-1.5 border-b border-current/10">
                    <span className="flex items-center gap-1.5">
                      <span>{isBot ? t('brandName') + ' ' + t('navAiAssistant') : farmerName}</span>
                      {isSpeakingThis && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] animate-pulse">
                          <Volume2 className="w-3 h-3 text-emerald-600" />
                          <span>Speaking...</span>
                        </span>
                      )}
                    </span>
                    <span>{msg.timestamp}</span>
                  </div>

                  {/* Body Text */}
                  <div className="space-y-1">
                    {renderFormattedText(msg.text)}
                  </div>

                  {/* Bot Message Actions (Speaker Read Aloud, Copy & Feedback) */}
                  {isBot && (
                    <div className="pt-2.5 mt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                      
                      <div className="flex items-center gap-3">
                        {/* 4. Speaker Button to Read Chatbot Response Aloud */}
                        <button
                          type="button"
                          onClick={() => handleToggleReadAloud(msg.id, msg.text)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border transition font-semibold ${
                            isSpeakingThis
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                              : 'bg-white hover:bg-emerald-50 text-emerald-800 hover:text-emerald-900 border-emerald-200'
                          }`}
                          title={isSpeakingThis ? t('voiceStopReading') : t('voiceReadAloud')}
                        >
                          {isSpeakingThis ? (
                            <>
                              <VolumeX className="w-3.5 h-3.5 animate-pulse" />
                              <span>{t('voiceStopReading')}</span>
                            </>
                          ) : (
                            <>
                              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>{t('voiceReadAloud')}</span>
                            </>
                          )}
                        </button>

                        {/* Copy Advice */}
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="hover:text-emerald-700 flex items-center gap-1 transition"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Helpful Feedback */}
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-slate-400">Helpful?</span>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'up')}
                          className={`p-1 rounded hover:bg-slate-200 transition ${
                            feedbackGiven[msg.id] === 'up' ? 'text-emerald-600 font-bold' : ''
                          }`}
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleFeedback(msg.id, 'down')}
                          className={`p-1 rounded hover:bg-slate-200 transition ${
                            feedbackGiven[msg.id] === 'down' ? 'text-red-500' : ''
                          }`}
                        >
                          <ThumbsDown className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Farmer Avatar Icon */}
                {!isBot && (
                  <div className="w-9 h-9 rounded-2xl bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 font-bold text-xs shadow-sm">
                    <User className="w-5 h-5" />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex gap-3 items-center text-xs text-slate-500 animate-in fade-in">
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-md">
                <Bot className="w-5 h-5 animate-pulse" />
              </div>
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 flex items-center gap-2">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-2 h-2 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
                <span className="text-slate-600 font-medium italic pl-1">
                  {t('chatTyping')}
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* 6. Active Voice Recording Bar (Visible when microphone is listening) */}
        {isListening && (
          <div className="mt-3 p-3.5 bg-gradient-to-r from-red-50 via-rose-50 to-emerald-50 rounded-2xl border-2 border-red-400 shadow-md animate-in slide-in-from-bottom-2 duration-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Pulsing Recording Indicator */}
              <div className="w-9 h-9 rounded-xl bg-red-600 text-white flex items-center justify-center shadow-md animate-pulse">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-red-900 uppercase tracking-wide flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                    <span>{t('voiceListening')}</span>
                  </span>
                  <span className="text-[10px] bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded-full">
                    {currentSpeechLang}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-0.5 italic">
                  {inputText ? `"${inputText}"` : (language === 'kn' ? 'ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಮಾತನಾಡಿ...' : language === 'hi' ? 'अपना प्रश्न बोलें...' : 'Speak your farming question now...')}
                </p>
              </div>
            </div>

            {/* Audio Wave Visualizer Simulation */}
            <div className="flex items-center gap-1 h-5 px-3">
              <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.6s_ease-in-out_infinite] h-3"></span>
              <span className="w-1 bg-red-600 rounded-full animate-[pulse_0.4s_ease-in-out_infinite] h-5"></span>
              <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.8s_ease-in-out_infinite] h-4"></span>
              <span className="w-1 bg-red-600 rounded-full animate-[pulse_0.5s_ease-in-out_infinite] h-6"></span>
              <span className="w-1 bg-red-500 rounded-full animate-[pulse_0.7s_ease-in-out_infinite] h-3"></span>
            </div>

            {/* Stop Voice and Send Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleStopListening}
                className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Square className="w-3.5 h-3.5 fill-current" />
                <span>{t('voiceStop')}</span>
              </button>

              {inputText.trim() && (
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('chatSendBtn')}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Speech Error Banner */}
        {speechError && (
          <div className="mt-2 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-center justify-between gap-2 shadow-sm animate-in fade-in">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{speechError}</span>
            </div>
            <button
              type="button"
              onClick={() => setSpeechError('')}
              className="text-amber-700 hover:text-amber-900 font-bold text-xs underline"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* 7. Browser Not Supported Notice */}
        {showUnsupportedModal && (
          <div className="mt-2 p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-900 flex items-start justify-between gap-3 shadow-sm animate-in fade-in">
            <div className="flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">
                  {language === 'kn' ? 'ಧ್ವನಿ ಬೆಂಬಲದ ಮಾಹಿತಿ:' : language === 'hi' ? 'आवाज सहायता सूचना:' : 'Voice Support Information:'}
                </strong>
                <p className="text-blue-800 mt-0.5 leading-relaxed">
                  {t('voiceNotSupported')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowUnsupportedModal(false)}
              className="text-blue-600 hover:text-blue-900 font-bold text-xs px-2 py-1 rounded-lg hover:bg-blue-100 transition"
            >
              OK
            </button>
          </div>
        )}

        {/* 1 & 2. Chat Message Input Bar with Microphone Button */}
        <div className="mt-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* 1. Large Microphone Button for Voice Input */}
            <button
              type="button"
              onClick={handleToggleVoiceInput}
              className={`p-3 rounded-xl transition flex items-center justify-center shrink-0 shadow-sm active:scale-95 ${
                isListening
                  ? 'bg-red-600 text-white animate-pulse ring-4 ring-red-200'
                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300'
              }`}
              title={isListening ? t('voiceStop') : t('voiceStart')}
              aria-label="Voice input microphone"
            >
              {isListening ? (
                <MicOff className="w-5 h-5 animate-bounce" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </button>

            {/* 3. Text Input Displaying Recognized Speech */}
            <input
              ref={inputRef}
              type="text"
              placeholder={
                isListening
                  ? (language === 'kn' ? 'ಮಾತನಾಡಿ, ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ...' : language === 'hi' ? 'बोलें, आवाज सुनी जा रही है...' : 'Listening to your speech...')
                  : t('chatPlaceholder')
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isTyping}
              className={`flex-1 text-xs sm:text-sm px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 transition text-slate-800 placeholder-slate-400 disabled:opacity-60 ${
                isListening
                  ? 'border-red-400 bg-red-50/20 focus:ring-red-400 font-medium'
                  : 'border-slate-200 bg-slate-50 focus:ring-emerald-500 focus:bg-white'
              }`}
            />

            {/* Clear Chat Button */}
            <button
              type="button"
              onClick={handleClearChat}
              className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition"
              title={t('chatClearBtn')}
            >
              <RotateCcw className="w-5 h-5" />
            </button>

            {/* Send Button */}
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon={Send}
              disabled={!inputText.trim() || isTyping}
              className="px-5 py-3 font-bold shadow-emerald-600/25 shrink-0"
            >
              {t('chatSendBtn')}
            </Button>
          </form>

          {/* Architecture Ready Notice & Kisan Helpline */}
          <div className="pt-2.5 px-1 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-1">
            <span className="flex items-center gap-1.5">
              <span>🎤 Web Speech API Voice Enabled</span>
              <span>•</span>
              <span className="text-emerald-700 font-medium">Kannada, Hindi & English</span>
            </span>
            <span className="text-emerald-700 font-semibold flex items-center gap-1">
              <PhoneCall className="w-3 h-3 text-emerald-600" />
              <span>{t('footerTollFree')}: 1800-180-1551</span>
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
