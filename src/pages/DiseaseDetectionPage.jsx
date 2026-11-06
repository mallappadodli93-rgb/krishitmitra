import React, { useState, useRef, useEffect } from 'react';
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
  Maximize2,
  Check,
  Globe,
  ChevronDown
} from 'lucide-react';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import Card from '../components/common/Card';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';

// Curated realistic mock detection database
const MOCK_DISEASE_DATABASE = [
  {
    id: 'tomato-early-blight',
    cropName: 'Tomato (Tamatar / ಟೊಮೆಟೊ)',
    diseaseName: 'Early Blight (Alternaria solani)',
    severity: 'Moderate Infection',
    severityColor: 'amber',
    sampleImage: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=800&auto=format&fit=crop&q=80',
    description: 'Early blight is a very common fungal disease affecting tomatoes, potatoes, and eggplants caused by Alternaria solani. It primarily attacks older foliage first, rapidly reducing photosynthetic leaf area and leading to premature fruit drop if left untreated.',
    symptoms: [
      'Circular to angular dark brown or black spots with concentric rings ("bullseye target pattern").',
      'Yellow chlorotic halos surrounding the brown necrotic lesions.',
      'Infected lower leaves dry up, turn yellow, and drop prematurely.',
      'Dark, sunken leathery lesions on the stem near the soil line.'
    ],
    treatment: {
      organic: 'Spray Trichoderma viride @ 5g/liter with 10% sour buttermilk (chaach) solution. Alternatively, spray cold-pressed neem seed oil (1500 ppm) @ 5ml/liter early morning.',
      chemical: 'Foliar spray of Mancozeb 75% WP @ 2.5 g/liter of water OR Azoxystrobin 23% SC @ 1 ml/liter. Repeat spray after 10-12 days if humid weather persists.'
    },
    preventionTips: [
      'Practice 3-year crop rotation with non-solanaceous crops (avoid planting after potato or brinjal).',
      'Mulch soil with clean paddy straw or plastic mulch to stop fungal spores from splashing onto lower foliage.',
      'Drip irrigation is strongly advised over overhead sprinkler watering to keep foliage dry.',
      'Prune and destroy lower diseased leaves touching the ground.'
    ]
  },
  {
    id: 'wheat-yellow-rust',
    cropName: 'Wheat (Gehun / ಗೋಧಿ)',
    diseaseName: 'Yellow / Stripe Rust (Puccinia striiformis)',
    severity: 'High Priority Alert',
    severityColor: 'red',
    sampleImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    description: 'Yellow rust (Stripe rust) is an airborne fungal disease prevalent during cool, humid Rabi months. Spores travel long distances on wind currents and severely disrupt grain filling, causing up to 40% yield loss in susceptible varieties.',
    symptoms: [
      'Bright yellow-to-orange powdery pustules (uredinia) arranged in neat linear parallel stripes on leaf blades.',
      'Yellow dust easily rubs off onto fingers or clothes when brushing against foliage.',
      'Severe chlorosis and yellowing of the flag leaf, resulting in shriveled kernels.',
      'Entire field appears yellowish from a distance in patchy circular foci.'
    ],
    treatment: {
      organic: 'At initial onset, spray fermented cow urine solution (10%) mixed with 5% neem cake extract. Note: Severe epidemics require immediate chemical intervention.',
      chemical: 'Spray Propiconazole 25% EC (Tilt) @ 1 ml per liter of water (200 ml in 200 liters of water per acre) or Tebuconazole 25.9% EC @ 1 ml/liter immediately within 48 hours.'
    },
    preventionTips: [
      'Sow rust-resistant recommended varieties like HD-2967, HD-3086, DBW-187, or PBW-725.',
      'Avoid delayed sowing past November 25 in rust-prone northwestern plains.',
      'Do not apply excessive urea (nitrogen) early in the season, which promotes lush tender tissue vulnerable to spores.',
      'Monitor fields weekly during cold morning fogs between December and February.'
    ]
  },
  {
    id: 'rice-bacterial-blight',
    cropName: 'Paddy / Rice (Dhan / ಭತ್ತ)',
    diseaseName: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    severity: 'High Priority Alert',
    severityColor: 'red',
    sampleImage: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80',
    description: 'Bacterial leaf blight (BLB) is a destructive vascular bacterial disease widespread in irrigated and rainfed lowland rice ecosystems. It causes drying of leaves, premature wilting, and empty glumes.',
    symptoms: [
      'Water-soaked to yellowish-green stripes with wavy margins starting from leaf tips and margins.',
      'Lesions enlarge rapidly, turning straw-yellow to grayish-white as tissues die.',
      'Milky bacterial ooze beads on young lesions early morning under high humidity.',
      'Wilting and rolling of entire tillers ("Kresek" phase) in young seedlings.'
    ],
    treatment: {
      organic: 'Spray fresh cow dung supernatant solution (20%) filtered through muslin cloth. Apply Pseudomonas fluorescens @ 5g/liter at 15-day intervals.',
      chemical: 'Spray Streptocycline (90% Streptomycin + 10% Tetracycline) @ 6 g + Copper Oxychloride 50% WP @ 500 g in 200 liters of water per acre.'
    },
    preventionTips: [
      'Avoid clipping seedling tips during transplanting as bacterial entry occurs through fresh wounds.',
      'Temporarily drain stagnant water from paddy fields for 3-4 days to arrest bacterial multiplication.',
      'Balance potash fertilizer application; avoid single heavy doses of top-dressed urea.',
      'Grow BLB-resistant hybrid lines such as Improved Samba Mahsuri or Pusa Basmati 1718.'
    ]
  },
  {
    id: 'cotton-leaf-spot',
    cropName: 'Cotton (Kapas / ಹತ್ತಿ)',
    diseaseName: 'Angular Leaf Spot / Bacterial Blight (Xanthomonas citri)',
    severity: 'Moderate Infection',
    severityColor: 'amber',
    sampleImage: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80',
    description: 'Angular leaf spot is a seed-borne bacterial infection attacking cotton leaves, branches ("blackarm" phase), and developing bolls. It spreads rapidly through wind-driven rains and warm, damp conditions.',
    symptoms: [
      'Small, water-soaked polygonal spots bounded by leaf veinlets (angular appearance).',
      'Lesions turn dark brown to blackish on the lower and upper leaf surface.',
      'Dark elongated sunken cankers on petioles and stems causing branch breakage.',
      'Premature shedding of squares and infected green bolls.'
    ],
    treatment: {
      organic: 'Spray Pseudomonas fluorescens or Bacillus subtilis @ 5g/liter. Spray 5% garlic-chili extract solution as an antibacterial deterrent.',
      chemical: 'Foliar spray of Copper Oxychloride 50% WP @ 2.5 g/liter + Streptocycline @ 0.1 g/liter (1 g in 10 liters of water).'
    },
    preventionTips: [
      'Acid-delint certified seed with concentrated sulfuric acid before sowing.',
      'Destroy leftover cotton stalks after harvest; do not leave ratoons over winter.',
      'Maintain wide row-to-row spacing for adequate air circulation inside crop canopy.',
      'Avoid flood irrigation during humid spells.'
    ]
  }
];

