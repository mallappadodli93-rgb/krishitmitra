import React, { useState } from 'react';
import {
  X,
  BookOpen,
  Sprout,
  Lightbulb,
  ShieldAlert,
  PhoneCall,
  Trash2,
  BookmarkCheck,
  CheckCircle2,
  Droplets,
  Clock,
  Layers,
  Info,
  WifiOff
} from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineGuideModal() {
  const {
    isOfflineModalOpen,
    closeOfflineGuide,
    savedCrops,
    savedTips,
    savedDiseases,
    removeCropLocally,
    isOffline
  } = useOffline();

  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState('crops'); // 'crops' | 'tips' | 'diseases' | 'helpline'

  if (!isOfflineModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-3xl w-full border border-emerald-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 to-green-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300 border border-white/10">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black tracking-tight">
                  {language === 'kn'
                    ? 'ಆಫ್‌ಲೈನ್ ಕೃಷಿ ಜ್ಞಾನ ಮಾರ್ಗದರ್ಶಿ'
                    : language === 'hi'
                    ? 'ऑफलाइन कृषि ज्ञान मार्गदर्शिका'
                    : 'Offline Agricultural Knowledge Guide'}
                </h2>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-400 text-slate-900 px-2 py-0.5 rounded-full uppercase">
                  <WifiOff className="w-3 h-3" />
                  {isOffline ? 'Offline' : 'Offline Ready'}
                </span>
              </div>
              <p className="text-xs text-emerald-100 mt-0.5">
                {language === 'kn'
                  ? 'ಇಂಟರ್ನೆಟ್ ಇಲ್ಲದಿದ್ದರೂ ನಿಮ್ಮ ಜಮೀನಿನಲ್ಲಿ ಈ ಮಾಹಿತಿಯನ್ನು ವೀಕ್ಷಿಸಬಹುದು'
                  : language === 'hi'
                  ? 'इंटरनेट के बिना भी खेत में इस जानकारी को देख सकते हैं'
                  : 'Cached locally in browser storage for field access without internet'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeOfflineGuide}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 overflow-x-auto text-xs font-bold gap-2 py-2">
          <button
            type="button"
            onClick={() => setActiveTab('crops')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'crops'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>
              {language === 'kn' ? 'ಉಳಿಸಿದ ಬೆಳೆಗಳು' : language === 'hi' ? 'सहेजी गई फसलें' : 'Saved Crops'} ({savedCrops.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tips')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'tips'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>
              {language === 'kn' ? 'ಕೃಷಿ ಸಲಹೆಗಳು' : language === 'hi' ? 'कृषि सुझाव' : 'Farming Tips'} ({savedTips.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('diseases')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'diseases'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>
              {language === 'kn' ? 'ರೋಗ ಪರಿಹಾರಗಳು' : language === 'hi' ? 'रोग उपचार' : 'Disease Remedies'} ({savedDiseases.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('helpline')}
            className={`px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'helpline'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <PhoneCall className="w-4 h-4" />
            <span>
              {language === 'kn' ? 'ತುರ್ತು ಸಹಾಯವಾಣಿ' : language === 'hi' ? 'आपातकालीन हेल्पलाइन' : 'Kisan Helpline'}
            </span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          
          {/* TAB 1: Saved Crops */}
          {activeTab === 'crops' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>
                  {language === 'kn'
                    ? 'ಈ ಕೆಳಗಿನ ಬೆಳೆ ಮಾಹಿತಿಯನ್ನು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿ ಸಂಗ್ರಹಿಸಲಾಗಿದೆ:'
                    : language === 'hi'
                    ? 'निम्नलिखित फसल जानकारी ऑफलाइन उपलब्ध है:'
                    : 'The following crops are permanently cached for offline field guidance:'}
                </span>
                <span className="font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  {savedCrops.length} Cached
                </span>
              </div>

              {savedCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="bg-slate-50 hover:bg-emerald-50/30 p-4 rounded-2xl border border-slate-200 transition space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-extrabold text-slate-900">
                          {crop.name}
                        </span>
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {crop.category || 'Rabi Crop'}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {crop.season}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeCropLocally(crop.id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg transition"
                      title="Remove from offline cache"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Crop details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Soil Requirement</span>
                      <span className="font-semibold text-slate-700">{crop.soil}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Water Need</span>
                      <span className="font-semibold text-slate-700">{crop.water}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Growing Duration</span>
                      <span className="font-semibold text-slate-700">{crop.duration}</span>
                    </div>
                  </div>

                  {/* Tips list */}
                  {crop.tips && crop.tips.length > 0 && (
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <strong className="block text-emerald-900 text-[11px] uppercase tracking-wider">
                        Key Cultivation Tips:
                      </strong>
                      <ul className="list-disc list-inside space-y-0.5 text-emerald-800">
                        {crop.tips.map((t, idx) => (
                          <li key={idx}>{t}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: Farming Tips */}
          {activeTab === 'tips' && (
            <div className="space-y-3">
              {savedTips.map((tip) => (
                <div
                  key={tip.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                        {tip.category}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                      {tip.urgency}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900">
                    {tip.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {tip.description}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Disease Remedies */}
          {activeTab === 'diseases' && (
            <div className="space-y-4">
              {savedDiseases.map((d) => (
                <div
                  key={d.id}
                  className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-900">
                      {d.disease}
                    </h3>
                    <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                      {d.crop}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 bg-white p-2.5 rounded-xl border border-slate-200">
                    <strong className="text-slate-800 block mb-0.5">Observed Symptoms:</strong>
                    <span>{d.symptoms}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-green-50 p-3 rounded-xl border border-green-200 text-green-900">
                      <strong className="block text-green-950 font-bold mb-0.5">Organic Treatment:</strong>
                      <span>{d.organicRemedy}</span>
                    </div>
                    <div className="bg-blue-50 p-3 rounded-xl border border-blue-200 text-blue-900">
                      <strong className="block text-blue-950 font-bold mb-0.5">Chemical Treatment:</strong>
                      <span>{d.chemicalRemedy}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: Emergency Helpline */}
          {activeTab === 'helpline' && (
            <div className="space-y-4">
              <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-200 text-emerald-950 space-y-2">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 block">
                  Telephonic Assistance (No Internet Needed)
                </span>
                <h3 className="text-lg font-black text-emerald-900">
                  National Kisan Call Center: 1800-180-1551
                </h3>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  Call free of cost from any mobile or landline across India. Agricultural scientists are available 6:00 AM to 10:00 PM in 22 regional languages including Kannada, Hindi, and English.
                </p>
                <div className="pt-2">
                  <a
                    href="tel:18001801551"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition"
                  >
                    <PhoneCall className="w-4 h-4" />
                    <span>Call 1800-180-1551 (Toll-Free)</span>
                  </a>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 space-y-1.5">
                <strong className="text-slate-800 block font-bold">SMS Weather Advisory (mKisan Portal):</strong>
                <p>
                  Farmers registered under PM-KISAN automatically receive crucial weather & pest alerts via standard SMS without requiring data or internet connection.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer with Honest Disclaimers */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
            <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              Offline Mode provides cached guides. Live weather, camera vision AI and chatbot APIs require internet.
            </span>
          </div>

          <button
            type="button"
            onClick={closeOfflineGuide}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition shrink-0"
          >
            Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}

