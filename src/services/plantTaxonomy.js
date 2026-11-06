/**
 * KrishiMitra (ಕೃಷಿಮಿತ್ರ) Comprehensive Agricultural Plant & Crop Taxonomy
 * 
 * Supports all major Indian agricultural and horticultural crops organized into 8 categories:
 * A. Cereal Crops
 * B. Pulses
 * C. Cash Crops
 * D. Oilseeds
 * E. Vegetables
 * F. Fruits
 * G. Plantation & Spices
 * H. Other / Garden Plants
 */

export const CROP_CATEGORIES = [
  { id: 'all', name: 'All Crops', nameKn: 'ಎಲ್ಲಾ ಬೆಳೆಗಳು', nameHi: 'सभी फसलें', icon: '🌾' },
  { id: 'cereals', name: 'Cereals', nameKn: 'ಧಾನ್ಯಗಳು', nameHi: 'अनाज', icon: '🌾' },
  { id: 'pulses', name: 'Pulses', nameKn: 'ದ್ವಿದಳ ಧಾನ್ಯಗಳು', nameHi: 'दालें', icon: '🫘' },
  { id: 'cash', name: 'Cash Crops', nameKn: 'ವಾಣಿಜ್ಯ ಬೆಳೆಗಳು', nameHi: 'नकदी फसलें', icon: '💰' },
  { id: 'oilseeds', name: 'Oilseeds', nameKn: 'ಎಣ್ಣೆಕಾಳುಗಳು', nameHi: 'तिलहन', icon: '🌻' },
  { id: 'vegetables', name: 'Vegetables', nameKn: 'ತರಕಾರಿಗಳು', nameHi: 'सब्जियां', icon: '🥦' },
  { id: 'fruits', name: 'Fruits', nameKn: 'ಹಣ್ಣುಗಳು', nameHi: 'फल', icon: '🍎' },
  { id: 'plantation', name: 'Plantation & Spices', nameKn: 'ತೋಟಗಾರಿಕೆ & ಸಂಬಾರ', nameHi: 'बागवानी व मसाले', icon: '🥥' },
  { id: 'other', name: 'Other Plants', nameKn: 'ಇತರ ಸಸ್ಯಗಳು', nameHi: 'अन्य पौधे', icon: '🪴' }
];

