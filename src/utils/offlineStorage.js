// Offline Agricultural Storage & Caching Utilities
// Enables farmers to access essential crop data, farming tips, and disease remedies without internet

const STORAGE_KEY_SAVED_CROPS = 'krishimitra_offline_saved_crops';
const STORAGE_KEY_SAVED_TIPS = 'krishimitra_offline_saved_tips';
const STORAGE_KEY_SAVED_DISEASES = 'krishimitra_offline_saved_diseases';

// Default essential offline crop reference dataset
const DEFAULT_OFFLINE_CROPS = [
  {
    id: 'crop-wheat',
    name: 'Wheat (HD-3086 / Gehun / ಗೋಧಿ)',
    category: 'Cereal / Rabi Grain',
    season: 'Rabi (Oct - Nov sowing, Mar - Apr harvest)',
    soil: 'Well-drained Alluvial or Clay Loam Soil (pH 6.0 - 7.5)',
    water: 'Medium (4–5 irrigations: CRI stage at 21–25 DAS is critical)',
    duration: '120 - 135 Days',
    projectedYield: '20 - 24 Quintals / Acre',
    tips: [
      'Apply first irrigation strictly between 21-25 days after sowing (Crown Root Initiation stage).',
      'Top-dress 50% Nitrogen (Urea) with first irrigation; split remaining dose at tillering stage.',
      'Maintain spray vigilance for yellow rust if cold foggy morning humidity persists.'
    ],
    savedAt: 'Available Offline'
  },
  {
    id: 'crop-chana',
    name: 'Chickpea / Gram (JG-14 / Chana / ಕಡಲೆ)',
    category: 'Pulse / Legume',
    season: 'Rabi (Oct - Nov sowing, Feb - Mar harvest)',
    soil: 'Black Cotton Soil, Loamy Soil (pH 6.5 - 8.0)',
    water: 'Low (1–2 light irrigations: pre-flowering and pod development)',
    duration: '105 - 115 Days',
    projectedYield: '8 - 11 Quintals / Acre',
    tips: [
      'Never irrigate during peak flowering stage to avoid dropping blossoms.',
      'Treat seeds with Rhizobium culture and Trichoderma (5g/kg) before sowing.',
      'Install bird perches (40-50 per hectare) for natural predatory control of Helicoverpa pod borers.'
    ],
    savedAt: 'Available Offline'
  },
  {
    id: 'crop-rice',
    name: 'Paddy / Basmati Rice (Pusa 1121 / ಭತ್ತ)',
    category: 'Cereal / Kharif Grain',
    season: 'Kharif (June - July transplanting, Oct - Nov harvest)',
    soil: 'Heavy Clay or Silty Clay Soil with good water retention (pH 5.5 - 7.0)',
    water: 'High (Maintain 2-3 cm shallow standing water during tillering)',
    duration: '135 - 145 Days',
    projectedYield: '22 - 28 Quintals / Acre',
    tips: [
      'Practice Alternate Wetting and Drying (AWD) to save 25% water and curb root rot.',
      'Balance Potash with Nitrogen; avoid heavy single applications of Urea.',
      'Monitor flag leaves early morning for bacterial blight or leaf folder infestation.'
    ],
    savedAt: 'Available Offline'
  },
  {
    id: 'crop-mustard',
    name: 'Mustard (Pusa Bold / Sarson / ಸಾಸಿವೆ)',
    category: 'Oilseed',
    season: 'Rabi (Oct sowing, Feb harvest)',
    soil: 'Sandy Loam to Heavy Clay Soil (pH 6.0 - 7.5)',
    water: 'Low to Medium (2 light irrigations at 30 DAS and 60 DAS)',
    duration: '110 - 125 Days',
    projectedYield: '7 - 10 Quintals / Acre',
    tips: [
      'Apply 20 kg Elemental Sulfur per acre to elevate seed oil percentage by 2.5-3%.',
      'Spray neem seed kernel extract (5%) early morning if aphid populations begin building on terminal shoots.'
    ],
    savedAt: 'Available Offline'
  }
];

