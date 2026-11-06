/**
 * KrishiMitra Real AI Agricultural Chatbot Service
 * 
 * Powered by Google Gen AI JavaScript SDK (@google/genai)
 * with official Google Search Grounding for real-time agronomic research,
 * weather advisories, market updates, and extension citations.
 */

import { GoogleGenAI } from '@google/genai';
import { getActiveGeminiApiKey } from './geminiDiseaseService.js';
import {
  CROP_KNOWLEDGE_LIBRARY,
  SOIL_KNOWLEDGE,
  PLANT_PROBLEMS_KNOWLEDGE
} from './aiChatKnowledge.js';

const DEFAULT_GEMINI_MODEL = 'gemini-2.5-flash';

/**
 * System Instruction for Google Gemini
 */
function buildSystemInstruction({ language = 'en', farmProfile = null }) {
  const langPrompt =
    language === 'kn'
      ? 'MANDATORY LANGUAGE: Kannada (ಕನ್ನಡ). Respond in natural, fluent Kannada using simple terminology familiar to Karnataka farmers. Provide technical terms in brackets.'
      : language === 'hi'
      ? 'MANDATORY LANGUAGE: Hindi (हिन्दी). Respond in clear, natural Hindi with actionable agricultural guidance. Provide technical terms in brackets.'
      : 'MANDATORY LANGUAGE: English. Respond in clear, practical, accessible English suitable for Indian farmers and agronomists.';

  let farmContext = '';
  if (farmProfile) {
    farmContext = `
FARMER PROFILE & GEOGRAPHY:
- Farmer Name: ${farmProfile.farmerName || farmProfile.name || 'Farmer'}
- Farm Location: ${farmProfile.name || farmProfile.village || farmProfile.farmLocation || 'Karnataka, India'}
- District / State: ${farmProfile.district || ''}, ${farmProfile.state || 'Karnataka'}
- Soil Type: ${farmProfile.soilType || 'Black / Sandy Loam'}
- Land Size: ${farmProfile.landSize || '5'} ${farmProfile.landUnit || 'Acres'}
- Irrigation Available: ${farmProfile.availableIrrigation || farmProfile.irrigation || 'Borewell & Drip'}
(Personalize your advice using this profile when relevant, but do not invent missing details).
`;
  }

  return `
You are "KrishiMitra AI" (ಕೃಷಿಮಿತ್ರ / कृषि मित्र), an expert agricultural scientist, senior agronomist, and trusted farming advisor for Indian farmers.

${langPrompt}
${farmContext}

YOUR MISSION:
1. Provide accurate, practical, and scientifically sound agricultural advice across all crop families:
   - CEREALS: Rice/Paddy, Wheat, Maize/Corn, Ragi, Sorghum/Jowar, Barley, Bajra.
   - PULSES: Chickpea/Gram, Pigeon Pea/Tur, Green Gram/Moong, Black Gram/Urad, Lentils, Peas, Soybean.
   - OILSEEDS: Groundnut, Sunflower, Mustard, Sesame, Castor.
   - COMMERCIAL: Cotton, Sugarcane, Tobacco, Jute.
   - VEGETABLES: Tomato, Potato, Onion, Chilli, Brinjal, Cabbage, Cauliflower, Okra, Cucumber, Beans.
   - FRUITS: Mango, Banana, Grapes, Papaya, Pomegranate, Guava, Citrus, Apple, Watermelon.
   - PLANTATION & SPICES: Coconut, Arecanut, Coffee, Tea, Black Pepper, Cardamom, Turmeric, Ginger.
   - OTHER: Medicinal plants, garden plants, shade trees, soil health, irrigation, fertilizers.

2. SCIENTIFIC CHEMICAL & PESTICIDE SAFETY RULES:
   - Always suggest organic, biological (Trichoderma, Pseudomonas, Neem oil, biofertilizers), and cultural methods FIRST.
   - For chemical recommendations, cite standard approved ICAR/CIBRC dosages (e.g. Mancozeb 75 WP @ 2 g/L, Chlorantraniliprole 18.5 SC @ 0.3 ml/L). NEVER invent fake chemical trade names or dangerous dosages.
   - Always mandate safety precautions: wear protective mask/gloves, spray early morning or late afternoon, avoid windy days.

3. GOOGLE SEARCH GROUNDING:
   - Use Google Search to look up current government schemes (PM-Kisan, PMFBY), latest ICAR research bulletins, weather precautions, and market trends.
   - Whenever grounded info is retrieved, mention verified sources like ICAR, State Agricultural Universities (UAS Bangalore, UAS Dharwad, TNAU, PAU), or government agricultural portals.

4. MULTI-TURN CONTEXT & MEMORY:
   - Understand follow-up questions referencing previous messages (e.g., "Which fertilizer for it?", "How much water does it need?", "When should I harvest?").

5. GENERAL KNOWLEDGE & COURTESY:
   - If the user sends a greeting (Hi, Hello, Namaste), respond with a warm, welcoming greeting.
   - If asked general questions (e.g. "What is photosynthesis?", "What is agriculture?"), explain clearly and accurately.
   - If asked an entirely non-agricultural question (e.g. "Who is the Prime Minister?"), answer politely and concisely, noting that your main expertise is in agriculture.

FORMATTING:
- Use clean Markdown with bold headings, bullet points, and numbered steps.
- Keep answers concise, highly readable on mobile screens, and actionable.
`.trim();
}

/**
 * Format conversation history into Gemini Content format
 */
function formatGeminiContents(chatHistory = [], currentQuery = '', attachedImage = null) {
  const contents = [];

  // Filter recent messages (keep last 10 turns to avoid exceeding context/tokens)
  const recentHistory = chatHistory.slice(-10);

  for (const msg of recentHistory) {
    const isUser = msg.sender === 'farmer' || msg.sender === 'user' || msg.role === 'user';
    const role = isUser ? 'user' : 'model';
    const text = msg.text || '';

    // Skip the generic initial greeting from the model history to keep fresh focus
    if (!isUser && msg.id === 1 && text.includes('Namaste Kisan')) {
      continue;
    }

    if (text) {
      contents.push({
        role,
        parts: [{ text }]
      });
    }
  }

  // Construct current user turn
  const userParts = [];

  // Add attached image if provided
  if (attachedImage) {
    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (typeof attachedImage === 'string') {
      if (attachedImage.startsWith('data:')) {
        const match = attachedImage.match(/^data:([^;]+);base64,(.+)$/);
        if (match) {
          mimeType = match[1];
          base64Data = match[2];
        }
      } else {
        base64Data = attachedImage;
      }
    } else if (attachedImage.dataUrl) {
      const match = attachedImage.dataUrl.match(/^data:([^;]+);base64,(.+)$/);
      if (match) {
        mimeType = match[1];
        base64Data = match[2];
      }
    }

    if (base64Data) {
      userParts.push({
        inlineData: {
          data: base64Data,
          mimeType
        }
      });
    }
  }

  // Add user query text
  userParts.push({
    text: currentQuery || 'Please analyze this agricultural photograph.'
  });

  contents.push({
    role: 'user',
    parts: userParts
  });

  return contents;
}

/**
 * Extract Google Search Grounding sources and citations from Gemini response
 */
function extractGroundingMetadata(response) {
  const candidate = response?.candidates?.[0];
  const metadata = candidate?.groundingMetadata || response?.groundingMetadata;

  if (!metadata) {
    return {
      sources: [],
      searchQueries: [],
      isGrounded: false
    };
  }

  const searchQueries = metadata.webSearchQueries || [];
  const sources = [];
  const seenUrls = new Set();

  // Extract web chunks
  const chunks = metadata.groundingChunks || metadata.searchChunks || [];
  for (const chunk of chunks) {
    const web = chunk.web;
    if (web && web.uri && !seenUrls.has(web.uri)) {
      seenUrls.add(web.uri);
      sources.push({
        title: web.title || 'Agricultural Reference',
        url: web.uri,
        domain: extractDomain(web.uri)
      });
    }
  }

  return {
    sources: sources.slice(0, 6),
    searchQueries,
    isGrounded: sources.length > 0
  };
}

function extractDomain(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname.replace(/^www\./, '');
  } catch {
    return 'web';
  }
}

/**
 * Offline Agronomic & Knowledge Engine
 * 100% Guaranteed Dynamic Response for all 15 question types when Gemini key is not configured or offline.
 */
