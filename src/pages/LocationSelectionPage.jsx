import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Search,
  Navigation,
  Save,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  Compass,
  Layers,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  RefreshCw,
  Sprout,
  Sun,
  ShieldCheck,
  Globe,
  ChevronDown
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getActiveUser, setActiveUser } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';

// Curated reference database of major Indian agricultural locations
const PRESET_LOCATIONS = [
  {
    id: 'niphad-nashik',
    village: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    lat: 20.0760,
    lng: 74.0435,
    zone: 'Western Maharashtra Scarcity & Ghat Agro-Zone',
    soil: 'Medium Black (Regur) Loam',
    crops: 'Grapes, Onion, Soybean, Wheat'
  },
  {
    id: 'khanna-ludhiana',
    village: 'Khanna',
    district: 'Ludhiana',
    state: 'Punjab',
    lat: 30.7046,
    lng: 76.2163,
    zone: 'Trans-Gangetic Plains Agro-Climatic Zone',
    soil: 'Alluvial Deep Loam',
    crops: 'Wheat (Sharbati), Basmati Paddy, Maize'
  },
  {
    id: 'karnal-haryana',
    village: 'Taraori',
    district: 'Karnal',
    state: 'Haryana',
    lat: 29.6857,
    lng: 76.9905,
    zone: 'Northwestern Plain Zone',
    soil: 'Fertile Sandy Loam to Clay Loam',
    crops: 'Basmati Rice, Wheat (HD-3086), Mustard'
  },
  {
    id: 'indore-mp',
    village: 'Sanwer',
    district: 'Indore',
    state: 'Madhya Pradesh',
    lat: 22.7196,
    lng: 75.8577,
    zone: 'Malwa Plateau Semi-Arid Agro-Zone',
    soil: 'Deep Black Cotton Soil',
    crops: 'Soybean, Sharbati Wheat, Gram / Chana'
  },
  {
    id: 'latur-maharashtra',
    village: 'Ausa',
    district: 'Latur',
    state: 'Maharashtra',
    lat: 18.4088,
    lng: 76.5604,
    zone: 'Marathwada Agricultural Zone',
    soil: 'Medium Black & Clayey',
    crops: 'Soybean, Pigeon Pea (Tur), Sunflower'
  },
  {
    id: 'rajkot-gujarat',
    village: 'Gondal',
    district: 'Rajkot',
    state: 'Gujarat',
    lat: 22.3039,
    lng: 70.8022,
    zone: 'North Saurashtra Agro-Climatic Zone',
    soil: 'Medium Black Calcareous Soil',
    crops: 'Cotton (Shankar-6), Groundnut, Cumin'
  },
  {
    id: 'alwar-rajasthan',
    village: 'Behror',
    district: 'Alwar',
    state: 'Rajasthan',
    lat: 27.5530,
    lng: 76.6346,
    zone: 'Flood Prone Eastern Plains Zone',
    soil: 'Sandy to Loamy Sand',
    crops: 'Mustard (Pusa Bold), Bajra, Barley'
  },
  {
    id: 'muzaffarpur-bihar',
    village: 'Minapur',
    district: 'Muzaffarpur',
    state: 'Bihar',
    lat: 26.1209,
    lng: 85.3647,
    zone: 'North West Alluvial Plain Zone',
    soil: 'Calcareous Alluvial Loam',
    crops: 'Litchi, Maize, Paddy, Vegetables'
  },
  {
    id: 'varanasi-up',
    village: 'Arajiline',
    district: 'Varanasi',
    state: 'Uttar Pradesh',
    lat: 25.3176,
    lng: 82.9739,
    zone: 'Eastern Plain Agro-Zone',
    soil: 'Alluvial Silt Loam',
    crops: 'Wheat, Paddy, Vegetables, Mustard'
  },
  {
    id: 'guntur-ap',
    village: 'Tenali',
    district: 'Guntur',
    state: 'Andhra Pradesh',
    lat: 16.3067,
    lng: 80.4365,
    zone: 'Krishna-Godavari Coastal Delta Zone',
    soil: 'Deep Black & Deltaic Clay',
    crops: 'Chili, Cotton, Paddy, Tobacco'
  }
];