// Default essential offline farming tips dataset
const DEFAULT_OFFLINE_TIPS = [
  {
    id: 'tip-spray-window',
    title: 'Suitable Time for Spraying Crops (ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ)',
    category: 'Spray Advisory',
    description: 'Spray between 7:00 AM - 11:00 AM or 3:30 PM - 5:30 PM. Only spray when wind speed is below 15 km/h and rain probability is under 20% in the next 6 hours.',
    urgency: 'Daily Best Practice'
  },
  {
    id: 'tip-irrigation-timing',
    title: 'Best Time for Irrigation (ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ)',
    category: 'Water Conservation',
    description: 'Hold flood irrigation 48 hours prior to expected rain. Evening drip watering reduces evaporation by up to 35% compared to midday overhead flooding.',
    urgency: 'Resource Saver'
  },
  {
    id: 'tip-rain-warning',
    title: 'Rain & Storm Waterlogging Precaution (ಮಳೆ ಎಚ್ಚರಿಕೆ)',
    category: 'Weather Preparedness',
    description: 'Ensure farm peripheral drainage channels are clear of weeds before rainstorms. Standing water over 24 hours suffocates crop roots and sparks collar rot.',
    urgency: 'Critical Safety'
  },
  {
    id: 'tip-weather-precaution',
    title: 'Fungal Mildew & Rust Prevention (ಹವಾಮಾನ ಮುನ್ನೆಚ್ಚರಿಕೆ)',
    category: 'Disease Prevention',
    description: 'Persistent cool morning fogs with high relative humidity (>85%) foster yellow rust and powdery mildew. Inspect lower leaf undersides twice weekly.',
    urgency: 'Preventive Care'
  }
];

// Default offline disease remedies
const DEFAULT_OFFLINE_DISEASES = [
  {
    id: 'disease-early-blight',
    crop: 'Tomato & Solanaceous Crops',
    disease: 'Early Blight (Alternaria solani)',
    symptoms: 'Target-like concentric dark brown rings surrounded by yellow halos on older lower leaves.',
    organicRemedy: 'Spray Trichoderma viride @ 5g/L with 10% fermented sour buttermilk (chaach).',
    chemicalRemedy: 'Foliar spray of Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin 23% SC @ 1 ml/L.'
  },
  {
    id: 'disease-yellow-rust',
    crop: 'Wheat (Gehun / ಗೋಧಿ)',
    disease: 'Yellow / Stripe Rust (Puccinia striiformis)',
    symptoms: 'Powdery yellow-orange pustules arranged in linear stripes along the leaf blade.',
    organicRemedy: 'Early foliar spray of fermented cow urine (10%) + 5% neem seed oil.',
    chemicalRemedy: 'Spray Propiconazole 25% EC (Tilt) @ 1 ml/L of water within 48 hours of detection.'
  },
  {
    id: 'disease-bacterial-blight',
    crop: 'Paddy / Rice (Dhan / ಭತ್ತ)',
    disease: 'Bacterial Leaf Blight (Xanthomonas oryzae)',
    symptoms: 'Wavy yellowish-green lesions from leaf tips with bacterial ooze beads on damp mornings.',
    organicRemedy: 'Spray fresh filtered cow dung supernatant (20%) + Pseudomonas fluorescens @ 5g/L.',
    chemicalRemedy: 'Spray Streptocycline @ 6g + Copper Oxychloride 50% WP @ 500g in 200L water per acre.'
  }
];

/**
 * Initialize offline cache with default data if empty
 */
