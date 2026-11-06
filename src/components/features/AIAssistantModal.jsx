import React, { useState } from 'react';
import { Bot, Send, Sparkles, User, HelpCircle, PhoneCall, Check } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { sendChatMessage } from '../../services/aiChatService';

const initialMessages = [
  {
    sender: 'bot',
    text: 'Namaste Kisan Bhai! 🙏 I am KrishiMitra AI, your 24/7 intelligent farming advisor. How can I assist you with your crops, soil, pests, or irrigation today?',
    time: 'Just now'
  }
];

const sampleQueries = [
  "Which crop is suitable for black soil?",
  "How to grow tomatoes?",
  "What causes yellow leaves?",
  "How to control pests in cotton?",
  "Which fertilizer is needed for rice?",
  "How much water does maize need?"
];

export default function AIAssistantModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState(initialMessages);
  const [inputVal, setInputVal] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (textToSend) => {
    const text = textToSend || inputVal.trim();
    if (!text || isTyping) return;

    const userMsg = {
      sender: 'user',
      text: text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInputVal('');
    setIsTyping(true);

    try {
      const botResponse = await sendChatMessage(text, updatedMessages);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: botResponse.text,
          time: botResponse.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'bot',
          text: 'An error occurred while generating advice. Please retry or contact the Kisan Helpline 1800-180-1551.',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsTyping(false);
    }
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
            {sampleQueries.map((q) => (
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
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed whitespace-pre-line shadow-xs ${
                  m.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-tl-none'
                }`}
              >
                <div className="font-sans">{m.text}</div>
                <div
                  className={`text-[9px] mt-1 text-right ${
                    m.sender === 'user' ? 'text-emerald-100' : 'text-slate-400'
                  }`}
                >
                  {m.time}
                </div>
              </div>
              {m.sender === 'user' && (
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex gap-2.5 items-center">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 text-xs shadow-sm">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl rounded-tl-none px-4 py-2.5 text-xs text-slate-500 flex items-center gap-1.5 shadow-xs">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                <span className="text-[11px] ml-1">KrishiMitra AI is thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input box */}
        <div className="pt-3 border-t border-slate-100 flex gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your farming question (e.g. fertilizer for rice)..."
            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Button
            variant="primary"
            size="sm"
            icon={Send}
            onClick={() => sendMessage()}
            disabled={!inputVal.trim() || isTyping}
          >
            Send
          </Button>
        </div>
      </div>
    </Modal>
  );
}
