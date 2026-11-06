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
  HelpCircle
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
  detectCurrentSeason,
  fetchWeatherForLocation,
  calculateTopFiveCrops,
  validateRecommendationInputs
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
          text: `${parsed.village || 'Raichur'}, ${parsed.district || 'Raichur'}, ${parsed.state || 'Karnataka'}`,
          lat: parsed.lat || 16.2160,
          lng: parsed.lng || 77.3566
        };
      }
    } catch {
      // ignore
    }
    if (activeUser?.village) {
      return {
        text: `${activeUser.village}, ${activeUser.district || 'Raichur'}, ${activeUser.state || 'Karnataka'}`,
        lat: 16.2160,
        lng: 77.3566
      };
    }
    return {
      text: 'Sindhanur, Raichur, Karnataka',
      lat: 16.2160,
      lng: 77.3566
    };
  }, [activeUser]);

  // Form State
  const [farmLocation, setFarmLocation] = useState(initialLocation.text);
  const [farmCoords, setFarmCoords] = useState({ lat: initialLocation.lat, lng: initialLocation.lng });
  const [soilType, setSoilType] = useState('Black / Regur Soil (Clayey)');
  const [soilPh, setSoilPh] = useState(7.2);
  const [availableWater, setAvailableWater] = useState('Moderate');
  const [season, setSeason] = useState(() => detectCurrentSeason());
  const [landSizeAcres, setLandSizeAcres] = useState(3.0);

  // Weather API state
  const [weatherData, setWeatherData] = useState(null);
  const [isLoadingWeather, setIsLoadingWeather] = useState(false);

  // View state: 'cards' | 'table'
  const [resultsView, setResultsView] = useState('cards');
  const [showFormulaModal, setShowFormulaModal] = useState(false);

  // Validation Warnings
  const [warnings, setWarnings] = useState([]);
  const [touched, setTouched] = useState(false);

  // Calculation Results
  const [recommendationResult, setRecommendationResult] = useState(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Fetch weather data when coordinates change
  useEffect(() => {
    let isMounted = true;
    async function loadWeather() {
      setIsLoadingWeather(true);
      const data = await fetchWeatherForLocation(farmCoords.lat, farmCoords.lng, farmLocation);
      if (isMounted) {
        setWeatherData(data);
        setIsLoadingWeather(false);
      }
    }
    loadWeather();
    return () => { isMounted = false; };
  }, [farmCoords.lat, farmCoords.lng, farmLocation]);

  // Execute recommendation calculation
  const runCalculation = (tempOverride) => {
    setTouched(true);
    setIsCalculating(true);

    const tempVal = tempOverride !== undefined
      ? tempOverride
      : (weatherData?.temperature ?? 26);

    const res = calculateTopFiveCrops({
      location: farmLocation,
      soilType,
      soilPh,
      availableWater,
      season,
      temperature: tempVal
    });

    setWarnings(res.warnings);
    setRecommendationResult(res);

    setTimeout(() => {
      setIsCalculating(false);
    }, 300);
  };

  // Run calculation whenever primary parameters change or weather loads
  useEffect(() => {
    if (weatherData) {
      runCalculation(weatherData.temperature);
    }
  }, [soilType, soilPh, availableWater, season, farmLocation, weatherData]);

  // Handle Preset Location selection
  const handleSelectPreset = (preset) => {
    setFarmLocation(preset.name);
    setFarmCoords({ lat: preset.lat, lng: preset.lng });
    setSoilType(preset.defaultSoil);
    setSoilPh(preset.defaultPh);
    setAvailableWater(preset.defaultWater);
    setSeason(preset.defaultSeason);
  };

  // pH description helper
  const getPhRating = (val) => {
    const num = parseFloat(val);
    if (num < 5.5) return { label: 'Strongly Acidic', color: 'text-red-700 bg-red-50 border-red-200', advice: 'Needs agricultural lime (CaCO3) amendment' };
    if (num < 6.5) return { label: 'Slightly Acidic', color: 'text-amber-700 bg-amber-50 border-amber-200', advice: 'Ideal for Ragi, Tea, Potato, and Paddy' };
    if (num <= 7.5) return { label: 'Optimal / Neutral', color: 'text-emerald-800 bg-emerald-50 border-emerald-200', advice: 'Ideal for maximum nutrient uptake for most crops' };
    if (num <= 8.5) return { label: 'Moderately Alkaline', color: 'text-blue-800 bg-blue-50 border-blue-200', advice: 'Calcareous black soil; suitable for Gram, Mustard, Cotton' };
    return { label: 'Strongly Alkaline / Sodic', color: 'text-purple-800 bg-purple-50 border-purple-200', advice: 'High sodium risk; apply Gypsum before sowing' };
  };

  const phStatus = getPhRating(soilPh);

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
      projectedYield: crop.estYieldPerAcre,
      savedAt: new Date().toLocaleDateString()
    });

    setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: true }));
    setTimeout(() => {
      setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: false }));
    }, 3000);
  };

  const topCrops = recommendationResult?.topCrops || [];

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* 1. Top Navigation Bar */}
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
                  Smart Crop Recommendation System
                </h1>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {language === 'kn' ? 'ಪಾರದರ್ಶಕ ಸ್ಥಳೀಯ ಬೆಳೆ ಶಿಫಾರಸು ಎಂಜಿನ್' : language === 'hi' ? 'पारदर्शी नियम-आधारित फसल अनुशंसा प्रणाली' : 'Rule-Based Agronomy Engine • Top 5 Suitable Crops'}
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">

        {/* Hero Header Banner */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-700/50">
          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-200 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>100% Client-Side Rule Engine • No AI Server or Backend Needed</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-white">
              Data-Driven Crop Recommendations for Your Farm
            </h2>
            <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
              Calculates your <strong>Top 5 Suitable Crops</strong> by evaluating your selected farm location, live or regional weather data, farmer-entered soil type, laboratory soil pH, water infrastructure, and agricultural season.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3 text-xs">
              <button
                type="button"
                onClick={() => setShowFormulaModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 font-bold border border-white/20 transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-emerald-300" />
                <span>View 100-Point Formula Logic</span>
              </button>
              <span className="text-emerald-300/80">•</span>
              <span className="text-emerald-200">
                Current Season: <strong className="text-white underline decoration-emerald-400">{season}</strong>
              </span>
            </div>
          </div>

          <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden md:block">
            <Sprout className="w-64 h-64 text-white" />
          </div>
        </div>

        {/* ⚠️ CRITICAL NOTICE: Google Maps does NOT provide Soil Quality */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-950">
            <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
              <span>Important Note: Google Maps Does NOT Provide Soil Quality</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-200 rounded font-black text-amber-900">
                Farmer Verification Required
              </span>
            </h3>
            <p className="leading-relaxed">
              Geographic coordinates and map boundaries identify regional agro-climatic zones and weather forecasts, but <strong>Google Maps cannot measure physical soil texture, nutrient reserves, or soil pH</strong>. Please enter the verified soil type and pH from your official <strong>Soil Health Card (ಮಣ್ಣು ಆರೋಗ್ಯ ಕಾರ್ಡ್)</strong> or local laboratory testing for reliable recommendations.
            </p>
          </div>
        </div>

        {/* Missing Information Warnings Banner */}
        {warnings.length > 0 && touched && (
          <div className="p-4 bg-red-50 border-2 border-red-300 rounded-2xl space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>Please Resolve the Following Missing or Incomplete Information:</span>
            </div>
            <ul className="list-disc pl-6 space-y-1 text-xs text-red-800">
              {warnings.map((w, idx) => (
                <li key={idx} className="font-medium">
                  {w.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 3. Input Form Grid (Location, Weather, Soil Type, pH, Water, Season) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Form Controls (7 Cols) */}
          <div className="lg:col-span-7 space-y-5">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-5">
              
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Farm Environmental & Soil Parameters
                  </h3>
                </div>
                <span className="text-xs font-bold text-slate-400">All fields client-side</span>
              </div>

              {/* 1. Location Selection & Presets */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                    <span>1. Selected Farm Location</span>
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Lat: {farmCoords.lat.toFixed(2)}, Lng: {farmCoords.lng.toFixed(2)}
                  </span>
                </div>

                <input
                  type="text"
                  value={farmLocation}
                  onChange={(e) => setFarmLocation(e.target.value)}
                  placeholder="e.g. Sindhanur, Raichur, Karnataka"
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                />

                {/* Quick Presets */}
                <div className="pt-1">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block mb-1.5">
                    Quick Regional Presets:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_LOCATIONS.map((preset) => (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleSelectPreset(preset)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition border ${
                          farmLocation.includes(preset.district)
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

              {/* 2. Weather Context (Auto-Loaded) */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CloudSun className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wide">
                      2. Weather Context for Location
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {weatherData?.isLive ? '🟢 Live Open-Meteo' : '🟡 Regional Benchmark'}
                  </span>
                </div>

                {isLoadingWeather ? (
                  <div className="py-2 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Retrieving agro-meteorological station data...</span>
                  </div>
                ) : weatherData ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Temperature</span>
                      <strong className="text-sm font-black text-slate-900">{weatherData.temperature}°C</strong>
                      <span className="text-[10px] text-slate-400 block">{weatherData.tempMin}° - {weatherData.tempMax}°C</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Relative Humidity</span>
                      <strong className="text-sm font-black text-slate-900">{weatherData.humidity}%</strong>
                      <span className="text-[10px] text-slate-400 block">Moisture Index</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Rainfall / Precip</span>
                      <strong className="text-sm font-black text-slate-900">{weatherData.precipitation} mm</strong>
                      <span className="text-[10px] text-slate-400 block">{weatherData.rainfallCategory}</span>
                    </div>
                    <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-500 block">Condition</span>
                      <strong className="text-sm font-black text-slate-900 truncate block">{weatherData.condition}</strong>
                      <span className="text-[10px] text-emerald-700 font-bold block">Solar Radiance</span>
                    </div>
                  </div>
                ) : null}
              </div>

              {/* 3. Farmer-Entered Soil Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-emerald-600" />
                    <span>3. Farmer-Entered Soil Type</span>
                  </div>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                    Required • Not from Maps
                  </span>
                </label>

                <select
                  value={soilType}
                  onChange={(e) => setSoilType(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                >
                  {AVAILABLE_SOIL_TYPES.map((st) => (
                    <option key={st.id} value={st.id}>
                      {st.name} — {st.nameKn}
                    </option>
                  ))}
                </select>

                <p className="text-[11px] text-slate-500">
                  {AVAILABLE_SOIL_TYPES.find(st => st.id === soilType)?.description}
                </p>
              </div>

              {/* 4. Soil pH Entered by Farmer */}
              <div className="space-y-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                    <span>4. Soil pH (Acidity / Alkalinity)</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black px-2.5 py-0.5 rounded-full border ${phStatus.color}`}>
                      pH {Number(soilPh).toFixed(1)} • {phStatus.label}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                    className="flex-1 accent-emerald-600 cursor-pointer"
                  />
                  <input
                    type="number"
                    min="4.0"
                    max="9.5"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(parseFloat(e.target.value) || 7.0)}
                    className="w-20 px-2 py-1 text-center bg-white border border-slate-300 rounded-lg font-black text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>4.5 (Acidic)</span>
                  <span>6.0 (Slightly Acidic)</span>
                  <span className="font-bold text-emerald-700">7.0 (Neutral)</span>
                  <span>8.0 (Alkaline)</span>
                  <span>9.0 (Sodic)</span>
                </div>
                <p className="text-[11px] text-slate-600 font-medium">
                  {phStatus.advice}
                </p>
              </div>

              {/* 5. Water Availability & 6. Season */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Water Availability */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Droplets className="w-3.5 h-3.5 text-blue-600" />
                    <span>5. Water Availability</span>
                  </label>
                  <select
                    value={availableWater}
                    onChange={(e) => setAvailableWater(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  >
                    {WATER_AVAILABILITY_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {WATER_AVAILABILITY_OPTIONS.find(w => w.id === availableWater)?.description}
                  </p>
                </div>

                {/* Sowing Season */}
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-amber-600" />
                    <span>6. Current Season</span>
                  </label>
                  <select
                    value={season}
                    onChange={(e) => setSeason(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition"
                  >
                    {SEASONS_LIST.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.months})
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    {SEASONS_LIST.find(s => s.id === season)?.description}
                  </p>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => runCalculation()}
                  disabled={isCalculating}
                  className="flex-1 py-3 px-5 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-700/25 flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
                >
                  <Sprout className="w-4 h-4 text-emerald-200" />
                  <span>{isCalculating ? 'Computing Suitability Scores...' : 'Recalculate Top 5 Crops'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSelectPreset(PRESET_LOCATIONS[0]);
                  }}
                  className="py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition"
                >
                  Reset Defaults
                </button>
              </div>

            </div>
          </div>

          {/* Right Column: Rule Engine Summary Card (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            
            <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Transparent Scoring Weights
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  100 Points Total
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>1. Soil Texture Compatibility</span>
                    <span className="text-emerald-700 font-black">25 Pts (25%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400">Optimal soil aeration, drainage & root penetration.</span>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>2. Season & Phenology Alignment</span>
                    <span className="text-emerald-700 font-black">25 Pts (25%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '25%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400">Kharif, Rabi, or Zaid sowing window adherence.</span>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>3. Soil pH Nutrient Absorption</span>
                    <span className="text-emerald-700 font-black">20 Pts (20%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500 rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400">Checks if soil pH falls inside crop's optimal band.</span>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>4. Water Availability Feasibility</span>
                    <span className="text-emerald-700 font-black">15 Pts (15%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500 rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400">Canal vs Borewell vs Dryland Rainfed match.</span>
                </div>

                <div>
                  <div className="flex justify-between font-bold text-slate-700 mb-1">
                    <span>5. Weather & Temperature Match</span>
                    <span className="text-emerald-700 font-black">15 Pts (15%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full" style={{ width: '15%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400">Thermal vegetative requirements and sunshine.</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
                <span>Calculated locally in browser</span>
                <span className="font-bold text-emerald-800">Deterministic & Auditable</span>
              </div>
            </div>

            {/* Quick Fact / Agronomy Tip */}
            <div className="p-4 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-1">
                <span className="font-extrabold block">Farmer Tip: Crop Rotation</span>
                <p className="leading-relaxed">
                  Rotating nitrogen-exhausting cereals (Paddy/Wheat) with deep-rooted pulses (Chickpea/Soybean/Ragi) restores natural soil organic carbon and breaks pest life cycles.
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* 4. Recommendation Results Header & View Toggle */}
        <div className="pt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="emerald" icon={Award}>
                Recommended Output
              </Badge>
              <span className="text-xs font-extrabold text-slate-500">
                Top 5 Suitable Crops (Ranked by Score)
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
              Top 5 Crops for {farmLocation.split(',')[0]}
            </h2>
            <p className="text-xs text-slate-500">
              Evaluated for {soilType} • pH {Number(soilPh).toFixed(1)} • {availableWater} Water • {season} Season
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
              <span>Card View</span>
            </button>
            <button
              type="button"
              onClick={() => setResultsView('table')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                resultsView === 'table'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Comparison Table</span>
            </button>
          </div>
        </div>

        {/* 5. Results Presentation (Cards or Table) */}
        {topCrops.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-900">
              No crops match the current extreme constraints
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Please verify your soil pH or adjust water availability to view suitable alternative crop varieties.
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
                    
                    {/* Left: Crop Image & Key Metrics (4 Cols) */}
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
                            <span className="text-[10px] font-bold text-emerald-700">Suitability</span>
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

                      {/* Yield & Economics */}
                      <div className="p-3 bg-white rounded-2xl border border-slate-200 space-y-2 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Projected Yield:</span>
                          <strong className="text-slate-900 font-bold">{crop.estYieldPerAcre} / Acre</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Est. Profit Margin:</span>
                          <strong className="text-emerald-700 font-black">{crop.estProfitPerAcre} / Acre</strong>
                        </div>
                      </div>

                      {/* Save locally */}
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
                        <span>{isSaved ? 'Saved to Offline Storage' : 'Save for Offline Access'}</span>
                      </button>

                    </div>

                    {/* Right: Requirements, Compatibility & Reasons (8 Cols) */}
                    <div className="lg:col-span-8 p-5 sm:p-6 space-y-5">
                      
                      {/* 1. Score Breakdown Bars */}
                      <div>
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="font-extrabold uppercase tracking-wide text-slate-500">
                            Transparent Rule-Based Point Breakdown
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

                      {/* 2. Specific Agronomic Reasons */}
                      <div className="space-y-1.5">
                        <span className="text-xs font-extrabold uppercase tracking-wide text-slate-500 block">
                          Agronomic Match Reasons:
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

                      {/* 3. 4 Essential Requirement Cards (Soil, Weather, Duration, Water) */}
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
                            Ideal pH: {crop.idealPhMin} - {crop.idealPhMax} (Tolerance: ±{crop.phBuffer})
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

                        {/* Growing Duration */}
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-slate-900 font-extrabold">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span>Growing Duration</span>
                          </div>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            <strong>{crop.growingDuration}</strong> from sowing to physiological maturity. Fits within standard seasonal rotations.
                          </p>
                          <div className="text-[10px] text-purple-800 font-bold pt-1">
                            Primary Sowing: {crop.primarySeasons.join(', ')}
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
                            Quantity: {crop.waterRequirement}
                          </div>
                        </div>

                      </div>

                      {/* 4. Actionable Farming Tips */}
                      <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-emerald-950 font-extrabold text-xs">
                          <Lightbulb className="w-4 h-4 text-emerald-600" />
                          <span>Key Agronomic Recommendations for {crop.name}:</span>
                        </div>
                        <ul className="space-y-1 text-[11px] text-emerald-900 pl-4 list-disc">
                          {crop.keyFarmingTips.map((tip, tIdx) => (
                            <li key={tIdx} className="leading-relaxed">
                              {tip}
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
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 font-extrabold uppercase border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-4 px-4">Rank</th>
                    <th className="py-4 px-4">Crop Name</th>
                    <th className="py-4 px-4">Suitability</th>
                    <th className="py-4 px-4">Season</th>
                    <th className="py-4 px-4">Soil Match</th>
                    <th className="py-4 px-4">pH Band</th>
                    <th className="py-4 px-4">Duration</th>
                    <th className="py-4 px-4">Water Needs</th>
                    <th className="py-4 px-4">Yield / Acre</th>
                    <th className="py-4 px-4">Est. Profit</th>
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
                      <td className="py-3 px-4 text-[11px] text-slate-600 max-w-[150px] truncate">
                        {c.optimalSoils[0]}
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px]">
                        {c.idealPhMin} - {c.idealPhMax}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {c.growingDuration}
                      </td>
                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {c.waterLevel}
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-bold">
                        {c.estYieldPerAcre}
                      </td>
                      <td className="py-3 px-4 text-emerald-700 font-black">
                        {c.estProfitPerAcre}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 6. Formula Explanation Modal / Accordion */}
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
                  KrishiMitra executes an auditable, deterministic agronomy scoring algorithm directly in your browser. Every crop starts at 0 points and accumulates up to <strong>100 points</strong> based on 5 rule modules:
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
                  <strong className="text-emerald-800 block">3. Soil pH Compatibility (Max 20 pts)</strong>
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

      </main>

    </div>
  );
}
