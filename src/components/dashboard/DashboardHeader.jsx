import React, { useState } from 'react';
import { Menu, MapPin, Calendar, Sparkles, Sprout, Compass, Globe, ChevronDown } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardHeader({
  user,
  onOpenMobileSidebar,
  onOpenAIAssistant,
  onNavigateLocation
}) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const localeMap = {
    kn: 'kn-IN',
    hi: 'hi-IN',
    en: 'en-IN'
  };

  const currentDate = new Date().toLocaleDateString(localeMap[language] || 'kn-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const farmerName = user?.name || (language === 'kn' ? 'ರಮೇಶ್ ಪಟೇಲ್' : language === 'hi' ? 'रमेश पटेल' : 'Ramesh Patel');
  const locationString = user?.village
    ? `${user.village}, ${user.district}, ${user.state}`
    : (language === 'kn' ? 'ನಿಫಾಡ್, ನಾಸಿಕ್, ಮಹಾರಾಷ್ಟ್ರ' : language === 'hi' ? 'निफाड़, नासिक, महाराष्ट्र' : 'Niphad, Nashik, Maharashtra');

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 px-4 sm:px-8 py-4">
      <div className="flex items-center justify-between gap-4">
        
        {/* Left: Hamburger & Welcome Message */}
        <div className="flex items-center gap-3">
          {/* Mobile hamburger menu */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition"
            aria-label="Open navigation"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('dashWelcome')}, {farmerName}! <span className="inline-block animate-wave">🌾</span>
              </h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                {t('dashActiveFarmer')}
              </span>
            </div>

            {/* Current Location Badge - Clickable to change location on Map */}
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-0.5">
              <button
                type="button"
                onClick={onNavigateLocation}
                title="Click to change farm location on Map"
                className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200/80 transition cursor-pointer group"
              >
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 group-hover:scale-110 transition-transform" />
                <span>{locationString}</span>
                <span className="text-[10px] text-emerald-500 underline ml-0.5">{t('dashChange')}</span>
              </button>

              <span className="hidden md:inline-flex items-center gap-1 text-slate-400">
                • <Calendar className="w-3 h-3 text-slate-400 ml-1" /> {currentDate}
              </span>

              <span className="hidden sm:inline-flex items-center gap-1 text-emerald-800 font-semibold bg-emerald-100/60 px-2 py-0.5 rounded text-[11px]">
                <Sprout className="w-3 h-3 text-emerald-600" /> {t('dashRabiSeason')}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-2.5">
          {/* Language Selector Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
              title="Change Language"
            >
              <Globe className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">
                {languages.find(l => l.code === language)?.name || 'Language'}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
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

          {/* Map Location shortcut button */}
          <button
            type="button"
            onClick={onNavigateLocation}
            className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 border border-slate-200 hover:border-emerald-300 font-bold text-xs transition"
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            <span>{t('dashFarmGps')}</span>
          </button>

          {/* Ask AI shortcut button */}
          <button
            type="button"
            onClick={onOpenAIAssistant}
            className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
            <span>{t('navAiAssistant')}</span>
          </button>

          {/* User profile avatar badge */}
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-black flex items-center justify-center text-sm shadow-sm shrink-0 border-2 border-emerald-100">
            {farmerName.charAt(0).toUpperCase()}
          </div>
        </div>

      </div>
    </header>
  );
}