export function initializeOfflineStorage() {
  try {
    if (!localStorage.getItem(STORAGE_KEY_SAVED_CROPS)) {
      localStorage.setItem(STORAGE_KEY_SAVED_CROPS, JSON.stringify(DEFAULT_OFFLINE_CROPS));
    }
    if (!localStorage.getItem(STORAGE_KEY_SAVED_TIPS)) {
      localStorage.setItem(STORAGE_KEY_SAVED_TIPS, JSON.stringify(DEFAULT_OFFLINE_TIPS));
    }
    if (!localStorage.getItem(STORAGE_KEY_SAVED_DISEASES)) {
      localStorage.setItem(STORAGE_KEY_SAVED_DISEASES, JSON.stringify(DEFAULT_OFFLINE_DISEASES));
    }
  } catch (e) {
    console.error('LocalStorage unavailable for offline initialization', e);
  }
}

/**
 * Get all saved crops from offline storage
 */
export function getOfflineSavedCrops() {
  try {
    initializeOfflineStorage();
    const stored = localStorage.getItem(STORAGE_KEY_SAVED_CROPS);
    return stored ? JSON.parse(stored) : DEFAULT_OFFLINE_CROPS;
  } catch (e) {
    return DEFAULT_OFFLINE_CROPS;
  }
}

/**
 * Save or bookmark a crop for offline access
 */
export function saveCropOffline(crop) {
  try {
    const crops = getOfflineSavedCrops();
    const existingIndex = crops.findIndex((c) => c.id === crop.id || c.name === crop.name);
    
    const enrichedCrop = {
      ...crop,
      id: crop.id || `crop-${Date.now()}`,
      savedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
    };

    let updated;
    if (existingIndex >= 0) {
      updated = [...crops];
      updated[existingIndex] = enrichedCrop;
    } else {
      updated = [enrichedCrop, ...crops];
    }

    localStorage.setItem(STORAGE_KEY_SAVED_CROPS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.error('Failed to save crop offline', e);
    return getOfflineSavedCrops();
  }
}

/**
 * Remove a saved crop from offline storage
 */
export function removeSavedCropOffline(cropId) {
  try {
    const crops = getOfflineSavedCrops();
    const updated = crops.filter((c) => c.id !== cropId);
    localStorage.setItem(STORAGE_KEY_SAVED_CROPS, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getOfflineSavedCrops();
  }
}

/**
 * Get all saved farming tips from offline storage
 */
export function getOfflineSavedTips() {
  try {
    initializeOfflineStorage();
    const stored = localStorage.getItem(STORAGE_KEY_SAVED_TIPS);
    return stored ? JSON.parse(stored) : DEFAULT_OFFLINE_TIPS;
  } catch (e) {
    return DEFAULT_OFFLINE_TIPS;
  }
}

/**
 * Get all saved disease remedies from offline storage
 */
export function getOfflineSavedDiseases() {
  try {
    initializeOfflineStorage();
    const stored = localStorage.getItem(STORAGE_KEY_SAVED_DISEASES);
    return stored ? JSON.parse(stored) : DEFAULT_OFFLINE_DISEASES;
  } catch (e) {
    return DEFAULT_OFFLINE_DISEASES;
  }
}

/**
 * Save disease detection result offline for quick reference
 */
export function saveDiseaseOffline(diseaseResult) {
  try {
    const diseases = getOfflineSavedDiseases();
    const newEntry = {
      id: diseaseResult.id || `disease-${Date.now()}`,
      crop: diseaseResult.cropName,
      disease: diseaseResult.diseaseName,
      symptoms: Array.isArray(diseaseResult.symptoms) ? diseaseResult.symptoms.join(' • ') : diseaseResult.symptoms,
      organicRemedy: diseaseResult.treatment?.organic || '',
      chemicalRemedy: diseaseResult.treatment?.chemical || ''
    };

    const updated = [newEntry, ...diseases.filter((d) => d.disease !== newEntry.disease)];
    localStorage.setItem(STORAGE_KEY_SAVED_DISEASES, JSON.stringify(updated));
    return updated;
  } catch (e) {
    return getOfflineSavedDiseases();
  }
}

