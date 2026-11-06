/**
 * AI Crop Disease Detection Service Adapter for KrishiMitra (ಕೃಷಿಮಿತ್ರ)
 * 
 * Powered by Google Gemini Multimodal AI & Verified ICAR/SAU Agronomic Pathology.
 * 
 * Features:
 * 1. Direct integration with Google Gemini Vision via @google/genai SDK.
 * 2. Complete multi-crop taxonomy covering 50+ crops across 8 categories (Cereals, Pulses, Cash, Oilseeds, Vegetables, Fruits, Plantation, Other).
 * 3. Authoritative local disease knowledge base for instant cross-referencing with verified extension guides.
 * 4. Transparent AI status: Gemini Connected, Gemini Disconnected, Analyzing, API Error.
 * 5. NO MORE MODEL_NOT_READY: Eliminates obsolete PlantVillage keras warnings.
 */

import {
  ALL_SUPPORTED_CROPS,
  CROP_CATEGORIES,
  findCropMetadata
} from './plantTaxonomy.js';
import {
  COMPREHENSIVE_DISEASE_LIBRARY,
  lookupDiseaseRecord,
  filterDiseaseLibrary
} from './plantDiseaseKnowledge.js';
import {
  analyzePlantDiseaseWithGemini,
  getActiveGeminiApiKey,
  getGeminiKeyStatus,
  saveUserGeminiApiKey,
  removeUserGeminiApiKey,
  testGeminiConnection,
  compressAndPrepareImage
} from './geminiDiseaseService.js';

export {
  ALL_SUPPORTED_CROPS,
  CROP_CATEGORIES,
  COMPREHENSIVE_DISEASE_LIBRARY,
  findCropMetadata,
  lookupDiseaseRecord,
  filterDiseaseLibrary,
  analyzePlantDiseaseWithGemini,
  getActiveGeminiApiKey,
  getGeminiKeyStatus,
  saveUserGeminiApiKey,
  removeUserGeminiApiKey,
  testGeminiConnection,
  compressAndPrepareImage
};

// Backwards compatibility alias for components expecting SUPPORTED_CROPS
export const SUPPORTED_CROPS = ALL_SUPPORTED_CROPS;
export const AGRONOMIC_DISEASE_KNOWLEDGE = COMPREHENSIVE_DISEASE_LIBRARY;

/**
 * Check AI Vision service health (Gemini API readiness)
 */
export async function checkAIServiceHealth() {
  const status = getGeminiKeyStatus();
  return {
    isOnline: status.configured,
    status: status.configured ? 'ready' : 'key_required',
    source: status.source,
    maskedKey: status.maskedKey,
    engine: 'Google Gemini Multimodal Vision (@google/genai)',
    message: status.configured
      ? 'Google Gemini AI vision engine is configured and ready.'
      : 'Gemini API Key is not configured. Configure your API key to enable live AI leaf detection.'
  };
}

/**
 * Primary Disease Detection API - calls Google Gemini with automatic fallback to local knowledge correlation
 */
export async function detectCropDiseaseWithAI({
  image,
  cropType = 'auto',
  farmLocation = 'Raichur Farm - Plot 1',
  language = 'en'
}) {
  return await analyzePlantDiseaseWithGemini({
    image,
    cropHint: cropType,
    language,
    farmLocation
  });
}

/**
 * Get verified agronomic disease references for manual exploration
 */
export function getAgronomicGuidesForCrop(cropIdOrName) {
  if (!cropIdOrName || cropIdOrName === 'all') {
    return Object.values(COMPREHENSIVE_DISEASE_LIBRARY);
  }
  return filterDiseaseLibrary({ cropId: cropIdOrName });
}

export function getAllAgronomicGuides() {
  return Object.values(COMPREHENSIVE_DISEASE_LIBRARY);
}
