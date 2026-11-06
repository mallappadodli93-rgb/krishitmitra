import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Upload,
  ScanLine,
  Image as ImageIcon,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Sparkles,
  Info,
  ArrowLeft,
  Share2,
  FileText,
  Camera,
  Leaf,
  Droplets,
  Lightbulb,
  X,
  SwitchCamera,
  Globe,
  ChevronDown,
  MapPin,
  Calendar,
  Clock,
  History,
  Check,
  Search,
  ExternalLink,
  BookOpen,
  HelpCircle,
  Eye,
  Key,
  ShieldCheck,
  Download,
  Filter,
  Layers,
  Cpu,
  ChevronRight
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';
import {
  ALL_SUPPORTED_CROPS,
  CROP_CATEGORIES,
  COMPREHENSIVE_DISEASE_LIBRARY,
  findCropMetadata,
  lookupDiseaseRecord,
  filterDiseaseLibrary,
  detectCropDiseaseWithAI,
  checkAIServiceHealth,
  getActiveGeminiApiKey,
  getGeminiKeyStatus,
  saveUserGeminiApiKey,
  removeUserGeminiApiKey,
  testGeminiConnection,
  compressAndPrepareImage
} from '../services/cropDiseaseAIService';
import {
  fetchDiseaseScans,
  saveDiseaseScan,
  deleteDiseaseScan,
  fetchFarmLocations
} from '../services/farmerDataService';

// 12 High-Quality Demo Samples Covering Diverse Crops (Zero-Camera Instant Evaluation)
const DEMO_LEAF_SAMPLES = [
  {
    id: 'demo-tomato-early-blight',
    cropId: 'tomato',
    cropName: 'Tomato',
    diseaseName: 'Tomato Early Blight (Alternaria solani)',
    sampleImage: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80',
    location: 'Raichur Vegetable Plot 1',
    hint: 'Tomato foliage with concentric ring target spots'
  },
  {
    id: 'demo-rice-blast',
    cropId: 'rice',
    cropName: 'Rice / Paddy',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    sampleImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80',
    location: 'Koppal Canal Field',
    hint: 'Paddy leaf with spindle-shaped necrotic lesions'
  },
  {
    id: 'demo-wheat-rust',
    cropId: 'wheat',
    cropName: 'Wheat',
    diseaseName: 'Wheat Stripe / Yellow Rust (Puccinia striiformis)',
    sampleImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    location: 'Belagavi Rabi Farm',
    hint: 'Linear parallel yellow rust pustules on wheat'
  },
  {
    id: 'demo-maize-blight',
    cropId: 'maize',
    cropName: 'Maize (Corn)',
    diseaseName: 'Maydis Leaf Blight (Bipolaris maydis)',
    sampleImage: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    location: 'Davanagere Corn Field',
    hint: 'Elongated tan-brown blighted lesions'
  },
  {
    id: 'demo-cotton-curl',
    cropId: 'cotton',
    cropName: 'Cotton',
    diseaseName: 'Cotton Leaf Curl Virus (CLCuV)',
    sampleImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80',
    location: 'Ballari Black Soil Farm',
    hint: 'Upward leaf curling & vein enations'
  },
  {
    id: 'demo-chilli-anthracnose',
    cropId: 'chilli',
    cropName: 'Chilli / Green Pepper',
    diseaseName: 'Chilli Anthracnose / Fruit Rot',
    sampleImage: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    location: 'Byadagi Chilli Plot',
    hint: 'Sunken necrotic spots on chilli pods & twigs'
  },
  {
    id: 'demo-potato-blight',
    cropId: 'potato',
    cropName: 'Potato',
    diseaseName: 'Potato Late Blight (Phytophthora infestans)',
    sampleImage: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&auto=format&fit=crop&q=80',
    location: 'Hassan Potato Farm',
    hint: 'Water-soaked purplish lesions on potato canopy'
  },
  {
    id: 'demo-groundnut-tikka',
    cropId: 'groundnut',
    cropName: 'Groundnut (Peanut)',
    diseaseName: 'Tikka Leaf Spot (Cercospora)',
    sampleImage: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=800&auto=format&fit=crop&q=80',
    location: 'Tumakuru Groundnut Plot',
    hint: 'Circular leaf spots with chlorotic yellow rings'
  },
  {
    id: 'demo-mango-anthracnose',
    cropId: 'mango',
    cropName: 'Mango',
    diseaseName: 'Mango Anthracnose (Colletotrichum)',
    sampleImage: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=800&auto=format&fit=crop&q=80',
    location: 'Srinivaspur Mango Orchard',
    hint: 'Tear-stain dark lesions on mango foliage'
  },
  {
    id: 'demo-banana-sigatoka',
    cropId: 'banana',
    cropName: 'Banana',
    diseaseName: 'Sigatoka Leaf Spot',
    sampleImage: 'https://images.unsplash.com/photo-1528825871115-3581a5387919?w=800&auto=format&fit=crop&q=80',
    location: 'Nanjangud Banana Plantation',
    hint: 'Elongated reddish-brown necrotic streaks'
  },
  {
    id: 'demo-grapes-downy',
    cropId: 'grapes',
    cropName: 'Grapes',
    diseaseName: 'Grapevine Downy Mildew',
    sampleImage: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800&auto=format&fit=crop&q=80',
    location: 'Vijayapura Vineyard',
    hint: 'Yellow translucent oil spots with downy growth'
  },
  {
    id: 'demo-healthy-garden',
    cropId: 'garden',
    cropName: 'Garden / House Plants',
    diseaseName: 'Healthy Foliage (No Disease)',
    sampleImage: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=800&auto=format&fit=crop&q=80',
    location: 'Home Garden / Nursery',
    hint: 'Lush green unblemished foliage (Healthy)'
  }
];