export default function DiseaseDetectionPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const { isOffline, saveDiseaseLocally, openOfflineGuide } = useOffline();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Selected image state
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageSource, setImageSource] = useState(null); // 'camera' | 'gallery' | 'sample'
  const [fileError, setFileError] = useState('');
  
  // Scanning and detection states
  const [isScanning, setIsScanning] = useState(false);
  const [scanStepText, setScanStepText] = useState('');
  const [detectionResult, setDetectionResult] = useState(null);
  const [selectedSampleIndex, setSelectedSampleIndex] = useState(0);

  // Live Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState('environment'); // default to rear camera
  const [hasMultipleCameras, setHasMultipleCameras] = useState(false);
  const [cameraError, setCameraError] = useState('');

  // DOM Refs
  const fileInputRef = useRef(null);
  const mobileCaptureInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Stop camera tracks cleanly
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        try {
          track.stop();
        } catch (e) {
          console.error('Error stopping track', e);
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

  // Ensure camera stops when leaving page or component unmounts
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Start live camera stream (requests camera permission & rear camera by default)
  const startCamera = async (facingMode = 'environment') => {
    stopCamera();
    setIsCameraLoading(true);
    setCameraError('');
    setIsCameraActive(true);
    setFileError('');

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError(
        'Live camera access is not supported on this browser. You can use the "Take Quick Photo" button or "Upload from Gallery".'
      );
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
            console.error('Error playing camera feed:', err);
          });
        };
      }

      setCameraFacingMode(facingMode);
      setIsCameraLoading(false);

      // Check if multiple camera devices exist (to show Switch Camera button)
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoInputs = devices.filter((d) => d.kind === 'videoinput');
          setHasMultipleCameras(videoInputs.length > 1);
        } catch (e) {
          setHasMultipleCameras(true);
        }
      } else {
        setHasMultipleCameras(true);
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setIsCameraLoading(false);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError(
          'Camera permission was denied. Please allow camera access in your browser address bar, or use the "Take Quick Photo" button below.'
        );
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device was detected on your system. Please upload a photo from your gallery.');
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        setCameraError('Camera is currently in use by another application. Please close other camera apps and retry.');
      } else {
        setCameraError('Could not open live camera preview. Please try the mobile camera fallback or gallery upload.');
      }
    }
  };

  // Switch between Rear and Front camera
  const handleSwitchCamera = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    startCamera(nextMode);
  };

  // Capture photo from live video stream
  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the current video frame onto canvas
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);

    setImagePreview(dataUrl);
    setSelectedFile({
      name: `Live_Camera_Leaf_${new Date().toISOString().slice(0, 10)}.jpg`,
      type: 'image/jpeg'
    });
    setImageSource('camera');
    setDetectionResult(null);
    setFileError('');

    // Stop camera stream after capture
    stopCamera();
  };

  // Validate and handle uploaded file from gallery or direct mobile capture
  const processFile = (file, source = 'gallery') => {
    setFileError('');
    setDetectionResult(null);
    stopCamera();

    if (!file) return;

    // Supported formats: JPG, JPEG, PNG
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const validExtensions = /\.(jpe?g|png)$/i;

    if (!validTypes.includes(file.type) && !validExtensions.test(file.name)) {
      setFileError('Invalid file format. Please upload an image in JPG, JPEG, or PNG format.');
      return;
    }

    // Maximum file size: 10MB
    if (file.size > 10 * 1024 * 1024) {
      setFileError('File size is too large. Please select an image under 10MB.');
      return;
    }

    setSelectedFile(file);
    setImageSource(source);
    const objectUrl = URL.createObjectURL(file);
    setImagePreview(objectUrl);
  };

  const handleFileInputChange = (e, source = 'gallery') => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file, source);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file, 'gallery');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Select sample demo leaf
  const handleSelectSample = (index) => {
    stopCamera();
    setFileError('');
    setDetectionResult(null);
    setSelectedSampleIndex(index);
    const sample = MOCK_DISEASE_DATABASE[index];
    setSelectedFile({ name: `${sample.cropName} Leaf Sample.jpg` });
    setImageSource('sample');
    setImagePreview(sample.sampleImage);
  };

  // Remove current image
  const handleRemoveImage = () => {
    stopCamera();
    setSelectedFile(null);
    setImagePreview(null);
    setImageSource(null);
    setDetectionResult(null);
    setFileError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if (mobileCaptureInputRef.current) {
      mobileCaptureInputRef.current.value = '';
    }
  };

  // Retake photo / reopen camera
  const handleRetakePhoto = () => {
    handleRemoveImage();
    startCamera(cameraFacingMode);
  };

  // Open file gallery
  const handleOpenGallery = () => {
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Open direct mobile camera fallback
  const handleOpenMobileCameraFallback = () => {
    stopCamera();
    if (mobileCaptureInputRef.current) {
      mobileCaptureInputRef.current.click();
    }
  };

  // Detect Disease button click (Mock AI Detection Engine)
  const handleDetectDisease = () => {
    if (!imagePreview) {
      setFileError('Please take a camera photo, upload an image from gallery, or select a sample leaf first.');
      return;
    }

    setIsScanning(true);
    setDetectionResult(null);
    setScanStepText('Analyzing leaf contours and chlorosis pattern...');

    setTimeout(() => {
      setScanStepText('Matching lesion shapes against ICAR crop disease dataset...');
    }, 450);

    setTimeout(() => {
      setScanStepText('Formulating organic and chemical remedy recommendations...');
    }, 900);

    setTimeout(() => {
      setIsScanning(false);
      // Select mock result matching sample or fallback
      const result = MOCK_DISEASE_DATABASE[selectedSampleIndex % MOCK_DISEASE_DATABASE.length];
      setDetectionResult(result);
      // Auto-cache diagnosed disease for offline access
      saveDiseaseLocally(result);
    }, 1350);
  };

  // Safe navigation stops camera
  const handleNavHome = () => {
    stopCamera();
    if (onNavigateHome) onNavigateHome();
  };

  const handleNavDashboard = () => {
    stopCamera();
    if (onNavigateDashboard) onNavigateDashboard();
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* Hidden file inputs */}
      {/* 1. Gallery File Picker (JPG, JPEG, PNG) */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".jpg,.jpeg,.png,image/jpeg,image/png"
        onChange={(e) => handleFileInputChange(e, 'gallery')}
        className="hidden"
      />

      {/* 2. Mobile Native Camera Capture Fallback (HTML5 capture attribute) */}
      <input
        ref={mobileCaptureInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={(e) => handleFileInputChange(e, 'camera')}
        className="hidden"
      />

      {/* Header with Navigation */}
      <div className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNavHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('weatherBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={handleNavDashboard}
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
                {t('featDiseaseTitle')}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Title & Introduction */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <Badge variant="emerald" icon={ScanLine}>
            {t('brandName')} • {t('featDiseaseTitle')}
          </Badge>

          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('featDiseaseTitle')}
          </h1>

          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            {t('featDiseaseDesc')}
          </p>
        </div>

        {/* Offline Disclaimer Banner when Offline */}
        {isOffline && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0"></span>
              <span><strong>Offline Mode:</strong> Live camera vision and online AI models require an internet connection. You can browse saved disease remedies offline.</span>
            </div>
            <button
              type="button"
              onClick={openOfflineGuide}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition shrink-0"
            >
              Browse Saved Remedies
            </button>
          </div>
        )}

        {/* Farmer Simple Instructions Banner */}
        <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-3xl p-5 sm:p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h2 className="text-sm font-extrabold text-emerald-950">
                {language === 'kn' ? 'ರೈತರಿಗೆ ಸರಳ ಸೂಚನೆಗಳು (Simple Instructions)' : language === 'hi' ? 'किसानों के लिए सरल निर्देश' : 'Simple 3-Step Guide for Farmers'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs text-emerald-900">
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-emerald-200/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span>{language === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಅಥವಾ ಗ್ಯಾಲರಿ ಆಯ್ಕೆ ಮಾಡಿ' : language === 'hi' ? 'कैमरा या गैलरी चुनें' : 'Choose Camera or Gallery'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-emerald-200/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                  <span>{language === 'kn' ? 'ರೋಗವಿರುವ ಎಲೆಯ ಮೇಲೆ ಕೇಂದ್ರೀಕರಿಸಿ' : language === 'hi' ? 'रोगग्रस्त पत्ती पर फोकस करें' : 'Frame infected leaf clearly'}</span>
                </div>
                <div className="flex items-center gap-2 bg-white/70 px-3 py-2 rounded-xl border border-emerald-200/60">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                  <span>{language === 'kn' ? 'ರೋಗ ಪತ್ತೆ ಮಾಡಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : language === 'hi' ? 'रोग पहचानें पर क्लिक करें' : 'Click "Detect Disease"'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Main Action Choices: Open Camera vs Upload from Gallery */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Option A: Open Camera (Large Green Button) */}
          <button
            type="button"
            onClick={() => startCamera('environment')}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 group relative overflow-hidden shadow-sm active:scale-[0.98] ${
              isCameraActive
                ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500'
                : 'border-emerald-200 hover:border-emerald-500 bg-white hover:bg-emerald-50/40'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 group-hover:scale-105 transition-transform">
              <Camera className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700">
                {t('cameraOpen')}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {language === 'kn' ? 'ಹಿಂಭಾಗದ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾ ಮೂಲಕ ಲೈವ್ ಸ್ಕ್ಯಾನ್' : language === 'hi' ? 'रियर कैमरे से लाइव फोटो खींचें' : 'Live rear camera scanning & capture'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3 h-3 text-emerald-600" />
              {language === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ' : language === 'hi' ? 'अनुशंसित' : 'Recommended'}
            </span>
          </button>

          {/* Option B: Upload Photo from Gallery */}
          <button
            type="button"
            onClick={handleOpenGallery}
            className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center text-center gap-3 group shadow-sm active:scale-[0.98] ${
              imagePreview && imageSource === 'gallery'
                ? 'border-emerald-600 bg-emerald-50/90 shadow-md ring-2 ring-emerald-500'
                : 'border-slate-200 hover:border-emerald-400 bg-white hover:bg-emerald-50/30'
            }`}
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-emerald-700 border border-slate-300 flex items-center justify-center shadow-inner group-hover:scale-105 transition-transform">
              <Upload className="w-8 h-8" />
            </div>
            <div>
              <span className="block text-base sm:text-lg font-black text-slate-900 group-hover:text-emerald-700">
                {t('uploadGallery')}
              </span>
              <span className="block text-xs text-slate-500 mt-0.5">
                {language === 'kn' ? 'JPG, JPEG ಅಥವಾ PNG ಚಿತ್ರಗಳನ್ನು ಆಯ್ಕೆ ಮಾಡಿ' : language === 'hi' ? 'JPG, JPEG या PNG फोटो चुनें' : 'Select JPG, JPEG or PNG from device'}
              </span>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-full">
              <ImageIcon className="w-3 h-3 text-slate-500" />
              {language === 'kn' ? 'ಗ್ಯಾಲರಿ / ಫೈಲ್ಸ್' : language === 'hi' ? 'गैलरी / फाइल' : 'Gallery & Files'}
            </span>
          </button>

        </div>

        {/* 2. Live Camera Viewfinder (Visible when camera is active) */}
        {isCameraActive && (
          <div className="bg-slate-950 rounded-3xl p-4 sm:p-6 text-white shadow-2xl border-2 border-emerald-500 animate-in fade-in duration-300 space-y-4">
            
            {/* Camera Viewfinder Top Bar */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse"></span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                  <Camera className="w-4 h-4" />
                  <span>
                    {language === 'kn' ? 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ವೀಕ್ಷಣೆ' : language === 'hi' ? 'लाइव कैमरा दृश्य' : 'Live Camera Viewfinder'}
                  </span>
                </span>
                <span className="hidden sm:inline-block text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded">
                  {cameraFacingMode === 'environment' ? 'Rear Camera (ಹಿಂಭಾಗ)' : 'Front Camera (ಮುಂಭಾಗ)'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Switch Camera Button */}
                {hasMultipleCameras && (
                  <button
                    type="button"
                    onClick={handleSwitchCamera}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold flex items-center gap-1.5 transition"
                    title={t('cameraSwitch')}
                  >
                    <SwitchCamera className="w-4 h-4" />
                    <span className="hidden md:inline">{t('cameraSwitch')}</span>
                  </button>
                )}

                {/* Close Camera Button */}
                <button
                  type="button"
                  onClick={stopCamera}
                  className="p-2 rounded-xl bg-red-500/20 hover:bg-red-500 text-red-200 hover:text-white transition"
                  title={t('cameraClose')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Video Viewport with Targeting Framing Box */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-black flex items-center justify-center">
              
              {isCameraLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 text-emerald-400 animate-pulse">
                  <Camera className="w-10 h-10 animate-bounce" />
                  <p className="text-xs font-bold">
                    {language === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಪ್ರಾರಂಭಿಸಲಾಗುತ್ತಿದೆ...' : language === 'hi' ? 'कैमरा शुरू हो रहा है...' : 'Requesting camera access & starting stream...'}
                  </p>
                </div>
              ) : null}

              {/* HTML5 Video Element for Live Stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${isCameraLoading ? 'hidden' : 'block'}`}
              />

              {/* Farmer Leaf Framing Reticle / Overlay */}
              {!isCameraLoading && (
                <div className="absolute inset-8 sm:inset-12 border-2 border-dashed border-emerald-400/80 rounded-2xl pointer-events-none flex flex-col justify-between p-3">
                  <div className="flex justify-between text-emerald-400 text-[10px] font-mono">
                    <span>┌ TOP-LEFT</span>
                    <span>TOP-RIGHT ┐</span>
                  </div>
                  <div className="text-center bg-black/60 backdrop-blur-sm self-center px-3 py-1 rounded-full text-[11px] text-emerald-300 font-semibold border border-emerald-500/30">
                    🌿 {language === 'kn' ? 'ರೋಗವಿರುವ ಎಲೆಯನ್ನು ಈ ಚೌಕಟ್ಟಿನಲ್ಲಿ ಇರಿಸಿ' : language === 'hi' ? 'रोगग्रस्त पत्ती को इस फ्रेम में रखें' : 'Center infected leaf in this frame'}
                  </div>
                  <div className="flex justify-between text-emerald-400 text-[10px] font-mono">
                    <span>└ BOTTOM-LEFT</span>
                    <span>BOTTOM-RIGHT ┘</span>
                  </div>
                </div>
              )}
            </div>

            {/* Camera Error Message with Fallbacks */}
            {cameraError && (
              <div className="p-3 bg-red-950/80 border border-red-500/60 rounded-xl text-xs text-red-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-red-400" />
                  <span>{cameraError}</span>
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleOpenMobileCameraFallback}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Phone Camera</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenGallery}
                    className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-bold transition"
                  >
                    Gallery
                  </button>
                </div>
              </div>
            )}

            {/* Bottom Camera Action Bar: Large Shutter Button */}
            {!isCameraLoading && !cameraError && (
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-300 text-center sm:text-left">
                  💡 {language === 'kn' ? 'ಸ್ಪಷ್ಟ ಬೆಳಕಿನಲ್ಲಿ ಫೋಟೋ ತೆಗೆಯಿರಿ' : language === 'hi' ? 'स्पष्ट रोशनी में फोटो खींचें' : 'Ensure adequate daylight and hold leaf steady'}
                </p>

                {/* Primary Large Camera Shutter Button */}
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 hover:from-emerald-600 hover:to-green-600 text-white font-black text-sm shadow-xl shadow-emerald-500/30 transition transform active:scale-95 border-2 border-emerald-300"
                  >
                    <Camera className="w-5 h-5 animate-pulse" />
                    <span>{t('cameraCapture')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={stopCamera}
                    className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

        {/* 3. Drag and Drop Upload Area & Demo Samples (Visible when live camera is not active) */}
        {!isCameraActive && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Drag & Drop Zone and Demo Samples */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'kn' ? 'ಹಂತ 1: ಎಲೆಯ ಫೋಟೋ ಒದಗಿಸಿ' : language === 'hi' ? 'चरण 1: पत्ती की फोटो दें' : 'Step 1: Choose Leaf Photo'}</span>
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">JPG, JPEG, PNG (Max 10MB)</span>
                </div>

                {/* Drag and Drop Zone */}
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={handleOpenGallery}
                  className={`border-2 border-dashed rounded-2xl p-7 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-3 ${
                    imagePreview
                      ? 'border-emerald-400 bg-emerald-50/30'
                      : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/40'
                  }`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                    <Upload className="w-8 h-8" />
                  </div>

                  <div>
                    <p className="text-sm font-bold text-slate-800">
                      {language === 'kn' ? 'ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಲು ಇಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ' : language === 'hi' ? 'फोटो चुनने के लिए यहाँ क्लिक करें' : 'Click to browse gallery or drag and drop photo'}
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'kn' ? 'ಮೊಬೈಲ್ ಗ್ಯಾಲರಿ ಅಥವಾ ಕಂಪ್ಯೂಟರ್ ಫೈಲ್‌ಗಳು (JPG, JPEG, PNG)' : language === 'hi' ? 'मोबाइल गैलरी या फाइलें (JPG, JPEG, PNG)' : 'Mobile gallery & computer files supported'}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        startCamera('environment');
                      }}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-700 transition shadow-sm"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{t('cameraOpen')}</span>
                    </button>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenMobileCameraFallback();
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs flex items-center gap-1.5 transition"
                    >
                      <Camera className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Take Quick Photo</span>
                    </button>
                  </div>
                </div>

                {/* File Error Alert */}
                {fileError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                    <span>{fileError}</span>
                  </div>
                )}

                {/* 4 Demo Crop Sample Leaves for Instant Testing */}
                <div>
                  <span className="block text-xs font-bold text-slate-700 mb-2">
                    {language === 'kn' ? 'ಅಥವಾ ತಕ್ಷಣ ಪರೀಕ್ಷಿಸಲು ಡೆಮೊ ಬೆಳೆ ಮಾದರಿಯನ್ನು ಆಯ್ಕೆಮಾಡಿ:' : language === 'hi' ? 'या तुरंत जांचने के लिए डेमो फसल का चयन करें:' : 'Or test immediately with a demo crop leaf:'}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {MOCK_DISEASE_DATABASE.map((item, idx) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => handleSelectSample(idx)}
                        className={`p-2 rounded-xl border text-left transition flex flex-col gap-1.5 ${
                          selectedSampleIndex === idx && imagePreview === item.sampleImage
                            ? 'border-emerald-600 bg-emerald-50/90 shadow-sm ring-2 ring-emerald-500'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <img
                          src={item.sampleImage}
                          alt={item.cropName}
                          className="w-full h-14 object-cover rounded-lg"
                        />
                        <span className="text-[11px] font-bold text-slate-800 truncate block">
                          {item.cropName.split(' ')[0]}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Photography Advice Card */}
              <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                <span className="font-bold flex items-center gap-1.5 text-emerald-950">
                  <Lightbulb className="w-4 h-4 text-emerald-600" />
                  <span>{language === 'kn' ? 'ಉತ್ತಮ ನಿಖರತೆಗಾಗಿ ಸಲಹೆಗಳು:' : language === 'hi' ? 'सटीक परिणाम के लिए सुझाव:' : 'Tips for Best Disease Detection:'}</span>
                </span>
                <ul className="list-disc list-inside text-emerald-800 space-y-0.5 pl-1">
                  <li>{language === 'kn' ? 'ಸಾಕಷ್ಟು ಹಗಲು ಬೆಳಕಿನಲ್ಲಿ ನೆರಳಿಲ್ಲದೆ ಫೋಟೋ ತೆಗೆಯಿರಿ.' : language === 'hi' ? 'पर्याप्त दिन के उजाले में फोटो लें।' : 'Capture leaf in clear daylight without harsh glares.'}</li>
                  <li>{language === 'kn' ? 'ರೋಗವಿರುವ ಮಚ್ಚೆಗಳು ಕ್ಯಾಮೆರಾ ಕೇಂದ್ರದಲ್ಲಿರಲಿ.' : language === 'hi' ? 'रोग के धब्बे कैमरे के बीच में रखें।' : 'Keep infected lesions centered in the frame.'}</li>
                  <li>{language === 'kn' ? 'ಕ್ಯಾಮೆರಾ ಹಿನ್ನೆಲೆಯ ಬದಲಾಗಿ ಎಲೆಯ ಮೇಲೆ ಫೋಕಸ್ ಆಗಿರಲಿ.' : language === 'hi' ? 'कैमरा पत्ती की सतह पर केंद्रित रखें।' : 'Ensure camera focuses on leaf surface, not background soil.'}</li>
                </ul>
              </div>
            </div>

            {/* Right Column: Selected Crop Image Preview & Detect Disease Button */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-md space-y-5">
                
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'kn' ? 'ಹಂತ 2: ಫೋಟೋ ಪೂರ್ವವೀಕ್ಷಣೆ' : language === 'hi' ? 'चरण 2: फोटो पूर्वावलोकन' : 'Step 2: Photo Preview'}</span>
                  </span>
                  {imagePreview && (
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Ready to Scan
                    </span>
                  )}
                </div>

                {/* Display Selected Image Preview */}
                {imagePreview ? (
                  <div className="space-y-4">
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-slate-950 shadow-inner group border border-slate-200">
                      <img
                        src={imagePreview}
                        alt="Selected plant leaf"
                        className="w-full h-full object-cover object-center"
                      />

                      {/* Laser scanning visual animation */}
                      {isScanning && (
                        <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-400 to-transparent top-1/2 -translate-y-1/2 shadow-[0_0_20px_#10b981] animate-pulse" />
                      )}

                      {/* Photo source tag badge */}
                      <div className="absolute top-3 left-3 bg-slate-900/85 backdrop-blur-md px-2.5 py-1 rounded-xl text-white text-[11px] font-semibold flex items-center gap-1.5 border border-white/10">
                        {imageSource === 'camera' ? (
                          <>
                            <Camera className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Camera Capture</span>
                          </>
                        ) : imageSource === 'gallery' ? (
                          <>
                            <Upload className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Gallery Photo</span>
                          </>
                        ) : (
                          <>
                            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Demo Leaf Sample</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons: Retake / Upload Again / Remove */}
                    <div className="grid grid-cols-2 gap-2">
                      {imageSource === 'camera' ? (
                        <button
                          type="button"
                          onClick={handleRetakePhoto}
                          className="py-2.5 px-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <Camera className="w-4 h-4 text-emerald-600" />
                          <span>{t('cameraRetake')}</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={handleOpenGallery}
                          className="py-2.5 px-3 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-bold transition flex items-center justify-center gap-1.5"
                        >
                          <RefreshCw className="w-4 h-4 text-emerald-600" />
                          <span>Change Photo</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="py-2.5 px-3 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>{t('removePhoto')}</span>
                      </button>
                    </div>

                    {/* Detect Disease Primary Button */}
                    <Button
                      variant="primary"
                      size="lg"
                      icon={ScanLine}
                      loading={isScanning}
                      onClick={handleDetectDisease}
                      className="w-full justify-center shadow-emerald-600/30 shadow-lg text-sm font-extrabold py-3.5"
                    >
                      {isScanning 
                        ? (language === 'kn' ? 'ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ...' : language === 'hi' ? 'जांच हो रही है...' : 'Analyzing Plant Disease...') 
                        : t('detectDiseaseBtn')
                      }
                    </Button>

                    {isScanning && (
                      <div className="text-center text-xs font-semibold text-emerald-700 animate-pulse">
                        {scanStepText}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-3 border border-slate-100 rounded-2xl bg-slate-50/50">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                      <Leaf className="w-6 h-6" />
                    </div>
                    <p className="font-semibold text-slate-600">
                      {language === 'kn' ? 'ಯಾವುದೇ ಫೋಟೋ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ' : language === 'hi' ? 'कोई फोटो नहीं चुनी गई है' : 'No leaf photo selected yet.'}
                    </p>
                    <p className="text-[11px] text-slate-400 max-w-xs">
                      {language === 'kn' ? 'ಲೈವ್ ಕ್ಯಾಮೆರಾ ತೆರೆಯಿರಿ ಅಥವಾ ಗ್ಯಾಲರಿಯಿಂದ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.' : language === 'hi' ? 'लाइव कैमरा खोलें या गैलरी से फोटो अपलोड करें।' : 'Click "Open Camera" above to take a photo or upload from gallery.'}
                    </p>
                  </div>
                )}

              </div>
            </div>

          </div>
        )}

        {/* 4. Disease Detection Results Display (Name, Symptoms, Treatment, Prevention) */}
        {detectionResult && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-xl space-y-6 animate-in fade-in slide-in-from-bottom-6 duration-300">
            
            {/* Result Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
                  <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-700">
                    {language === 'kn' ? 'ರೋಗ ಪತ್ತೆ ಪೂರ್ಣಗೊಂಡಿದೆ (ಡೆಮೊ ಫಲಿತಾಂಶ)' : language === 'hi' ? 'रोग पहचान पूर्ण (डेमो परिणाम)' : 'Disease Diagnosis Complete (Demo Result)'}
                  </span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {detectionResult.diseaseName}
                </h2>

                <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                  {language === 'kn' ? 'ಬೆಳೆ:' : language === 'hi' ? 'फसल:' : 'Affected Crop:'} <strong className="text-slate-800">{detectionResult.cropName}</strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-amber-100 text-amber-900 text-xs font-extrabold border border-amber-300">
                  {detectionResult.severity}
                </span>

                <button
                  type="button"
                  onClick={() => alert(`Report for ${detectionResult.diseaseName} on ${detectionResult.cropName} saved!`)}
                  className="p-2 text-slate-600 hover:text-emerald-700 rounded-xl border border-slate-200 hover:bg-slate-50 transition"
                  title="Share Report"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* A. Disease Description */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span>{language === 'kn' ? 'ರೋಗದ ವಿವರಣೆ' : language === 'hi' ? 'रोग का विवरण' : 'Disease Description'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-2xl border border-slate-200 leading-relaxed">
                {detectionResult.description}
              </p>
            </div>

            {/* B. Observed Symptoms */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>{language === 'kn' ? 'ರೋಗದ ಲಕ್ಷಣಗಳು' : language === 'hi' ? 'रोग के लक्षण' : 'Observed Symptoms'}</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {detectionResult.symptoms.map((symp, i) => (
                  <div
                    key={i}
                    className="p-3 bg-amber-50/60 rounded-xl border border-amber-200 text-xs text-amber-950 flex items-start gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <span>{symp}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* C. Suggested Treatments (Organic vs Chemical) */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-emerald-600" />
                <span>{language === 'kn' ? 'ಶಿಫಾರಸು ಮಾಡಿದ ಚಿಕಿತ್ಸೆ ಮತ್ತು ಔಷಧ ಸಿಂಪಡಣೆ' : language === 'hi' ? 'अनुशंसित उपचार व छिड़काव' : 'Suggested Treatment & Dosage'}</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Organic Treatment */}
                <div className="p-4 bg-green-50 rounded-2xl border border-green-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-green-900 text-xs">
                    <Sparkles className="w-4 h-4 text-green-600" />
                    <span>{language === 'kn' ? 'ನೈಸರ್ಗಿಕ / ಜೈವಿಕ ಚಿಕಿತ್ಸೆ' : language === 'hi' ? 'जैविक उपचार' : 'Organic / Bio-Fungicide Treatment'}</span>
                  </div>
                  <p className="text-xs text-green-800 leading-relaxed">
                    {detectionResult.treatment.organic}
                  </p>
                </div>

                {/* Chemical Treatment */}
                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-200 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-blue-900 text-xs">
                    <ShieldAlert className="w-4 h-4 text-blue-600" />
                    <span>{language === 'kn' ? 'ರಾಸಾಯನಿಕ ಸಿಂಪಡಣೆ / ನಿಖರ ಪ್ರಮಾಣ' : language === 'hi' ? 'रासायनिक उपचार / सही मात्रा' : 'Chemical / Recommended Dosage'}</span>
                  </div>
                  <p className="text-xs text-blue-800 leading-relaxed">
                    {detectionResult.treatment.chemical}
                  </p>
                </div>
              </div>
            </div>

            {/* D. Prevention Tips */}
            <div className="space-y-2">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{language === 'kn' ? 'ಮುಂದಿನ ಋತುವಿನ ತಡೆಗಟ್ಟುವಿಕೆ ಕ್ರಮಗಳು' : language === 'hi' ? 'अगले सीजन के लिए बचाव के उपाय' : 'Prevention Tips for Next Season'}</span>
              </h3>
              <ul className="space-y-1.5 text-xs text-slate-700 bg-emerald-50/40 p-4 rounded-2xl border border-emerald-200">
                {detectionResult.preventionTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <span className="text-[11px] text-slate-400">
                ICAR Reference Agricultural Dataset • Ready for live vision AI integration
              </span>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  icon={RefreshCw}
                >
                  {language === 'kn' ? 'ಮತ್ತೊಂದು ಎಲೆ ಪರೀಕ್ಷಿಸಿ' : language === 'hi' ? 'दूसरी पत्ती जांचें' : 'Test Another Crop'}
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleNavDashboard}
                >
                  {language === 'kn' ? 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್‌ಗೆ ಹಿಂತಿರುಗಿ' : language === 'hi' ? 'डैशबोर्ड पर जाएं' : 'Return to Dashboard'}
                </Button>
              </div>
            </div>

          </div>
        )}

        {/* Educational Mock Simulation Notice */}
        <div className="p-4 bg-amber-50/90 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-950 shadow-sm">
          <Info className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <strong className="block text-amber-900 font-bold uppercase tracking-wide">
              Educational Simulation Notice:
            </strong>
            <p className="text-amber-800 leading-relaxed">
              This frontend tool demonstrates agricultural crop disease identification using curated reference datasets and mock diagnosis results. It does not replace on-field laboratory diagnosis. For critical crop decisions, please consult your local Krishi Vigyan Kendra (KVK) or agriculture extension officer.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