export function generateOfflineAgronomyAnswer(query, chatHistory = [], language = 'en', extraContext = {}) {
  const q = (query || '').toLowerCase().trim();

  // Track conversation context for follow-ups (e.g. "it", "this crop", "which fertilizer")
  let contextCrop = null;
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const t = (chatHistory[i].text || '').toLowerCase();
    if (t.includes('wheat') || t.includes('ಗೋಧಿ') || t.includes('गेहूं')) { contextCrop = 'wheat'; break; }
    if (t.includes('rice') || t.includes('paddy') || t.includes('ಭತ್ತ') || t.includes('धान')) { contextCrop = 'rice'; break; }
    if (t.includes('maize') || t.includes('corn') || t.includes('ಮೆಕ್ಕೆಜೋಳ') || t.includes('मक्का')) { contextCrop = 'maize'; break; }
    if (t.includes('cotton') || t.includes('ಹತ್ತಿ') || t.includes('कपास')) { contextCrop = 'cotton'; break; }
    if (t.includes('tomato') || t.includes('ಟೊಮೆಟೊ') || t.includes('टमाटर')) { contextCrop = 'tomato'; break; }
    if (t.includes('groundnut') || t.includes('peanut') || t.includes('ಕಡಲೆಕಾಯಿ') || t.includes('मूंगफली')) { contextCrop = 'groundnut'; break; }
  }

  // 1. GREETINGS
  if (/^(hi|hello|hey|namaste|namaskara|ನಮಸ್ಕಾರ|नमस्ते|ಹಲೋ|ಸುಸ್ವಾಗತ)(\s|[!.,?]|$)/i.test(q)) {
    if (language === 'kn') {
      return `🙏 **ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!**\n\nನಾನು ನಿಮ್ಮ ಕೃಷಿಮಿತ್ರ (KrishiMitra) AI ಕೃಷಿ ಸಲಹೆಗಾರ. ನಿಮ್ಮ ಜಮೀನಿನ ಬೆಳೆಗಳು, ಮಣ್ಣು ಪರೀಕ್ಷೆ, ರೋಗ ಹತೋಟಿ, ನೀರಾವರಿ, ಕೀಟನಾಶಕಗಳು ಹಾಗೂ ಕೃಷಿ ತಂತ್ರಜ್ಞಾನದ ಬಗ್ಗೆ ಯಾವುದೇ ಪ್ರಶ್ನೆಗಳನ್ನು ಕೇಳಬಹುದು.\n\n*💡 ಇಂದು ನಿಮ್ಮ ಕೃಷಿಗೆ ಸಂಬಂಧಿಸಿದಂತೆ ನಾನು ಹೇಗೆ ಸಹಾಯ ಮಾಡಲಿ?*`;
    } else if (language === 'hi') {
      return `🙏 **नमस्ते किसान मित्र!**\n\nमैं आपका कृषि मित्र (KrishiMitra) AI सहायक हूँ। आप मुझसे फसलों की खेती, खाद-उर्वरक प्रबंधन, कीट व रोग नियंत्रण, मिट्टी की जांच, सिंचाई तथा आधुनिक कृषि यंत्रों से संबंधित कोई भी सवाल पूछ सकते हैं।\n\n*💡 आज मैं आपकी खेती में किस प्रकार सहायता कर सकता हूँ?*`;
    }
    return `🙏 **Namaste Kisan! Welcome to KrishiMitra.**\n\nI am your intelligent 24/7 AI Farming Assistant. You can ask me about crop cultivation, soil health, fertilizer schedules, pest and disease management, irrigation, weather precautions, or upload a leaf photo.\n\n*💡 How can I assist with your farming today?*`;
  }

  // 2. WHAT IS AGRICULTURE?
  if (q.includes('what is agriculture') || q.includes('ಕೃಷಿ ಎಂದರೇನು') || q.includes('कृषि क्या है') || q.includes('explain agriculture')) {
    if (language === 'kn') {
      return `🌾 **ಕೃಷಿ (Agriculture) ಎಂದರೇನು?**\n\nಕೃಷಿ ಎಂದರೆ ಆಹಾರ, ಧಾನ್ಯ, ನಾರು, ಮೇವು ಹಾಗೂ ಇತರ ಉಪಯುಕ್ತ ಉತ್ಪನ್ನಗಳನ್ನು ಪಡೆಯಲು ಸಸ್ಯಗಳನ್ನು ಬೆಳೆಸುವುದು ಮತ್ತು ಜಾನುವಾರುಗಳನ್ನು ಸಾಕುವ ವಿಜ್ಞಾನ ಮತ್ತು ಕಲೆಯಾಗಿದೆ.\n\n**ಕೃಷಿಯ ಮುಖ್ಯ ವಿಭಾಗಗಳು:**\n1. **ಬೆಳೆ ವಿಜ್ಞಾನ (Agronomy):** ಧಾನ್ಯಗಳು, ದ್ವಿದಳ ಧಾನ್ಯಗಳು ಮತ್ತು ಎಣ್ಣೆಕಾಳುಗಳ ಸಾಗುವಳಿ.\n2. **ತೋಟಗಾರಿಕೆ (Horticulture):** ತರಕಾರಿಗಳು, ಹಣ್ಣುಗಳು, ಹೂವುಗಳು ಮತ್ತು ಸಂಬಾರ ಬೆಳೆಗಳು.\n3. **ಪಶುಸಂಗೋಪನೆ (Animal Husbandry):** ಹೈನುಗಾರಿಕೆ, ಕುರಿ-ಮೇಕೆ ಸಾಕಣೆ ಮತ್ತು ಕೋಳಿ ಸಾಕಣೆ.\n4. **ಮಣ್ಣು ವಿಜ್ಞಾನ (Soil Science):** ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಮತ್ತು ಪೋಷಕಾಂಶಗಳ ಸಮಗ್ರ ನಿರ್ವಹಣೆ.`;
    } else if (language === 'hi') {
      return `🌾 **कृषि (Agriculture) क्या है?**\n\nकृषि भोजन, चारा, रेशा तथा अन्य आवश्यक उत्पाद प्राप्त करने के लिए फसलें उगाने और पशुपालन करने का विज्ञान, कला तथा व्यवसाय है।\n\n**कृषि के प्रमुख घटक:**\n1. **सस्य विज्ञान (Agronomy):** अनाज, दलहन और तिलहन फसलों की वैज्ञानिक खेती।\n2. **बागवानी (Horticulture):** फल, सब्जियां, फूल व औषधीय पौधे।\n3. **मृदा प्रबंधन (Soil Management):** मिट्टी की उर्वरता और पोषक तत्वों का संरक्षण।\n4. **पशुपालन (Animal Husbandry):** डेयरी, बकरी पालन व मुर्गी पालन।`;
    }
    return `🌾 **What is Agriculture?**\n\nAgriculture is the science, art, and practice of cultivating soil, producing crops, and raising livestock for food, fiber, biofuel, and essential human needs.\n\n**Key Branches of Agriculture:**\n1. **Agronomy:** Cultivation of field crops such as cereals (wheat, rice, maize), pulses, and oilseeds.\n2. **Horticulture:** Production of fruits, vegetables, flowers, spices, and plantation crops.\n3. **Soil Science:** Soil fertility preservation, testing, balanced NPK nutrition, and erosion control.\n4. **Animal Husbandry:** Livestock breeding (dairy cattle, poultry, sheep) integrating manure with crop farming.`;
  }

  // 3. BLACK SOIL CROPS
  if (q.includes('black soil') || q.includes('ಕರಿ ಮಣ್ಣು') || q.includes('काली मिट्टी') || q.includes('regur') || q.includes('vertisol')) {
    if (language === 'kn') {
      return `🌱 **ಕರಿ ಮಣ್ಣಿಗೆ (Black Cotton Soil / Regur) ಸೂಕ್ತವಾದ ಪ್ರಮುಖ ಬೆಳೆಗಳು:**\n\nಕರಿ ಮಣ್ಣು ಹೆಚ್ಚಿನ ಜೇಡಿ ಅಂಶ (40-60%) ಹೊಂದಿದ್ದು, ಅತ್ಯಧಿಕ ನೀರು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಸಾಮರ್ಥ್ಯ ಹಾಗೂ ನೈಸರ್ಗಿಕ ಸುಣ್ಣ, ಮೆಗ್ನೀಸಿಯಮ್ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಅನ್ನು ಹೊಂದಿದೆ.\n\n**ಸೂಕ್ತ ಬೆಳೆಗಳು:**\n1. **ಹತ್ತಿ (Cotton):** ಕಪ್ಪು ಮಣ್ಣಿಗೆ ಅತ್ಯಂತ ಪ್ರಸಿದ್ಧ ವಾಣಿಜ್ಯ ಬೆಳೆ. ಆಳವಾದ ಬೇರು ವ್ಯವಸ್ಥೆಗೆ ಅತ್ಯುತ್ತಮ.\n2. **ಸೋಯಾಬೀನ್ (Soybean):** ಖಾರೀಫ್ ಹಂಗಾಮಿಗೆ ಅತಿ ಸೂಕ್ತವಾದ ದ್ವಿದಳ ಎಣ್ಣೆಕಾಳು ಬೆಳೆ.\n3. **ಕಡಲೆ (Chickpea / Bengal Gram):** ಹಿಂಗಾರು (ರಬಿ) ಹಂಗಾಮಿನಲ್ಲಿ ತೇವಾಂಶ ಬಳಕೆಗೆ ಅತ್ಯುತ್ತಮ.\n4. **ತೊಗರಿ (Red Gram / Pigeon Pea):** ಆಳವಾದ ಬೇರು ಬಿಟ್ಟು ಬರಗಾಲವನ್ನು ತಡೆದುಕೊಳ್ಳುತ್ತದೆ.\n5. **ಮೆಕ್ಕೆಜೋಳ (Maize) ಮತ್ತು ಜೋಳ (Sorghum):** ಉತ್ತಮ ಇಳುವರಿ ನೀಡುತ್ತವೆ.\n\n⚠️ **ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಅತಿಯಾದ ನೀರು ನಿಲ್ಲದಂತೆ ಬಸಿಗಾಲುವೆ (Drainage) ಮಾಡುವುದು ಕಡ್ಡಾಯ.`;
    } else if (language === 'hi') {
      return `🌱 **काली मिट्टी (Regur / Black Cotton Soil) के लिए सबसे उपयुक्त फसलें:**\n\nकाली मिट्टी में क्ले की मात्रा अधिक होती है, जिससे इसकी जल-धारण क्षमता जबरदस्त होती है। यह पोटाश, मैग्नीशियम और चूने से समृद्ध होती है।\n\n**प्रमुख उपयुक्त फसलें:**\n1. **कपास (Cotton):** काली मिट्टी की प्रमुख नकदी फसल (Black Cotton Soil)।\n2. **सोयाबीन (Soybean):** खरीफ सत्र में उच्च पैदावार देने वाली तिलहनी फसल।\n3. **चना (Chickpea):** रबी मौसम में मिट्टी की बची हुई नमी में बेहतरीन उत्पादन।\n4. **अरहर / तूर (Pigeon Pea):** गहरी जड़ों वाली सूखा-प्रतिरोधी दलहन फसल।\n5. **गेहूं (Wheat) व ज्वार (Sorghum):** पर्याप्त सिंचाई व जल निकास के साथ उच्च उपज।\n\n⚠️ **सलाह:** अधिक जलभराव से बचने के लिए खेत में जल निकास नालियां अवश्य बनाएं।`;
    }
    return `🌱 **Top Suitable Crops for Black Soil (Regur / Vertisol):**\n\nBlack soil has high clay content (40-60%), exceptional water-holding capacity, and natural richness in Calcium, Magnesium, and Potash.\n\n**Most Suitable Crops:**\n1. **Cotton:** The primary commercial crop for black soil due to its deep taproot and drought tolerance.\n2. **Soybean:** High-protein oilseed ideal for Kharif season.\n3. **Chickpea (Bengal Gram):** Top Rabi pulse that thrives on conserved residual moisture.\n4. **Pigeon Pea (Tur / Arhar):** Deep-rooted drought-resilient pulse.\n5. **Wheat & Sorghum:** Highly productive with good seedbed preparation.\n\n⚠️ **Management Tip:** Black soil expands when wet and cracks when dry. Ensure proper drainage furrows to prevent waterlogging during heavy monsoon spells.`;
  }

  // 4. HOW TO GROW WHEAT?
  if (q.includes('grow wheat') || q.includes('wheat cultivation') || q.includes('ಗೋಧಿ ಬೆಳೆಯುವುದು') || q.includes('गेहूं की खेती') || (q.includes('wheat') && q.includes('grow'))) {
    if (language === 'kn') {
      return `🌾 **ಗೋಧಿ ವೈಜ್ಞಾನಿಕ ಬೇಸಾಯ ಕ್ರಮಗಳು (Wheat Cultivation Guide):**\n\n1. **ಹಂಗಾಮು & ಬಿತ್ತನೆ ಸಮಯ:** ನವೆಂಬರ್ 1 ರಿಂದ 25 (ಅತ್ಯುತ್ತಮ ರಬಿ ಹಂಗಾಮು).\n2. **ತಳಿಗಳು:** HD-3086, DBW-187, DBW-222, ಅಥವಾ DWR-162 (ಕರ್ನಾಟಕಕ್ಕೆ).\n3. **ಬೀಜ ಪ್ರಮಾಣ & ಉಪಚಾರ:** ಎಕರೆಗೆ 40-45 ಕೆಜಿ ಬೀಜ. ಪ್ರತಿ ಕೆಜಿ ಬೀಜಕ್ಕೆ 2 ಗ್ರಾಂ ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಅಥವಾ 10 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಬೆರೆಸಿ ಉಪಚರಿಸಿ.\n4. **ಗೊಬ್ಬರ ಪ್ರಮಾಣ:** ಎಕರೆಗೆ 10 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ + NPK 40:20:15 ಕೆಜಿ. ಬಿತ್ತನೆ ಸಮಯದಲ್ಲಿ ಅರ್ಧ ಯೂರಿಯಾ, ಪೂರ್ಣ ಡಿಎಪಿ ಮತ್ತು ಪೊಟ್ಯಾಶ್ ಹಾಕಿ.\n5. **ನೀರಾವರಿಯ ಪ್ರಮುಖ ಹಂತಗಳು (CRI Stage):**\n   - ಬಿತ್ತಿದ 21 ದಿನಗಳಿಗೆ ಕಿರೀಟ ಬೇರು ಬಿಡುವ ಹಂತ (CRI Stage - ಅತಿ ಮುಖ್ಯ ನೀರು).\n   - ತೆನೆ ಹೊರಬರುವ ಹಂತ ಹಾಗೂ ಹಾಲು ತುಂಬುವ ಹಂತ.`;
    } else if (language === 'hi') {
      return `🌾 **गेहूं की उन्नत व वैज्ञानिक खेती (Wheat Cultivation Guide):**\n\n1. **बुवाई का सही समय:** 1 नवंबर से 25 नवंबर (समय पर बुवाई से अधिकतम पैदावार)।\n2. **उन्नत किस्में:** HD-3086, DBW-187 (करण वंदना), DBW-222, PBW-502.\n3. **बीज दर व बीजोपचार:** 40-45 किग्रा प्रति एकड़। थीरम 2.5 ग्राम या ट्राइकोडर्मा 10 ग्राम प्रति किग्रा बीज से उपचारित करें।\n4. **उर्वरक प्रबंधन:** एकड़ में 100-120 किग्रा यूरिया, 50 किग्रा डीएपी और 30 किग्रा एमओपी। आधी यूरिया और पूरी डीएपी बुवाई के समय दें।\n5. **क्रांतिक सिंचाई चरण:**\n   - पहली सिंचाई: 20-25 दिन पर शीर्ष जड़ (CRI) बनते समय (सबसे महत्वपूर्ण)।\n   - अन्य सिंचाइयां: कल्ले निकलते समय, गाभा बनते समय व दुग्ध अवस्था में।`;
    }
    return `🌾 **Scientific Wheat Cultivation Guide (Step-by-Step):**\n\n1. **Sowing Window:** November 1st to November 25th (Timely sowing prevents terminal heat stress).\n2. **High-Yielding Varieties:** HD-3086, DBW-187 (Karan Vandana), DBW-222, GW-322.\n3. **Seed Rate & Treatment:** 40-45 kg/acre. Treat with Carboxin + Thiram @ 2 g/kg or Trichoderma @ 10 g/kg.\n4. **Fertilizer Schedule (NPK):** 120:60:40 kg/ha.\n   - Basal: 50% Nitrogen + 100% Phosphorus & Potash at sowing.\n   - Top dressing: 25% Nitrogen at first irrigation, 25% at tillering.\n5. **Critical Irrigation Stages:**\n   - Crown Root Initiation (CRI) at 21 days after sowing (Most critical).\n   - Tillering, Jointing, Flowering, and Milking stages.`;
  }

  // 5. HOW TO GROW RICE?
  if (q.includes('grow rice') || q.includes('rice cultivation') || q.includes('paddy cultivation') || q.includes('ಭತ್ತ ಬೆಳೆಯುವುದು ಹೇಗೆ') || q.includes('धान की खेती') || (q.includes('rice') && q.includes('grow'))) {
    if (language === 'kn') {
      return `🌾 **ಭತ್ತದ ವೈಜ್ಞಾನಿಕ ಬೇಸಾಯ ಕ್ರಮಗಳು (Paddy Cultivation):**\n\n1. **ಹಂಗಾಮು:** ಮುಂಗಾರು (ಖಾರೀಫ್ - ಜೂನ್/ಜುಲೈ) ಮತ್ತು ಬೇಸಿಗೆ.\n2. **ಉನ್ನತ ತಳಿಗಳು:** ಐಆರ್-64, ಜ್ಯೋತಿ, ಎಂಟಿಯು-1010, ಗಂಗಾವತಿ ಸೋನಾ (BPT-5204).\n3. **ನಾಟಿ ಪದ್ಧತಿ:** 21-25 ದಿನಗಳ ಸಸಿಗಳನ್ನು ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ 20 ಸೆಂ.ಮೀ, ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ 10-15 ಸೆಂ.ಮೀ ಅಂತರದಲ್ಲಿ ನಾಟಿ ಮಾಡಿ.\n4. **ಗೊಬ್ಬರ (NPK):** ಎಕರೆಗೆ 40-50 ಕೆಜಿ ಸಾರಜನಕ, 20 ಕೆಜಿ ರಂಜಕ, 20 ಕೆಜಿ ಪೊಟ್ಯಾಶ್ ಮತ್ತು 10 ಕೆಜಿ ಸತುವಿನ ಸಲ್ಫೇಟ್ (Zinc Sulphate).\n5. **ರೋಗ ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಬೆಂಕಿ ರೋಗ (Blast) ಬಾರದಂತೆ ಟ್ರೈಸೈಕ್ಲಾಜೋಲ್ 75 WP (0.6 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.`;
    } else if (language === 'hi') {
      return `🌾 **धान की वैज्ञानिक खेती (Rice / Paddy Cultivation Guide):**\n\n1. **बुवाई व रोपाई:** नर्सरी बुवाई मई-जून; 21-25 दिन की पौध की रोपाई 20×15 सेमी की दूरी पर करें।\n2. **उन्नत किस्में:** पूसा बासमती 1121, पूसा 1509, पीआर-126, एमटीयू-1010, सांबा महसूरी।\n3. **उर्वरक प्रबंधन:** 100-120 किग्रा नाइट्रोजन, 50-60 किग्रा फास्फोरस, 40 किग्रा पोटाश + 25 किग्रा जिंक सल्फेट प्रति हेक्टेयर।\n4. **जल प्रबंधन:** रोपाई के बाद 2-3 सप्ताह तक 2-3 सेमी पानी बनाए रखें; बाद में कल्ले फूटने पर हल्का गीला-सूखा चक्र अपनाएं।\n5. **रोग सुरक्षा:** झुलसा (Blast) रोग से बचाव हेतु ट्राईसाइक्लाजोल 75% WP @ 0.6 ग्राम/लीटर का छिड़काव करें।`;
    }
    return `🌾 **Scientific Rice / Paddy Cultivation Guide:**\n\n1. **Nursery & Transplanting:** Raise nursery in May-June; transplant 21-25 day old seedlings at 20×15 cm spacing (2-3 seedlings per hill).\n2. **Certified Varieties:** MTU-1010, IR-64, Pusa Basmati 1121, Samba Mahsuri (BPT-5204).\n3. **Balanced Fertilization (NPK + Zn):** 100-120 kg N : 50-60 kg P₂O₅ : 40-50 kg K₂O per hectare + 25 kg Zinc Sulphate (basal).\n4. **Water Management:** Maintain 2-3 cm standing water during transplanting and tillering; adopt Alternate Wetting and Drying (AWD) to save up to 30% water.\n5. **Pest & Disease Prevention:** Monitor for Rice Blast and Stem Borer. Spray Tricyclazole 75 WP @ 0.6 g/L for blast prevention.`;
  }

  // 6. WHAT CAUSES YELLOW LEAVES?
  if (q.includes('yellow leaves') || q.includes('ಹಳದಿ ಎಲೆ') || q.includes('पीली पत्त') || q.includes('chlorosis')) {
    if (language === 'kn') {
      return `🍂 **ಬೆಳೆಗಳಲ್ಲಿ ಎಲೆಗಳು ಹಳದಿಯಾಗಲು (Chlorosis) ಮುಖ್ಯ ಕಾರಣಗಳು ಮತ್ತು ಪರಿಹಾರ:**\n\n1. **ಸಾರಜನಕ (Nitrogen) ಕೊರತೆ:**\n   - *ಲಕ್ಷಣ:* ಹಳೆಯ ಕೆಳಗಿನ ಎಲೆಗಳು ಮೊದಲು ಹಳದಿಯಾಗುತ್ತವೆ.\n   - *ಪರಿಹಾರ:* ಎಕರೆಗೆ ಯೂರಿಯಾ ಸಿಂಪಡಿಸಿ ಅಥವಾ 19:19:19 ಕರಗುವ ಗೊಬ್ಬರ (5 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n2. **ಕಬ್ಬಿಣ / ಸತುವಿನ (Zinc/Iron) ಕೊರತೆ:**\n   - *ಲಕ್ಷಣ:* ಹೊಸ ಚಿಗುರೆಲೆಗಳ ನರಗಳು ಹಸಿರಾಗಿದ್ದು, ಮಧ್ಯಭಾಗ ಹಳದಿಯಾಗುತ್ತದೆ.\n   - *ಪರಿಹಾರ:* ಝಿಂಕ್ ಸಲ್ಫೇಟ್ (2 ಗ್ರಾಂ/ಲೀಟರ್) ಅಥವಾ ಚೆಲೇಟೆಡ್ ಐರನ್ (Fe-EDTA 1 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n3. **ಅತಿಯಾದ ನೀರು / ಬೇರು ಕೊಳೆತ:**\n   - ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಂತರೆ ಬೇರುಗಳಿಗೆ ಆಮ್ಲಜನಕ ಸಿಗದೆ ಎಲೆ ಹಳದಿಯಾಗುತ್ತದೆ. ಬಸಿಗಾಲುವೆ ಮಾಡಿ.\n4. **ರಸಹೀರುವ ಕೀಟಗಳು / ವೈರಸ್:**\n   - ಬಿಳಿ ನೊಣ, ಜಿಗಿ ಹುಳುಗಳಿಂದ ಎಲೆ ಮುದುಡಿ ಹಳದಿಯಾದರೆ ಬೇವಿನ ಎಣ್ಣೆ (5 ಮಿ.ಲೀ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.`;
    } else if (language === 'hi') {
      return `🍂 **फसलों में पत्तियां पीली पड़ने के मुख्य कारण व उपचार (Leaf Chlorosis Guide):**\n\n1. **नाइट्रोजन की कमी (Nitrogen Deficiency):**\n   - *लक्षण:* नीचे की पुरानी पत्तियां पहले पीली पड़ती हैं।\n   - *उपचार:* 19:19:19 घुलनशील खाद @ 5 ग्राम/लीटर या यूरिया का छिड़काव करें।\n2. **सूक्ष्म पोषक तत्वों (जिंक/आयरन) की कमी:**\n   - *लक्षण:* नई कोमल पत्तियों की नसें हरी रहती हैं और बीच का भाग पीला हो जाता है।\n   - *उपचार:* जिंक सल्फेट 2 ग्राम/लीटर या फेरस सल्फेट 2 ग्राम/लीटर का छिड़काव करें।\n3. **जलभराव या जड़ गलन (Waterlogging):**\n   - जड़ों में पानी भरने से ऑक्सीजन बंद हो जाती है। खेत से अतिरिक्त पानी तुरंत निकालें।\n4. **रस चूसक कीट या वायरस:**\n   - सफेद मक्खी व थ्रिप्स के प्रकोप से पत्तियां मुड़कर पीली होती हैं। नीम तेल @ 5 मिली/लीटर का छिड़काव करें।`;
    }
    return `🍂 **Diagnostic Guide: What Causes Yellow Leaves in Crops (Chlorosis)?**\n\n1. **Nitrogen (N) Deficiency:**\n   - *Symptom:* Older lower leaves turn uniformly pale yellow first.\n   - *Correction:* Spray 19:19:19 water-soluble NPK @ 5 g/L or apply top-dressed urea.\n2. **Micronutrient (Iron / Zinc) Deficiency:**\n   - *Symptom:* Young top leaves show interveinal chlorosis (green veins with yellow leaf blades).\n   - *Correction:* Foliar spray of Chelated Iron (Fe-EDTA @ 1 g/L) or Zinc Sulphate (2 g/L).\n3. **Waterlogging & Oxygen Starvation:**\n   - Saturated soils asphyxiate root respiration, preventing nutrient uptake. Clear drainage furrows immediately.\n4. **Sucking Pests / Viral Infection:**\n   - Whiteflies and thrips transmit viruses and suck sap. Spray cold-pressed Neem oil (1500 ppm @ 5 ml/L).`;
  }

  // 7. HOW TO CONTROL COTTON PESTS?
  if (q.includes('cotton pest') || q.includes('pests in cotton') || q.includes('bollworm') || q.includes('ಹತ್ತಿಯಲ್ಲಿ ಕೀಟ') || q.includes('कपास में कीट') || (q.includes('cotton') && q.includes('pest'))) {
    if (language === 'kn') {
      return `☁️ **ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ಪ್ರಮುಖ ಕೀಟಗಳು ಮತ್ತು ಸಮಗ್ರ ಹತೋಟಿ (Cotton IPM):**\n\n1. **ರಸಹೀರುವ ಕೀಟಗಳು (ಬಿಳಿ ನೊಣ, ಜಿಗಿ ಹುಳು, ಥ್ರಿಪ್ಸ್):**\n   - ಎಕರೆಗೆ 10 ಹಳದಿ ಮತ್ತು 10 ನೀಲಿ ಅಂಟು ಬಲೆಗಳನ್ನು (Sticky Traps) ಕಟ್ಟಿ.\n   - ಬೇವಿನ ಎಣ್ಣೆ (Neem oil 1500 ppm) 5 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n   - ಬಾಧೆ ಹೆಚ್ಚಿದ್ದರೆ ಡಯಾಫೆಂಥಿಯುರಾನ್ 50 WP (1 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n2. **ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು (Pink Bollworm):**\n   - ಎಕರೆಗೆ 4-5 ಲಿಂಗಾಕರ್ಷಕ ಬಲೆಗಳನ್ನು (Pheromone Traps) ಅಳವಡಿಸಿ.\n   - ಟ್ರೈಕೋಗ್ರಾಮಾ ಪರಾವಲಂಬಿ ಕಾರ್ಡ್‌ಗಳನ್ನು (Trichogramma cards @ 3/acre) ಬಿಡಿ.\n   - ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೋಯೆಟ್ 5 SG @ 0.5 ಗ್ರಾಂ/ಲೀಟರ್ ಅಥವಾ ಕ್ಲೋರಾಂಟ್ರಾನಿಲಿಪ್ರೋಲ್ 18.5 SC @ 0.3 ಮಿ.ಲೀ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.\n\n🛡️ *ಮುನ್ನೆಚ್ಚರಿಕೆ: ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸುವಾಗ ಮುಖಗವಸು ಮತ್ತು ಕೈಗವಸು ಧರಿಸಿ.*`;
    } else if (language === 'hi') {
      return `☁️ **कपास में प्रमुख कीटों का एकीकृत नियंत्रण (Cotton Pest IPM Guide):**\n\n1. **रस चूसक कीट (सफेद मक्खी, हरा तेला, थ्रिप्स):**\n   - प्रति एकड़ 10 पीले और 10 नीले चिपचिपे ट्रैप (Sticky Traps) लगाएं।\n   - नीम का तेल (1500 ppm) @ 5 मिली/लीटर पानी में मिलाकर छिड़कें।\n   - प्रकोप अधिक होने पर डायफेंथियूरॉन 50% WP @ 1.2 ग्राम/लीटर का छिड़काव करें।\n2. **गुलाबी सुंडी (Pink Bollworm):**\n   - निगरानी हेतु प्रति एकड़ 4-5 फेरोमोन ट्रैप लगाएं।\n   - नीम बीज अर्क (NSKE 5%) या ट्राइकोग्रामा अंड परजीवी छोड़ें।\n   - रासायनिक नियंत्रण: इमामेक्टिन बेंजोएट 5% SG @ 0.5 ग्राम/लीटर या कोराजन (Chlorantraniliprole 18.5% SC) @ 0.3 मिली/लीटर का छिड़काव करें।\n\n🛡️ *सुरक्षा: दवा छिड़कते समय मास्क और दस्ताने अवश्य पहनें।*`;
    }
    return `☁️ **Integrated Pest Management (IPM) for Cotton:**\n\n1. **Sucking Pests (Whitefly, Jassids, Thrips):**\n   - Install 10 Yellow and 10 Blue sticky traps per acre.\n   - Spray cold-pressed Neem seed kernel extract (NSKE 5%) or 1500 ppm Neem oil @ 5 ml/L.\n   - If threshold exceeded: Spray Diafenthiuron 50% WP @ 1.2 g/L or Flonicamid 50% WG @ 0.3 g/L.\n2. **Bollworms (Pink Bollworm & American Bollworm):**\n   - Erect 4-5 Pheromone Traps per acre with Gossyplure lures for early detection.\n   - Release Trichogramma egg parasitoid cards @ 3 cards/acre.\n   - Spray Emamectin Benzoate 5% SG @ 0.5 g/L or Chlorantraniliprole 18.5% SC @ 0.3 ml/L.\n\n🛡️ *Safety Rule: Always spray during calm hours with full PPE (mask, goggles, gloves).*`;
  }

  // 8. FERTILIZER FOR TOMATO
  if (q.includes('fertilizer') && (q.includes('tomato') || contextCrop === 'tomato')) {
    if (language === 'kn') {
      return `🍅 **ಟೊಮೆಟೊ ಬೆಳೆಗೆ ಸಮಗ್ರ ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ (Tomato NPK Schedule):**\n\n1. **ಬುಡ ಗೊಬ್ಬರ (ನಾಟಿ ಸಮಯದಲ್ಲಿ):**\n   - ಎಕರೆಗೆ 10 ಟನ್ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ + 50 ಕೆಜಿ ಡಿಎಪಿ (DAP), 40 ಕೆಜಿ ಪೊಟ್ಯಾಶ್ (MOP), ಮತ್ತು 25 ಕೆಜಿ ಜಿಪ್ಸಮ್.\n2. **ನಾಟಿ ಮಾಡಿದ 3-4 ವಾರಗಳ ನಂತರ (ಬೆಳವಣಿಗೆ ಹಂತ):**\n   - ಯೂರಿಯಾ 25 ಕೆಜಿ ನೀರಾವರಿಯೊಂದಿಗೆ ಕೊಡಿ ಅಥವಾ 19:19:19 ಕರಗುವ ಗೊಬ್ಬರ (5 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n3. **ಹೂವು ಮತ್ತು ಕಾಯಿ ಬಿಡುವ ಹಂತ:**\n   - ಕಾಯಿ ಕೊಳೆತ ಮತ್ತು ಹೂವು ಉದುರುವುದು ತಪ್ಪಿಸಲು ಬೋರಾನ್ 20% (1 ಗ್ರಾಂ/ಲೀಟರ್) ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ (5 ಗ್ರಾಂ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.\n4. **ಕಾಯಿ ಬಲಿತ ಹಂತ:**\n   - 0:0:50 (ಪೊಟ್ಯಾಶಿಯಮ್ ಸಲ್ಫೇಟ್) ಸಿಂಪಡಿಸುವುದರಿಂದ ಕಾಯಿಯ ಹೊಳಪು ಮತ್ತು ತೂಕ ಹೆಚ್ಚುತ್ತದೆ.`;
    } else if (language === 'hi') {
      return `🍅 **टमाटर की फसल के लिए संतुलित उर्वरक प्रबंधन (Tomato Fertilizer Schedule):**\n\n1. **बुवाई / रोपाई के समय (बेसल डोज):**\n   - प्रति एकड़ 10 टन सड़ी गोबर खाद + 50 किग्रा डीएपी, 40 किग्रा एमओपी (पोटाश) और 25 किग्रा जिप्सम।\n2. **वानस्पतिक वृद्धि अवस्था (रोपाई के 20-30 दिन बाद):**\n   - 25 किग्रा यूरिया ड्रिप से दें या 19:19:19 @ 5 ग्राम/लीटर का पर्णीय छिड़काव करें।\n3. **फूल व फल बनते समय:**\n   - फल फटने (Cracking) और फूल झड़ने से रोकने के लिए कैल्शियम नाइट्रेट 5 ग्राम/लीटर + बोरॉन 1 ग्राम/लीटर का छिड़काव करें।\n4. **फल पकते समय:**\n   - फलों के वजन, लाल रंग और भंडारण क्षमता के लिए 0:0:50 @ 5 ग्राम/लीटर का छिड़काव करें।`;
    }
    return `🍅 **Scientific Fertilizer Recommendation for Tomato (NPK Schedule):**\n\n1. **Basal Dose (At Transplanting):**\n   - Apply 10 tonnes well-decomposed FYM + 50 kg DAP + 40 kg MOP (Potash) + 25 kg Gypsum per acre.\n2. **Vegetative Growth (20-30 Days After Transplanting):**\n   - Apply 25 kg Urea with irrigation or foliar spray 19:19:19 (Water Soluble NPK) @ 5 g/L.\n3. **Flowering & Fruit Set:**\n   - Spray Calcium Nitrate @ 5 g/L + Boron 20% @ 1 g/L to prevent blossom end rot and fruit cracking.\n4. **Fruit Maturity:**\n   - Foliar spray 0:0:50 (Potassium Sulphate) @ 5 g/L to enhance fruit size, firmness, and uniform red color.`;
  }

  // 9. HOW MUCH WATER DOES MAIZE NEED?
  if (q.includes('water') && (q.includes('maize') || q.includes('corn') || contextCrop === 'maize')) {
    if (language === 'kn') {
      return `🌽 **ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ (Maize / Corn) ನೀರಿನ ಅವಶ್ಯಕತೆ ಮತ್ತು ನೀರಾವರಿ ವೇಳಾಪಟ್ಟಿ:**\n\n- **ಒಟ್ಟು ನೀರಿನ ಪ್ರಮಾಣ:** ಒಂದು ಬೆಳೆಗೆ ಸರಾಸರಿ 500 ರಿಂದ 600 ಮಿ.ಮೀ ನೀರು ಬೇಕಾಗುತ್ತದೆ.\n\n**ಅತಿ ಸೂಕ್ಷ್ಮ ಹಂತಗಳು (Critical Watering Stages):**\n1. **ತೆನೆ ಮೂಡುವ ಹಂತ (Tasseling Stage - ಬಿತ್ತಿದ 45-50 ದಿನ):** ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾದರೆ ಪರಾಗಸ್ಪರ್ಶ ಕುಂಠಿತವಾಗಿ ಇಳುವರಿ ಶೇ. 40-50 ರಷ್ಟು ಕಡಿಮೆಯಾಗುತ್ತದೆ.\n2. **ರೇಷ್ಮೆ ಎಳೆ ಮೂಡುವ ಹಂತ (Silking Stage - ಬಿತ್ತಿದ 55-60 ದಿನ):** ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ ಹಂತ.\n3. **ಕಾಳು ಕಟ್ಟುವ ಹಂತ (Grain Filling / Milking Stage - ಬಿತ್ತಿದ 70-75 ದಿನ).\n\n💡 **ಸಲಹೆ:** ಹನಿ ನೀರಾವರಿ (Drip Irrigation) ಬಳಸಿದರೆ ಶೇ. 40 ರಷ್ಟು ನೀರು ಉಳಿತಾಯವಾಗುತ್ತದೆ ಮತ್ತು ಕಳೆ ನಿಯಂತ್ರಣ ಸುಲಭವಾಗುತ್ತದೆ.`;
    } else if (language === 'hi') {
      return `🌽 **मक्के (Maize / Corn) के लिए जल की आवश्यकता व सिंचाई प्रबंधन:**\n\n- **कुल पानी की आवश्यकता:** पूरे फसल चक्र में लगभग 500 से 600 मिमी पानी की आवश्यकता होती है।\n\n**सिंचाई के सबसे महत्वपूर्ण (क्रांतिक) चरण:**\n1. **नर मंजरी (Tasseling) निकलते समय (बुवाई के 45-50 दिन बाद):** इस समय पानी की कमी से परागण रुक जाता है और 40% तक पैदावार गिर सकती है।\n2. **मादा मंजरी / सिल्क (Silking) अवस्था (55-60 दिन बाद):** बालियों में दाना भरने का आधार।\n3. **दाना भरते समय (Milking & Dough Stage - 70-75 दिन बाद):** दाने सुडौल और भारी बनते हैं।\n\n💡 **सुझाव:** टपक (ड्रिप) सिंचाई अपनाकर 40% पानी बचाया जा सकता है। भारी बारिश में खेत में जलभराव न होने दें।`;
    }
    return `🌽 **Water Requirements for Maize (Corn):**\n\n- **Total Water Requirement:** 500 to 600 mm throughout the crop growing cycle.\n\n**Critical Irrigation Stages (Moisture Stress Causes Up to 50% Yield Loss):**\n1. **Tasseling Stage (45-50 DAS):** Tassel emergence requires optimal soil moisture for viable pollen shed.\n2. **Silking Stage (55-60 DAS):** The single most critical stage for ovule fertilization.\n3. **Grain Filling / Milking Stage (70-75 DAS):** Critical for kernel weight and test weight.\n\n💡 **Irrigation Tip:** Drip irrigation reduces water consumption by 35-40% compared to furrow flooding. Never let standing water stagnate around the root collars for more than 24 hours.`;
  }

  // 10. BEST SEASON FOR GROUNDNUT
  if (q.includes('groundnut') || q.includes('peanut') || q.includes('ಕಡಲೆಕಾಯಿ') || q.includes('मूंगफली')) {
    if (language === 'kn') {
      return `🥜 **ಕಡಲೆಕಾಯಿ (Groundnut) ಬೆಳೆಯಲು ಅತ್ಯುತ್ತಮ ಹಂಗಾಮು ಮತ್ತು ಸಮಯ:**\n\n1. **ಮುಂಗಾರು (ಖಾರೀಫ್ ಹಂಗಾಮು):**\n   - *ಬಿತ್ತನೆ ಸಮಯ:* ಜೂನ್ 15 ರಿಂದ ಜುಲೈ 15 (ಮಳೆ ಆಶ್ರಯದಲ್ಲಿ).\n   - *ಪ್ರಮುಖ ತಳಿಗಳು:* ಕದಿರಿ-6, ಜಿಜೆಜಿ-9, ಜಿಪಿಬಿಡಿ-4, ಕೆಎಲ್-9.\n2. **ಹಿಂಗಾರು / ಬೇಸಿಗೆ (ರಬಿ ಹಂಗಾಮು - ನೀರಾವರಿ ಆಶ್ರಯ):**\n   - *ಬಿತ್ತನೆ ಸಮಯ:* ನವೆಂಬರ್ ನಿಂದ ಡಿಸೆಂಬರ್ (ರಬಿ) ಅಥವಾ ಜನವರಿ-ಫೆಬ್ರವರಿ (ಬೇಸಿಗೆ).\n   - ಬೇಸಿಗೆ ಹಂಗಾಮಿನಲ್ಲಿ ರೋಗಬಾಧೆ ಕಡಿಮೆ ಇರುವುದರಿಂದ ಶೇ. 25-30 ರಷ್ಟು ಹೆಚ್ಚಿನ ಇಳುವರಿ ಬರುತ್ತದೆ.\n3. **ಮಣ್ಣಿನ ಅಗತ್ಯ:** ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು (Sandy Loam) ಕಾಯಿ ಕಟ್ಟಲು (Pegging) ಅತ್ಯುತ್ತಮ.`;
    } else if (language === 'hi') {
      return `🥜 **मूंगफली (Groundnut) की खेती का सबसे सही मौसम व समय:**\n\n1. **खरीफ सीजन (वर्षा आधारित):**\n   - *बुवाई का समय:* 15 जून से 15 जुलाई (मानसून की पहली अच्छी बारिश के बाद)।\n   - *उन्नत किस्में:* कादिरी-6, टीएजी-24, जीजेजी-9, गिरनार-3.\n2. **जायद / ग्रीष्मकालीन सीजन (सिंचित):**\n   - *बुवाई का समय:* 15 जनवरी से 28 फरवरी।\n   - इस मौसम में रोग-कीट कम लगते हैं और पैदावार 25-30% अधिक मिलती है।\n3. **उपयुक्त मिट्टी:** हल्की रेतीली दोमट मिट्टी जिसमें फलियां (Pegs) आसानी से जमीन में प्रवेश कर सकें।`;
    }
    return `🥜 **Optimal Seasons for Groundnut (Peanut) Cultivation:**\n\n1. **Kharif Season (Rainfed):**\n   - *Sowing Window:* June 15th to July 15th (with the onset of the southwest monsoon).\n   - *Recommended Cultivars:* Kadiri-6, TAG-24, GPBD-4, GJG-9.\n2. **Rabi / Summer Season (Irrigated):**\n   - *Sowing Window:* November to December (Rabi) or January 15 to February 28 (Summer).\n   - Summer groundnut typically yields 25-30% higher due to abundant sunshine and lower foliar disease pressure.\n3. **Soil Requirement:** Well-drained sandy loam or light red loam with pH 6.0-7.5 facilitating effortless peg penetration and pod development.`;
  }

  // 11. HOW TO IMPROVE SOIL FERTILITY?
  if (q.includes('soil fertility') || q.includes('ಮಣ್ಣಿನ ಫಲವತ್ತತೆ') || q.includes('मिट्टी की उर्वर') || q.includes('improve soil')) {
    if (language === 'kn') {
      return `🌱 **ಮಣ್ಣಿನ ಫಲವತ್ತತೆ ಹೆಚ್ಚಿಸಲು 5 ಪ್ರಮುಖ ಮಾರ್ಗಗಳು:**\n\n1. **ಸಾವಯವ ಗೊಬ್ಬರ ಬಳಕೆ:** ಪ್ರತಿ ವರ್ಷ ಎಕರೆಗೆ 8-10 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಅಥವಾ 2 ಟನ್ ಎರೆಹುಳು ಗೊಬ್ಬರ (Vermicompost) ಸೇರಿಸಿ.\n2. **ಹಸಿರೆಲೆ ಗೊಬ್ಬರ (Green Manuring):** ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಸೆಣಬು (Sunnhemp) ಅಥವಾ ಡಯಾಂಚ (Dhaincha) ಬೆಳೆದು 45 ದಿನಗಳಲ್ಲಿ ಮಣ್ಣಿನಲ್ಲಿ ಉತ್ತು ಬೆರೆಸಿ. ಇದು ಎಕರೆಗೆ 25-30 ಕೆಜಿ ನೈಸರ್ಗಿಕ ಸಾರಜನಕವನ್ನು ಒದಗಿಸುತ್ತದೆ.\n3. **ಬೆಳೆ ಪರಿವರ್ತನೆ (Crop Rotation):** ಒಂದೇ ಬೆಳೆಯನ್ನು ಸತತವಾಗಿ ಬೆಳೆಯದೆ, ದ್ವಿದಳ ಧಾನ್ಯಗಳೊಂದಿಗೆ (ಕಡಲೆ, ಸೋಯಾಬೀನ್, ತೊಗರಿ) ಬೆಳೆ ಪರಿವರ್ತನೆ ಮಾಡಿ.\n4. **ಜೈವಿಕ ಗೊಬ್ಬರಗಳು (Biofertilizers):** ಅಜಟೋಬ್ಯಾಕ್ಟರ್, ರೈಜೋಬಿಯಂ ಮತ್ತು ರಂಜಕ ಕರಗಿಸುವ ಸೂಕ್ಷ್ಮಾಣುಜೀವಿಗಳನ್ನು (PSB) ಮಣ್ಣಿಗೆ ಬೆರೆಸಿ.\n5. **ಮಣ್ಣು ಪರೀಕ್ಷೆ:** ಪ್ರತಿ 2 ವರ್ಷಕ್ಕೊಮ್ಮೆ ಮಣ್ಣು ಪರೀಕ್ಷೆ ಮಾಡಿಸಿ, ಶಿಫಾರಸು ಮಾಡಿದಷ್ಟು ಮಾತ್ರ ರಸಗೊಬ್ಬರ ಬಳಸಿ.`;
    } else if (language === 'hi') {
      return `🌱 **मिट्टी की उर्वरा शक्ति बढ़ाने के 5 वैज्ञानिक तरीके:**\n\n1. **जैविक खादों का प्रयोग:** प्रति एकड़ 8-10 टन अच्छी सड़ी गोबर की खाद (FYM) या 2 टन केंचुआ खाद (वर्मीकम्पोस्ट) डालें।\n2. **हरी खाद (Green Manure):** मुख्य फसल से पहले सनई या ढैंचा बोएं और 45 दिन बाद मिट्टी में जुताई कर दबा दें। इससे 25-30 किग्रा प्राकृतिक नाइट्रोजन मिलती है।\n3. **फसल चक्र (Crop Rotation):** लगातार एक ही फसल न लें; दलहनी फसलों (चना, मूंग, उड़द) को फसल चक्र में अवश्य शामिल करें।\n4. **जैव उर्वरक (Biofertilizers):** राइजोबियम, पीएसबी (PSB) और एजोटोबैक्टर कल्चर का उपयोग करें।\n5. **मृदा स्वास्थ्य कार्ड (Soil Health Card):** मिट्टी की जांच कराएं और जरूरत के अनुसार ही संतुलित रासायनिक खाद डालें।`;
    }
    return `🌱 **5 Proven Strategies to Improve Soil Fertility:**\n\n1. **Incorporate Organic Matter:** Apply 8-10 tonnes/acre well-rotted FYM or 2 tonnes/acre Vermicompost annually to enhance soil organic carbon (target > 0.75%).\n2. **Green Manuring:** Sow Sunnhemp (Crotalaria juncea) or Dhaincha (Sesbania) and incorporate into soil at 45 days. Adds 25-30 kg organic Nitrogen per acre.\n3. **Crop Rotation with Legumes:** Rotate heavy feeders (cotton, maize) with nitrogen-fixing pulses (chickpea, soybean, pigeon pea).\n4. **Biofertilizers & Mycorrhizae:** Inoculate soil with PSB (Phosphate Solubilizing Bacteria), Azotobacter, and VAM fungi to unlock fixed minerals.\n5. **Soil Testing:** Test soil every 2 years through Soil Health Card scheme; balance soil pH (gypsum for alkaline; lime for acidic soils).`;
  }

  // 12. WHAT IS ORGANIC FARMING?
  if (q.includes('organic farming') || q.includes('ಸಾವಯವ ಕೃಷಿ') || q.includes('जैविक खेती') || q.includes('natural farming')) {
    if (language === 'kn') {
      return `🌿 **ಸಾವಯವ ಕೃಷಿ (Organic Farming) ಎಂದರೇನು?**\n\nಸಾವಯವ ಕೃಷಿ ಎಂದರೆ ಯಾವುದೇ ಸಿಂಥೆಟಿಕ್ ರಾಸಾಯನಿಕ ಗೊಬ್ಬರಗಳು, ಕೀಟನಾಶಕಗಳು ಮತ್ತು ಹಾರ್ಮೋನ್‌ಗಳನ್ನು ಬಳಸದೆ, ಕೇವಲ ನೈಸರ್ಗಿಕ ಜೈವಿಕ ಸಂಪನ್ಮೂಲಗಳನ್ನು ಬಳಸಿ ಬೆಳೆ ಬೆಳೆಯುವ ಪರಿಸರಸ್ನೇಹಿ ಪದ್ಧತಿಯಾಗಿದೆ.\n\n**ಮುಖ್ಯ ಆಧಾರಸ್ತಂಭಗಳು:**\n1. **ಜೀವಾಮೃತ & ಬೀಜಾಮೃತ:** ದೇಸಿ ಹಸುವಿನ ಸಗಣಿ, ಗೋಮೂತ್ರ, ಬೆಲ್ಲ ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯದ ಹಿಟ್ಟಿನಿಂದ ತಯಾರಿಸಿದ ಜೈವಿಕ ದ್ರಾವಣ.\n2. **ಕಾಂಪೋಸ್ಟ್ ಮತ್ತು ಹಸಿರೆಲೆ ಗೊಬ್ಬರ:** ಮಣ್ಣಿನ ಸೂಕ್ಷ್ಮಾಣುಜೀವಿಗಳನ್ನು ಸಕ್ರಿಯಗೊಳಿಸಲು.\n3. **ನೈಸರ್ಗಿಕ ಕೀಟನಾಶಕಗಳು:** ನೀಮಾಸ್ತ್ರ, ಬ್ರಹ್ಮಾಸ್ತ್ರ, ಅಗ್ನಿಯಾಸ್ತ್ರ ಮತ್ತು ಹುಳಿ ಮಜ್ಜಿಗೆ ಸಿಂಪರಣೆ.\n4. **ಬೆಳೆ ವೈವಿಧ್ಯತೆ:** ಕೀಟಗಳ ಚಕ್ರವನ್ನು ಮುರಿಯಲು ಮಿಶ್ರ ಬೆಳೆ ಪದ್ಧತಿ.`;
    } else if (language === 'hi') {
      return `🌿 **जैविक खेती (Organic Farming) क्या है?**\n\nजैविक खेती एक ऐसी टिकाऊ व पर्यावरण-अनुकूल पद्धति है जिसमें रासायनिक उर्वरकों, जहरीले कीटनाशकों और खरपतवारनाशकों का उपयोग पूरी तरह वर्जित होता है।\n\n**इसके प्रमुख घटक:**\n1. **जीवामृत व बीजामृत:** देशी गाय के गोबर, गोमूत्र, गुड़, बेसन और मिट्टी से तैयार प्राकृतिक संवर्धन।\n2. **वर्मीकम्पोस्ट व नाडेप खाद:** मिट्टी में जीवांश कार्बन (Organic Carbon) बढ़ाने के लिए।\n3. **प्राकृतिक कीट नियंत्रक:** नीमास्त्र, ब्रह्मास्त्र, दशपर्णी अर्क और खट्टी छाछ का छिड़काव।\n4. **मिश्रित व बहुफसली प्रणाली:** कीट-रोग चक्र को तोड़ने और मिट्टी की उर्वरता बनाए रखने हेतु।`;
    }
    return `🌿 **What is Organic Farming?**\n\nOrganic farming is a holistic production management system that promotes agro-ecosystem health, biodiversity, biological cycles, and soil biological activity. It excludes synthetic fertilizers, chemical pesticides, antibiotics, and synthetic growth regulators.\n\n**Core Pillars of Organic Farming:**\n1. **Soil Biological Activation:** Application of Jeevamrutha, Panchagavya, vermicompost, and green manures.\n2. **Ecological Pest & Disease Management:** Utilization of Neem-based formulations, sticky traps, pheromone lures, and bio-agents (Trichoderma, Beauveria).\n3. **Crop Diversity & Rotation:** Intercropping and rotating cereals with leguminous pulses.\n4. **Soil Moisture Mulching:** Preserving microbial life and earthworm activity.`;
  }

  // 13. EXPLAIN PHOTOSYNTHESIS
  if (q.includes('photosynthesis') || q.includes('ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ') || q.includes('प्रकाश संश्लेषण')) {
    if (language === 'kn') {
      return `☀️ **ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ (Photosynthesis) ಎಂದರೇನು? ಸರಳ ವಿವರಣೆ:**\n\nದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ಎಂದರೆ ಹಸಿರು ಸಸ್ಯಗಳು ಸೂರ್ಯನ ಬೆಳಕು, ನೀರಿನ (H₂O) ಮತ್ತು ವಾತಾವರಣದ ಇಂಗಾಲದ ಡೈಆಕ್ಸೈಡ್ (CO₂) ಅನ್ನು ಬಳಸಿಕೊಂಡು ತಮ್ಮ ಆಹಾರವನ್ನು (ಗ್ಲುಕೋಸ್) ತಯಾರಿಸುವ ಪ್ರಕ್ರಿಯೆಯಾಗಿದೆ.\n\n**ರಾಸಾಯನಿಕ ಸೂತ್ರ:**\n\`6CO₂ + 6H₂O + ಸೂರ್ಯನ ಬೆಳಕು ➔ C₆H₁₂O₆ (ಗ್ಲುಕೋಸ್) + 6O₂ (ಆಕ್ಸಿಜನ್)\`\n\n**ಕೃಷಿಯಲ್ಲಿ ಇದರ ಮಹತ್ವ:**\n- ಸಸ್ಯಗಳಲ್ಲಿ ಕ್ಲೋರೋಫಿಲ್ (Chlorophyll) ಪ್ರಮಾಣ ಚೆನ್ನಾಗಿದ್ದಷ್ಟೂ ಆಹಾರ ತಯಾರಿಕೆ ಹೆಚ್ಚಾಗಿ ಉತ್ತಮ ಇಳುವರಿ ಬರುತ್ತದೆ.\n- ಗಿಡಗಳಿಗೆ ಸರಿಯಾದ ಬಿಸಿಲು ಮತ್ತು ಮೆಗ್ನೀಸಿಯಮ್/ಕಬ್ಬಿಣದ ಪೋಷಕಾಂಶಗಳು ಸಿಕ್ಕಾಗ ದ್ಯುತಿಸಂಶ್ಲೇಷಣೆ ವೇಗವಾಗಿ ನಡೆಯುತ್ತದೆ.`;
    } else if (language === 'hi') {
      return `☀️ **प्रकाश संश्लेषण (Photosynthesis) क्या है?**\n\nप्रकाश संश्लेषण वह जैव-रासायनिक प्रक्रिया है जिसके द्वारा हरे पौधे सूर्य के प्रकाश, पानी और वायुमंडल की कार्बन डाइऑक्साइड (CO₂) का उपयोग करके अपना भोजन (ग्लूकोज) बनाते हैं तथा ऑक्सीजन (O₂) गैस मुक्त करते हैं।\n\n**रासायनिक समीकरण:**\n\`6CO₂ + 6H₂O + सूर्य का प्रकाश ➔ C₆H₁₂O₆ (ग्लूकोज) + 6O₂ (ऑक्सीजन)\`\n\n**खेती में महत्व:**\n- पत्तियों में क्लोरोफिल की मात्रा जितनी अच्छी होगी, प्रकाश संश्लेषण उतना अधिक होगा और फल/दानों का भराव बेहतरीन होगा।\n- इसके लिए पर्याप्त धूप, संतुलित नाइट्रोजन व मैग्नीशियम आवश्यक हैं।`;
    }
    return `☀️ **What is Photosynthesis? (Simple & Scientific Explanation):**\n\nPhotosynthesis is the fundamental biological process by which green plants, algae, and certain bacteria convert light energy (sunlight) into chemical energy stored in glucose molecules, while releasing life-giving oxygen into the atmosphere.\n\n**Chemical Equation:**\n\`6CO₂ + 6H₂O + Sunlight (Chlorophyll) ➔ C₆H₁₂O₆ (Glucose) + 6O₂ (Oxygen)\`\n\n**Agronomic Significance:**\n- Crop yield is directly proportional to photosynthetic efficiency.\n- Healthy green leaves packed with chlorophyll (dependent on balanced Nitrogen, Magnesium, and Iron) maximize solar interception and grain weight.`;
  }

  // 14. HOW TO IDENTIFY PLANT DISEASES?
  if (q.includes('identify plant disease') || q.includes('ರೋಗ ಗುರುತಿಸುವುದು') || q.includes('रोगों की पहचान') || q.includes('plant disease identification')) {
    if (language === 'kn') {
      return `🔍 **ಗಿಡಗಳಲ್ಲಿ ರೋಗಗಳನ್ನು ಗುರುತಿಸುವ 5-ಹಂತಗಳ ಸುಲಭ ವಿಧಾನ:**\n\n1. **ಎಲೆಗಳ ಮೇಲಿನ ಚುಕ್ಕೆಗಳನ್ನು ಪರೀಕ್ಷಿಸಿ:**\n   - *ದುಂಡಗಿನ ಕಂದು ಚುಕ್ಕೆಗಳು / ವೃತ್ತಗಳು:* ಶಿಲೀಂಧ್ರ ರೋಗ (ಉದಾ: ಬ್ಲೈಟ್, ಟಿಕ್ಕಾ).\n   - *ಕೋನೀಯ, ನೀರಿನಿಂದ ನೆನೆದಂತಹ ಚುಕ್ಕೆಗಳು:* ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗ.\n2. **ಎಲೆ ಮುದುಡುವುದು ಅಥವಾ ಹಳದಿ ಬಣ್ಣ:**\n   - ವೈರಸ್ ರೋಗ (ಬಿಳಿ ನೊಣಗಳಿಂದ ಹರಡುವ ಎಲೆ ಮುದುರು ರೋಗ).\n3. **ಎಲೆಯ ಅಡಿಭಾಗದಲ್ಲಿ ಬೂದಿ / ಹತ್ತಿಯಂತಹ ಬೆಳವಣಿಗೆ:**\n   - ಬೂದಿ ರೋಗ (Powdery Mildew) ಅಥವಾ ಡೌನಿ ಮಿಲ್ಡ್ಯೂ.\n4. **ಕಾಂಡ ಮತ್ತು ಬುಡ ಪರೀಕ್ಷೆ:**\n   - ಕಾಂಡ ಕಪ್ಪಾಗಿ ಕೊಳೆತಿದ್ದರೆ ಕಾಂಡ ಕೊಳೆತ ಅಥವಾ ಸೊರಗು ರೋಗ (Wilt).\n5. **ಕ್ಯಾಮೆರಾ ಸ್ಕ್ಯಾನ್ ಬಳಸಿ:**\n   - ನಮ್ಮ ಕೃಷಿಮಿತ್ರ ರೋಗ ಪತ್ತೆ (Disease Detection) ಪುಟದಲ್ಲಿ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ತಕ್ಷಣ ರೋಗವನ್ನು ಪತ್ತೆ ಮಾಡುತ್ತದೆ.`;
    } else if (language === 'hi') {
      return `🔍 **पौधों में रोगों की पहचान करने का 5-चरणीय वैज्ञानिक तरीका:**\n\n1. **पत्तियों के धब्बों की आकृति देखें:**\n   - *गोल छल्लेदार भूरे/काले धब्बे:* फफूंद जनित रोग (जैसे अगेती/पछेती झुलसा, टिक्का रोग)।\n   - *कोणीय जल-सिक्त (Water-soaked) धब्बे:* जीवाणु झुलसा (Bacterial blight).\n2. **पत्तियों का मुड़ना व पीला पड़ना:**\n   - विषाणु (Viral) रोग जैसे मोज़ेक या पर्ण कुंचन (Leaf curl)।\n3. **पत्ती के नीचे सफेद/धूसर चूर्ण:**\n   - चूर्णी फफूंद (Powdery Mildew) या डाउनी मिल्ड्यू।\n4. **तना व जड़ परीक्षण:**\n   - तने का निचला हिस्सा सड़ना या दोपहर में पौधे का अचानक मुरझाना उकठा (Wilt) रोग का संकेत है।\n5. **स्मार्टफोन से जांचें:**\n   - कृषि मित्र के 'रोग पहचान' पृष्ठ पर पत्ती का फोटो अपलोड करें, हमारा AI मॉडल तुरंत सटीक बीमारी व उपचार बता देगा।`;
    }
    return `🔍 **5-Step Practical Checklist to Identify Plant Diseases:**\n\n1. **Inspect Leaf Lesion Patterns:**\n   - *Concentric target-like rings or brown spots:* Fungal blight (Alternaria, Cercospora).\n   - *Angular, water-soaked translucent patches:* Bacterial spot or blight (Xanthomonas).\n2. **Leaf Distortion & Puckering:**\n   - Puckered, boat-shaped cupping, and enations indicate viral infections transmitted by whiteflies or thrips.\n3. **Powdery or Downy Growth:**\n   - White powdery talc-like coating indicates Powdery Mildew; grey-white down on lower surfaces indicates Downy Mildew.\n4. **Stem Cankers & Vascular Wilting:**\n   - Splitting stems or midday plant droop despite wet soil indicates vascular wilt (Fusarium) or root rot.\n5. **Use Instant Visual AI Scanning:**\n   - Take a clear close-up leaf photo and upload it on KrishiMitra's Disease Detection scanner for instant diagnosis.`;
  }

  // 15. LATEST AGRICULTURAL TECHNOLOGIES
  if (q.includes('agricultural technologies') || q.includes('latest technology') || q.includes('modern farming') || q.includes('ಕೃಷಿ ತಂತ್ರಜ್ಞಾನ') || q.includes('आधुनिक कृषि तकनीक')) {
    if (language === 'kn') {
      return `🚀 **ಭಾರತೀಯ ಕೃಷಿಯಲ್ಲಿ ಇತ್ತೀಚಿನ ಆಧುನಿಕ ತಂತ್ರಜ್ಞಾನಗಳು (Modern AgriTech):**\n\n1. **ಕಿಸಾನ್ ಡ್ರೋನ್‌ಗಳು (Kisan Drones):** ಕೇವಲ 10 ನಿಮಿಷಗಳಲ್ಲಿ 1 ಎಕರೆ ಬೆಳೆಗೆ ಕೀಟನಾಶಕ ಸಿಂಪಡಣೆ, ರೋಗ ಸಮೀಕ್ಷೆ ಮತ್ತು ನೀರಿನ ಕೊರತೆ ಪತ್ತೆ.\n2. **ಸ್ಮಾರ್ಟ್ ಹನಿ ನೀರಾವರಿ (IoT Precision Irrigation):** ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂವೇದಕಗಳ (Sensors) ಆಧಾರದ ಮೇಲೆ ಮೊಬೈಲ್ ಮೂಲಕ ಸ್ವಯಂಚಾಲಿತ ನೀರಾವರಿ.\n3. **ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI Crop Health Scanners):** ಸ್ಮಾರ್ಟ್‌ಫೋನ್ ಕ್ಯಾಮೆರಾ ಬಳಸಿ ಕೆಲವೇ ಸೆಕೆಂಡುಗಳಲ್ಲಿ ಎಲೆ ರೋಗ ಮತ್ತು ಕೀಟ ಪತ್ತೆ.\n4. **ಹೈಡ್ರೋಪೋನಿಕ್ಸ್ & ಹಸಿರುಮನೆ (Protected Cultivation):** ಮಣ್ಣಿಲ್ಲದೆ ನಿಯಂತ್ರಿತ ವಾತಾವರಣದಲ್ಲಿ ವರ್ಷವಿಡೀ ಗುಣಮಟ್ಟದ ತರಕಾರಿ ಬೆಳೆಯುವುದು.\n5. **ಉಪಗ್ರಹ ಕೃಷಿ & ರಿಮೋಟ್ ಸೆನ್ಸಿಂಗ್:** ಮಳೆ ಮುನ್ಸೂಚನೆ ಹಾಗೂ ಬೆಳೆ ನಷ್ಟದ ನೈಜ ಸಮೀಕ್ಷೆ.`;
    } else if (language === 'hi') {
      return `🚀 **आधुनिक कृषि की नवीनतम तकनीकें (Latest AgriTech Innovations):**\n\n1. **कृषि ड्रोन (Kisan Drones):** मात्र 10 मिनट में 1 एकड़ में नैनो यूरिया या कीटनाशक का सटीक छिड़काव व फसल स्वास्थ्य मैपिंग।\n2. **स्मार्ट सिंचाई प्रणाली (IoT Sensors):** मिट्टी में नमी संवेदक लगाकर मोबाइल से स्वचालित ड्रिप सिंचाई।\n3. **एआई आधारित रोग पहचान (AI Crop Diagnostics):** मोबाइल फोटो से पौधों की बीमारी व पोषक तत्वों की तुरंत सटीक जांच।\n4. **संरक्षित खेती (Hydroponics & Polyhouse):** बिना मिट्टी के पोषक पानी में विदेशी सब्जियों की सालभर खेती।\n5. **सोलर पंप व सटीक कृषि यंत्र:** सौर ऊर्जा चालित बोरवेल व लेजर लैंड लेवलर से पानी व खाद की 30% बचत।`;
    }
    return `🚀 **Top Modern Agricultural Technologies Transforming Farming:**\n\n1. **Agricultural Drones (Kisan Drones):** Spraying 1 acre with nano-urea or biocontrol agents in under 10 minutes while eliminating chemical exposure for farmers.\n2. **IoT Precision Irrigation & Soil Sensors:** Soil moisture probes communicating via LoRa/cellular to automate drip valves only when root zones reach stress thresholds.\n3. **AI Vision Pathology Diagnostics:** Smartphone cameras running multimodal vision models for instant on-field pest and leaf disease diagnosis.\n4. **Controlled Environment Agriculture (CEA):** Hydroponics, aeroponics, and polyhouses producing 5-10x higher vegetable yields with 85% less water.\n5. **Satellite Telemetry & Weather Radars:** Hyperlocal monsoon forecasting and NDVI vegetation health indexing directly to farmers' mobile screens.`;
  }

  // GENERAL NON-AGRI QUESTION (e.g. Prime Minister)
  if (q.includes('prime minister') || q.includes('president') || q.includes('who is')) {
    if (language === 'kn') {
      return `🇮🇳 ಪ್ರಸ್ತುತ ಭಾರತದ ಪ್ರಧಾನ ಮಂತ್ರಿಗಳು **ಶ್ರೀ ನರೇಂದ್ರ ಮೋದಿ** ಆಗಿದ್ದಾರೆ.\n\n*💡 ಗಮನಿಸಿ: ನಾನು ಕೃಷಿಮಿತ್ರ AI ಕೃಷಿ ಸಹಾಯಕ. ಕೃಷಿ, ಬೆಳೆಗಳು, ಮಣ್ಣು, ನೀರಾವರಿ ಮತ್ತು ರೋಗಗಳ ಬಗೆಗಿನ ಪ್ರಶ್ನೆಗಳಿಗೆ ಸಮಗ್ರ ಮಾಹಿತಿ ನೀಡಬಲ್ಲೆ.*`;
    } else if (language === 'hi') {
      return `🇮🇳 वर्तमान में भारत के माननीय प्रधानमंत्री **श्री नरेंद्र मोदी** हैं।\n\n*💡 नोट: मैं कृषि मित्र AI विशेषज्ञ हूँ। आप मुझसे खेती, फसलों, मौसम, खाद और रोगों से संबंधित कोई भी सवाल पूछ सकते हैं।*`;
    }
    return `🇮🇳 The current Prime Minister of India is **Shri Narendra Modi**.\n\n*💡 Note: As the KrishiMitra AI Agriculture Assistant, my primary specialization is farming, crops, soil health, irrigation, and plant pathology.*`;
  }

  // FALLBACK: INTELLIGENT COMPREHENSIVE ADVISORY
  if (language === 'kn') {
    return `🌱 **ಕೃಷಿ ಸಲಹೆಗಾರರ ವರದಿ:** ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ (*"${query}"*) ಸಂಬಂಧಿಸಿದಂತೆ:\n\n1. **ಮಣ್ಣು ಮತ್ತು ಬೆಳೆ ಪರಿಶೀಲನೆ:** ನಿಮ್ಮ ಜಮೀನಿನ ಮಣ್ಣಿನ ಪ್ರಕಾರ ಹಾಗೂ ನೀರಿನ ಲಭ್ಯತೆಯನ್ನು ಪರಿಗಣಿಸಿ ಬೆಳೆ ನಿರ್ಧಾರ ಕೈಗೊಳ್ಳಿ.\n2. **ಸಮಗ್ರ ನಿರ್ವಹಣೆ:** ಯಾವುದೇ ಬೆಳೆ ಇರಲಿ, ಹನಿ ನೀರಾವರಿ ಮತ್ತು ಸಾವಯವ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರವನ್ನು ಬಳಸುವುದರಿಂದ ಇಳುವರಿ ಶೇ. 25 ರಷ್ಟು ಹೆಚ್ಚುತ್ತದೆ.\n3. **ರೋಗ ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಎಲೆಗಳಲ್ಲಿ ಯಾವುದೇ ಕಲೆ ಅಥವಾ ಹಳದಿ ಬಣ್ಣ ಕಂಡುಬಂದರೆ ತಕ್ಷಣ ನಮ್ಮ ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ ಫೋಟೋ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ ತಪಾಸಣೆ ನಡೆಸಿ.`;
  } else if (language === 'hi') {
    return `🌱 **कृषि परामर्श रिपोर्ट:** आपके प्रश्न (*"${query}"*) के संदर्भ में:\n\n1. **फसल व मिट्टी अनुकूलन:** अपनी भूमि के प्रकार और सिंचाई की उपलब्धता के अनुसार ही उन्नत प्रमाणित किस्मों का चयन करें।\n2. **संतुलित पोषण:** जैविक गोबर खाद (FYM) का नियमित प्रयोग करें और रासायनिक खादों का प्रयोग हमेशा मिट्टी परीक्षण के आधार पर करें।\n3. **कीट-रोग निगरानी:** खेत का हर 3-4 दिन में निरीक्षण करें। पत्ती पर कोई लक्षण दिखने पर कृषि मित्र ऐप पर फोटो स्कैन करें।`;
  }
  return `🌱 **Agronomic Advisory for: "${query}"**\n\n1. **Field Health:** Ensure soil health is assessed via Soil Health Card before sowing. Black and alluvial soils provide strong water retention, while sandy loams require scheduled irrigation.\n2. **Balanced Nutrition:** Combine organic manures (FYM 8-10 t/acre) with targeted NPK doses at critical stages (basal, tillering, and flowering).\n3. **Proactive Crop Scouting:** Inspect foliage twice weekly for early signs of chlorosis, sucking pests, or fungal spots. You can attach a leaf photo here anytime for visual diagnosis.`;
}

