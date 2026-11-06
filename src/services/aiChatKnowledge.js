/**
 * KrishiMitra Comprehensive Agricultural Knowledge Library (ಕೃಷಿಮಿತ್ರ ಕೃಷಿ ಜ್ಞಾನ ಭಂಡಾರ)
 * 
 * Clinical, actionable agronomic knowledge base structured across:
 * - Cereals, Pulses, Oilseeds, Vegetables, Commercial crops, Fruits
 * - Soils, pH management, fertilizers, irrigation, pest & disease remedies
 * - Trilingual: Kannada (kn), English (en), Hindi (hi)
 */

export const CROP_KNOWLEDGE_LIBRARY = {
  // --- CEREALS ---
  rice: {
    id: 'rice',
    names: { en: 'Rice / Paddy', kn: 'ಭತ್ತ (Paddy)', hi: 'धान / चावल (Paddy)' },
    category: 'Cereal',
    soilTypes: ['Alluvial Soil', 'Clay Loam', 'Black Soil with irrigation'],
    idealPh: '5.5 - 7.0',
    waterNeeds: '1200 - 1400 mm (Requires 2-3 cm standing water in tillering phase)',
    seasons: {
      kharif: 'Nursery: May-June; Transplanting: June-July; Harvest: Nov-Dec',
      rabi: 'Sowing: Nov-Dec; Harvest: April-May'
    },
    duration: '115 - 140 days',
    npk: '100:50:50 kg/ha N:P:K + 25 kg Zinc Sulfate (Basal: 100% P & K + 25% N; Tillering: 50% N; Panicle: 25% N)',
    criticalIrrigation: ['Tillering stage', 'Panicle initiation', 'Flowering & Milking stage'],
    majorPests: ['Brown Plant Hopper (BPH)', 'Yellow Stem Borer', 'Leaf Folder'],
    majorDiseases: ['Rice Blast (Pyricularia oryzae)', 'Bacterial Leaf Blight (BLB)', 'Sheath Blight'],
    yieldTips: 'Adopt Alternate Wetting & Drying (AWD) to save 25% water; apply Zinc Sulfate at basal stage to prevent Khaira disease.'
  },

  wheat: {
    id: 'wheat',
    names: { en: 'Wheat', kn: 'ಗೋಧಿ (Wheat)', hi: 'गेहूं (Wheat)' },
    category: 'Cereal',
    soilTypes: ['Well-drained Alluvial Loam', 'Clay Loam', 'Medium Black Soil'],
    idealPh: '6.0 - 7.5',
    waterNeeds: '450 - 550 mm (4 to 6 critical irrigations)',
    seasons: { rabi: 'Sowing: Nov 1 - Nov 25; Harvest: March-April' },
    duration: '120 - 135 days',
    npk: '120:60:40 kg/ha N:P:K (Basal: Full P & K + half N; 1st Irrigation: remaining N)',
    criticalIrrigation: ['Crown Root Initiation (CRI at 21 DAS - Most Critical)', 'Tillering', 'Jointing', 'Flowering', 'Milk stage'],
    majorPests: ['Aphids (Mahoo)', 'Termites'],
    majorDiseases: ['Yellow / Stripe Rust', 'Brown Rust', 'Karnal Bunt'],
    yieldTips: 'Never delay the CRI stage irrigation (day 21-25); spray Propiconazole 25% EC @ 1ml/L at first sign of yellow rust.'
  },

  maize: {
    id: 'maize',
    names: { en: 'Maize (Corn)', kn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)', hi: 'मक्का (Maize)' },
    category: 'Cereal',
    soilTypes: ['Well-drained Sandy Loam', 'Medium Black Soil', 'Alluvial Loam'],
    idealPh: '6.0 - 7.2',
    waterNeeds: '500 - 650 mm (Requires uniform moisture; sensitive to waterlogging)',
    seasons: {
      kharif: 'Sowing: June-July; Harvest: Sept-Oct',
      rabi: 'Sowing: Oct-Nov; Harvest: Feb-March'
    },
    duration: '95 - 110 days',
    npk: '120:60:40 kg/ha N:P:K (Split N into 3 doses: Basal, Knee-high, and Tasseling)',
    criticalIrrigation: ['Knee-high stage (30 DAS)', 'Tasseling stage (45-50 DAS)', 'Silking stage (55-60 DAS - Critical)', 'Grain filling'],
    majorPests: ['Fall Armyworm (FAW - Spodoptera frugiperda)', 'Stem Borer'],
    majorDiseases: ['Maydis Leaf Blight', 'Common Rust', 'Turcicum Blight'],
    yieldTips: 'Scout whorls at 10-15 days for Fall Armyworm pinholes; apply Emamectin Benzoate 5% SG @ 0.4g/L in whorl if larvae spotted.'
  },

  // --- COMMERCIAL CROPS ---
  cotton: {
    id: 'cotton',
    names: { en: 'Cotton', kn: 'ಹತ್ತಿ (Cotton)', hi: 'कपास (Cotton)' },
    category: 'Commercial',
    soilTypes: ['Deep Black Cotton Soil (Regur)', 'Medium Black Vertisol', 'Well-drained Sandy Loam'],
    idealPh: '6.5 - 8.0',
    waterNeeds: '700 - 850 mm (Moderate drought tolerance; deep taproot)',
    seasons: { kharif: 'Sowing: May-June (with onset of monsoon); Harvest: Oct-Jan' },
    duration: '150 - 180 days',
    npk: '120:60:60 kg/ha N:P:K (Split N: 25% Basal, 50% Square formation, 25% Flowering)',
    criticalIrrigation: ['Square formation (45-50 DAS)', 'Flowering', 'Boll development (70-90 DAS)'],
    majorPests: ['Pink Bollworm (PBW)', 'Whitefly', 'Jassids', 'Aphids', 'Thrips'],
    majorDiseases: ['Cotton Leaf Curl Virus (CLCuV)', 'Bacterial Blight / Angular Leaf Spot', 'Root Rot'],
    yieldTips: 'Install 8 pheromone traps per acre for Pink Bollworm monitoring; spray cold-pressed Neem oil 1500ppm @ 5ml/L for sucking pests.'
  },

  // --- VEGETABLES ---
  tomato: {
    id: 'tomato',
    names: { en: 'Tomato', kn: 'ಟೊಮೆಟೊ (Tomato)', hi: 'टमाटर (Tomato)' },
    category: 'Vegetable',
    soilTypes: ['Well-drained Sandy Loam', 'Red Loam', 'Medium Black Soil'],
    idealPh: '6.0 - 7.0',
    waterNeeds: '400 - 600 mm (Drip irrigation recommended; avoid wetting foliage)',
    seasons: {
      kharif: 'Transplanting: June-July',
      rabi: 'Transplanting: Oct-Nov',
      summer: 'Transplanting: Jan-Feb'
    },
    duration: '90 - 120 days',
    npk: '100:60:60 kg/ha N:P:K + Calcium & Boron for fruit firmness',
    criticalIrrigation: ['Post-transplant establishment', 'Flowering', 'Fruit expansion (maintain uniform soil moisture to avoid blossom end rot)'],
    majorPests: ['Tomato Fruit Borer (Helicoverpa)', 'Tuta absoluta (Leaf miner)', 'Whitefly'],
    majorDiseases: ['Early Blight (Alternaria solani)', 'Late Blight (Phytophthora)', 'Tomato Leaf Curl Virus (ToLCV)'],
    yieldTips: 'Stake plants to keep fruit off the soil; spray Mancozeb 75% WP @ 2.5g/L for blight; supply Calcium Nitrate @ 2g/L to prevent blossom-end rot.'
  },

  chilli: {
    id: 'chilli',
    names: { en: 'Chilli / Pepper', kn: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)', hi: 'मिर्च (Chilli)' },
    category: 'Vegetable',
    soilTypes: ['Well-drained Black Loam', 'Red Sandy Loam'],
    idealPh: '6.2 - 7.5',
    waterNeeds: '500 - 600 mm (Sensitive to standing water stagnation)',
    seasons: { kharif: 'Transplanting: July-Aug; Harvest: Oct-Feb' },
    duration: '120 - 150 days',
    npk: '100:50:50 kg/ha N:P:K + Micronutrients (Zinc & Boron)',
    criticalIrrigation: ['Flowering stage', 'Fruit setting'],
    majorPests: ['Thrips (Murda disease)', 'Yellow Mites', 'Fruit Borer'],
    majorDiseases: ['Anthracnose / Dieback', 'Powdery Mildew', 'Chilli Veinal Mottle Virus'],
    yieldTips: 'Install Blue sticky traps for thrips and Yellow traps for whiteflies; spray Fipronil 5% SC @ 1.5ml/L or Neem oil.'
  },

  potato: {
    id: 'potato',
    names: { en: 'Potato', kn: 'ಆಲೂಗಡ್ಡೆ (Potato)', hi: 'आलू (Potato)' },
    category: 'Vegetable / Tuber',
    soilTypes: ['Loose, Friable Sandy Loam', 'Alluvial Loam rich in organic matter'],
    idealPh: '5.2 - 6.5',
    waterNeeds: '400 - 500 mm (Light, frequent irrigations)',
    seasons: { rabi: 'Sowing: Oct 15 - Nov 15; Harvest: Jan-March' },
    duration: '80 - 105 days',
    npk: '120:80:100 kg/ha N:P:K (Potash is vital for tuber sizing and starch)',
    criticalIrrigation: ['Stolon formation (20-25 DAS)', 'Tuber initiation (35-40 DAS)', 'Tuber bulking (50-65 DAS)'],
    majorPests: ['Aphids', 'Potato Tuber Moth (PTM)', 'Cutworms'],
    majorDiseases: ['Late Blight (Phytophthora infestans)', 'Early Blight', 'Black Scurf'],
    yieldTips: 'Perform earthing up twice at 25 and 45 days to keep growing tubers buried away from sunlight (preventing greening/solanine).'
  },

  onion: {
    id: 'onion',
    names: { en: 'Onion', kn: 'ಈರುಳ್ಳಿ (Onion)', hi: 'प्याज (Onion)' },
    category: 'Vegetable / Bulb',
    soilTypes: ['Well-drained Sandy Loam', 'Medium Black Soil rich in humus'],
    idealPh: '6.0 - 7.5',
    waterNeeds: '350 - 500 mm (Stop irrigation 10-15 days before harvest for neck curing)',
    seasons: {
      kharif: 'Transplant: July-Aug',
      late_kharif: 'Transplant: Sept-Oct',
      rabi: 'Transplant: Dec-Jan; Harvest: April-May'
    },
    duration: '110 - 130 days',
    npk: '100:50:50 kg/ha N:P:K + 20 kg Elemental Sulfur (boosts pungency and storage life)',
    criticalIrrigation: ['Bulb initiation (35-40 DAS)', 'Bulb development (60-75 DAS)'],
    majorPests: ['Thrips tabaci', 'Maggots'],
    majorDiseases: ['Purple Blotch (Alternaria porri)', 'Stemphylium Blight', 'Basal Rot'],
    yieldTips: 'Apply Sulfur @ 20 kg/acre to improve bulb firmness; withhold water 12 days before pulling bulbs to ensure long shelf life.'
  },

  // --- PULSES & OILSEEDS ---
  soybean: {
    id: 'soybean',
    names: { en: 'Soybean', kn: 'ಸೋಯಾಬೀನ್ (Soybean)', hi: 'सोयाबीन (Soybean)' },
    category: 'Oilseed / Legume',
    soilTypes: ['Medium Black Cotton Soil', 'Deep Loam with good drainage'],
    idealPh: '6.0 - 7.5',
    waterNeeds: '450 - 600 mm (Fixes atmospheric nitrogen naturally)',
    seasons: { kharif: 'Sowing: June 15 - July 10; Harvest: Sept-Oct' },
    duration: '90 - 105 days',
    npk: '20:60:40 kg/ha N:P:K + 20 kg Sulfur + Rhizobium seed inoculation',
    criticalIrrigation: ['Flowering stage (35-40 DAS)', 'Pod development (55-65 DAS)'],
    majorPests: ['Girdle Beetle', 'Semilooper', 'Tobacco Caterpillar'],
    majorDiseases: ['Yellow Mosaic Virus (YMV)', 'Rust', 'Collar Rot'],
    yieldTips: 'Treat seed with Bradyrhizobium japonicum + Trichoderma @ 5g/kg; do not sow deeper than 3-4 cm.'
  },

  groundnut: {
    id: 'groundnut',
    names: { en: 'Groundnut / Peanut', kn: 'ಕಡಲೆಕಾಯಿ (Groundnut)', hi: 'मूंगफली (Groundnut)' },
    category: 'Oilseed / Legume',
    soilTypes: ['Sandy Loam', 'Red Sandy Soil', 'Light Loam (allows easy pegging)'],
    idealPh: '6.0 - 7.0',
    waterNeeds: '450 - 550 mm (Avoid compact heavy clay which hinders peg entry)',
    seasons: {
      kharif: 'Sowing: June-July',
      rabi_summer: 'Sowing: Jan-Feb; Harvest: April-May'
    },
    duration: '105 - 120 days',
    npk: '20:40:40 kg/ha N:P:K + 200 kg Gypsum/acre at flowering (vital for pod filling)',
    criticalIrrigation: ['Flowering', 'Peg penetration (35-45 DAS)', 'Pod development'],
    majorPests: ['White Grub', 'Leaf Miner', 'Spodoptera'],
    majorDiseases: ['Tikka Disease (Cercospora leaf spot)', 'Rust', 'Collar Rot'],
    yieldTips: 'Apply Gypsum (calcium sulfate) @ 200 kg/acre at 40-45 days around plant root zone to prevent empty pods (pops).'
  },

  chickpea: {
    id: 'chickpea',
    names: { en: 'Chickpea / Bengal Gram', kn: 'ಕಡಲೆ (Chana)', hi: 'चना / छोले (Gram)' },
    category: 'Pulse / Legume',
    soilTypes: ['Medium to Deep Black Vertisol', 'Well-drained Silt Loam'],
    idealPh: '6.5 - 8.0',
    waterNeeds: '250 - 350 mm (Very low water requirement; drought hardy)',
    seasons: { rabi: 'Sowing: Oct 15 - Nov 15; Harvest: Feb-March' },
    duration: '95 - 110 days',
    npk: '20:40:20 kg/ha N:P:K + Rhizobium culture',
    criticalIrrigation: ['Pre-flowering vegetative phase', 'Pod formation (Never irrigate during peak flowering!)'],
    majorPests: ['Gram Pod Borer (Helicoverpa armigera)'],
    majorDiseases: ['Fusarium Wilt', 'Ascochyta Blight', 'Dry Root Rot'],
    yieldTips: 'Strictly avoid flood watering during peak flowering as it triggers flower drop; install T-shaped bird perches @ 15/acre.'
  }
};

