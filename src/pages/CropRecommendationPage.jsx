import React, { useState, useEffect, useMemo } from 'react';
import {
  Sprout,
  Sparkles,
  MapPin,
  Layers,
  Droplets,
  Thermometer,
  CloudSun,
  CloudRain,
  LandPlot,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
  TrendingUp,
  Bookmark,
  Share2,
  RefreshCw,
  Lightbulb,
  BookmarkCheck,
  WifiOff,
  Globe,
  ChevronDown,
  Sliders,
  Award,
  ShieldCheck,
  Check,
  ExternalLink,
  Table,
  HelpCircle,
  Cpu,
  Compass,
  FileText,
  DollarSign
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getActiveUser } from '../utils/authStorage';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';
import {
  CROPS_CATALOG,
  AVAILABLE_SOIL_TYPES,
  WATER_AVAILABILITY_OPTIONS,
  SEASONS_LIST,
  ICAR_REGIONAL_SOIL_BENCHMARKS,
  detectCurrentSeason,
  fetchWeatherForLocation,
  calculateTopFiveCrops,
  validateRecommendationInputs,
  buildCropRecommendationMLPayload
} from '../services/cropRecommendationService';

// Quick Preset Farm Locations across major agricultural belts
const PRESET_LOCATIONS = [
  {
    id: 'raichur-karnataka',
    name: 'Raichur (Tungabhadra Basin), Karnataka',
    village: 'Sindhanur',
    district: 'Raichur',
    state: 'Karnataka',
    lat: 16.2160,
    lng: 77.3566,
    defaultSoil: 'Black / Regur Soil (Clayey)',
    defaultPh: 7.6,
    defaultWater: 'High',
    defaultSeason: 'Rabi'
  },
  {
    id: 'davanagere-karnataka',
    name: 'Davanagere (Central Plains), Karnataka',
    village: 'Harihar',
    district: 'Davanagere',
    state: 'Karnataka',
    lat: 14.4644,
    lng: 75.9218,
    defaultSoil: 'Red Sandy Loam / Red Soil',
    defaultPh: 6.8,
    defaultWater: 'Moderate',
    defaultSeason: 'Rabi'
  },
  {
    id: 'mandya-karnataka',
    name: 'Mandya (Cauvery Basin), Karnataka',
    village: 'Maddur',
    district: 'Mandya',
    state: 'Karnataka',
    lat: 12.5218,
    lng: 76.8951,
    defaultSoil: 'Alluvial / River Plains Loam',
    defaultPh: 6.9,
    defaultWater: 'High',
    defaultSeason: 'Kharif'
  },
  {
    id: 'hassan-karnataka',
    name: 'Hassan (Southern Transition), Karnataka',
    village: 'Channarayapatna',
    district: 'Hassan',
    state: 'Karnataka',
    lat: 13.0033,
    lng: 76.1004,
    defaultSoil: 'Red Sandy Loam / Red Soil',
    defaultPh: 6.2,
    defaultWater: 'Moderate',
    defaultSeason: 'Kharif'
  },
  {
    id: 'niphad-nashik',
    name: 'Niphad (Godavari Basin), Nashik, Maharashtra',
    village: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 20.0760,
    lng: 74.0435,
    defaultSoil: 'Black / Regur Soil (Clayey)',
    defaultPh: 7.2,
    defaultWater: 'Moderate',
    defaultSeason: 'Rabi'
  },
  {
    id: 'khanna-punjab',
    name: 'Khanna (Trans-Gangetic Plains), Ludhiana, Punjab',
    village: 'Khanna',
    district: 'Ludhiana',
    state: 'Punjab',
    lat: 30.7046,
    lng: 76.2163,
    defaultSoil: 'Alluvial / River Plains Loam',
    defaultPh: 7.3,
    defaultWater: 'Moderate',
    defaultSeason: 'Rabi'
  },
  {
    id: 'gondal-gujarat',
    name: 'Gondal (Saurashtra Belt), Rajkot, Gujarat',
    village: 'Gondal',
    district: 'Rajkot',
    state: 'Gujarat',
    lat: 22.3039,
    lng: 70.8022,
    defaultSoil: 'Red Sandy Loam / Red Soil',
    defaultPh: 7.0,
    defaultWater: 'Low',
    defaultSeason: 'Rabi'
  },
  {
    id: 'guntur-ap',
    name: 'Tenali (Krishna Delta), Guntur, Andhra Pradesh',
    village: 'Tenali',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
    defaultSoil: 'Black / Regur Soil (Clayey)',
    defaultPh: 7.4,
    defaultWater: 'High',
    defaultSeason: 'Kharif'
  }
];

