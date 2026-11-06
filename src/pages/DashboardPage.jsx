import React, { useState } from 'react';
import DashboardSidebar from '../components/dashboard/DashboardSidebar';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardOverview from '../components/dashboard/DashboardOverview';
import DashboardSettingsTab from '../components/dashboard/DashboardSettingsTab';
import FarmerProfileModal from '../components/auth/FarmerProfileModal';
import SoilInfoModal from '../components/features/SoilInfoModal';

export default function DashboardPage({
  user,
  onLogout,
  onNavigateHome,
  onUpdateUser,
  onNavigateLocation,
  onNavigateRecords,
  onNavigateCalendar,
  onNavigateProfile
}) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals controlled from Dashboard
  const [isSoilInfoOpen, setIsSoilInfoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleSelectTab = (tabId) => {
    if (tabId === 'crop-recommendation') {
      window.location.hash = 'crop-recommendation';
    } else if (tabId === 'disease-detection') {
      window.location.hash = 'disease-detection';
    } else if (tabId === 'weather') {
      window.location.hash = 'weather';
    } else if (tabId === 'ai-assistant') {
      window.location.hash = 'ai-assistant';
    } else if (tabId === 'farming-records') {
      if (onNavigateRecords) onNavigateRecords();
      else window.location.hash = 'farming-records';
    } else if (tabId === 'calendar') {
      if (onNavigateCalendar) onNavigateCalendar();
      else window.location.hash = 'calendar';
    } else if (tabId === 'farmer-profile') {
      if (onNavigateProfile) onNavigateProfile();
      else window.location.hash = 'farmer-profile';
    } else if (tabId === 'profile') {
      setIsProfileOpen(true);
    } else {
      setActiveTab(tabId);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 flex">
      
      {/* 1. Sidebar with mobile drawer support */}
      <DashboardSidebar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        user={user}
        onLogout={onLogout}
        onNavigateHome={onNavigateHome}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 lg:pl-72 flex flex-col min-h-screen">
        
        {/* Sticky Dashboard Header */}
        <DashboardHeader
          user={user}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onOpenAIAssistant={() => {
            window.location.hash = 'ai-assistant';
          }}
          onNavigateLocation={() => {
            if (onNavigateLocation) onNavigateLocation();
            else window.location.hash = 'location-select';
          }}
        />

        {/* Dynamic Body Content */}
        <main className="flex-1 pb-16">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              user={user}
              onOpenCropRecommendation={() => {
                window.location.hash = 'crop-recommendation';
              }}
              onOpenDiseaseDetection={() => {
                window.location.hash = 'disease-detection';
              }}
              onOpenWeather={() => {
                window.location.hash = 'weather';
              }}
              onOpenSoilInfo={() => setIsSoilInfoOpen(true)}
              onOpenAIAssistant={() => {
                window.location.hash = 'ai-assistant';
              }}
              onOpenRecords={() => {
                if (onNavigateRecords) onNavigateRecords();
                else window.location.hash = 'farming-records';
              }}
              onOpenCalendar={() => {
                if (onNavigateCalendar) onNavigateCalendar();
                else window.location.hash = 'calendar';
              }}
              onOpenProfilePage={() => {
                if (onNavigateProfile) onNavigateProfile();
                else window.location.hash = 'farmer-profile';
              }}
            />
          )}

          {activeTab === 'settings' && (
            <DashboardSettingsTab
              user={user}
              onUpdateUser={onUpdateUser}
            />
          )}
        </main>

      </div>

      {/* --- Interactive Feature Modals --- */}
      
      {/* Soil Information & Fertilizer Calculator */}
      <SoilInfoModal
        isOpen={isSoilInfoOpen}
        onClose={() => setIsSoilInfoOpen(false)}
      />

      {/* Farmer Profile Modal */}
      <FarmerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={onLogout}
      />

    </div>
  );
}