/**
 * Soil Management & Agronomy Knowledge
 */
export const SOIL_KNOWLEDGE = {
  black_soil: {
    title: { en: 'Black Cotton Soil (Regur / Vertisol)', kn: 'ಕರಿ ಮಣ್ಣು (Black Cotton Soil)', hi: 'काली मिट्टी (रेगुर)' },
    properties: 'High clay content (40-60%), high water retention capacity, shrinks and cracks when dry, self-ploughing, rich in calcium, magnesium, potassium and iron, low in nitrogen and phosphorus.',
    suitableCrops: ['Cotton', 'Soybean', 'Chickpea (Chana)', 'Wheat (irrigated)', 'Sorghum (Jowar)', 'Pigeon Pea (Tur)', 'Sunflower', 'Chilli'],
    managementTips: [
      'Avoid heavy tillage when wet to prevent hard compaction.',
      'Adopt broad bed and furrow (BBF) system to drain excess monsoon water and avoid root rot.',
      'Excellent for rainfed and moisture-stress Rabi crops like chickpea and rabi sorghum.'
    ]
  },

  red_soil: {
    title: { en: 'Red Sandy Loam Soil', kn: 'ಕೆಂಪು ಮಣ್ಣು (Red Sandy Loam)', hi: 'लाल बलुई दोमट मिट्टी' },
    properties: 'Formed from crystalline rocks, rich in iron oxides (gives red hue), porous structure, quick drainage, low water holding capacity, low nitrogen, phosphorus and humus.',
    suitableCrops: ['Groundnut', 'Ragi (Finger Millet)', 'Maize', 'Pigeon Pea', 'Castor', 'Vegetables (Tomato, Brinjal, Chilli)', 'Pomegranate', 'Mango'],
    managementTips: [
      'Incorporate 3-4 tons/acre Farmyard Manure (FYM) or compost to improve water retention.',
      'Adopt drip irrigation or mulching to prevent rapid surface moisture loss.',
      'Apply single super phosphate (SSP) as red soils readily fix phosphorus.'
    ]
  },

  alluvial_soil: {
    title: { en: 'Alluvial Loam / River Delta Soil', kn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು (Alluvial Soil)', hi: 'जलोढ़ दोमಟ್ मिट्टी' },
    properties: 'Deep, rich in potash and phosphoric acid, balanced silt and clay, highly fertile, neutral to slightly alkaline pH.',
    suitableCrops: ['Rice / Paddy', 'Wheat', 'Sugarcane', 'Mustard', 'Vegetables', 'Maize', 'Pulses'],
    managementTips: [
      'Ideal for intensive multiple-cropping rotations (e.g. Rice-Wheat-Moong).',
      'Test soil for micronutrients like Zinc and Boron every two years.'
    ]
  },

  soil_ph: {
    acidic: {
      range: 'pH < 6.0',
      remedy: 'Apply Agricultural Lime (Calcium Carbonate / Dolomite) @ 1 to 2 tons/hectare mixed into the top 15 cm soil 3 weeks before sowing to neutralize acidity.',
      suitableCrops: ['Tea', 'Coffee', 'Rice', 'Potato', 'Sweet Potato']
    },
    neutral: {
      range: 'pH 6.2 - 7.5',
      remedy: 'Optimum fertility range! Most plant nutrients (N, P, K, Ca, Mg, S) are at maximum bioavailability. Maintain with regular organic manure.',
      suitableCrops: ['Almost all cereals, vegetables, pulses and commercial crops.']
    },
    alkaline: {
      range: 'pH > 8.0 (Saline / Sodic Soil)',
      remedy: 'Apply Agricultural Gypsum (Calcium Sulfate) @ 2 to 3 tons/acre followed by heavy leaching irrigation. Grow green manure crops like Dhaincha (Sesbania) or Sunn hemp and incorporate at 45 days.',
      suitableCrops: ['Barley', 'Cotton', 'Beetroot', 'Mustard', 'Bermuda Grass']
    }
  },

  soil_fertility: {
    steps: [
      'Apply 2-3 tons/acre well-decomposed Farmyard Manure (FYM) or Vermicompost before sowing.',
      'Practice green manuring by sowing Dhaincha or Sunn hemp and plowing it in at flowering (45 DAS).',
      'Incorporate biofertilizers: Rhizobium for pulses, Azotobacter / Azospirillum for cereals, and PSB (Phosphate Solubilizing Bacteria).',
      'Adopt 3-year crop rotation: alternate heavy nitrogen-feeding crops (wheat/cotton/maize) with leguminous pulse crops (chickpea/soybean/moong) that fix soil nitrogen.'
    ]
  }
};

/**
 * Plant Problems & Yellow Leaves Diagnostic Logic
 */
export const PLANT_PROBLEMS_KNOWLEDGE = {
  yellow_leaves: {
    title: 'Comprehensive Diagnostic Guide for Yellow Leaves (Chlorosis)',
    causes: [
      {
        cause: 'Nitrogen (N) Deficiency',
        pattern: 'Older, lower leaves turn uniformly pale yellow first, spreading upward; veins and leaf blade yellow evenly.',
        remedy: 'Apply split top dressing of Urea (25-30 kg/acre) with irrigation, or foliar spray 1% to 2% Urea solution (10-20g per liter water).'
      },
      {
        cause: 'Iron (Fe) or Zinc (Zn) Micronutrient Deficiency',
        pattern: 'Young upper leaves turn yellow while the veins remain dark green ("interveinal chlorosis").',
        remedy: 'For Zinc: spray 0.5% Zinc Sulfate (5g/L) + 0.25% lime. For Iron: spray 0.5% Ferrous Sulfate (5g/L) on foliage early morning.'
      },
      {
        cause: 'Waterlogging & Root Asphyxiation',
        pattern: 'Leaves turn limp, soft yellow after heavy rain or over-irrigation; soil stays muddy and roots suffocate.',
        remedy: 'Immediately open field drainage ditches to let water drain; loosen surface soil crust once dry; avoid further irrigation.'
      },
      {
        cause: 'Sucking Pests & Viral Infection (e.g. Whitefly / Aphids)',
        pattern: 'Yellow mosaic mottling, upward or downward leaf curling, crinkled leaves with sticky honeydew underneath.',
        remedy: 'Install yellow sticky traps; spray cold-pressed Neem oil (1500 ppm @ 5ml/L) or Flonicamid 50% WG @ 0.4g/L to control vector insects.'
      },
      {
        cause: 'Root Rot or Vascular Wilt (Fungal)',
        pattern: 'One-sided yellowing and sudden wilting of foliage during daytime despite wet soil; brown discoloration inside stem base.',
        remedy: 'Drench root zone with Copper Oxychloride 50% WP @ 3g/L or bio-fungicide Trichoderma viride @ 10g/L.'
      }
    ]
  },

  heavy_rainfall: {
    precautions: [
      'Field Drainage: Immediately dig or open border drainage trenches to channel excess standing water out of the field within 24 hours to prevent root rot.',
      'Postpone Chemical Operations: Strictly stop fertilizer broadcasting and pesticide spraying before or during rains (rain washes away inputs within 4-6 hours).',
      'Earthing Up: Provide mound soil support around the base of tall crops (maize, sugarcane, cotton) to prevent lodging from heavy winds.',
      'Post-Rain Disease Prevention: Once leaves dry after heavy spells, spray Mancozeb 75% WP @ 2.5g/L or Copper Oxychloride @ 3g/L to halt rapid fungal spore germination.',
      'Foliar Booster: After waterlogged stress, spray 1% 19:19:19 soluble fertilizer or 0.5% Urea to jump-start root nutrient uptake.'
    ]
  },

  increase_yield: {
    steps: [
      'Certified High-Yielding Seeds: Always sow certified varieties suited to your region (e.g. HD-3086 wheat, JS-9560 soybean, Improved Samba Mahsuri rice).',
      'Seed Treatment (Beej Sanskar): Treat seeds with Trichoderma viride (5g/kg) and Rhizobium/Azotobacter before sowing to safeguard against soil-borne damping-off.',
      'Optimum Plant Geometry: Maintain recommended row-to-row and plant-to-plant spacing for maximum solar radiation capture and aeration.',
      'Balanced Nutrition: Apply fertilizers according to growth stages (basal P & K + split nitrogen doses) rather than single heavy dumping.',
      'Weed-Free Critical Period: Keep the field completely weed-free for the first 30 to 40 days when weeds compete most fiercely for nutrients and moisture.'
    ]
  }
};
