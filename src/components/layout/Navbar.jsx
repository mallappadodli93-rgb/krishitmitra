import React, { useState } from 'react';
import { Sprout, User, LogOut, Menu, X, Sparkles, LayoutDashboard, Globe, ChevronDown, CheckCircle, BookOpen, WifiOff, Wifi, FileText, Calendar, TrendingUp } from 'lucide-react';
import Button from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';
import { useOffline } from '../../context/OfflineContext';

export default function Navbar({
  user,
  onNavigateLogin,
  onNavigateRegister,
  onNavigateDashboard,
  onOpenProfile,
  onOpenFarmerProfilePage,
  onOpenRecords,
  onOpenCalendar,
  onLogout,
  onOpenCropRecommendation,
  onOpenDiseaseDetection,
  onOpenWeather,
  onOpenAIAssistant,
  onOpenMarketPrices,
  onNavigateHome
}) {
  const { language, changeLanguage, t, languages } = useLanguage();
  const { isOffline, isSimulatedOffline, toggleSimulatedOffline, openOfflineGuide } = useOffline();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  const handleNavClick = (target, action) => {
    setMobileMenuOpen(false);
    if (action) {
      action();
      return;
    }
    if (onNavigateHome) {
      onNavigateHome();
    }
    setTimeout(() => {
      const element = document.getElementById(target);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  const currentLangObj = languages.find(l => l.code === language) || languages[0];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* 1. KrishiMitra Logo */}
          <button
            type="button"
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 group text-left"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-emerald-700 transition">
                  {t('brandName')}
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                  {t('activeBeta')}
                </span>
              </div>
              <p className="text-[12px] font-medium text-slate-500">
                {t('brandTagline')}
              </p>
            </div>
          </button>

          {/* 2. Desktop Navigation Links (Translated) */}
          <nav className="hidden lg:flex items-center gap-5">
            <button
              onClick={() => handleNavClick('home')}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              {t('navHome')}
            </button>

            {/* Dashboard Link */}
            <button
              onClick={() => {
                if (onNavigateDashboard) onNavigateDashboard();
              }}
              className="text-sm font-bold text-emerald-800 hover:text-emerald-900 transition flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-xl border border-emerald-200"
            >
              <LayoutDashboard className="w-4 h-4 text-emerald-600" />
              <span>{t('navDashboard')}</span>
            </button>

            {/* Farming Records */}
            <button
              onClick={() => {
                if (onOpenRecords) onOpenRecords();
                else window.location.hash = 'farming-records';
              }}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t('navFarmingRecords')}</span>
            </button>

            {/* Smart Calendar */}
            <button
              onClick={() => {
                if (onOpenCalendar) onOpenCalendar();
                else window.location.hash = 'calendar';
              }}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t('navCalendar')}</span>
            </button>

            <button
              onClick={() => handleNavClick('features', onOpenCropRecommendation)}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              {t('navCropRecommendation')}
            </button>

            <button
              onClick={() => handleNavClick('weather', onOpenWeather)}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              {t('navWeather')}
            </button>

            <button
              onClick={() => handleNavClick('features', onOpenDiseaseDetection)}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition"
            >
              {t('navDiseaseDetection')}
            </button>

            <button
              onClick={() => handleNavClick('features', onOpenAIAssistant)}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>{t('navAiAssistant')}</span>
            </button>

            {/* Market Prices Link */}
            <button
              onClick={() => {
                if (onOpenMarketPrices) onOpenMarketPrices();
                else window.location.hash = 'market-prices';
              }}
              className="text-sm font-bold text-slate-700 hover:text-emerald-600 transition flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t('navMarketPrices') || 'Market Rates'}</span>
            </button>
          </nav>

          {/* 3. Offline Mode, Language Selector & Auth Actions */}
          <div className="hidden sm:flex items-center gap-3">
            
            {/* PWA / Offline Knowledge Guide Button */}
            <button
              type="button"
              onClick={openOfflineGuide}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                isOffline
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
              }`}
              title="View Cached Offline Agronomy Knowledge Guide"
            >
              {isOffline ? (
                <WifiOff className="w-3.5 h-3.5 text-amber-700" />
              ) : (
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>{isOffline ? 'Offline Mode' : 'Offline Guide'}</span>
            </button>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
                title="Change Language"
              >
                <Globe className="w-4 h-4 text-emerald-600" />
                <span>{currentLangObj.name}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    ಆಯ್ಕೆ / Select Language:
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

            {/* Auth Buttons */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  className="flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 py-1.5 px-3 rounded-2xl transition cursor-pointer"
                  title="View Profile Details"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left text-xs">
                    <span className="font-bold text-slate-800 block truncate max-w-[110px]">
                      {user.name}
                    </span>
                    <span className="text-[10px] text-emerald-700 font-medium flex items-center gap-0.5">
                      <CheckCircle className="w-3 h-3 text-emerald-600" /> {t('dashActiveFarmer')}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={onLogout}
                  title={t('navLogout')}
                  className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl border border-slate-200 transition"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onNavigateLogin}
                >
                  {t('navSignIn')}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  icon={User}
                  onClick={onNavigateRegister}
                  className="shadow-emerald-600/20 font-bold"
                >
                  {t('navRegister')}
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu & Language Toggle */}
          <div className="flex lg:hidden items-center gap-2">
            {/* Quick Mobile Language Switcher */}
            <select
              value={language}
              onChange={(e) => changeLanguage(e.target.value)}
              className="text-xs font-bold py-1.5 px-2 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl focus:outline-none"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-4 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <nav className="flex flex-col space-y-1">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('navHome')}
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onNavigateDashboard) onNavigateDashboard();
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-emerald-800 bg-emerald-50 flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-emerald-600" />
                <span>{t('navDashboard')}</span>
              </div>
              <span className="text-[10px] bg-emerald-200 px-2 py-0.5 rounded-full font-extrabold">Active</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenRecords) onOpenRecords();
                else window.location.hash = 'farming-records';
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>{t('navFarmingRecords')}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenCalendar) onOpenCalendar();
                else window.location.hash = 'calendar';
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <Calendar className="w-4 h-4 text-emerald-600" />
              <span>{t('navCalendar')}</span>
            </button>
            <button
              onClick={() => handleNavClick('features', onOpenCropRecommendation)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('navCropRecommendation')}
            </button>
            <button
              onClick={() => handleNavClick('weather', onOpenWeather)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('navWeather')}
            </button>
            <button
              onClick={() => handleNavClick('features', onOpenDiseaseDetection)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700"
            >
              {t('navDiseaseDetection')}
            </button>
            <button
              onClick={() => handleNavClick('features', onOpenAIAssistant)}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{t('navAiAssistant')}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenMarketPrices) onOpenMarketPrices();
                else window.location.hash = 'market-prices';
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 flex items-center gap-2"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>{t('navMarketPrices') || 'Market Rates'}</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                openOfflineGuide();
              }}
              className="text-left px-3 py-2.5 rounded-xl text-sm font-bold text-amber-900 bg-amber-50 hover:bg-amber-100 flex items-center justify-between border border-amber-200"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-700" />
                <span>Offline Agricultural Guide</span>
              </div>
              <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded-full font-bold">Cached</span>
            </button>
          </nav>

          <div className="pt-3 border-t border-slate-100">
            {user ? (
              <div className="space-y-2">
                <div className="p-3 bg-emerald-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{user.name}</span>
                    <span className="text-[11px] text-slate-500">{user.village}, {user.district}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onOpenProfile();
                    }}
                    className="text-xs font-bold text-emerald-700 bg-white px-2.5 py-1 rounded-lg border border-emerald-200"
                  >
                    {t('navProfile')}
                  </button>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-xs text-red-600 font-bold bg-red-50 hover:bg-red-100 rounded-xl transition"
                >
                  {t('navLogout')}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="md"
                  className="w-full justify-center"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateLogin();
                  }}
                >
                  {t('navSignIn')}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  icon={User}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onNavigateRegister();
                  }}
                >
                  {t('navRegister')}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