export default function LocationSelectionPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();

  // Selected Location State (Defaults to saved location in LocalStorage or Niphad, Nashik)
  const [selectedLocation, setSelectedLocation] = useState(() => {
    try {
      const saved = localStorage.getItem('krishimitra_farm_location');
      if (saved) return JSON.parse(saved);
      if (activeUser?.village) {
        return {
          village: activeUser.village,
          district: activeUser.district || 'Nashik',
          state: activeUser.state || 'Maharashtra',
          lat: 20.0760,
          lng: 74.0435,
          zone: 'Western Maharashtra Agro-Zone',
          soil: 'Medium Black Soil',
          crops: 'Wheat, Onion, Grapes'
        };
      }
    } catch (e) {
      // Fallback
    }
    return PRESET_LOCATIONS[0];
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLocating, setIsLocating] = useState(false);
  const [locationSuccessMsg, setLocationSuccessMsg] = useState('');
  const [locationErrorMsg, setLocationErrorMsg] = useState('');
  const [mapType, setMapType] = useState('satellite'); // 'satellite' | 'terrain' | 'roadmap'
  const [zoomLevel, setZoomLevel] = useState(13);

  // Google Maps API integration state
  const googleMapRef = useRef(null);
  const [googleMapLoaded, setGoogleMapLoaded] = useState(false);
  const [mapLoadError, setMapLoadError] = useState(false);
  const googleMapInstance = useRef(null);
  const googleMarkerInstance = useRef(null);

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // Search filter
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const clean = searchQuery.toLowerCase().trim();
    const matches = PRESET_LOCATIONS.filter(
      loc =>
        loc.village.toLowerCase().includes(clean) ||
        loc.district.toLowerCase().includes(clean) ||
        loc.state.toLowerCase().includes(clean)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  // Try loading real Google Maps if API key is provided and valid
  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setGoogleMapLoaded(false);
      return;
    }

    // Check if already injected
    if (window.google && window.google.maps) {
      initGoogleMap();
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        initGoogleMap();
      };

      script.onerror = () => {
        console.warn('Google Maps API failed to load. Using fallback agricultural map.');
        setMapLoadError(true);
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initGoogleMap);
    }

    return () => {
      if (script) {
        script.removeEventListener('load', initGoogleMap);
      }
    };
  }, [apiKey]);

  const initGoogleMap = () => {
    if (!googleMapRef.current || !window.google?.maps) return;

    try {
      const center = { lat: selectedLocation.lat, lng: selectedLocation.lng };
      const map = new window.google.maps.Map(googleMapRef.current, {
        center,
        zoom: zoomLevel,
        mapTypeId: mapType === 'satellite' ? 'hybrid' : mapType === 'terrain' ? 'terrain' : 'roadmap',
        mapTypeControl: false,
        fullscreenControl: false,
      });

      const marker = new window.google.maps.Marker({
        position: center,
        map,
        draggable: true,
        title: `${selectedLocation.village}, ${selectedLocation.district}`,
        animation: window.google.maps.Animation.DROP,
      });

      // Update on marker drag
      marker.addListener('dragend', (e) => {
        const newLat = parseFloat(e.latLng.lat().toFixed(4));
        const newLng = parseFloat(e.latLng.lng().toFixed(4));
        updateCoordinates(newLat, newLng);
      });

      // Update on map click
      map.addListener('click', (e) => {
        const newLat = parseFloat(e.latLng.lat().toFixed(4));
        const newLng = parseFloat(e.latLng.lng().toFixed(4));
        marker.setPosition(e.latLng);
        updateCoordinates(newLat, newLng);
      });

      googleMapInstance.current = map;
      googleMarkerInstance.current = marker;
      setGoogleMapLoaded(true);
    } catch (err) {
      console.warn('Google Maps initialization failed', err);
      setMapLoadError(true);
    }
  };

  const updateCoordinates = (lat, lng, locData = null) => {
    if (locData) {
      setSelectedLocation(locData);
    } else {
      setSelectedLocation(prev => ({
        ...prev,
        lat,
        lng,
        village: prev.village || 'Selected Farm Field',
      }));
    }

    // Pan Google map if initialized
    if (googleMapInstance.current) {
      const pos = { lat, lng };
      googleMapInstance.current.panTo(pos);
      if (googleMarkerInstance.current) {
        googleMarkerInstance.current.setPosition(pos);
      }
    }
  };

  // Click on placeholder interactive map
  const handlePlaceholderMapClick = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left; // x position within the element.
    const y = e.clientY - rect.top; // y position within the element.

    // Calculate simulated offset from center
    const xRatio = (x / rect.width - 0.5) * 0.08;
    const yRatio = (y / rect.height - 0.5) * 0.08;

    const newLat = parseFloat((selectedLocation.lat - yRatio).toFixed(4));
    const newLng = parseFloat((selectedLocation.lng + xRatio).toFixed(4));

    updateCoordinates(newLat, newLng);
    setLocationSuccessMsg('Marker moved to clicked coordinates.');
    setTimeout(() => setLocationSuccessMsg(''), 2000);
  };

  // "Use My Current Location" button using HTML5 Geolocation
  const handleUseCurrentLocation = () => {
    setLocationErrorMsg('');
    setLocationSuccessMsg('');

    if (!navigator.geolocation) {
      setLocationErrorMsg('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(4));
        const lng = parseFloat(pos.coords.longitude.toFixed(4));

        const loc = {
          village: 'Current Farm GPS Location',
          district: 'Detected Field',
          state: 'India',
          lat,
          lng,
          zone: 'GPS Auto-Detected Agro-Zone',
          soil: 'Local Soil Texture',
          crops: 'Seasonal Crops'
        };

        updateCoordinates(lat, lng, loc);
        setLocationSuccessMsg(`Current GPS coordinates locked: ${lat}° N, ${lng}° E`);
        setTimeout(() => setLocationSuccessMsg(''), 3000);
      },
      (error) => {
        setIsLocating(false);
        let msg = 'Unable to retrieve your current location. Please select from search or tap on map.';
        if (error.code === error.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Tap on map or search your village below.';
        }
        setLocationErrorMsg(msg);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Select location from search autocomplete
  const handleSelectSearchResult = (loc) => {
    setSearchQuery(`${loc.village}, ${loc.district}, ${loc.state}`);
    setSearchResults([]);
    updateCoordinates(loc.lat, loc.lng, loc);
    setLocationSuccessMsg(`Selected ${loc.village}, ${loc.district}`);
    setTimeout(() => setLocationSuccessMsg(''), 2500);
  };

  // Save location button
  const handleSaveLocation = () => {
    try {
      localStorage.setItem('krishimitra_farm_location', JSON.stringify(selectedLocation));

      // Also sync with active user profile if available
      if (activeUser) {
        const updatedUser = {
          ...activeUser,
          village: selectedLocation.village,
          district: selectedLocation.district,
          state: selectedLocation.state,
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        };
        setActiveUser(updatedUser);
      }

      setLocationSuccessMsg('Farm location saved successfully in LocalStorage! Weather & Mandi updates are now customized for your fields.');
      setTimeout(() => {
        setLocationSuccessMsg('');
      }, 4000);
    } catch (e) {
      setLocationErrorMsg('Failed to save location in local storage.');
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
                {language === 'kn' ? 'ಕೃಷಿ ಜಿಪಿಎಸ್ & ನಕ್ಷೆ' : language === 'hi' ? 'खेत जीपीएस व नक्शा' : 'Farm GPS & Map Locator'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Badge variant="emerald" icon={Compass}>
                Precision Agriculture Geo-Tagging
              </Badge>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Select Your Farm Field Location
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Search your village or click on the map to pin your agricultural field for hyper-local rainfall alerts and nearest APMC mandi pricing.
            </p>
          </div>

          {/* Use My Current Location Button */}
          <Button
            variant="secondary"
            size="md"
            icon={Navigation}
            loading={isLocating}
            onClick={handleUseCurrentLocation}
            className="shrink-0 font-bold border-emerald-300 text-emerald-800 shadow-sm hover:shadow"
          >
            {isLocating ? 'Locating with GPS...' : 'Use My Current Location'}
          </Button>
        </div>

        {/* Success / Error Alerts */}
        {locationSuccessMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{locationSuccessMsg}</span>
          </div>
        )}

        {locationErrorMsg && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{locationErrorMsg}</span>
          </div>
        )}

        {/* 2. Search Autocomplete Bar */}
        <div className="relative">
          <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
            <Search className="w-5 h-5 text-emerald-600 shrink-0 ml-1" />
            <input
              type="text"
              placeholder="Search your village, town, or district (e.g. Niphad, Nashik, Khanna, Indore, Karnal)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs sm:text-sm bg-transparent focus:outline-none text-slate-800 placeholder-slate-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                }}
                className="text-xs text-slate-400 hover:text-slate-600 font-bold px-2 py-1"
              >
                Clear
              </button>
            )}
          </div>

          {/* Autocomplete Dropdown */}
          {searchResults.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden z-40 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95">
              <div className="p-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-50 border-b border-slate-100">
                Matching Indian Agricultural Mandis & Villages:
              </div>
              {searchResults.map((res) => (
                <button
                  key={res.id}
                  type="button"
                  onClick={() => handleSelectSearchResult(res)}
                  className="w-full px-4 py-2.5 text-left text-xs hover:bg-emerald-50 transition flex items-center justify-between border-b border-slate-50 last:border-none"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-slate-800">
                      {res.village}, {res.district}
                    </span>
                    <span className="text-slate-400">({res.state})</span>
                  </div>
                  <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    {res.lat}° N, {res.lng}° E
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3 & 4. Map Container & Selected Details Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Map View Area (Left 8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md overflow-hidden relative">
              
              {/* Map View Type Controls */}
              <div className="absolute top-4 left-4 z-20 flex bg-white/95 backdrop-blur-md p-1 rounded-xl shadow-md border border-slate-200 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setMapType('satellite')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    mapType === 'satellite'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Satellite (Farm Plots)
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('terrain')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    mapType === 'terrain'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Topographic Terrain
                </button>
                <button
                  type="button"
                  onClick={() => setMapType('roadmap')}
                  className={`px-3 py-1.5 rounded-lg transition ${
                    mapType === 'roadmap'
                      ? 'bg-emerald-600 text-white shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Roadmap
                </button>
              </div>

              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 z-20 flex flex-col bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.min(prev + 1, 18))}
                  className="p-2 hover:bg-slate-100 text-slate-700 transition"
                  title="Zoom In"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <div className="border-t border-slate-100" />
                <button
                  type="button"
                  onClick={() => setZoomLevel(prev => Math.max(prev - 1, 5))}
                  className="p-2 hover:bg-slate-100 text-slate-700 transition"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
              </div>

              {/* Interactive Map Canvas */}
              {apiKey && googleMapLoaded && !mapLoadError ? (
                // Google Maps JS SDK Canvas
                <div
                  ref={googleMapRef}
                  className="w-full h-[460px] sm:h-[520px] bg-slate-900"
                />
              ) : (
                // Friendly Agricultural Placeholder Map Interface
                <div
                  onClick={handlePlaceholderMapClick}
                  className="w-full h-[460px] sm:h-[520px] relative overflow-hidden cursor-crosshair select-none bg-[#1a3826] transition-colors"
                >
                  {/* Agricultural Satellite/Terrain Background Graphic */}
                  <div
                    className={`absolute inset-0 opacity-80 ${
                      mapType === 'satellite'
                        ? 'bg-[radial-gradient(#2d6a4f_2px,transparent_2px)] [background-size:24px_24px]'
                        : mapType === 'terrain'
                        ? 'bg-[radial-gradient(#ab9274_2px,transparent_2px)] [background-size:32px_32px]'
                        : 'bg-[radial-gradient(#64748b_2px,transparent_2px)] [background-size:28px_28px]'
                    }`}
                  />

                  {/* Simulated Topographic / Farm Plot Patterns */}
                  <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                      <pattern id="farm-grid" width="120" height="120" patternUnits="userSpaceOnUse">
                        <rect width="120" height="120" fill="none" stroke="#52b788" strokeWidth="0.8" strokeDasharray="4 4" />
                        <line x1="0" y1="60" x2="120" y2="60" stroke="#74c69d" strokeWidth="0.5" />
                        <line x1="60" y1="0" x2="60" y2="120" stroke="#74c69d" strokeWidth="0.5" />
                        <circle cx="60" cy="60" r="1.5" fill="#d8f3dc" />
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#farm-grid)" />
                    {/* Simulated canal curve */}
                    <path d="M-20,180 Q250,140 500,260 T900,220" fill="none" stroke="#38bdf8" strokeWidth="3" opacity="0.6" />
                    <path d="M120,-10 Q320,300 700,550" fill="none" stroke="#fbbf24" strokeWidth="1.5" strokeDasharray="6 3" opacity="0.5" />
                  </svg>

                  {/* Dynamic Centered / Placed Farmer Marker */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full flex flex-col items-center pointer-events-none z-10 animate-bounce">
                    <div className="bg-emerald-600 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-xl border-2 border-white flex items-center gap-1 whitespace-nowrap">
                      <Sprout className="w-3.5 h-3.5 text-emerald-200" />
                      <span>{selectedLocation.village}</span>
                    </div>
                    {/* Red Marker Pin */}
                    <div className="relative mt-1">
                      <div className="w-9 h-9 bg-red-600 text-white rounded-full flex items-center justify-center shadow-2xl border-2 border-white">
                        <MapPin className="w-5 h-5 fill-white text-red-600" />
                      </div>
                      <div className="w-3 h-3 bg-red-700 rotate-45 mx-auto -mt-1" />
                    </div>
                    {/* Shadow on ground */}
                    <div className="w-6 h-2 bg-black/40 rounded-full blur-[2px] mt-1" />
                  </div>

                  {/* Map Mode Notification Pill */}
                  <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 bg-slate-900/85 backdrop-blur-md text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 border border-white/10 shadow-lg">
                    <Info className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>
                      Interactive Agricultural Map Simulator. Tap anywhere on map to pin coordinates.
                    </span>
                  </div>

                  {/* Coordinate HUD Tag */}
                  <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-1.5 bg-black/70 backdrop-blur-md text-emerald-300 font-mono text-[11px] px-3 py-1.5 rounded-xl border border-emerald-500/30">
                    <Compass className="w-3.5 h-3.5" />
                    <span>Lat: {selectedLocation.lat}°, Lng: {selectedLocation.lng}°</span>
                  </div>
                </div>
              )}

            </div>

            <p className="text-[11px] text-slate-500 flex items-center gap-1 pl-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                Coordinates are processed client-side and saved into your browser's LocalStorage.
              </span>
            </p>
          </div>

          {/* Location Details & Save Card (Right 4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            
            <Card className="p-6 border-slate-200 shadow-md space-y-5 bg-white">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Selected Field Details</span>
                </span>
                <Badge variant="emerald" size="xs">
                  Active Geo-Pin
                </Badge>
              </div>

              {/* Village & Region Title */}
              <div>
                <h3 className="text-2xl font-black text-slate-900 leading-tight">
                  {selectedLocation.village}
                </h3>
                <p className="text-sm font-semibold text-emerald-700 mt-0.5">
                  {selectedLocation.district}, {selectedLocation.state}
                </p>
              </div>

              {/* 4. Formatted Latitude & Longitude */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">
                    Latitude
                  </span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {selectedLocation.lat}° N
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 uppercase text-[10px] font-bold block mb-0.5">
                    Longitude
                  </span>
                  <span className="text-base font-black text-slate-800 font-mono">
                    {selectedLocation.lng}° E
                  </span>
                </div>
              </div>

              {/* Agro-Climatic Insights */}
              <div className="space-y-2.5 text-xs">
                <div className="p-3 bg-emerald-50/70 rounded-xl border border-emerald-200/80">
                  <span className="font-bold text-emerald-950 block mb-0.5">Agro-Climatic Zone:</span>
                  <span className="text-emerald-800">{selectedLocation.zone || 'Central Indian Semi-Arid Zone'}</span>
                </div>

                <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200/80">
                  <span className="font-bold text-amber-950 block mb-0.5">Primary Soil Profile:</span>
                  <span className="text-amber-800">{selectedLocation.soil || 'Medium Black Loam'}</span>
                </div>

                <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/80">
                  <span className="font-bold text-blue-950 block mb-0.5">Recommended Crops for Pin:</span>
                  <span className="text-blue-800">{selectedLocation.crops || 'Wheat, Gram, Mustard, Soybean'}</span>
                </div>
              </div>

              {/* 7. Save Location Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  icon={Save}
                  onClick={handleSaveLocation}
                  className="w-full justify-center shadow-emerald-600/30 shadow-lg text-sm font-black"
                >
                  {language === 'kn' ? 'ಜಮೀನಿನ ಸ್ಥಳ ಉಳಿಸಿ (Save Location)' : language === 'hi' ? 'खेत का स्थान सुरक्षित करें (Save Location)' : 'Save Farm Location'}
                </Button>
              </div>

              {/* Direct Link to Dashboard */}
              <button
                type="button"
                onClick={onNavigateDashboard}
                className="w-full text-center py-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition"
              >
                Return to Farmer Dashboard →
              </button>
            </Card>

            {/* Google Maps API configuration helper */}
            <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <span className="font-bold text-slate-700 flex items-center gap-1">
                <Info className="w-3.5 h-3.5 text-emerald-600" />
                <span>Developer Note:</span>
              </span>
              <p>
                To enable live Google satellite imagery, set <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-slate-800">VITE_GOOGLE_MAPS_API_KEY</code> in your <code className="bg-white px-1.5 py-0.5 rounded border border-slate-300 font-mono text-slate-800">.env</code> file. The fallback interactive map is active and fully functional.
              </p>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

