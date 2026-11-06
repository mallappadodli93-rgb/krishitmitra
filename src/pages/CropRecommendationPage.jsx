import React, { useState, useEffect } from 'react';
import {
  Sprout,
  Sparkles,
  MapPin,
  Layers,
  Droplets,
  Thermometer,
  CloudRain,
  LandPlot,
  ArrowRight,
  ArrowLeft,
  Calendar,
  Clock,
  CheckCircle2,
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
  ChevronDown
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getActiveUser } from '../utils/authStorage';
import { useOffline } from '../context/OfflineContext';
import { useLanguage } from '../context/LanguageContext';

// Realistic Crop Knowledge Database for Mock JavaScript Recommendation Logic
const CROPS_DATABASE = {
  wheat: {
    id: 'wheat-hd3086',
    name: 'Wheat (Gehun / गेहूं - HD-3086)',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Alluvial Loam & Well-Drained Medium Black Soil',
    suitableSeason: 'Rabi (Winter / रबी)',
    waterRequirement: 'Moderate (4-5 irrigations at critical stages)',
    growingDuration: '115 - 125 Days',
    idealPh: '6.0 - 7.5 (Neutral)',
    estYieldPerAcre: '20 - 24 Quintals',
    estProfitPerAcre: '₹52,000 - ₹65,000',
    matchScore: '98%',
    farmingTips: [
      'Optimal sowing window is Nov 1 to Nov 25. Avoid delayed sowing past Dec 1.',
      'Treat seeds with Carboxin 37.5% + Thiram 37.5% (Vitavax) @ 2.5 g/kg seed to prevent loose smut.',
      'First irrigation at Crown Root Initiation (CRI) stage (21 DAS) is mandatory; apply 30 kg Nitrogen top-dressing immediately after.'
    ]
  },
  mustard: {
    id: 'mustard-pusabold',
    name: 'Mustard (Sarson / सरसों - Pusa Bold)',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Sandy Loam to Heavy Clayey Loam',
    suitableSeason: 'Rabi (Winter / रबी)',
    waterRequirement: 'Low to Medium (2 light irrigations)',
    growingDuration: '105 - 115 Days',
    idealPh: '6.0 - 7.8',
    estYieldPerAcre: '8 - 11 Quintals',
    estProfitPerAcre: '₹44,000 - ₹56,000',
    matchScore: '95%',
    farmingTips: [
      'Maintain 30x10 cm plant geometry by thinning seedlings 15-20 days after sowing.',
      'Apply 20 kg Elemental Sulfur per acre as basal dose to enhance grain oil content by 2.5-3%.',
      'Spray cold-pressed neem oil (1500 ppm @ 5 ml/L) early morning if aphid count exceeds threshold.'
    ]
  },
  gram: {
    id: 'gram-chana',
    name: 'Chickpea / Gram (Chana / चना - JG-14)',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Medium to Deep Black (Regur) Soil',
    suitableSeason: 'Rabi (Post-Monsoon / रबी)',
    waterRequirement: 'Low (Deep taproot system; rainfed or 1-2 irrigations)',
    growingDuration: '100 - 110 Days',
    idealPh: '6.5 - 8.0',
    estYieldPerAcre: '9 - 12 Quintals',
    estProfitPerAcre: '₹48,000 - ₹62,000',
    matchScore: '94%',
    farmingTips: [
      'Inoculate seeds with Rhizobium leguminosarum and PSB culture to fix 35 kg nitrogen per hectare naturally.',
      'Never irrigate at active flowering stage, which causes sudden flower drop and vegetative overgrowth.',
      'Install 40 T-shaped bird perches per acre for natural biocontrol of Helicoverpa pod borer larvae.'
    ]
  },
  paddy: {
    id: 'paddy-basmati',
    name: 'Basmati Paddy (Dhan / धान - Pusa 1121)',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Clayey Loam & Deep Alluvial Soil',
    suitableSeason: 'Kharif (Monsoon / खरीफ)',
    waterRequirement: 'High (Frequent standing water; 1200-1500 mm)',
    growingDuration: '135 - 145 Days',
    idealPh: '5.5 - 7.2',
    estYieldPerAcre: '18 - 22 Quintals',
    estProfitPerAcre: '₹70,000 - ₹88,000',
    matchScore: '97%',
    farmingTips: [
      'Transplant 22-25 day old seedlings at 20x15 cm spacing with 2 seedlings per hill.',
      'Adopt Alternate Wetting and Drying (AWD) irrigation to save 25% water without yield reduction.',
      'Apply Zinc Sulfate (21%) @ 10 kg/acre as basal dose to protect against Khaira deficiency.'
    ]
  },
  cotton: {
    id: 'cotton-shankar',
    name: 'Cotton (Kapas / कपास - Bt Cotton)',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Deep Black Cotton Soil (Regur)',
    suitableSeason: 'Kharif (Monsoon / खरीफ)',
    waterRequirement: 'Moderate (600 - 800 mm with drainage)',
    growingDuration: '150 - 170 Days',
    idealPh: '6.5 - 8.2',
    estYieldPerAcre: '12 - 15 Quintals',
    estProfitPerAcre: '₹62,000 - ₹82,000',
    matchScore: '96%',
    farmingTips: [
      'Maintain wide spacing (90x60 cm or 120x45 cm) for adequate air circulation inside canopy.',
      'Install yellow sticky traps (10/acre) and pheromone traps to monitor whitefly and pink bollworm.',
      'Apply magnesium sulfate foliar spray (1%) at flowering to prevent leaf reddening (Lalya).'
    ]
  },
  soybean: {
    id: 'soybean-js335',
    name: 'Soybean (सोयाबीन - JS-9560)',
    image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Well-Drained Black & Loamy Soil',
    suitableSeason: 'Kharif (Monsoon / खरीफ)',
    waterRequirement: 'Moderate (Rainfed; 550 - 700 mm)',
    growingDuration: '85 - 95 Days',
    idealPh: '6.0 - 7.5',
    estYieldPerAcre: '10 - 13 Quintals',
    estProfitPerAcre: '₹46,000 - ₹58,000',
    matchScore: '93%',
    farmingTips: [
      'Sow when at least 75-100 mm monsoon rainfall has soaked the top 15 cm soil layer.',
      'Use broad bed furrow (BBF) or ridge-and-furrow planting for drainage during heavy rains.',
      'Spray chlorantraniliprole 18.5% SC @ 0.3 ml/L if semilooper or girdle beetle crosses threshold.'
    ]
  },
  groundnut: {
    id: 'groundnut-k6',
    name: 'Groundnut / Peanut (Mungfali / मूंगफली - Kadiri-6)',
    image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&auto=format&fit=crop&q=80',
    suitableSoil: 'Sandy Loam & Red Soil with loose texture',
    suitableSeason: 'Kharif / Zaid Summer',
    waterRequirement: 'Moderate (500 - 600 mm)',
    growingDuration: '105 - 115 Days',
    idealPh: '6.0 - 7.2',
    estYieldPerAcre: '12 - 15 Quintals',
    estProfitPerAcre: '₹50,000 - ₹64,000',
    matchScore: '95%',
    farmingTips: [
      'Loose friable sandy loam soil is critical for unhindered gynophore peg entry.',
      'Apply Gypsum @ 200 kg/acre at pegging stage (40-45 DAS) for superior pod filling and oil percentage.',
      'Avoid deep hoeing or weeding after pegging begins to protect developing subterranean pods.'
    ]
  }
};