export default function CropRecommendationPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();
  const { isOffline, saveCropLocally, openOfflineGuide } = useOffline();

  // Saved bookmark feedback state
  const [savedSuccessMap, setSavedSuccessMap] = useState({});

  // 1. Initial Location Resolution
  const initialLocation = useMemo(() => {
    try {
      const savedLoc = localStorage.getItem('krishimitra_farm_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        return {
          village: parsed.village || 'Sindhanur',
          district: parsed.district || 'Raichur',
          state: parsed.state || 'Karnataka',
          text: `${parsed.village || 'Sindhanur'}, ${parsed.district || 'Raichur'}, ${parsed.state || 'Karnataka'}`,
          lat: parsed.lat || 16.2160,
          lng: parsed.lng || 77.3566
        };
      }
    } catch {
      // ignore
    }
    if (activeUser?.village) {
      return {
        village: activeUser.village,
        district: activeUser.district || 'Raichur',
        state: activeUser.state || 'Karnataka',
        text: `${activeUser.village}, ${activeUser.district || 'Raichur'}, ${activeUser.state || 'Karnataka'}`,
        lat: 16.2160,
        lng: 77.3566
      };
    }
    return {
      village: 'Sindhanur',
      district: 'Raichur',
      state: 'Karnataka',
      text: 'Sindhanur, Raichur, Karnataka',
      lat: 16.2160,
      lng: 77.3566
    };
  }, [activeUser]);

  // Form Parameters
  const [village, setVillage] = useState(initialLocation.village);
  const [district, setDistrict] = useState(initialLocation.district);
  const [state, setState] = useState(initialLocation.state);
  const [farmLocation, setFarmLocation] = useState(initialLocation.text);
  const [farmCoords, setFarmCoords] = useState({ lat: initialLocation.lat, lng: initialLocation.lng });
  const [soilType, setSoilType] = useState('Black / Regur Soil (Clayey)');
  const [soilPh, setSoilPh] = useState('7.2');
  const [isPhKnown, setIsPhKnown] = useState(true);
  const [availableWater, setAvailableWater] = useState('Moderate');
  const [season, setSeason] = useState(() => detectCurrentSeason());
  const [landSizeAcres, setLandSizeAcres] = useState(3.0);

  // Weather State
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // Recommendation Engine Mode: 'rule-based' | 'ml-model'
  const [engineMode, setEngineMode] = useState('rule-based');
  const [showMLModal, setShowMLModal] = useState(false);

  // View state: 'cards' | 'comparison'
  const [resultsView, setResultsView] = useState('cards');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Calculation Results
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch Weather when coordinates change
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setIsLoadingWeather(true);
      const data = await fetchWeatherForLocation(farmCoords.lat, farmCoords.lng, district);
      if (isMounted) {
        setWeatherData(data);
        setIsLoadingWeather(false);
      }
    }
    loadWeather();
    return () => { isMounted = false; };
  }, [farmCoords.lat, farmCoords.lng, district]);

  // Calculation logic
  const runCalculation = (tempOverride) => {
    setIsCalculating(true);

    const tempVal = tempOverride !== undefined
      ? tempOverride
      : (weatherData?.temperature ?? 26);

    const res = calculateTopFiveCrops({
      location: farmLocation,
      coordinates: farmCoords,
      district,
      state,
      soilType,
      soilPh: isPhKnown ? parseFloat(soilPh) : undefined,
      availableWater,
      season,
      temperature: tempVal,
      humidity: weatherData?.humidity ?? 60,
      rainfall: weatherData?.precipitation ?? 0,
      landSize: parseFloat(landSizeAcres) || 1.0,
      isLiveWeather: !!weatherData?.isLive
    });

    setRecommendationResult(res);

    setTimeout(() => {
      setIsCalculating(false);
    }, 250);
  };

  // Re-calculate whenever parameters or weather change
  useEffect(() => {
    if (weatherData) {
      runCalculation(weatherData.temperature);
    }
  }, [soilType, soilPh, isPhKnown, availableWater, season, landSizeAcres, farmLocation, weatherData]);

  // Handle Preset Location selection
  const handleSelectPreset = (preset) => {
    setVillage(preset.village);
    setDistrict(preset.district);
    setState(preset.state);
    setFarmLocation(preset.name);
    setFarmCoords({ lat: preset.lat, lng: preset.lng });
    setSoilType(preset.defaultSoil);
    setSoilPh(String(preset.defaultPh));
    setIsPhKnown(true);
    setAvailableWater(preset.defaultWater);
    setSeason(preset.defaultSeason);
  };

  // Load saved location from storage
  const handleLoadSavedLocation = () => {
    try {
      const savedLoc = localStorage.getItem('krishimitra_farm_location');
      if (savedLoc) {
        const parsed = JSON.parse(savedLoc);
        setVillage(parsed.village || 'Sindhanur');
        setDistrict(parsed.district || 'Raichur');
        setState(parsed.state || 'Karnataka');
        setFarmLocation(`${parsed.village || 'Sindhanur'}, ${parsed.district || 'Raichur'}, ${parsed.state || 'Karnataka'}`);
        setFarmCoords({ lat: parsed.lat || 16.2160, lng: parsed.lng || 77.3566 });
      }
    } catch {
      // ignore
    }
  };

  // Bookmark / Cache crop locally
  const handleBookmarkCrop = (crop) => {
    saveCropLocally({
      id: crop.id,
      name: crop.name,
      category: crop.category,
      season: crop.primarySeasons.join(', '),
      soil: crop.optimalSoils.join(', '),
      water: crop.waterRequirement,
      duration: crop.growingDuration,
      tips: crop.keyFarmingTips,
      precautions: crop.precautions,
      projectedYield: `${crop.scaledYieldRange} (for ${crop.landSizeAcres} Acres)`,
      projectedProfit: `${crop.scaledProfitRange} (for ${crop.landSizeAcres} Acres)`,
      savedAt: new Date().toLocaleDateString()
    });

    setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: true }));
    setTimeout(() => {
      setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: false }));
    }, 3000);
  };

  // Active ICAR Regional Benchmark
  const regionalSoilBenchmark = ICAR_REGIONAL_SOIL_BENCHMARKS[district] || {
    agroZone: 'Indian Semi-Arid Agricultural Zone',
    predominantSoil: 'Loamy to Medium Black Soil',
    baselinePhMin: 6.5,
    baselinePhMax: 7.5,
    organicCarbon: 'Medium (0.50%)',
    majorCrops: 'Cereals, Pulses & Oilseeds',
    source: 'ICAR-CRIDA Regional Agro-Ecology Atlas'
  };

  // Prepare ML Payload Contract
  const mlPayload = useMemo(() => {
    return buildCropRecommendationMLPayload({
      location: farmLocation,
      coordinates: farmCoords,
      district,
      state,
      soilType,
      soilPh: isPhKnown ? soilPh : undefined,
      availableWater,
      season,
      temperature: weatherData?.temperature ?? 26,
      humidity: weatherData?.humidity ?? 60,
      rainfall: weatherData?.precipitation ?? 0,
      landSize: landSizeAcres
    });
  }, [farmLocation, farmCoords, district, state, soilType, soilPh, isPhKnown, availableWater, season, weatherData, landSizeAcres]);

  const topCrops = recommendationResult?.topCrops || [];
  const warnings = recommendationResult?.warnings || [];

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-24">
      
      {/* 1. Header Navigation Bar */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('navHome')}</span>
            </button>
            <div className="hidden sm:block h-6 w-px bg-slate-200" />
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/30">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Location-Based Smart Crop Recommendation
                </h1>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {language === 'kn' ? 'ಸ್ಥಳ ಆಧಾರಿತ ಸ್ಮಾರ್ಟ್ ಬೆಳೆ ಶಿಫಾರಸು ವ್ಯವಸ್ಥೆ' : language === 'hi' ? 'स्थान-आधारित स्मार्ट फसल अनुशंसा प्रणाली' : '5-Stage Agronomy Workflow • Scaled for Land Size'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Dashboard button */}
            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-emerald-50 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>

            {/* Offline Guide */}
            <button
              type="button"
              onClick={openOfflineGuide}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Offline Agronomy</span>
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span>{languages.find(l => l.code === language)?.name || 'Language'}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
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
          </div>
        </div>
      </header>

      {/* 2. Main Page Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">

        {/* Hero Banner with Workflow Stepper Indicator */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-700/50">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-200 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Full 5-Stage Agronomic Workflow • Scaled for Your Land Size</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Location-Based Smart Crop Recommendation System
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Synthesizes your Google Maps location, live weather forecast, ICAR soil benchmarks, verified soil pH, irrigation resources, and land acreage to calculate the <strong>Top 5 Suitable Crops</strong> with precautions and financial yields.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowFormulaModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 font-bold border border-white/20 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>Transparent Scoring Weights</span>
              </button>
              <button
                type="button"
                onClick={() => setShowMLModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 font-bold border border-emerald-400/30 transition"
              >
                <Cpu className="w-3.5 h-3.5 text-amber-300" />
                <span>ML Model Integration Schema</span>
              </button>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <Sprout className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* 5-Step Visual Progress Stepper Banner */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm overflow-x-auto">
          <div className="flex items-center justify-between min-w-[700px] gap-2">
            
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                1
              </span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 block">Step 1</span>
                <span className="text-xs font-bold text-slate-800">Saved Farm Location</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                2
              </span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 block">Step 2</span>
                <span className="text-xs font-bold text-slate-800">Weather & Forecast</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                3
              </span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 block">Step 3</span>
                <span className="text-xs font-bold text-slate-800">Soil & Agricultural Info</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                4
              </span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 block">Step 4</span>
                <span className="text-xs font-bold text-slate-800">Match Crop Needs</span>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center shrink-0">
                5
              </span>
              <div>
                <span className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-700 block">Step 5</span>
                <span className="text-xs font-bold text-slate-800">Top 5 Crops Output</span>
              </div>
            </div>

          </div>
        </div>

        {/* ⚠️ CRITICAL NOTICE: Google Maps does NOT provide Soil Quality */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-950">
            <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
              <span>Important: Google Maps Provides Geographical Coordinates, NOT Soil Tests</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-200 rounded font-black text-amber-900">
                Strict Agronomic Policy
              </span>
            </h3>
            <p className="leading-relaxed">
              Google Maps provides latitude, longitude, and administrative bounds. <strong>Google Maps cannot analyze subterranean soil chemistry, nitrogen content, or physical texture.</strong> KrishiMitra never invents soil conditions or claims that location alone guarantees crop suitability. Please confirm your soil type and laboratory pH from your official <strong>Soil Health Card (ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್)</strong>.
            </p>
          </div>
        </div>

        {/* Missing Data Warnings & Confidence Indicator */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-bold text-xs bg-emerald-50 text-emerald-800 border-emerald-200">
              <Award className="w-4 h-4 text-emerald-600" />
              <span>Recommendation Confidence: {recommendationResult?.confidenceScore ?? 92}%</span>
            </div>
            <span className="text-xs text-slate-500 font-medium hidden md:inline">
              {recommendationResult?.confidenceLabel}
            </span>
          </div>

          {/* Engine Mode Toggle */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-bold hidden sm:inline">Engine:</span>
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setEngineMode('rule-based')}
                className={`px-3 py-1 rounded-lg transition ${
                  engineMode === 'rule-based' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Rule-Based (Active)
              </button>
              <button
                type="button"
                onClick={() => setEngineMode('ml-model')}
                className={`px-3 py-1 rounded-lg transition ${
                  engineMode === 'ml-model' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ML Ready
              </button>
            </div>
          </div>
        </div>

        {/* Warnings Banner if any */}
        {warnings.length > 0 && (
          <div className="p-4 bg-amber-50/80 border border-amber-300 rounded-2xl space-y-1.5 text-xs text-amber-900">
            <div className="flex items-center gap-2 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Missing Data Notices & Estimations:</span>
            </div>
            <ul className="list-disc pl-5 space-y-1">
              {warnings.map((w, idx) => (
                <li key={idx} className="font-medium">
                  {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Steps 1, 2, 3 & 4 Input Controls Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Step 1 & 2: Location and Weather (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Step 1 Card: Farmer's Google Maps Location */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    1
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Step 1: Saved Farm Google Maps Location
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={handleLoadSavedLocation}
                  className="text-xs font-bold text-emerald-700 hover:underline"
                >
                  Reload Saved GPS
                </button>
              </div>

              {/* Village, District, State Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    Village / Town
                  </label>
                  <input
                    type="text"
                    value={village}
                    onChange={(e) => {
                      setVillage(e.target.value);
                      setFarmLocation(`${e.target.value}, ${district}, ${state}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    District
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => {
                      setDistrict(e.target.value);
                      setFarmLocation(`${village}, ${e.target.value}, ${state}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    value={state}
                    onChange={(e) => {
                      setState(e.target.value);
                      setFarmLocation(`${village}, ${district}, ${e.target.value}`);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Latitude and Longitude Coordinates */}
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-600" />
                  <span className="font-bold text-slate-700">GPS Coordinates:</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span>Lat: <strong>{farmCoords.lat.toFixed(4)}° N</strong></span>
                  <span>Lng: <strong>{farmCoords.lng.toFixed(4)}° E</strong></span>
                </div>
              </div>

              {/* Quick Regional Agricultural Presets */}
              <div className="pt-1">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                  Or select a verified agricultural region:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_LOCATIONS.map((preset) => (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => handleSelectPreset(preset)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                        district === preset.district
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-800'
                      }`}
                    >
                      {preset.district} ({preset.state.slice(0, 2)})
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Step 2 Card: Weather and Forecast Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    2
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Step 2: Weather & Forecast Information
                  </h3>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  {weatherData?.isLive ? '🟢 Open-Meteo Live API' : '🟡 Regional Benchmark'}
                </span>
              </div>

              {isLoadingWeather ? (
                <div className="py-6 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-emerald-600" />
                  <span>Connecting to Agro-Meteorological Station...</span>
                </div>
              ) : weatherData ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Temperature</span>
                    <strong className="text-lg font-black text-slate-900">{weatherData.temperature}°C</strong>
                    <span className="text-[10px] text-slate-400 block">{weatherData.tempMin}° - {weatherData.tempMax}°C</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Relative Humidity</span>
                    <strong className="text-lg font-black text-slate-900">{weatherData.humidity}%</strong>
                    <span className="text-[10px] text-slate-400 block">Atmospheric Moisture</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Precipitation</span>
                    <strong className="text-lg font-black text-slate-900">{weatherData.precipitation} mm</strong>
                    <span className="text-[10px] text-slate-400 block">{weatherData.rainfallCategory}</span>
                  </div>
                  <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200">
                    <span className="text-[10px] text-slate-500 block">Atmosphere</span>
                    <strong className="text-lg font-black text-slate-900 truncate block">{weatherData.condition}</strong>
                    <span className="text-[10px] text-emerald-700 font-bold block">Favorable Radiance</span>
                  </div>
                </div>
              ) : null}

              <div className="text-[11px] text-slate-500 flex items-center justify-between">
                <span>Agro-climate: <strong>{regionalSoilBenchmark.agroZone}</strong></span>
                <span className="text-emerald-700 font-bold">Auto-Synced</span>
              </div>
            </div>

          </div>

          {/* Step 3 & 4: Soil, Agronomy & Matching Engine (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Step 3 Card: Soil and Agricultural Information */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    3
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    Step 3: Soil & Agricultural Information
                  </h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">ICAR / NBSS&LUP Data</span>
              </div>

              {/* ICAR Regional Benchmark Callout */}
              <div className="p-3 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1 text-xs">
                <span className="font-black text-emerald-950 block">
                  Regional ICAR Soil Benchmark for {district}:
                </span>
                <p className="text-emerald-900 leading-relaxed text-[11px]">
                  Predominant Soil: <strong>{regionalSoilBenchmark.predominantSoil}</strong> • Typical pH: <strong>{regionalSoilBenchmark.baselinePhMin} - {regionalSoilBenchmark.baselinePhMax}</strong> • Organic Carbon: <strong>{regionalSoilBenchmark.organicCarbon}</strong>.
                </p>
              </div>

              {/* Farmer Verified Soil Type */}
              <div className="space-y-1">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <span>Farmer-Verified Soil Type:</span>
                  <span className="text-[10px] text-amber-700 font-bold">Required</span>
                </label>
                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                >
                  {AVAILABLE_SOIL_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.nameKn})
                    </option>
                  ))}
                </select>
              </div>

              {/* Soil pH with "If Available" Toggle */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Soil pH (from Soil Health Card):</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 font-bold">
                    <input
                      type="checkbox"
                      checked={isPhKnown}
                      onChange={(e) => setIsPhKnown(e.target.checked)}
                      className="accent-emerald-600 rounded"
                    />
                    <span>Tested pH Available</span>
                  </label>
                </div>

                {isPhKnown ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="4.5"
                        max="9.0"
                        step="0.1"
                        value={soilPh}
                        onChange={(e) => setSoilPh(e.target.value)}
                        className="flex-1 accent-emerald-600 cursor-pointer"
                      />
                      <input
                        type="number"
                        min="4.0"
                        max="9.5"
                        step="0.1"
                        value={soilPh}
                        onChange={(e) => setSoilPh(e.target.value)}
                        className="w-20 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span>4.5 (Acidic)</span>
                      <span>6.0 (Slightly Acidic)</span>
                      <span className="font-bold text-emerald-700">7.0 (Neutral)</span>
                      <span>8.0 (Alkaline)</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900">
                    Soil pH not provided. The algorithm will default to the regional ICAR benchmark (7.0) with reduced confidence.
                  </div>
                )}
              </div>

              {/* Water Availability & Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Water Availability
                  </label>
                  <select
                    value={availableWater}
                    onChange={(e) => setAvailableWater(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {WATER_AVAILABILITY_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-600 block">
                    Target Season
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {SEASONS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Land Size (Acres) */}
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <LandPlot className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Farmer Land Size:</span>
                  </label>
                  <span className="font-black text-emerald-800 text-sm">
                    {landSizeAcres} Acres (~{(landSizeAcres * 0.4047).toFixed(2)} Ha)
                  </span>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <input
                    type="range"
                    min="0.5"
                    max="25"
                    step="0.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(parseFloat(e.target.value) || 1)}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="0.5"
                    max="100"
                    step="0.5"
                    value={landSizeAcres}
                    onChange={(e) => setLandSizeAcres(parseFloat(e.target.value) || 1)}
                    className="w-16 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg font-bold text-xs"
                  />
                  <span className="text-xs text-slate-500 font-bold">Acres</span>
                </div>
              </div>

            </div>

            {/* Step 4: Comparison & Execution Card */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center justify-center">
                    4
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Step 4: Compare Conditions with Crop Catalog
                  </h3>
                </div>
                <span className="text-xs font-bold text-emerald-700">16 Crops Evaluated</span>
              </div>

              <button
                type="button"
                onClick={() => runCalculation()}
                disabled={isCalculating}
                className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
              >
                <Sprout className="w-4 h-4 text-emerald-200" />
                <span>{isCalculating ? 'Computing Crop Suitability & Land Economics...' : 'Compute Top 5 Recommendations →'}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Step 5: Recommendations Section Header & Toggle */}
        <div id="step-5-recommendations" className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-md bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                5
              </span>
              <Badge variant="emerald" icon={Award}>
                Step 5: Top Five Suitable Crops
              </Badge>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Land Scaled for {landSizeAcres} Acres
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Recommended Crops for {village}, {district}
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated across 5 agronomic dimensions • Weather: {weatherData?.temperature}°C • Soil: {soilType} • Water: {availableWater}
            </p>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              type="button"
              onClick={() => setResultsView('cards')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                resultsView === 'cards'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Sprout className="w-3.5 h-3.5" />
              <span>Ranked Cards</span>
            </button>
            <button
              type="button"
              onClick={() => setResultsView('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                resultsView === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>5-Crop Comparison Table</span>
            </button>
          </div>
        </div>

        {/* Step 5 Output Display */}
        {topCrops.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900">
              Incomplete Data or Extreme Soil Constraints
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please enter your farm location and select your soil type to run the 5-stage agronomy recommendation engine.
            </p>
          </div>
        ) : resultsView === 'cards' ? (
          <div className="space-y-6">
            {topCrops.map((crop, index) => {
              const isSaved = savedSuccessMap[crop.id];
              const rank = index + 1;

              return (
                <div
                  key={crop.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden hover:shadow-md transition duration-200"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12">
                    
                    {/* Left: Image, Variety, Suitability & Land Economics (4 Cols) */}
                    <div className="lg:col-span-4 p-5 sm:p-6 bg-slate-50/70 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        {/* Rank Badge & Score */}
                        <div className="flex items-center justify-between">
                          <span className="w-8 h-8 rounded-xl bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
                            #{rank}
                          </span>
                          <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-200 rounded-full">
                            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-black text-sm text-emerald-800">
                              {crop.totalScore}%
                            </span>
                            <span className="text-[10px] font-bold text-emerald-700">Match</span>
                          </div>
                        </div>

                        {/* Crop Image */}
                        <div className="relative rounded-2xl overflow-hidden aspect-video sm:aspect-[16/10] bg-slate-200">
                          <img
                            src={crop.image}
                            alt={crop.name}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold">
                            {crop.category}
                          </div>
                          <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur-sm text-slate-800 text-[10px] font-bold">
                            {crop.variety}
                          </div>
                        </div>

                        {/* Title & Regional Names */}
                        <div>
                          <h3 className="text-lg font-black text-slate-900 leading-tight">
                            {crop.name}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mt-0.5">
                            <span className="text-emerald-800 font-bold">{crop.localNameKn}</span>
                            <span>•</span>
                            <span className="text-slate-600">{crop.localNameHi}</span>
                          </div>
                        </div>
                      </div>

                      {/* Land Size Scaled Yield & Financial Margins */}
                      <div className="p-3.5 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="text-[10px] font-extrabold uppercase text-slate-400 border-b border-slate-100 pb-1">
                          Projected for Your {crop.landSizeAcres} Acres:
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Total Harvest Yield:</span>
                          <strong className="text-slate-900 font-black">{crop.scaledYieldRange}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Net Estimated Profit:</span>
                          <strong className="text-emerald-700 font-black">{crop.scaledProfitRange}</strong>
                        </div>
                      </div>

                      {/* Bookmark Button */}
                      <button
                        type="button"
                        onClick={() => handleBookmarkCrop(crop)}
                        className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                          isSaved
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {isSaved ? <BookmarkCheck className="w-3.5 h-3.5 text-white" /> : <Bookmark className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{isSaved ? 'Saved to Offline Storage' : 'Save for Offline Field Access'}</span>
                      </button>

                    </div>

                    {/* Right: Requirements, Reasons & Precautions (8 Cols) */}
                    <div className="lg:col-span-8 p-5 sm:p-6 space-y-5">
                      
                      {/* Transparent 100-Point Breakdown */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold uppercase tracking-wide text-slate-500">
                            Transparent Rule Breakdown
                          </span>
                          <span className="font-black text-slate-800">
                            {crop.totalScore} / 100 Points
                          </span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-[11px]">
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Soil Texture</span>
                            <strong className="text-emerald-700 font-black">{crop.scoreBreakdown.soilScore} / 25</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Soil pH</span>
                            <strong className="text-emerald-700 font-black">{crop.scoreBreakdown.phScore} / 20</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Season</span>
                            <strong className="text-emerald-700 font-black">{crop.scoreBreakdown.seasonScore} / 25</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Water</span>
                            <strong className="text-emerald-700 font-black">{crop.scoreBreakdown.waterScore} / 15</strong>
                          </div>
                          <div className="p-2 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-slate-400 block text-[10px]">Weather</span>
                            <strong className="text-emerald-700 font-black">{crop.scoreBreakdown.weatherScore} / 15</strong>
                          </div>
                        </div>
                      </div>

                      {/* Reasons for Recommendation */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 block">
                          Reasons for Recommendation:
                        </span>
                        <div className="space-y-1 text-xs">
                          {crop.reasons.map((r, rIdx) => (
                            <div
                              key={rIdx}
                              className={`p-2.5 rounded-xl flex items-start gap-2 ${
                                r.type === 'positive'
                                  ? 'bg-emerald-50 text-emerald-950 border border-emerald-200/60'
                                  : r.type === 'caution'
                                  ? 'bg-amber-50 text-amber-950 border border-amber-200/60'
                                  : 'bg-slate-50 text-slate-800 border border-slate-200'
                              }`}
                            >
                              <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                                r.type === 'positive' ? 'text-emerald-600' : 'text-amber-600'
                              }`} />
                              <span className="font-medium leading-relaxed">{r.text}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* 4 Essential Crop Requirements */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                        
                        {/* Soil Requirements */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                            <Layers className="w-4 h-4 text-emerald-600" />
                            <span>Soil Requirements & pH</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {crop.soilRequirements}
                          </p>
                          <div className="text-[10px] text-emerald-800 font-bold pt-1">
                            Ideal pH: {crop.idealPhMin} - {crop.idealPhMax}
                          </div>
                        </div>

                        {/* Weather Compatibility */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                            <CloudSun className="w-4 h-4 text-amber-600" />
                            <span>Weather Compatibility</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {crop.weatherDescription}
                          </p>
                          <div className="text-[10px] text-amber-800 font-bold pt-1">
                            Optimal Thermal: {crop.optimalTempMin}°C - {crop.optimalTempMax}°C
                          </div>
                        </div>

                        {/* Growing Duration & Season */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Growing Duration</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            <strong>{crop.growingDuration}</strong> from sowing to physiological harvest maturity.
                          </p>
                          <div className="text-[10px] text-purple-800 font-bold pt-1">
                            Suitable Season: {crop.primarySeasons.join(', ')}
                          </div>
                        </div>

                        {/* Water Requirements */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                            <Droplets className="w-4 h-4 text-blue-600" />
                            <span>Water Requirements</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {crop.waterDescription}
                          </p>
                          <div className="text-[10px] text-blue-800 font-bold pt-1">
                            Required Quantity: {crop.waterRequirement}
                          </div>
                        </div>

                      </div>

                      {/* Important Precautions */}
                      <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-amber-950 font-extrabold text-xs">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>Important Agronomic Precautions for {crop.name}:</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-amber-950 pl-4 list-disc">
                          {crop.precautions.map((prec, pIdx) => (
                            <li key={pIdx} className="leading-relaxed font-medium">
                              {prec}
                            </li>
                          ))}
                        </ul>
                      </div>

                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Side-by-Side Comparison Section */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm space-y-4 p-4 sm:p-6">
            <div className="border-b border-slate-100 pb-3">
              <h3 className="text-base font-black text-slate-900">
                Side-by-Side Comparison Matrix (Top 5 Crops)
              </h3>
              <p className="text-xs text-slate-500">
                Compare suitability, duration, water needs, and financial earnings scaled for your {landSizeAcres} Acres.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Rank</th>
                    <th className="py-4 px-4">Crop Name</th>
                    <th className="py-4 px-4">Suitability</th>
                    <th className="py-4 px-4">Suitable Season</th>
                    <th className="py-4 px-4">Growing Duration</th>
                    <th className="py-4 px-4">Water Needs</th>
                    <th className="py-4 px-4">Optimal Soil & pH</th>
                    <th className="py-4 px-4">Harvest for {landSizeAcres} Acres</th>
                    <th className="py-4 px-4">Net Profit for {landSizeAcres} Acres</th>
                    <th className="py-4 px-4">Key Precaution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topCrops.map((c, idx) => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-black text-slate-900">
                        #{idx + 1}
                      </td>
                      <td className="py-3 px-4">
                        <strong className="font-extrabold text-slate-900 block">{c.name}</strong>
                        <span className="text-[10px] text-slate-500">{c.variety}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800">
                          {c.totalScore}%
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">
                        {c.primarySeasons.join(', ')}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {c.growingDuration}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {c.waterLevel}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-slate-600">
                        <span>{c.optimalSoils[0]}</span>
                        <span className="text-[10px] text-emerald-700 block font-mono">pH {c.idealPhMin}-{c.idealPhMax}</span>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-black">
                        {c.scaledYieldRange}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-black">
                        {c.scaledProfitRange}
                      </td>
                      <td className="py-3 px-4 text-[11px] text-amber-900 max-w-[200px]">
                        {c.precautions[0]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Formula Explanation Modal */}
        {showFormulaModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Transparent 100-Point Recommendation Formula
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
                <p>
                  KrishiMitra executes an auditable, deterministic agronomy scoring algorithm directly in your browser. Every crop accumulates up to <strong>100 points</strong> across 5 rule modules:
                </p>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <strong className="text-emerald-800 block">1. Soil Texture Compatibility (Max 25 pts)</strong>
                  <p className="text-[11px] text-slate-600">
                    Optimal soil match awards <strong>25 pts</strong>; tolerated secondary soil texture awards <strong>16 pts</strong>; incompatible soil (e.g. heavy clay for groundnut pegging) awards <strong>6 pts</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <strong className="text-emerald-800 block">2. Sowing Season & Phenology (Max 25 pts)</strong>
                  <p className="text-[11px] text-slate-600">
                    Matches current planting calendar. Primary season awards <strong>25 pts</strong>; secondary or transition season awards <strong>16 pts</strong>; off-season planting awards <strong>4 pts</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <strong className="text-emerald-800 block">3. Soil pH Nutrient Absorption (Max 20 pts)</strong>
                  <p className="text-[11px] text-slate-600">
                    If soil pH is inside crop's ideal range: <strong>20 pts</strong>. Within ±0.6 tolerance: <strong>13 pts</strong>. Deviant pH requiring amendment: <strong>4 pts</strong>.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <strong className="text-emerald-800 block">4. Water Availability Feasibility (Max 15 pts)</strong>
                  <p className="text-[11px] text-slate-600">
                    Abundant water for high-demand crops or drought-resilient crops on low water awards <strong>15 pts</strong>. High water crops on rainfed land suffer heavy deductions.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                  <strong className="text-emerald-800 block">5. Weather & Temperature Match (Max 15 pts)</strong>
                  <p className="text-[11px] text-slate-600">
                    Temperature within crop vegetative optimum: <strong>15 pts</strong>. Within ±4°C buffer: <strong>10 pts</strong>. Thermal stress: <strong>4 pts</strong>.
                  </p>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowFormulaModal(false)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 7. ML Model Integration Schema & Inspector Modal */}
        {showMLModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Machine Learning Model Integration Contract
                    </h3>
                    <p className="text-xs text-slate-500">
                      Frontend is pre-wired to integrate with external ML crop recommendation engines.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowMLModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                  <span className="font-bold text-emerald-950 block">ML Endpoint Architecture:</span>
                  <p className="text-emerald-900 leading-relaxed text-[11px]">
                    The frontend standardizes geographic coordinates, weather features, soil parameters, and land size into the standard Scikit-Learn / PyTorch crop recommendation schema below:
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="font-mono text-[11px] font-bold text-slate-600 block">
                    Generated JSON Payload Contract for Current Farm:
                  </span>
                  <pre className="p-4 bg-slate-900 text-emerald-400 rounded-2xl font-mono text-[11px] overflow-x-auto">
                    {JSON.stringify(mlPayload, null, 2)}
                  </pre>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-[11px]">
                  <span className="font-bold text-slate-800 block">Feature Weights Expected by Random Forest / XGBoost Model:</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
                    <div className="p-2 bg-white rounded-lg border">Rainfall: 26%</div>
                    <div className="p-2 bg-white rounded-lg border">Soil Type: 24%</div>
                    <div className="p-2 bg-white rounded-lg border">Soil pH: 20%</div>
                    <div className="p-2 bg-white rounded-lg border">Temperature: 18%</div>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center text-xs">
                <span className="text-slate-500">Target Endpoint: <code>/api/v1/recommend-crop-ml</code></span>
                <button
                  type="button"
                  onClick={() => setShowMLModal(false)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-sm"
                >
                  Close Inspector
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
