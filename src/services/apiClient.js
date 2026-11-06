// KrishiMitra Unified API Client
// Connects the React Frontend with the AgriSmart AI & Member 3 FastAPI Backend (http://localhost:8000)
// Gracefully falls back to local IndexedDB & offline agronomy algorithms if the backend server is offline.

const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';

/**
 * Check if the unified FastAPI backend server is reachable and healthy
 */
export async function checkBackendHealth() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const res = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      return {
        online: true,
        service: data.service || 'AgriSmart AI Unified Backend',
        database: data.database || 'active'
      };
    }
  } catch (err) {
    // Backend is offline or not running
  }
  return {
    online: false,
    service: 'Client Offline / Local IndexedDB Engine',
    database: 'Local IndexedDB'
  };
}

/**
 * 1. AI Chatbot API - Multilingual Google Gemini Backend
 * Endpoint: POST /ai/chatbot
 */
export async function callChatbotAPI(question, language = 'kannada', conversationHistory = []) {
  const langMap = {
    kn: 'kannada',
    en: 'english',
    hi: 'hindi'
  };
  const targetLanguage = langMap[language] || language;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(`${API_BASE_URL}/ai/chatbot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question,
        language: targetLanguage,
        conversation_history: conversationHistory
      }),
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          source: 'backend-ai',
          reply: json.data.reply || json.data.answer || '',
          language: json.data.language
        };
      }
    }
  } catch (err) {
    console.warn('Backend chatbot unreachable, falling back to local expert dictionary:', err);
  }

  return null; // Signals caller to use local fallback
}

/**
 * 2. Plant Disease Detection API
 * Endpoint: POST /ai/disease-detection
 */
export async function callDiseaseDetectionAPI(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const res = await fetch(`${API_BASE_URL}/ai/disease-detection`, {
      method: 'POST',
      body: formData,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          source: 'backend-ai',
          data: json.data
        };
      }
    }
  } catch (err) {
    console.warn('Backend disease detection unreachable, falling back to local analyzer:', err);
  }

  return null;
}

/**
 * 3. Crop Yield Prediction API
 * Endpoint: POST /ai/yield-prediction
 */
export async function callYieldPredictionAPI(yieldPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/ai/yield-prediction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(yieldPayload)
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend yield prediction unreachable:', err);
  }
  return null;
}

/**
 * 4. Live Agricultural Weather API
 * Endpoint: GET /api/weather/current
 */
export async function callLiveWeatherAPI(latitude = 12.2958, longitude = 76.6394) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/weather/current?latitude=${latitude}&longitude=${longitude}`);
    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return {
          success: true,
          source: 'backend-weather',
          data: json.data
        };
      }
    }
  } catch (err) {
    console.warn('Backend weather API unreachable:', err);
  }
  return null;
}

/**
 * 5. Soil Health Analysis API
 * Endpoint: POST /api/soil/analyze
 */
export async function callSoilAnalysisAPI(soilData) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/soil/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(soilData)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('Backend soil API unreachable:', err);
  }
  return null;
}

/**
 * 6. Crop Suitability Recommendations API
 * Endpoint: POST /api/crops/recommend
 */
export async function callCropRecommendationAPI(cropParams) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/crops/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cropParams)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('Backend crop recommendation API unreachable:', err);
  }
  return null;
}

/**
 * 7. Smart Irrigation Recommendation API
 * Endpoint: POST /api/irrigation/recommend
 */
export async function callSmartIrrigationAPI(irrigationParams) {
  try {
    const res = await fetch(`${API_BASE_URL}/api/irrigation/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(irrigationParams)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || json;
    }
  } catch (err) {
    console.warn('Backend irrigation API unreachable:', err);
  }
  return null;
}
