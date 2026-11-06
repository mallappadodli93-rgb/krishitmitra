import React, { useState, useEffect, useRef, useMemo } from 'react';
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
  ChevronDown,
  Plus,
  Trash2,
  Edit3,
  Star,
  Pencil,
  RotateCcw,
  Check,
  ExternalLink,
  Droplets,
  AlertTriangle,
  LandPlot,
  Crosshair,
  Database,
  Cpu,
  Key,
  Satellite
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getActiveUser, setActiveUser } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFarmLocations,
  saveFarmLocation,
  updateFarmLocation,
  deleteFarmLocation,
  setPrimaryFarmLocation
} from '../services/farmerDataService';

// Comprehensive Indian Agricultural Places Database for Instant Village/District Search
const INDIAN_AGRI_PLACES = [
  // Karnataka
  { village: 'Sindhanur', district: 'Raichur', state: 'Karnataka', lat: 16.2160, lng: 77.3566, zone: 'Tungabhadra Rice & Cotton Belt', soil: 'Black / Regur Soil (Clayey)' },
  { village: 'Harihar', district: 'Davanagere', state: 'Karnataka', lat: 14.4644, lng: 75.9218, zone: 'Central Karnataka Maize Belt', soil: 'Red Sandy Loam / Red Soil' },
  { village: 'Maddur', district: 'Mandya', state: 'Karnataka', lat: 12.5218, lng: 76.8951, zone: 'Cauvery Sugarcane & Paddy Delta', soil: 'Alluvial / River Plains Loam' },
  { village: 'Channarayapatna', district: 'Hassan', state: 'Karnataka', lat: 13.0033, lng: 76.1004, zone: 'Southern Karnataka Ragi & Potato Zone', soil: 'Red Sandy Loam / Red Soil' },
  { village: 'Bailhongal', district: 'Belagavi', state: 'Karnataka', lat: 15.8167, lng: 74.8667, zone: 'Northern Transitional Cotton & Sugarcane', soil: 'Medium Black Loam' },
  { village: 'Byadagi', district: 'Haveri', state: 'Karnataka', lat: 14.6833, lng: 75.4833, zone: 'Byadagi Chilli & Groundnut Belt', soil: 'Medium Black Loam' },
  { village: 'Mudhol', district: 'Bagalkote', state: 'Karnataka', lat: 16.3333, lng: 75.2833, zone: 'Ghataprabha Sugarcane Command', soil: 'Deep Black Cotton Soil' },
  
  // Maharashtra
  { village: 'Niphad', district: 'Nashik', state: 'Maharashtra', lat: 20.0760, lng: 74.0435, zone: 'Godavari Vineyard & Onion Basin', soil: 'Medium Black Cotton (Regur) Loam' },
  { village: 'Dindori', district: 'Nashik', state: 'Maharashtra', lat: 20.2015, lng: 73.8320, zone: 'Nashik Grape & Table Vegetable Zone', soil: 'Red Sandy Loam / Red Soil' },
  { village: 'Baramati', district: 'Pune', state: 'Maharashtra', lat: 18.1519, lng: 74.5768, zone: 'Western Maharashtra Sugarcane Belt', soil: 'Medium Black Soil' },
  { village: 'Ausa', district: 'Latur', state: 'Maharashtra', lat: 18.4088, lng: 76.5604, zone: 'Marathwada Soybean & Tur Belt', soil: 'Medium Black & Clayey' },
  { village: 'Rahuri', district: 'Ahmednagar', state: 'Maharashtra', lat: 19.3900, lng: 74.6500, zone: 'Pravara Valley Sugarcane & Pulses', soil: 'Deep Black Vertisol' },
  
  // Punjab & Haryana
  { village: 'Khanna', district: 'Ludhiana', state: 'Punjab', lat: 30.7046, lng: 76.2163, zone: 'Trans-Gangetic Plains Sharbati Wheat Belt', soil: 'Alluvial Deep Loam' },
  { village: 'Taraori', district: 'Karnal', state: 'Haryana', lat: 29.6857, lng: 76.9905, zone: 'Basmati Rice & HD-3086 Wheat Zone', soil: 'Fertile Sandy Loam to Clay Loam' },
  
  // Gujarat & Rajasthan
  { village: 'Gondal', district: 'Rajkot', state: 'Gujarat', lat: 22.3039, lng: 70.8022, zone: 'Saurashtra Groundnut & Cotton Belt', soil: 'Medium Black Calcareous Soil' },
  { village: 'Behror', district: 'Alwar', state: 'Rajasthan', lat: 27.5530, lng: 76.6346, zone: 'Eastern Plains Mustard & Bajra Belt', soil: 'Sandy to Loamy Sand' },
  
  // Andhra Pradesh & Telangana
  { village: 'Tenali', district: 'Guntur', state: 'Andhra Pradesh', lat: 16.3067, lng: 80.4365, zone: 'Krishna Delta Guntur Chilli Belt', soil: 'Deep Black & Deltaic Clay' },
  { village: 'Warangal', district: 'Warangal', state: 'Telangana', lat: 17.9689, lng: 79.5941, zone: 'Telangana Cotton & Red Gram Zone', soil: 'Red Chalky & Black Soil' }
];