export default function DiseaseDetectionPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const { isOffline } = useOffline();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Gemini API Key & Engine Status
  const [geminiStatus, setGeminiStatus] = useState({ configured: false, source: 'none', maskedKey: '' });
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [inputApiKey, setInputApiKey] = useState('');
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [apiKeyFeedback, setApiKeyFeedback] = useState(null);

  // Crop & Taxonomy States
  // Default is 'auto' (Auto-Detect Plant) - NOT tomato!
  const [selectedCrop, setSelectedCrop] = useState('auto');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [cropSearch, setCropSearch] = useState('');
  const [isCropDropdownOpen, setIsCropDropdownOpen] = useState(false);

  // Farm metadata
  const [farmLocation, setFarmLocation] = useState('Raichur Farm - Plot 1');
  const [scanDateTime, setScanDateTime] = useState(() => {
    const now = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}`;
  });
  const [savedFarmPlots, setSavedFarmPlots] = useState([]);

  // Image capture & preview
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSource, setImageSource] = useState(null); // 'camera' | 'gallery' | 'demo'
  const [fileError, setFileError] = useState('');

  // Scanning & AI status
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepIndex, setScanStepIndex] = useState(0);
  const [detectionResult, setDetectionResult] = useState(null);
  const [aiErrorState, setAiErrorState] = useState(null);

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // IndexedDB Scan History
  const [scanHistory, setScanHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [activeHistoryItem, setActiveHistoryItem] = useState(null);

  // Disease Knowledge Guide Modal
  const [showKnowledgeGuide, setShowKnowledgeGuide] = useState(false);
  const [guideCategoryFilter, setGuideCategoryFilter] = useState('all');
  const [guideSearchQuery, setGuideSearchQuery] = useState('');

  // Active treatment tab
  const [activeTreatmentTab, setActiveTreatmentTab] = useState('organic'); // 'organic' | 'chemical'

  // DOM Refs
  const fileInputRef = useRef(null);
  const mobileCaptureInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Load initial settings, API status, farm plots & IndexedDB history
  useEffect(() => {
    refreshGeminiStatus();
    loadSavedFarmLocations();
    loadScanHistory();
  }, []);

  const refreshGeminiStatus = () => {
    const status = getGeminiKeyStatus();
    setGeminiStatus(status);
  };

  const loadSavedFarmLocations = async () => {
    try {
      const locations = await fetchFarmLocations();
      if (locations && locations.length > 0) {
        setSavedFarmPlots(locations);
        const primary = locations.find((l) => l.isPrimary) || locations[0];
        if (primary && primary.name) {
          setFarmLocation(`${primary.name} (${primary.district || 'Main Plot'})`);
        }
      }
    } catch (e) {
      console.warn('Could not load farm locations:', e);
    }
  };

  const loadScanHistory = async () => {
    setIsLoadingHistory(true);
    try {
      const scans = await fetchDiseaseScans();
      setScanHistory(scans || []);
    } catch (e) {
      console.error('Failed to load scan history:', e);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Stop camera stream cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping camera track:', e);
        }
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
    setIsCameraLoading(false);
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  // Start live mobile camera (prefers rear 'environment' camera)
  const startCamera = async (facingMode = 'environment') => {
    stopCamera();
    setIsCameraLoading(true);
    setCameraError('');
    setIsCameraActive(true);
    setFileError('');
    setAiErrorState(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Live camera access is not supported by your browser. Please use "Upload from Gallery" or "Take Quick Photo".');
      setIsCameraLoading(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current?.play().catch((err) => {
            console.error('Error playing camera stream:', err);
          });
        };
      }

      setCameraFacingMode(facingMode);
      setIsCameraLoading(false);

      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.warn('Camera getUserMedia error:', err);
      setIsCameraLoading(false);
      setIsCameraActive(false);
      setCameraError('Camera access was denied or is unavailable. You can upload an image from your gallery instead.');
    }
  };

  const switchCameraFacing = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Capture frame from active camera stream
  const capturePhotoFromCamera = () => {
    if (!videoRef.current) return;
    try {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setImagePreview(dataUrl);
      setSelectedFile(dataUrl);
      setImageSource('camera');
      setFileError('');
      setDetectionResult(null);
      setAiErrorState(null);
      stopCamera();
    } catch (err) {
      setCameraError('Failed to capture snapshot from camera stream: ' + err.message);
    }
  };

  // File Upload Handlers
  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setFileError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      setFileError('Image size exceeds 25 MB. Please select a smaller photo.');
      return;
    }

    setFileError('');
    setSelectedFile(file);
    setImageSource('gallery');
    setDetectionResult(null);
    setAiErrorState(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target.result);
    };
    reader.readAsDataURL(file);
    stopCamera();
  };

  const handleSelectDemoSample = (demo) => {
    stopCamera();
    setFileError('');
    setDetectionResult(null);
    setAiErrorState(null);
    setSelectedCrop(demo.cropId);
    setFarmLocation(demo.location);
    setImagePreview(demo.sampleImage);
    setSelectedFile(demo.sampleImage);
    setImageSource('demo');
  };

  const handleRemoveImage = () => {
    stopCamera();
    setSelectedFile(null);
    setImagePreview(null);
    setImageSource(null);
    setDetectionResult(null);
    setAiErrorState(null);
    setFileError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (mobileCaptureInputRef.current) mobileCaptureInputRef.current.value = '';
  };

  const handleRetakePhoto = () => {
    handleRemoveImage();
    startCamera(cameraFacingMode);
  };

  // Run Real AI Plant Identification & Disease Detection
  const handleAnalyzePlant = async () => {
    if (!imagePreview && !selectedFile) {
      setFileError('Please take a camera photograph, upload an image from your gallery, or choose a demo sample first.');
      return;
    }

    setIsScanning(true);
    setDetectionResult(null);
    setAiErrorState(null);
    setScanStepIndex(0);

    // Multi-step animated progress indicators
    const stepInterval = setInterval(() => {
      setScanStepIndex((prev) => (prev < 3 ? prev + 1 : prev));
    }, 600);

    try {
      const response = await detectCropDiseaseWithAI({
        image: selectedFile || imagePreview,
        cropType: selectedCrop,
        farmLocation,
        language
      });

      clearInterval(stepInterval);
      setIsScanning(false);

      if (response.status === 'success') {
        const fullResult = {
          ...response,
          id: `scan-${Date.now()}`,
          selectedCropHint: selectedCrop,
          farmLocation,
          scannedAt: scanDateTime,
          savedAt: new Date().toISOString(),
          image: response.imagePreview || imagePreview
        };

        setDetectionResult(fullResult);

        // Save scan record into IndexedDB
        try {
          await saveDiseaseScan({
            id: fullResult.id,
            plantName: fullResult.plantName,
            cropName: fullResult.cropName,
            cropId: selectedCrop,
            scientificName: fullResult.scientificName,
            healthStatus: fullResult.healthStatus,
            isHealthy: fullResult.isHealthy,
            diseaseName: fullResult.diseaseName,
            diseaseCategory: fullResult.diseaseCategory,
            confidence: fullResult.confidence,
            confidencePercentage: fullResult.confidencePercentage,
            uncertaintyNote: fullResult.uncertaintyNote,
            farmLocation,
            scannedAt: scanDateTime,
            image: fullResult.image,
            visibleSymptoms: fullResult.visibleSymptoms,
            possibleCauses: fullResult.possibleCauses,
            recommendedTreatment: fullResult.recommendedTreatment,
            preventionMethods: fullResult.preventionMethods,
            whenToSeekExpertAdvice: fullResult.whenToSeekExpertAdvice,
            referenceSource: fullResult.referenceSource
          });
          await loadScanHistory();
        } catch (dbErr) {
          console.warn('Could not save scan to IndexedDB:', dbErr);
        }
      } else {
        // Transparent reporting of Gemini state (disconnected, quota, non-plant, etc.)
        setAiErrorState(response);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsScanning(false);
      setAiErrorState({
        status: 'error',
        isAiOnline: false,
        message: err.message || 'An unexpected error occurred while analyzing the plant image.'
      });
    }
  };

  // API Key Modal Handlers
  const handleOpenApiKeyModal = () => {
    const { key } = getActiveGeminiApiKey();
    setInputApiKey(key || '');
    setApiKeyFeedback(null);
    setShowApiKeyModal(true);
  };

  const handleSaveApiKey = () => {
    if (!inputApiKey.trim()) {
      removeUserGeminiApiKey();
      refreshGeminiStatus();
      setApiKeyFeedback({ type: 'info', message: 'API key cleared. System is in offline encyclopedia mode.' });
      return;
    }

    saveUserGeminiApiKey(inputApiKey);
    refreshGeminiStatus();
    setApiKeyFeedback({ type: 'success', message: 'API key saved securely in browser localStorage.' });
  };

  const handleTestApiKey = async () => {
    setIsTestingApiKey(true);
    setApiKeyFeedback(null);
    const testResult = await testGeminiConnection(inputApiKey.trim());
    setIsTestingApiKey(false);

    if (testResult.success) {
      setApiKeyFeedback({ type: 'success', message: testResult.message });
      saveUserGeminiApiKey(inputApiKey.trim());
      refreshGeminiStatus();
    } else {
      setApiKeyFeedback({ type: 'error', message: testResult.message });
    }
  };

  // Delete scan from IndexedDB
  const handleDeleteScan = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Delete this disease scan record permanently?')) return;
    try {
      await deleteDiseaseScan(id);
      if (activeHistoryItem && activeHistoryItem.id === id) {
        setActiveHistoryItem(null);
      }
      await loadScanHistory();
    } catch (err) {
      console.error('Failed to delete scan record:', err);
    }
  };

  // Export history to CSV
  const handleExportHistoryCSV = () => {
    if (!scanHistory || scanHistory.length === 0) {
      alert('No scans to export.');
      return;
    }

    const headers = ['Scan ID', 'Date & Time', 'Crop Name', 'Health Status', 'Disease Name', 'Confidence', 'Farm Location', 'Pathogen Category'];
    const rows = scanHistory.map((s) => [
      s.id || '',
      s.scannedAt || '',
      `"${(s.cropName || '').replace(/"/g, '""')}"`,
      s.healthStatus || (s.isHealthy ? 'Healthy' : 'Diseased'),
      `"${(s.diseaseName || '').replace(/"/g, '""')}"`,
      s.confidencePercentage || (s.confidence ? `${Math.round(s.confidence * 100)}%` : 'N/A'),
      `"${(s.farmLocation || '').replace(/"/g, '""')}"`,
      s.diseaseCategory || 'N/A'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `krishimitra_disease_scans_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Download printable report
  const handleDownloadReport = () => {
    if (!detectionResult) return;
    const reportText = `
