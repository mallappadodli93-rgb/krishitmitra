import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  Phone,
  Mail,
  MapPin,
  Globe,
  Sprout,
  LandPlot,
  Droplets,
  Layers,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Camera,
  RefreshCw,
  Download,
  Upload,
  Database,
  ShieldCheck,
  ChevronDown,
  Sparkles,
  Info,
  Building,
  Plus,
  X
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFarmerProfile,
  saveFarmerProfile,
  getStorageEngineInfo,
  convertImageToBase64,
  downloadExportedJSON,
  downloadExportedCSV
} from '../services/farmerDataService';

const INDIAN_STATES = [
  'Maharashtra',
  'Karnataka',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'Bihar',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'West Bengal',
  'Odisha',
  'Chhattisgarh',
  'Jharkhand',
  'Himachal Pradesh',
  'Uttarakhand',
  'Assam'
];

const SOIL_TYPES = [
  'Medium Black Cotton (Regur) Loam',
  'Deep Black Alluvial Clay',
  'Fertile Alluvial Loam',
  'Red Sandy Loam',
  'Laterite Soil',
  'Sandy Clay Loam',
  'Silty Loam Soil'
];

const IRRIGATION_TYPES = [
  'Drip Irrigation & Borewell',
  'Drip Irrigation (Automated)',
  'Sprinkler System',
  'Canal Gravity Flow',
  'Tubewell / Open Well',
  'Rainfed (Monsoon Dependent)'
];

const COMMON_CROPS = [
  'Wheat (HD-3086)',
  'Chickpea / Gram (JG-14)',
  'Nashik Red Onion',
  'Basmati Rice (Pusa 1121)',
  'Tomato (Hybrid)',
  'Bt Cotton (Shankar-6)',
  'Mustard (Pusa Bold)',
  'Soybean (JS-9560)',
  'Sugarcane (Co-86032)',
  'Maize (Sweet Corn)'
];

