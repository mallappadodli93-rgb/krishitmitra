import { callChatbotAPI } from './apiClient.js';
import {
  CROP_KNOWLEDGE_LIBRARY,
  SOIL_KNOWLEDGE,
  PLANT_PROBLEMS_KNOWLEDGE
} from './aiChatKnowledge.js';

/**
 * KrishiMitra Intelligent AI Farming Assistant Service
 * 
 * Features:
 * 1. Natural language understanding across 20+ agricultural domains.
 * 2. Conversational Memory: Tracks context, entities, and resolves follow-up pronouns ("it", "this crop").
 * 3. Personalized Advice: Pulls saved farm location, soil type, and land area from farmer profile.
 * 4. Weather-aware advisory: Informs spraying feasibility and heavy rain precautions.
 * 5. Multilingual generation: Full support for Kannada (kn), English (en), and Hindi (hi) with auto script detection.
 * 6. Dual-Mode Architecture: Queries live FastAPI `/ai/chatbot` backend; falls back to comprehensive local agronomy engine.
 */

// Helper to detect language script from text
export function detectLanguageFromText(text) {
  if (!text) return null;
  // Kannada Unicode block: \u0C80 - \u0CFF
  if (/[\u0C80-\u0CFF]/.test(text)) return 'kn';
  // Devanagari / Hindi Unicode block: \u0900 - \u097F
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  return null;
}

/**
 * Extract context entity (crop, soil, etc.) from previous conversation messages
 */
function resolveConversationContext(userMessage, chatHistory = []) {
  let contextCrop = null;
  let contextSoil = null;

  // Scan recent history in reverse
  for (let i = chatHistory.length - 1; i >= 0; i--) {
    const msg = chatHistory[i];
    const text = (msg.text || '').toLowerCase();

    if (!contextCrop) {
      if (text.includes('tomato') || text.includes('ಟೊಮೆಟೊ') || text.includes('टमाटर')) contextCrop = 'tomato';
      else if (text.includes('cotton') || text.includes('ಹತ್ತಿ') || text.includes('कपास')) contextCrop = 'cotton';
      else if (text.includes('rice') || text.includes('paddy') || text.includes('ಭತ್ತ') || text.includes('धान')) contextCrop = 'rice';
      else if (text.includes('wheat') || text.includes('ಗೋಧಿ') || text.includes('गेहूं')) contextCrop = 'wheat';
      else if (text.includes('maize') || text.includes('corn') || text.includes('ಮೆಕ್ಕೆಜೋಳ') || text.includes('मक्का')) contextCrop = 'maize';
      else if (text.includes('chilli') || text.includes('pepper') || text.includes('ಮೆಣಸಿನಕಾಯಿ') || text.includes('मिर्च')) contextCrop = 'chilli';
      else if (text.includes('potato') || text.includes('ಆಲೂಗಡ್ಡೆ') || text.includes('आलू')) contextCrop = 'potato';
      else if (text.includes('soybean') || text.includes('ಸೋಯಾಬೀನ್') || text.includes('सोयाबीन')) contextCrop = 'soybean';
      else if (text.includes('groundnut') || text.includes('peanut') || text.includes('ಕಡಲೆಕಾಯಿ') || text.includes('मूंगफली')) contextCrop = 'groundnut';
      else if (text.includes('onion') || text.includes('ಈರುಳ್ಳಿ') || text.includes('प्याज')) contextCrop = 'onion';
      else if (text.includes('chickpea') || text.includes('gram') || text.includes('ಕಡಲೆ') || text.includes('चना')) contextCrop = 'chickpea';
    }

    if (!contextSoil) {
      if (text.includes('black soil') || text.includes('ಕರಿ ಮಣ್ಣು') || text.includes('काली मिट्टी') || text.includes('regur') || text.includes('vertisol')) {
        contextSoil = 'black_soil';
      } else if (text.includes('red soil') || text.includes('ಕೆಂಪು ಮಣ್ಣು') || text.includes('लाल मिट्टी')) {
        contextSoil = 'red_soil';
      } else if (text.includes('alluvial') || text.includes('ಮೆಕ್ಕಲು') || text.includes('जलोढ़')) {
        contextSoil = 'alluvial_soil';
      }
    }

    if (contextCrop && contextSoil) break;
  }

  return { contextCrop, contextSoil };
}

/**
 * Core Local Agricultural Intelligence Generator
 */