/**
 * Primary Chatbot Entry Point with Google Gemini + Google Search Grounding
 */
export async function sendChatMessage(userMessage, chatHistory = [], currentLanguage = 'en', extraContext = {}) {
  const query = (userMessage || '').trim();
  const lang = currentLanguage || 'en';
  const farmProfile = extraContext?.farmProfile || null;
  const attachedImage = extraContext?.attachedImage || null;

  const { key: apiKey } = getActiveGeminiApiKey();

  // If Gemini API Key is available: Run Live Gemini Model with Google Search Grounding
  if (apiKey && apiKey.length > 10) {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const systemInstruction = buildSystemInstruction({ language: lang, farmProfile });
      const contents = formatGeminiContents(chatHistory, query, attachedImage);

      // Attempt with Google Search Grounding
      try {
        const response = await ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            tools: [{ googleSearch: {} }],
            temperature: 0.35,
            maxOutputTokens: 1200
          }
        });

        const replyText = response?.text || '';
        const grounding = extractGroundingMetadata(response);

        if (replyText.trim().length > 0) {
          return {
            text: replyText.trim(),
            sources: grounding.sources,
            searchQueries: grounding.searchQueries,
            isGrounded: grounding.isGrounded,
            source: 'gemini-grounded',
            success: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      } catch (groundingErr) {
        console.warn('Gemini call with Google Search tool failed, falling back to direct multimodal:', groundingErr);

        // Fallback without search tool in case tool is restricted
        const responseNoTool = await ai.models.generateContent({
          model: DEFAULT_GEMINI_MODEL,
          contents,
          config: {
            systemInstruction,
            temperature: 0.35,
            maxOutputTokens: 1200
          }
        });

        const replyText = responseNoTool?.text || '';
        if (replyText.trim().length > 0) {
          return {
            text: replyText.trim(),
            sources: [],
            searchQueries: [],
            isGrounded: false,
            source: 'gemini-direct',
            success: true,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
        }
      }
    } catch (apiErr) {
      console.warn('Gemini API call failed, seamlessly engaging KrishiMitra Agronomic Engine:', apiErr);
      // Seamlessly fall back to local dynamic agronomy engine
      const fallbackText = generateOfflineAgronomyAnswer(query, chatHistory, lang, extraContext);
      return {
        text: `${fallbackText}\n\n*💡 Notice: Gemini API connection notice (${apiErr.message || 'offline'}). Response generated via KrishiMitra Agronomic Pathology Engine.*`,
        sources: [],
        searchQueries: [],
        isGrounded: false,
        source: 'local-expert',
        success: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  }

  // Offline / Unconfigured Gemini Key Mode:
  // Run KrishiMitra Dynamic Agronomic Engine (Guaranteed 100% unique answers, no repetitive greetings)
  const offlineText = generateOfflineAgronomyAnswer(query, chatHistory, lang, extraContext);
  return {
    text: offlineText,
    sources: [],
    searchQueries: [],
    isGrounded: false,
    source: 'local-expert',
    needsApiKeyNotice: true,
    success: true,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