export default function CropRecommendationPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();
  const { isOffline, saveCropLocally, savedCrops, openOfflineGuide } = useOffline();
  const [savedSuccessMap, setSavedSuccessMap] = useState({});

  // 1 to 7 Form Fields
  const [formData, setFormData] = useState({
    location: activeUser?.village
      ? `${activeUser.village}, ${activeUser.district || 'Nashik'}, ${activeUser.state || 'Maharashtra'}`
      : 'Niphad, Nashik, Maharashtra',
    soilType: 'Black / Regur Soil',
    soilPh: 7.0,
    availableWater: 'Moderate (Borewell / Tubewell)',
    temperature: 24,
    rainfall: 'Medium (650 - 900 mm)',
    landSize: 3.0,
  });

  const [errors, setErrors] = useState({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [recommendations, setRecommendations] = useState(null);

  // Run mock recommendation calculation
  const calculateRecommendations = () => {
    const soil = formData.soilType;
    const water = formData.availableWater;
    const temp = Number(formData.temperature);

    let topPicks = [];

    if (soil.includes('Black')) {
      if (temp < 28) {
        // Rabi Season on Black Soil
        topPicks = [CROPS_DATABASE.wheat, CROPS_DATABASE.gram, CROPS_DATABASE.mustard];
      } else {
        // Kharif Season on Black Soil
        topPicks = [CROPS_DATABASE.cotton, CROPS_DATABASE.soybean, CROPS_DATABASE.gram];
      }
    } else if (soil.includes('Alluvial') || soil.includes('Clayey')) {
      if (water.includes('Abundant')) {
        topPicks = [CROPS_DATABASE.paddy, CROPS_DATABASE.wheat, CROPS_DATABASE.mustard];
      } else {
        topPicks = [CROPS_DATABASE.wheat, CROPS_DATABASE.mustard, CROPS_DATABASE.gram];
      }
    } else {
      // Red / Sandy / Loam
      topPicks = [CROPS_DATABASE.groundnut, CROPS_DATABASE.mustard, CROPS_DATABASE.gram];
    }

    return topPicks.slice(0, 3);
  };

  const handlePresetSelect = (presetName) => {
    if (presetName === 'rabi-plains') {
      setFormData({
        location: 'Khanna, Ludhiana, Punjab',
        soilType: 'Alluvial Loamy Soil',
        soilPh: 7.2,
        availableWater: 'Moderate (Borewell / Tubewell)',
        temperature: 22,
        rainfall: 'Medium (650 - 900 mm)',
        landSize: 4.0,
      });
    } else if (presetName === 'black-deccan') {
      setFormData({
        location: 'Niphad, Nashik, Maharashtra',
        soilType: 'Black / Regur Soil',
        soilPh: 7.0,
        availableWater: 'Moderate (Borewell / Tubewell)',
        temperature: 26,
        rainfall: 'Medium (650 - 900 mm)',
        landSize: 3.0,
      });
    } else if (presetName === 'sandy-red') {
      setFormData({
        location: 'Gondal, Rajkot, Gujarat',
        soilType: 'Sandy Loam & Red Soil',
        soilPh: 6.8,
        availableWater: 'Rainfed / Limited',
        temperature: 29,
        rainfall: 'Low (< 500 mm)',
        landSize: 5.0,
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.location.trim()) newErrors.location = 'Please enter your farm location.';
    if (!formData.landSize || formData.landSize <= 0) newErrors.landSize = 'Please enter a valid land size in acres.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsAnalyzing(true);
    setRecommendations(null);
    setAnalysisStep('Evaluating soil pH, texture & organic matter holding...');

    setTimeout(() => {
      setAnalysisStep('Cross-referencing ICAR agro-climatic seasonal rainfall data...');
    }, 500);

    setTimeout(() => {
      setAnalysisStep('Calculating suitability index and expected harvest margins...');
    }, 1000);

    setTimeout(() => {
      setIsAnalyzing(false);
      const results = calculateRecommendations();
      setRecommendations(results);
      // Auto-cache viewed crop recommendations locally for offline access
      results.forEach((c) => {
        saveCropLocally({
          id: c.id,
          name: c.name,
          category: c.suitableSeason,
          season: c.suitableSeason,
          soil: c.suitableSoil,
          water: c.waterRequirement,
          duration: c.growingDuration,
          tips: c.farmingTips,
          projectedYield: c.estYieldPerAcre
        });
      });
    }, 1400);
  };

  // Run on first mount
  useEffect(() => {
    const results = calculateRecommendations();
    setRecommendations(results);
    results.forEach((c) => {
      saveCropLocally({
        id: c.id,
        name: c.name,
        category: c.suitableSeason,
        season: c.suitableSeason,
        soil: c.suitableSoil,
        water: c.waterRequirement,
        duration: c.growingDuration,
        tips: c.farmingTips,
        projectedYield: c.estYieldPerAcre
      });
    });
  }, []);

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
              <span>{t('dashBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.name || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
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

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('featCropRecTitle')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Title & Introduction */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <Badge variant="emerald" icon={Sprout}>
            {t('brandName')} • {t('featCropRecTitle')}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('featCropRecTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t('featCropRecDesc')}
          </p>
        </div>

        {/* Educational Simulation Notice Banner */}
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950 shadow-sm max-w-4xl mx-auto">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-amber-900 font-bold uppercase tracking-wide">
              Frontend Simulation Notice:
            </strong>
            <p className="text-amber-800 leading-relaxed">
              This recommendation page applies mock agronomy classification rules aligned with Indian Council of Agricultural Research (ICAR) crop-zoning guidelines. It is a frontend demonstration tool and does not claim to run a live neural network model. Always verify with your local Krishi Vigyan Kendra (KVK).
            </p>
          </div>
        </div>

        {/* Offline Notice Banner if in Offline Mode */}
        {isOffline && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Offline Mode Active:</strong> You are browsing locally cached crop models. Online AI engine is paused.</span>
            </div>
            <button
              type="button"
              onClick={openOfflineGuide}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition shrink-0"
            >
              View Saved Offline Crops
            </button>
          </div>
        )}

        {/* Form & Preset Controls */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-6 sm:p-9 border border-slate-200 shadow-md space-y-6">
          
          {/* Header with Quick Preset Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Enter Your Farmland Parameters
              </h2>
              <p className="text-xs text-slate-500">
                All 7 parameters are evaluated together to rank crop suitability
              </p>
            </div>

            {/* Quick 1-Click Fill Presets */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="text-[11px] font-bold text-slate-400">1-Click Presets:</span>
              <button
                type="button"
                onClick={() => handlePresetSelect('black-deccan')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-[11px] transition border border-slate-200"
              >
                Black Soil (Deccan)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('rabi-plains')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-[11px] transition border border-slate-200"
              >
                Alluvial (Plains)
              </button>
              <button
                type="button"
                onClick={() => handlePresetSelect('sandy-red')}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-700 font-semibold text-[11px] transition border border-slate-200"
              >
                Sandy / Red Soil
              </button>
            </div>
          </div>

          {/* Form Grid (7 Required Fields) */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Location */}
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. Farm Location (स्थान) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g. Niphad, Nashik, Maharashtra"
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                {errors.location && <p className="text-[11px] text-red-600 mt-1">{errors.location}</p>}
              </div>

              {/* 2. Soil Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Soil Type (मिट्टी का प्रकार) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Layers className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.soilType}
                    onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Black / Regur Soil">Black / Regur Soil (काली मिट्टी)</option>
                    <option value="Alluvial Loamy Soil">Alluvial Loamy Soil (जलोढ़ दोमट मिट्टी)</option>
                    <option value="Red & Laterite Soil">Red & Laterite Soil (लाल मिट्टी)</option>
                    <option value="Clayey Loam Soil">Clayey Loam Soil (चिकनी दोमट मिट्टी)</option>
                    <option value="Sandy Loam & Red Soil">Sandy Loam Soil (बलुई दोमट मिट्टी)</option>
                  </select>
                </div>
              </div>

              {/* 3. Soil pH */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700">
                    3. Soil pH Level
                  </label>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    pH {formData.soilPh} ({Number(formData.soilPh) === 7 ? 'Neutral' : Number(formData.soilPh) < 6.5 ? 'Slightly Acidic' : 'Optimal Alkaline'})
                  </span>
                </div>
                <input
                  type="range"
                  min="5.5"
                  max="8.5"
                  step="0.1"
                  value={formData.soilPh}
                  onChange={(e) => setFormData({ ...formData, soilPh: parseFloat(e.target.value) })}
                  className="w-full accent-emerald-600 mt-2 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                  <span>5.5 (Acidic)</span>
                  <span>7.0 (Neutral)</span>
                  <span>8.5 (Alkaline)</span>
                </div>
              </div>

              {/* 4. Available Water */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  4. Available Water (सिंचाई की सुविधा)
                </label>
                <div className="relative">
                  <Droplets className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.availableWater}
                    onChange={(e) => setFormData({ ...formData, availableWater: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Moderate (Borewell / Tubewell)">Moderate (Borewell / Tubewell)</option>
                    <option value="Abundant (Perennial canal / river)">Abundant (Perennial canal / river)</option>
                    <option value="Rainfed / Limited">Rainfed / Limited Water</option>
                  </select>
                </div>
              </div>

              {/* 5. Temperature */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  5. Average Temperature (°C)
                </label>
                <div className="relative">
                  <Thermometer className="w-4 h-4 text-amber-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="10"
                    max="45"
                    value={formData.temperature}
                    onChange={(e) => setFormData({ ...formData, temperature: parseInt(e.target.value) || 24 })}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400 block mt-1">
                  Typical Rabi winter range: 18°C - 26°C
                </span>
              </div>

              {/* 6. Rainfall */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  6. Rainfall (वार्षिक/मौसमी वर्षा)
                </label>
                <div className="relative">
                  <CloudRain className="w-4 h-4 text-blue-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <select
                    value={formData.rainfall}
                    onChange={(e) => setFormData({ ...formData, rainfall: e.target.value })}
                    className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="Medium (650 - 900 mm)">Medium (650 - 900 mm)</option>
                    <option value="Low (< 500 mm)">Low (&lt; 500 mm - Semi-arid)</option>
                    <option value="High (> 1000 mm)">High (&gt; 1000 mm - Heavy rainfall)</option>
                  </select>
                </div>
              </div>

              {/* 7. Land Size */}
              <div className="sm:col-span-2 lg:col-span-3">
                <div className="max-w-xs">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    7. Cultivated Land Size (Acres / एकड़) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <LandPlot className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      max="100"
                      value={formData.landSize}
                      onChange={(e) => setFormData({ ...formData, landSize: parseFloat(e.target.value) || 1 })}
                      className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                  {errors.landSize && <p className="text-[11px] text-red-600 mt-1">{errors.landSize}</p>}
                </div>
              </div>

            </div>

            {/* Action Trigger Button */}
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                icon={Sparkles}
                loading={isAnalyzing}
                className="w-full justify-center text-sm font-black shadow-emerald-600/30 shadow-lg py-3.5"
              >
                {isAnalyzing ? 'Calculating Crop Suitability...' : 'Get Crop Recommendation (फसल सलाह प्राप्त करें)'}
              </Button>

              {isAnalyzing && (
                <p className="text-center text-xs font-semibold text-emerald-700 mt-2 animate-pulse">
                  {analysisStep}
                </p>
              )}
            </div>
          </form>

        </div>

        {/* 3 Recommended Crops Output Section */}
        {recommendations && (
          <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-bottom-6 duration-300">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700">
                    Optimal Matches for {formData.landSize} Acres in {formData.location.split(',')[0]}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Top 3 Recommended Crops
                </h2>
              </div>

              <span className="text-xs text-slate-500">
                Soil: <strong className="text-slate-800">{formData.soilType.split(' ')[0]}</strong> • Water: <strong className="text-slate-800">{formData.availableWater.split(' ')[0]}</strong>
              </span>
            </div>

            {/* 3 Attractive Crop Cards Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {recommendations.map((crop, idx) => {
                // Calculate projected total yield for farmer's land size
                const baseMinYield = parseInt(crop.estYieldPerAcre.split('-')[0]) || 15;
                const baseMaxYield = parseInt(crop.estYieldPerAcre.split('-')[1]) || 20;
                const totalMinYield = Math.round(baseMinYield * formData.landSize);
                const totalMaxYield = Math.round(baseMaxYield * formData.landSize);

                return (
                  <Card
                    key={crop.id}
                    className="p-0 border border-slate-200 shadow-lg hover:border-emerald-500 hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col justify-between bg-white group"
                  >
                    <div>
                      
                      {/* Crop Image with Overlay Badge */}
                      <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                        <img
                          src={crop.image}
                          alt={crop.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

                        {/* Top Rank Badge */}
                        <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-black px-2.5 py-1 rounded-xl shadow-md border border-emerald-400">
                          #{idx + 1} Best Choice
                        </div>

                        {/* Suitability Match Score */}
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-emerald-300 text-xs font-extrabold px-2.5 py-1 rounded-xl border border-emerald-500/40">
                          {crop.matchScore} Match
                        </div>

                        {/* Title Over Image */}
                        <div className="absolute bottom-3 left-3 right-3 text-white">
                          <h3 className="text-lg font-black leading-tight drop-shadow">
                            {crop.name}
                          </h3>
                        </div>
                      </div>

                      {/* Content Body */}
                      <div className="p-6 space-y-4">
                        
                        {/* Key Parameters Matrix */}
                        <div className="grid grid-cols-2 gap-2.5 text-xs">
                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Suitable Season
                            </span>
                            <span className="font-extrabold text-slate-800 flex items-center gap-1">
                              <Calendar className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{crop.suitableSeason}</span>
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Growing Duration
                            </span>
                            <span className="font-extrabold text-slate-800 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span>{crop.growingDuration}</span>
                            </span>
                          </div>

                          <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 col-span-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
                              Suitable Soil Texture
                            </span>
                            <span className="font-bold text-slate-700 text-xs block">
                              {crop.suitableSoil}
                            </span>
                          </div>

                          <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200 col-span-2">
                            <span className="text-[10px] uppercase font-bold text-blue-900 block mb-0.5">
                              Water Requirement
                            </span>
                            <span className="font-semibold text-blue-950 text-xs flex items-center gap-1">
                              <Droplets className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{crop.waterRequirement}</span>
                            </span>
                          </div>
                        </div>

                        {/* Harvest & Profit Forecast for Farmer's Acreage */}
                        <div className="p-3 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-200 text-xs">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-bold text-emerald-950">Est. Total Yield ({formData.landSize} Acres):</span>
                            <strong className="text-emerald-800 font-extrabold">{totalMinYield} - {totalMaxYield} Qtl</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-emerald-950">Est. Profit Margin:</span>
                            <strong className="text-emerald-700 font-extrabold">{crop.estProfitPerAcre} / Acre</strong>
                          </div>
                        </div>

                        {/* Basic Farming Tips */}
                        <div className="space-y-1.5 pt-1">
                          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                            <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
                            <span>Basic Farming Tips:</span>
                          </span>
                          <ul className="space-y-1.5 text-xs text-slate-600">
                            {crop.farmingTips.map((tip, i) => (
                              <li key={i} className="flex items-start gap-1.5 leading-snug">
                                <span className="text-emerald-600 font-bold">•</span>
                                <span>{tip}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                      </div>

                    </div>

                    {/* Card Footer */}
                    <div className="p-6 pt-0">
                      <button
                        type="button"
                        onClick={() => {
                          saveCropLocally({
                            id: crop.id,
                            name: crop.name,
                            category: crop.suitableSeason,
                            season: crop.suitableSeason,
                            soil: crop.suitableSoil,
                            water: crop.waterRequirement,
                            duration: crop.growingDuration,
                            tips: crop.farmingTips,
                            projectedYield: crop.estYieldPerAcre
                          });
                          setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: true }));
                          setTimeout(() => {
                            setSavedSuccessMap((prev) => ({ ...prev, [crop.id]: false }));
                          }, 3000);
                        }}
                        className={`w-full py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 shadow-sm ${
                          savedSuccessMap[crop.id]
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-900 hover:bg-slate-800 text-white group-hover:bg-emerald-700'
                        }`}
                      >
                        {savedSuccessMap[crop.id] ? (
                          <>
                            <BookmarkCheck className="w-3.5 h-3.5 text-emerald-200" />
                            <span>Saved to Offline Guide</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Save for Offline Access</span>
                          </>
                        )}
                      </button>
                    </div>

                  </Card>
                );
              })}
            </div>

            {/* Bottom Actions */}
            <div className="p-6 bg-slate-100 rounded-3xl border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
              <span>Need seed vendor contacts or seed subsidy? Check National Seed Portal (NSC).</span>
              <div className="flex gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.scrollTo({ top: 300, behavior: 'smooth' })}
                  icon={RefreshCw}
                >
                  Adjust Parameters
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={onNavigateDashboard}
                >
                  Go to Dashboard
                </Button>
              </div>
            </div>

          </div>
        )}

      </div>

    </div>
  );
}