export function generateLocalAgronomyResponse(userMessage, chatHistory = [], currentLanguage = 'kn', extraContext = {}) {
  // Determine language: prioritize detected script, then parameter, then localStorage
  const scriptLang = detectLanguageFromText(userMessage);
  const lang = scriptLang || currentLanguage || 'kn';

  const clean = userMessage.trim().toLowerCase();
  const { contextCrop, contextSoil } = resolveConversationContext(userMessage, chatHistory);

  // Check pronouns indicating follow-up questions ("it", "this crop", "that", "ಅದಕ್ಕೆ", "ಇದಕ್ಕೆ", "इसे", "इसको")
  const isFollowUp = (
    clean.includes(' it ') ||
    clean.endsWith(' it?') ||
    clean.endsWith(' it') ||
    clean.includes('this crop') ||
    clean.includes('for this') ||
    clean.includes('ಅದಕ್ಕೆ') ||
    clean.includes('ಇದಕ್ಕೆ') ||
    clean.includes('ಇದರ') ||
    clean.includes('ಅದರ') ||
    clean.includes('इसे') ||
    clean.includes('इसको') ||
    clean.includes('इसके लिए')
  );

  // Profile-based personalization
  const farmProfile = extraContext.farmProfile || {};
  const farmLocation = farmProfile.village ? `${farmProfile.village}, ${farmProfile.district}` : (extraContext.savedLocationName || null);
  const farmSoil = farmProfile.soilType || extraContext.savedSoil || null;
  const farmWater = farmProfile.waterSource || null;

  // -------------------------------------------------------------
  // 1. SPECIFIC QUESTION: Black Soil (Suitable Crops & Management)
  // -------------------------------------------------------------
  if (
    (clean.includes('black soil') || clean.includes('ಕರಿ ಮಣ್ಣು') || clean.includes('काली मिट्टी') || clean.includes('regur') || clean.includes('vertisol')) &&
    (clean.includes('crop') || clean.includes('grow') || clean.includes('suitable') || clean.includes('ಬೆಳೆ') || clean.includes('ಸೂಕ್ತ') || clean.includes('फसल') || clean.includes('ಉತ್ತಮ'))
  ) {
    if (lang === 'kn') {
      return `🌱 **ಕರಿ ಮಣ್ಣಿಗೆ (Black Cotton Soil) ಅತ್ಯಂತ ಸೂಕ್ತವಾದ ಬೆಳೆಗಳು:**

ಕರಿ ಮಣ್ಣು ಹೆಚ್ಚಿನ ಜೇಡಿ ಅಂಶವನ್ನು (Clay) ಹೊಂದಿದ್ದು, ದೀರ್ಘಕಾಲ ತೇವಾಂಶವನ್ನು ಹಿಡಿದಿಟ್ಟುಕೊಳ್ಳುವ ಅಸಾಧಾರಣ ಸಾಮರ್ಥ್ಯ ಹೊಂದಿದೆ. ಇದು ಮಳೆಗಾಲ ಮತ್ತು ಹಿಂಗಾರು ಎರಡೂ ಹಂಗಾಮುಗಳಿಗೆ ಅತ್ಯುತ್ತಮವಾಗಿದೆ.

1. **ವಾಣಿಜ್ಯ ಮತ್ತು ಮುಖ್ಯ ಬೆಳೆಗಳು:**
   - **ಹತ್ತಿ (Cotton):** ಕರಿ ಮಣ್ಣು ಹತ್ತಿಯ ಬೇರುಗಳಿಗೆ ನೈಸರ್ಗಿಕ ತೇವಾಂಶ ಒದಗಿಸುತ್ತದೆ.
   - **ಸೋಯಾಬೀನ್ (Soybean):** ಮುಂಗಾರು ಹಂಗಾಮಿಗೆ ಅತಿ ಹೆಚ್ಚು ಇಳುವರಿ ನೀಡುವ ಬೆಳೆ.
   - **ಕಬ್ಬು (Sugarcane):** ನೀರಾವರಿ ಲಭ್ಯವಿದ್ದಲ್ಲಿ ಅತ್ಯಧಿಕ ಟನ್ ಇಳುವರಿ.

2. **ಹಿಂಗಾರು (ರಬಿ) ಧಾನ್ಯ ಮತ್ತು ದ್ವಿದಳ ಧಾನ್ಯಗಳು:**
   - **ಕಡಲೆ (Chickpea / Bengal Gram):** ಕೇವಲ 1-2 ನೀರಿನೊಂದಿಗೆ ಕರಿ ಮಣ್ಣಿನಲ್ಲಿ ಭರ್ಜರಿ ಇಳುವರಿ.
   - **ಹಿಂಗಾರು ಜೋಳ (Rabi Sorghum / Jowar):** ತೇವಾಂಶದ ಕೊರತೆಯಲ್ಲೂ ಗಟ್ಟಿಯಾಗಿ ಬೆಳೆಯುತ್ತದೆ.
   - **ಗೋಧಿ (Wheat):** ನೀರಾವರಿ ಸೌಲಭ್ಯವಿದ್ದರೆ HD-3086 ತಳಿ ಅತ್ಯುತ್ತಮ.

3. **ಪ್ರಮುಖ ನಿರ್ವಹಣಾ ಸಲಹೆಗಳು:**
   - ಕರಿ ಮಣ್ಣು ಒಣಗಿದಾಗ ಬಿರುಕು ಬಿಡುವುದರಿಂದ, ಆಳವಾದ ಬೇಸಿಗೆ ಉಳುಮೆ ಮಾಡುವುದರಿಂದ ಕೀಟಗಳ ಕೋಶಗಳು ನಾಶವಾಗುತ್ತವೆ.
   - ಮಳೆಗಾಲದಲ್ಲಿ ನೀರು ನಿಲ್ಲದಂತೆ ಜಮೀನಿನಲ್ಲಿ ಬಸಿಗಾಲುವೆ (Drainage Furrow) ನಿರ್ಮಿಸಿ.

*💡 ಮುಂದಿನ ಪ್ರಶ್ನೆ: ನಿಮಗೆ ಇವುಗಳಲ್ಲಿ ಯಾವುದಾದರೂ ನಿರ್ದಿಷ್ಟ ಬೆಳೆಯ ರಸಗೊಬ್ಬರ ಅಥವಾ ನೀರಿನ ವೇಳಾಪಟ್ಟಿ ತಿಳಿಯಬೇಕೇ?*`;
    }

    if (lang === 'hi') {
      return `🌱 **काली मिट्टी (Black Cotton Soil / रेगुर) के लिए सर्वोत्तम फसलें:**

काली मिट्टी में जल धारण करने की अद्भुत क्षमता होती है और यह कैल्शियम, मैग्नीशियम और पोटाश से भरपूर होती है।

1. **प्रमुख वाणिज्यिक फसलें:**
   - **कपास (Cotton):** काली मिट्टी को 'ब्लैक कॉटन सॉइल' ही कहा जाता है क्योंकि यह कपास के लिए सर्वोत्तम है।
   - **सोयाबीन (Soybean):** खरीफ मौसम में जल-निकासी की अच्छी व्यवस्था के साथ बंपर उत्पादन।
   - **गन्ना (Sugarcane):** सुनिश्चित सिंचाई वाले क्षेत्रों में अत्यधिक लाभकारी।

2. **रबी (सर्दियों) की दलहनी व खाद्यान्न फसलें:**
   - **चना (Chickpea):** बची हुई नमी में न्यूनतम पानी से पकने वाली सर्वोत्तम फसल।
   - **रबी ज्वार (Sorghum) व गेहूं (Wheat):** सिंचित क्षेत्रों में गेहूं की HD-3086 या GW-322 किस्म।
   - **सूरजमुखी व अलसी:** कम लागत में अच्छा मुनाफा।

3. **महत्वपूर्ण प्रबंधन सुझाव:**
   - बारिश में खेत में जलभराव न होने दें; चौड़ी क्यारी एवं कुंड (BBF) पद्धति अपनाएं।
   - गर्मियों में गहरी जुताई करें जिससे मिट्टी की दरारों में छिपे हानिकारक कीट नष्ट हो जाएं।

*💡 आप इस मिट्टी में इनमें से किस फसल की बुवाई की योजना बना रहे हैं?*`;
    }

    return `🌱 **Top Suitable Crops for Black Soil (Regur / Vertisol):**

Black soil is characterized by high clay content (40-60%) and outstanding moisture retention capacity, making it exceptionally fertile for both rainfed and irrigated farming.

1. **Commercial & Cash Crops:**
   - **Cotton:** The quintessential crop for deep black soils; deep taproots access moisture stored in subsoil.
   - **Soybean:** High-yielding Kharif legume providing natural nitrogen fixation.
   - **Sugarcane:** Thrives with regular drip or furrow irrigation in medium to deep black soils.

2. **Rabi (Winter) Pulses & Cereals:**
   - **Chickpea (Bengal Gram):** Highly drought-tolerant; thrives on residual black soil moisture with just 1-2 light irrigations.
   - **Rabi Sorghum (Jowar):** Excellent drought resistance and staple fodder value.
   - **Wheat:** Varieties like HD-3086 or GW-322 under 4-5 scheduled irrigations.
   - **Sunflower & Safflower:** Deep roots utilize deep soil moisture reserves.

3. **Crucial Soil Management Tips:**
   - Practice Broad Bed and Furrow (BBF) sowing during heavy monsoons to prevent root asphyxiation.
   - Carry out deep summer plowing to expose resting soil pests and aerate the clay layers.

*💡 Follow-up: Would you like the complete fertilizer dosage or irrigation schedule for any of these crops?*`;
  }

  // -------------------------------------------------------------
  // 2. SPECIFIC QUESTION: How to grow tomatoes?
  // -------------------------------------------------------------
  if (
    clean.includes('tomato') ||
    clean.includes('ಟೊಮೆಟೊ') ||
    clean.includes('टमाटर')
  ) {
    if (clean.includes('grow') || clean.includes('cultivat') || clean.includes('how to') || clean.includes('ಬೆಳೆಯು') || clean.includes('ಹೇಗೆ') || clean.includes('ಉಗಾ') || clean.includes('खेती')) {
      if (lang === 'kn') {
        return `🍅 **ಟೊಮೆಟೊ ವೈಜ್ಞಾನಿಕ ಬೇಸಾಯ ಕ್ರಮಗಳು (ಹಂತ-ಹಂತದ ಮಾರ್ಗದರ್ಶಿ):**

1. **ಮಣ್ಣು ಮತ್ತು ಹವಾಗುಣ:**
   - ಚೆನ್ನಾಗಿ ಬಸಿದುಹೋಗುವ ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು ಅಥವಾ ಕೆಂಪು ಮಣ್ಣು (pH 6.0 - 7.0) ಅತ್ಯುತ್ತಮ.
   - 21°C ನಿಂದ 28°C ತಾಪಮಾನವು ಹೂ ಮತ್ತು ಕಾಯಿ ಕಟ್ಟಲು ಸೂಕ್ತ.

2. **ಸಸಿ ಮಡಿ ಮತ್ತು ನಾಟಿ:**
   - ಬೀಜೋಪಚಾರ: 1 ಕೆಜಿ ಬೀಜಕ್ಕೆ 4 ಗ್ರಾಂ ಟ್ರೈಕೋಡರ್ಮಾ ಅಥವಾ 2 ಗ್ರಾಂ ಕಾರ್ಬೆಂಡಾಜಿಮ್ ಬೆರೆಸಿ ಸಸಿ ಮಡಿಯಲ್ಲಿ ಬಿತ್ತಿ.
   - 25 ರಿಂದ 30 ದಿನಗಳ ಬಲಿತ ಸಸಿಗಳನ್ನು ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ **60 ಸೆಂ.ಮೀ** ಮತ್ತು ಗಿಡದಿಂದ ಗಿಡಕ್ಕೆ **45-60 ಸೆಂ.ಮೀ** ಅಂತರದಲ್ಲಿ ನಾಟಿ ಮಾಡಿ.

3. **ಪೋಷಕಾಂಶ & ರಸಗೊಬ್ಬರ (ಎಕರೆಗೆ):**
   - ನಾಟಿಯ ವೇಳೆ: 10 ಟನ್ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ + 50 ಕೆಜಿ DAP + 30 ಕೆಜಿ MOP (ಪೊಟ್ಯಾಷ್).
   - ನಾಟಿ ಮಾಡಿದ 25 ಮತ್ತು 45 ದಿನಗಳಲ್ಲಿ: 25 ಕೆಜಿ ಯೂರಿಯಾ ಮೇಲುಗೊಬ್ಬರವಾಗಿ ನೀಡಿ.
   - ಕಾಯಿ ಬಿರಿಯುವುದನ್ನು ತಡೆಯಲು: ಹೂ ಬಿಡುವಾಗ ಬೋರಾನ್ (1 ಗ್ರಾಂ/ಲೀ) ಮತ್ತು ಕ್ಯಾಲ್ಸಿಯಂ ನೈಟ್ರೇಟ್ (2 ಗ್ರಾಂ/ಲೀ) ಸಿಂಪಡಿಸಿ.

4. **ಆಧಾರ ನೀಡುವುದು (Staking):**
   - ಹೈಬ್ರಿಡ್ ಗಿಡಗಳಿಗೆ ಬಿದಿರಿನ ಕಡ್ಡಿ ಅಥವಾ ತಂತಿ ಕಟ್ಟಿ ಆಧಾರ ಕೊಡಿ; ಇದರಿಂದ ಕಾಯಿಗಳು ನೆಲಕ್ಕೆ ತಾಗದೆ ಕೊಳೆಯುವುದು ತಪ್ಪುತ್ತದೆ ಮತ್ತು 35% ಇಳುವರಿ ಹೆಚ್ಚುತ್ತದೆ.

5. **ಪ್ರಮುಖ ಕೀಟ-ರೋಗ ನಿಯಂತ್ರಣ:**
   - ಎಲೆ ಕರಕಲು ರೋಗಕ್ಕೆ: *ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP* 2.5 ಗ್ರಾಂ/ಲೀಟರ್ ಸಿಂಪಡಿಸಿ.
   - ಹಣ್ಣು ಕೊರೆಯುವ ಹುಳುಗೆ: ಲ್ಯೂರೆನ್ (ಫೆರೋಮೋನ್) ಬಲೆಗಳನ್ನು ಅಳವಡಿಸಿ.`;
      }

      if (lang === 'hi') {
        return `🍅 **टमाटर की उन्नत व वैज्ञानिक खेती (कदम-दर-कदम गाइड):**

1. **भूमि व जलवायु:**
   - अच्छी जल निकासी वाली बलुई दोमट या मध्यम काली मिट्टी (pH 6.0 - 7.0)।
   - 20°C से 28°C तापमान फलों के विकास व अच्छे लाल रंग के लिए आदर्श है।

2. **नर्सरी व रोपाई:**
   - बीजोपचार: बीज को *ट्राइकोडर्मा (5g/kg)* से उपचारित करके नर्सरी तैयार करें।
   - 25-30 दिन पुराने स्वस्थ पौधों की शाम के समय रोपाई करें। कतार से कतार की दूरी **60 सेमी** और पौधे से पौधा **45 सेमी** रखें।

3. **खाद एवं उर्वरक प्रबंधन (प्रति एकड़):**
   - बेसल खुराक: 8-10 टन सड़ी गोबर खाद + 50 किग्रा DAP + 35 किग्रा पोटाश (MOP)।
   - टॉप ड्रेसिंग: रोपाई के 25 और 50 दिन बाद 25-25 किग्रा यूरिया सिंचाई के साथ दें।
   - फल फटने से रोकने हेतु: फूल आते समय बोरॉन (1g/L) और कैल्शियम नाइट्रेट (2g/L) का पर्णीय छिड़काव करें।

4. **स्टेकिंग (सहारा देना):**
   - संकर किस्मों को बांस व सुतली का सहारा देकर ऊपर चढ़ाएं। इससे फल जमीन से दूर रहकर सड़न से बचते हैं और 30% अधिक पैदावार मिलती है।

5. **रोग व कीट नियंत्रण:**
   - अगेती/पछेती झुलसा: *मैंकोजेब 75% WP (2.5 ग्राम/लीटर)* का छिड़काव करें।
   - फल छेदक कीट: फेरोमोन ट्रैप लगाएं और नीम का तेल (1500 ppm @ 5ml/L) छिड़कें।`;
      }

      return `🍅 **Scientific Tomato Cultivation Guide (Step-by-Step):**

1. **Soil & Climate:**
   - Deep, well-drained sandy loam or red loam soils rich in organic matter (pH 6.0 - 7.0).
   - Optimum temperature range: 21°C to 28°C. Extreme heat above 35°C triggers blossom drop.

2. **Nursery & Field Transplanting:**
   - Seed treatment: Treat 1 kg seed with 5g *Trichoderma viride* or 2g Thiram before nursery sowing.
   - Transplant 25 to 30-day-old vigorous seedlings at **60 cm row-to-row** and **45-50 cm plant-to-plant** spacing during late evening hours.

3. **Balanced Fertilization (per Acre):**
   - Basal Application: 8-10 tons FYM + 50 kg DAP + 35 kg MOP (Potash) incorporated during field prep.
   - Top Dressing: Split 40 kg Nitrogen (Urea) into two equal doses at 25 and 50 days after transplanting.
   - Micronutrients: Spray Calcium Nitrate (2g/L) + Boron (1g/L) during early fruit set to eliminate Blossom End Rot and fruit cracking.

4. **Staking & Pruning:**
   - Provide bamboo or wire trellising to indeterminate varieties. Keeping fruits elevated above wet soil reduces soil-borne rot by over 30%.

5. **Crop Protection:**
   - Early Blight (target board leaf spots): Spray Mancozeb 75% WP @ 2.5g/L.
   - Fruit Borer: Install 6-8 pheromone traps per acre; spray Emamectin Benzoate 5% SG @ 0.4g/L.`;
    }
  }

  // -------------------------------------------------------------
  // 3. SPECIFIC QUESTION: What causes yellow leaves?
  // -------------------------------------------------------------
  if (
    clean.includes('yellow leaf') ||
    clean.includes('yellow leaves') ||
    clean.includes('yellowing') ||
    clean.includes('ಹಳದಿ ಎಲೆ') ||
    clean.includes('ಎಲೆ ಹಳದಿ') ||
    clean.includes('पीली पत्ती') ||
    clean.includes('पत्तियां पीली') ||
    clean.includes('पीलापन')
  ) {
    if (lang === 'kn') {
      return `🍂 **ಸಸ್ಯಗಳ ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಮುಖ್ಯ ಕಾರಣಗಳು ಮತ್ತು ತಕ್ಷಣದ ಪರಿಹಾರಗಳು:**

ಎಲೆಗಳು ಹಳದಿಯಾಗುವುದನ್ನು (Chlorosis) ಅವುಗಳ ಲಕ್ಷಣಗಳ ಆಧಾರದ ಮೇಲೆ ನಿಖರವಾಗಿ ಗುರುತಿಸಬಹುದು:

1. **ಸಾರಜನಕ (Nitrogen) ಕೊರತೆ — [ಅತ್ಯಂತ ಸಾಮಾನ್ಯ]:**
   - **ಲಕ್ಷಣ:** ಗಿಡದ ಕೆಳಗಿನ ಹಳೆಯ ಎಲೆಗಳು ಮೊದಲು ಸಂಪೂರ್ಣವಾಗಿ ತಿಳಿ ಹಳದಿ ಬಣ್ಣಕ್ಕೆ ತಿರುಗುತ್ತವೆ.
   - **ಪರಿಹಾರ:** ನೀರಾವರಿಯೊಂದಿಗೆ ಎಕರೆಗೆ 20-25 ಕೆಜಿ ಯೂರಿಯಾ ಹಾಕಿ, ಅಥವಾ 1% ಯೂರಿಯಾ (10 ಗ್ರಾಂ/ಲೀಟರ್ ನೀರು) ದ್ರಾವಣವನ್ನು ಸಿಂಪಡಿಸಿ.

2. **ನೀರು ನಿಲ್ಲುವುದು / ಬೇರು ಉಸಿರುಗಟ್ಟುವುದು (Waterlogging):**
   - **ಲಕ್ಷಣ:** ಅತಿಯಾದ ನೀರು ಅಥವಾ ಮಳೆಯಿಂದ ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಂತು ಎಲೆಗಳು ಜೋತುಬಿದ್ದು ಹಳದಿಯಾಗುತ್ತವೆ.
   - **ಪರಿಹಾರ:** ತಕ್ಷಣ ಜಮೀನಿನಲ್ಲಿ ಬಸಿಗಾಲುವೆಗಳನ್ನು ತೆರೆದು ನೀರು ಹೊರಹಾಕಿ; ಮಣ್ಣು ಒಣಗುವವರೆಗೆ ನೀರು ಹಾಯಿಸಬೇಡಿ.

3. **ಜಿಂಕ್ (Zinc) ಅಥವಾ ಕಬ್ಬಿನಾಂಶದ (Iron) ಲಘು ಪೋಷಕಾಂಶಗಳ ಕೊರತೆ:**
   - **ಲಕ್ಷಣ:** ಗಿಡದ ತುದಿಯ ಎಳೆಯ ಎಲೆಗಳ ನರಗಳು ಹಸಿರಾಗಿದ್ದು, ನರಗಳ ನಡುವಿನ ಭಾಗ ಹಳದಿಯಾಗುತ್ತದೆ.
   - **ಪರಿಹಾರ:** 0.5% ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (5 ಗ್ರಾಂ/ಲೀ) + 0.25% ಸುಣ್ಣದ ತಿಳಿನೀರು ಬೆರೆಸಿ ಬೆಳಿಗ್ಗೆ ಸಿಂಪಡಿಸಿ.

4. **ರಸ ಹೀರುವ ಕೀಟಗಳು & ವೈರಸ್ ರೋಗ (Whitefly / Mosaic Virus):**
   - **ಲಕ್ಷಣ:** ಎಲೆಗಳ ಮೇಲೆ ಹಳದಿ ಚುಕ್ಕೆಗಳು, ಎಲೆ ಮುದುಡುವುದು ಮತ್ತು ಗಿಡದ ಬೆಳವಣಿಗೆ ಕುಂಠಿತವಾಗುವುದು.
   - **ಪರಿಹಾರ:** ಹಳದಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಹಾಕಿ; 5 ಮಿಲಿ ಬೇವಿನ ಎಣ್ಣೆ (1500 ppm) ಪ್ರತಿ ಲೀಟರ್ ನೀರಿಗೆ ಬೆರೆಸಿ ಸಿಂಪಡಿಸಿ.

*💡 ನಿಮ್ಮ ಗಿಡದಲ್ಲಿ ಹಳದಿ ಬಣ್ಣ ಕೆಳಗಿನ ಹಳೆಯ ಎಲೆಯಲ್ಲಿದೆಯೇ ಅಥವಾ ಮೇಲಿನ ಎಳೆಯ ಎಲೆಯಲ್ಲಿದೆಯೇ? ದಯವಿಟ್ಟು ತಿಳಿಸಿ.*`;
    }

    if (lang === 'hi') {
      return `🍂 **फसलों में पत्तियां पीली पड़ने के प्रमुख कारण व सटीक उपचार:**

पत्तियों का पीलापन (क्लोरोसिस) किस भाग में है, इससे सही कारण पहचाना जा सकता है:

1. **नाइट्रोजन की कमी (Nitrogen Deficiency):**
   - **पहचान:** पौधे की निचली व पुरानी पत्तियां पहले पूरी तरह से पीली पड़ती हैं और धीरे-धीरे ऊपर फैलती हैं।
   - **उपचार:** सिंचाई के साथ यूरिया की टॉप ड्रेसिंग करें या 1.5% यूरिया (15 ग्राम/लीटर) का पर्णीय छिड़काव करें।

2. **खेत में जलभराव या अधिक सिंचाई (Waterlogging):**
   - **पहचान:** भारी बारिश या अधिक पानी से जड़ें सांस नहीं ले पातीं और पत्तियां मुरझाकर पीली हो जाती हैं।
   - **उपचार:** खेत से तत्काल अतिरिक्त पानी की निकासी करें; मिट्टी में वायु संचार होने दें।

3. **जिंक या लोहे (Iron) की कमी:**
   - **पहचान:** ऊपरी नई पत्तियों की नसें हरी रहती हैं और नसों के बीच का भाग पीला हो जाता है (Interveinal Chlorosis)।
   - **उपचार:** 0.5% जिंक सल्फेट (5 ग्राम) + 2.5 ग्राम बुझा चूना प्रति लीटर पानी में मिलाकर सुबह छिड़कें।

4. **रस चूसक कीट व पीला मोज़ेक वायरस (Whitefly / Virus):**
   - **पहचान:** पत्तियों पर पीले धब्बे, ऊपर की ओर सिकुड़न और निचली सतह पर सफेद मक्खी का प्रकोप।
   - **उपचार:** पीले स्टिकी ट्रैप लगाएं और नीम का तेल (1500 ppm @ 5ml/L) या फ्लोनिकामिड 50% WG (0.4g/L) का छिड़काव करें।`;
    }

    return `🍂 **What Causes Yellow Leaves in Crops? (Diagnostic & Treatment Guide):**

Yellowing of leaves (Chlorosis) indicates an underlying physiological or pest stress. Diagnose by checking which leaves yellow first:

1. **Nitrogen (N) Deficiency — [Most Common]:**
   - **Pattern:** Older, lower leaves uniformly turn pale yellow first, progressing upward.
   - **Solution:** Apply split top dressing of Urea (25-30 kg/acre) with scheduled irrigation, or foliar spray 1% Urea solution (10g/L water).

2. **Waterlogging & Root Asphyxiation:**
   - **Pattern:** Whole canopy turns limp, dull yellow after heavy rain or poor drainage; saturated soil suffocates roots.
   - **Solution:** Open border drainage furrows immediately to purge standing water; hold irrigation until top 5 cm soil dries.

3. **Iron (Fe) or Zinc (Zn) Micronutrient Deficiency:**
   - **Pattern:** Young upper leaves exhibit interveinal chlorosis (veins stay green while leaf tissue yellows).
   - **Solution:** For Zinc: foliar spray 0.5% Zinc Sulfate (5g/L) + 0.25% slaked lime. For Iron: spray 0.5% Ferrous Sulfate.

4. **Sucking Pests & Yellow Mosaic Virus:**
   - **Pattern:** Yellow mottling, crinkled margins, upward cupping transmitted by whiteflies or thrips.
   - **Solution:** Deploy yellow sticky traps; foliar spray cold-pressed Neem oil (1500 ppm @ 5ml/L) or Flonicamid 50% WG @ 0.4g/L.

*💡 Are the yellow leaves occurring on the lower older foliage or the young top shoots?*`;
  }

  // -------------------------------------------------------------
  // 4. SPECIFIC QUESTION: Pest Control in Cotton
  // -------------------------------------------------------------
  if (
    clean.includes('cotton') ||
    clean.includes('ಹತ್ತಿ') ||
    clean.includes('कपास')
  ) {
    if (clean.includes('pest') || clean.includes('insect') || clean.includes('bollworm') || clean.includes('ಕೀಟ') || clean.includes('ಹುಳು') || clean.includes('कीट') || clean.includes('इल्ली')) {
      if (lang === 'kn') {
        return `☁️ **ಹತ್ತಿ ಬೆಳೆಯಲ್ಲಿ ಪ್ರಮುಖ ಕೀಟಗಳು ಮತ್ತು ಸಮಗ್ರ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳು:**

1. **ಗುಲಾಬಿ ಕಾಯಿ ಕೊರೆಯುವ ಹುಳು (Pink Bollworm - PBW):**
   - **ಹಾನಿ:** ಹೂವಿನೊಳಗೆ ಸೇರಿ 'ರೋಸೆಟ್ ಹೂವು' ಉಂಟುಮಾಡುತ್ತದೆ; ಕಾಯಿಗಳೊಳಗೆ ಪ್ರವೇಶಿಸಿ ಹತ್ತಿಯ ಗುಣಮಟ್ಟ ಕೆಡಿಸುತ್ತದೆ.
   - **ನಿಯಂತ್ರಣ:** ಎಕರೆಗೆ 8 ಫೆರೋಮೋನ್ ಬಲೆಗಳನ್ನು (Pheromone Traps) ಅಳವಡಿಸಿ.
   - ಬಿತ್ತಿದ 60-90 ದಿನಗಳಲ್ಲಿ ಕೀಟದ ಲಕ್ಷಣ ಕಂಡರೆ: *ಸ್ಪೈನೋಸ್ಯಾಡ್ 45% SC (0.3 ಮಿಲಿ/ಲೀಟರ್)* ಅಥವಾ *ಎಮಾಮೆಕ್ಟಿನ್ ಬೆಂಜೊಯೆಟ್ 5% SG (0.5 ಗ್ರಾಂ/ಲೀಟರ್)* ಸಿಂಪಡಿಸಿ.

2. **ರಸ ಹೀರುವ ಕೀಟಗಳು (ಬಿಳಿ ನೊಣ, ಜಾಸಿಡ್ಸ್, ಥ್ರಿಪ್ಸ್):**
   - **ಹಾನಿ:** ಎಲೆಗಳ ರಸ ಹೀರಿ ಎಲೆಗಳು ಕೆಂಪಾಗುವುದು ಮತ್ತು ಮುದುಡುವುದು.
   - **ನೈಸರ್ಗಿಕ ನಿಯಂತ್ರಣ:** ಎಕರೆಗೆ 10 ಹಳದಿ ಮತ್ತು ನೀಲಿ ಅಂಟು ಬಲೆಗಳನ್ನು ಬೆಳೆಯ ಮೇಲ್ಮಟ್ಟದಲ್ಲಿ ಕಟ್ಟಿ.
   - **ಜೈವಿಕ ಸ್ಪ್ರೇ:** ಬೇವಿನ ಎಣ್ಣೆ (1500 ppm @ 5 ಮಿಲಿ/ಲೀಟರ್) ಸಿಂಪಡಿಸಿ.
   - **ರಾಸಾಯನಿಕ:** ತೀವ್ರ ಬಾಧೆಗೆ *ಫ್ಲೋನಿಕಾಮಿಡ್ 50% WG (0.4 ಗ್ರಾಂ/ಲೀಟರ್)* ಸಿಂಪಡಿಸಿ.

3. **ಪ್ರಮುಖ ಸಲಹೆ:** ಸಾರಜನಕ (ಯೂರಿಯಾ) ಗೊಬ್ಬರವನ್ನು ಅತಿಯಾಗಿ ಹಾಕಬೇಡಿ; ಅತಿಯಾದ ಯೂರಿಯಾ ಗಿಡವನ್ನು ಅತಿಯಾಗಿ ಹಚ್ಚಹಸಿರಾಗಿಸಿ ಕೀಟಗಳನ್ನು ಹೆಚ್ಚು ಆಕರ್ಷಿಸುತ್ತದೆ.`;
      }

      if (lang === 'hi') {
        return `☁️ **कपास में कीट नियंत्रण की संपूर्ण समेकित प्रबंधन (IPM) गाइड:**

1. **गुलाबी सुंडी (Pink Bollworm - PBW):**
   - **लक्षण:** कलियों में घुसकर उन्हें 'गुलाब जैसी विकृत' बना देती है; टिंडों के अंदर रेशे व बीज को खा जाती है।
   - **प्रबंधन:** खेत में प्रति एकड़ 8 फेरोमोन ट्रैप (Pheromone Traps) लगाएं।
   - आर्थिक क्षति स्तर पार होने पर: *स्पाइनोसेड 45% SC (0.3 मिली/लीटर)* या *इमामेक्टिन बेंजोएट 5% SG (0.5 ग्राम/लीटर)* का छिड़काव करें।

2. **रस चूसक कीट (सफेद मक्खी, हरा तेला, थ्रिप्स):**
   - **लक्षण:** पत्तियों की निचली सतह से रस चूसते हैं जिससे पत्तियां मुड़कर नाव के आकार की हो जाती हैं।
   - **जैविक नियंत्रण:** प्रति एकड़ 10 पीले व नीले चिपचिपे ट्रैप लगाएं। 5 मिली नीम तेल (1500 ppm) प्रति लीटर का छिड़काव करें।
   - **रासायनिक उपचार:** गंभीर प्रकोप में *फ्लोनिकामिड 50% WG (0.4 ग्राम/लीटर)* या *डाइनोटेफ्यूरान 20% SG (0.5 ग्राम/लीटर)* का प्रयोग करें।

3. **महत्वपूर्ण टिप:** यूरिया का अत्यधिक उपयोग न करें, इससे पौधा अधिक रसीला बनता है और कीटों का हमला तेज हो जाता है।`;
      }

      return `☁️ **Integrated Pest Management (IPM) for Cotton:**

1. **Pink Bollworm (PBW - Pectinophora gossypiella):**
   - **Damage:** Enters flower buds causing 'rosetted flowers'; bores into green bolls destroying lint and seed quality.
   - **Monitoring:** Install 8 gossyplure pheromone traps per acre.
   - **Chemical Control:** If trap catches exceed 8 moths/day for 3 consecutive days, spray Spinosad 45% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.5 g/L.

2. **Sucking Pests (Whitefly, Jassids, Thrips, Aphids):**
   - **Damage:** Extract cell sap from leaf undersides, inducing downward cupping and sooty mold.
   - **Cultural & Bio-Control:** Erect 10 yellow and blue sticky traps per acre; foliar spray cold-pressed Neem seed oil (1500 ppm @ 5 ml/L).
   - **Chemical Threshold:** Spray Flonicamid 50% WG @ 0.4 g/L or Dinotefuran 20% SG @ 0.5 g/L.

3. **Agronomic Caution:** Avoid excessive vegetative growth by balancing Nitrogen with Potassium; do not dump heavy single urea doses.`;
    }
  }

  // -------------------------------------------------------------
  // 5. SPECIFIC QUESTION: Fertilizer needed for Rice
  // -------------------------------------------------------------
  if (
    (clean.includes('fertilizer') || clean.includes('npk') || clean.includes('urea') || clean.includes('dap') || clean.includes('ಗೊಬ್ಬರ') || clean.includes('ಯೂರಿಯಾ') || clean.includes('उर्वरक') || clean.includes('खाद')) &&
    (clean.includes('rice') || clean.includes('paddy') || clean.includes('ಭತ್ತ') || clean.includes('धान') || clean.includes('चावल'))
  ) {
    if (lang === 'kn') {
      return `🌾 **ಭತ್ತದ ಬೆಳೆಗೆ ವೈಜ್ಞಾನಿಕ ರಸಗೊಬ್ಬರ ವೇಳಾಪಟ್ಟಿ (ಎಕರೆಗೆ ನಿಖರ ಪ್ರಮಾಣ):**

ಭತ್ತಕ್ಕೆ **100:50:50 ಕೆಜಿ N:P:K ಪ್ರತಿ ಹೆಕ್ಟೇರ್‌ಗೆ** ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ. ಎಕರೆಗೆ ಹಂತ-ಹಂತದ ಲೆಕ್ಕಾಚಾರ:

1. **ಬುಡ ಗೊಬ್ಬರ (ನಾಟಿ ಮಾಡುವ ಸಮಯದಲ್ಲಿ - Basal Dose):**
   - **DAP:** 50 ಕೆಜಿ (ಅಥವಾ ಸಿಂಗಲ್ ಸೂಪರ್ ಫಾಸ್ಫೇಟ್ 125 ಕೆಜಿ)
   - **MOP (ಪೊಟ್ಯಾಷ್):** 25 ಕೆಜಿ
   - **ಯೂರಿಯಾ:** 15 ಕೆಜಿ
   - **ಜಿಂಕ್ ಸಲ್ಫೇಟ್ (Zinc):** 10 ಕೆಜಿ (ಭತ್ತದ ಖೈರಾ ರೋಗ ತಡೆಗಟ್ಟಲು ಇದು ಅತ್ಯಗತ್ಯ).
   - *ಗಮನಿಸಿ: ಜಿಂಕ್ ಮತ್ತು DAP ಅನ್ನು ಒಟ್ಟಿಗೆ ಬೆರೆಸಬೇಡಿ, ಬೇರೆ ಬೇರೆಯಾಗಿ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.*

2. **ಮೊದಲ ಮೇಲುಗೊಬ್ಬರ (ನಾಟಿ ಮಾಡಿದ 20-25 ದಿನಗಳಲ್ಲಿ - ಕವಲೊಡೆಯುವ ಹಂತ):**
   - **ಯೂರಿಯಾ:** 30 ಕೆಜಿ
   - ಜಮೀನಿನಲ್ಲಿ ನೀರನ್ನು 2 ಸೆಂ.ಮೀ ವರೆಗೆ ಇಳಿಸಿ, ಯೂರಿಯಾ ಹಾಕಿ ನಂತರ ಮಣ್ಣಿನಲ್ಲಿ ಕಳೆ ತೆಗೆಯುವ ಯಂತ್ರ (ಕೋನೋವೀಡರ್) ಚಲಾಯಿಸಿ.

3. **ಎರಡನೇ ಮೇಲುಗೊಬ್ಬರ (ನಾಟಿ ಮಾಡಿದ 45-50 ದಿನಗಳಲ್ಲಿ - ತೆನೆ ಹೊರಬರುವ ಹಂತ):**
   - **ಯೂರಿಯಾ:** 20 ಕೆಜಿ
   - **MOP (ಪೊಟ್ಯಾಷ್):** 15 ಕೆಜಿ (ಕಾಳುಗಳು ಗಟ್ಟಿಯಾಗಿ ಹೊಳೆಯಲು ಪೊಟ್ಯಾಷ್ ನೆರವಾಗುತ್ತದೆ).`;
    }

    if (lang === 'hi') {
      return `🌾 **धान (चावल) के लिए संतुलित उर्वरक तालिका (प्रति एकड़ सटीक मात्रा):**

धान की फसल के लिए मानक **100:50:50 किग्रा N:P:K प्रति हेक्टेयर** अनुशंसित है। एकड़ अनुसार खुराक:

1. **रोपाई के समय (बेसल खुराक - Basal Dose):**
   - **DAP:** 50 किग्रा (या SSP 125 किग्रा)
   - **म्यूरिएट ऑफ पोटाश (MOP):** 25 किग्रा
   - **यूरिया:** 15 किग्रा
   - **जिंक सल्फेट (21%):** 10 किग्रा (खैरा रोग की रोकथाम हेतु अति महत्वपूर्ण)।
   - *चेतावनी: DAP और जिंक सल्फेट को कभी एक साथ मिलाकर न डालें।*

2. **पहली टॉप ड्रेसिंग (रोपाई के 20-25 दिन बाद - कल्ले फूटते समय):**
   - **यूरिया:** 30 किग्रा
   - खेत का पानी 2 सेमी तक कम करके यूरिया का छिड़काव करें ताकि नाइट्रोजन जड़ों तक पहुंचे।

3. **दूसरी टॉप ड्रेसिंग (रोपाई के 45-50 दिन बाद - बाली बनने की शुरुआत / पैनिकिल स्टेज):**
   - **यूरिया:** 20 किग्रा
   - **MOP (पोटाश):** 15 किग्रा (दानों का वजन व चमक बढ़ाने के लिए)।`;
    }

    return `🌾 **Balanced Fertilizer Schedule for Rice / Paddy (per Acre):**

Standard recommendation is **100:50:50 kg/ha N:P:K**. Converted per acre:

1. **Basal Dose (During Final Puddling & Transplanting):**
   - **DAP:** 50 kg (or SSP 125 kg)
   - **MOP (Muriate of Potash):** 25 kg
   - **Urea:** 15 kg
   - **Zinc Sulfate (21%):** 10 kg per acre (mandatory to prevent Khaira deficiency).
   - *Precaution: Do not mix Zinc Sulfate directly with DAP.*

2. **First Top Dressing (21 to 25 Days After Transplanting - Active Tillering):**
   - **Urea:** 30 kg
   - Lower standing water to 2 cm before broadcasting to maximize nitrogen uptake.

3. **Second Top Dressing (45 to 50 Days - Panicle Initiation):**
   - **Urea:** 20 kg
   - **MOP (Potash):** 15 kg (strengthens culms against lodging and plumps grains).`;
  }

  // -------------------------------------------------------------
  // 6. SPECIFIC QUESTION: How much water does maize need?
  // -------------------------------------------------------------
  if (
    clean.includes('maize') ||
    clean.includes('corn') ||
    clean.includes('ಮೆಕ್ಕೆಜೋಳ') ||
    clean.includes('मक्का')
  ) {
    if (clean.includes('water') || clean.includes('irrigation') || clean.includes('need') || clean.includes('ನೀರು') || clean.includes('ನೀರಾವರಿ') || clean.includes('पानी') || clean.includes('सिंचाई')) {
      if (lang === 'kn') {
        return `🌽 **ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ (Maize) ಬೇಕಾಗುವ ನೀರು & ಪ್ರಮುಖ ನೀರಾವರಿ ಹಂತಗಳು:**

1. **ಒಟ್ಟು ನೀರಿನ ಅವಶ್ಯಕತೆ:**
   - ಮೆಕ್ಕೆಜೋಳಕ್ಕೆ ಅದರ 95-110 ದಿನಗಳ ಅವಧಿಯಲ್ಲಿ ಒಟ್ಟು **500 ರಿಂದ 650 ಮಿ.ಮೀ (mm)** ನೀರು ಬೇಕಾಗುತ್ತದೆ.
   - ಸಾಮಾನ್ಯವಾಗಿ ಹವಾಮಾನ ಮತ್ತು ಮಣ್ಣಿಗೆ ತಕ್ಕಂತೆ **5 ರಿಂದ 7 ನೀರಾವರಿಗಳು** ಅಗತ್ಯ.

2. **ಅತ್ಯಂತ ಸೂಕ್ಷ್ಮ & ನಿರ್ಣಾಯಕ ಹಂತಗಳು (Critical Stages):**
   - **1. ಮೊಳಕೆ ಮತ್ತು ಸಸಿ ಹಂತ (ಬಿತ್ತಿದ 12-15 ದಿನಗಳು):** ಲಘು ತೇವಾಂಶ.
   - **2. ಮೊಣಕಾಲು ಎತ್ತರದ ಹಂತ (Knee-high Stage - 30-35 ದಿನಗಳು):** ತ್ವರಿತ ಕಾಂಡ ಬೆಳವಣಿಗೆ.
   - **3. ಗಂಡು ಹೂ (ತೆಂಡೆ) ಹೊರಬರುವ ಹಂತ (Tasseling - 45-50 ದಿನಗಳು):** ತೇವಾಂಶ ಕೊರತೆಯಾದರೆ ಪರಾಗಸ್ಪರ್ಶ ಕುಂಠಿತವಾಗುತ್ತದೆ.
   - **4. ಹೆಣ್ಣು ಹೂ (ರೇಷ್ಮೆ ಕೂದಲು) ಹೊರಬರುವ ಹಂತ (Silking - 55-60 ದಿನಗಳು) — [ಅತಿ ನಿರ್ಣಾಯಕ]:** ಈ ಹಂತದಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾದರೆ ಕಾಯಿಯಲ್ಲಿ ಕಾಳು ತುಂಬುವುದಿಲ್ಲ!
   - **5. ಕಾಳು ಹಾಲು ತುಂಬುವ & ಗಟ್ಟಿಯಾಗುವ ಹಂತ (Dough Stage - 70-80 ದಿನಗಳು):** ತೂಕ ಹೆಚ್ಚಿಸಲು ಕೊನೆಯ ನೀರು.

3. **ಪ್ರಮುಖ ಮುನ್ನೆಚ್ಚರಿಕೆ:** ಮೆಕ್ಕೆಜೋಳವು ಜಮೀನಿನಲ್ಲಿ ನೀರು ನಿಲ್ಲುವುದನ್ನು (Waterlogging) ತಡೆದುಕೊಳ್ಳುವುದಿಲ್ಲ. ನೀರು 12 ಗಂಟೆಗೂ ಹೆಚ್ಚು ನಿಂತರೆ ಬೇರುಗಳು ಕೊಳೆಯುತ್ತವೆ.`;
      }

      if (lang === 'hi') {
        return `🌽 **मक्का (Maize) की फसल में पानी की आवश्यकता व सिंचाई के महत्वपूर्ण चरण:**

1. **कुल पानी की आवश्यकता:**
   - मक्के की 100-110 दिनों की फसल को कुल **500 से 650 मिमी (mm)** पानी की जरूरत होती है।
   - मिट्टी के अनुसार पूरे फसल चक्र में **5 से 7 हल्की सिंचाइयां** पर्याप्त होती हैं।

2. **सिंचाई के 4 सबसे संवेदनशील व नाजुक चरण:**
   - **1. घुटने की ऊंचाई की अवस्था (Knee-high - बुवाई के 30-35 दिन बाद):** पौधों की तेज वृद्धि।
   - **2. नर फूल / मंजर निकलने की अवस्था (Tasseling - 45-50 दिन):** सूखा पड़ने पर पराग सूख जाता है।
   - **3. मादा फूल / भुट्टे में बाल (सिल्क) निकलने की अवस्था (Silking - 55-60 दिन) — [सर्वाधिक महत्वपूर्ण]:** इस अवस्था में पानी की कमी से भुट्टे खाली रह जाते हैं।
   - **4. दाना भरते समय (Dough Stage - 70-80 दिन):** दाने का वजन बढ़ाने के लिए।

3. **सावधानी:** मक्का जलभराव बिल्कुल बर्दाश्त नहीं कर सकता। खेत में जलनिकासी की समुचित व्यवस्था रखें।`;
      }

      return `🌽 **Water Requirements & Critical Irrigation Stages for Maize:**

1. **Total Water Requirement:**
   - Maize requires **500 to 650 mm** of water across its 95–110 day growing season.
   - Depending on soil moisture and rainfall, it requires **5 to 7 scheduled irrigations**.

2. **Critical Moisture Stages (Yield-determining):**
   - **Knee-High Stage (30 to 35 DAS):** Rapid vegetative stem elongation.
   - **Tasseling Stage (45 to 50 DAS):** Pollen formation; moisture stress causes desiccation of tassels.
   - **Silking Stage (55 to 60 DAS) — [MOST CRITICAL]:** Drought during silking leads to poor seed set and barren cobs.
   - **Dough / Grain Bulking Stage (70 to 80 DAS):** Enhances grain test-weight.

3. **Important Caution:** Maize is highly vulnerable to waterlogging. Even 24 hours of standing water causes yellowing and root asphyxiation.`;
    }
  }

  // -------------------------------------------------------------
  // 7. SPECIFIC QUESTION: How to improve soil fertility?
  // -------------------------------------------------------------
  if (
    clean.includes('soil fertility') ||
    clean.includes('improve soil') ||
    clean.includes('fertile') ||
    clean.includes('ಮಣ್ಣಿನ ಫಲವತ್ತತೆ') ||
    clean.includes('ಮಣ್ಣು ಫಲವತ್ತಾಗಿಸು') ||
    clean.includes('मिट्टी की उर्वरता') ||
    clean.includes('उर्वरक क्षमता') ||
    clean.includes('मिट्टी सुधार')
  ) {
    if (lang === 'kn') {
      return `🌱 **ಜಮೀನಿನ ಮಣ್ಣಿನ ಫಲವತ್ತತೆಯನ್ನು ನೈಸರ್ಗಿಕವಾಗಿ ಹೆಚ್ಚಿಸುವ 5 ಮಾರ್ಗಗಳು:**

1. **ಸಾವಯವ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ ಮತ್ತು ಎರೆಹುಳು ಗೊಬ್ಬರ:**
   - ಪ್ರತಿ ಎಕರೆಗೆ ಕನಿಷ್ಠ 2 ರಿಂದ 3 ಟನ್ ಚೆನ್ನಾಗಿ ಕಳಿತ ಕೊಟ್ಟಿಗೆ ಗೊಬ್ಬರ (FYM) ಅಥವಾ ಎರೆಹುಳು ಗೊಬ್ಬರವನ್ನು (Vermicompost) ಬೇಸಿಗೆ ಉಳುಮೆಯ ನಂತರ ಮಣ್ಣಿಗೆ ಸೇರಿಸಿ.

2. **ಹಸಿರೆಲೆ ಗೊಬ್ಬರ ಬೆಳೆಸುವುದು (Green Manuring):**
   - ಮುಖ್ಯ ಬೆಳೆ ಬಿತ್ತುವ ಮುನ್ನ **ಡೈಂಚಾ (ಧೈನ್ಚಾ)** ಅಥವಾ **ಸೆಣಬು (Sunn hemp)** ಬೀಜಗಳನ್ನು ಬಿತ್ತಿ, ಅವು ಹೂ ಬಿಡುವ ಹಂತದಲ್ಲಿ (45 ದಿನಗಳಲ್ಲಿ) ರೋಟವೇಟರ್ ಮೂಲಕ ಮಣ್ಣಿನಲ್ಲಿ ಕತ್ತರಿಸಿ ಮಗುಚಿ. ಇದು ಎಕರೆಗೆ 15-20 ಕೆಜಿ ನೈಸರ್ಗಿಕ ಸಾರಜನಕ ಮತ್ತು ಹ್ಯೂಮಸ್ ಸೇರಿಸುತ್ತದೆ.

3. **ಜೈವಿಕ ಗೊಬ್ಬರಗಳ (Bio-fertilizers) ಬಳಕೆ:**
   - **ರೈಜೋಬಿಯಂ (ದ್ವಿದಳ ಧಾನ್ಯಗಳಿಗೆ), ಅಜೋಟೋಬ್ಯಾಕ್ಟರ್ (ಧಾನ್ಯಗಳಿಗೆ):** ವಾತಾವರಣದ ಸಾರಜನಕವನ್ನು ಮಣ್ಣಿನಲ್ಲಿ ಸ್ಥಿರೀಕರಿಸುತ್ತವೆ.
   - **PSB (ರಂಜಕ ಕರಗಿಸುವ ಬ್ಯಾಕ್ಟೀರಿಯಾ):** ಮಣ್ಣಿನಲ್ಲಿ ನಿಷ್ಕ್ರಿಯವಾಗಿರುವ ರಂಜಕವನ್ನು ಗಿಡದ ಬೇರುಗಳಿಗೆ ಕರಗಿಸಿ ಕೊಡುತ್ತದೆ.

4. **ಬೆಳೆ ಪರಿವರ್ತನೆ (Crop Rotation):**
   - ಒಂದೇ ಬೆಳೆ ಪದೇಪದೇ ಬೆಳೆಯಬೇಡಿ. ಭತ್ತ, ಹತ್ತಿ ಅಥವಾ ಮೆಕ್ಕೆಜೋಳದ ನಂತರ ಕಡಲೆ, ಹೆಸರು ಅಥವಾ ಸೋಯಾಬೀನ್ ನಂತಹ ದ್ವಿದಳ ಧಾನ್ಯಗಳನ್ನು ಬೆಳೆಯಿರಿ.

5. **ಮಣ್ಣಿನ ಪರೀಕ್ಷೆ (Soil Health Card):**
   - ಪ್ರತಿ 2 ವರ್ಷಕ್ಕೊಮ್ಮೆ ಮಣ್ಣಿನ pH, ರಂಜಕ, ಪೊಟ್ಯಾಷ್ ಮತ್ತು ಲಘು ಪೋಷಕಾಂಶಗಳ ಪರೀಕ್ಷೆ ನಡೆಸಿ ಅಗತ್ಯವಿರುವಷ್ಟು ಮಾತ್ರ ಗೊಬ್ಬರ ಹಾಕಿ.`;
    }

    if (lang === 'hi') {
      return `🌱 **खेत की मिट्टी की उर्वरा शक्ति (Soil Fertility) बढ़ाने के 5 अचूक उपाय:**

1. **सड़े हुए गोबर की खाद या केंचुआ खाद:**
   - प्रति एकड़ कम से कम 2-3 टन अच्छी सड़ी गोबर खाद या 1 टन वर्मीकम्पोस्ट खेत की तैयारी में मिलाएं। इससे मिट्टी में जीवांश कार्बन (Organic Carbon) बढ़ता है।

2. **हरी खाद (Green Manuring) अपनाएं:**
   - खरीफ बुवाई से पहले **ढैंचा (Sesbania)** या **सनई (Sunn hemp)** बोएं और 40-45 दिन बाद फूल आने पर हल चलाकर मिट्टी में दबा दें। इससे प्रति एकड़ 20 किग्रा प्राकृतिक नाइट्रोजन मिलता है।

3. **जैव उर्वरक (Bio-fertilizers) का प्रयोग:**
   - दलहनी फसलों में *राइजोबियम कल्चर* और खाद्यान्नों में *एजोटोबैक्टर / पीएसबी (PSB)* का प्रयोग करें, जो मिट्टी में जमे अघुलनशील फास्फोरस को पौधों के लिए घुलनशील बनाते हैं।

4. **फसल चक्र (Crop Rotation):**
   - लगातार एक ही फसल न लें। अनाज व कपास जैसी भारी पोषक तत्व लेने वाली फसलों के बाद चना, मूंग या उड़द जैसी दलहनी फसलें अवश्य लें।

5. **मृदा परीक्षण (Soil Testing):**
   - हर 2 साल में मृदा स्वास्थ्य कार्ड बनवाएं ताकि जरूरत से ज्यादा रासायनिक खाद का खर्च बचे और मिट्टी की सेहत बनी रहे।`;
    }

    return `🌱 **Proven Ways to Enhance Soil Fertility Naturally:**

1. **Organic Matter & Vermicompost:**
   - Incorporate 2-3 tons/acre well-decomposed Farmyard Manure (FYM) or Vermicompost during summer tillage to raise soil organic carbon (SOC).

2. **Green Manuring:**
   - Sow *Dhaincha (Sesbania)* or *Sunn hemp* with pre-monsoon showers and incorporate into the soil with a disc plow at flowering (40-45 days) to add 15-20 kg/acre organic nitrogen.

3. **Biofertilizer Inoculation:**
   - Apply *Rhizobium* (for legumes), *Azotobacter* (for cereals), and *Phosphate Solubilizing Bacteria (PSB)* to liberate locked phosphorus.

4. **Systematic Crop Rotation:**
   - Alternate heavy nitrogen-depleting crops (cotton/maize/wheat) with leguminous pulses (chickpea/soybean/moong) that naturally replenish soil nitrogen.

5. **Soil Health Card Testing:**
   - Test soil pH and electrical conductivity (EC) every two years to apply precision nutrient blends rather than excessive single urea dumping.`;
  }

  // -------------------------------------------------------------
  // 8. SPECIFIC QUESTION: What to do during heavy rainfall?
  // -------------------------------------------------------------
  if (
    clean.includes('heavy rain') ||
    clean.includes('heavy rainfall') ||
    clean.includes('flood') ||
    clean.includes('waterlog') ||
    clean.includes('ಭಾರೀ ಮಳೆ') ||
    clean.includes('ಅತಿಯಾದ ಮಳೆ') ||
    clean.includes('ಮಳೆ ಬಂದಾಗ') ||
    clean.includes('भारी बारिश') ||
    clean.includes('अतिवृष्टि') ||
    clean.includes('बाढ़')
  ) {
    if (lang === 'kn') {
      return `🌧️ **ಭಾರೀ ಮಳೆ ಮತ್ತು ಅತಿಯಾದ ನೀರಿನ ಸಂದರ್ಭದಲ್ಲಿ ರೈತರು ತೆಗೆದುಕೊಳ್ಳಬೇಕಾದ ತುರ್ತು ಕ್ರಮಗಳು:**

1. **ಬಸಿಗಾಲುವೆ ತೆರೆಯಿರಿ (Drain Standing Water):**
   - ಜಮೀನಿನಲ್ಲಿ ನೀರು 24 ಗಂಟೆಗಿಂತ ಹೆಚ್ಚು ನಿಲ್ಲಬಾರದು. ಹೊಲದ ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ತಕ್ಷಣ ಬಸಿಗಾಲುವೆಗಳನ್ನು (Drainage furrows) ತೋಡಿ ನೀರನ್ನು ಹೊರಹಾಕಿ.

2. **ಗೊಬ್ಬರ ಮತ್ತು ಔಷಧ ಸಿಂಪಡಣೆ ತಕ್ಷಣ ನಿಲ್ಲಿಸಿ:**
   - ಮಳೆ ಬೀಳುವಾಗ ಅಥವಾ ಮಳೆಯ ನಿರೀಕ್ಷೆ ಇರುವಾಗ ಯಾವುದೇ ಯೂರಿಯಾ ಗೊಬ್ಬರ ಅಥವಾ ಕೀಟನಾಶಕ ಸಿಂಪಡಿಸಬೇಡಿ; ಮಳೆನೀರು ಅವುಗಳನ್ನು ಕೊಚ್ಚಿಹಾಕುತ್ತದೆ.

3. **ಗಿಡಗಳಿಗೆ ಮಣ್ಣು ಏರಿಸುವುದು (Earthing Up):**
   - ಮೆಕ್ಕೆಜೋಳ, ಕಬ್ಬು ಮತ್ತು ಹತ್ತಿ ಬೆಳೆಗಳಲ್ಲಿ ಬಲವಾದ ಗಾಳಿಗೆ ಗಿಡಗಳು ನೆಲಕ್ಕುರುಳದಂತೆ (Lodging) ಗಿಡದ ಬುಡಕ್ಕೆ ಮಣ್ಣು ಏರಿಸಿ ಆಧಾರ ನೀಡಿ.

4. **ಮಳೆ ನಿಂತ ತಕ್ಷಣ ಶಿಲೀಂಧ್ರ ರೋಗ ತಡೆಗಟ್ಟುವಿಕೆ:**
   - ಮಳೆ ನಿಂತು ಬಿಸಿಲು ಬಂದಾಗ ತೇವಾಂಶದಿಂದ ಶಿಲೀಂಧ್ರ ರೋಗಗಳು ವೇಗವಾಗಿ ಹರಡುತ್ತವೆ. ಎಲೆಗಳು ಒಣಗಿದ ತಕ್ಷಣ *ಮ್ಯಾಂಕೋಜೆಬ್ 75% WP (2.5 ಗ್ರಾಂ/ಲೀಟರ್)* ಅಥವಾ *ಕಾಪರ್ ಆಕ್ಸಿಕ್ಲೋರೈಡ್ (3 ಗ್ರಾಂ/ಲೀಟರ್)* ಸಿಂಪಡಿಸಿ.

5. **ಚೇತರಿಕೆಯ ಬೂಸ್ಟರ್ ಸಿಂಪಡಣೆ:**
   - ಬೇರುಗಳು ಜಲಾವೃತಗೊಂಡು ಉಸಿರುಗಟ್ಟಿದಾಗ, ಗಿಡಕ್ಕೆ ಚೇತರಿಕೆ ನೀಡಲು 1% 19:19:19 ಕರಗುವ ಗೊಬ್ಬರವನ್ನು ಎಲೆಗಳ ಮೇಲೆ ಸಿಂಪಡಿಸಿ.`;
    }

    if (lang === 'hi') {
      return `🌧️ **भारी बारिश (अतिवृष्टि) के दौरान किसानों के लिए आवश्यक आपातकालीन सावधानियां:**

1. **खेत से तत्काल जल निकासी:**
   - फसलों में 24 घंटे से अधिक पानी खड़ा न रहने दें। खेत के निचले हिस्सों में जल निकासी की नालियां खोलकर पानी बाहर निकालें ताकि जड़ सड़न से बचाव हो सके।

2. **उर्वरक व कीटनाशक छिड़काव रोकें:**
   - बारिश के दौरान यूरिया का छिड़काव या कोई भी कीटनाशक न डालें; यह बारिश के पानी में बहकर नष्ट हो जाएगा।

3. **मिट्टी चढ़ाना (Earthing Up):**
   - मक्का, गन्ना व कपास में तेज हवाओं से फसल गिरने से बचाने के लिए पौधों की जड़ों पर मिट्टी चढ़ाएं।

4. **बारिश के बाद फफूंदनाशक का छिड़काव:**
   - बारिश थमते ही नमी के कारण फफूंद रोग तेजी से पनपते हैं। पत्तियां सूखते ही *मैंकोजेब (2.5 ग्राम/लीटर)* या *कॉपर ऑक्सीक्लोराइड (3 ग्राम/लीटर)* का छिड़काव करें।

5. **पौधों में नई जान फूंकने हेतु:**
   - जलभराव के तनाव से उबारने के लिए 1% NPK (19:19:19) का पर्णीय छिड़काव करें।`;
    }

    return `🌧️ **Crucial Precautions and Action Plan During Heavy Rainfall:**

1. **Rapid Field Drainage:**
   - Standing water must not remain in root zones for more than 24 hours. Immediately cut border furrows to evacuate excess deluge.

2. **Postpone Fertilizer & Chemical Applications:**
   - Strictly avoid broadcasting Urea or foliar spraying before or during rains (rainwash renders chemicals useless within 4-6 hours).

3. **Earthing-Up Against Lodging:**
   - Mound soil around bases of tall crops (maize, cotton, sugarcane) to anchor roots against severe rain-wind lodging.

4. **Immediate Post-Rain Fungicide Protective Shield:**
   - Warm moisture post-rainfall triggers catastrophic spore germination (blights and rusts). As soon as leaves dry, spray Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride @ 3 g/L.

5. **Nutrient Foliar Revival:**
   - Once drainage clears, foliar spray 1% water-soluble 19:19:19 or 0.5% Urea to resuscitate suffocated feeder roots.`;
  }

  // -------------------------------------------------------------
  // 9. SPECIFIC QUESTION: How can I identify plant disease?
  // -------------------------------------------------------------
  if (
    clean.includes('identify') ||
    clean.includes('diagnos') ||
    clean.includes('ಗುರುತಿಸು') ||
    clean.includes('ಪತ್ತೆ') ||
    clean.includes('पहचान') ||
    clean.includes('जांच')
  ) {
    if (clean.includes('disease') || clean.includes('plant') || clean.includes('ರೋಗ') || clean.includes('रोग')) {
      if (lang === 'kn') {
        return `🔍 **ಗಿಡದ ರೋಗಗಳನ್ನು ಸ್ವತಃ ಗುರುತಿಸುವ 4 ಪ್ರಮುಖ ಹಂತಗಳು:**

1. **ಶಿಲೀಂಧ್ರ ರೋಗಗಳ ಲಕ್ಷಣಗಳು (Fungal Diseases) — [80% ರೋಗಗಳು]:**
   - **ಎಲೆ ಚುಕ್ಕೆ / ಕರಕಲು ರೋಗ:** ಎಲೆಗಳ ಮೇಲೆ ವೃತ್ತಾಕಾರದ ಕಂದು ಬಣ್ಣದ ಮಚ್ಚೆಗಳು, ಸುತ್ತಲೂ ಹಳದಿ ಉಂಗುರ.
   - **ಬೂದಿ ರೋಗ (Powdery Mildew):** ಎಲೆಯ ಮೇಲ್ಭಾಗದಲ್ಲಿ ಬಿಳಿ ಬಣ್ಣದ ಹಿಟ್ಟಿನಂತಹ ಪುಡಿ.
   - **ತುಕ್ಕು ರೋಗ (Rust):** ಎಲೆಯ ಮೇಲೆ ಹಳದಿ ಅಥವಾ ಕಂದು ಬಣ್ಣದ ಪುಡಿಯ ಗುಳ್ಳೆಗಳು.

2. **ಬ್ಯಾಕ್ಟೀರಿಯಾ ರೋಗಗಳ ಲಕ್ಷಣಗಳು (Bacterial Diseases):**
   - ಎಲೆಗಳ ಮೇಲೆ ಎಣ್ಣೆ ಸವರಿದಂತಹ, ನೀರಿನಿಂದ ಕೂಡಿದ ಕಪ್ಪು ಅಥವಾ ಕಂದು ಕೋನೀಯ ಚುಕ್ಕೆಗಳು.
   - ಮುಂಜಾನೆ ಎಲೆಯ ಗಾಯಗಳಿಂದ ಜಿಗುಟಾದ ಹಾಲಿನಂತಹ ದ್ರವ ಬರುವುದು.

3. **ವೈರಸ್ ರೋಗಗಳ ಲಕ್ಷಣಗಳು (Viral Diseases):**
   - ಎಲೆಗಳು ಮುದುಡುವುದು (Leaf Curl), ಹಳದಿ ಮತ್ತು ಹಸಿರು ಬಣ್ಣದ ಮೊಸಾಯಿಕ್ ವಿನ್ಯಾಸ, ಗಿಡ ಗಿಡ್ಡವಾಗುವುದು.

4. **ತಕ್ಷಣ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ (AI) ಪರೀಕ್ಷೆ:**
   - ನಮ್ಮ **[ಕೃಷಿಮಿತ್ರ ರೋಗ ಪತ್ತೆ ಪುಟದಲ್ಲಿ](#disease-detection)** ನಿಮ್ಮ ಮೊಬೈಲ್ ಕ್ಯಾಮೆರಾದಿಂದ ಎಲೆಯ ಫೋಟೋ ತೆಗೆದು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆಯು ರೋಗ ಮತ್ತು ಸೂಕ್ತ ಔಷಧಿಯನ್ನು ತಕ್ಷಣ ತಿಳಿಸುತ್ತದೆ!`;
      }

      if (lang === 'hi') {
        return `🔍 **पौधों के रोगों की पहचान कैसे करें (सरल व सटीक गाइड):**

1. **फफूंदजनित रोग (Fungal Diseases) — [80% फसलों में]:**
   - **झुलसा व पत्ती धब्बा:** पत्तियों पर गोल भूरे धब्बे, जिनके चारों ओर पीला छल्ला होता है।
   - **चूर्णिल आसिता (Powdery Mildew):** पत्तियों की सतह पर सफेद पाउडर जैसा छिड़काव।
   - **गेरुई / रतुआ (Rust):** पत्तियों पर पीले या भूरे रंग के उभार व पाउडर।

2. **जीवाणु रोग (Bacterial Diseases):**
   - पत्तियों पर तेलिया या पानी से भीगे हुए कोणीय धब्बे।
   - सुबह के समय घावों से चिपचिपा गाढ़ा द्रव निकलना।

3. **विषाणु रोग (Viral Diseases):**
   - पत्तियों का मुड़ना (Leaf Curl), पीला-हरा मोज़ेक पैटर्न और पौधे का बौना रह जाना।

4. **तत्काल एआई द्वारा जांच:**
   - हमारे **[रोग पहचान पृष्ठ](#disease-detection)** पर मोबाइल से पत्ती की फोटो अपलोड करें। एआई मॉडल तुरंत रोग व सटीक दवा की जानकारी देगा!`;
      }

      return `🔍 **How to Identify Plant Diseases (Diagnostic Checklist):**

1. **Fungal Infections (~80% of crop issues):**
   - **Blights & Leaf Spots:** Concentric brown rings ("bullseye target pattern") surrounded by yellow halos.
   - **Powdery Mildew:** White, flour-like talcum powder on leaf tops.
   - **Rusts:** Raised pustules discharging yellow or reddish-brown spores when brushed.

2. **Bacterial Infections:**
   - Angular, water-soaked oily spots restricted by leaf veinlets.
   - Bacterial ooze visible during humid morning hours.

3. **Viral Infections:**
   - Upward/downward leaf curling, mosaic yellow-green mottling, and severe plant stunting.

4. **Instant AI Vision Analysis:**
   - Take a clear photograph and upload it to our **[Crop Disease Detection](#disease-detection)** page for instant ICAR clinical recommendations!`;
    }
  }

  // -------------------------------------------------------------
  // 10. SPECIFIC QUESTION: How do I increase crop production / yield?
  // -------------------------------------------------------------
  if (
    clean.includes('increase') ||
    clean.includes('production') ||
    clean.includes('yield') ||
    clean.includes('ಹೆಚ್ಚಿಸು') ||
    clean.includes('ಇಳುವರಿ') ||
    clean.includes('पैदावार') ||
    clean.includes('उत्पादन')
  ) {
    if (lang === 'kn') {
      return `📈 **ಬೆಳೆ ಇಳುವರಿ ಮತ್ತು ಆದಾಯವನ್ನು 30-40% ಹೆಚ್ಚಿಸುವ 5 ಸೂತ್ರಗಳು:**

1. **ಪ್ರಮಾಣೀಕೃತ ಸುಧಾರಿತ ತಳಿಗಳ ಬಳಕೆ (Certified Seeds):**
   - ಸ್ಥಳೀಯ ನಾಟಿ ಬೀಜಗಳ ಬದಲಾಗಿ ಕೃಷಿ ವಿಶ್ವವಿದ್ಯಾಲಯಗಳಿಂದ ಶಿಫಾರಸು ಮಾಡಲಾದ ಅಧಿಕ ಇಳುವರಿಯ ಪ್ರಮಾಣೀಕೃತ ಬೀಜಗಳನ್ನು ಬಳಸಿ.

2. **ಕಡ್ಡಾಯ ಬೀಜೋಪಚಾರ (Seed Treatment):**
   - ಬಿತ್ತನೆಗೆ ಮುನ್ನ ಬೀಜಗಳಿಗೆ *ಟ್ರೈಕೋಡರ್ಮಾ (5 ಗ್ರಾಂ/ಕೆಜಿ)* ಮತ್ತು *ರೈಜೋಬಿಯಂ/ಅಜೋಟೋಬ್ಯಾಕ್ಟರ್* ಬೆರೆಸಿ ಬಿತ್ತಿದರೆ ಶೇ. 95 ಕ್ಕೂ ಹೆಚ್ಚು ಮೊಳಕೆ ಬರುತ್ತದೆ ಮತ್ತು ಆರಂಭಿಕ ಬೇರು ಕೊಳೆ ರೋಗ ತಡೆಯಬಹುದು.

3. **ಸರಿಯಾದ ಅಂತರ ಮತ್ತು ಗಿಡಗಳ ಸಂಖ್ಯೆ (Plant Population):**
   - ಎಕರೆಗೆ ಶಿಫಾರಸು ಮಾಡಿದ ಗಿಡಗಳ ಸಂಖ್ಯೆ ಕಾಪಾಡಿಕೊಳ್ಳಿ. ಸಾಲಿನಿಂದ ಸಾಲಿಗೆ ಸರಿಯಾದ ಅಂತರವಿದ್ದರೆ ಪ್ರತಿ ಗಿಡಕ್ಕೂ ಸಮೃದ್ಧ ಸೂರ್ಯನ ಬೆಳಕು ಮತ್ತು ಗಾಳಿ ದೊರೆಯುತ್ತದೆ.

4. **ನಿರ್ಣಾಯಕ ಹಂತಗಳಲ್ಲಿ ಸಕಾಲಿಕ ನೀರಾವರಿ:**
   - ಹೂವಾಡುವ ಮತ್ತು ಕಾಳು ತುಂಬುವ ಸೂಕ್ಷ್ಮ ಹಂತಗಳಲ್ಲಿ ನೀರಿನ ಕೊರತೆಯಾಗದಂತೆ ಎಚ್ಚರವಹಿಸಿ.

5. **ಮೊದಲ 30 ದಿನಗಳ ಕಳೆ ನಿರ್ವಹಣೆ:**
   - ಬಿತ್ತಿದ ಮೊದಲ 30-40 ದಿನಗಳಲ್ಲಿ ಕಳೆ ತೆಗೆಯುವುದು ಅತಿ ಮುಖ್ಯ. ಕಳೆಗಳು ಬೆಳೆಯ ಅರ್ಧದಷ್ಟು ಪೋಷಕಾಂಶ ಮತ್ತು ನೀರನ್ನು ಕದಿಯುತ್ತವೆ.`;
    }

    if (lang === 'hi') {
      return `📈 **फसल की पैदावार और आमदनी 30-40% बढ़ाने के 5 वैज्ञानिक सूत्र:**

1. **प्रमाणित उन्नत बीजों का चयन:**
   - हमेशा कृषि अनुसंधान संस्थानों द्वारा अनुशंसित प्रमाणित हाइब्रिड किस्मों का ही चयन करें।

2. **अनिवार्य बीजोपचार (बीज संस्कार):**
   - बुवाई से पहले बीजों को *ट्राइकोडर्मा (5 ग्राम/किग्रा)* से उपचारित करें। इससे 95% से अधिक अंकुरण होता है और पौधे शुरुआती रोगों से सुरक्षित रहते हैं।

3. **उचित दूरी एवं पौधों की संख्या (Plant Geometry):**
   - कतार से कतार और पौधे से पौधे की सही दूरी बनाए रखें ताकि प्रत्येक पौधे को भरपूर धूप और हवा मिल सके।

4. **संवेदनशील चरणों में समय पर सिंचाई:**
   - फूल खिलते समय और दाना बनते समय नमी की कमी बिल्कुल न होने दें।

5. **शुरुआती 30-40 दिनों में खरपतवार नियंत्रण:**
   - खरपतवार फसल के 40% पोषक तत्व और पानी छीन लेते हैं। प्रारंभिक दिनों में निराई-गुड़ाई अवश्य करें।`;
    }

    return `📈 **5 Proven Scientific Rules to Maximize Crop Yield & Farm Income:**

1. **Certified High-Yielding Seeds:**
   - Always choose certified university-recommended varieties adapted to your micro-climate.

2. **Mandatory Seed Treatment (Bio-Priming):**
   - Treat seeds with *Trichoderma viride* (5g/kg) and *Rhizobium/Azotobacter* prior to sowing to ensure 95%+ germination and eliminate damping-off.

3. **Optimum Plant Population Geometry:**
   - Maintain scientific row-to-row spacing to maximize sunlight interception and canopy airflow.

4. **Precision Stage-Wise Nutrition:**
   - Apply split doses of nitrogen (basal + tillering/knee-high + flowering) rather than dumping all urea at once.

5. **Weed-Free Critical Period (First 30–40 Days):**
   - Eliminate weeds early; weeds steal up to 45% of soil nutrients and moisture during initial vegetative vigor.`;
  }

  // -------------------------------------------------------------
  // 11. CONTEXTUAL FOLLOW-UP PRONOUN RESOLUTION ("it", "this crop", etc.)
  // -------------------------------------------------------------
  if (isFollowUp && contextCrop) {
    const cropData = CROP_KNOWLEDGE_LIBRARY[contextCrop];
    if (cropData) {
      if (clean.includes('water') || clean.includes('irrigation') || clean.includes('ನೀರು') || clean.includes('पानी')) {
        return (lang === 'kn')
          ? `💧 **${cropData.names.kn} ಬೆಳೆಗೆ ನೀರಿನ ಅವಶ್ಯಕತೆ:**\n\n- **ಒಟ್ಟು ನೀರು:** ${cropData.waterNeeds}\n- **ನಿರ್ಣಾಯಕ ಹಂತಗಳು:** ${cropData.criticalIrrigation.join(', ')}.`
          : (lang === 'hi')
          ? `💧 **${cropData.names.hi} के लिए पानी की आवश्यकता:**\n\n- **कुल पानी:** ${cropData.waterNeeds}\n- **महत्वपूर्ण सिंचाई चरण:** ${cropData.criticalIrrigation.join(', ')}.`
          : `💧 **Water Requirements for ${cropData.names.en}:**\n\n- **Total Water:** ${cropData.waterNeeds}\n- **Critical Stages:** ${cropData.criticalIrrigation.join(', ')}.`;
      }

      if (clean.includes('fertilizer') || clean.includes('npk') || clean.includes('ಗೊಬ್ಬರ') || clean.includes('उर्वरक')) {
        return (lang === 'kn')
          ? `🧪 **${cropData.names.kn} ಬೆಳೆಗೆ ರಸಗೊಬ್ಬರ ಶಿಫಾರಸು:**\n\n- **ಪ್ರಮಾಣ:** ${cropData.npk}\n- **ಸಲಹೆ:** ${cropData.yieldTips}`
          : (lang === 'hi')
          ? `🧪 **${cropData.names.hi} के लिए उर्वरक अनुशंसा:**\n\n- **खुराक:** ${cropData.npk}\n- **टिप:** ${cropData.yieldTips}`
          : `🧪 **Fertilizer Recommendation for ${cropData.names.en}:**\n\n- **NPK Dose:** ${cropData.npk}\n- **Agronomic Tip:** ${cropData.yieldTips}`;
      }
    }
  }

  // -------------------------------------------------------------
  // 12. GENERAL CROP RECOMMENDATION WITH FARM PROFILE PERSONALIZATION
  // -------------------------------------------------------------
  if (clean.includes('which crop') || clean.includes('what crop') || clean.includes('suggest crop') || clean.includes('ಯಾವ ಬೆಳೆ') || clean.includes('ಬೆಳೆ ಬೆಳೆಯ') || clean.includes('कौन सी फसल') || clean.includes('फसल लगाएं')) {
    const profileIntro = farmLocation
      ? (lang === 'kn'
          ? `📍 ನಿಮ್ಮ ಜಮೀನಿನ ನೋಂದಾಯಿತ ಸ್ಥಳ **${farmLocation}** ${farmSoil ? `ಮತ್ತು **${farmSoil}** ಮಣ್ಣಿನ ಪ್ರಕಾರವನ್ನು` : ''} ಆಧರಿಸಿ:`
          : lang === 'hi'
          ? `📍 आपके खेत के पंजीकृत स्थान **${farmLocation}** ${farmSoil ? `और **${farmSoil}** के आधार पर:` : ':'}`
          : `📍 Based on your registered farm location in **${farmLocation}** ${farmSoil ? `with **${farmSoil}**:` : ':'}`)
      : '';

    if (lang === 'kn') {
      return `${profileIntro}
🌱 **ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ ಪ್ರಮುಖ ಬೆಳೆ ಶಿಫಾರಸುಗಳು:**

1. **ಹಿಂಗಾರು (ರಬಿ / ಚಳಿಗಾಲ) ಹಂಗಾಮಿಗೆ:**
   - **ಕರಿ ಮಣ್ಣು:** ಕಡಲೆ (JG-14), ಹಿಂಗಾರು ಜೋಳ, ಅಥವಾ ಗೋಧಿ (HD-3086).
   - **ಕೆಂಪು / ಮರಳು ಮಿಶ್ರಿತ ಗೋಡು ಮಣ್ಣು:** ಬಾರ್ಲಿ, ಸಾಸಿವೆ, ಅಥವಾ ತೊಗರಿ.

2. **ಮುಂಗಾರು (ಖಾರೀಫ್ / ಮಳೆಗಾಲ) ಹಂಗಾಮಿಗೆ:**
   - ಹತ್ತಿ, ಸೋಯಾಬೀನ್ (JS-9560), ಭತ್ತ (ನೀರಾವರಿ ಇದ್ದರೆ), ಅಥವಾ ಮೆಕ್ಕೆಜೋಳ.

*💡 ಹೆಚ್ಚಿನ ನಿಖರತೆಗಾಗಿ ನಮ್ಮ **[ಬೆಳೆ ಶಿಫಾರಸು ಎಂಜಿನ್](#crop-recommendation)** ನಲ್ಲಿ ನಿಮ್ಮ ಮಣ್ಣಿನ pH ಮತ್ತು ನೀರಿನ ಲಭ್ಯತೆಯನ್ನು ಪರಿಶೀಲಿಸಿ!*`;
    }

    if (lang === 'hi') {
      return `${profileIntro}
🌱 **आपकी भूमि के लिए उपयुक्त प्रमुख फसल अनुशंसाएं:**

1. **रबी (सर्दियों) मौसम के लिए:**
   - **काली मिट्टी:** चना (JG-14), रबी ज्वार, या गेहूं (HD-3086)।
   - **दोमट / लाल मिट्टी:** सरसों (पूसा बोल्ड), जौ, या मटर।

2. **खरीफ (मानसून) मौसम के लिए:**
   - सोयाबीन, कपास, मक्का, या धान (सिंचाई होने पर)।

*💡 अधिक जानकारी के लिए हमारे **[फसल सिफारिश कैलकुलेटर](#crop-recommendation)** का उपयोग करें!*`;
    }

    return `${profileIntro}
🌱 **Top Crop Recommendations for Your Farm:**

1. **Rabi (Winter) Season:**
   - **Black Soil:** Chickpea (JG-14), Rabi Sorghum, or Wheat (HD-3086).
   - **Loam / Red Soil:** Mustard (Pusa Bold), Barley, or Field Pea.

2. **Kharif (Monsoon) Season:**
   - Cotton, Soybean (JS-9560), Maize, or Paddy (with irrigation).

*💡 For precision suitability scores, check our **[Crop Recommendation Engine](#crop-recommendation)**!*`;
  }

  // -------------------------------------------------------------
  // 13. WEATHER & RAINFALL INQUIRIES
  // -------------------------------------------------------------
  if (clean.includes('weather') || clean.includes('rain today') || clean.includes('rain tomorrow') || clean.includes('ಹವಾಮಾನ') || clean.includes('ಇಂದು ಮಳೆ') || clean.includes('मौसम') || clean.includes('बारिश होगी')) {
    if (lang === 'kn') {
      return `🌦️ **ಹವಾಮಾನ & ಕೃಷಿ ಸಿಂಪಡಣೆ ಸಲಹೆ:**
ಪ್ರಸ್ತುತ ನಿಮ್ಮ ಜಮೀನಿನ ನೈಜ-ಸಮಯದ ಹವಾಮಾನ ಮತ್ತು 5 ದಿನಗಳ ಮಳೆ ಮುನ್ಸೂಚನೆಗಾಗಿ ನಮ್ಮ **[ಹವಾಮಾನ ಪುಟಕ್ಕೆ](#weather)** ಭೇಟಿ ನೀಡಿ. ಗಾಳಿಯ ವೇಗ 15 ಕಿ.ಮೀ/ಗಂಟೆಗಿಂತ ಕಡಿಮೆಯಿದ್ದಾಗ ಮತ್ತು ಮುಂದಿನ 6 ಗಂಟೆಗಳಲ್ಲಿ ಮಳೆಯಿಲ್ಲದಿದ್ದಾಗ ಮಾತ್ರ ಔಷಧ ಸಿಂಪಡಣೆ ಮಾಡಿ.`;
    }
    if (lang === 'hi') {
      return `🌦️ **मौसम एवं छिड़काव परामर्श:**
अपने क्षेत्र के सटीक 5-दिवसीय बारिश पूर्वानुमान के लिए हमारे **[मौसम पृष्ठ](#weather)** पर जाएं। हवा की गति 15 किमी/घंटे से कम होने और अगले 6 घंटे बारिश न होने पर ही कीटनाशक का छिड़काव करें।`;
    }
    return `🌦️ **Weather & Spraying Advisory:**
Check live local temperature, humidity, and 5-day rain probability on our **[Weather Page](#weather)**. Only spray when wind speeds are under 15 km/h and no rain is forecast for the next 6 hours.`;
  }

  // -------------------------------------------------------------
  // 14. DEFAULT INFORMATIVE FALLBACK
  // -------------------------------------------------------------
  if (lang === 'kn') {
    return `🙏 **ನಮಸ್ಕಾರ ರೈತ ಬಾಂಧವರೇ!**
ನಿಮ್ಮ ಪ್ರಶ್ನೆ: *"${userMessage}"*

ಕೃಷಿ ತಜ್ಞರ ಸಲಹೆ:
- ಬೆಳೆಗಳಿಗೆ ನೀರು ಹಾಯಿಸುವಾಗ ಮಣ್ಣಿನ ತೇವಾಂಶವನ್ನು ಪರೀಕ್ಷಿಸಿ.
- ಕೀಟ ಮತ್ತು ರೋಗಗಳ ಆರಂಭಿಕ ಹಂತದಲ್ಲೇ ನಿಯಂತ್ರಣ ಕ್ರಮಗಳನ್ನು ಕೈಗೊಳ್ಳಿ.
- ರೋಗಪೀಡಿತ ಎಲೆಯ ಫೋಟೋ ಇದ್ದರೆ ಕೆಳಗಿನ ಕ್ಯಾಮೆರಾ ಐಕಾನ್ ಕ್ಲಿಕ್ ಮಾಡಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ.

*💡 ತ್ವರಿತ ಮಾಹಿತಿಗಾಗಿ ಮೇಲೆ ನೀಡಿರುವ ಸಲಹಾ ಪ್ರಶ್ನೆಗಳನ್ನು ಕ್ಲಿಕ್ ಮಾಡಿ!*`;
  }

  if (lang === 'hi') {
    return `🙏 **नमस्ते किसान भाई!**
आपके प्रश्न: *"${userMessage}"* के लिए मार्गदर्शन:

- फसल में किसी भी उर्वरक का उपयोग मिट्टी की जांच के आधार पर करें।
- रोग के लक्षण दिखते ही तत्काल जैविक या अनुशंसित उपाय करें।
- यदि पत्ती की फोटो है तो नीचे दिए गए कैमरा आइकन से अपलोड करें।

*💡 त्वरित उत्तर के लिए ऊपर दिए गए सुझाए गए प्रश्नों पर क्लिक करें!*`;
  }

  return `🙏 **Greetings, Farmer!**
Regarding your inquiry: *"${userMessage}"*

Agronomic Guidance:
- Maintain regular field inspection every 3-4 days to detect early pest or disease foci.
- Apply balanced fertilizers at critical crop stages rather than excessive single doses.
- You can upload an infected leaf photograph using the image button below for visual guidance.

*💡 You can also click any of the suggested topics above!*`;
}

/**
 * Primary Chatbot API Gateway
 */
export async function sendChatMessage(userMessage, chatHistory = [], currentLanguage = 'kn', extraContext = {}) {
  let lang = currentLanguage;
  if (!lang) {
    try {
      lang = localStorage.getItem('krishimitra_language') || 'kn';
    } catch {
      lang = 'kn';
    }
  }

  // 1. Attempt live API call to unified FastAPI backend (/ai/chatbot)
  try {
    const apiResult = await callChatbotAPI(userMessage, lang, chatHistory);
    if (apiResult && apiResult.success && apiResult.reply) {
      return {
        text: apiResult.reply,
        source: 'backend-ai',
        success: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
    }
  } catch (err) {
    console.warn('Backend chatbot unreachable, using local agricultural intelligence engine:', err);
  }

  // 2. Intelligent Context-Aware Agronomic Engine Fallback
  return new Promise((resolve) => {
    const delay = Math.floor(350 + Math.random() * 200);
    setTimeout(() => {
      const responseText = generateLocalAgronomyResponse(userMessage, chatHistory, lang, extraContext);
      resolve({
        text: responseText,
        source: 'local-expert',
        success: true,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    }, delay);
  });
}
