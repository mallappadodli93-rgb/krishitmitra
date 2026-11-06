import React, { useState, useEffect } from 'react';
import {
  Sun,
  CloudRain,
  Droplets,
  Wind,
  Sprout,
  ScanLine,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Bot,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Clock,
  Compass,
  Lightbulb,
  ShieldCheck,
  Calendar,
  Mic,
  FileText,
  CalendarDays,
  Bug,
  Bell,
  BellRing,
  Check,
  Plus,
  ExternalLink,
  HardDrive
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import {
  mockWeatherData,
  mockDashboardActivities,
  mockSoilHealthData
} from '../../data/mockData';
import { useLanguage } from '../../context/LanguageContext';
import {
  fetchFarmerProfile,
  fetchFarmingRecords,
  fetchFarmingReminders,
  toggleReminderCompleted
} from '../../services/farmerDataService';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendBrowserNotification
} from '../../utils/notificationService';

export default function DashboardOverview({
  user,
  onOpenCropRecommendation,
  onOpenDiseaseDetection,
  onOpenWeather,
  onOpenSoilInfo,
  onOpenAIAssistant,
  onOpenRecords,
  onOpenCalendar,
  onOpenProfilePage
}) {
  const { t, language } = useLanguage();

  const [farmerProfile, setFarmerProfile] = useState(null);
  const [recordsCount, setRecordsCount] = useState(0);
  const [reminders, setReminders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);
  const [notifPermission, setNotifPermission] = useState('default');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const [prof, recs, rems] = await Promise.all([
          fetchFarmerProfile(),
          fetchFarmingRecords(),
          fetchFarmingReminders()
        ]);
        if (isMounted) {
          setFarmerProfile(prof);
          setRecordsCount(recs ? recs.length : 0);
          setReminders(rems || []);
          setLoadingData(false);
        }
      } catch (err) {
        console.error('Error loading dashboard farmer data:', err);
        if (isMounted) setLoadingData(false);
      }
    }
    loadData();

    if (isNotificationSupported()) {
      setNotifPermission(getNotificationPermission());
    }

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleReminderStatus = async (item) => {
    try {
      await toggleReminderCompleted(item);
      setReminders(prev => prev.map(r => r.id === item.id ? { ...r, status: r.status === 'completed' ? 'pending' : 'completed' } : r));
    } catch (e) {
      console.error('Failed to toggle reminder status:', e);
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestNotificationPermission();
    setNotifPermission(granted ? 'granted' : 'denied');
    if (granted) {
      sendBrowserNotification('KrishiMitra Reminders Active! 🌱', {
        body: 'You will receive timely alerts for irrigation, fertilizers, pest scouting, and crop stages.',
        tag: 'krishimitra-alerts-enabled'
      });
    }
  };

  const farmerName = user?.name || (language === 'kn' ? 'ರಮೇಶ್ ಪಟೇಲ್' : language === 'hi' ? 'रमेश पटेल' : 'Ramesh Patel');
  const location = user?.village
    ? `${user.village}, ${user.district}`
    : (language === 'kn' ? 'ನಿಫಾಡ್, ನಾಸಿಕ್' : language === 'hi' ? 'निफाड़, नासिक' : 'Niphad, Nashik');

  const quickQuestions = t('chatQuestions') || [
    'Which crop should I grow?',
    'How to control plant diseases?',
    'When should I water my crops?',
    'Which fertilizer is suitable?'
  ];

  // 4 Common Farming Tips directly translated in all 3 languages
  const farmingTips = [
    {
      id: 'spray',
      title: t('tipSprayTimeTitle'),
      desc: t('tipSprayTimeDesc'),
      category: language === 'kn' ? 'ಔಷಧ ಸಿಂಪಡಣೆ' : language === 'hi' ? 'कीटनाशक छिड़काव' : 'Spray Timing',
      urgency: language === 'kn' ? 'ಉತ್ತಮ ಪರಿಸ್ಥಿತಿ' : language === 'hi' ? 'अनुकूल स्थिति' : 'Optimal Window',
      badgeColor: 'emerald'
    },
    {
      id: 'irrigation',
      title: t('tipIrrigationTitle'),
      desc: t('tipIrrigationDesc'),
      category: language === 'kn' ? 'ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ' : language === 'hi' ? 'सिंचाई समय' : 'Irrigation Advice',
      urgency: language === 'kn' ? 'ನೀರು ಉಳಿತಾಯ' : language === 'hi' ? 'जल संरक्षण' : 'Water Saving',
      badgeColor: 'blue'
    },
    {
      id: 'rain',
      title: t('tipRainWarningTitle'),
      desc: t('tipRainWarningDesc'),
      category: language === 'kn' ? 'ಹವಾಮಾನ ಎಚ್ಚರಿಕೆ' : language === 'hi' ? 'मौसम चेतावनी' : 'Weather Alert',
      urgency: language === 'kn' ? 'ಮುನ್ನೆಚ್ಚರಿಕೆ' : language === 'hi' ? 'सावधानी' : 'High Priority',
      badgeColor: 'amber'
    },
    {
      id: 'precautions',
      title: t('tipPrecautionsTitle'),
      desc: t('tipPrecautionsDesc'),
      category: language === 'kn' ? 'ಬೆಳೆ ಸಂರಕ್ಷಣೆ' : language === 'hi' ? 'फसल सुरक्षा' : 'Crop Protection',
      urgency: language === 'kn' ? 'ಪರಿಶೀಲಿಸಿ' : language === 'hi' ? 'निगरानी करें' : 'Preventive',
      badgeColor: 'emerald'
    }
  ];

  return (
    <div className="space-y-8 p-4 sm:p-8 max-w-7xl mx-auto">
      
      {/* 1 & 2. Welcome & Location Alert Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-800">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold uppercase tracking-wider">
              <Sprout className="w-3.5 h-3.5 text-emerald-300" />
              {t('dashOverviewBanner')}
            </span>

            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {t('dashWelcome')}, {farmerName}!
            </h2>

            <p className="text-emerald-100 text-xs sm:text-sm leading-relaxed">
              {language === 'kn' ? (
                <>ನಿಮ್ಮ <strong>{location}</strong> ಜಮೀನು ಪ್ರಸ್ತುತ ರಬಿ ಹಂಗಾಮಿನಲ್ಲಿದೆ. {t('dashSprayWindowOpen')}</>
              ) : language === 'hi' ? (
                <>आपके <strong>{location}</strong> के खेत वर्तमान में रबी सीजन में हैं। {t('dashSprayWindowOpen')}</>
              ) : (
                <>Your fields in <strong>{location}</strong> are currently in the <strong>Rabi vegetative stage</strong>. {t('dashSprayWindowOpen')}</>
              )}
            </p>
          </div>

          {/* Quick CTA buttons inside banner */}
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <Button
              variant="white"
              size="sm"
              icon={ScanLine}
              onClick={onOpenDiseaseDetection}
              className="font-bold text-emerald-900 hover:bg-emerald-50 shadow-md"
            >
              {t('dashScanLeafBtn')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              icon={Bot}
              onClick={onOpenAIAssistant}
              className="text-white border-white/50 hover:bg-white/10 bg-transparent font-semibold"
            >
              {t('dashAskAiBtn')}
            </Button>
          </div>
        </div>
      </div>

      {/* Main 4 Cards Grid: Weather, Recommended Crops, Disease Detection, Soil Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 3. Weather Information Card */}
        <Card className="p-6 border-slate-200 hover:border-blue-400 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('dashWeatherCardTitle')}
              </span>
              <Badge variant="blue" size="xs">
                Live Radar
              </Badge>
            </div>

            <div className="flex items-center justify-between my-2">
              <div>
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {mockWeatherData.temperature}°C
                </span>
                <p className="text-xs font-bold text-slate-700 mt-0.5">
                  {mockWeatherData.condition}
                </p>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <Sun className="w-7 h-7 animate-pulse" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 my-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <Droplets className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{language === 'kn' ? 'ಆರ್ದ್ರತೆ' : language === 'hi' ? 'आर्द्रता' : 'Humidity'}: {mockWeatherData.humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CloudRain className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span>{language === 'kn' ? 'ಮಳೆ ಸಂಭವ' : language === 'hi' ? 'वर्षा' : 'Rain'}: {mockWeatherData.rainfallChance}%</span>
              </div>
            </div>

            <div className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
              💡 {t('dashSprayWindowOpen')}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenWeather}
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition flex items-center justify-center gap-1.5"
          >
            <span>{t('dashViewForecast')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        {/* 4. Recommended Crops Card */}
        <Card className="p-6 border-slate-200 hover:border-emerald-400 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('dashCropCardTitle')}
              </span>
              <Badge variant="emerald" size="xs">
                {t('dashRabiSeason')}
              </Badge>
            </div>

            <div className="space-y-3 my-2">
              <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'kn' ? 'ಗೋಧಿ (HD-3086)' : language === 'hi' ? 'गेहूं (HD-3086)' : 'Wheat (HD-3086)'}
                  </h4>
                  <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    98% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {language === 'kn' ? 'ಅಂದಾಜು ಲಾಭ: ' : language === 'hi' ? 'अनुमानित लाभ: ' : 'Est. Profit: '}
                  <strong>₹55,000 - ₹68,000</strong> / Acre
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-900">
                    {language === 'kn' ? 'ಕಡಲೆ (JG-14)' : language === 'hi' ? 'चना (JG-14)' : 'Gram / Chana (Desi)'}
                  </h4>
                  <span className="text-[11px] font-extrabold text-slate-700 bg-slate-200 px-2 py-0.5 rounded-full">
                    95% Match
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  {language === 'kn' ? 'ಕಡಿಮೆ ನೀರು ಸಾಕು • ' : language === 'hi' ? 'कम पानी की आवश्यकता • ' : 'Low water need • '}
                  <strong>₹50,000 - ₹62,000</strong> / Acre
                </p>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 italic mt-2">
              {language === 'kn' ? 'ಕಪ್ಪು / ಗೋಡು ಮಣ್ಣಿಗೆ ಸೂಕ್ತವಾಗಿದೆ.' : language === 'hi' ? 'काली व दोमट मिट्टी के लिए अनुकूल।' : 'Based on Black / Loam Soil & local temperature trends.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenCropRecommendation}
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition flex items-center justify-center gap-1.5"
          >
            <span>{t('dashRunCropAi')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </Card>

        {/* 5. Disease Detection Card */}
        <Card className="p-6 border-slate-200 hover:border-amber-400 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('dashDiseaseCardTitle')}
              </span>
              <Badge variant="amber" size="xs">
                AI Vision
              </Badge>
            </div>

            <div className="space-y-3 my-2">
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs">
                <div className="flex items-center gap-1.5 font-bold text-amber-900">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{language === 'kn' ? 'ಇತ್ತೀಚಿನ ಸ್ಕ್ಯಾನ್: ಗೋಧಿ ಎಲೆ' : language === 'hi' ? 'हालिया स्कैन: गेहूं की पत्ती' : 'Recent Scan: Wheat Leaf'}</span>
                </div>
                <p className="text-slate-700 mt-1">
                  {language === 'kn' 
                    ? 'ಹಳದಿ ತುಕ್ಕು ರೋಗ ಪತ್ತೆಯಾಗಿದೆ (96.4%). ಪ್ರೊಪಿಕೊನಜೋಲ್ ಸಿಂಪಡಿಸಿ.' 
                    : language === 'hi' 
                    ? 'पीला रतुआ पहचाना गया (96.4%)। प्रोपिकोनाज़ोल छिड़काव करें।' 
                    : 'Yellow Rust detected (96.4% confidence). Propiconazole foliar spray applied.'}
                </p>
                <span className="inline-block mt-2 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                  {language === 'kn' ? 'ಸ್ಥಿತಿ: ಚೇತರಿಕೆಯ ಹಂತ' : language === 'hi' ? 'स्थिति: निगरानी में' : 'Status: Monitoring Recovery'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-500 mt-2">
              {language === 'kn' 
                ? 'ಎಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ಚುಕ್ಕೆ ಅಥವಾ ರೋಗ ಕಂಡರೆ ತಕ್ಷಣ ಸ್ಕ್ಯಾನ್ ಮಾಡಿ.' 
                : language === 'hi' 
                ? 'पत्तियों में कोई धब्बा दिखे तो तुरंत स्कैन करें।' 
                : 'Notice any leaf spots or wilting? Scan immediately to prevent spread.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onOpenDiseaseDetection}
            className="mt-5 w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
          >
            <ScanLine className="w-4 h-4" />
            <span>{t('dashScanPlantLeaf')}</span>
          </button>
        </Card>

        {/* 6. Soil Information Card */}
        <Card className="p-6 border-slate-200 hover:border-emerald-400 flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {t('dashSoilCardTitle')}
              </span>
              <Badge variant="emerald" size="xs">
                Card Synced
              </Badge>
            </div>

            <div className="space-y-2 my-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">{language === 'kn' ? 'ಸಾರಜನಕ (N)' : language === 'hi' ? 'नाइट्रोजन (N)' : 'Nitrogen (N)'}</span>
                <span className="font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">{language === 'kn' ? 'ಕಡಿಮೆ' : language === 'hi' ? 'कम' : 'Low'}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">{language === 'kn' ? 'ರಂಜಕ (P)' : language === 'hi' ? 'फास्फोरस (P)' : 'Phosphorus (P)'}</span>
                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">{language === 'kn' ? 'ಮಧ್ಯಮ' : language === 'hi' ? 'मध्यम' : 'Medium'}</span>
              </div>
              <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-slate-600">{language === 'kn' ? 'ಪೊಟ್ಯಾಷ್ (K)' : language === 'hi' ? 'पोटाश (K)' : 'Potash (K)'}</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded">{language === 'kn' ? 'ಉತ್ತಮ' : language === 'hi' ? 'उत्तम' : 'Optimal'}</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-emerald-50/70 p-2 rounded-lg border border-emerald-200 mt-2">
              Soil pH: <strong>{mockSoilHealthData.ph}</strong> • {language === 'kn' ? 'ಕಪ್ಪು ಗೋಡು ಮಣ್ಣು' : language === 'hi' ? 'काली दोमट मिट्टी' : 'Black Loam'}
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenSoilInfo}
            className="mt-5 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 text-emerald-800 font-bold text-xs border border-slate-200 hover:border-emerald-300 transition flex items-center justify-center gap-1.5"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{t('dashCalcFertilizer')}</span>
          </button>
        </Card>

      </div>

      {/* Farmer Data Management Overview (Profile & Farm Land + IndexedDB Records) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Farm Land & Farmer Profile Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Sprout className="w-6 h-6 text-emerald-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {farmerProfile?.farmName || (language === 'kn' ? 'ಶ್ರೀ ಕೃಷ್ಣ ಕೃಷಿ ಕ್ಷೇತ್ರ' : language === 'hi' ? 'श्री कृष्ण कृषि क्षेत्र' : 'Shri Krishna Krishi Kshetra')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {farmerProfile?.landSize || '5.5 Acres'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {farmerProfile?.name || farmerName} • {farmerProfile?.village || 'Niphad'}, {farmerProfile?.district || 'Nashik'}, {farmerProfile?.state || 'Maharashtra'}
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-slate-100 text-slate-600 rounded-lg">
              {farmerProfile?.soilType || 'Black Loam'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-5 text-xs">
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Irrigation Type</span>
              <span className="font-bold text-slate-800">{farmerProfile?.irrigation || 'Drip & Borewell'}</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] text-slate-400 block font-semibold">Current Season</span>
              <span className="font-bold text-slate-800">Rabi 2026-27</span>
            </div>
            <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 col-span-2 sm:col-span-1">
              <span className="text-[10px] text-slate-400 block font-semibold">Storage Engine</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1">
                <HardDrive className="w-3 h-3" /> IndexedDB
              </span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className="text-[11px] text-slate-400 font-medium">Growing:</span>
              {(farmerProfile?.cropsGrowing || ['Wheat (HD-3086)', 'Chickpea (JG-14)', 'Nashik Red Onion']).map((crop, i) => (
                <span key={i} className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-md border border-emerald-100">
                  {crop}
                </span>
              ))}
            </div>
            <button
              type="button"
              onClick={onOpenProfilePage}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 shrink-0 ml-2"
            >
              <span>{t('navFarmerProfile')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* My Farming Records (IndexedDB Protection) Card */}
        <div className="bg-white rounded-3xl p-6 border border-emerald-200/90 shadow-sm hover:shadow-md transition">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center font-black">
                <FileText className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-slate-900">
                    {t('navFarmingRecords')}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800 border border-blue-200">
                    {recordsCount} Crops Tracked
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Organized crop records, acreages, planting logs & photo evidence
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Local Safe
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
              <span className="text-xs text-slate-600 font-semibold block">Total Cultivated Area</span>
              <span className="text-xl font-black text-slate-900 mt-0.5 block">5.5 Acres</span>
              <span className="text-[10px] text-blue-700 font-bold">100% of Land Utilized</span>
            </div>
            <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
              <span className="text-xs text-slate-600 font-semibold block">Data Portability</span>
              <span className="text-xs font-bold text-slate-800 mt-1 block">JSON & CSV Export</span>
              <span className="text-[10px] text-emerald-700 font-bold">Offline Import Ready</span>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              IndexedDB local encrypted storage
            </span>
            <button
              type="button"
              onClick={onOpenRecords}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 shrink-0"
            >
              <span>{t('recordsManageAction') || 'Manage Records'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

      </div>

      {/* Smart Farming Calendar & Upcoming Reminders Section */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-emerald-200/90 shadow-sm space-y-5">
        
        {/* Header bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-black shadow-sm">
              <CalendarDays className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-extrabold text-slate-900">
                  {t('calendarRemindersTitle') || 'Upcoming Farming Reminders & Calendar Activities'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                  {reminders.filter(r => r.status === 'pending').length} Pending
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Automated agronomy alerts saved in IndexedDB • Web Notifications enabled
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Notification Permission Toggle */}
            {notifPermission !== 'granted' ? (
              <button
                type="button"
                onClick={handleEnableNotifications}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300 transition"
                title="Enable Browser Alerts for Reminders"
              >
                <Bell className="w-3.5 h-3.5 text-amber-700" />
                <span>Enable Alerts</span>
              </button>
            ) : (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <BellRing className="w-3 h-3 text-emerald-600" />
                <span>Alerts On</span>
              </span>
            )}

            {/* Open Smart Calendar Button */}
            <button
              type="button"
              onClick={onOpenCalendar}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition"
            >
              <Calendar className="w-4 h-4" />
              <span>{t('navCalendar')}</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>
          </div>
        </div>

        {/* Reminders List (Filtered to show upcoming pending reminders first) */}
        {reminders.length === 0 ? (
          <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">{t('calendarNoReminders') || 'No pending reminders scheduled'}</p>
            <p className="text-xs text-slate-400 mt-1">Generate schedules from crop templates (Wheat, Chickpea, Rice, Tomato) in the Calendar.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.slice(0, 6).map((item) => {
              const isCompleted = item.status === 'completed';
              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-2xl border transition relative flex flex-col justify-between ${
                    isCompleted
                      ? 'bg-slate-50/70 border-slate-200 opacity-60'
                      : item.priority === 'high'
                      ? 'bg-amber-50/40 border-amber-200 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          item.type === 'irrigation'
                            ? 'bg-blue-100 text-blue-700'
                            : item.type === 'fertilizer'
                            ? 'bg-emerald-100 text-emerald-700'
                            : item.type === 'pest'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-purple-100 text-purple-700'
                        }`}>
                          {item.type === 'irrigation' && <Droplets className="w-4 h-4" />}
                          {item.type === 'fertilizer' && <Sprout className="w-4 h-4" />}
                          {item.type === 'pest' && <Bug className="w-4 h-4" />}
                          {item.type === 'inspection' && <ShieldCheck className="w-4 h-4" />}
                        </div>
                        <div>
                          <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">
                            {item.crop}
                          </span>
                          <h4 className={`text-xs font-bold leading-tight ${isCompleted ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                            {item.title}
                          </h4>
                        </div>
                      </div>

                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                        isCompleted
                          ? 'bg-slate-200 text-slate-600'
                          : item.priority === 'high'
                          ? 'bg-red-100 text-red-800'
                          : item.priority === 'medium'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isCompleted ? 'Done' : item.priority}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 my-2 leading-relaxed">
                      {item.notes}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {item.dueDate}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleToggleReminderStatus(item)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1 ${
                        isCompleted
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                      <span>{isCompleted ? 'Undo' : 'Mark Done'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* 8. AI Chatbot Shortcut (Prominent Action Banner) */}
      <div className="bg-gradient-to-br from-white to-emerald-50/40 rounded-3xl p-6 sm:p-7 border border-emerald-200/90 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {t('chatTitle')}
                </h3>
                <p className="text-xs text-slate-500">
                  {t('featAssistantDesc')}
                </p>
              </div>
            </div>

            {/* Quick interactive chip buttons */}
            <div className="flex flex-wrap gap-2 pt-2">
              {quickQuestions.slice(0, 4).map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={onOpenAIAssistant}
                  className="text-xs text-slate-700 bg-white hover:bg-emerald-600 hover:text-white border border-slate-200 hover:border-emerald-600 px-3 py-1.5 rounded-xl transition shadow-sm font-medium"
                >
                  "{q}"
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenAIAssistant}
              className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition flex items-center gap-2 shadow-sm"
              title={t('voiceStart')}
            >
              <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>{t('voiceStart')}</span>
            </button>

            <Button
              variant="primary"
              size="md"
              icon={Bot}
              onClick={onOpenAIAssistant}
              className="font-bold shadow-emerald-600/25"
            >
              {t('dashLaunchChat')}
            </Button>
          </div>
        </div>
      </div>

      {/* 7 & 9. Farming Tips Section & Recent Activities Section (Two Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* 7. Farming Tips Section (Common Farming Information) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-amber-500" />
              <span>{t('dashFarmingTipsTitle')}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {language === 'kn' ? 'ದೈನಂದಿನ ನವೀಕರಣ' : language === 'hi' ? 'दैनिक अपडेट' : 'Daily Updates'}
            </span>
          </div>

          <div className="space-y-3">
            {farmingTips.map((tip) => (
              <Card
                key={tip.id}
                className="p-5 border-slate-200/90 hover:border-emerald-300 transition-all bg-white"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                      {tip.category}
                    </span>
                  </div>
                  <Badge variant={tip.badgeColor} size="xs">
                    {tip.urgency}
                  </Badge>
                </div>

                <h4 className="font-bold text-slate-900 text-sm mb-1">
                  {tip.title}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {tip.desc}
                </p>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <span>{language === 'kn' ? 'ಕೃಷಿ ತಜ್ಞರಿಂದ ಪರಿಶೀಲಿಸಲಾಗಿದೆ' : language === 'hi' ? 'कृषि वैज्ञानिकों द्वारा सत्यापित' : 'Verified by Agronomy Cell'}</span>
                  <span>{language === 'kn' ? 'ಇಂದು' : language === 'hi' ? 'आज' : 'Today'}</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 9. Recent Activities Section */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-600" />
              <span>{t('dashActivitiesTitle')}</span>
            </h3>
            <span className="text-xs text-slate-400">
              {language === 'kn' ? 'ಲಾಗ್' : language === 'hi' ? 'लॉग' : 'Activity Log'}
            </span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 divide-y divide-slate-100">
            {mockDashboardActivities.map((act) => (
              <div key={act.id} className="py-3.5 first:pt-1 last:pb-1">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      {act.type === 'scan' ? (
                        <ScanLine className="w-4 h-4" />
                      ) : act.type === 'mandi' ? (
                        <TrendingUp className="w-4 h-4" />
                      ) : act.type === 'soil' ? (
                        <Layers className="w-4 h-4" />
                      ) : (
                        <Sun className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{act.title}</h4>
                      <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                        {act.description}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {act.time}
                      </span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      act.badgeColor === 'emerald'
                        ? 'bg-emerald-100 text-emerald-800'
                        : act.badgeColor === 'amber'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {act.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Mandi summary ticker */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center justify-between text-xs text-emerald-950">
            <div>
              <span className="font-bold block">
                {language === 'kn' ? 'ಲೈವ್ ಮಂಡಿ ಸರಾಸರಿ:' : language === 'hi' ? 'लाइव मंडी औसत भाव:' : 'Live Mandi Average:'}
              </span>
              <span className="text-emerald-700">
                {language === 'kn' ? 'ಗೋಧಿ ₹2,680/ಕ್ವಿಂಟಾಲ್ • ಸೋಯಾಬೀನ್ ₹4,820/ಕ್ವಿಂಟಾಲ್' : language === 'hi' ? 'गेहूं ₹2,680/क्विंटल • सोयाबीन ₹4,820/क्विंटल' : 'Wheat ₹2,680/Q • Soybean ₹4,820/Q'}
              </span>
            </div>
            <button
              type="button"
              onClick={onOpenWeather}
              className="text-emerald-800 font-bold hover:underline shrink-0"
            >
              {language === 'kn' ? 'ಎಲ್ಲ ದರಗಳು →' : language === 'hi' ? 'सभी भाव →' : 'All Rates →'}
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
