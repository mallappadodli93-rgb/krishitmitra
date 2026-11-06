import React, { useState } from 'react';
import { X, PhoneCall } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function NotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { t } = useLanguage();

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-emerald-800 via-green-800 to-emerald-900 text-white text-xs sm:text-sm py-2 px-4 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <span className="flex h-2 w-2 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
          </span>
          <span className="bg-emerald-700/80 text-emerald-100 px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider shrink-0">
            {t('bannerAlertBadge')}
          </span>
          <span className="text-emerald-50 text-xs sm:text-sm truncate">
            {t('bannerAlertText')}
          </span>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <a
            href="tel:18001801551"
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-200 hover:text-white transition"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>{t('footerTollFree')}: 1800-180-1551</span>
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-emerald-300 hover:text-white p-1 rounded-md transition"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
