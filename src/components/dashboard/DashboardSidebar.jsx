import React from 'react';
import {
  LayoutDashboard,
  Sprout,
  ScanLine,
  CloudSun,
  Bot,
  UserCheck,
  Settings,
  Home,
  LogOut,
  X,
  PhoneCall,
  ChevronRight,
  FileText,
  Calendar
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function DashboardSidebar({
  activeTab,
  onSelectTab,
  user,
  onLogout,
  onNavigateHome,
  isMobileOpen,
  onCloseMobile
}) {
  const { t, language } = useLanguage();

  const menuItems = [
    { id: 'dashboard', label: t('navDashboard'), icon: LayoutDashboard },
    { id: 'farming-records', label: t('navFarmingRecords') || 'Farming Records', icon: FileText, badge: 'IndexedDB' },
    { id: 'calendar', label: t('navCalendar') || 'Smart Calendar', icon: Calendar, badge: 'Alerts' },
    { id: 'crop-recommendation', label: t('navCropRecommendation'), icon: Sprout },
    { id: 'disease-detection', label: t('navDiseaseDetection'), icon: ScanLine },
    { id: 'weather', label: t('navWeather'), icon: CloudSun },
    { id: 'ai-assistant', label: t('navAiAssistant'), icon: Bot, badge: 'AI Live' },
    { id: 'farmer-profile', label: t('navFarmerProfile') || 'Farmer Profile', icon: UserCheck },
    { id: 'settings', label: t('navSettings'), icon: Settings },
  ];

  const defaultFarmerName = language === 'kn' ? 'ರಮೇಶ್ ಪಟೇಲ್' : language === 'hi' ? 'रमेश पटेल' : 'Ramesh Patel';
  const defaultVillage = language === 'kn' ? 'ನಿಫಾಡ್' : language === 'hi' ? 'निफाड़' : 'Niphad';
  const defaultDistrict = language === 'kn' ? 'ನಾಸಿಕ್' : language === 'hi' ? 'नासिक' : 'Nashik';

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-emerald-100 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:shadow-none'
        }`}
      >
        <div>
          {/* Logo / Header */}
          <div className="h-20 px-6 border-b border-emerald-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateHome}
              className="flex items-center gap-3 text-left group"
            >
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xl font-black text-slate-900 tracking-tight block">
                  {t('brandName')}
                </span>
                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                  {t('dashFarmerPortal')}
                </span>
              </div>
            </button>

            {/* Mobile close button */}
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100"
              aria-label="Close Sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Farmer Profile Chip */}
          <div className="p-4 mx-4 my-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-emerald-600 text-white font-extrabold flex items-center justify-center text-lg shrink-0 shadow-sm">
              {user?.name ? user.name.charAt(0).toUpperCase() : (language === 'kn' ? 'ರ' : language === 'hi' ? 'र' : 'R')}
            </div>
            <div className="overflow-hidden">
              <span className="font-bold text-sm text-slate-900 block truncate">
                {user?.name || defaultFarmerName}
              </span>
              <span className="text-[11px] text-emerald-700 font-medium block truncate">
                {user?.village || defaultVillage}, {user?.district || defaultDistrict}
              </span>
              <span className="text-[10px] text-slate-400 font-mono block">
                ID: {user?.farmerId || 'KM-2026-8842'}
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <nav className="px-4 py-2 space-y-1">
            <div className="px-3 pb-2 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              {t('dashNavMenu')}
            </div>
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    onCloseMobile();
                  }}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-md shadow-emerald-600/20'
                      : 'text-slate-700 hover:bg-emerald-50/80 hover:text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 shrink-0 ${
                        isActive ? 'text-white' : 'text-slate-500 group-hover:text-emerald-600'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge ? (
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : isActive ? (
                    <ChevronRight className="w-4 h-4 text-white/80" />
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer actions in sidebar */}
        <div className="p-4 border-t border-emerald-100 space-y-2">
          {/* Back to public home */}
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>{t('dashBackHome')}</span>
          </button>

          {/* Kisan Helpline */}
          <a
            href="tel:18001801551"
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 transition"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="text-left text-[11px] truncate">
              <span className="block font-bold">1800-180-1551</span>
              <span className="text-[10px] text-emerald-600">{t('dashHelpline')}</span>
            </div>
          </a>

          {/* Logout */}
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4 text-red-500" />
            <span>{t('navLogout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