export const ALL_SUPPORTED_CROPS = [
  // A. CEREAL CROPS
  { id: 'rice', name: 'Rice / Paddy', category: 'cereals', scientificName: 'Oryza sativa', localKn: 'ಭತ್ತ (Paddy)', localHi: 'धान / चावल (Paddy)', icon: '🌾' },
  { id: 'wheat', name: 'Wheat', category: 'cereals', scientificName: 'Triticum aestivum', localKn: 'ಗೋಧಿ (Wheat)', localHi: 'गेहूं (Wheat)', icon: '🌱' },
  { id: 'maize', name: 'Maize (Corn)', category: 'cereals', scientificName: 'Zea mays', localKn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', localHi: 'मक्का (Maize)', icon: '🌽' },
  { id: 'ragi', name: 'Ragi (Finger Millet)', category: 'cereals', scientificName: 'Eleusine coracana', localKn: 'ರಾಗಿ (Ragi)', localHi: 'रागी (Ragi)', icon: '🌾' },
  { id: 'sorghum', name: 'Sorghum (Jowar)', category: 'cereals', scientificName: 'Sorghum bicolor', localKn: 'ಜೋಳ (Jowar)', localHi: 'ज्वार (Jowar)', icon: '🌾' },
  { id: 'barley', name: 'Barley', category: 'cereals', scientificName: 'Hordeum vulgare', localKn: 'ಬಾರ್ಲಿ (Barley)', localHi: 'जौ (Barley)', icon: '🌾' },
  { id: 'oats', name: 'Oats', category: 'cereals', scientificName: 'Avena sativa', localKn: 'ಓಟ್ಸ್ (Oats)', localHi: 'जई (Oats)', icon: '🌾' },
  { id: 'millet', name: 'Bajra (Pearl Millet)', category: 'cereals', scientificName: 'Pennisetum glaucum', localKn: 'ಸಜ್ಜೆ (Bajra)', localHi: 'बाजरा (Bajra)', icon: '🌾' },

  // B. PULSES
  { id: 'chickpea', name: 'Chickpea (Bengal Gram)', category: 'pulses', scientificName: 'Cicer arietinum', localKn: 'ಕಡಲೆ (Gram)', localHi: 'चना (Chickpea)', icon: '🫘' },
  { id: 'pigeonpea', name: 'Pigeon Pea (Red Gram / Tur)', category: 'pulses', scientificName: 'Cajanus cajan', localKn: 'ತೊಗರಿ (Tur)', localHi: 'अरहर / तूर (Tur)', icon: '🫘' },
  { id: 'greengram', name: 'Green Gram (Moong)', category: 'pulses', scientificName: 'Vigna radiata', localKn: 'ಹೆಸರುಕಾಳು (Moong)', localHi: 'मूंग (Moong)', icon: '🫘' },
  { id: 'blackgram', name: 'Black Gram (Urad)', category: 'pulses', scientificName: 'Vigna mungo', localKn: 'ಉದ್ದಿನಕಾಳು (Urad)', localHi: 'उड़द (Urad)', icon: '🫘' },
  { id: 'cowpea', name: 'Cowpea (Lobia)', category: 'pulses', scientificName: 'Vigna unguiculata', localKn: 'ಅಲಸಂದಿ (Lobia)', localHi: 'लोबिया (Cowpea)', icon: '🫘' },
  { id: 'lentil', name: 'Lentil (Masoor)', category: 'pulses', scientificName: 'Lens culinaris', localKn: 'ಮಸೂರ (Masoor)', localHi: 'मसूर (Masoor)', icon: '🫘' },
  { id: 'peas', name: 'Green Peas', category: 'pulses', scientificName: 'Pisum sativum', localKn: 'ಬಟಾಣಿ (Peas)', localHi: 'मटर (Peas)', icon: '🫛' },
  { id: 'soybean', name: 'Soybean', category: 'pulses', scientificName: 'Glycine max', localKn: 'ಸೋಯಾಬೀನ್ (Soybean)', localHi: 'सोयाबीन (Soybean)', icon: '🌿' },

  // C. CASH CROPS
  { id: 'cotton', name: 'Cotton', category: 'cash', scientificName: 'Gossypium hirsutum', localKn: 'ಹತ್ತಿ (Cotton)', localHi: 'कपास (Cotton)', icon: '☁️' },
  { id: 'sugarcane', name: 'Sugarcane', category: 'cash', scientificName: 'Saccharum officinarum', localKn: 'ಕಬ್ಬು (Sugarcane)', localHi: 'गन्ना (Sugarcane)', icon: '🎋' },
  { id: 'tobacco', name: 'Tobacco', category: 'cash', scientificName: 'Nicotiana tabacum', localKn: 'ತಂಬಾಕು (Tobacco)', localHi: 'तंबाकू (Tobacco)', icon: '🍂' },
  { id: 'jute', name: 'Jute', category: 'cash', scientificName: 'Corchorus olitorius', localKn: 'ಸೆಣಬು (Jute)', localHi: 'पटसन / जूट (Jute)', icon: '🌾' },

  // D. OILSEEDS
  { id: 'groundnut', name: 'Groundnut (Peanut)', category: 'oilseeds', scientificName: 'Arachis hypogaea', localKn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', localHi: 'मूंगफली (Groundnut)', icon: '🥜' },
  { id: 'sunflower', name: 'Sunflower', category: 'oilseeds', scientificName: 'Helianthus annuus', localKn: 'ಸೂರ್ಯಕಾಂತಿ (Sunflower)', localHi: 'सूरजमुखी (Sunflower)', icon: '🌻' },
  { id: 'mustard', name: 'Mustard (Sarson)', category: 'oilseeds', scientificName: 'Brassica juncea', localKn: 'ಸಾಸಿವೆ (Mustard)', localHi: 'सरसों (Mustard)', icon: '🌼' },
  { id: 'sesame', name: 'Sesame (Til)', category: 'oilseeds', scientificName: 'Sesamum indicum', localKn: 'ಎಳ್ಳು (Til)', localHi: 'तिल (Sesame)', icon: '🌱' },
  { id: 'castor', name: 'Castor', category: 'oilseeds', scientificName: 'Ricinus communis', localKn: 'ಔಡಲ (Castor)', localHi: 'अरंडी (Castor)', icon: '🌿' },
  { id: 'rapeseed', name: 'Rapeseed / Toria', category: 'oilseeds', scientificName: 'Brassica napus', localKn: 'ತೋರಿಯಾ (Rapeseed)', localHi: 'तोरिया (Rapeseed)', icon: '🌾' },

  // E. VEGETABLES
  { id: 'tomato', name: 'Tomato', category: 'vegetables', scientificName: 'Solanum lycopersicum', localKn: 'ಟೊಮೆಟೊ (Tomato)', localHi: 'टमाटर (Tomato)', icon: '🍅' },
  { id: 'potato', name: 'Potato', category: 'vegetables', scientificName: 'Solanum tuberosum', localKn: 'ಆಲೂಗಡ್ಡೆ (Potato)', localHi: 'आलू (Potato)', icon: '🥔' },
  { id: 'onion', name: 'Onion', category: 'vegetables', scientificName: 'Allium cepa', localKn: 'ಈರುಳ್ಳಿ (Onion)', localHi: 'प्याज (Onion)', icon: '🧅' },
  { id: 'chilli', name: 'Chilli / Green Pepper', category: 'vegetables', scientificName: 'Capsicum annuum', localKn: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)', localHi: 'मिर्च (Chilli)', icon: '🌶️' },
  { id: 'brinjal', name: 'Brinjal (Eggplant)', category: 'vegetables', scientificName: 'Solanum melongena', localKn: 'ಬದನೆಕಾಯಿ (Brinjal)', localHi: 'बैंगन (Brinjal)', icon: '🍆' },
  { id: 'cabbage', name: 'Cabbage', category: 'vegetables', scientificName: 'Brassica oleracea var. capitata', localKn: 'ಎಲೆಕೋಸು (Cabbage)', localHi: 'पत्तागोभी (Cabbage)', icon: '🥬' },
  { id: 'cauliflower', name: 'Cauliflower', category: 'vegetables', scientificName: 'Brassica oleracea var. botrytis', localKn: 'ಹೂಕೋಸು (Cauliflower)', localHi: 'फूलगोभी (Cauliflower)', icon: '🥦' },
  { id: 'okra', name: 'Okra (Bhindi / Ladyfinger)', category: 'vegetables', scientificName: 'Abelmoschus esculentus', localKn: 'ಬೆಂಡೆಕಾಯಿ (Bhindi)', localHi: 'भिंडी (Okra)', icon: '🌱' },
  { id: 'cucumber', name: 'Cucumber', category: 'vegetables', scientificName: 'Cucumis sativus', localKn: 'ಸೌತೆಕಾಯಿ (Cucumber)', localHi: 'खीरा (Cucumber)', icon: '🥒' },
  { id: 'pumpkin', name: 'Pumpkin', category: 'vegetables', scientificName: 'Cucurbita moschata', localKn: 'ಕುಂಬಳಕಾಯಿ (Pumpkin)', localHi: 'कद्दू (Pumpkin)', icon: '🎃' },
  { id: 'bittergourd', name: 'Bitter Gourd (Karela)', category: 'vegetables', scientificName: 'Momordica charantia', localKn: 'ಹಾಗಲಕಾಯಿ (Karela)', localHi: 'करेला (Bitter Gourd)', icon: '🥒' },
  { id: 'beans', name: 'French Beans', category: 'vegetables', scientificName: 'Phaseolus vulgaris', localKn: 'ಹುರುಳಿಕಾಯಿ (Beans)', localHi: 'बीन्स (Beans)', icon: '🫛' },
  { id: 'carrot', name: 'Carrot', category: 'vegetables', scientificName: 'Daucus carota', localKn: 'ಗಜ್ಜರಿ (Carrot)', localHi: 'गाजर (Carrot)', icon: '🥕' },
  { id: 'spinach', name: 'Spinach (Palak)', category: 'vegetables', scientificName: 'Spinacia oleracea', localKn: 'ಪಾಲಕ್ (Palak)', localHi: 'पालक (Spinach)', icon: '🥬' },

  // F. FRUITS
  { id: 'mango', name: 'Mango', category: 'fruits', scientificName: 'Mangifera indica', localKn: 'ಮಾವಿನ ಹಣ್ಣು (Mango)', localHi: 'आम (Mango)', icon: '🥭' },
  { id: 'banana', name: 'Banana', category: 'fruits', scientificName: 'Musa acuminata', localKn: 'ಬಾಳೆಹಣ್ಣು (Banana)', localHi: 'केला (Banana)', icon: '🍌' },
  { id: 'grapes', name: 'Grapes', category: 'fruits', scientificName: 'Vitis vinifera', localKn: 'ದ್ರಾಕ್ಷಿ (Grapes)', localHi: 'अंगूर (Grapes)', icon: '🍇' },
  { id: 'papaya', name: 'Papaya', category: 'fruits', scientificName: 'Carica papaya', localKn: 'ಪಪ್ಪಾಯಿ (Papaya)', localHi: 'पपीता (Papaya)', icon: '🍈' },
  { id: 'pomegranate', name: 'Pomegranate', category: 'fruits', scientificName: 'Punica granatum', localKn: 'ದಾಳಿಂಬೆ (Pomegranate)', localHi: 'अनार (Pomegranate)', icon: '🍎' },
  { id: 'guava', name: 'Guava', category: 'fruits', scientificName: 'Psidium guajava', localKn: 'ಸೀಬೆಹಣ್ಣು (Guava)', localHi: 'अमरूद (Guava)', icon: '🍐' },
  { id: 'citrus', name: 'Citrus (Lemon / Sweet Orange)', category: 'fruits', scientificName: 'Citrus spp.', localKn: 'ನಿಂಬೆ / ಮೊಸಂಬಿ (Citrus)', localHi: 'नींबू / संतरा (Citrus)', icon: '🍋' },
  { id: 'apple', name: 'Apple', category: 'fruits', scientificName: 'Malus domestica', localKn: 'ಸೇಬು (Apple)', localHi: 'सेब (Apple)', icon: '🍏' },
  { id: 'watermelon', name: 'Watermelon', category: 'fruits', scientificName: 'Citrullus lanatus', localKn: 'ಕಲ್ಲಂಗಡಿ (Watermelon)', localHi: 'तरबूज (Watermelon)', icon: '🍉' },
  { id: 'muskmelon', name: 'Muskmelon', category: 'fruits', scientificName: 'Cucumis melo', localKn: 'ಖರ್ಬೂಜ (Muskmelon)', localHi: 'खरबूजा (Muskmelon)', icon: '🍈' },

  // G. PLANTATION AND SPICES
  { id: 'coconut', name: 'Coconut', category: 'plantation', scientificName: 'Cocos nucifera', localKn: 'ತೆಂಗು (Coconut)', localHi: 'नारियल (Coconut)', icon: '🥥' },
  { id: 'arecanut', name: 'Arecanut (Betel Nut)', category: 'plantation', scientificName: 'Areca catechu', localKn: 'ಅಡಿಕೆ (Arecanut)', localHi: 'सुपारी (Arecanut)', icon: '🌴' },
  { id: 'coffee', name: 'Coffee', category: 'plantation', scientificName: 'Coffea arabica', localKn: 'ಕಾಫಿ (Coffee)', localHi: 'कॉफी (Coffee)', icon: '☕' },
  { id: 'tea', name: 'Tea', category: 'plantation', scientificName: 'Camellia sinensis', localKn: 'ಟೀ / ಚಹಾ (Tea)', localHi: 'चाय (Tea)', icon: '🍵' },
  { id: 'pepper', name: 'Black Pepper', category: 'plantation', scientificName: 'Piper nigrum', localKn: 'ಕಾಳು ಮೆಣಸು (Pepper)', localHi: 'काली मिर्च (Black Pepper)', icon: '🌿' },
  { id: 'cardamom', name: 'Cardamom', category: 'plantation', scientificName: 'Elettaria cardamomum', localKn: 'ಏಲಕ್ಕಿ (Cardamom)', localHi: 'इलायची (Cardamom)', icon: '🌱' },
  { id: 'turmeric', name: 'Turmeric', category: 'plantation', scientificName: 'Curcuma longa', localKn: 'ಅರಿಶಿನ (Turmeric)', localHi: 'हल्दी (Turmeric)', icon: '🟡' },
  { id: 'ginger', name: 'Ginger', category: 'plantation', scientificName: 'Zingiber officinale', localKn: 'ಶುಂಠಿ (Ginger)', localHi: 'अदरक (Ginger)', icon: '🫚' },

  // H. OTHER PLANTS
  { id: 'ornamental', name: 'Ornamental / Flowering Plants', category: 'other', scientificName: 'Various spp.', localKn: 'ಅಲಂಕಾರಿಕ ಸಸ್ಯಗಳು', localHi: 'सजावटी व फूल वाले पौधे', icon: '🌸' },
  { id: 'garden', name: 'Garden / House Plants', category: 'other', scientificName: 'Various spp.', localKn: 'ಮನೆ ಹಾಗೂ ತೋಟದ ಗಿಡಗಳು', localHi: 'घर व बगीचे के पौधे', icon: '🪴' },
  { id: 'trees', name: 'Common Farm & Shade Trees', category: 'other', scientificName: 'Various spp.', localKn: 'ಸಾಮಾನ್ಯ ಕೃಷಿ ಮರಗಳು (ಬೇವು, ಇತ್ಯಾದಿ)', localHi: 'सामान्य कृषि वृक्ष (नीम, आदि)', icon: '🌳' },
  { id: 'medicinal', name: 'Medicinal Plants (Tulsi, Aloe, Neem)', category: 'other', scientificName: 'Various spp.', localKn: 'ಔಷಧೀಯ ಸಸ್ಯಗಳು (ತುಳಸಿ, ಅಲೋವೆರಾ)', localHi: 'औषधीय पौधे (तुलसी, एलोवेरा)', icon: '🌿' },
  { id: 'unidentified', name: 'Other Unidentified Plant / Crop', category: 'other', scientificName: 'Plantae incertae', localKn: 'ಇತರ ಅನಿರ್ದಿಷ್ಟ ಸಸ್ಯ', localHi: 'अन्य अनिर्धारित पौधा', icon: '🔍' }
];

/**
 * Find crop metadata by ID or name
 */
export function findCropMetadata(idOrName) {
  if (!idOrName) return null;
  const q = idOrName.toLowerCase().trim();
  return ALL_SUPPORTED_CROPS.find(c => 
    c.id.toLowerCase() === q ||
    c.name.toLowerCase().includes(q) ||
    c.localKn.toLowerCase().includes(q) ||
    c.localHi.toLowerCase().includes(q) ||
    (c.scientificName && c.scientificName.toLowerCase().includes(q))
  ) || null;
}