========================================================================
KRISHIMITRA (ಕೃಷಿಮಿತ್ರ) AI PLANT & CROP DISEASE DIAGNOSTIC REPORT
========================================================================
Generated on: ${new Date().toLocaleString()}
Farm Location: ${detectionResult.farmLocation}
Scan Timestamp: ${detectionResult.scannedAt}

PLANT IDENTIFICATION
------------------------------------------------------------------------
Common Plant Name: ${detectionResult.plantName}
Crop Category:     ${detectionResult.cropName}
Scientific Name:   ${detectionResult.scientificName}

DIAGNOSIS & PATHOLOGY
------------------------------------------------------------------------
Health Status:     ${detectionResult.healthStatus}
Condition/Disease: ${detectionResult.diseaseName}
Disease Category:  ${detectionResult.diseaseCategory}
AI Confidence:     ${detectionResult.confidencePercentage}
Quality & Notice:  ${detectionResult.uncertaintyNote}

OBSERVED SYMPTOMS
------------------------------------------------------------------------
${(detectionResult.visibleSymptoms || []).map((s) => `• ${s}`).join('\n')}

POSSIBLE CAUSES & CONTRIBUTORS
------------------------------------------------------------------------
${(detectionResult.possibleCauses || []).map((c) => `• ${c}`).join('\n')}

RECOMMENDED ORGANIC & BIOLOGICAL TREATMENT
------------------------------------------------------------------------
${(detectionResult.recommendedTreatment?.organic || []).map((t) => `• ${t}`).join('\n')}

RECOMMENDED CHEMICAL TREATMENT
------------------------------------------------------------------------
${(detectionResult.recommendedTreatment?.chemical || []).map((t) => `• ${t}`).join('\n')}

PREVENTIVE MEASURES
------------------------------------------------------------------------
${(detectionResult.preventionMethods || []).map((p) => `• ${p}`).join('\n')}

EXPERT ESCALATION CRITERIA
------------------------------------------------------------------------
${detectionResult.whenToSeekExpertAdvice}

