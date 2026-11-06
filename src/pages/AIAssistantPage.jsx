import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Radio,
  AlertCircle,
  Globe,
  ChevronDown,
  Paperclip,
  Image as ImageIcon,
  X,
  MessageSquare,
  Plus,
  History,
  Clock,
  Compass,
  MapPin
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { sendChatMessage, detectLanguageFromText } from '../services/aiChatService';
import { getActiveUser } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import {
  fetchChatSessions,
  saveChatSession,
  deleteChatSession,
  clearAllChatSessions,
  fetchFarmLocations
} from '../services/farmerDataService';

export default function AIAssistantPage({ onNavigateHome, onNavigateDashboard }) {
  const { language, changeLanguage, t, languages } = useLanguage();
  const { isOffline } = useOffline();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();
  const farmerName = activeUser?.name || 'Kisan';

  // 10 Key Practical Suggested Questions (Multilingual)
  const SUGGESTED_QUESTIONS = {
    kn: [
      'ಕರಿ ಮಣ್ಣಿಗೆ ಯಾವ ಬೆಳೆ ಸೂಕ್ತ?',
      'ಟೊಮೆಟೊ ಬೆಳೆಯುವುದು ಹೇಗೆ?',
      'ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಕಾರಣವೇನು?',
      'ಹತ್ತಿಯಲ್ಲಿ ಕೀಟ ನಿಯಂತ್ರಣ ಹೇಗೆ?',
      'ಭತ್ತಕ್ಕೆ ಯಾವ ಗೊಬ್ಬರ ಬೇಕು?',
      'ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಎಷ್ಟು ನೀರು ಬೇಕು?',
      'ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ?',
      'ಭಾರೀ ಮಳೆ ಬಂದಾಗ ಏನು ಮಾಡಬೇಕು?',
      'ಗಿಡದ ರೋಗಗಳನ್ನು ಗುರುತಿಸುವುದು ಹೇಗೆ?',
      'ಬೆಳೆ ಇಳುವರಿ ಹೆಚ್ಚಿಸುವುದು ಹೇಗೆ?'
    ],
    hi: [
      'काली मिट्टी के लिए कौन सी फसल उपयुक्त है?',
      'टमाटर की खेती कैसे करें?',
      'पत्तियां पीली पड़ने का क्या कारण है?',
      'कपास में कीट नियंत्रण कैसे करें?',
      'धान के लिए कौन सा उर्वरक चाहिए?',
      'मक्के को कितने पानी की आवश्यकता होती है?',
      'मिट्टी की उर्वरा शक्ति कैसे बढ़ाएं?',
      'भारी बारिश के दौरान क्या करें?',
      'पौधों के रोगों की पहचान कैसे करें?',
      'फसल की पैदावार कैसे बढ़ाएं?'
    ],
    en: [
      'Which crop is suitable for black soil?',
      'How to grow tomatoes?',
      'What causes yellow leaves?',
      'How to control pests in cotton?',
      'Which fertilizer is needed for rice?',
      'How much water does maize need?',
      'How can I improve soil fertility?',
      'What should I do during heavy rainfall?',
      'How can I identify plant disease?',
      'How do I increase crop production?'
    ]
  };

  const currentSuggested = SUGGESTED_QUESTIONS[language] || SUGGESTED_QUESTIONS.en;

  const getInitialMessage = useCallback(() => [
    {
      id: 1,
      sender: 'bot',
      text: t('chatInitialGreeting') || 'Namaste Kisan! 🙏 I am KrishiMitra AI, your 24/7 intelligent farming assistant. Ask me about crops, soil, pests, fertilizers, weather precautions, or upload a leaf photo!',
      timestamp: 'Just now'
    }
  ], [t]);

  // Active Session & Message State
  const [currentSessionId, setCurrentSessionId] = useState(() => `CHAT-${Date.now()}`);
  const [messages, setMessages] = useState(getInitialMessage);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [feedbackGiven, setFeedbackGiven] = useState({});

  // Image Upload State
  const [attachedImage, setAttachedImage] = useState(null);
  const fileInputRef = useRef(null);

  // Chat History Sidebar State
  const [chatSessions, setChatSessions] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Personalized Farm Profile Context
  const [savedFarm, setSavedFarm] = useState(null);

  // Voice Interaction States
  const [isListening, setIsListening] = useState(false);
  const [speechError, setSpeechError] = useState('');
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);

  // Check browser Web Speech API support
  const isSpeechRecognitionSupported =
    typeof window !== 'undefined' &&
    Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);

  const isSpeechSynthesisSupported =
    typeof window !== 'undefined' && Boolean(window.speechSynthesis);

  // DOM Refs
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const recognitionRef = useRef(null);

  // Speech language mapping
  const speechLangMap = {
    kn: 'kn-IN',
    hi: 'hi-IN',
    en: 'en-IN'
  };
  const currentSpeechLang = speechLangMap[language] || 'kn-IN';

  // Load Saved Farm Profile from IndexedDB / LocalStorage on Mount
  useEffect(() => {
    async function loadFarmContext() {
      try {
        const locations = await fetchFarmLocations();
        if (locations && locations.length > 0) {
          const primary = locations.find(l => l.isPrimary) || locations[0];
          setSavedFarm(primary);
        } else {
          const localStr = localStorage.getItem('krishimitra_farm_location');
          if (localStr) {
            setSavedFarm(JSON.parse(localStr));
          }
        }
      } catch (e) {
        console.warn('Could not load farm profile for chatbot context:', e);
      }
    }
    loadFarmContext();
  }, []);

  // Load Past Chat Sessions from IndexedDB on Mount
  const loadSessionsFromDB = useCallback(async () => {
    try {
      setIsLoadingHistory(true);
      const sessions = await fetchChatSessions();
      setChatSessions(sessions || []);
    } catch (e) {
      console.warn('Could not load chat sessions:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  }, []);

  useEffect(() => {
    loadSessionsFromDB();
  }, [loadSessionsFromDB]);

  // Auto-scroll chat viewport to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Load speech synthesis voices
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

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (isSpeechSynthesisSupported) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
    };
  }, [isSpeechSynthesisSupported]);

  // Handle Speech Recognition (Microphone STT)
  const handleStartListening = () => {
    if (!isSpeechRecognitionSupported) {
      setSpeechError('Speech recognition is not supported on your browser.');
      return;
    }

    setSpeechError('');
    setIsListening(true);

    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = currentSpeechLang;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText((prev) => (prev ? `${prev} ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (event) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError('Microphone permission was denied. Please allow mic access in your browser settings.');
        } else if (event.error === 'no-speech') {
          setSpeechError('No speech was detected. Please try speaking closer to the microphone.');
        } else {
          setSpeechError(`Voice input error: ${event.error}`);
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
      setSpeechError('Could not start microphone. Check permissions.');
      setIsListening(false);
    }
  };

  const handleStopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    setIsListening(false);
  };

  const handleToggleVoiceInput = () => {
    if (isListening) handleStopListening();
    else handleStartListening();
  };

  // Handle Text-to-Speech (TTS) Read Aloud
  const handleToggleReadAloud = (msgId, textToRead) => {
    if (!isSpeechSynthesisSupported) {
      alert('Text-to-speech is not supported by your browser.');
      return;
    }

    if (speakingMessageId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMessageId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean text for natural speech
    const cleanText = textToRead
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/[*#_`~]/g, '')
      .replace(/[•\-\t]/g, ' ')
      .replace(/🙏|🌱|🛡️|💧|🧪|🌾|🌦️|🏛️|📊|💡|🍅|☁️|🌽|🍂|🌧️|🔍|📈/g, '')
      .replace(/\n+/g, '. ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = currentSpeechLang;
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    if (availableVoices.length > 0) {
      const langPrefix = currentSpeechLang.slice(0, 2).toLowerCase();
      const matched = availableVoices.find(v => {
        const vLang = v.lang.replace('_', '-').toLowerCase();
        return vLang.startsWith(currentSpeechLang.toLowerCase()) || vLang.startsWith(langPrefix);
      });
      if (matched) utterance.voice = matched;
    }

    utterance.onstart = () => setSpeakingMessageId(msgId);
    utterance.onend = () => setSpeakingMessageId(null);
    utterance.onerror = () => setSpeakingMessageId(null);

    window.speechSynthesis.speak(utterance);
  };

  // Handle Image Upload Selection
  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPG, PNG).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedImage({
        dataUrl: ev.target.result,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
  };

  // Primary Send Message Handler
  const handleSendMessage = async (textToSend) => {
    const query = typeof textToSend === 'string' ? textToSend.trim() : inputText.trim();
    if ((!query && !attachedImage) || isTyping) return;

    if (isListening) handleStopListening();
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);

    const detectedLang = detectLanguageFromText(query);
    const activeLang = detectedLang || language;

    // 1. Construct Farmer Message Object
    const farmerMessage = {
      id: Date.now(),
      sender: 'farmer',
      text: query || 'Analyze attached crop leaf image',
      image: attachedImage?.dataUrl || null,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, farmerMessage];
    setMessages(updatedMessages);
    setInputText('');
    setAttachedImage(null);
    setIsTyping(true);
    setSpeechError('');

    try {
      // 2. Query AI Chatbot Service with Full Memory and Farm Context
      const extraContext = {
        farmProfile: savedFarm,
        savedLocationName: savedFarm?.name || savedFarm?.village,
        savedSoil: savedFarm?.soilType || savedFarm?.soil,
        attachedImage: farmerMessage.image
      };

      const botReply = await sendChatMessage(query || 'Crop leaf analysis', updatedMessages, activeLang, extraContext);

      const botMessage = {
        id: Date.now() + 1,
        sender: 'bot',
        text: botReply.text,
        timestamp: botReply.timestamp
      };

      const finalMessages = [...updatedMessages, botMessage];
      setMessages(finalMessages);

      // 3. Persist Full Session to IndexedDB
      const firstUserMsg = finalMessages.find(m => m.sender === 'farmer')?.text || 'Farming Consultation';
      const sessionTitle = firstUserMsg.slice(0, 42);

      await saveChatSession({
        id: currentSessionId,
        title: sessionTitle,
        language: activeLang,
        messages: finalMessages,
        updatedAt: new Date().toISOString()
      });

      await loadSessionsFromDB();
    } catch (err) {
      console.error('Error generating AI answer:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'bot',
          text: 'An error occurred while generating agricultural advice. Please retry or contact the Kisan Call Center toll-free at 1800-180-1551.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  // Start New Chat Session
  const handleNewChat = () => {
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    if (isListening) handleStopListening();

    const newId = `CHAT-${Date.now()}`;
    setCurrentSessionId(newId);
    setMessages(getInitialMessage());
    setInputText('');
    setAttachedImage(null);
    setIsTyping(false);
    setSpeechError('');
    setFeedbackGiven({});
    setIsSidebarOpen(false);
  };

  // Clear Active Conversation
  const handleClearChat = () => {
    if (!window.confirm('Clear all messages in this conversation?')) return;
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    if (isListening) handleStopListening();
    setMessages(getInitialMessage());
    setInputText('');
    setAttachedImage(null);
    setIsTyping(false);
    setSpeechError('');
    setFeedbackGiven({});
  };

  // Reopen an archived chat session from IndexedDB
  const handleSelectSession = (session) => {
    if (isSpeechSynthesisSupported) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    if (isListening) handleStopListening();

    setCurrentSessionId(session.id);
    setMessages(session.messages || getInitialMessage());
    if (session.language) changeLanguage(session.language);
    setIsSidebarOpen(false);
  };

  // Delete a chat session from IndexedDB
  const handleDeleteSession = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await deleteChatSession(id);
      await loadSessionsFromDB();
      if (currentSessionId === id) {
        handleNewChat();
      }
    } catch (err) {
      console.error('Failed to delete chat session:', err);
    }
  };

  // Regenerate last bot answer
  const handleRegenerate = async () => {
    const lastFarmerMessage = [...messages].reverse().find(m => m.sender === 'farmer');
    if (!lastFarmerMessage) return;
    handleSendMessage(lastFarmerMessage.text);
  };

  // Copy bot response text
  const handleCopyText = (id, text) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Thumbs up / down feedback
  const handleFeedback = (msgId, isPositive) => {
    setFeedbackGiven(prev => ({ ...prev, [msgId]: isPositive ? 'up' : 'down' }));
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20 flex flex-col">
      
      {/* Hidden File Input for Image Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('weatherBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>

            {/* Toggle History Sidebar Button */}
            <button
              type="button"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition"
              title="Chat History"
            >
              <History className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline">History ({chatSessions.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* New Chat Button */}
            <button
              type="button"
              onClick={handleNewChat}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Chat</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.name || 'Language'}
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
          </div>
        </div>
      </header>

      {/* Main Chat Layout with Collapsible History Sidebar */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 flex-1 w-full grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* =========================================================================
            LEFT DRAWER: CHAT SESSIONS HISTORY (IndexedDB)
           ========================================================================= */}
        <aside className={`lg:col-span-4 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 space-y-4 ${
          isSidebarOpen ? 'block' : 'hidden lg:block'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-900">
                Conversation Memory
              </h3>
            </div>
            <button
              type="button"
              onClick={handleNewChat}
              className="p-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs font-bold flex items-center gap-1 transition"
              title="Start New Conversation"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New</span>
            </button>
          </div>

          {/* Personalized Farm Badge */}
          {savedFarm && (
            <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl text-[11px] text-emerald-950 space-y-1">
              <div className="flex items-center gap-1.5 font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                <span className="truncate">{savedFarm.name || savedFarm.village || 'Registered Farm'}</span>
              </div>
              <p className="text-[10px] text-emerald-800">
                {savedFarm.soilType || 'Black Soil'} • {savedFarm.district || 'Karnataka'}
              </p>
            </div>
          )}

          {/* Sessions List */}
          <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
            {isLoadingHistory ? (
              <div className="py-6 text-center text-xs text-slate-400 animate-pulse">
                Loading saved sessions...
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                No past conversations stored yet. Conversations are automatically archived in local IndexedDB.
              </div>
            ) : (
              chatSessions.map((session) => {
                const isSelected = session.id === currentSessionId;
                return (
                  <div
                    key={session.id}
                    onClick={() => handleSelectSession(session)}
                    className={`p-3 rounded-2xl border text-left transition cursor-pointer flex items-center justify-between gap-2 group ${
                      isSelected
                        ? 'bg-emerald-50 border-emerald-400 ring-1 ring-emerald-300'
                        : 'bg-white hover:bg-slate-50 border-slate-200'
                    }`}
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-0.5">
                        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{new Date(session.updatedAt || session.createdAt).toLocaleDateString()}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-800 truncate group-hover:text-emerald-700">
                        {session.title || 'Farming Consultation'}
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        {session.messages?.length || 0} messages
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleDeleteSession(session.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition shrink-0"
                      title="Delete Session"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </aside>

        {/* =========================================================================
            RIGHT MAIN: CHAT INTERFACE & CONVERSATION VIEWPORT
           ========================================================================= */}
        <main className="lg:col-span-8 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-[750px] overflow-hidden">
          
          {/* Chat Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900">
                    KrishiMitra AI Assistant
                  </h2>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
                <p className="text-[11px] text-slate-500">
                  Multilingual Agronomy Engine • Context-Aware Conversation Memory
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleClearChat}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Clear current messages"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Clickable Suggested Questions Scroll Bar */}
          <div className="px-4 py-2.5 bg-emerald-50/40 border-b border-emerald-100/60 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 shrink-0">
              💡 Suggestions:
            </span>
            {currentSuggested.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(q)}
                className="px-3 py-1 bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-emerald-200 rounded-full text-xs font-semibold whitespace-nowrap transition shadow-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Message Stream Viewport */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
            {messages.map((msg) => {
              const isBot = msg.sender === 'bot';
              return (
                <div
                  key={msg.id}
                  className={`flex items-start gap-3 ${isBot ? 'justify-start' : 'justify-end'}`}
                >
                  {isBot && (
                    <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  <div className={`max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 sm:p-5 shadow-sm space-y-2.5 ${
                    isBot
                      ? 'bg-slate-50 border border-slate-200 text-slate-800 rounded-tl-sm'
                      : 'bg-emerald-600 text-white rounded-tr-sm shadow-emerald-600/20'
                  }`}>
                    
                    {/* Attached Image inside Chat Bubble if present */}
                    {msg.image && (
                      <div className="rounded-2xl overflow-hidden border border-black/10 aspect-video max-h-48 bg-black/5">
                        <img
                          src={msg.image}
                          alt="Crop leaf"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    {/* Message Body */}
                    <div className={`text-xs sm:text-sm leading-relaxed whitespace-pre-line ${
                      isBot ? 'text-slate-800' : 'text-white'
                    }`}>
                      {msg.text}
                    </div>

                    {/* Message Footer: Timestamp & Action Controls */}
                    <div className={`flex items-center justify-between pt-2 border-t text-[10px] ${
                      isBot ? 'border-slate-200/60 text-slate-400' : 'border-white/20 text-emerald-100'
                    }`}>
                      <span>{msg.timestamp}</span>

                      {isBot && (
                        <div className="flex items-center gap-1.5">
                          {/* Read Aloud Button */}
                          <button
                            type="button"
                            onClick={() => handleToggleReadAloud(msg.id, msg.text)}
                            className="p-1 hover:text-emerald-700 hover:bg-slate-200/60 rounded transition"
                            title={speakingMessageId === msg.id ? 'Stop reading' : 'Read aloud'}
                          >
                            {speakingMessageId === msg.id ? (
                              <VolumeX className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                            ) : (
                              <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          {/* Copy Response Button */}
                          <button
                            type="button"
                            onClick={() => handleCopyText(msg.id, msg.text)}
                            className="p-1 hover:text-emerald-700 hover:bg-slate-200/60 rounded transition"
                            title="Copy response"
                          >
                            {copiedId === msg.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                            )}
                          </button>

                          {/* Thumbs Up / Down Feedback */}
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, true)}
                            className={`p-1 rounded transition ${
                              feedbackGiven[msg.id] === 'up' ? 'text-emerald-600 bg-emerald-100' : 'text-slate-400 hover:text-emerald-600'
                            }`}
                            title="Helpful"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleFeedback(msg.id, false)}
                            className={`p-1 rounded transition ${
                              feedbackGiven[msg.id] === 'down' ? 'text-rose-600 bg-rose-100' : 'text-slate-400 hover:text-rose-600'
                            }`}
                            title="Not helpful"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                  {!isBot && (
                    <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Typing Animation Indicator */}
            {isTyping && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-1 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-slate-50 border border-slate-200 rounded-3xl p-4 shadow-sm flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="text-xs text-slate-500 font-semibold ml-2">Consulting agronomic knowledge base...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Active Image Attachment Preview Chip */}
          {attachedImage && (
            <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-emerald-950 font-bold">
                <img
                  src={attachedImage.dataUrl}
                  alt="Preview"
                  className="w-8 h-8 rounded-lg object-cover border border-emerald-300"
                />
                <span className="truncate max-w-xs">{attachedImage.name} attached</span>
              </div>
              <button
                type="button"
                onClick={() => setAttachedImage(null)}
                className="p-1 text-slate-400 hover:text-red-600 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Speech Error Banner */}
          {speechError && (
            <div className="px-4 py-2 bg-amber-50 border-t border-amber-200 text-xs text-amber-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => setSpeechError('')}
                className="text-amber-700 font-bold"
              >
                ✕
              </button>
            </div>
          )}

          {/* Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white">
            <div className="flex items-center gap-2">
              
              {/* Photo Upload Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-2xl bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border border-slate-200 transition"
                title="Attach crop leaf photograph"
              >
                <ImageIcon className="w-5 h-5" />
              </button>

              {/* Microphone Voice Input Button */}
              <button
                type="button"
                onClick={handleToggleVoiceInput}
                className={`p-2.5 rounded-2xl border transition ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-600 animate-pulse ring-2 ring-rose-400'
                    : 'bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 border-slate-200'
                }`}
                title={isListening ? 'Stop listening' : 'Speak your question'}
              >
                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>

              {/* Text Input */}
              <input
                ref={inputRef}
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  language === 'kn'
                    ? 'ಬೆಳೆ, ಕೀಟ, ರೋಗ, ಗೊಬ್ಬರ ಅಥವಾ ನೀರಿನ ಬಗ್ಗೆ ಕೇಳಿ...'
                    : language === 'hi'
                    ? 'फसल, कीट, रोग, खाद या पानी के बारे में पूछें...'
                    : 'Ask about crops, pests, fertilizers, soil, or irrigation...'
                }
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />

              {/* Send Button */}
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={(!inputText.trim() && !attachedImage) || isTyping}
                className="p-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition disabled:opacity-50"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>

        </main>
      </div>

    </div>
  );
}
