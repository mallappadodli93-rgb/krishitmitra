import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
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
  Crosshair,
  Database,
  Key,
  Satellite,
  Download,
  Upload,
  Share2,
  Eye,
  Locate,
  LocateFixed,
  Ruler,
  X,
  FileDown,
  FileUp,
  Map as MapIcon
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { getActiveUser } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchFarmLocations,
  saveFarmLocation,
  updateFarmLocation,
  deleteFarmLocation,
  setPrimaryFarmLocation
} from '../services/farmerDataService';

export default function LocationSelectionPage({
  onNavigateHome,
  onNavigateDashboard,
  onNavigateCropRecommendation,
  onNavigateWeather
}) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const activeUser = getActiveUser();

  // Active Tab: 'plots' | 'details' | 'boundary' | 'agri'
  const [activeTab, setActiveTab] = useState('plots');

  // Farm Locations state (managed in IndexedDB)
  const [farmLocations, setFarmLocations] = useState([]);
  const [selectedFarmId, setSelectedFarmId] = useState(null);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);

  // Active / Selected Location Coordinates & Geographic Details
  const [activeCoords, setActiveCoords] = useState({ lat: 20.0760, lng: 74.0435 }); // default Niphad/Maharashtra
  const [activeAddress, setActiveAddress] = useState('Niphad, Nashik, Maharashtra, India');
  const [activeCountry, setActiveCountry] = useState('India');
  const [activeState, setActiveState] = useState('Maharashtra');
  const [activeDistrict, setActiveDistrict] = useState('Nashik');
  const [activeVillage, setActiveVillage] = useState('Niphad');
  const [activePostalCode, setActivePostalCode] = useState('422303');

  // Search & Places State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef(null);
  const autocompleteRef = useRef(null);

  // Real-Time GPS Tracking State
  const [isLiveTracking, setIsLiveTracking] = useState(false);
  const [isLocatingOneShot, setIsLocatingOneShot] = useState(false);
  const [gpsAccuracy, setGpsAccuracy] = useState(null); // in meters
  const [currentGpsCoords, setCurrentGpsCoords] = useState(null);
  const watchIdRef = useRef(null);
  const gpsMarkerRef = useRef(null);
  const gpsCircleRef = useRef(null);

  // Map Controls & Preferences (persisted in localStorage)
  const [mapType, setMapType] = useState(() => localStorage.getItem('krishimitra_map_type') || 'hybrid');
  const [zoomLevel, setZoomLevel] = useState(() => parseInt(localStorage.getItem('krishimitra_map_zoom') || '14', 10));
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Boundary Drawing State (Polygon Vertices)
  const [isDrawingBoundary, setIsDrawingBoundary] = useState(false);
  const [drawnBoundary, setDrawnBoundary] = useState([]); // Array of { lat, lng }
  const drawingManagerRef = useRef(null);
  const activePolygonRef = useRef(null);
  const savedPolygonsRef = useRef([]);

  // Farm Edit Form Modal
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlotData, setEditingPlotData] = useState({
    name: 'Main Farm Plot',
    surveyNumber: 'Sy No. 101/A',
    landSize: 3.5,
    landUnit: 'Acres',
    waterSource: 'Canal & Borewell',
    soilType: 'Medium Black Cotton (Regur) Loam',
    soilPh: 7.2,
    purpose: 'Cereal & Vegetable Cultivation'
  });

  // Google Maps API Key Management
  const [customApiKey, setCustomApiKey] = useState(() => localStorage.getItem('krishimitra_google_maps_key') || '');
  const [apiKeyInput, setApiKeyInput] = useState('');
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [mapsAuthError, setMapsAuthError] = useState(false);
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);
  const [scriptLoadError, setScriptLoadError] = useState('');
  const [statusNotification, setStatusNotification] = useState('');

  // DOM & Map Instance Refs
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const activePinMarkerRef = useRef(null);
  const farmMarkersRef = useRef([]);
  const fileInputImportRef = useRef(null);

  // Active API Key (prioritizes user custom key, then env key, then empty string)
  const effectiveApiKey = useMemo(() => {
    return customApiKey.trim() || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '').trim();
  }, [customApiKey]);

  // Flash notification helper
  const notify = (msg) => {
    setStatusNotification(msg);
    setTimeout(() => setStatusNotification(''), 4000);
  };

  // 1. Load All Farm Locations from IndexedDB on Mount
  const loadFarmsFromDB = useCallback(async () => {
    try {
      setIsLoadingLocations(true);
      const locations = await fetchFarmLocations();
      setFarmLocations(locations || []);
      const primary = locations.find((l) => l.isPrimary) || locations[0];
      if (primary) {
        setSelectedFarmId(primary.id);
        setActiveCoords({ lat: primary.lat, lng: primary.lng });
        setActiveAddress(primary.address || `${primary.village}, ${primary.district}, ${primary.state}`);
        setActiveVillage(primary.village || '');
        setActiveDistrict(primary.district || '');
        setActiveState(primary.state || '');
        setActiveCountry(primary.country || 'India');
        setActivePostalCode(primary.postalCode || '');
        setDrawnBoundary(primary.boundaries || []);
      }
    } catch (err) {
      console.error('Failed to load farm locations from IndexedDB:', err);
    } finally {
      setIsLoadingLocations(false);
    }
  }, []);

  useEffect(() => {
    loadFarmsFromDB();
  }, [loadFarmsFromDB]);

  // Catch Google Maps Authentication Failure globally
  useEffect(() => {
    window.gm_authFailure = () => {
      console.warn('Google Maps API Key Authentication Failure detected.');
      setMapsAuthError(true);
    };
    return () => {
      delete window.gm_authFailure;
    };
  }, []);

  // 2. Load Google Maps JavaScript API Script dynamically
  useEffect(() => {
    let isMounted = true;

    const loadMapsScript = () => {
      if (window.google?.maps) {
        if (isMounted) {
          setGoogleMapsLoaded(true);
          initMap();
        }
        return;
      }

      const scriptId = 'krishimitra-google-maps-api-script';
      const existingScript = document.getElementById(scriptId);
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.id = scriptId;
      const params = new URLSearchParams({
        libraries: 'places,geometry,drawing',
        v: 'weekly',
        callback: '__initKrishiMitraMap'
      });
      if (effectiveApiKey) {
        params.set('key', effectiveApiKey);
      }

      window.__initKrishiMitraMap = () => {
        if (isMounted) {
          setGoogleMapsLoaded(true);
          initMap();
        }
      };

      script.src = `https://maps.googleapis.com/maps/api/js?${params.toString()}`;
      script.async = true;
      script.defer = true;
      script.onerror = (e) => {
        console.error('Google Maps script failed to load:', e);
        if (isMounted) {
          setScriptLoadError('Failed to load Google Maps script. Please check your internet connection or API key.');
        }
      };

      document.head.appendChild(script);
    };

    loadMapsScript();

    return () => {
      isMounted = false;
      delete window.__initKrishiMitraMap;
    };
  }, [effectiveApiKey]);

  // 3. Initialize Google Map Instance
  const initMap = useCallback(() => {
    if (!mapContainerRef.current || !window.google?.maps) return;

    try {
      const center = { lat: activeCoords.lat, lng: activeCoords.lng };
      const map = new window.google.maps.Map(mapContainerRef.current, {
        center,
        zoom: zoomLevel,
        mapTypeId: mapType,
        mapTypeControl: false, // custom buttons
        zoomControl: true,
        streetViewControl: true,
        fullscreenControl: true,
        gestureHandling: 'greedy', // smooth touch navigation on Android/iOS
        rotateControl: true,
        scaleControl: true
      });

      mapInstanceRef.current = map;

      // Track Zoom Level in LocalStorage
      map.addListener('zoom_changed', () => {
        const newZoom = map.getZoom();
        if (newZoom) {
          setZoomLevel(newZoom);
          localStorage.setItem('krishimitra_map_zoom', String(newZoom));
        }
      });

      // Map Click Handler: Place Pin or add Boundary Vertex
      map.addListener('click', (e) => {
        const clickLat = parseFloat(e.latLng.lat().toFixed(6));
        const clickLng = parseFloat(e.latLng.lng().toFixed(6));

        if (isDrawingBoundary) {
          // Add vertex to polygon boundary
          setDrawnBoundary((prev) => [...prev, { lat: clickLat, lng: clickLng }]);
        } else {
          // Move active location marker
          setActiveCoords({ lat: clickLat, lng: clickLng });
          reverseGeocode(clickLat, clickLng);
        }
      });

      // Initialize Places Autocomplete on Search Input
      initPlacesAutocomplete(map);

      // Render Markers and Polygons
      renderActivePinMarker(map, center);
      renderAllSavedFarmMarkers(map);
      renderAllSavedBoundaries(map);
    } catch (err) {
      console.error('Error initializing Google Maps:', err);
    }
  }, [activeCoords.lat, activeCoords.lng, isDrawingBoundary, mapType, zoomLevel]);

  // 4. Initialize Google Places Autocomplete
  const initPlacesAutocomplete = (map) => {
    if (!searchInputRef.current || !window.google?.maps?.places) return;

    try {
      const autocomplete = new window.google.maps.places.Autocomplete(searchInputRef.current, {
        fields: ['formatted_address', 'geometry', 'name', 'address_components']
      });

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace();
        if (!place.geometry || !place.geometry.location) {
          handleManualSearch();
          return;
        }

        const lat = parseFloat(place.geometry.location.lat().toFixed(6));
        const lng = parseFloat(place.geometry.location.lng().toFixed(6));

        setActiveCoords({ lat, lng });

        if (place.geometry.viewport) {
          map.fitBounds(place.geometry.viewport);
        } else {
          map.setCenter({ lat, lng });
          map.setZoom(16);
        }

        // Parse address components
        parseAndSetAddressComponents(place.address_components, place.formatted_address || place.name);
        notify(`Location selected: ${place.name || place.formatted_address}`);
      });

      autocompleteRef.current = autocomplete;
    } catch (e) {
      console.warn('Places Autocomplete initialization notice:', e);
    }
  };

  // 5. Parse Address Components into State
  const parseAndSetAddressComponents = (components, formatted) => {
    if (formatted) setActiveAddress(formatted);

    let country = '';
    let state = '';
    let district = '';
    let village = '';
    let postal = '';

    if (components && Array.isArray(components)) {
      components.forEach((c) => {
        if (c.types.includes('country')) country = c.long_name;
        if (c.types.includes('administrative_area_level_1')) state = c.long_name;
        if (c.types.includes('administrative_area_level_2')) district = c.long_name;
        if (c.types.includes('locality') || c.types.includes('sublocality') || c.types.includes('postal_town')) {
          if (!village) village = c.long_name;
        }
        if (c.types.includes('postal_code')) postal = c.long_name;
      });
    }

    if (country) setActiveCountry(country);
    if (state) setActiveState(state);
    if (district) setActiveDistrict(district);
    if (village) setActiveVillage(village);
    if (postal) setActivePostalCode(postal);
  };

  // 6. Reverse Geocoding with Google Maps Geocoder
  const reverseGeocode = (lat, lng) => {
    if (!window.google?.maps?.Geocoder) {
      setActiveAddress(`${lat}° N, ${lng}° E`);
      return;
    }

    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === 'OK' && results && results[0]) {
        parseAndSetAddressComponents(results[0].address_components, results[0].formatted_address);
      } else {
        setActiveAddress(`Geographical Location (${lat}, ${lng})`);
      }
    });
  };

  // 7. Manual Search Handler (supports lat/lng, pin codes, addresses, landmarks, countries worldwide)
  const handleManualSearch = () => {
    const query = searchQuery.trim();
    if (!query || !mapInstanceRef.current || !window.google?.maps) return;

    setIsSearching(true);

    // Check if input is Latitude, Longitude format (e.g. "16.2160, 77.3566")
    const coordMatch = query.match(/^([-+]?\d{1,2}(?:\.\d+)?)[,\s]+([-+]?\d{1,3}(?:\.\d+)?)$/);
    if (coordMatch) {
      const lat = parseFloat(parseFloat(coordMatch[1]).toFixed(6));
      const lng = parseFloat(parseFloat(coordMatch[2]).toFixed(6));
      setActiveCoords({ lat, lng });
      mapInstanceRef.current.setCenter({ lat, lng });
      mapInstanceRef.current.setZoom(16);
      reverseGeocode(lat, lng);
      setIsSearching(false);
      notify(`Coordinates located: ${lat}, ${lng}`);
      return;
    }

    // Use Geocoder for text queries
    const geocoder = new window.google.maps.Geocoder();
    geocoder.geocode({ address: query }, (results, status) => {
      setIsSearching(false);
      if (status === 'OK' && results && results[0]) {
        const loc = results[0].geometry.location;
        const lat = parseFloat(loc.lat().toFixed(6));
        const lng = parseFloat(loc.lng().toFixed(6));

        setActiveCoords({ lat, lng });

        if (results[0].geometry.viewport) {
          mapInstanceRef.current.fitBounds(results[0].geometry.viewport);
        } else {
          mapInstanceRef.current.setCenter({ lat, lng });
          mapInstanceRef.current.setZoom(15);
        }

        parseAndSetAddressComponents(results[0].address_components, results[0].formatted_address);
        notify(`Found: ${results[0].formatted_address}`);
      } else {
        notify(`Location "${query}" could not be resolved. Please verify spelling or click on the map.`);
      }
    });
  };

  // 8. Render Active Selected Pin Marker
  const renderActivePinMarker = (map, position) => {
    if (!map || !window.google?.maps) return;

    if (activePinMarkerRef.current) {
      activePinMarkerRef.current.setPosition(position);
      return;
    }

    const marker = new window.google.maps.Marker({
      position,
      map,
      title: 'Selected Farm Location',
      animation: window.google.maps.Animation.DROP,
      draggable: true,
      zIndex: 999,
      icon: {
        path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2,
        scale: 1.8,
        anchor: new window.google.maps.Point(12, 22)
      }
    });

    marker.addListener('dragend', (e) => {
      const newLat = parseFloat(e.latLng.lat().toFixed(6));
      const newLng = parseFloat(e.latLng.lng().toFixed(6));
      setActiveCoords({ lat: newLat, lng: newLng });
      reverseGeocode(newLat, newLng);
    });

    activePinMarkerRef.current = marker;
  };

  // 9. Render All Saved Farm Locations on Map Simultaneously
  const renderAllSavedFarmMarkers = useCallback((map) => {
    if (!map || !window.google?.maps) return;

    // Clear existing saved markers
    farmMarkersRef.current.forEach((m) => m.setMap(null));
    farmMarkersRef.current = [];

    farmLocations.forEach((farm) => {
      const isSelected = farm.id === selectedFarmId;
      const isPrimary = !!farm.isPrimary;

      const marker = new window.google.maps.Marker({
        position: { lat: farm.lat, lng: farm.lng },
        map,
        title: farm.name,
        zIndex: isSelected ? 50 : 10,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: isPrimary ? 13 : (isSelected ? 11 : 9),
          fillColor: isPrimary ? '#059669' : (isSelected ? '#2563EB' : '#D97706'),
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 2.5
        }
      });

      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 6px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; color: #1e293b;">
            <div style="display: flex; align-items: center; gap: 4px; margin-bottom: 2px;">
              <strong style="color: #065f46; font-size: 13px;">${farm.name}</strong>
              ${isPrimary ? '<span style="background: #d1fae5; color: #065f46; padding: 1px 5px; border-radius: 4px; font-size: 10px; font-weight: bold;">PRIMARY</span>' : ''}
            </div>
            <div style="color: #64748b; font-size: 11px; margin-bottom: 4px;">
              ${farm.surveyNumber || 'Sy No.'} • ${farm.landSize} ${farm.landUnit || 'Acres'}
            </div>
            <div style="color: #334155; font-size: 11px;">
              📍 ${farm.village || ''}, ${farm.district || ''}
            </div>
          </div>
        `
      });

      marker.addListener('click', () => {
        handleSelectFarm(farm);
        infoWindow.open(map, marker);
      });

      farmMarkersRef.current.push(marker);
    });
  }, [farmLocations, selectedFarmId]);

  // 10. Render Boundaries (Both Saved Polygons and Active Drawing Polygon)
  const renderAllSavedBoundaries = useCallback((map) => {
    if (!map || !window.google?.maps) return;

    // Clear saved polygon overlays
    savedPolygonsRef.current.forEach((p) => p.setMap(null));
    savedPolygonsRef.current = [];

    // Render other saved farm boundaries
    farmLocations.forEach((farm) => {
      if (farm.boundaries && farm.boundaries.length >= 3 && farm.id !== selectedFarmId) {
        const poly = new window.google.maps.Polygon({
          paths: farm.boundaries,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: '#3B82F6',
          fillOpacity: 0.15,
          map,
          clickable: true
        });

        poly.addListener('click', () => {
          handleSelectFarm(farm);
        });

        savedPolygonsRef.current.push(poly);
      }
    });

    // Render currently active / drawn boundary
    if (activePolygonRef.current) {
      activePolygonRef.current.setMap(null);
      activePolygonRef.current = null;
    }

    if (drawnBoundary && drawnBoundary.length >= 2) {
      const activePoly = new window.google.maps.Polygon({
        paths: drawnBoundary,
        strokeColor: '#10B981',
        strokeOpacity: 0.95,
        strokeWeight: 3,
        fillColor: '#10B981',
        fillOpacity: 0.28,
        editable: isDrawingBoundary,
        draggable: false,
        zIndex: 100,
        map
      });

      // Listen to editable vertex dragging
      if (isDrawingBoundary) {
        const path = activePoly.getPath();
        const updateFromPath = () => {
          const newCoords = [];
          for (let i = 0; i < path.getLength(); i++) {
            const pt = path.getAt(i);
            newCoords.push({ lat: parseFloat(pt.lat().toFixed(6)), lng: parseFloat(pt.lng().toFixed(6)) });
          }
          setDrawnBoundary(newCoords);
        };
        path.addListener('set_at', updateFromPath);
        path.addListener('insert_at', updateFromPath);
        path.addListener('remove_at', updateFromPath);
      }

      activePolygonRef.current = activePoly;
    }
  }, [drawnBoundary, farmLocations, isDrawingBoundary, selectedFarmId]);

  // Sync Map when active coordinates or boundary changes
  useEffect(() => {
    if (mapInstanceRef.current && window.google?.maps) {
      const map = mapInstanceRef.current;
      renderActivePinMarker(map, activeCoords);
      renderAllSavedFarmMarkers(map);
      renderAllSavedBoundaries(map);
    }
  }, [activeCoords, renderAllSavedBoundaries, renderAllSavedFarmMarkers]);

  // Handle Map Type Switching
  const handleChangeMapType = (newType) => {
    setMapType(newType);
    localStorage.setItem('krishimitra_map_type', newType);
    if (mapInstanceRef.current && window.google?.maps) {
      mapInstanceRef.current.setMapTypeId(newType);
    }
  };

  // 11. Real-Time GPS Tracking Implementation
  const handleUseMyCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocatingOneShot(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocatingOneShot(false);
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

        setActiveCoords({ lat, lng });
        setCurrentGpsCoords({ lat, lng });
        setGpsAccuracy(acc);

        if (mapInstanceRef.current) {
          mapInstanceRef.current.panTo({ lat, lng });
          mapInstanceRef.current.setZoom(17);
        }

        reverseGeocode(lat, lng);
        updateGpsMapMarker(lat, lng, acc);
        notify(`Current Device GPS locked: ${lat}° N, ${lng}° E (±${acc || 5}m accuracy)`);
      },
      (err) => {
        setIsLocatingOneShot(false);
        let msg = 'Unable to retrieve your location.';
        if (err.code === err.PERMISSION_DENIED) {
          msg = 'Location permission was denied. Please allow location access in your browser settings.';
        } else if (err.code === err.TIMEOUT) {
          msg = 'Location request timed out. Please try again with clear sky view.';
        }
        notify(msg);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  };

  const handleStartLiveGpsTracking = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your device.');
      return;
    }

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setIsLiveTracking(true);
    notify('Live GPS tracking started. Following your device movement...');

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = parseFloat(pos.coords.latitude.toFixed(6));
        const lng = parseFloat(pos.coords.longitude.toFixed(6));
        const acc = pos.coords.accuracy ? Math.round(pos.coords.accuracy) : null;

        setCurrentGpsCoords({ lat, lng });
        setGpsAccuracy(acc);
        updateGpsMapMarker(lat, lng, acc);
      },
      (err) => {
        console.warn('GPS WatchPosition error:', err);
        setIsLiveTracking(false);
        notify(`GPS Error: ${err.message || 'Permission denied'}`);
      },
      { enableHighAccuracy: true, maximumAge: 3000, timeout: 15000 }
    );
  };

  const handleStopLiveGpsTracking = () => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    setIsLiveTracking(false);
    notify('Live GPS tracking stopped.');
  };

  const handleRecenterMyLocation = () => {
    if (currentGpsCoords && mapInstanceRef.current) {
      mapInstanceRef.current.panTo(currentGpsCoords);
      mapInstanceRef.current.setZoom(17);
      notify(`Map centered on current GPS: ${currentGpsCoords.lat}, ${currentGpsCoords.lng}`);
    } else {
      handleUseMyCurrentLocation();
    }
  };

  const updateGpsMapMarker = (lat, lng, accuracy) => {
    if (!mapInstanceRef.current || !window.google?.maps) return;
    const map = mapInstanceRef.current;

    // Pulsing Blue Dot Marker for GPS
    if (gpsMarkerRef.current) {
      gpsMarkerRef.current.setPosition({ lat, lng });
    } else {
      gpsMarkerRef.current = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: 'Your Current Live Device Position',
        zIndex: 1000,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#3B82F6',
          fillOpacity: 1,
          strokeColor: '#FFFFFF',
          strokeWeight: 3
        }
      });
    }

    // Accuracy Circle
    if (accuracy) {
      if (gpsCircleRef.current) {
        gpsCircleRef.current.setCenter({ lat, lng });
        gpsCircleRef.current.setRadius(accuracy);
      } else {
        gpsCircleRef.current = new window.google.maps.Circle({
          center: { lat, lng },
          radius: accuracy,
          map,
          fillColor: '#60A5FA',
          fillOpacity: 0.15,
          strokeColor: '#3B82F6',
          strokeOpacity: 0.6,
          strokeWeight: 1.5,
          zIndex: 99
        });
      }
    }
  };

  // Clean up GPS watch on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // 12. Farm Boundary Calculations (Acres, Hectares, Perimeter)
  const boundaryCalculations = useMemo(() => {
    if (drawnBoundary.length < 3) return null;

    let areaSqMeters = 0;
    let perimeterMeters = 0;

    if (window.google?.maps?.geometry?.spherical) {
      const latLngPath = drawnBoundary.map((p) => new window.google.maps.LatLng(p.lat, p.lng));
      areaSqMeters = window.google.maps.geometry.spherical.computeArea(latLngPath);
      perimeterMeters = window.google.maps.geometry.spherical.computeLength(latLngPath);
    } else {
      // Planar approximation fallback
      const n = drawnBoundary.length;
      for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const x1 = drawnBoundary[i].lng * 111320 * Math.cos((drawnBoundary[i].lat * Math.PI) / 180);
        const y1 = drawnBoundary[i].lat * 110540;
        const x2 = drawnBoundary[j].lng * 111320 * Math.cos((drawnBoundary[j].lat * Math.PI) / 180);
        const y2 = drawnBoundary[j].lat * 110540;
        areaSqMeters += x1 * y2 - x2 * y1;
        perimeterMeters += Math.hypot(x2 - x1, y2 - y1);
      }
      areaSqMeters = Math.abs(areaSqMeters / 2);
    }

    const acres = (areaSqMeters * 0.000247105).toFixed(3);
    const hectares = (areaSqMeters * 0.0001).toFixed(3);
    const perimeterKm = (perimeterMeters / 1000).toFixed(3);

    return {
      acres,
      hectares,
      perimeterMeters: Math.round(perimeterMeters),
      perimeterKm
    };
  }, [drawnBoundary]);

  // 13. Select a Farm Plot
  const handleSelectFarm = (farm) => {
    setSelectedFarmId(farm.id);
    setActiveCoords({ lat: farm.lat, lng: farm.lng });
    setActiveAddress(farm.address || `${farm.village}, ${farm.district}, ${farm.state}`);
    setActiveCountry(farm.country || 'India');
    setActiveState(farm.state || '');
    setActiveDistrict(farm.district || '');
    setActiveVillage(farm.village || '');
    setActivePostalCode(farm.postalCode || '');
    setDrawnBoundary(farm.boundaries || []);

    setEditingPlotData({
      name: farm.name,
      surveyNumber: farm.surveyNumber || '',
      landSize: farm.landSize || 3.0,
      landUnit: farm.landUnit || 'Acres',
      waterSource: farm.waterSource || 'Canal & Borewell',
      soilType: farm.soilType || 'Medium Black Cotton (Regur) Loam',
      soilPh: farm.soilPh || 7.2,
      purpose: farm.purpose || 'Cultivation'
    });

    if (mapInstanceRef.current) {
      mapInstanceRef.current.panTo({ lat: farm.lat, lng: farm.lng });
      mapInstanceRef.current.setZoom(16);
    }

    notify(`Selected plot: ${farm.name}`);
  };

  // 14. Save or Update Farm Plot in IndexedDB
  const handleSaveFarmPlot = async () => {
    try {
      const existing = farmLocations.find((l) => l.id === selectedFarmId);
      const isNew = !existing || isEditModalOpen === 'new';

      const farmId = isNew ? `FARM-LOC-${Date.now()}` : existing.id;
      const isPrimary = farmLocations.length === 0 ? true : (existing?.isPrimary ?? false);

      const record = {
        id: farmId,
        name: editingPlotData.name || 'My Farm Plot',
        surveyNumber: editingPlotData.surveyNumber || 'Sy No. 1',
        country: activeCountry,
        state: activeState,
        district: activeDistrict,
        village: activeVillage,
        postalCode: activePostalCode,
        address: activeAddress,
        lat: activeCoords.lat,
        lng: activeCoords.lng,
        landSize: boundaryCalculations ? parseFloat(boundaryCalculations.acres) : parseFloat(editingPlotData.landSize) || 2.0,
        landUnit: editingPlotData.landUnit || 'Acres',
        waterSource: editingPlotData.waterSource || 'Canal & Borewell',
        soilType: editingPlotData.soilType || 'Medium Black Cotton Loam',
        soilPh: parseFloat(editingPlotData.soilPh) || 7.2,
        purpose: editingPlotData.purpose || 'Agricultural Cultivation',
        isPrimary,
        boundaries: drawnBoundary,
        updatedAt: new Date().toISOString()
      };

      await saveFarmLocation(record);
      await loadFarmsFromDB();
      setSelectedFarmId(record.id);
      setIsEditModalOpen(false);

      // Sync active farm to localStorage for Weather & Crop Recommendation pages
      localStorage.setItem(
        'krishimitra_farm_location',
        JSON.stringify({
          name: record.name,
          village: record.village,
          district: record.district,
          state: record.state,
          country: record.country,
          lat: record.lat,
          lng: record.lng,
          soil: record.soilType,
          crops: record.purpose
        })
      );

      notify(`Farm "${record.name}" saved successfully in IndexedDB!`);
    } catch (err) {
      console.error('Failed to save farm plot:', err);
      notify('Failed to save farm location. Please try again.');
    }
  };

  // 15. Delete Farm Location
  const handleDeleteFarmPlot = async (id, name, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      await deleteFarmLocation(id);
      await loadFarmsFromDB();
      if (selectedFarmId === id) {
        setSelectedFarmId(null);
        setDrawnBoundary([]);
      }
      notify(`Farm "${name}" deleted from records.`);
    } catch (err) {
      console.error('Failed to delete farm plot:', err);
      notify('Failed to delete farm plot.');
    }
  };

  // 16. Set as Primary Farm
  const handleSetPrimary = async (id, name, e) => {
    if (e) e.stopPropagation();
    try {
      await setPrimaryFarmLocation(id);
      await loadFarmsFromDB();
      notify(`"${name}" is now your Primary Farm. Weather forecasts will automatically use these coordinates.`);
    } catch (err) {
      console.error('Failed to set primary farm:', err);
    }
  };

  // 17. Export All Farms to JSON
  const handleExportFarmsJSON = () => {
    try {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(farmLocations, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `krishimitra_farms_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      notify('Farm locations exported to JSON successfully.');
    } catch (e) {
      console.error('Export failed:', e);
      notify('Failed to export farm records.');
    }
  };

  // 18. Import Farms from JSON
  const handleImportFarmsJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item.lat && item.lng) {
              await saveFarmLocation(item);
            }
          }
          await loadFarmsFromDB();
          notify(`Imported ${parsed.length} farm locations into IndexedDB!`);
        } else {
          notify('Invalid file format: Expected an array of farm records.');
        }
      } catch (err) {
        console.error('Import parse error:', err);
        notify('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Save Custom Google Maps API Key
  const handleSaveApiKey = () => {
    const trimmed = apiKeyInput.trim();
    if (trimmed) {
      localStorage.setItem('krishimitra_google_maps_key', trimmed);
      setCustomApiKey(trimmed);
      setMapsAuthError(false);
      setShowApiKeyModal(false);
      notify('Google Maps API Key saved! Reloading map with new credentials...');
      window.location.reload();
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('krishimitra_google_maps_key');
    setCustomApiKey('');
    setMapsAuthError(false);
    setShowApiKeyModal(false);
    notify('Custom API key removed. Using default configuration.');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* Hidden File Input for JSON Import */}
      <input
        ref={fileInputImportRef}
        type="file"
        accept=".json,application/json"
        onChange={handleImportFarmsJSON}
        className="hidden"
      />

      {/* Top Navbar */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('weatherBackHome')}</span>
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
            {/* API Key Configuration Button */}
            <button
              type="button"
              onClick={() => {
                setApiKeyInput(customApiKey);
                setShowApiKeyModal(true);
              }}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                effectiveApiKey
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-800 border-amber-300 hover:bg-amber-100'
              }`}
              title="Configure Google Maps API Key"
            >
              <Key className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {effectiveApiKey ? 'Google Maps: Configured' : 'Setup Maps Key'}
              </span>
            </button>

            {/* Language Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find((l) => l.code === language)?.name || 'Language'}
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

            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="hidden sm:inline">Google Maps Active</span>
            </div>
          </div>
        </div>
      </header>

      {/* Floating Status Notification Toast */}
      {statusNotification && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2.5 animate-in slide-in-from-bottom-5 border border-slate-700">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* API Key Warning Banner if missing or auth error */}
      {mapsAuthError && (
        <div className="bg-amber-500 text-amber-950 px-4 py-2.5 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2 max-w-4xl mx-auto">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>
              Google Maps API authentication error: Please ensure your API key has "Maps JavaScript API", "Places API", and "Geocoding API" enabled in Google Cloud Console.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowApiKeyModal(true)}
            className="px-3 py-1 bg-amber-950 text-white rounded-lg text-xs font-bold hover:bg-black transition shrink-0"
          >
            Update Key
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* Page Title & Summary */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="emerald" icon={MapPin}>
                Worldwide Farm Geolocation
              </Badge>
              {isLiveTracking && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-100 px-2.5 py-0.5 rounded-full animate-pulse">
                  <LocateFixed className="w-3 h-3 text-blue-600" />
                  Live GPS Tracking Active
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {language === 'kn' ? 'ನೈಜ ಗೂಗಲ್ ಮ್ಯಾಪ್ಸ್ ಜಮೀನಿನ ಸ್ಥಳ ವ್ಯವಸ್ಥೆ' : language === 'hi' ? 'वास्तविक गूगल मैप्स फार्म स्थान प्रणाली' : 'Google Maps Global Farm Location System'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Access and search any country, district, village, or field worldwide. Click anywhere to mark locations, draw farm boundaries, and save unlimited farm plots.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setEditingPlotData({
                  name: `Farm Plot ${farmLocations.length + 1}`,
                  surveyNumber: `Sy No. ${100 + farmLocations.length}`,
                  landSize: 3.0,
                  landUnit: 'Acres',
                  waterSource: 'Canal & Borewell',
                  soilType: 'Medium Black Cotton (Regur) Loam',
                  soilPh: 7.2,
                  purpose: 'Cultivation'
                });
                setIsEditModalOpen('new');
              }}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-black shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Farm Location</span>
            </button>

            <button
              type="button"
              onClick={handleExportFarmsJSON}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold transition flex items-center gap-1"
              title="Export all saved farm records to JSON"
            >
              <FileDown className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputImportRef.current?.click()}
              className="p-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold transition flex items-center gap-1"
              title="Import farm records from JSON"
            >
              <FileUp className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Import</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            SECTION 1: SEARCH BAR & REAL-TIME GPS CONTROL PANEL
           ========================================================================= */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Global Location Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleManualSearch();
                }}
                placeholder="Search any country, state, district, village, PIN code, address, coordinates (lat, lng), or landmark..."
                className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-300 rounded-2xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={handleManualSearch}
                disabled={isSearching}
                className="absolute right-2 top-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition shadow-sm disabled:opacity-50"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>

            {/* GPS Location Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={handleUseMyCurrentLocation}
                disabled={isLocatingOneShot}
                className="px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
              >
                <Locate className="w-4 h-4 text-emerald-600" />
                <span>{isLocatingOneShot ? 'Locating...' : 'Use My Current Location'}</span>
              </button>

              {isLiveTracking ? (
                <button
                  type="button"
                  onClick={handleStopLiveGpsTracking}
                  className="px-3.5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-300 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
                  <span>Stop GPS Tracking</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleStartLiveGpsTracking}
                  className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-2xl text-xs font-bold transition flex items-center gap-1.5"
                >
                  <Navigation className="w-4 h-4 text-blue-600" />
                  <span>Start Live GPS</span>
                </button>
              )}

              {currentGpsCoords && (
                <button
                  type="button"
                  onClick={handleRecenterMyLocation}
                  className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl border border-slate-200 text-xs font-bold transition"
                  title="Recenter on My Location"
                >
                  <Crosshair className="w-4 h-4 text-slate-600" />
                </button>
              )}
            </div>

          </div>

          {/* Current GPS Telemetry Pill */}
          {currentGpsCoords && (
            <div className="p-2.5 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs text-blue-950 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                <span>
                  <strong>Active Device GPS:</strong> {currentGpsCoords.lat.toFixed(6)}° N, {currentGpsCoords.lng.toFixed(6)}° E
                </span>
                {gpsAccuracy && (
                  <span className="text-[11px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                    ±{gpsAccuracy}m Accuracy
                  </span>
                )}
              </div>
              <span className="text-[11px] text-blue-800">Actual hardware device coordinates via HTML5 Geolocation</span>
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 2: MAIN GOOGLE MAP CONTAINER + CONTROLS
           ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Full Google Map Viewport */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-3 relative overflow-hidden">
              
              {/* Floating Map Controls Toolbar */}
              <div className="absolute top-6 left-6 right-6 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
                
                {/* Map Type Switcher Buttons */}
                <div className="flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-2xl shadow-lg border border-slate-200 pointer-events-auto">
                  <button
                    type="button"
                    onClick={() => handleChangeMapType('hybrid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      mapType === 'hybrid'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Hybrid
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMapType('satellite')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      mapType === 'satellite'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Satellite
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMapType('roadmap')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      mapType === 'roadmap'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Roadmap
                  </button>
                  <button
                    type="button"
                    onClick={() => handleChangeMapType('terrain')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                      mapType === 'terrain'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    Terrain
                  </button>
                </div>

                {/* Boundary Drawing Mode Indicator */}
                {isDrawingBoundary && (
                  <div className="bg-emerald-600 text-white px-3.5 py-1.5 rounded-2xl shadow-lg text-xs font-extrabold flex items-center gap-2 pointer-events-auto animate-pulse">
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Click on map to draw farm boundary ({drawnBoundary.length} points)</span>
                  </div>
                )}
              </div>

              {/* The Actual Real Google Map Canvas */}
              <div
                ref={mapContainerRef}
                className="w-full h-[520px] sm:h-[600px] rounded-2xl overflow-hidden bg-slate-100 relative"
              />

              {/* Bottom Map Legend Bar */}
              <div className="pt-3 px-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-600 ring-2 ring-emerald-200" />
                    <span>Primary Farm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-200" />
                    <span>Selected Farm</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-amber-500 ring-2 ring-amber-200" />
                    <span>Other Saved Farms</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-500 ring-2 ring-red-200" />
                    <span>Active Selected Pin</span>
                  </div>
                </div>

                <div className="text-[11px] font-mono">
                  Coordinates: {activeCoords.lat.toFixed(6)}, {activeCoords.lng.toFixed(6)}
                </div>
              </div>

            </div>

            {/* Quick Action Navigation Bar */}
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold text-slate-500 block">Selected Farm Coordinates</span>
                <span className="text-sm font-black text-slate-900 block truncate max-w-md">
                  {activeAddress}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeCoords.lat},${activeCoords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                >
                  <Compass className="w-4 h-4 text-blue-600" />
                  <span>Google Navigation</span>
                  <ExternalLink className="w-3 h-3 text-blue-500" />
                </a>

                {onNavigateWeather && (
                  <button
                    type="button"
                    onClick={onNavigateWeather}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                  >
                    <Sun className="w-4 h-4 text-emerald-600" />
                    <span>View Weather</span>
                  </button>
                )}

                {onNavigateCropRecommendation && (
                  <button
                    type="button"
                    onClick={onNavigateCropRecommendation}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                  >
                    <Sprout className="w-4 h-4" />
                    <span>Recommend Crops</span>
                  </button>
                )}
              </div>
            </div>

          </div>

          {/* Right Column: Tabbed Management Panel */}
          <div className="lg:col-span-4 space-y-4">
            
            {/* Panel Tabs Header */}
            <div className="bg-white rounded-3xl p-1.5 border border-slate-200 shadow-sm grid grid-cols-4 gap-1">
              <button
                type="button"
                onClick={() => setActiveTab('plots')}
                className={`py-2 px-1 text-center rounded-2xl text-[11px] font-bold transition truncate ${
                  activeTab === 'plots'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Farms ({farmLocations.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('boundary')}
                className={`py-2 px-1 text-center rounded-2xl text-[11px] font-bold transition truncate ${
                  activeTab === 'boundary'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Boundary
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className={`py-2 px-1 text-center rounded-2xl text-[11px] font-bold transition truncate ${
                  activeTab === 'details'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Details
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('agri')}
                className={`py-2 px-1 text-center rounded-2xl text-[11px] font-bold transition truncate ${
                  activeTab === 'agri'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Advisory
              </button>
            </div>

            {/* TAB 1: SAVED FARM LOCATIONS */}
            {activeTab === 'plots' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <MapIcon className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Saved Farm Locations
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {farmLocations.length} Plots in DB
                  </span>
                </div>

                {isLoadingLocations ? (
                  <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                    Loading farm locations from IndexedDB...
                  </div>
                ) : farmLocations.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No farm locations saved yet. Click any point on the map or search an address to save your first farm plot.
                  </div>
                ) : (
                  <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                    {farmLocations.map((farm) => {
                      const isSelected = farm.id === selectedFarmId;
                      return (
                        <div
                          key={farm.id}
                          onClick={() => handleSelectFarm(farm)}
                          className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col gap-2 ${
                            isSelected
                              ? 'border-emerald-500 bg-emerald-50/70 shadow-sm ring-1 ring-emerald-400'
                              : 'border-slate-200 hover:border-emerald-300 bg-white hover:bg-slate-50/70'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="text-xs font-bold text-slate-900">{farm.name}</h4>
                                {farm.isPrimary && (
                                  <span className="text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-1.5 py-0.5 rounded">
                                    Primary
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[220px]">
                                {farm.address || `${farm.village}, ${farm.district}`}
                              </p>
                            </div>

                            <span className="text-xs font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-lg shrink-0">
                              {farm.landSize} {farm.landUnit || 'Acres'}
                            </span>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-100/80 text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">
                              {farm.lat.toFixed(4)}°, {farm.lng.toFixed(4)}°
                            </span>

                            <div className="flex items-center gap-1">
                              {!farm.isPrimary && (
                                <button
                                  type="button"
                                  onClick={(e) => handleSetPrimary(farm.id, farm.name, e)}
                                  className="p-1 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition"
                                  title="Make this primary farm"
                                >
                                  <Star className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSelectFarm(farm);
                                  setIsEditModalOpen('edit');
                                }}
                                className="p-1 text-slate-400 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Farm Details"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleDeleteFarmPlot(farm.id, farm.name, e)}
                                className="p-1 text-slate-400 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                                title="Delete Farm"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  icon={Plus}
                  onClick={() => {
                    setEditingPlotData({
                      name: `Farm Plot ${farmLocations.length + 1}`,
                      surveyNumber: `Sy No. ${101 + farmLocations.length}`,
                      landSize: 3.0,
                      landUnit: 'Acres',
                      waterSource: 'Canal & Borewell',
                      soilType: 'Medium Black Cotton (Regur) Loam',
                      soilPh: 7.2,
                      purpose: 'Cultivation'
                    });
                    setIsEditModalOpen('new');
                  }}
                  className="w-full justify-center"
                >
                  Mark New Location at Selected Pin
                </Button>
              </div>
            )}

            {/* TAB 2: FARM BOUNDARY DRAWING & AREA CALCULATION */}
            {activeTab === 'boundary' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Farm Boundary Polygon
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {drawnBoundary.length} Vertices
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <p className="text-slate-600 leading-relaxed">
                    Draw the exact perimeter of your agricultural field on the map to calculate official acreage and hectare measurements.
                  </p>

                  {/* Drawing Control Actions */}
                  <div className="grid grid-cols-2 gap-2">
                    {isDrawingBoundary ? (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawingBoundary(false);
                          notify('Finished drawing boundary.');
                        }}
                        className="py-2 px-3 bg-emerald-600 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Check className="w-4 h-4" />
                        <span>Finish Drawing</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setIsDrawingBoundary(true);
                          notify('Boundary drawing active: Click around your field perimeter on the map.');
                        }}
                        className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5"
                      >
                        <Pencil className="w-4 h-4 text-emerald-600" />
                        <span>Draw Boundary</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => {
                        setDrawnBoundary((prev) => prev.slice(0, -1));
                        notify('Removed last boundary vertex.');
                      }}
                      disabled={drawnBoundary.length === 0}
                      className="py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      <RotateCcw className="w-4 h-4" />
                      <span>Undo Point</span>
                    </button>
                  </div>

                  {drawnBoundary.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setDrawnBoundary([]);
                        notify('Boundary cleared.');
                      }}
                      className="w-full py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 font-bold rounded-xl text-xs transition"
                    >
                      Clear Boundary
                    </button>
                  )}

                  {/* Calculated Area & Perimeter Display */}
                  {boundaryCalculations ? (
                    <div className="p-3.5 bg-emerald-50/80 rounded-2xl border border-emerald-200 space-y-2">
                      <span className="text-[11px] font-black text-emerald-950 uppercase tracking-wider block">
                        Geodetic Boundary Calculations:
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-xs">
                          <span className="text-xs text-slate-500 block">Calculated Area</span>
                          <span className="text-base font-black text-emerald-700 block mt-0.5">
                            {boundaryCalculations.acres} Acres
                          </span>
                        </div>
                        <div className="bg-white p-2.5 rounded-xl border border-emerald-200/60 shadow-xs">
                          <span className="text-xs text-slate-500 block">Metric Area</span>
                          <span className="text-base font-black text-emerald-700 block mt-0.5">
                            {boundaryCalculations.hectares} Ha
                          </span>
                        </div>
                      </div>
                      <div className="text-center text-[11px] text-emerald-900 pt-1">
                        Perimeter: <strong>{boundaryCalculations.perimeterKm} km</strong> ({boundaryCalculations.perimeterMeters} m)
                      </div>
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-slate-500 text-center text-xs">
                      Click at least 3 points on the map to enclose a farm boundary.
                    </div>
                  )}

                  <Button
                    variant="primary"
                    size="sm"
                    icon={Save}
                    onClick={handleSaveFarmPlot}
                    className="w-full justify-center shadow-sm"
                  >
                    Save Boundary with Farm Plot
                  </Button>
                </div>
              </div>
            )}

            {/* TAB 3: LOCATION DETAILS */}
            {activeTab === 'details' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Geographical Details
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-slate-500">Reverse Geocoded</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Full Address</span>
                    <p className="font-bold text-slate-800 mt-0.5 leading-snug">{activeAddress}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2 bg-slate-50 rounded-xl border">
                      <span className="text-slate-400 text-[10px] block">Village / Locality</span>
                      <strong className="text-slate-800 text-xs truncate block">{activeVillage || 'N/A'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border">
                      <span className="text-slate-400 text-[10px] block">District / County</span>
                      <strong className="text-slate-800 text-xs truncate block">{activeDistrict || 'N/A'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border">
                      <span className="text-slate-400 text-[10px] block">State / Region</span>
                      <strong className="text-slate-800 text-xs truncate block">{activeState || 'N/A'}</strong>
                    </div>
                    <div className="p-2 bg-slate-50 rounded-xl border">
                      <span className="text-slate-400 text-[10px] block">Country</span>
                      <strong className="text-slate-800 text-xs truncate block">{activeCountry || 'India'}</strong>
                    </div>
                  </div>

                  <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-200/80 font-mono text-[11px] text-emerald-950 space-y-0.5">
                    <div>Latitude: <strong>{activeCoords.lat.toFixed(6)}° N</strong></div>
                    <div>Longitude: <strong>{activeCoords.lng.toFixed(6)}° E</strong></div>
                    {activePostalCode && <div>Postal Code: <strong>{activePostalCode}</strong></div>}
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${activeCoords.lat},${activeCoords.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition"
                  >
                    <Compass className="w-4 h-4" />
                    <span>Open in Google Maps Navigation</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            )}

            {/* TAB 4: LOCATION-BASED FARMING ADVISORY */}
            {activeTab === 'agri' && (
              <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <Sprout className="w-4 h-4 text-emerald-600" />
                    <h3 className="text-sm font-extrabold text-slate-900">
                      Location Agro-Intelligence
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Pre-Wired
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-700">
                  <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-1">
                    <span className="font-bold text-emerald-950 block">Regional Agronomy Match:</span>
                    <p className="text-emerald-900 leading-relaxed text-[11px]">
                      Selected coordinates ({activeCoords.lat.toFixed(3)}°, {activeCoords.lng.toFixed(3)}°) in <strong>{activeDistrict || activeState}</strong> are mapped to regional soil conditions and seasonal agro-climatic zones.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <span className="font-bold text-slate-800 text-xs block">Suitable Crops for this Agro-Zone:</span>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
                        <span>🌾</span> <span>Rice / Paddy</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
                        <span>☁️</span> <span>Cotton (Bt Cotton)</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
                        <span>🌽</span> <span>Maize (Corn)</span>
                      </div>
                      <div className="p-2 bg-slate-50 rounded-xl border flex items-center gap-1.5">
                        <span>🌶️</span> <span>Chilli / Pepper</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-[11px] text-amber-950 space-y-1">
                    <strong>Note:</strong> Google Maps provides geographical location only, not automated soil chemistry. Use KrishiMitra's Crop Recommendation System to enter actual soil pH and water availability.
                  </div>

                  {onNavigateCropRecommendation && (
                    <Button
                      variant="primary"
                      size="sm"
                      icon={Sprout}
                      onClick={onNavigateCropRecommendation}
                      className="w-full justify-center shadow-sm"
                    >
                      Run 5-Crop Recommendation for this Farm
                    </Button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* =========================================================================
          MODAL: EDIT OR ADD FARM PLOT DETAILS
         ========================================================================= */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                IndexedDB Farm Storage
              </span>
              <h3 className="text-lg font-black text-slate-900">
                {isEditModalOpen === 'new' ? 'Save New Farm Location' : 'Edit Farm Plot Details'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Coordinates: {activeCoords.lat.toFixed(6)}, {activeCoords.lng.toFixed(6)}
              </p>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Farm / Plot Name</label>
                <input
                  type="text"
                  value={editingPlotData.name}
                  onChange={(e) => setEditingPlotData({ ...editingPlotData, name: e.target.value })}
                  placeholder="e.g. North Canal Plot"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Survey / Gat Number</label>
                  <input
                    type="text"
                    value={editingPlotData.surveyNumber}
                    onChange={(e) => setEditingPlotData({ ...editingPlotData, surveyNumber: e.target.value })}
                    placeholder="e.g. Sy No. 142/A"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Land Size ({editingPlotData.landUnit})</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlotData.landSize}
                    onChange={(e) => setEditingPlotData({ ...editingPlotData, landSize: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Soil Type</label>
                <select
                  value={editingPlotData.soilType}
                  onChange={(e) => setEditingPlotData({ ...editingPlotData, soilType: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Medium Black Cotton (Regur) Loam">Medium Black Cotton (Regur) Loam</option>
                  <option value="Deep Black Clayey Vertisol">Deep Black Clayey Vertisol</option>
                  <option value="Red Sandy Loam / Red Soil">Red Sandy Loam / Red Soil</option>
                  <option value="Alluvial / River Delta Silt Loam">Alluvial / River Delta Silt Loam</option>
                  <option value="Laterite / Coastal Clay Soil">Laterite / Coastal Clay Soil</option>
                  <option value="Sandy / Arid Desert Soil">Sandy / Arid Desert Soil</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Water Source</label>
                  <input
                    type="text"
                    value={editingPlotData.waterSource}
                    onChange={(e) => setEditingPlotData({ ...editingPlotData, waterSource: e.target.value })}
                    placeholder="e.g. Borewell & Canal"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Soil pH</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPlotData.soilPh}
                    onChange={(e) => setEditingPlotData({ ...editingPlotData, soilPh: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Cultivation Purpose / Crops</label>
                <input
                  type="text"
                  value={editingPlotData.purpose}
                  onChange={(e) => setEditingPlotData({ ...editingPlotData, purpose: e.target.value })}
                  placeholder="e.g. Cotton, Paddy & Seasonal Vegetables"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button variant="outline" size="sm" onClick={() => setIsEditModalOpen(false)}>
                  Cancel
                </Button>
                <Button variant="primary" size="sm" icon={Save} onClick={handleSaveFarmPlot}>
                  Save Farm Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: GOOGLE MAPS API KEY CONFIGURATION
         ========================================================================= */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 space-y-5 border border-slate-200 shadow-2xl relative my-8">
            <button
              type="button"
              onClick={() => setShowApiKeyModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Key className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  Google Maps API Configuration
                </h3>
                <p className="text-xs text-slate-500">
                  Configure your production Google Maps JavaScript API Key
                </p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-700">
              <p className="leading-relaxed">
                Enter your Google Maps JavaScript API key below or set <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">VITE_GOOGLE_MAPS_API_KEY</code> in <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">.env</code>.
              </p>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Google Maps JavaScript API Key:
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 space-y-1.5 text-[11px]">
                <strong className="block text-slate-900 font-bold">Required Google Cloud APIs to enable:</strong>
                <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                  <li><strong>Maps JavaScript API</strong> (Vector & satellite map rendering)</li>
                  <li><strong>Places API</strong> (Autocomplete global search)</li>
                  <li><strong>Geocoding API</strong> (Address conversion and coordinates lookup)</li>
                </ul>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                {customApiKey ? (
                  <button
                    type="button"
                    onClick={handleClearApiKey}
                    className="text-xs text-red-600 hover:text-red-700 font-bold"
                  >
                    Remove Key
                  </button>
                ) : <div />}

                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setShowApiKeyModal(false)}>
                    Close
                  </Button>
                  <Button variant="primary" size="sm" icon={Save} onClick={handleSaveApiKey}>
                    Save & Reload Map
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}