REFERENCE SOURCE
------------------------------------------------------------------------
${detectionResult.referenceSource}
========================================================================
Disclaimer: This diagnosis is an AI visual assessment provided by KrishiMitra.
Always verify serious epidemics with your local Krishi Vigyan Kendra (KVK).
========================================================================
    `;

    const blob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `KrishiMitra_Report_${detectionResult.cropName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Filtered crops for crop selector
  const filteredCrops = useMemo(() => {
    return ALL_SUPPORTED_CROPS.filter((crop) => {
      const matchesCategory = selectedCategory === 'all' || crop.category === selectedCategory;
      const matchesSearch =
        !cropSearch.trim() ||
        crop.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
        crop.localKn.toLowerCase().includes(cropSearch.toLowerCase()) ||
        crop.localHi.toLowerCase().includes(cropSearch.toLowerCase()) ||
        (crop.scientificName && crop.scientificName.toLowerCase().includes(cropSearch.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, cropSearch]);

  const selectedCropMeta = useMemo(() => {
    if (selectedCrop === 'auto') return { name: 'Auto-Detect Plant (Any Crop)', icon: '✨', localKn: 'ಯಾವುದೇ ಸಸ್ಯ (ಸ್ವಯಂ ಪತ್ತೆ)', localHi: 'कोई भी पौधा (ऑटो-डिटेक्ट)' };
    return findCropMetadata(selectedCrop) || { name: selectedCrop, icon: '🌱' };
  }, [selectedCrop]);

  // Filtered knowledge guide
  const filteredGuideList = useMemo(() => {
    return filterDiseaseLibrary({
      cropId: guideCategoryFilter,
      searchQuery: guideSearchQuery
    });
  }, [guideCategoryFilter, guideSearchQuery]);

  // Filtered scan history
  const filteredHistory = useMemo(() => {
    if (!historySearchQuery.trim()) return scanHistory;
    const q = historySearchQuery.toLowerCase();
    return scanHistory.filter((item) =>
      (item.cropName && item.cropName.toLowerCase().includes(q)) ||
      (item.diseaseName && item.diseaseName.toLowerCase().includes(q)) ||
      (item.farmLocation && item.farmLocation.toLowerCase().includes(q))
    );
  }, [scanHistory, historySearchQuery]);

  const scanSteps = [
    'Validating leaf image clarity & color balance...',
    'Compressing payload & transmitting to Google Gemini Multimodal API...',
    'Analyzing leaf pathology, lesions, chlorosis & leaf venation...',
    'Cross-referencing verified ICAR / State Agricultural University extension guides...'
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hidden file input for gallery upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Hidden file input for native mobile camera capture */}
      <input
        ref={mobileCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleNavHome}
              className="p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-bold text-slate-900 leading-tight">
                    KrishiMitra AI Crop Doctor
                  </h1>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                    Multimodal AI
                  </span>
                </div>
                <p className="text-xs text-slate-500 hidden sm:block">
                  Universal Plant Identification & Crop Pathology Diagnostic System
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Gemini API Status Badge (Click to configure) */}
            <button
              onClick={handleOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                geminiStatus.configured
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 animate-pulse'
              }`}
              title="Click to Configure Google Gemini API Key"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span className="hidden md:inline">
                {geminiStatus.configured ? 'Gemini AI Online' : 'API Key Required'}
              </span>
              <span className="md:hidden">
                {geminiStatus.configured ? 'Gemini' : 'Set Key'}
              </span>
              <span className={`w-2 h-2 rounded-full ${geminiStatus.configured ? 'bg-emerald-500' : 'bg-amber-500'}`} />
            </button>

            {/* Disease Knowledge Guide Button */}
            <button
              onClick={() => setShowKnowledgeGuide(true)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Disease Guide</span>
            </button>

            {/* History Button */}
            <button
              onClick={() => setShowHistoryDrawer(true)}
              className="relative p-2 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-colors"
              title="View Scan History"
            >
              <History className="w-5 h-5" />
              {scanHistory.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] font-bold flex items-center justify-center">
                  {scanHistory.length > 9 ? '9+' : scanHistory.length}
                </span>
              )}
            </button>

            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="uppercase">{language}</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-xl shadow-lg border border-slate-100 py-1.5 z-50">
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        changeLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs font-medium flex items-center justify-between hover:bg-emerald-50 ${
                        language === l.code ? 'text-emerald-700 font-bold bg-emerald-50/50' : 'text-slate-700'
                      }`}
                    >
                      <span>{l.nativeName}</span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* SUB-HEADER / BANNER */}
      <div className="bg-gradient-to-r from-emerald-700 via-teal-800 to-emerald-900 text-white py-6 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-emerald-800/80 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-emerald-200 mb-2 border border-emerald-600/40">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              Universal Agricultural Vision • Supports 50+ Indian Crops & Plants
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              AI Plant Identification & Crop Disease Detection
            </h2>
            <p className="text-sm text-emerald-100 max-w-2xl mt-1">
              Photograph any leaf to detect diseases, nutrient deficiencies, or pests in seconds. 
              Powered by Google Gemini multimodal AI cross-referenced with verified ICAR university guides.
            </p>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-3 bg-emerald-950/40 backdrop-blur-sm border border-emerald-500/30 rounded-2xl p-3 text-xs">
            <div className="text-center px-3 border-r border-emerald-700/50">
              <div className="text-lg font-bold text-white">50+</div>
              <div className="text-emerald-300">Crops & Plants</div>
            </div>
            <div className="text-center px-3 border-r border-emerald-700/50">
              <div className="text-lg font-bold text-emerald-300">Gemini</div>
              <div className="text-emerald-300">Vision Model</div>
            </div>
            <div className="text-center px-2">
              <div className="text-lg font-bold text-white">100%</div>
              <div className="text-emerald-300">Verified Advice</div>
            </div>
          </div>
        </div>
      </div>

      {/* GEMINI DISCONNECTED WARNING CALLOUT (if key is missing) */}
      {!geminiStatus.configured && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-2 border-amber-300 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 mt-0.5 shadow-md shadow-amber-500/30">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-bold text-amber-900">
                  Google Gemini Multimodal API Key Required for Live AI Analysis
                </h3>
                <p className="text-xs sm:text-sm text-amber-800 mt-0.5">
                  Connect your free Gemini API key to activate live plant vision. You can still browse our 
                  verified multi-crop disease guide without an API key.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:self-center">
              <button
                onClick={handleOpenApiKeyModal}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs sm:text-sm font-semibold rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap"
              >
                <Key className="w-4 h-4" />
                Configure Gemini Key
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT WORKFLOW */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        {/* THREE-STEP WORKFLOW INDICATOR */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6">
          <div className={`p-3 rounded-2xl border flex items-center gap-2 sm:gap-3 transition-all ${
            !imagePreview ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200'
          }`}>
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0">
              1
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">STEP 1</div>
              <div className="text-[11px] text-slate-500 hidden sm:block truncate">Capture or Upload</div>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border flex items-center gap-2 sm:gap-3 transition-all ${
            isScanning ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-400/30' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 ${
              isScanning ? 'bg-emerald-600 text-white animate-pulse' : 'bg-slate-200 text-slate-700'
            }`}>
              2
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">STEP 2</div>
              <div className="text-[11px] text-slate-500 hidden sm:block truncate">AI Analyzes Plant</div>
            </div>
          </div>

          <div className={`p-3 rounded-2xl border flex items-center gap-2 sm:gap-3 transition-all ${
            detectionResult ? 'bg-emerald-50 border-emerald-300 shadow-sm' : 'bg-white border-slate-200'
          }`}>
            <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full font-bold text-xs sm:text-sm flex items-center justify-center flex-shrink-0 ${
              detectionResult ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              3
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">STEP 3</div>
              <div className="text-[11px] text-slate-500 hidden sm:block truncate">Diagnosis & Guidance</div>
            </div>
          </div>
        </div>

        {/* WORKSPACE GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT COLUMN: CAPTURE, CROP SELECTOR, & CONTROLS (5 cols) */}
          <div className="lg:col-span-5 space-y-5">
            {/* CROP & METADATA CARD */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                  <Leaf className="w-4 h-4 text-emerald-600" />
                  Select Crop or Plant
                </span>
                <span className="text-[11px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  Optional Hint
                </span>
              </div>

              {/* Crop Selector Button (Opens selector popover) */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsCropDropdownOpen(!isCropDropdownOpen)}
                  className="w-full flex items-center justify-between p-3.5 bg-slate-50 hover:bg-emerald-50/50 border border-slate-200 rounded-2xl text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{selectedCropMeta.icon}</span>
                    <div>
                      <div className="text-sm font-bold text-slate-900">{selectedCropMeta.name}</div>
                      <div className="text-xs text-slate-500">
                        {language === 'kn' ? selectedCropMeta.localKn : language === 'hi' ? selectedCropMeta.localHi : (selectedCropMeta.scientificName || 'Universal Detection')}
                      </div>
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown / Modal for Crops */}
                {isCropDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-200 shadow-xl p-3 z-40 max-h-96 overflow-y-auto">
                    {/* Search inside crop selector */}
                    <div className="relative mb-2">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        placeholder="Search crop in English, ಕನ್ನಡ, or हिंदी..."
                        value={cropSearch}
                        onChange={(e) => setCropSearch(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      />
                    </div>

                    {/* Category Tabs */}
                    <div className="flex gap-1 overflow-x-auto pb-2 mb-2 scrollbar-none border-b border-slate-100">
                      {CROP_CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => setSelectedCategory(cat.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-colors ${
                            selectedCategory === cat.id
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {language === 'kn' ? cat.nameKn : language === 'hi' ? cat.nameHi : cat.name}
                        </button>
                      ))}
                    </div>

                    {/* Auto-Detect Option */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCrop('auto');
                        setIsCropDropdownOpen(false);
                      }}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left text-xs transition-colors mb-1 ${
                        selectedCrop === 'auto' ? 'bg-emerald-100/80 font-bold text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <span className="text-lg">✨</span>
                      <div>
                        <div className="font-bold">Auto-Detect Plant (Any Crop)</div>
                        <div className="text-[10px] text-slate-500">Gemini will autonomously identify plant species</div>
                      </div>
                    </button>

                    {/* Crop List */}
                    <div className="space-y-0.5">
                      {filteredCrops.map((c) => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setSelectedCrop(c.id);
                            setIsCropDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-colors ${
                            selectedCrop === c.id ? 'bg-emerald-100 font-bold text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{c.icon}</span>
                            <span>{c.name}</span>
                            <span className="text-[10px] text-slate-400">
                              ({language === 'kn' ? c.localKn : language === 'hi' ? c.localHi : c.scientificName})
                            </span>
                          </div>
                          {selectedCrop === c.id && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Farm Location & Date Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-emerald-600" />
                    Farm Location
                  </label>
                  <input
                    type="text"
                    value={farmLocation}
                    onChange={(e) => setFarmLocation(e.target.value)}
                    placeholder="e.g. Raichur Farm Plot 2"
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-emerald-600" />
                    Scan Date & Time
                  </label>
                  <input
                    type="datetime-local"
                    value={scanDateTime}
                    onChange={(e) => setScanDateTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>

            {/* CAMERA & CAPTURE INTERFACE */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Camera className="w-4 h-4 text-emerald-600" />
                  Leaf Photography
                </span>
                {imageSource && (
                  <span className="text-[11px] bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full capitalize">
                    Source: {imageSource}
                  </span>
                )}
              </div>

              {/* PREVIEW CONTAINER */}
              <div className="relative aspect-video sm:aspect-square w-full rounded-2xl bg-slate-900 overflow-hidden flex items-center justify-center border border-slate-200">
                {/* 1. Live Camera Stream */}
                {isCameraActive && (
                  <div className="relative w-full h-full">
                    <video
                      ref={videoRef}
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />

                    {/* Camera Overlay Guide */}
                    <div className="absolute inset-4 sm:inset-8 border-2 border-dashed border-white/60 rounded-2xl pointer-events-none flex items-center justify-center">
                      <div className="bg-black/40 backdrop-blur-sm text-white text-[11px] px-3 py-1.5 rounded-full">
                        Center leaf inside frame
                      </div>
                    </div>

                    {/* Camera Control Overlay */}
                    <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 px-4">
                      {hasMultipleCameras && (
                        <button
                          type="button"
                          onClick={switchCameraFacing}
                          className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all"
                          title="Switch Camera"
                        >
                          <SwitchCamera className="w-5 h-5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={capturePhotoFromCamera}
                        className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-sm rounded-full shadow-lg shadow-emerald-500/40 flex items-center gap-2 transition-all transform active:scale-95"
                      >
                        <Camera className="w-4 h-4" />
                        Capture Leaf Photo
                      </button>

                      <button
                        type="button"
                        onClick={stopCamera}
                        className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 backdrop-blur-md transition-all"
                        title="Cancel Camera"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {/* 2. Photo Preview */}
                {!isCameraActive && imagePreview && (
                  <div className="relative w-full h-full group">
                    <img
                      src={imagePreview}
                      alt="Crop Leaf Preview"
                      className="w-full h-full object-cover"
                    />

                    {/* Scanning Animation Overlay */}
                    {isScanning && (
                      <div className="absolute inset-0 bg-emerald-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center text-white p-4">
                        <div className="w-16 h-16 rounded-full border-4 border-emerald-400 border-t-transparent animate-spin mb-4" />
                        <div className="text-sm font-bold text-center text-emerald-200">
                          {scanSteps[scanStepIndex]}
                        </div>
                        <div className="w-48 bg-emerald-900/80 rounded-full h-1.5 mt-3 overflow-hidden">
                          <div
                            className="bg-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${((scanStepIndex + 1) / 4) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Preview action buttons */}
                    {!isScanning && (
                      <div className="absolute top-3 right-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-xl backdrop-blur-md transition-all"
                          title="Retake Photo"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="p-2 bg-red-600/80 hover:bg-red-700 text-white rounded-xl backdrop-blur-md transition-all"
                          title="Remove Photo"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. Empty Placeholder */}
                {!isCameraActive && !imagePreview && (
                  <div className="text-center p-6 text-slate-400 space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-slate-800 text-slate-500 mx-auto flex items-center justify-center">
                      <ImageIcon className="w-8 h-8" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-200">No plant photograph selected</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                        Take a photo using your mobile camera or upload a leaf picture from your gallery
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Error alerts */}
              {fileError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>{fileError}</span>
                </div>
              )}

              {cameraError && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl text-xs flex items-center gap-2">
                  <Info className="w-4 h-4 flex-shrink-0" />
                  <span>{cameraError}</span>
                </div>
              )}

              {/* CAPTURE BUTTONS ROW */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => startCamera('environment')}
                  disabled={isScanning}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm transition-all disabled:opacity-50"
                >
                  <Camera className="w-4 h-4" />
                  Take Photo
                </button>

                <button
                  type="button"
                  onClick={handleOpenGallery}
                  disabled={isScanning}
                  className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  <Upload className="w-4 h-4" />
                  From Gallery
                </button>
              </div>

              {/* Native Mobile Camera Fallback button */}
              <button
                type="button"
                onClick={handleOpenMobileCameraFallback}
                className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-medium rounded-xl border border-slate-200/80 transition-colors"
              >
                Having camera issues? Open native camera app
              </button>

              {/* PRIMARY ANALYZE PLANT BUTTON */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleAnalyzePlant}
                  disabled={!imagePreview || isScanning}
                  className={`w-full py-4 px-6 rounded-2xl font-extrabold text-sm sm:text-base flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                    !imagePreview || isScanning
                      ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                      : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white shadow-emerald-600/30 active:scale-[0.98]'
                  }`}
                >
                  {isScanning ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Analyzing with Google Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 text-yellow-300" />
                      Analyze Plant with Gemini AI
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 12 DEMO SAMPLES CAROUSEL / GRID */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    One-Click Demo Crop Samples
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Test Gemini across 12 diverse crops without camera
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 pt-1 max-h-56 overflow-y-auto">
                {DEMO_LEAF_SAMPLES.map((demo) => (
                  <button
                    key={demo.id}
                    type="button"
                    onClick={() => handleSelectDemoSample(demo)}
                    className="p-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left transition-all group flex flex-col items-center text-center"
                  >
                    <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                      <img
                        src={demo.sampleImage}
                        alt={demo.cropName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="text-[11px] font-bold text-slate-800 truncate w-full">
                      {demo.cropName}
                    </div>
                    <div className="text-[9px] text-slate-400 truncate w-full">
                      {demo.diseaseName.split('(')[0]}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AI RESULTS & CLINICAL ADVISORY (7 cols) */}
          <div className="lg:col-span-7 space-y-5">
            {/* 1. AI ERROR / DISCONNECTED STATE (if any) */}
            {aiErrorState && (
              <div className="bg-white rounded-3xl border border-red-200 p-6 shadow-sm space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {aiErrorState.status === 'gemini_disconnected'
                        ? 'Google Gemini API Key Needed'
                        : aiErrorState.status === 'rejected_non_plant'
                        ? 'Image Not Recognized as Plant Leaf'
                        : 'AI Vision Analysis Notification'}
                    </h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {aiErrorState.message}
                    </p>
                  </div>
                </div>

                {aiErrorState.needsApiKey && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleOpenApiKeyModal}
                      className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow"
                    >
                      <Key className="w-4 h-4" />
                      Enter Gemini API Key
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* 2. SUCCESSFUL AI DETECTION REPORT */}
            {detectionResult && (
              <div className="bg-white rounded-3xl border border-emerald-200/80 shadow-md overflow-hidden space-y-6">
                {/* Result Header Banner */}
                <div className={`p-6 text-white ${
                  detectionResult.isHealthy
                    ? 'bg-gradient-to-r from-emerald-600 to-green-700'
                    : detectionResult.healthStatus === 'Nutrient_Deficient'
                    ? 'bg-gradient-to-r from-amber-600 to-orange-700'
                    : 'bg-gradient-to-r from-rose-600 to-red-700'
                }`}>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="inline-flex items-center gap-1.5 bg-black/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                        AI Diagnosis Complete • {detectionResult.confidencePercentage} Confidence
                      </div>
                      <h3 className="text-2xl font-black text-white">
                        {detectionResult.diseaseName}
                      </h3>
                      <p className="text-sm text-white/90 font-medium mt-1">
                        {detectionResult.plantName} • <em>{detectionResult.scientificName}</em>
                      </p>
                    </div>

                    <div className="self-start sm:self-center">
                      <span className="px-4 py-2 rounded-2xl bg-white/20 backdrop-blur-md text-white font-extrabold text-sm border border-white/30 uppercase tracking-wider">
                        {detectionResult.healthStatus}
                      </span>
                    </div>
                  </div>
                </div>

                {/* SIDE-BY-SIDE SUMMARY */}
                <div className="px-6 grid grid-cols-1 sm:grid-cols-12 gap-5 items-center">
                  <div className="sm:col-span-4 aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                    <img
                      src={detectionResult.image}
                      alt="Scanned Plant Leaf"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="sm:col-span-8 space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Crop Group</div>
                        <div className="text-slate-800 font-bold text-sm mt-0.5">{detectionResult.cropName}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Pathogen Type</div>
                        <div className="text-slate-800 font-bold text-sm mt-0.5">{detectionResult.diseaseCategory}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Farm Location</div>
                        <div className="text-slate-800 font-bold text-xs mt-0.5 truncate">{detectionResult.farmLocation}</div>
                      </div>

                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="text-slate-400 font-semibold uppercase text-[10px]">Image Quality</div>
                        <div className="text-slate-800 font-bold text-xs mt-0.5">{detectionResult.imageQuality || 'Clear'}</div>
                      </div>
                    </div>

                    {/* Uncertainty Notice */}
                    <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                      <Info className="w-4 h-4 flex-shrink-0 text-amber-700 mt-0.5" />
                      <div>
                        <span className="font-bold">AI Heuristic Notice: </span>
                        <span>{detectionResult.uncertaintyNote}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* VISIBLE SYMPTOMS */}
                {detectionResult.visibleSymptoms && detectionResult.visibleSymptoms.length > 0 && (
                  <div className="px-6 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Eye className="w-4 h-4 text-emerald-600" />
                      Visible Symptoms Observed on Leaf
                    </h4>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      {detectionResult.visibleSymptoms.map((symptom, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                          <span>{symptom}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* POSSIBLE CAUSES */}
                {detectionResult.possibleCauses && detectionResult.possibleCauses.length > 0 && (
                  <div className="px-6 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      Contributing Causes & Favouring Conditions
                    </h4>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      {detectionResult.possibleCauses.map((cause, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                          <span>{cause}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TREATMENT RECOMMENDATIONS WITH TABS */}
                <div className="px-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-emerald-600" />
                      Recommended Treatment Protocol
                    </h4>

                    {/* Tab Switcher */}
                    <div className="flex bg-slate-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('organic')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTreatmentTab === 'organic'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        🌱 Organic & Bio
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveTreatmentTab('chemical')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          activeTreatmentTab === 'chemical'
                            ? 'bg-white text-emerald-700 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        🧪 Chemical Control
                      </button>
                    </div>
                  </div>

                  <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100 space-y-2.5">
                    {activeTreatmentTab === 'organic' ? (
                      <>
                        <div className="text-[11px] font-bold text-emerald-900 uppercase">
                          Biological & Organic Remedies (Safe for Predators & Soil Health):
                        </div>
                        {detectionResult.recommendedTreatment?.organic && detectionResult.recommendedTreatment.organic.length > 0 ? (
                          detectionResult.recommendedTreatment.organic.map((treat, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                              <span>{treat}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">No organic treatment specified.</p>
                        )}
                      </>
                    ) : (
                      <>
                        <div className="text-[11px] font-bold text-slate-800 uppercase">
                          CIBRC Approved Chemical Dosages (Use only with proper protective gear):
                        </div>
                        {detectionResult.recommendedTreatment?.chemical && detectionResult.recommendedTreatment.chemical.length > 0 ? (
                          detectionResult.recommendedTreatment.chemical.map((treat, idx) => (
                            <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-800">
                              <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span>{treat}</span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">No chemical spray required for this condition.</p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* PREVENTIVE MEASURES */}
                {detectionResult.preventionMethods && detectionResult.preventionMethods.length > 0 && (
                  <div className="px-6 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      Preventive Agronomic Practices
                    </h4>
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2">
                      {detectionResult.preventionMethods.map((prev, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                          <span>{prev}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* EXPERT CONSULTATION NOTICE & SOURCE */}
                <div className="px-6 space-y-3">
                  <div className="p-4 bg-red-50/70 border border-red-200/80 rounded-2xl text-red-900 text-xs flex items-start gap-3">
                    <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">When to Escalate to Local Agronomist / KVK:</div>
                      <div className="mt-0.5 text-red-800">{detectionResult.whenToSeekExpertAdvice}</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Reference: <strong>{detectionResult.referenceSource}</strong></span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Verified Guidelines
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS FOOTER */}
                <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleDownloadReport}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow"
                    >
                      <Download className="w-4 h-4" />
                      Download Report
                    </button>

                    <button
                      type="button"
                      onClick={() => setShowHistoryDrawer(true)}
                      className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <History className="w-4 h-4" />
                      View Past Scans ({scanHistory.length})
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={handleRetakePhoto}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Scan Another Leaf
                  </button>
                </div>
              </div>
            )}

            {/* 3. DEFAULT PLACEHOLDER (BEFORE SCAN) */}
            {!detectionResult && !aiErrorState && (
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 text-center space-y-4 shadow-sm">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <ScanLine className="w-10 h-10 animate-pulse" />
                </div>
                <div className="max-w-md mx-auto space-y-1">
                  <h3 className="text-lg font-extrabold text-slate-800">
                    Ready to Scan Your Crop Leaf
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                    Capture or upload a leaf photograph on the left. Google Gemini Multimodal AI will identify 
                    the crop, assess health status, diagnose diseases, and provide verified organic and chemical treatments.
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 max-w-lg mx-auto text-left">
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-emerald-700 font-bold text-xs">🌾 All Crops</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Cereals, pulses, vegetables, fruits & trees</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                    <div className="text-emerald-700 font-bold text-xs">🧪 Dual Treatment</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Both organic biocontrol & chemical dosages</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 col-span-2 sm:col-span-1">
                    <div className="text-emerald-700 font-bold text-xs">🏛️ ICAR Backed</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Validated agricultural university standards</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* GEMINI API KEY CONFIGURATION MODAL */}
      {showApiKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Google Gemini API Configuration</h3>
                  <p className="text-xs text-slate-500">Powers real multimodal image understanding</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowApiKeyModal(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-1">
                  Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
                  value={inputApiKey}
                  onChange={(e) => setInputApiKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              {/* Status Display */}
              <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 space-y-1">
                <div>Active Key Status: <strong>{geminiStatus.maskedKey}</strong></div>
                <div>Key Source: <strong className="capitalize">{geminiStatus.source}</strong></div>
              </div>

              {/* Feedback messages */}
              {apiKeyFeedback && (
                <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  apiKeyFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' :
                  apiKeyFeedback.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
                  'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {apiKeyFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0" />}
                  <span>{apiKeyFeedback.message}</span>
                </div>
              )}

              {/* Security / Prototype Notice */}
              <div className="p-3 bg-amber-50 rounded-xl text-[11px] text-amber-800 leading-relaxed border border-amber-200/60">
                <strong>Development Prototype Notice: </strong>
                Your API key is stored only in your local browser (<code className="font-mono">localStorage</code>) 
                or read from <code className="font-mono">VITE_GEMINI_API_KEY</code> in <code className="font-mono">.env</code>. 
                Get a free key from <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" className="underline font-bold text-amber-900">Google AI Studio</a>.
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleTestApiKey}
                disabled={isTestingApiKey || !inputApiKey.trim()}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
              >
                {isTestingApiKey ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-slate-600 border-t-transparent rounded-full animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3.5 h-3.5" />
                    Test Connection
                  </>
                )}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowApiKeyModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleSaveApiKey();
                    setShowApiKeyModal(false);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow transition-all"
                >
                  Save & Connect
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MULTI-CROP DISEASE KNOWLEDGE GUIDE MODAL */}
      {showKnowledgeGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Guide Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Multi-Crop Disease Encyclopedia</h3>
                  <p className="text-xs text-emerald-200">ICAR & Agricultural University Reference Bulletins</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowKnowledgeGuide(false)}
                className="p-1.5 rounded-xl hover:bg-white/20 text-white/80 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Guide Filters & Search */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search diseases, symptoms, or pathogen (e.g. Rice Blast, Rust, Anthracnose)..."
                  value={guideSearchQuery}
                  onChange={(e) => setGuideSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* Crop Filter Buttons */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                <button
                  type="button"
                  onClick={() => setGuideCategoryFilter('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                    guideCategoryFilter === 'all'
                      ? 'bg-emerald-600 text-white'
                      : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  All Crops ({Object.keys(COMPREHENSIVE_DISEASE_LIBRARY).length})
                </button>
                {['rice', 'wheat', 'maize', 'cotton', 'groundnut', 'tomato', 'chilli', 'potato', 'onion', 'banana', 'mango', 'grapes', 'sugarcane'].map((cId) => {
                  const meta = findCropMetadata(cId);
                  return (
                    <button
                      key={cId}
                      type="button"
                      onClick={() => setGuideCategoryFilter(cId)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                        guideCategoryFilter === cId
                          ? 'bg-emerald-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <span>{meta?.icon || '🌱'}</span>
                      <span>{meta?.name || cId}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Guide List */}
            <div className="p-5 overflow-y-auto space-y-4 flex-1">
              {filteredGuideList.map((disease) => (
                <div
                  key={disease.id}
                  className="p-5 rounded-2xl border border-slate-200/80 hover:border-emerald-300 bg-white hover:shadow-md transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100">
                          {disease.cropName}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          {disease.category}
                        </span>
                      </div>
                      <h4 className="text-base font-bold text-slate-900 mt-1">
                        {disease.diseaseName}
                      </h4>
                      <p className="text-xs text-slate-500 italic mt-0.5">
                        Pathogen: {disease.pathogen}
                      </p>
                    </div>
                  </div>

                  {/* Symptoms */}
                  <div>
                    <div className="text-[11px] font-bold text-slate-700 uppercase">Key Symptoms:</div>
                    <ul className="mt-1 space-y-1">
                      {disease.symptoms.slice(0, 3).map((sym, i) => (
                        <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Organic & Chemical quick summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    <div className="p-2.5 bg-emerald-50/60 rounded-xl border border-emerald-100">
                      <div className="font-bold text-emerald-900 text-[10px] uppercase">Organic Control</div>
                      <div className="text-emerald-800 text-[11px] mt-0.5 truncate">
                        {disease.treatment.organic[0] || 'Bio-fungicide foliar spray'}
                      </div>
                    </div>
                    <div className="p-2.5 bg-blue-50/60 rounded-xl border border-blue-100">
                      <div className="font-bold text-blue-900 text-[10px] uppercase">Chemical Control</div>
                      <div className="text-blue-800 text-[11px] mt-0.5 truncate">
                        {disease.treatment.chemical[0] || 'Targeted fungicide spray'}
                      </div>
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 pt-1">
                    Source: {disease.referenceSource}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SCAN HISTORY DRAWER / MODAL */}
      {showHistoryDrawer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-emerald-800 text-white">
              <div className="flex items-center gap-2.5">
                <History className="w-5 h-5 text-emerald-300" />
                <div>
                  <h3 className="text-sm font-bold text-white">Scan History (IndexedDB)</h3>
                  <p className="text-[11px] text-emerald-200">{scanHistory.length} saved crop scans</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHistoryDrawer(false)}
                className="p-1 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search & CSV Actions */}
            <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                <input
                  type="text"
                  placeholder="Filter past scans..."
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleExportHistoryCSV}
                className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm whitespace-nowrap"
                title="Export Scans to CSV"
              >
                <Download className="w-3.5 h-3.5" />
                CSV
              </button>
            </div>

            {/* Past Scans List */}
            <div className="p-3 overflow-y-auto space-y-2.5 flex-1">
              {filteredHistory.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Leaf className="w-10 h-10 mx-auto text-slate-300" />
                  <p className="text-xs">No scan records found in IndexedDB</p>
                </div>
              ) : (
                filteredHistory.map((scan) => (
                  <div
                    key={scan.id}
                    onClick={() => {
                      setDetectionResult(scan);
                      setImagePreview(scan.image);
                      setShowHistoryDrawer(false);
                    }}
                    className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/40 cursor-pointer transition-all flex items-start gap-3 bg-white"
                  >
                    <div className="w-14 h-14 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0 border border-slate-200">
                      {scan.image ? (
                        <img src={scan.image} alt={scan.cropName} className="w-full h-full object-cover" />
                      ) : (
                        <Leaf className="w-6 h-6 text-slate-400 m-auto" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {scan.cropName}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteScan(scan.id, e)}
                          className="p-1 text-slate-400 hover:text-red-600 rounded transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-[11px] font-semibold text-emerald-800 truncate">
                        {scan.diseaseName}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-1">
                        <span>{new Date(scan.scannedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="truncate">{scan.farmLocation}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