export default function LocationSelectionPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();

  // Farm Locations state (managed in IndexedDB)
  const [farmLocations, setFarmLocations] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Active / Selected Coordinates & Location Details
  const [activeCoords, setActiveCoords] = useState({ lat: 20.0760, lng: 74.0435 });
  const [activeAddress, setActiveAddress] = useState('Niphad, Nashik, Maharashtra');
  const [activeVillage, setActiveVillage] = useState('Niphad');
  const [activeDistrict, setActiveDistrict] = useState('Nashik');
  const [activeState, setActiveState] = useState('Maharashtra');

  // Search & Geocoding state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLocatingGPS, setIsLocatingGPS] = useState(false);

  // Map Controls
  const [mapType, setMapType] = useState('hybrid'); // 'hybrid' | 'roadmap' | 'terrain'
  const [zoomLevel, setZoomLevel] = useState(14);
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState([]); // Array of { lat, lng }

  // Form Modal / Edit Form state
  const [isEditingPlot, setIsEditingPlot] = useState(false);
  const [editingPlotData, setEditingPlotData] = useState({
    name: 'New Farm Plot',
    surveyNumber: 'Sy No. 101/A',
    landSize: 3.0,
    landUnit: 'Acres',
    waterSource: 'Canal & Borewell',
    soilType: 'Medium Black Cotton (Regur) Loam',
    soilPh: 7.2,
    purpose: 'Cereal & Commercial Crop Cultivation'
  });

  // Modals & Panels
  const [showAgriDataModal, setShowAgriDataModal] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('krishimitra_google_maps_key') || '');
  const [statusNotification, setStatusNotification] = useState('');

  // Google Maps API integration state
  const googleMapRef = useRef(null);
  const googleMapInstance = useRef(null);
  const markersRef = useRef([]);
  const polygonRef = useRef(null);
  const drawingPolygonRef = useRef(null);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [mapApiUnavailable, setMapApiUnavailable] = useState(false);

  // Read API Key from environment or localStorage override
  const apiKey = useMemo(() => {
    return customApiKey || import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';
  }, [customApiKey]);

  // Flash notification helper
  const notify = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 3500);
  };

  // 1. Load All Farm Locations from IndexedDB on Mount
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoadingLocations(true);
        const locations = await fetchFarmLocations();
        if (isMounted) {
          setFarmLocations(locations);
          const primary = locations.find(l => l.isPrimary) || locations[0];
          if (primary) {
            setSelectedFarmId(primary.id);
            setActiveCoords({ lat: primary.lat, lng: primary.lng });
            setActiveAddress(primary.address || `${primary.village}, ${primary.district}, ${primary.state}`);
            setActiveVillage(primary.village);
            setActiveDistrict(primary.district);
            setActiveState(primary.state);
            setDrawnBoundary(primary.boundaries || []);
          }
        }
      } catch (err) {
        console.error('Failed to load farm locations:', err);
      } finally {
        if (isMounted) setIsLoadingLocations(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // 2. Initialize Google Maps API or Handle Fallback
  useEffect(() => {
    if (!apiKey || apiKey === 'your_google_maps_api_key_here') {
      setGoogleMapsLoaded(false);
      setMapApiUnavailable(true);
      return;
    }

    // Check if script already loaded
    if (window.google?.maps) {
      setGoogleMapsLoaded(true);
      setMapApiUnavailable(false);
      initGoogleMap();
      return;
    }

    const scriptId = 'krishimitra-google-maps';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        setGoogleMapsLoaded(true);
        setMapApiUnavailable(false);
        initGoogleMap();
      };

      script.onerror = () => {
        console.warn('Google Maps script failed to load. Using friendly agricultural plot simulator.');
        setMapApiUnavailable(true);
      };

      document.head.appendChild(script);
    } else {
      script.addEventListener('load', () => {
        setGoogleMapsLoaded(true);
        setMapApiUnavailable(false);
        initGoogleMap();
      });
    }
  }, [apiKey]);

  // Initialize or Re-center Google Map
  const initGoogleMap = () => {
    if (!googleMapRef.current || !window.google?.maps) return;

    try {
      const center = { lat: activeCoords.lat, lng: activeCoords.lng };
      const map = new window.google.maps.Map(googleMapRef.current, {
        center,
        zoom: zoomLevel,
        mapTypeId: mapType === 'hybrid' ? 'hybrid' : mapType === 'terrain' ? 'terrain' : 'roadmap',
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        zoomControl: true,
      });

      // Map Click Handler: Place pin or add boundary vertex
      map.addListener('click', (e) => {
        const clickLat = parseFloat(e.latLng.lat().toFixed(6));
        const clickLng = parseFloat(e.latLng.lng().toFixed(6));

        if (isDrawingBoundary) {
          // Add vertex to polygon boundary
          setDrawnBoundary(prev => [...prev, { lat: clickLat, lng: clickLng }]);
        } else {
          // Move active location marker
          setActiveCoords({ lat: clickLat, lng: clickLng });
          reverseGeocodeCoordinates(clickLat, clickLng);
        }
      });

      googleMapInstance.current = map;
      renderAllFarmMarkersOnGoogleMap(map);
    } catch (err) {
      console.warn('Google Maps init failed, fallback active:', err);
      setMapApiUnavailable(true);
    }
  };

  // Render separate markers for ALL saved farm locations
  const renderAllFarmMarkersOnGoogleMap = (map) => {
    if (!map || !window.google?.maps) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    farmLocations.forEach((farm) => {
      const isSelected = farm.id === selectedFarmId;
      const marker = new window.google.maps.Marker({
        position: { lat: farm.lat, lng: farm.lng },
        map,
        title: farm.name,
        draggable: isSelected,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: farm.isPrimary ? 12 : 9,
          fillColor: farm.isPrimary ? '#059669' : (isSelected ? '#2563EB' : '#D97706'),
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2.5
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 4px; font-family: sans-serif; font-size: 12px;">
            <strong style="color: #064E3B; font-size: 13px;">${farm.name}</strong><br/>
            <span>${farm.surveyNumber} • ${farm.landSize} ${farm.landUnit}</span><br/>
            <span style="color: #6B7280;">${farm.village}, ${farm.district}</span>
          </div>
        `
      });

      marker.addListener('click', () => {
        handleSelectFarmPlot(farm);
        infoWindow.open(map, marker);
      });

      if (isSelected) {
        marker.addListener('dragend', (e) => {
          const newLat = parseFloat(e.latLng.lat().toFixed(6));
          const newLng = parseFloat(e.latLng.lng().toFixed(6));
          setActiveCoords({ lat: newLat, lng: newLng });
          reverseGeocodeCoordinates(newLat, newLng);
        });
      }

      markersRef.current.push(marker);
    });

    // Draw active boundary polygon
    if (polygonRef.current) polygonRef.current.setMap(null);
    if (drawnBoundary && drawnBoundary.length >= 3) {
      const polygon = new window.google.maps.Polygon({
        paths: drawnBoundary,
        strokeColor: '#10B981',
        strokeOpacity: 0.9,
        strokeWeight: 2.5,
        fillColor: '#10B981',
        fillOpacity: 0.25,
        map
      });
      polygonRef.current = polygon;
    }
  };

  // Sync Google Map when activeCoords, locations or mapType changes
  useEffect(() => {
    if (googleMapInstance.current && window.google?.maps) {
      googleMapInstance.current.setCenter({ lat: activeCoords.lat, lng: activeCoords.lng });
      googleMapInstance.current.setMapTypeId(
        mapType === 'hybrid' ? 'hybrid' : mapType === 'terrain' ? 'terrain' : 'roadmap'
      );
      renderAllFarmMarkersOnGoogleMap(googleMapInstance.current);
    }
  }, [activeCoords, farmLocations, selectedFarmId, mapType, drawnBoundary]);

  // Reverse Geocode helper (simulated or via Google Geocoder)
  const reverseGeocodeCoordinates = (lat, lng) => {
    if (window.google?.maps?.Geocoder) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ location: { lat, lng } }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          setActiveAddress(results[0].formatted_address);
          // Try parsing components
          results[0].address_components?.forEach(c => {
            if (c.types.includes('locality')) setActiveVillage(c.long_name);
            if (c.types.includes('administrative_area_level_2')) setActiveDistrict(c.long_name);
            if (c.types.includes('administrative_area_level_1')) setActiveState(c.long_name);
          });
        }
      });
    } else {
      // Find closest place in our agricultural database
      let closest = INDIAN_AGRI_PLACES[0];
      let minDistance = 999999;
      INDIAN_AGRI_PLACES.forEach(place => {
        const d = Math.hypot(place.lat - lat, place.lng - lng);
        if (d < minDistance) {
          minDistance = d;
          closest = place;
        }
      });
      setActiveVillage(closest.village);
      setActiveDistrict(closest.district);
      setActiveState(closest.state);
      setActiveAddress(`${closest.village}, ${closest.district}, ${closest.state}`);
    }
  };

  // Autocomplete search filtering
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const clean = searchQuery.toLowerCase().trim();
    const matches = INDIAN_AGRI_PLACES.filter(
      p =>
        p.village.toLowerCase().includes(clean) ||
        p.district.toLowerCase().includes(clean) ||
        p.state.toLowerCase().includes(clean)
    );
    setSearchResults(matches);
  }, [searchQuery]);

  // Select search result
  const handleSelectSearchResult = (place) => {
    setActiveCoords({ lat: place.lat, lng: place.lng });
    setActiveVillage(place.village);
    setActiveDistrict(place.district);
    setActiveState(place.state);
    setActiveAddress(`${place.village}, ${place.district}, ${place.state}`);
    setSearchQuery('');
    setSearchResults([]);
    notify(`Location centered: ${place.village}, ${place.district}`);
  };

  // GPS Geolocation
  const handleCurrentGPSLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocatingGPS(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingGPS(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        setActiveCoords({ lat, lng });
        reverseGeocodeCoordinates(lat, lng);
        notify(`Current Farm GPS locked: ${lat}° N, ${lng}° E`);
      },
      (err) => {
        setIsLocatingGPS(false);
        notify('GPS permission denied or timed out. Please click on map or search your village.');
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Select a Farm Plot
  const handleSelectFarmPlot = (farm) => {
    setSelectedFarmId(farm.id);
    setActiveCoords({ lat: farm.lat, lng: farm.lng });
    setActiveAddress(farm.address || `${farm.village}, ${farm.district}, ${farm.state}`);
    setActiveVillage(farm.village);
    setActiveDistrict(farm.district);
    setActiveState(farm.state);
    setDrawnBoundary(farm.boundaries || []);
    setEditingPlotData({
      name: farm.name,
      surveyNumber: farm.surveyNumber,
      landSize: farm.landSize,
      landUnit: farm.landUnit || 'Acres',
      waterSource: farm.waterSource,
      soilType: farm.soilType,
      soilPh: farm.soilPh || 7.2,
      purpose: farm.purpose || 'Cultivation'
    });
  };

  // Save / Update Farm Location to IndexedDB
  const handleSaveFarmLocation = async () => {
    try {
      const activePlot = farmLocations.find(l => l.id === selectedFarmId);
      const isNew = !activePlot || isEditingPlot === 'new';

      const farmPayload = {
        id: isNew ? `FARM-LOC-${Date.now().toString().slice(-4)}` : activePlot.id,
        name: editingPlotData.name || 'Main Farm Plot',
        surveyNumber: editingPlotData.surveyNumber || 'Sy No. 1',
        village: activeVillage,
        district: activeDistrict,
        state: activeState,
        address: activeAddress,
        lat: activeCoords.lat,
        lng: activeCoords.lng,
        landSize: parseFloat(editingPlotData.landSize) || 2.0,
        landUnit: editingPlotData.landUnit || 'Acres',
        waterSource: editingPlotData.waterSource || 'Canal',
        soilType: editingPlotData.soilType || 'Medium Black Loam',
        soilPh: parseFloat(editingPlotData.soilPh) || 7.0,
        purpose: editingPlotData.purpose || 'Cultivation',
        isPrimary: farmLocations.length === 0 ? true : (activePlot?.isPrimary ?? false),
        boundaries: drawnBoundary
      };

      await saveFarmLocation(farmPayload);
      const updatedList = await fetchFarmLocations();
      setFarmLocations(updatedList);
      setSelectedFarmId(farmPayload.id);
      setIsEditingPlot(false);
      setIsDrawingBoundary(false);

      // Also sync active location to localStorage for KrishiMitra modules (Weather & Crop Recommendation)
      localStorage.setItem('krishimitra_farm_location', JSON.stringify({
        village: farmPayload.village,
        district: farmPayload.district,
        state: farmPayload.state,
        lat: farmPayload.lat,
        lng: farmPayload.lng,
        soil: farmPayload.soilType,
        crops: farmPayload.purpose
      }));

      notify(`Farm location "${farmPayload.name}" saved in IndexedDB!`);
    } catch (err) {
      console.error('Failed to save farm location:', err);
      notify('Failed to save location to IndexedDB.');
    }
  };

  // Delete Farm Location
  const handleDeleteFarmLocation = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await deleteFarmLocation(id);
      const updatedList = await fetchFarmLocations();
      setFarmLocations(updatedList);
      if (selectedFarmId === id && updatedList.length > 0) {
        handleSelectFarmPlot(updatedList[0]);
      }
      notify(`Plot "${name}" deleted.`);
    } catch (err) {
      console.error('Failed to delete plot:', err);
    }
  };

  // Set Primary Farm
  const handleSetPrimary = async (id) => {
    try {
      await setPrimaryFarmLocation(id);
      const updatedList = await fetchFarmLocations();
      setFarmLocations(updatedList);
      notify('Primary farm updated! KrishiMitra weather & advisories will now focus on this plot.');
    } catch (err) {
      console.error('Failed to set primary:', err);
    }
  };

  // Boundary Drawing Actions
  const handleStartDrawBoundary = () => {
    setIsDrawingBoundary(true);
    setDrawnBoundary([]);
    notify('Boundary Drawing Active: Click around your field perimeter on the map to add vertices.');
  };

  const handleClearBoundary = () => {
    setDrawnBoundary([]);
    notify('Boundary cleared.');
  };

  const handleUndoVertex = () => {
    setDrawnBoundary(prev => prev.slice(0, -1));
  };

  // Calculate approximate polygon acreage
  const boundaryAcreage = useMemo(() => {
    if (drawnBoundary.length < 3) return null;
    // Planar Shoelace formula approximation for farm scale
    let area = 0;
    const n = drawnBoundary.length;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const x1 = drawnBoundary[i].lng * 111320 * Math.cos((drawnBoundary[i].lat * Math.PI) / 180);
      const y1 = drawnBoundary[i].lat * 110540;
      const x2 = drawnBoundary[j].lng * 111320 * Math.cos((drawnBoundary[j].lat * Math.PI) / 180);
      const y2 = drawnBoundary[j].lat * 110540;
      area += x1 * y2 - x2 * y1;
    }
    const sqMeters = Math.abs(area / 2);
    const acres = sqMeters / 4046.86;
    return acres.toFixed(2);
  }, [drawnBoundary]);

  const selectedFarm = farmLocations.find(l => l.id === selectedFarmId) || farmLocations[0];
  const totalAcreageManaged = farmLocations.reduce((sum, f) => sum + (parseFloat(f.landSize) || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* 1. Top Header */}
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
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-sm sm:text-base font-black text-slate-900 leading-tight">
                  Farm Location & Plot Management
                </h1>
                <p className="text-[11px] text-emerald-700 font-medium">
                  Google Maps JavaScript API • Multiple Plots • Boundary Tracing • IndexedDB
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* API Key Modal Button */}
            <button
              type="button"
              onClick={() => setShowApiKeyModal(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-emerald-50 transition"
              title="Configure Google Maps API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span>API Key</span>
            </button>

            {/* Agri Data Hub Button */}
            <button
              type="button"
              onClick={() => setShowAgriDataModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100 transition"
            >
              <Database className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Agri Data Services</span>
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

      {/* Toast Notification */}
      {statusNotification && (
        <div className="fixed top-24 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-emerald-500/40 flex items-center gap-2.5 text-xs sm:text-sm animate-in slide-in-from-top-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-semibold">{statusNotification}</span>
        </div>
      )}

      {/* 2. Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">

        {/* Hero Banner with Multi-Farm Stats */}
        <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-green-950 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-emerald-700/50">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 border border-emerald-400/30 rounded-full text-xs font-bold text-emerald-200">
                <LandPlot className="w-3.5 h-3.5 text-amber-300" />
                <span>Farmer Land Holding & Cadastral Mapping System</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Manage All Your Farm Plots in One Place
              </h2>
              <p className="text-emerald-100/90 text-xs sm:text-sm leading-relaxed">
                Pinpoint exact GPS coordinates, trace perimeter boundaries, manage multiple farm locations, and synchronize spatial boundaries with KrishiMitra’s weather and advisory engines.
              </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 shrink-0">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
                <span className="text-[10px] text-emerald-200 uppercase font-extrabold block">Saved Plots</span>
                <strong className="text-xl font-black text-white">{farmLocations.length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center">
                <span className="text-[10px] text-emerald-200 uppercase font-extrabold block">Total Acreage</span>
                <strong className="text-xl font-black text-amber-300">{totalAcreageManaged.toFixed(1)} Ac</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/15 text-center col-span-2 sm:col-span-1">
                <span className="text-[10px] text-emerald-200 uppercase font-extrabold block">Storage Engine</span>
                <strong className="text-sm font-black text-emerald-300">IndexedDB</strong>
              </div>
            </div>
          </div>
        </div>

        {/* ⚠️ CRITICAL DISCLAIMER: Google Maps vs Soil Quality */}
        <div className="p-4 sm:p-5 bg-amber-50/90 border-2 border-amber-300/80 rounded-2xl flex items-start gap-3.5 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs text-amber-950">
            <h3 className="font-extrabold text-sm text-amber-900 flex items-center gap-2">
              <span>Important: Google Maps Provides Geographical Coordinates, NOT Soil Data</span>
              <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 bg-amber-200 rounded font-black text-amber-900">
                Data Integrity Notice
              </span>
            </h3>
            <p className="leading-relaxed">
              Google Maps provides satellite imagery, road networks, and geographical latitude/longitude. <strong>Google Maps does NOT provide soil quality, soil pH, or crop suitability.</strong> Soil characteristics must be verified through laboratory soil testing (Soil Health Card) or ICAR regional survey references.
            </p>
          </div>
        </div>

        {/* 3. Search Bar, GPS Button & Map Mode Controls */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          
          {/* Autocomplete Search input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search village, town, district or state (e.g. Sindhanur, Raichur, Niphad, Khanna)..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 transition"
            />

            {/* Autocomplete Dropdown */}
            {searchResults.length > 0 && (
              <div className="absolute left-0 right-0 mt-2 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
                <div className="px-3 py-1 text-[10px] font-black uppercase text-slate-400 border-b border-slate-100">
                  Select Agricultural Location:
                </div>
                {searchResults.map((place, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectSearchResult(place)}
                    className="w-full px-3.5 py-2.5 text-left text-xs hover:bg-emerald-50 flex items-center justify-between transition border-b border-slate-50 last:border-b-0"
                  >
                    <div>
                      <strong className="text-slate-900 block font-extrabold">{place.village}, {place.district}</strong>
                      <span className="text-[11px] text-slate-500">{place.state} • {place.zone}</span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      {place.lat.toFixed(2)}°, {place.lng.toFixed(2)}°
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Action Buttons: GPS + Map Views */}
          <div className="flex flex-wrap items-center gap-2">
            
            {/* GPS Locator */}
            <button
              type="button"
              onClick={handleCurrentGPSLocation}
              disabled={isLocatingGPS}
              className="px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Navigation className={`w-3.5 h-3.5 ${isLocatingGPS ? 'animate-spin' : ''}`} />
              <span>{isLocatingGPS ? 'Locking GPS...' : 'My Current Farm GPS'}</span>
            </button>

            {/* Map Type Toggle */}
            <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setMapType('hybrid')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'hybrid' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Satellite className="w-3 h-3 text-emerald-600" />
                <span>Satellite</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('roadmap')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'roadmap' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Layers className="w-3 h-3 text-slate-600" />
                <span>Roadmap</span>
              </button>
              <button
                type="button"
                onClick={() => setMapType('terrain')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1 ${
                  mapType === 'terrain' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Terrain</span>
              </button>
            </div>

          </div>

        </div>

        {/* 4. Interactive Map & Farm Plot Management Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Main Map Viewer (8 Cols) */}
          <div className="lg:col-span-8 space-y-4">
            
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
              
              {/* Map Header Status Bar */}
              <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-700">Selected Coordinates:</span>
                  <span className="font-mono text-emerald-800 font-bold bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                    {activeCoords.lat.toFixed(6)}° N, {activeCoords.lng.toFixed(6)}° E
                  </span>
                </div>

                {/* Boundary Drawing Mode Indicator */}
                <div className="flex items-center gap-2">
                  {isDrawingBoundary ? (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 font-bold rounded-lg border border-amber-300 animate-pulse text-[11px]">
                      <Pencil className="w-3.5 h-3.5 text-amber-700" />
                      <span>Tracing Boundary ({drawnBoundary.length} points)</span>
                    </div>
                  ) : drawnBoundary.length >= 3 ? (
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                      Boundary Defined (~{boundaryAcreage} Acres)
                    </span>
                  ) : null}
                  <span className="text-[10px] text-slate-400">
                    {googleMapsLoaded ? '🟢 Google Maps JS API Active' : '🟡 Interactive Cadastral Simulator'}
                  </span>
                </div>
              </div>

              {/* Map Rendering Container */}
              <div className="relative w-full h-[450px] sm:h-[500px] bg-slate-100">
                
                {/* 1. Real Google Maps Container if API key provided and loaded */}
                <div
                  ref={googleMapRef}
                  className={`w-full h-full ${googleMapsLoaded && !mapApiUnavailable ? 'block' : 'hidden'}`}
                />

                {/* 2. Friendly Agricultural Interactive Fallback Simulator if API is unavailable */}
                {(!googleMapsLoaded || mapApiUnavailable) && (
                  <div
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const x = (e.clientX - rect.left) / rect.width;
                      const y = (e.clientY - rect.top) / rect.height;
                      // Convert relative click to simulated coordinates
                      const newLat = parseFloat((activeCoords.lat + (0.5 - y) * 0.04).toFixed(6));
                      const newLng = parseFloat((activeCoords.lng + (x - 0.5) * 0.04).toFixed(6));
                      
                      if (isDrawingBoundary) {
                        setDrawnBoundary(prev => [...prev, { lat: newLat, lng: newLng }]);
                      } else {
                        setActiveCoords({ lat: newLat, lng: newLng });
                        reverseGeocodeCoordinates(newLat, newLng);
                      }
                    }}
                    className={`w-full h-full relative cursor-crosshair overflow-hidden transition ${
                      mapType === 'hybrid'
                        ? 'bg-gradient-to-br from-emerald-950 via-green-900 to-slate-900'
                        : mapType === 'terrain'
                        ? 'bg-gradient-to-br from-amber-900 via-amber-800 to-emerald-900'
                        : 'bg-emerald-50/80'
                    }`}
                  >
                    {/* Simulated Cadastral Grid & Satellite Field Patterns */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none grid grid-cols-6 grid-rows-6 border border-white/20">
                      {Array.from({ length: 36 }).map((_, i) => (
                        <div key={i} className="border border-white/20 flex items-center justify-center text-[10px] text-white/40 font-mono">
                          Plot {i + 1}
                        </div>
                      ))}
                    </div>

                    {/* Fallback Notice Banner */}
                    <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-lg border border-slate-200 text-xs text-slate-800 max-w-sm">
                      <div className="flex items-center gap-2 font-black text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Interactive Agricultural Cadastral Plot Simulator</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        Click anywhere on map to position pin or trace field boundary vertices. To enable live Google Maps satellite tiles, click <strong>"API Key"</strong> above.
                      </p>
                    </div>

                    {/* Render Markers for ALL Saved Farm Locations on Fallback */}
                    {farmLocations.map((farm, idx) => {
                      const isSelected = farm.id === selectedFarmId;
                      // Relative positioning offset simulation
                      const dLat = (farm.lat - activeCoords.lat) * 2000;
                      const dLng = (farm.lng - activeCoords.lng) * 2000;
                      const top = Math.max(10, Math.min(85, 50 - dLat));
                      const left = Math.max(10, Math.min(85, 50 + dLng));

                      return (
                        <div
                          key={farm.id}
                          style={{ top: `${top}%`, left: `${left}%` }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectFarmPlot(farm);
                          }}
                          className="absolute -translate-x-1/2 -translate-y-full cursor-pointer z-30 group"
                        >
                          <div className={`p-2 rounded-2xl flex items-center gap-1.5 shadow-2xl transition transform group-hover:scale-110 ${
                            farm.isPrimary
                              ? 'bg-emerald-600 text-white ring-4 ring-emerald-300/60'
                              : isSelected
                              ? 'bg-blue-600 text-white ring-4 ring-blue-300/60'
                              : 'bg-amber-600 text-white ring-2 ring-white'
                          }`}>
                            <MapPin className="w-4 h-4" />
                            <span className="font-extrabold text-[11px] max-w-[120px] truncate block">
                              {farm.name}
                            </span>
                            {farm.isPrimary && <Star className="w-3 h-3 text-amber-300 fill-amber-300" />}
                          </div>
                          <div className="w-2 h-2 bg-slate-900 mx-auto rounded-full mt-0.5 shadow-md" />
                        </div>
                      );
                    })}

                    {/* Active Selected Marker */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full z-40 pointer-events-none animate-bounce">
                      <div className="px-3 py-1.5 bg-slate-950 text-white rounded-xl shadow-2xl font-black text-xs flex items-center gap-1.5 border border-emerald-400">
                        <Crosshair className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
                        <span>Active GPS Center</span>
                      </div>
                      <div className="w-3 h-3 bg-emerald-500 mx-auto rotate-45 -mt-1.5" />
                    </div>

                    {/* Drawn Boundary Polygon Lines (Simulated SVG) */}
                    {drawnBoundary.length >= 2 && (
                      <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                        <polygon
                          points={drawnBoundary.map(p => {
                            const dLat = (p.lat - activeCoords.lat) * 2000;
                            const dLng = (p.lng - activeCoords.lng) * 2000;
                            const x = (50 + dLng) * 8;
                            const y = (50 - dLat) * 5;
                            return `${x},${y}`;
                          }).join(' ')}
                          fill="rgba(16, 185, 129, 0.25)"
                          stroke="#10B981"
                          strokeWidth="2.5"
                          strokeDasharray="4"
                        />
                      </svg>
                    )}

                  </div>
                )}

              </div>

              {/* Map Footer Toolbar: Boundary Tracing Controls */}
              <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-2">
                  {!isDrawingBoundary ? (
                    <button
                      type="button"
                      onClick={handleStartDrawBoundary}
                      className="px-3.5 py-2 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-extrabold rounded-xl border border-slate-200 transition flex items-center gap-1.5"
                    >
                      <Pencil className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{drawnBoundary.length > 0 ? 'Re-Draw Farm Boundary' : 'Draw Farm Boundary'}</span>
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawingBoundary(false);
                          notify(`Boundary finalized with ${drawnBoundary.length} vertices!`);
                        }}
                        className="px-3.5 py-2 bg-emerald-600 text-white font-extrabold rounded-xl shadow-md transition flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Complete Boundary</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleUndoVertex}
                        disabled={drawnBoundary.length === 0}
                        className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl border border-slate-200 transition flex items-center gap-1 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Undo Vertex</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleClearBoundary}
                        className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl border border-red-200 transition flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Clear</span>
                      </button>
                    </>
                  )}
                </div>

                {/* Display Address & Elevation Note */}
                <div className="text-right text-[11px] text-slate-500 max-w-sm truncate">
                  <span className="font-bold text-slate-800 block truncate">{activeAddress}</span>
                  <span>{activeVillage}, {activeDistrict}, {activeState}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Right Sidebar: Farm Plots List & Plot Management Form (4 Cols) */}
          <div className="lg:col-span-4 space-y-5">
            
            {/* Multiple Farm Plots List */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <LandPlot className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-black text-sm text-slate-900">
                    Your Farm Plots ({farmLocations.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditingPlot('new');
                    setEditingPlotData({
                      name: `Plot #${farmLocations.length + 1}`,
                      surveyNumber: `Sy No. ${Math.floor(Math.random() * 200)}/A`,
                      landSize: 2.5,
                      landUnit: 'Acres',
                      waterSource: 'Borewell',
                      soilType: 'Medium Black Loam',
                      soilPh: 7.2,
                      purpose: 'Horticulture / Cash Crops'
                    });
                    setDrawnBoundary([]);
                  }}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs rounded-lg border border-emerald-200 transition flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Plot</span>
                </button>
              </div>

              {/* List of Farm Plots */}
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {farmLocations.map((farm) => {
                  const isSelected = farm.id === selectedFarmId;

                  return (
                    <div
                      key={farm.id}
                      onClick={() => handleSelectFarmPlot(farm)}
                      className={`p-3.5 rounded-2xl border transition cursor-pointer text-xs ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-400 ring-2 ring-emerald-300/40 shadow-sm'
                          : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <strong className="text-slate-900 font-extrabold block">
                              {farm.name}
                            </strong>
                            {farm.isPrimary && (
                              <span className="text-[10px] font-black bg-emerald-600 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                <Star className="w-2.5 h-2.5 fill-current" /> Primary
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            {farm.surveyNumber} • {farm.landSize} {farm.landUnit || 'Acres'}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-mono">
                            {farm.village}, {farm.district} ({farm.lat.toFixed(4)}°, {farm.lng.toFixed(4)}°)
                          </span>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {!farm.isPrimary && (
                            <button
                              type="button"
                              onClick={() => handleSetPrimary(farm.id)}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                              title="Set as Primary Farm"
                            >
                              <Star className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleSelectFarmPlot(farm);
                              setIsEditingPlot(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                            title="Edit Plot Details"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          {farmLocations.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleDeleteFarmLocation(farm.id, farm.name)}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Farm Plot"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Farm Plot Details & Save Form */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-3.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                <h3 className="font-black text-sm text-slate-900">
                  {isEditingPlot ? (isEditingPlot === 'new' ? 'Create New Farm Plot' : 'Edit Plot Details') : 'Selected Plot Attributes'}
                </h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full">
                  IndexedDB Persisted
                </span>
              </div>

              {/* Form Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    Plot / Farm Name:
                  </label>
                  <input
                    type="text"
                    value={editingPlotData.name}
                    onChange={(e) => setEditingPlotData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="e.g. Canal Main Field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                      Survey / Gat No:
                    </label>
                    <input
                      type="text"
                      value={editingPlotData.surveyNumber}
                      onChange={(e) => setEditingPlotData(prev => ({ ...prev, surveyNumber: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                      placeholder="e.g. Sy No. 142/A"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                      Land Area (Acres):
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={editingPlotData.landSize}
                      onChange={(e) => setEditingPlotData(prev => ({ ...prev, landSize: e.target.value }))}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    Water Availability Source:
                  </label>
                  <input
                    type="text"
                    value={editingPlotData.waterSource}
                    onChange={(e) => setEditingPlotData(prev => ({ ...prev, waterSource: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    placeholder="e.g. Perennial Canal & Borewell"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-extrabold uppercase text-slate-500 block mb-1">
                    Verified Soil Type:
                  </label>
                  <input
                    type="text"
                    value={editingPlotData.soilType}
                    onChange={(e) => setEditingPlotData(prev => ({ ...prev, soilType: e.target.value }))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-900"
                    placeholder="e.g. Medium Black Cotton Soil"
                  />
                </div>

                {/* Save Button */}
                <button
                  type="button"
                  onClick={handleSaveFarmLocation}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl shadow-lg shadow-emerald-700/20 flex items-center justify-center gap-2 transition active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Farm Location to IndexedDB</span>
                </button>
              </div>
            </div>

          </div>

        </div>

        {/* 5. Future Agricultural Data Services Integration Hub Modal */}
        {showAgriDataModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-600" />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Agricultural Data Services Integration Hub
                    </h3>
                    <p className="text-xs text-slate-500">
                      Independent from Google Maps • Soil, Satellite & Agro-Met Services
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAgriDataModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700 max-h-[70vh] overflow-y-auto pr-1">
                <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-amber-950 space-y-1">
                  <strong className="block text-sm font-extrabold">Notice on Map vs Agricultural Data</strong>
                  <p className="leading-relaxed text-[11px]">
                    Google Maps provides geospatial positioning. Physical soil quality and agronomic suitability are retrieved via dedicated national agricultural databases and field testing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">1. Soil Health Card (SHC) API</span>
                    <p className="text-[11px] text-slate-500">
                      National portal integration for certified laboratory testing of N, P, K, Organic Carbon, and micronutrients.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700">Contract Ready</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">2. ISRO Bhuvan Krishi Satellite</span>
                    <p className="text-[11px] text-slate-500">
                      Multispectral NDVI vegetation index, soil moisture radar, and surface evapotranspiration.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700">Contract Ready</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">3. ICAR-NBSS&LUP Soil Registry</span>
                    <p className="text-[11px] text-slate-500">
                      National Bureau of Soil Survey benchmark dataset providing regional soil texture and drainage profiles.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700">Active in KrishiMitra</span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                    <span className="font-bold text-slate-900 block">4. IMD & Open-Meteo Agro-Met</span>
                    <p className="text-[11px] text-slate-500">
                      High-resolution 7-day precipitation forecasts, wind speeds, and temperature thresholds.
                    </p>
                    <span className="text-[10px] font-bold text-emerald-700">Active in KrishiMitra</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-right">
                <button
                  type="button"
                  onClick={() => setShowAgriDataModal(false)}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Understood
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 6. Google Maps API Key Modal */}
        {showApiKeyModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Key className="w-5 h-5 text-amber-600" />
                  <h3 className="font-extrabold text-base text-slate-900">
                    Google Maps API Key
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <p>
                  You can set your Google Maps JavaScript API key in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code> under <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_MAPS_API_KEY</code>, or paste it below for testing:
                </p>

                <input
                  type="password"
                  value={customApiKey}
                  onChange={(e) => setCustomApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />

                <p className="text-[11px] text-slate-500 leading-relaxed">
                  If left empty, KrishiMitra automatically activates the <strong>Agricultural Cadastral Simulator Map</strong> so you can test all features without requiring billing or credentials.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    localStorage.setItem('krishimitra_google_maps_key', customApiKey);
                    setShowApiKeyModal(false);
                    notify('API Key saved! Reloading map...');
                    window.location.reload();
                  }}
                  className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-sm"
                >
                  Save & Reload Map
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

    </div>
  );
}
