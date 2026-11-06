import React, { useState, useEffect } from 'react';
import NotificationBanner from './components/layout/NotificationBanner';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import HeroSection from './components/home/HeroSection';
import QuickStats from './components/home/QuickStats';
import FeatureCards from './components/home/FeatureCards';
import WeatherWidget from './components/home/WeatherWidget';
import MarketPricesPreview from './components/home/MarketPricesPreview';
import CropAdvisoryPreview from './components/home/CropAdvisoryPreview';
import Testimonials from './components/home/Testimonials';
import CallToAction from './components/home/CallToAction';
import SoilInfoModal from './components/features/SoilInfoModal';
import FarmerProfileModal from './components/auth/FarmerProfileModal';
import OfflineBanner from './components/offline/OfflineBanner';
import OfflineGuideModal from './components/offline/OfflineGuideModal';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import DiseaseDetectionPage from './pages/DiseaseDetectionPage';
import LocationSelectionPage from './pages/LocationSelectionPage';
import WeatherPage from './pages/WeatherPage';
import CropRecommendationPage from './pages/CropRecommendationPage';
import AIAssistantPage from './pages/AIAssistantPage';
import FarmerProfilePage from './pages/FarmerProfilePage';
import MyFarmingRecordsPage from './pages/MyFarmingRecordsPage';
import FarmingCalendarPage from './pages/FarmingCalendarPage';
import MarketPricesPage from './pages/MarketPricesPage';
import { getActiveUser, setActiveUser, logoutFarmer, DEFAULT_DEMO_FARMER } from './utils/authStorage';
import { useOffline } from './context/OfflineContext';
import { Bot, ArrowUp, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation View: 'home' | 'dashboard' | 'crop-recommendation' | 'disease-detection' | 'location-select' | 'weather-info' | 'ai-assistant' | 'login' | 'register' | 'farmer-profile' | 'farming-records' | 'calendar'
  const [currentView, setCurrentView] = useState(() => {
    const hash = window.location.hash;
    if (hash === '#dashboard') return 'dashboard';
    if (hash === '#crop-recommendation') return 'crop-recommendation';
    if (hash === '#disease-detection') return 'disease-detection';
    if (hash === '#location-select') return 'location-select';
    if (hash === '#weather') return 'weather-info';
    if (hash === '#ai-assistant') return 'ai-assistant';
    if (hash === '#farmer-profile') return 'farmer-profile';
    if (hash === '#farming-records') return 'farming-records';
    if (hash === '#calendar') return 'calendar';
    if (hash === '#market-prices' || hash === '#mandi-rates') return 'market-prices';
    if (hash === '#login') return 'login';
    if (hash === '#register') return 'register';
    return 'home';
  });

  const { openOfflineGuide } = useOffline();

  // Active Logged-in Farmer State (from LocalStorage, or initialized with demo farmer if visited directly)
  const [user, setUser] = useState(() => getActiveUser());

  // Prefilled login identifier when coming from registration
  const [prefilledLoginId, setPrefilledLoginId] = useState('');

  // Modals Visibility
  const [isSoilInfoOpen, setIsSoilInfoOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Toast alert
  const [toastMessage, setToastMessage] = useState('');

  // Scroll to Top State
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Sync with browser hash changes
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash === '#dashboard') {
        setCurrentView('dashboard');
      } else if (hash === '#crop-recommendation') {
        setCurrentView('crop-recommendation');
      } else if (hash === '#disease-detection') {
        setCurrentView('disease-detection');
      } else if (hash === '#location-select') {
        setCurrentView('location-select');
      } else if (hash === '#weather') {
        setCurrentView('weather-info');
      } else if (hash === '#ai-assistant') {
        setCurrentView('ai-assistant');
      } else if (hash === '#farmer-profile') {
        setCurrentView('farmer-profile');
      } else if (hash === '#farming-records') {
        setCurrentView('farming-records');
      } else if (hash === '#calendar') {
        setCurrentView('calendar');
      } else if (hash === '#market-prices' || hash === '#mandi-rates') {
        setCurrentView('market-prices');
      } else if (hash === '#login') {
        setCurrentView('login');
      } else if (hash === '#register') {
        setCurrentView('register');
      } else if (hash === '#home' || !hash) {
        setCurrentView('home');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  const handleNavigate = (view) => {
    setCurrentView(view);
    const hash = view === 'home' ? '' : `#${view}`;
    window.history.pushState(null, '', `${window.location.pathname}${hash}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLoginSuccess = (farmerData) => {
    setUser(farmerData);
    setActiveUser(farmerData);
    showToast(`Welcome back, ${farmerData.name}! Opening your farmer dashboard.`);
    handleNavigate('dashboard');
  };

  const handleRegisterSuccess = (newFarmer) => {
    setUser(newFarmer);
    setActiveUser(newFarmer);
    showToast(`Registration complete! Welcome to KrishiMitra, ${newFarmer.name}.`);
    handleNavigate('dashboard');
  };

  const handleLogout = () => {
    logoutFarmer();
    setUser(null);
    showToast('You have been logged out successfully.');
    handleNavigate('home');
  };

  const handleUpdateUser = (updatedData) => {
    setUser(updatedData);
    setActiveUser(updatedData);
    showToast('Profile and preferences updated!');
  };

  const scrollToSection = (id) => {
    if (currentView !== 'home') {
      setCurrentView('home');
      window.location.hash = '';
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
  };

  // Render Login Page View
  if (currentView === 'login') {
    return (
      <>
        <OfflineBanner />
        <LoginPage
          onNavigateRegister={() => handleNavigate('register')}
          onNavigateHome={() => handleNavigate('home')}
          onLoginSuccess={handleLoginSuccess}
          prefilledIdentifier={prefilledLoginId}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Register Page View
  if (currentView === 'register') {
    return (
      <>
        <OfflineBanner />
        <RegisterPage
          onNavigateLogin={() => handleNavigate('login')}
          onNavigateHome={() => handleNavigate('home')}
          onRegisterSuccess={handleRegisterSuccess}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Crop Recommendation Page View
  if (currentView === 'crop-recommendation') {
    return (
      <>
        <OfflineBanner />
        <CropRecommendationPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Plant Disease Detection Page View
  if (currentView === 'disease-detection') {
    return (
      <>
        <OfflineBanner />
        <DiseaseDetectionPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Google Maps Location Selection Page View
  if (currentView === 'location-select') {
    return (
      <>
        <OfflineBanner />
        <LocationSelectionPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateCropRecommendation={() => handleNavigate('crop-recommendation')}
          onNavigateWeather={() => handleNavigate('weather-info')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Weather Information Page View
  if (currentView === 'weather-info') {
    return (
      <>
        <OfflineBanner />
        <WeatherPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateLocation={() => handleNavigate('location-select')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated AI Farming Assistant Chatbot Page View
  if (currentView === 'ai-assistant') {
    return (
      <>
        <OfflineBanner />
        <AIAssistantPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Farmer Profile Page View (Farmer Data Management System)
  if (currentView === 'farmer-profile') {
    return (
      <>
        <OfflineBanner />
        <FarmerProfilePage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateRecords={() => handleNavigate('farming-records')}
          onNavigateCalendar={() => handleNavigate('calendar')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated My Farming Records Page View (IndexedDB Records, Export CSV/JSON, Import JSON)
  if (currentView === 'farming-records') {
    return (
      <>
        <OfflineBanner />
        <MyFarmingRecordsPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateCalendar={() => handleNavigate('calendar')}
          onNavigateProfile={() => handleNavigate('farmer-profile')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Smart Farming Calendar and Reminders Page View
  if (currentView === 'calendar') {
    return (
      <>
        <OfflineBanner />
        <FarmingCalendarPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
          onNavigateRecords={() => handleNavigate('farming-records')}
          onNavigateProfile={() => handleNavigate('farmer-profile')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Agricultural Market Price Dashboard Page View
  if (currentView === 'market-prices') {
    return (
      <>
        <OfflineBanner />
        <MarketPricesPage
          onNavigateHome={() => handleNavigate('home')}
          onNavigateDashboard={() => handleNavigate('dashboard')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Dedicated Farmer Dashboard View
  if (currentView === 'dashboard') {
    return (
      <>
        <OfflineBanner />
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-3 duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        )}

        <DashboardPage
          user={user || DEFAULT_DEMO_FARMER}
          onLogout={handleLogout}
          onNavigateHome={() => handleNavigate('home')}
          onUpdateUser={handleUpdateUser}
          onNavigateLocation={() => handleNavigate('location-select')}
          onNavigateRecords={() => handleNavigate('farming-records')}
          onNavigateCalendar={() => handleNavigate('calendar')}
          onNavigateProfile={() => handleNavigate('farmer-profile')}
          onNavigateMarketPrices={() => handleNavigate('market-prices')}
        />
        <OfflineGuideModal />
      </>
    );
  }

  // Render Standard Homepage View
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAF8] text-slate-800 font-sans selection:bg-emerald-200 selection:text-emerald-950">
      
      {/* 0. Offline Mode Alert Banner (Visible when offline or simulated offline) */}
      <OfflineBanner />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-3 duration-200">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* 1. Top Advisory Notification Banner */}
      <NotificationBanner />

      {/* 2. Responsive Navbar */}
      <Navbar
        user={user}
        onNavigateLogin={() => handleNavigate('login')}
        onNavigateRegister={() => handleNavigate('register')}
        onNavigateDashboard={() => handleNavigate('dashboard')}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenFarmerProfilePage={() => handleNavigate('farmer-profile')}
        onOpenRecords={() => handleNavigate('farming-records')}
        onOpenCalendar={() => handleNavigate('calendar')}
        onLogout={handleLogout}
        onOpenCropRecommendation={() => handleNavigate('crop-recommendation')}
        onOpenDiseaseDetection={() => handleNavigate('disease-detection')}
        onOpenWeather={() => handleNavigate('weather-info')}
        onOpenAIAssistant={() => handleNavigate('ai-assistant')}
        onOpenMarketPrices={() => handleNavigate('market-prices')}
        onNavigateHome={() => handleNavigate('home')}
      />

      {/* 3. Main Page Content */}
      <main className="flex-1">
        
        {/* Hero Section */}
        <HeroSection
          onGetStarted={() => handleNavigate('crop-recommendation')}
          onExploreFeatures={() => scrollToSection('features')}
          onOpenScanner={() => handleNavigate('disease-detection')}
        />

        {/* Quick Highlights / Stats */}
        <QuickStats />

        {/* 6 Core Feature Cards */}
        <FeatureCards
          onOpenCropRecommendation={() => handleNavigate('crop-recommendation')}
          onOpenDiseaseDetection={() => handleNavigate('disease-detection')}
          onOpenWeather={() => handleNavigate('weather-info')}
          onOpenSoilInfo={() => setIsSoilInfoOpen(true)}
          onOpenAIAssistant={() => handleNavigate('ai-assistant')}
          onOpenMarketPrice={() => handleNavigate('market-prices')}
        />

        {/* Weather Prediction Section (with link to dedicated Weather Page) */}
        <WeatherWidget onOpenFullWeather={() => handleNavigate('weather-info')} />

        {/* Live Mandi Market Prices */}
        <MarketPricesPreview onOpenFullMarketPrices={() => handleNavigate('market-prices')} />

        {/* Crop Advisory Calendar */}
        <CropAdvisoryPreview />

        {/* Farmer Testimonials */}
        <Testimonials />

        {/* Call to Action */}
        <CallToAction onOpenScanner={() => handleNavigate('disease-detection')} />

      </main>

      {/* 4. Footer */}
      <Footer
        onOpenCropRecommendation={() => handleNavigate('crop-recommendation')}
        onOpenDiseaseDetection={() => handleNavigate('disease-detection')}
        onOpenWeather={() => handleNavigate('weather-info')}
        onOpenAIAssistant={() => handleNavigate('ai-assistant')}
        onOpenSoilInfo={() => setIsSoilInfoOpen(true)}
        onOpenMarketPrices={() => handleNavigate('market-prices')}
      />

      {/* --- Interactive Modals --- */}
      
      {/* Offline Agricultural Knowledge Guide Modal */}
      <OfflineGuideModal />

      {/* Farmer Profile Card Modal */}
      <FarmerProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={user}
        onLogout={handleLogout}
      />

      {/* Soil Information & Fertilizer Calculator */}
      <SoilInfoModal
        isOpen={isSoilInfoOpen}
        onClose={() => setIsSoilInfoOpen(false)}
      />

      {/* Floating Action Buttons */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-3">
        {/* Back to top */}
        {showBackToTop && (
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="w-11 h-11 rounded-full bg-white text-slate-700 shadow-xl border border-slate-200 flex items-center justify-center hover:bg-slate-50 hover:text-emerald-700 transition transform hover:-translate-y-1"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-5 h-5" />
          </button>
        )}

        {/* Floating AI Assistant Chat Button (Navigates directly to full Chatbot Page) */}
        <button
          onClick={() => handleNavigate('ai-assistant')}
          className="flex items-center gap-2.5 px-4 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-green-600 text-white font-bold text-xs shadow-xl shadow-emerald-700/30 hover:shadow-2xl hover:scale-105 active:scale-95 transition-all"
        >
          <Bot className="w-4 h-4 text-emerald-200 animate-bounce" />
          <span>Ask AI Assistant</span>
        </button>
      </div>

    </div>
  );
}
