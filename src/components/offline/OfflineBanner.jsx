import React from 'react';
import { WifiOff, Wifi, BookOpen, AlertTriangle, Info, X } from 'lucide-react';
import { useOffline } from '../../context/OfflineContext';
import { useLanguage } from '../../context/LanguageContext';

export default function OfflineBanner() {
  const { isOffline, isSimulatedOffline, toggleSimulatedOffline, openOfflineGuide } = useOffline();
  const { language } = useLanguage();

  if (!isOffline) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-700 to-amber-800 text-white px-4 py-2.5 text-xs shadow-md border-b border-amber-500 animate-in slide-in-from-top duration-300">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        
        {/* Left: Offline Status & Disclaimer */}
        <div className="flex items-center gap-2.5 text-center md:text-left">
          <div className="w-7 h-7 rounded-lg bg-amber-900/60 flex items-center justify-center shrink-0 border border-amber-400/40">
            <WifiOff className="w-4 h-4 text-amber-200 animate-pulse" />
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="font-black uppercase tracking-wider text-amber-100">
                {language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಮೋಡ್ ಸಕ್ರಿಯವಾಗಿದೆ' : language === 'hi' ? 'ऑफलाइन मोड सक्रिय है' : 'Offline Mode Active'}
              </span>
              {isSimulatedOffline && (
                <span className="text-[10px] bg-amber-950/80 text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  Test Simulation
                </span>
              )}
            </div>
            <p className="text-[11px] text-amber-100/90 leading-tight">
              {language === 'kn'
                ? 'ಇಂಟರ್ನೆಟ್ ಸಂಪರ್ಕವಿಲ್ಲದೆ ಉಳಿಸಿದ ಬೆಳೆ ಮಾಹಿತಿ ಮತ್ತು ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ವೀಕ್ಷಿಸಬಹುದು. ಲೈವ್ ಹವಾಮಾನ ಮತ್ತು ಎಐ ಕ್ಯಾಮೆರಾಗೆ ಇಂಟರ್ನೆಟ್ ಅಗತ್ಯವಿದೆ.'
                : language === 'hi'
                ? 'इंटरनेट के बिना सहेजी गई फसल जानकारी व कृषि सुझाव देख सकते हैं। लाइव मौसम और एआई कैमरे के लिए इंटरनेट आवश्यक है।'
                : 'Viewing saved crops & farming tips offline. Live weather radar, AI camera vision, and chatbot APIs require internet.'}
            </p>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={openOfflineGuide}
            className="px-3 py-1.5 rounded-xl bg-white text-amber-900 font-extrabold text-xs hover:bg-amber-50 transition shadow-sm flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-700" />
            <span>
              {language === 'kn' ? 'ಆಫ್‌ಲೈನ್ ಕೃಷಿ ಮಾರ್ಗದರ್ಶಿ' : language === 'hi' ? 'ऑफलाइन मार्गदर्शिका' : 'View Saved Guides'}
            </span>
          </button>

          {isSimulatedOffline ? (
            <button
              type="button"
              onClick={toggleSimulatedOffline}
              className="px-2.5 py-1.5 rounded-xl bg-amber-900/80 hover:bg-amber-900 text-amber-200 text-xs font-semibold border border-amber-500/50 transition flex items-center gap-1"
              title="Return to online mode"
            >
              <Wifi className="w-3.5 h-3.5 text-emerald-300" />
              <span>Go Online</span>
            </button>
          ) : null}
        </div>

      </div>
    </div>
  );
}

