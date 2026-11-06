import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, PhoneCall, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

const initialMessages = [
  {
    sender: 'bot',
    text: 'Namaste Kisan Bhai! 🙏 I am KrishiMitra AI, your 24/7 smart farming advisor. How can I assist you with your crops, soil, or weather today?',
    time: 'Just now'
  }
];

const sampleQA = {
  "How to control yellow rust on wheat?": "Yellow rust appears as orange-yellow stripe pustules on wheat leaves. If detected early, spray Propiconazole 25% EC (Tilt) @ 1 ml per litre of water immediately. Avoid applying high doses of nitrogen fertilizer until rust is curbed.",
  "When is the best time to irrigate gram / chana?": "Gram requires 2-3 irrigations only. The most critical stages are: (1) Pre-flowering stage (at 40-45 days after sowing), and (2) Pod development stage. Avoid irrigating during active flowering as it causes flower drop.",
  "How to apply for PM-KISAN subsidy?": "Under PM-KISAN, eligible farmers receive ₹6,000 annually in 3 equal installments of ₹2,000. You need your Aadhaar card, land records (Khasra/Khatauni), and active bank account linked to Aadhaar. You can apply on pmkisan.gov.in or through your nearest CSC center.",
  "Which fertilizer is best for tomato flowering?": "During tomato flowering, reduce excess nitrogen and apply 19:19:19 NPK foliar spray @ 5g/L. Also spray Calcium Nitrate @ 2g/L + Boron 20% @ 1g/L to prevent blossom end rot and promote heavy fruit setting."
};

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text) return;

    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputVal('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = sampleQA[text] ||
        `Thank you for asking! For "${text}", our agronomy engine recommends inspecting soil moisture first. Also consider consulting your local Krishi Vigyan Kendra (KVK) or calling the toll-free Kisan Helpline 1800-180-1551 for personalized guidance.`;

      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botReply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="KrishiMitra – AI Farming Assistant"
      maxWidth="max-w-2xl"
    >
      <div className="flex flex-col h-[480px]">
        {/* Quick prompt suggestions */}
        <div className="pb-3 border-b border-slate-100">
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Popular Farmer Inquiries (Click to Ask)</span>
          </p>
          <div className="flex flex-wrap gap-1.5">
            {Object.keys(sampleQA).map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => sendMessage(q)}
                className="text-[11px] text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 hover:border-emerald-200 border border-slate-200 px-2.5 py-1 rounded-lg transition text-left"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat message history */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`flex gap-2.5 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-br-none'
                    : 'bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200/80'
                }`}
              >
                <p>{m.text}</p>
                <span
                  className={`text-[10px] block mt-1 ${
                    m.sender === 'user' ? 'text-emerald-200 text-right' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </span>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 text-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center text-xs text-slate-500 italic">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="bg-slate-100 px-3 py-2 rounded-2xl border border-slate-200 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
          <input
            type="text"
            placeholder="Type your crop or farming question here (e.g. spray schedule)..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1 text-xs sm:text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            size="md"
            icon={Send}
            onClick={() => sendMessage()}
            disabled={!inputVal.trim()}
          >
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
}