export default function FarmerProfilePage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const storageInfo = getStorageEngineInfo();

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    preferredLanguage: 'kn',
    
    // Farm Details
    farmName: '',
    farmLocation: '',
    landSize: 5.0,
    landUnit: 'Acres',
    soilType: SOIL_TYPES[0],
    availableIrrigation: IRRIGATION_TYPES[0],
    cropsGrowing: [],
    avatarImage: ''
  });

  const [newCropInput, setNewCropInput] = useState('');
  const avatarInputRef = useRef(null);

  // Load profile from IndexedDB on mount
  useEffect(() => {
    async function loadProfile() {
      try {
        setIsLoading(true);
        const profile = await fetchFarmerProfile();
        if (profile) {
          setFormData({
            ...profile,
            cropsGrowing: Array.isArray(profile.cropsGrowing) ? profile.cropsGrowing : []
          });
        }
      } catch (err) {
        console.error('Failed to load farmer profile:', err);
        setErrorMessage('Could not load profile from local IndexedDB.');
      } finally {
        setIsLoading(false);
      }
    }

    loadProfile();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleAddCrop = (crop) => {
    const toAdd = crop.trim();
    if (!toAdd) return;
    if (formData.cropsGrowing.includes(toAdd)) return;
    setFormData(prev => ({
      ...prev,
      cropsGrowing: [...prev.cropsGrowing, toAdd]
    }));
    setNewCropInput('');
  };

  const handleRemoveCrop = (cropToRemove) => {
    setFormData(prev => ({
      ...prev,
      cropsGrowing: prev.cropsGrowing.filter(c => c !== cropToRemove)
    }));
  };

  // Avatar / Photo upload
  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMessage('Profile image must be less than 5MB.');
        return;
      }
      try {
        const base64 = await convertImageToBase64(file);
        setFormData(prev => ({ ...prev, avatarImage: base64 }));
      } catch (err) {
        setErrorMessage('Failed to read image file.');
      }
    }
  };

  // Submit profile to IndexedDB
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrorMessage('Farmer name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      setErrorMessage('Mobile number is required.');
      return;
    }

    try {
      setIsSaving(true);
      setErrorMessage('');
      setSuccessMessage('');

      await saveFarmerProfile(formData);

      setSuccessMessage(
        language === 'kn'
          ? 'ರೈತರ ಪ್ರೊಫೈಲ್ ಮತ್ತು ಕೃಷಿ ವಿವರಗಳನ್ನು IndexedDB ಯಲ್ಲಿ ಯಶಸ್ವಿಯಾಗಿ ಉಳಿಸಲಾಗಿದೆ!'
          : language === 'hi'
          ? 'किसान प्रोफाइल और खेत विवरण को IndexedDB में सुरक्षित रूप से सहेजा गया!'
          : 'Farmer Profile & Farm Details saved successfully in client IndexedDB!'
      );

      // Auto-hide success after 4 seconds
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Failed to save profile:', err);
      setErrorMessage('Failed to save profile in IndexedDB.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* 1. Header Navigation */}
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
                {language === 'kn' ? 'ರೈತರ ಪ್ರೊಫೈಲ್' : language === 'hi' ? 'किसान प्रोफाइल' : 'Farmer Profile'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Storage Engine Status Banner */}
        <div className="p-4 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-50 rounded-2xl border border-emerald-300 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="flex items-start sm:items-center gap-2.5 text-emerald-950">
            <Database className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-emerald-900">
                  {storageInfo.badgeText}
                </span>
                <span className="text-[10px] bg-amber-200/80 text-amber-950 px-2 py-0.5 rounded-full font-bold">
                  {storageInfo.cloudSyncStatus}
                </span>
              </div>
              <p className="text-[11px] text-emerald-800/90 mt-0.5">
                {storageInfo.description}
              </p>
            </div>
          </div>

          {/* Quick Export Controls */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={downloadExportedJSON}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm"
              title="Download full profile as JSON"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export JSON</span>
            </button>
            <button
              type="button"
              onClick={downloadExportedCSV}
              className="px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-xl font-bold text-xs transition flex items-center gap-1 shadow-sm"
              title="Download crop logs as CSV"
            >
              <Download className="w-3.5 h-3.5 text-emerald-700" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-100 border border-emerald-400 text-emerald-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-300 text-red-900 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Column (5 cols): Profile & Personal Information */}
            <div className="lg:col-span-5 space-y-6">
              
              <Card className="p-6 border-slate-200 shadow-md bg-white space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-600" />
                    <span>Farmer Personal Information</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">
                    ID: {formData.farmerId || 'KM-2026-8842'}
                  </span>
                </div>

                {/* Avatar / Photo Uploader */}
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white font-black flex items-center justify-center text-2xl overflow-hidden shadow-md border-2 border-emerald-200">
                      {formData.avatarImage ? (
                        <img
                          src={formData.avatarImage}
                          alt="Farmer Avatar"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{formData.name ? formData.name.charAt(0).toUpperCase() : 'K'}</span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-full bg-slate-900 text-white hover:bg-emerald-600 transition shadow-md"
                      title="Upload photo"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>

                  <div>
                    <span className="text-sm font-bold text-slate-900 block">
                      {formData.name || 'Farmer Name'}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      Stored locally in IndexedDB
                    </span>
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="text-xs font-bold text-emerald-700 hover:text-emerald-900 mt-1 underline"
                    >
                      Change Photo
                    </button>
                  </div>
                </div>

                {/* Farmer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farmer Name (ರೈತರ ಹೆಸರು) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="e.g. Ramesh Patel"
                    className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number (ಮೊಬೈಲ್ ಸಂಖ್ಯೆ) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={formData.mobile}
                      onChange={(e) => handleInputChange('mobile', e.target.value)}
                      placeholder="10-digit mobile number"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white font-mono"
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Email Address (ಇಮೇಲ್ ವಿಳಾಸ)
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="farmer@gmail.com"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Village & District */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Village (ಹಳ್ಳಿ)
                    </label>
                    <input
                      type="text"
                      value={formData.village}
                      onChange={(e) => handleInputChange('village', e.target.value)}
                      placeholder="e.g. Niphad"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      District (ಜಿಲ್ಲೆ)
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      placeholder="e.g. Nashik"
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* State & Language */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State (ರಾಜ್ಯ)
                    </label>
                    <select
                      value={formData.state}
                      onChange={(e) => handleInputChange('state', e.target.value)}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {INDIAN_STATES.map((st) => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Language
                    </label>
                    <select
                      value={formData.preferredLanguage}
                      onChange={(e) => {
                        handleInputChange('preferredLanguage', e.target.value);
                        changeLanguage(e.target.value);
                      }}
                      className="w-full px-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {languages.map((l) => (
                        <option key={l.code} value={l.code}>{l.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

              </Card>

            </div>

            {/* Right Column (7 cols): Farm Details & Crops Growing */}
            <div className="lg:col-span-7 space-y-6">
              
              <Card className="p-6 border-slate-200 shadow-md bg-white space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <LandPlot className="w-4 h-4 text-emerald-600" />
                    <span>Farm Land & Agricultural Details</span>
                  </span>
                  <Badge variant="emerald" size="xs">
                    Local Acreage Profile
                  </Badge>
                </div>

                {/* Farm Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farm Name (ಕೃಷಿ ಕ್ಷೇತ್ರದ ಹೆಸರು)
                  </label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.farmName}
                      onChange={(e) => handleInputChange('farmName', e.target.value)}
                      placeholder="e.g. Shri Krishna Krishi Kshetra"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Farm Location / Survey Number / GPS */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farm Location & Field Address (ಸರ್ವೆ ನಂ / ಸ್ಥಳ)
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formData.farmLocation}
                      onChange={(e) => handleInputChange('farmLocation', e.target.value)}
                      placeholder="e.g. Gat No. 142/A, Niphad-Pimpalgaon Road"
                      className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Land Size & Unit */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Total Land Size (ಒಟ್ಟು ಭೂಮಿ)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={formData.landSize}
                      onChange={(e) => handleInputChange('landSize', parseFloat(e.target.value) || 0)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Measurement Unit (ಘಟಕ)
                    </label>
                    <select
                      value={formData.landUnit}
                      onChange={(e) => handleInputChange('landUnit', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Acres">Acres (ಎಕರೆ)</option>
                      <option value="Hectares">Hectares (ಹೆಕ್ಟೇರ್)</option>
                      <option value="Guntas">Guntas (ಗುಂಟೆ)</option>
                      <option value="Bigha">Bigha (बीघा)</option>
                    </select>
                  </div>
                </div>

                {/* Soil Type & Available Irrigation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Soil Type (ಮಣ್ಣಿನ ಪ್ರಕಾರ)
                    </label>
                    <div className="relative">
                      <Layers className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.soilType}
                        onChange={(e) => handleInputChange('soilType', e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {SOIL_TYPES.map((st) => (
                          <option key={st} value={st}>{st}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Available Irrigation (ನೀರಾವರಿ ವ್ಯವಸ್ಥೆ)
                    </label>
                    <div className="relative">
                      <Droplets className="w-4 h-4 text-blue-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.availableIrrigation}
                        onChange={(e) => handleInputChange('availableIrrigation', e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                      >
                        {IRRIGATION_TYPES.map((irr) => (
                          <option key={irr} value={irr}>{irr}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Crops Currently Growing */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="block text-xs font-bold text-slate-700">
                    Crops Currently Growing (ಪ್ರಸ್ತುತ ಬೆಳೆಯುತ್ತಿರುವ ಬೆಳೆಗಳು)
                  </label>

                  {/* Active Crop Tag Chips */}
                  <div className="flex flex-wrap gap-2 min-h-[36px] p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {formData.cropsGrowing.length === 0 ? (
                      <span className="text-xs text-slate-400 italic">No crops selected yet. Pick below or type custom crop.</span>
                    ) : (
                      formData.cropsGrowing.map((crop) => (
                        <span
                          key={crop}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-sm"
                        >
                          <Sprout className="w-3.5 h-3.5 text-emerald-700" />
                          <span>{crop}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCrop(crop)}
                            className="p-0.5 rounded-full hover:bg-emerald-200 text-emerald-800 transition"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Custom Crop Add Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      type="text"
                      value={newCropInput}
                      onChange={(e) => setNewCropInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCrop(newCropInput);
                        }
                      }}
                      placeholder="Type custom crop name and press Add..."
                      className="flex-1 px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      type="button"
                      onClick={() => handleAddCrop(newCropInput)}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>

                  {/* Quick Preset Crop Suggestions */}
                  <div className="pt-1">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">
                      Suggested Indian Crops:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {COMMON_CROPS.map((crop) => (
                        <button
                          key={crop}
                          type="button"
                          onClick={() => handleAddCrop(crop)}
                          disabled={formData.cropsGrowing.includes(crop)}
                          className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 border border-slate-200 transition disabled:opacity-40"
                        >
                          + {crop}
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

              </Card>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  loading={isSaving}
                  icon={Save}
                  className="shadow-emerald-600/25 shadow-lg font-black text-sm px-8"
                >
                  {isSaving ? 'Saving to IndexedDB...' : 'Save Profile & Farm Details'}
                </Button>
              </div>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

