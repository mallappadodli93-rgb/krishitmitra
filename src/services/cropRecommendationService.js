/**
 * Agricultural Crop Recommendation Engine for KrishiMitra (ಕೃಷಿಮಿತ್ರ)
 * 
 * Comprehensive 5-Stage Location-Based Crop Recommendation System.
 * 
 * Workflow:
 * Step 1: Get the farmer's saved Google Maps farm location (Coordinates, Village, District, State).
 * Step 2: Retrieve real-time weather & forecast information (Open-Meteo API with regional fallback).
 * Step 3: Collect soil & agricultural information from reliable agricultural sources (ICAR/NBSS&LUP benchmarks & farmer input).
 * Step 4: Compare farm conditions with crop requirements (Transparent 100-point rule-based logic + ML readiness adapter).
 * Step 5: Display the top five suitable crop recommendations with precautions, scaled yields, economics, and side-by-side comparison.
 * 
 * Important Principle:
 * Google Maps provides geographical location, NOT crop recommendations.
 * Do not invent soil conditions or claim that location alone guarantees crop suitability.
 */

import { DISTRICT_WEATHER_DATA } from '../data/weatherData';

// ICAR & National Bureau of Soil Survey and Land Use Planning (NBSS&LUP) Regional Reference Data
export const ICAR_REGIONAL_SOIL_BENCHMARKS = {
  'Raichur': {
    state: 'Karnataka',
    agroZone: 'North Eastern Dry Agro-Climatic Zone (Zone-2)',
    predominantSoil: 'Black / Regur Soil (Clayey)',
    baselinePhMin: 7.2,
    baselinePhMax: 8.2,
    organicCarbon: 'Medium (0.45 - 0.60%)',
    majorCrops: 'Paddy, Cotton, Groundnut, Bajra, Chilli',
    source: 'ICAR-CRIDA & UAS Raichur District Agriculture Contingency Plan'
  },
  'Davanagere': {
    state: 'Karnataka',
    agroZone: 'Central Dry Agro-Climatic Zone (Zone-4)',
    predominantSoil: 'Red Sandy Loam / Red Soil',
    baselinePhMin: 6.4,
    baselinePhMax: 7.4,
    organicCarbon: 'Medium (0.50 - 0.65%)',
    majorCrops: 'Maize, Paddy, Ragi, Cotton, Arecanut',
    source: 'ICAR-KVK Davanagere & Dept of Agriculture Karnataka'
  },
  'Mandya': {
    state: 'Karnataka',
    agroZone: 'Southern Dry Agro-Climatic Zone (Zone-6)',
    predominantSoil: 'Alluvial / River Plains Loam',
    baselinePhMin: 6.5,
    baselinePhMax: 7.3,
    organicCarbon: 'High (0.65 - 0.80%)',
    majorCrops: 'Sugarcane, Paddy, Ragi, Vegetables',
    source: 'ICAR-VC Farm Mandya & Cauvery Irrigation Command'
  },
  'Hassan': {
    state: 'Karnataka',
    agroZone: 'Southern Transition & Hilly Zone (Zone-7)',
    predominantSoil: 'Red Sandy Loam / Red Soil',
    baselinePhMin: 5.5,
    baselinePhMax: 6.8,
    organicCarbon: 'High (0.70 - 0.90%)',
    majorCrops: 'Ragi, Potato, Maize, Ginger, Coffee',
    source: 'UAS Bengaluru & ICAR Hassan Agro-Met Advisory'
  },
  'Nashik': {
    state: 'Maharashtra',
    agroZone: 'Western Maharashtra Ghat & Scarcity Zone',
    predominantSoil: 'Black / Regur Soil (Clayey)',
    baselinePhMin: 6.8,
    baselinePhMax: 7.8,
    organicCarbon: 'Medium to High (0.55 - 0.75%)',
    majorCrops: 'Onion, Grapes, Wheat, Soybean, Tomato',
    source: 'MPKV Rahuri & ICAR-KVK Nashik'
  },
  'Ludhiana': {
    state: 'Punjab',
    agroZone: 'Central Plain Zone of Punjab (Trans-Gangetic)',
    predominantSoil: 'Alluvial / River Plains Loam',
    baselinePhMin: 7.0,
    baselinePhMax: 7.8,
    organicCarbon: 'Medium (0.45 - 0.60%)',
    majorCrops: 'Wheat, Basmati Paddy, Maize, Mustard',
    source: 'Punjab Agricultural University (PAU) & ICAR'
  },
  'Rajkot': {
    state: 'Gujarat',
    agroZone: 'North Saurashtra Agro-Climatic Zone',
    predominantSoil: 'Red Sandy Loam / Red Soil',
    baselinePhMin: 7.2,
    baselinePhMax: 8.3,
    organicCarbon: 'Low to Medium (0.35 - 0.50%)',
    majorCrops: 'Groundnut, Cotton, Cumin, Sesame',
    source: 'Junagadh Agricultural University (JAU) & ICAR'
  },
  'Guntur': {
    state: 'Andhra Pradesh',
    agroZone: 'Krishna-Godavari Coastal Delta Zone',
    predominantSoil: 'Black / Regur Soil (Clayey)',
    baselinePhMin: 6.8,
    baselinePhMax: 8.0,
    organicCarbon: 'Medium (0.50 - 0.65%)',
    majorCrops: 'Chilli, Cotton, Paddy, Black Gram',
    source: 'ANGRAU Guntur & ICAR-CTRI'
  }
};

// Comprehensive 16-Crop Agricultural Knowledge Base
export const CROPS_CATALOG = [
  {
    id: 'paddy-rice',
    name: 'Rice / Paddy',
    localNameKn: 'ಭತ್ತ (Paddy)',
    localNameHi: 'धान (Paddy)',
    variety: 'BPT-5204 (Samba Mahsuri) / IR-64',
    category: 'Cereal / Food Grain',
    image: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Clay Loam / Heavy Silt Clay', 'Black / Regur Soil (Clayey)'],
    toleratedSoils: ['Red Sandy Loam / Red Soil'],
    soilRequirements: 'Heavy clayey loam or alluvial soil with high water retention capacity and rich organic matter. Subsoil compaction or clay pan prevents percolation loss.',
    idealPhMin: 5.5,
    idealPhMax: 7.2,
    phBuffer: 0.8,
    primarySeasons: ['Kharif'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'High',
    waterRequirement: 'High (1,200 - 1,500 mm)',
    waterDescription: 'Requires continuous standing water (3-5 cm) from transplanting through heading stages. AWD (Alternate Wetting and Drying) recommended.',
    optimalTempMin: 22,
    optimalTempMax: 33,
    tempTolerance: 5,
    weatherDescription: 'Thrives in warm, humid weather with temperatures between 22°C and 33°C. High solar radiation during ripening dramatically increases carbohydrate grain filling.',
    growingDuration: '125 - 145 Days',
    yieldPerAcreMin: 22,
    yieldPerAcreMax: 28,
    profitPerAcreMin: 55000,
    profitPerAcreMax: 75000,
    importantPrecautions: [
      'Avoid continuous stagnant deep flooding; drain water periodically for 2 days to aerate root zone.',
      'Scout for Blast disease (Pyricularia oryzae) and Brown Plant Hopper (BPH) at maximum tillering.',
      'Stop irrigation 10 to 12 days prior to expected harvest to facilitate uniform grain drying.',
      'Apply Zinc Sulfate (21%) @ 10 kg/acre as basal dose to protect against Khaira deficiency.'
    ],
    keyFarmingTips: [
      'Transplant 22-25 day old seedlings at 20x15 cm spacing with 2 seedlings per hill.',
      'Adopt Alternate Wetting & Drying (AWD) to reduce irrigation water by 25% without yield penalty.',
      'Use leaf color chart (LCC) to schedule split top-dressing of nitrogen at active tillering and panicle initiation.'
    ]
  },
  {
    id: 'wheat-hd',
    name: 'Wheat',
    localNameKn: 'ಗೋಧಿ (Wheat)',
    localNameHi: 'गेहूं (Wheat)',
    variety: 'HD-3086 (Pusa Gautami) / GW-322',
    category: 'Cereal / Winter Staple',
    image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Black / Regur Soil (Clayey)', 'Clay Loam / Heavy Silt Clay'],
    toleratedSoils: ['Red Sandy Loam / Red Soil'],
    soilRequirements: 'Well-drained, fertile, deep loamy or alluvial soil with good aeration and crumb structure. Avoid waterlogged or saline ground.',
    idealPhMin: 6.0,
    idealPhMax: 7.5,
    phBuffer: 0.6,
    primarySeasons: ['Rabi'],
    secondarySeasons: [],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (450 - 650 mm)',
    waterDescription: 'Requires 4 to 6 timely irrigations at critical phenological stages: Crown Root Initiation (21 DAS), tillering, flowering, and grain filling.',
    optimalTempMin: 15,
    optimalTempMax: 26,
    tempTolerance: 4,
    weatherDescription: 'Requires cool, dry winter weather during vegetative growth and bright sunny days during grain maturity. High temperature (>30°C) during heading causes terminal heat shrivelling.',
    growingDuration: '115 - 125 Days',
    yieldPerAcreMin: 20,
    yieldPerAcreMax: 25,
    profitPerAcreMin: 50000,
    profitPerAcreMax: 68000,
    importantPrecautions: [
      'Terminal Heat Warning: Sowing delayed beyond Nov 30 causes sudden forced ripening and shrivelled grain.',
      'First irrigation at Crown Root Initiation (CRI) stage (21 days after sowing) is mandatory; skipping it cuts yield by 30%.',
      'Do not irrigate during windy afternoon hours to avoid lodging (plants falling flat).',
      'Scout for yellow rust (Puccinia striiformis) on upper leaves during humid foggy January mornings.'
    ],
    keyFarmingTips: [
      'Optimal sowing window is Nov 5 to Nov 25. Treat seeds with Vitavax @ 2.5 g/kg seed to prevent loose smut.',
      'Maintain 22.5 cm line spacing at 4-5 cm depth using seed-cum-fertilizer drill.',
      'Apply 1/2 Nitrogen + full Phosphorus & Potash as basal; top dress remaining Nitrogen in two equal splits.'
    ]
  },
  {
    id: 'ragi-finger-millet',
    name: 'Ragi (Finger Millet)',
    localNameKn: 'ರಾಗಿ (Finger Millet)',
    localNameHi: 'रागी / मडुआ (Finger Millet)',
    variety: 'GPU-28 / MR-1 / ML-365',
    category: 'Nutri-Cereal / Millet',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Red Sandy Loam / Red Soil', 'Laterite Soil (Acidic / Red Loam)', 'Alluvial / River Plains Loam'],
    toleratedSoils: ['Sandy Soil / Arid Loam', 'Black / Regur Soil (Clayey)'],
    soilRequirements: 'Performs remarkably well in red sandy loam, laterite, and gravelly upland soils. Tolerates acidic pH (down to 5.0) and moderate soil salinity.',
    idealPhMin: 5.0,
    idealPhMax: 7.0,
    phBuffer: 0.9,
    primarySeasons: ['Kharif', 'Rabi'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Low',
    waterRequirement: 'Low to Moderate (350 - 450 mm)',
    waterDescription: 'Highly drought-resilient C4 crop. Thrives in rainfed conditions with just 2-3 protective irrigations during dry spells.',
    optimalTempMin: 20,
    optimalTempMax: 32,
    tempTolerance: 6,
    weatherDescription: 'Warm, semi-arid climate with moderate rainfall. Adapts comfortably to both plateau sunshine and misty foothill conditions.',
    growingDuration: '100 - 115 Days',
    yieldPerAcreMin: 14,
    yieldPerAcreMax: 18,
    profitPerAcreMin: 42000,
    profitPerAcreMax: 58000,
    importantPrecautions: [
      'Avoid water stagnation at seedling stage; ensure field has good drainage gradients.',
      'Watch for neck blast and finger blast during prolonged cloudy humid spells at heading stage.',
      'Thin out dense broadcasted seedlings at 15-18 DAS; overcrowding results in slender non-productive tillers.',
      'Protect mature earheads from unseasonal pre-harvest rains to prevent grain discolouration.'
    ],
    keyFarmingTips: [
      'Inoculate seeds with Azospirillum brasilense and PSB @ 250 g per 10 kg seed to fix biological nitrogen.',
      'Maintain 22.5 x 10 cm row spacing. Thin crowded seedlings 15 days after emergence for robust tillering.',
      'Spray 1% Potassium Chloride (KCl) during mid-season moisture stress to preserve leaf turgidity.'
    ]
  },
  {
    id: 'cotton-bt',
    name: 'Cotton',
    localNameKn: 'ಹತ್ತಿ (Cotton)',
    localNameHi: 'कपास (Cotton)',
    variety: 'Bt Cotton (RCH-659 / Bunny / Shankar-6)',
    category: 'Commercial Fiber Crop',
    image: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Clay Loam / Heavy Silt Clay'],
    toleratedSoils: ['Alluvial / River Plains Loam'],
    soilRequirements: 'Deep, moisture-retentive black cotton soils (Vertisols) with good sub-surface drainage. High calcium and potassium availability promotes boll weight.',
    idealPhMin: 6.5,
    idealPhMax: 8.2,
    phBuffer: 0.6,
    primarySeasons: ['Kharif'],
    secondarySeasons: [],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (650 - 850 mm)',
    waterDescription: 'Deep taproot system accesses subsoil moisture. Avoid waterlogging during vegetative stage and water stress during boll bursting.',
    optimalTempMin: 23,
    optimalTempMax: 35,
    tempTolerance: 4,
    weatherDescription: 'Needs warm days (24-34°C) with bright sunlight. Minimum 180-200 frost-free days required. Dry weather essential during boll opening.',
    growingDuration: '150 - 170 Days',
    yieldPerAcreMin: 12,
    yieldPerAcreMax: 16,
    profitPerAcreMin: 65000,
    profitPerAcreMax: 90000,
    importantPrecautions: [
      'Pest Precaution: Install pheromone traps (5/acre) at 45 DAS to monitor Pink Bollworm (Pectinophora gossypiella).',
      'Never allow standing water in fields for >24 hours; causes severe parawilt and root rot.',
      'Avoid excess nitrogen application in July-August; causes rank vegetative growth at expense of bolls.',
      'Stop irrigation when 30-40% bolls have opened to maintain clean white lint grade.'
    ],
    keyFarmingTips: [
      'Maintain wide spacing (90x60 cm or 120x45 cm) for adequate air circulation inside canopy.',
      'Install 8 yellow sticky traps per acre for early whitefly and thrips detection.',
      'Spray Magnesium Sulfate (1%) + Urea (1%) at flowering to prevent leaf reddening (Lalya).'
    ]
  },
  {
    id: 'maize-corn',
    name: 'Maize (Corn)',
    localNameKn: 'ಮೆಕ್ಕೆಜೋಳ (Maize)',
    localNameHi: 'मक्का (Maize)',
    variety: 'DKC-9108 / Pioneer-3396 / NK-6240',
    category: 'Cereal / Feed & Fodder',
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Red Sandy Loam / Red Soil', 'Black / Regur Soil (Clayey)'],
    toleratedSoils: ['Clay Loam / Heavy Silt Clay'],
    soilRequirements: 'Deep, fertile, well-drained loamy soils rich in organic matter. Extremely sensitive to water stagnation at seedling stage.',
    idealPhMin: 6.0,
    idealPhMax: 7.5,
    phBuffer: 0.7,
    primarySeasons: ['Kharif', 'Rabi'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (500 - 650 mm)',
    waterDescription: 'Requires uniform moisture. Tasseling and silking (45-60 DAS) are the most moisture-critical stages where stress severely impacts grain setting.',
    optimalTempMin: 18,
    optimalTempMax: 32,
    tempTolerance: 5,
    weatherDescription: 'Warm, temperate to subtropical weather with abundant sunshine. Sensitive to frost and continuous cloudy rainy spells during pollination.',
    growingDuration: '95 - 110 Days',
    yieldPerAcreMin: 25,
    yieldPerAcreMax: 32,
    profitPerAcreMin: 48000,
    profitPerAcreMax: 66000,
    importantPrecautions: [
      'Fall Armyworm (FAW) Alert: Inspect central leaf whorls at 10-20 DAS for pinholes and sawdust frass.',
      'Critical Moisture Window: Water deficit during silking/tasseling (45-60 DAS) reduces grain yield by up to 50%.',
      'Waterlogging: Seedlings cannot survive standing water beyond 24-36 hours.',
      'Ensure complete drying of cobs (12-14% moisture) before shelling to avoid aflatoxin mold.'
    ],
    keyFarmingTips: [
      'Plant at 60x20 cm spacing to ensure optimum population of 33,000 plants per acre.',
      'Apply split nitrogen: 1/3 at sowing, 1/3 at knee-high stage (30 DAS), and 1/3 at tasseling stage.',
      'Spray Emamectin Benzoate 5% SG @ 0.4 g/L if Fall Armyworm infestation is detected.'
    ]
  },
  {
    id: 'groundnut-peanut',
    name: 'Groundnut (Peanut)',
    localNameKn: 'ಕಡಲೆಕಾಯಿ (Groundnut)',
    localNameHi: 'मूंगफली (Groundnut)',
    variety: 'Kadiri-6 (K-6) / TMV-2 / TAG-24',
    category: 'Oilseed / Legume',
    image: 'https://images.unsplash.com/photo-1567894340315-735d7c361db0?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Red Sandy Loam / Red Soil', 'Sandy Soil / Arid Loam'],
    toleratedSoils: ['Alluvial / River Plains Loam'],
    soilRequirements: 'Light, well-drained, loose sandy loam or red loam soils. Loose topsoil texture is indispensable for gynophore (peg) penetration into the ground.',
    idealPhMin: 6.0,
    idealPhMax: 7.2,
    phBuffer: 0.6,
    primarySeasons: ['Kharif', 'Summer / Zaid'],
    secondarySeasons: ['Rabi'],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (450 - 550 mm)',
    waterDescription: 'Critical irrigation periods are flowering and pegging (35-50 DAS). Avoid excessive irrigation near maturity to prevent pod rotting.',
    optimalTempMin: 22,
    optimalTempMax: 32,
    tempTolerance: 4,
    weatherDescription: 'Thrives in warm, sunny weather with moderate rainfall. Heavy continuous rain at harvesting causes underground seed sprouting.',
    growingDuration: '105 - 120 Days',
    yieldPerAcreMin: 12,
    yieldPerAcreMax: 16,
    profitPerAcreMin: 52000,
    profitPerAcreMax: 72000,
    importantPrecautions: [
      'Do NOT perform inter-cultivation or mechanical weeding once pegging starts (35-40 DAS); breaks pegs.',
      'Apply Gypsum @ 200 kg/acre at 40 DAS; calcium deficiency causes empty pods (pops).',
      'Harvest timely when inner pod shell turns dark brown; delayed harvest leads to in-situ sprouting.',
      'Dry harvested pods under sun until moisture drops below 9% before storage.'
    ],
    keyFarmingTips: [
      'Apply Gypsum @ 200 kg/acre at pegging stage for superior pod filling and oil percentage.',
      'Seed treatment with Trichoderma viride @ 4 g/kg seed shields against collar rot and root rot.',
      'Maintain 30x10 cm plant geometry for bunch varieties.'
    ]
  },
  {
    id: 'chickpea-gram',
    name: 'Chickpea / Bengal Gram',
    localNameKn: 'ಕಡಲೆ (Bengal Gram)',
    localNameHi: 'चना (Chickpea / Chana)',
    variety: 'JG-11 / JAKI-9218 / JG-14',
    category: 'Pulse / Protein Legume',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Clay Loam / Heavy Silt Clay'],
    toleratedSoils: ['Alluvial / River Plains Loam', 'Red Sandy Loam / Red Soil'],
    soilRequirements: 'Medium to deep black soils with good water-holding capacity. Requires loose seedbed for deep taproot growth. Avoid saline or alkaline sodic soils.',
    idealPhMin: 6.5,
    idealPhMax: 8.2,
    phBuffer: 0.6,
    primarySeasons: ['Rabi'],
    secondarySeasons: [],
    waterLevel: 'Low',
    waterRequirement: 'Low (250 - 350 mm)',
    waterDescription: 'Deep taproot extracts residual moisture. Usually rainfed; benefits immensely from 1-2 light irrigations at pre-flowering and pod filling.',
    optimalTempMin: 14,
    optimalTempMax: 28,
    tempTolerance: 4,
    weatherDescription: 'Cool, dry weather during vegetative stage followed by bright sunny days during pod maturation. Excessive rain or cloudy humid weather promotes Ascochyta blight.',
    growingDuration: '95 - 110 Days',
    yieldPerAcreMin: 9,
    yieldPerAcreMax: 13,
    profitPerAcreMin: 46000,
    profitPerAcreMax: 62000,
    importantPrecautions: [
      'DO NOT irrigate at peak flowering stage; sudden irrigation causes excessive flower shedding and rank foliage.',
      'Scout for Helicoverpa armigera (gram pod borer); install 4 pheromone traps and T-perches (20/acre).',
      'Avoid poorly drained heavy waterlogged patches prone to Fusarium wilt.',
      'Nip terminal shoots at 30-35 DAS to encourage profuse pod-bearing lateral branches.'
    ],
    keyFarmingTips: [
      'Inoculate seeds with Rhizobium and PSB cultures to naturally fix 35 kg atmospheric nitrogen per hectare.',
      'Nip terminal shoots at 30-35 DAS to stimulate secondary and tertiary branching, dramatically increasing pod count.',
      'Spray neem seed kernel extract (NSKE 5%) or chlorantraniliprole at early pod borer larva instar.'
    ]
  },
  {
    id: 'soybean-legume',
    name: 'Soybean',
    localNameKn: 'ಸೋಯಾಬೀನ್ (Soybean)',
    localNameHi: 'सोयाबीन (Soybean)',
    variety: 'JS-335 / JS-9560 / NRC-37',
    category: 'Oilseed & Protein Crop',
    image: 'https://images.unsplash.com/photo-1599420186946-7b6fb4e297f0?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Alluvial / River Plains Loam'],
    toleratedSoils: ['Clay Loam / Heavy Silt Clay', 'Red Sandy Loam / Red Soil'],
    soilRequirements: 'Well-drained, fertile black soils and loams. Very sensitive to waterlogging; requires good drainage gradient.',
    idealPhMin: 6.0,
    idealPhMax: 7.5,
    phBuffer: 0.6,
    primarySeasons: ['Kharif'],
    secondarySeasons: [],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (550 - 700 mm)',
    waterDescription: 'Grown predominantly as rainfed monsoon crop. Water stagnation beyond 24 hours causes seedling root asphyxiation.',
    optimalTempMin: 22,
    optimalTempMax: 32,
    tempTolerance: 4,
    weatherDescription: 'Requires warm and moist climate. Sowing is recommended once 75-100 mm monsoon rainfall has saturated the topsoil.',
    growingDuration: '85 - 95 Days',
    yieldPerAcreMin: 10,
    yieldPerAcreMax: 14,
    profitPerAcreMin: 44000,
    profitPerAcreMax: 58000,
    importantPrecautions: [
      'Sow only when at least 75-100 mm monsoon rainfall has accumulated; dry sowing results in poor germination.',
      'Handle seed gently; soybean seed coat is paper-thin and easily cracked, dropping germination rate below 60%.',
      'Watch for girdle beetle and tobacco caterpillar at 25-45 DAS.',
      'Harvest when 95% of pods turn golden brown; delayed harvest leads to shattering losses in field.'
    ],
    keyFarmingTips: [
      'Adopt Broad Bed Furrow (BBF) or ridge-and-furrow method to ensure drainage during heavy downpours.',
      'Treat seeds with Bradyrhizobium japonicum @ 5 g/kg seed to establish efficient root nodules.',
      'Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L if semilooper or girdle beetle exceeds economic threshold.'
    ]
  },
  {
    id: 'tomato-horticulture',
    name: 'Tomato',
    localNameKn: 'ಟೊಮೆಟೊ (Tomato)',
    localNameHi: 'टमाटर (Tomato)',
    variety: 'Abhinav (Syngenta) / Arka Rakshak / Pusa Ruby',
    category: 'Horticulture / Commercial Vegetable',
    image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Red Sandy Loam / Red Soil', 'Alluvial / River Plains Loam'],
    toleratedSoils: ['Black / Regur Soil (Clayey)', 'Clay Loam / Heavy Silt Clay'],
    soilRequirements: 'Deep, well-drained, friable sandy loam or red loam rich in organic manure with excellent drainage. Free of root-knot nematodes.',
    idealPhMin: 6.0,
    idealPhMax: 7.0,
    phBuffer: 0.7,
    primarySeasons: ['Rabi', 'Kharif'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate to High (500 - 650 mm)',
    waterDescription: 'Drip irrigation with fertigation delivers maximum yield. Irregular watering causes Blossom End Rot and fruit cracking.',
    optimalTempMin: 18,
    optimalTempMax: 30,
    tempTolerance: 5,
    weatherDescription: 'Prefers warm, sunny weather with moderate humidity. Temperatures above 35°C reduce fruit setting; frost damages vegetative foliage.',
    growingDuration: '110 - 130 Days',
    yieldPerAcreMin: 200,
    yieldPerAcreMax: 280,
    profitPerAcreMin: 90000,
    profitPerAcreMax: 160000,
    importantPrecautions: [
      'Calcium Watch: Irregular watering during fruit set triggers Blossom End Rot (black sunken bottom on tomatoes).',
      'Late Blight Alert: Spray Mancozeb 75% WP @ 2.5 g/L if persistent fog or drizzle occurs with cool nights.',
      'Install silver-black mulch to prevent direct fruit contact with soil and prevent soil-borne damping-off.',
      'Stake plants securely; unstaked vines produce 30% unmarketable bruised fruit.'
    ],
    keyFarmingTips: [
      'Stake hybrid plants with bamboo poles and trellis wire for 35% higher grade-A marketable fruit yield.',
      'Spray Calcium Nitrate @ 5 g/L during early fruit expansion stage to prevent Blossom End Rot.',
      'Use yellow sticky traps (15/acre) to control whitefly and suppress Leaf Curl Virus transmission.'
    ]
  },
  {
    id: 'onion-horticulture',
    name: 'Onion',
    localNameKn: 'ಈರುಳ್ಳಿ (Onion)',
    localNameHi: 'प्याज (Onion)',
    variety: 'Bhima Super / N-53 / Agrifound Light Red',
    category: 'Horticulture / Bulb Vegetable',
    image: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Red Sandy Loam / Red Soil'],
    toleratedSoils: ['Black / Regur Soil (Clayey)', 'Sandy Soil / Arid Loam'],
    soilRequirements: 'Rich, loose, well-manured sandy loam to alluvial loam free of large stones. Bulbs expand best in friable soil with good aeration.',
    idealPhMin: 6.5,
    idealPhMax: 7.8,
    phBuffer: 0.6,
    primarySeasons: ['Rabi', 'Kharif'],
    secondarySeasons: ['Late Kharif'],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (400 - 550 mm)',
    waterDescription: 'Shallow root system requires frequent light irrigations. Stop irrigation 10-15 days prior to harvest to ensure tight dry neck scales for storage.',
    optimalTempMin: 15,
    optimalTempMax: 28,
    tempTolerance: 4,
    weatherDescription: 'Cool temperature during vegetative growth and warm dry weather during bulb maturity and curing. Excessive rain at bulb stage causes purple blotch.',
    growingDuration: '115 - 130 Days',
    yieldPerAcreMin: 100,
    yieldPerAcreMax: 140,
    profitPerAcreMin: 75000,
    profitPerAcreMax: 120000,
    importantPrecautions: [
      'Withhold irrigation completely 12-15 days before harvest to allow neck tissues to dry and prevent storage rotting.',
      'Thrips Precaution: Inspect leaf sheaths weekly; silvery streaks indicate active thrips colonies.',
      'Avoid planting overgrown or thick-necked seedlings; leads to premature bolting (flowering).',
      'Cure harvested bulbs in shade for 8-10 days before de-topping; direct sun causes sunscald.'
    ],
    keyFarmingTips: [
      'Transplant sturdy 45-day-old nursery seedlings at 15x10 cm geometry on raised beds.',
      'Apply Sulfur @ 15 kg/acre as basal dose to enhance bulb pungency, firmness, and storage shelf-life.',
      'Cure harvested bulbs under shaded thatch for 8-10 days before bagging to prevent Aspergillus black rot.'
    ]
  },
  {
    id: 'chilli-spice',
    name: 'Chilli (Red / Green)',
    localNameKn: 'ಮೆಣಸಿನಕಾಯಿ (Chilli)',
    localNameHi: 'मिर्च (Chilli)',
    variety: 'Byadagi Kaddi / Guntur Sannam / Pusa Jwala',
    category: 'Cash Crop / Spice',
    image: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Red Sandy Loam / Red Soil'],
    toleratedSoils: ['Alluvial / River Plains Loam'],
    soilRequirements: 'Well-aerated black loams and red loams rich in organic matter. Good surface and internal soil drainage is essential to avoid damping-off.',
    idealPhMin: 6.0,
    idealPhMax: 7.5,
    phBuffer: 0.7,
    primarySeasons: ['Kharif', 'Rabi'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Moderate',
    waterRequirement: 'Moderate (500 - 650 mm)',
    waterDescription: 'Cannot tolerate either drought or water stagnation. Drip irrigation maintains optimal root-zone moisture.',
    optimalTempMin: 20,
    optimalTempMax: 32,
    tempTolerance: 5,
    weatherDescription: 'Warm, semi-arid climate. Excessive rains or prolonged overcast weather during flowering lead to severe flower and fruit shedding.',
    growingDuration: '120 - 140 Days',
    yieldPerAcreMin: 12,
    yieldPerAcreMax: 18,
    profitPerAcreMin: 80000,
    profitPerAcreMax: 140000,
    importantPrecautions: [
      'Leaf Curl Virus Alert: Control thrips, mites, and whiteflies early; once virus establishes, crop cannot recover.',
      'Avoid excess flood irrigation which encourages Phytophthora collar rot and bacterial wilt.',
      'Pick ripe red pods regularly; over-retention on plant exhausts nutrient supplies for subsequent flushes.',
      'Dry harvested pods on clean polythene tarpaulins; do not dry directly on dust roads.'
    ],
    keyFarmingTips: [
      'Dip seedling roots in Pseudomonas fluorescens @ 10 g/L solution for 20 minutes before transplanting.',
      'Install blue sticky traps (10/acre) to monitor and catch invasive thrips before leaf curl virus sets in.',
      'Foliar spray of Planofix (NAA 4.5% SL) @ 0.25 ml/L at flowering minimizes bud and fruit drop.'
    ]
  },
  {
    id: 'mustard-sarson',
    name: 'Mustard (Sarson)',
    localNameKn: 'ಸಾಸಿವೆ (Mustard)',
    localNameHi: 'सरसों (Mustard)',
    variety: 'Pusa Bold / RH-749 / Giriraj',
    category: 'Oilseed / Winter Crop',
    image: 'https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Sandy Soil / Arid Loam'],
    toleratedSoils: ['Red Sandy Loam / Red Soil', 'Black / Regur Soil (Clayey)'],
    soilRequirements: 'Light to medium alluvial loams and sandy soils with good drainage. Tolerates moderate salinity.',
    idealPhMin: 6.0,
    idealPhMax: 7.8,
    phBuffer: 0.7,
    primarySeasons: ['Rabi'],
    secondarySeasons: [],
    waterLevel: 'Low',
    waterRequirement: 'Low to Moderate (250 - 350 mm)',
    waterDescription: 'Requires only 2-3 light irrigations: at flowering and siliqua (pod) formation. Ideal for dryland winter farming.',
    optimalTempMin: 12,
    optimalTempMax: 26,
    tempTolerance: 4,
    weatherDescription: 'Cool, clear winter climate with bright sunshine. Cool temperatures during flowering promote high oil accumulation in seeds.',
    growingDuration: '105 - 120 Days',
    yieldPerAcreMin: 8,
    yieldPerAcreMax: 12,
    profitPerAcreMin: 42000,
    profitPerAcreMax: 56000,
    importantPrecautions: [
      'Aphid Outbreak: High humidity and overcast winter weather trigger explosive aphid (Lipaphis erysimi) swarms in January.',
      'Avoid excessive nitrogen which promotes soft succulent growth vulnerable to white rust and alternaria blight.',
      'Thin out seedlings strictly at 15-20 DAS; overcrowding drastically reduces branching and siliqua count.',
      'Harvest in morning when pods are damp with dew to avoid shattering of dry pods.'
    ],
    keyFarmingTips: [
      'Maintain 30x10 cm plant geometry by thinning seedlings 15-20 days after sowing.',
      'Apply 20 kg Elemental Sulfur per acre as basal dose to enhance grain oil content by 2.5-3.5%.',
      'Spray cold-pressed neem oil (1500 ppm @ 5 ml/L) early morning if aphid count exceeds threshold.'
    ]
  },
  {
    id: 'sugarcane-commercial',
    name: 'Sugarcane',
    localNameKn: 'ಕಬ್ಬು (Sugarcane)',
    localNameHi: 'गन्ना (Sugarcane)',
    variety: 'Co-86032 (Nayana) / Co-0238',
    category: 'Commercial Agro-Industrial Crop',
    image: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Alluvial / River Plains Loam', 'Clay Loam / Heavy Silt Clay', 'Black / Regur Soil (Clayey)'],
    toleratedSoils: ['Red Sandy Loam / Red Soil'],
    soilRequirements: 'Deep, rich, fertile alluvial and clayey loams with at least 1-meter effective rooting depth and balanced organic matter.',
    idealPhMin: 6.5,
    idealPhMax: 8.0,
    phBuffer: 0.6,
    primarySeasons: ['Kharif', 'Rabi'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'High',
    waterRequirement: 'High (1,500 - 2,200 mm)',
    waterDescription: 'Heavy water consumer. Drip irrigation with subsurface fertigation cuts water consumption by 40% while boosting sugar recovery.',
    optimalTempMin: 22,
    optimalTempMax: 36,
    tempTolerance: 5,
    weatherDescription: 'Tropical, sunny climate with high humidity during grand growth phase and cool dry sunny days during maturity for sucrose concentration.',
    growingDuration: '300 - 365 Days',
    yieldPerAcreMin: 45,
    yieldPerAcreMax: 65,
    profitPerAcreMin: 95000,
    profitPerAcreMax: 145000,
    importantPrecautions: [
      'Water Requirement Warning: Do not plant if water table or canal allocation cannot sustain 25-30 irrigations across 12 months.',
      'Watch for Red Rot (Colletotrichum falcatum); discard seed setts showing internal red discoloration.',
      'Earthing up at 90 and 120 DAS is mandatory to prevent crop lodging during monsoon winds.',
      'Stop irrigation 15 days before harvest to facilitate sucrose accumulation in internodes.'
    ],
    keyFarmingTips: [
      'Adopt wide-row planting (4 to 5 feet) for adequate tractor intercultural ops and sunlight penetration.',
      'Trash mulching between rows saves up to 30% soil moisture and decomposes into organic matter.',
      'Treat setts in hot water (52°C for 30 min) or fungicide solution before planting.'
    ]
  },
  {
    id: 'bajra-pearl-millet',
    name: 'Bajra (Pearl Millet)',
    localNameKn: 'ಸಜ್ಜೆ (Bajra / Pearl Millet)',
    localNameHi: 'बाजरा (Pearl Millet)',
    variety: 'HHB-67 / GHB-538 / Proagro 9444',
    category: 'Millets / Arid Cereal',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Sandy Soil / Arid Loam', 'Red Sandy Loam / Red Soil'],
    toleratedSoils: ['Alluvial / River Plains Loam'],
    soilRequirements: 'Light sandy soils, shallow loams, and drought-prone tracts. Remarkable tolerance to low fertility and salinity.',
    idealPhMin: 6.5,
    idealPhMax: 8.5,
    phBuffer: 0.8,
    primarySeasons: ['Kharif'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Low',
    waterRequirement: 'Low (250 - 350 mm)',
    waterDescription: 'Champion of drought resilience. Requires minimal moisture; survives long intermittent dry spells in arid zones.',
    optimalTempMin: 24,
    optimalTempMax: 38,
    tempTolerance: 6,
    weatherDescription: 'Hot, dry, semi-arid regions. Can withstand scorching temperatures up to 40°C during early vegetative growth.',
    growingDuration: '75 - 90 Days',
    yieldPerAcreMin: 12,
    yieldPerAcreMax: 16,
    profitPerAcreMin: 32000,
    profitPerAcreMax: 46000,
    importantPrecautions: [
      'Downy Mildew (Green Ear Disease): Avoid sowing untreated seed in fields with history of green ear disease.',
      'Ergot Precaution: High humidity and overcast rain at flowering can cause ergot (toxic sclerotial honeydew).',
      'Do not plant deeper than 3 cm; small seeds cannot emerge from deep crusty soil.',
      'Harvest promptly when grain moisture is ~20% to prevent field bird predation.'
    ],
    keyFarmingTips: [
      'Sow with seed drill at 45x15 cm spacing at a shallow depth of 2.5 to 3 cm.',
      'Thin out weak seedlings 12-15 days after emergence to ensure uniform single-plant spacing.',
      'Spray 2% Urea at earhead emergence stage if moisture stress threatens grain formation.'
    ]
  },
  {
    id: 'sunflower-oilseed',
    name: 'Sunflower',
    localNameKn: 'ಸೂರ್ಯಕಾಂತಿ (Sunflower)',
    localNameHi: 'सूरजमुखी (Sunflower)',
    variety: 'KBSH-41 / DRSH-1 / MSFH-17',
    category: 'Oilseed / Day-Neutral Crop',
    image: 'https://images.unsplash.com/photo-1597848212624-a19eb35e2651?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Alluvial / River Plains Loam', 'Red Sandy Loam / Red Soil'],
    toleratedSoils: ['Clay Loam / Heavy Silt Clay'],
    soilRequirements: 'Deep, moisture-retentive loamy or black soils with neutral reaction. Sensitive to soil crusting during germination.',
    idealPhMin: 6.5,
    idealPhMax: 8.0,
    phBuffer: 0.6,
    primarySeasons: ['Rabi', 'Kharif'],
    secondarySeasons: ['Summer / Zaid'],
    waterLevel: 'Low',
    waterRequirement: 'Low to Moderate (350 - 500 mm)',
    waterDescription: 'Day-neutral photo-insensitive crop. Deep taproot system mines water down to 1.5 meters. Critical irrigation is star-bud and seed filling.',
    optimalTempMin: 18,
    optimalTempMax: 32,
    tempTolerance: 5,
    weatherDescription: 'Adaptable to wide temperature ranges. Warm dry weather during flowering ensures optimal honeybee activity for cross-pollination.',
    growingDuration: '85 - 95 Days',
    yieldPerAcreMin: 8,
    yieldPerAcreMax: 12,
    profitPerAcreMin: 38000,
    profitPerAcreMax: 52000,
    importantPrecautions: [
      'Pollination Warning: Avoid broad-spectrum insecticide sprays during flowering hours (8 AM - 12 PM) to safeguard honeybees.',
      'Boron Deficiency: Poor seed filling in center of head indicates boron deficiency; apply Borax spray.',
      'Bird Damage: Ripe heads are heavily targeted by parrots and wild birds; deploy reflective ribbon ribbons.',
      'Ensure soil has no crusting at sowing; hard surface crust prevents seed hypocotyl emergence.'
    ],
    keyFarmingTips: [
      'Maintain 5 honeybee colonies per hectare to increase seed setting and reduce chaffy seed ratio by 25%.',
      'Spray Borax @ 2 g/L at ray floret opening stage to ensure complete center seed fertilization.',
      'Cover mature heads with loose net bags if wild parakeet bird flocks threaten harvest.'
    ]
  },
  {
    id: 'pigeonpea-tur',
    name: 'Pigeon Pea (Tur / Arhar)',
    localNameKn: 'ತೊಗರಿ (Pigeon Pea / Red Gram)',
    localNameHi: 'अरहर / तूर (Tur / Pigeon Pea)',
    variety: 'BRG-1 / TS-3R / Asha (ICPL-87119)',
    category: 'Pulse / Protein Staple',
    image: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    optimalSoils: ['Black / Regur Soil (Clayey)', 'Red Sandy Loam / Red Soil'],
    toleratedSoils: ['Alluvial / River Plains Loam'],
    soilRequirements: 'Deep, well-drained loams and medium black soils. Deep root system breaks hard pans and enriches soil with nitrogen.',
    idealPhMin: 6.0,
    idealPhMax: 7.5,
    phBuffer: 0.7,
    primarySeasons: ['Kharif'],
    secondarySeasons: [],
    waterLevel: 'Low',
    waterRequirement: 'Low to Moderate (400 - 550 mm)',
    waterDescription: 'Deep taproot penetrates 2+ meters into the soil. Excellent dryland drought hardiness; benefits from protective irrigation at pod set.',
    optimalTempMin: 20,
    optimalTempMax: 34,
    tempTolerance: 5,
    weatherDescription: 'Warm, semi-arid tropics. Requires bright sunny weather and warm nights. Cloudy weather during flowering triggers pod borer attack.',
    growingDuration: '150 - 180 Days',
    yieldPerAcreMin: 8,
    yieldPerAcreMax: 12,
    profitPerAcreMin: 55000,
    profitPerAcreMax: 78000,
    importantPrecautions: [
      'Waterlogging: Highly susceptible to Phytophthora stem blight in low-lying waterlogged fields.',
      'Pod Borer Alert: Install pheromone traps and monitor flower buds closely for Helicoverpa and Maruca.',
      'Long Duration: Requires 5-6 months; ensure field is not required early for winter Rabi crops.',
      'Harvest when 80-85% pods turn brownish grey; delayed harvest causes pod shattering.'
    ],
    keyFarmingTips: [
      'Ideal for intercropping with Soybean (1:2 ratio) or Cotton (1:4 ratio) for risk diversification.',
      'Pinch terminal shoots at 45-50 DAS to break apical dominance and encourage prolific lateral branch pods.',
      'Install 4 bird perches per acre and spray neem seed kernel extract (NSKE 5%) against Helicoverpa.'
    ]
  }
];

export const AVAILABLE_SOIL_TYPES = [
  {
    id: 'Black / Regur Soil (Clayey)',
    name: 'Black / Regur Soil (Clayey)',
    nameKn: 'ಕಪ್ಪು / ರೆಗೂರ್ ಮಣ್ಣು (Black Soil)',
    nameHi: 'काली / रेगुर मिट्टी (Black Soil)',
    description: 'Deep, rich in Ca/Mg/K, crack-prone when dry, superior moisture retention. Ideal for cotton, wheat, gram, soybean.',
    typicalPh: 7.4
  },
  {
    id: 'Red Sandy Loam / Red Soil',
    name: 'Red Sandy Loam / Red Soil',
    nameKn: 'ಕೆಂಪು ಮರಳು ಮಣ್ಣು (Red Sandy Loam)',
    nameHi: 'लाल रेतीली दोमट मिट्टी (Red Soil)',
    description: 'Porous, friable, well-aerated, iron-rich, fast-draining. Ideal for ragi, groundnut, maize, tomato, chilli.',
    typicalPh: 6.5
  },
  {
    id: 'Alluvial / River Plains Loam',
    name: 'Alluvial / River Plains Loam',
    nameKn: 'ಮೆಕ್ಕಲು ಮಣ್ಣು (Alluvial Loam)',
    nameHi: 'ಜಲೋढ़ दोमट मिट्टी (Alluvial Loam)',
    description: 'Highly fertile river silt and clay deposit, balanced crumb structure. Ideal for paddy, wheat, sugarcane, onion.',
    typicalPh: 7.0
  },
  {
    id: 'Laterite Soil (Acidic / Red Loam)',
    name: 'Laterite Soil (Acidic / Red Loam)',
    nameKn: 'ಜಂಬಿಟ್ಟಿಗೆ / ಲ್ಯಾಟರೈಟ್ ಮಣ್ಣು (Laterite)',
    nameHi: 'लैटेराइट अम्लीय मिट्टी (Laterite)',
    description: 'Leached upland soil, acidic pH (5.0 - 6.2), iron-aluminum oxides. Ideal for ragi, cashew, pulses with lime amendment.',
    typicalPh: 5.6
  },
  {
    id: 'Sandy Soil / Arid Loam',
    name: 'Sandy Soil / Arid Loam',
    nameKn: 'ಮರಳು ಮಣ್ಣು (Sandy / Arid)',
    nameHi: 'बलुई / शुष्क मिट्टी (Sandy Soil)',
    description: 'Coarse texture, low moisture retention, highly permeable. Ideal for bajra, mustard, drought-resilient legumes.',
    typicalPh: 7.5
  },
  {
    id: 'Clay Loam / Heavy Silt Clay',
    name: 'Clay Loam / Heavy Silt Clay',
    nameKn: 'ಜೇಡಿ ಮಣ್ಣು (Clay Loam)',
    nameHi: 'चिकनी दोमट मिट्टी (Clay Loam)',
    description: 'Heavy nutrient-dense soil, slow drainage, tolerates standing water. Ideal for paddy, wheat, sugarcane.',
    typicalPh: 7.2
  }
];

export const WATER_AVAILABILITY_OPTIONS = [
  {
    id: 'High',
    label: 'High (Perennial Canal / Multi-Borewell / Lift Irrigation)',
    labelKn: 'ಅಧಿಕ (ಕಾಲುವೆ / ಬಹು ಕೊಳವೆಬಾವಿ / ನದಿ ನೀರಾವರಿ)',
    labelHi: 'अधिक (नहर / कई नलकूप / लिफ्ट सिंचाई)',
    description: 'Continuous abundant water source. Supports standing water crops like Paddy and Sugarcane.',
    badgeColor: 'blue'
  },
  {
    id: 'Moderate',
    label: 'Moderate (Single Borewell / Farm Pond / Drip / Sprinkler)',
    labelKn: 'ಮಧ್ಯಮ (ಒಂದು ಕೊಳವೆಬಾವಿ / ಕೃಷಿ ಹೊಂಡ / ಹನಿ ನೀರಾವರಿ)',
    labelHi: 'मध्यम (एक नलकूप / खेत तालाब / ड्रिप सिंचाई)',
    description: 'Controlled irrigation cycles (4-6 stages). Supports Wheat, Cotton, Maize, Vegetables.',
    badgeColor: 'emerald'
  },
  {
    id: 'Low',
    label: 'Low / Rainfed (Monsoon Dependent / Limited Soil Moisture)',
    labelKn: 'ಕಡಿಮೆ / ಮಳೆ ಆಶ್ರಿತ (ಮಳೆ ನೀರು / ಸೀಮಿತ ತೇವಾಂಶ)',
    labelHi: 'कम / वर्षा आधारित (मानसून निर्भर / सीमित नमी)',
    description: 'Strict dryland or 1-2 protective irrigations. Supports Ragi, Chickpea, Mustard, Bajra.',
    badgeColor: 'amber'
  }
];

export const SEASONS_LIST = [
  {
    id: 'Kharif',
    name: 'Kharif (Monsoon / ಮುಂಗಾರು / खरीफ)',
    months: 'June to October',
    description: 'Southwest monsoon season. Warm and wet conditions suitable for long-duration tropical crops.'
  },
  {
    id: 'Rabi',
    name: 'Rabi (Winter / ಹಿಂಗಾರು / रबी)',
    months: 'October to March',
    description: 'Post-monsoon and cool winter season. Optimal for temperate cereals, pulses, and oilseeds.'
  },
  {
    id: 'Summer / Zaid',
    name: 'Zaid (Summer / ಬೇಸಿಗೆ / जायद)',
    months: 'March to June',
    description: 'Short hot dry season between Rabi and Kharif. Suitable for quick pulses, vegetables, and fodder.'
  }
];

export function detectCurrentSeason() {
  const month = new Date().getMonth();
  if (month >= 5 && month <= 9) return 'Kharif';
  if (month >= 9 || month <= 2) return 'Rabi';
  return 'Summer / Zaid';
}

/**
 * Fetch Weather for given coordinates from Open-Meteo with fallback
 */
export async function fetchWeatherForLocation(lat, lng, districtName = 'Raichur') {
  if (lat && lng) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto`;
      const response = await fetch(url, { signal: AbortSignal.timeout(4000) });
      if (response.ok) {
        const data = await response.json();
        const current = data.current || {};
        const daily = data.daily || {};
        const temp = Math.round(current.temperature_2m ?? 26);
        const humidity = Math.round(current.relative_humidity_2m ?? 60);
        const precip = current.precipitation ?? 0;
        const tempMax = daily.temperature_2m_max?.[0] ? Math.round(daily.temperature_2m_max[0]) : temp + 4;
        const tempMin = daily.temperature_2m_min?.[0] ? Math.round(daily.temperature_2m_min[0]) : temp - 5;
        
        return {
          isLive: true,
          source: 'Open-Meteo Live Agro-Forecast API',
          temperature: temp,
          humidity: humidity,
          precipitation: precip,
          tempMax: tempMax,
          tempMin: tempMin,
          condition: current.weather_code <= 2 ? 'Mostly Sunny' : (current.weather_code <= 60 ? 'Partly Cloudy' : 'Showers'),
          rainfallCategory: precip > 5 ? 'High (Monsoon Showers)' : (humidity > 70 ? 'Moderate Humidity' : 'Clear / Low Rainfall')
        };
      }
    } catch {
      // Fall through to fallback
    }
  }

  const fallbackKey = Object.keys(DISTRICT_WEATHER_DATA).find(k => k.toLowerCase().includes(districtName?.toLowerCase() || '')) || 'Nashik, Maharashtra';
  const fallback = DISTRICT_WEATHER_DATA[fallbackKey] || DISTRICT_WEATHER_DATA['Nashik, Maharashtra'];

  return {
    isLive: false,
    source: 'Local Agro-Meteorological Station Benchmark',
    temperature: fallback?.currentTemp ?? 27,
    humidity: fallback?.humidity ?? 62,
    precipitation: 0,
    tempMax: fallback?.maxTemp ?? 30,
    tempMin: fallback?.minTemp ?? 19,
    condition: fallback?.condition ?? 'Partly Cloudy',
    rainfallCategory: fallback?.rainfallAmount ?? '0 - 2 mm'
  };
}

/**
 * Validates inputs and returns missing information warnings
 */
export function validateRecommendationInputs({ location, soilType, soilPh, availableWater, season, landSize }) {
  const warnings = [];

  if (!location || !location.trim()) {
    warnings.push({
      field: 'location',
      type: 'critical',
      message: 'Farm location is required. Regional agro-climatic conditions depend on your location coordinates.'
    });
  }

  if (!soilType) {
    warnings.push({
      field: 'soilType',
      type: 'critical',
      message: 'Farmer-verified soil type must be selected. Note: Google Maps does NOT measure physical soil texture or quality.'
    });
  }

  const numPh = parseFloat(soilPh);
  if (soilPh === undefined || soilPh === null || isNaN(numPh)) {
    warnings.push({
      field: 'soilPh',
      type: 'warning',
      message: 'Soil pH is not entered. System will use the ICAR regional benchmark pH (7.0) with reduced recommendation confidence.'
    });
  } else if (numPh < 4.0 || numPh > 9.5) {
    warnings.push({
      field: 'soilPh',
      type: 'critical',
      message: 'Soil pH must be between 4.0 and 9.5. Please check your Soil Health Card values.'
    });
  }

  if (!availableWater) {
    warnings.push({
      field: 'availableWater',
      type: 'critical',
      message: 'Water availability must be selected to evaluate crop irrigation feasibility.'
    });
  }

  if (!season) {
    warnings.push({
      field: 'season',
      type: 'critical',
      message: 'Crop growing season (Kharif, Rabi, or Zaid) must be selected for planting window alignment.'
    });
  }

  const numLand = parseFloat(landSize);
  if (isNaN(numLand) || numLand <= 0) {
    warnings.push({
      field: 'landSize',
      type: 'warning',
      message: 'Land size should be greater than 0 acres to project harvest quantities and revenue.'
    });
  }

  return warnings;
}

/**
 * Prepares the standard ML payload contract for future integration with agricultural ML models
 * (e.g., Random Forest, LightGBM, or FastAPI /api/v1/recommend-crop-ml endpoints)
 */
export function buildCropRecommendationMLPayload({
  location,
  coordinates,
  district,
  state,
  soilType,
  soilPh,
  availableWater,
  season,
  temperature,
  humidity,
  rainfall,
  landSize
}) {
  return {
    engine_version: 'KrishiMitra-AgriSmart-ML-v2.0',
    timestamp: new Date().toISOString(),
    geographical_input: {
      location_name: location || 'Raichur, Karnataka',
      latitude: coordinates?.lat || 16.2160,
      longitude: coordinates?.lng || 77.3566,
      district: district || 'Raichur',
      state: state || 'Karnataka'
    },
    soil_input: {
      soil_type: soilType || 'Black / Regur Soil (Clayey)',
      soil_ph: parseFloat(soilPh) || 7.0,
      is_soil_lab_tested: soilPh !== undefined && soilPh !== null && !isNaN(parseFloat(soilPh)),
      estimated_nitrogen_n: 75.0,  // kg/ha benchmark
      estimated_phosphorus_p: 45.0, // kg/ha benchmark
      estimated_potassium_k: 50.0   // kg/ha benchmark
    },
    weather_input: {
      temperature_celsius: parseFloat(temperature) || 26.0,
      relative_humidity_pct: parseFloat(humidity) || 60.0,
      precipitation_mm: parseFloat(rainfall) || 0.0
    },
    farming_parameters: {
      water_availability: availableWater || 'Moderate',
      target_season: season || 'Rabi',
      land_size_acres: parseFloat(landSize) || 3.0
    }
  };
}

/**
 * Transparent Rule-Based Scoring Engine
 * 
 * Computes:
 * 1. Top 5 Crops
 * 2. Transparent 100-pt breakdown
 * 3. Recommendation Confidence Rating (High, Good, Moderate)
 * 4. Land-size scaled harvest yield & revenue margins
 * 5. Important Precautions for each crop
 */
export function calculateTopFiveCrops({
  location,
  coordinates,
  district,
  state,
  soilType,
  soilPh,
  availableWater,
  season,
  temperature,
  humidity,
  rainfall,
  landSize = 3.0,
  isLiveWeather = false
}) {
  const warnings = validateRecommendationInputs({ location, soilType, soilPh, availableWater, season, landSize });
  const hasCriticalWarning = warnings.some(w => w.type === 'critical');

  if (hasCriticalWarning && (!soilType || !availableWater || !season)) {
    return {
      isValid: false,
      warnings,
      confidenceScore: 0,
      confidenceLabel: 'Incomplete Data',
      confidenceBadgeColor: 'red',
      topCrops: []
    };
  }

  const acres = parseFloat(landSize) > 0 ? parseFloat(landSize) : 1.0;
  const isPhEntered = soilPh !== undefined && soilPh !== null && !isNaN(parseFloat(soilPh));
  const phVal = isPhEntered ? parseFloat(soilPh) : 7.0;
  const tempVal = parseFloat(temperature) || 26;

  // Calculate Overall Recommendation Confidence
  let confidenceScore = 100;
  if (!isPhEntered) confidenceScore -= 18; // pH is estimated
  if (!isLiveWeather) confidenceScore -= 8; // weather is regional benchmark
  if (!soilType) confidenceScore -= 20;

  confidenceScore = Math.max(50, Math.min(98, confidenceScore));
  let confidenceLabel = 'High Confidence';
  let confidenceBadgeColor = 'emerald';
  if (confidenceScore < 75) {
    confidenceLabel = 'Moderate Confidence (Some Estimates Used)';
    confidenceBadgeColor = 'amber';
  } else if (confidenceScore < 88) {
    confidenceLabel = 'Good Confidence';
    confidenceBadgeColor = 'blue';
  }

  const scoredCrops = CROPS_CATALOG.map((crop) => {
    let soilScore = 0;
    let phScore = 0;
    let seasonScore = 0;
    let waterScore = 0;
    let weatherScore = 0;

    const reasons = [];

    // --- Rule 1: Soil Texture Compatibility (Max 25 pts) ---
    if (crop.optimalSoils.includes(soilType)) {
      soilScore = 25;
      reasons.push({
        type: 'positive',
        category: 'Soil',
        text: `Optimal Soil Match: ${soilType} provides prime root aeration and moisture holding for ${crop.name}. (+25/25 pts)`
      });
    } else if (crop.toleratedSoils.includes(soilType)) {
      soilScore = 16;
      reasons.push({
        type: 'neutral',
        category: 'Soil',
        text: `Secondary Soil Match: ${crop.name} can perform satisfactorily in ${soilType} with organic manure application. (+16/25 pts)`
      });
    } else {
      soilScore = 6;
      reasons.push({
        type: 'caution',
        category: 'Soil',
        text: `Suboptimal Texture: ${soilType} is not the natural medium for ${crop.name}; requires soil conditioning. (+6/25 pts)`
      });
    }

    // --- Rule 2: Soil pH Match (Max 20 pts) ---
    if (phVal >= crop.idealPhMin && phVal <= crop.idealPhMax) {
      phScore = 20;
      reasons.push({
        type: 'positive',
        category: 'pH',
        text: `Target pH Fit: Soil pH of ${phVal.toFixed(1)} falls right in the optimal ${crop.idealPhMin}-${crop.idealPhMax} uptake band. (+20/20 pts)`
      });
    } else {
      const diffMin = Math.abs(phVal - crop.idealPhMin);
      const diffMax = Math.abs(phVal - crop.idealPhMax);
      const minDiff = Math.min(diffMin, diffMax);

      if (minDiff <= crop.phBuffer) {
        phScore = 13;
        reasons.push({
          type: 'neutral',
          category: 'pH',
          text: `Acceptable pH Tolerance: pH ${phVal.toFixed(1)} is slightly off ideal (${crop.idealPhMin}-${crop.idealPhMax}) but well within buffer. (+13/20 pts)`
        });
      } else {
        phScore = 4;
        reasons.push({
          type: 'caution',
          category: 'pH',
          text: `pH Stress: Soil pH ${phVal.toFixed(1)} deviates significantly from ideal ${crop.idealPhMin}-${crop.idealPhMax}. Requires lime/gypsum amendment. (+4/20 pts)`
        });
      }
    }

    // --- Rule 3: Season & Sowing Window Alignment (Max 25 pts) ---
    if (crop.primarySeasons.includes(season)) {
      seasonScore = 25;
      reasons.push({
        type: 'positive',
        category: 'Season',
        text: `Prime Agro-Climatic Window: ${season} is the official recommended sowing calendar period for ${crop.name}. (+25/25 pts)`
      });
    } else if (crop.secondarySeasons.includes(season)) {
      seasonScore = 16;
      reasons.push({
        type: 'neutral',
        category: 'Season',
        text: `Secondary Season: ${crop.name} can be grown in ${season} provided irrigation and temperature are regulated. (+16/25 pts)`
      });
    } else {
      seasonScore = 4;
      reasons.push({
        type: 'caution',
        category: 'Season',
        text: `Off-Season Risk: ${season} is not the standard planting period for ${crop.name}. (+4/25 pts)`
      });
    }

    // --- Rule 4: Water Availability Feasibility (Max 15 pts) ---
    if (availableWater === 'High') {
      if (crop.waterLevel === 'High') {
        waterScore = 15;
        reasons.push({
          type: 'positive',
          category: 'Water',
          text: `Water Match: Your abundant water supply satisfies the high ${crop.waterRequirement} requirement. (+15/15 pts)`
        });
      } else {
        waterScore = 14;
        reasons.push({
          type: 'positive',
          category: 'Water',
          text: `Irrigation Security: Ample water allows precise stage-based irrigation for ${crop.name}. (+14/15 pts)`
        });
      }
    } else if (availableWater === 'Moderate') {
      if (crop.waterLevel === 'High') {
        waterScore = 7;
        reasons.push({
          type: 'caution',
          category: 'Water',
          text: `Deficit Risk: ${crop.name} requires high water (${crop.waterRequirement}); moderate water requires strict drip management. (+7/15 pts)`
        });
      } else {
        waterScore = 15;
        reasons.push({
          type: 'positive',
          category: 'Water',
          text: `Balanced Water Match: Moderate water supports all critical phenological stages of ${crop.name}. (+15/15 pts)`
        });
      }
    } else {
      // Low / Rainfed
      if (crop.waterLevel === 'Low') {
        waterScore = 15;
        reasons.push({
          type: 'positive',
          category: 'Water',
          text: `Dryland Hardiness: ${crop.name} is naturally drought-tolerant and thrives on low/rainfed moisture. (+15/15 pts)`
        });
      } else if (crop.waterLevel === 'Moderate') {
        waterScore = 8;
        reasons.push({
          type: 'caution',
          category: 'Water',
          text: `Moisture Conservation Needed: Moderate water requirement will rely on timely rain or farm pond backup. (+8/15 pts)`
        });
      } else {
        waterScore = 2;
        reasons.push({
          type: 'caution',
          category: 'Water',
          text: `Severe Water Constraint: ${crop.name} needs high water (${crop.waterRequirement}); rainfed cultivation is risky. (+2/15 pts)`
        });
      }
    }

    // --- Rule 5: Weather & Temperature Compatibility (Max 15 pts) ---
    if (tempVal >= crop.optimalTempMin && tempVal <= crop.optimalTempMax) {
      weatherScore = 15;
      reasons.push({
        type: 'positive',
        category: 'Weather',
        text: `Thermal Window: Current temperature (${tempVal}°C) is in the ideal ${crop.optimalTempMin}°C - ${crop.optimalTempMax}°C physiological range. (+15/15 pts)`
      });
    } else {
      const tempDiff = tempVal < crop.optimalTempMin
        ? crop.optimalTempMin - tempVal
        : tempVal - crop.optimalTempMax;

      if (tempDiff <= crop.tempTolerance) {
        weatherScore = 10;
        reasons.push({
          type: 'neutral',
          category: 'Weather',
          text: `Manageable Thermal Variance: ${tempVal}°C is within crop tolerance buffer (${crop.optimalTempMin}-${crop.optimalTempMax}°C). (+10/15 pts)`
        });
      } else {
        weatherScore = 4;
        reasons.push({
          type: 'caution',
          category: 'Weather',
          text: `Thermal Stress: Temperature (${tempVal}°C) deviates from optimum (${crop.optimalTempMin}-${crop.optimalTempMax}°C). (+4/15 pts)`
        });
      }
    }

    const totalScore = Math.min(100, Math.round(soilScore + phScore + seasonScore + waterScore + weatherScore));

    let suitabilityBadge = 'Highly Recommended';
    let badgeColor = 'emerald';
    if (totalScore < 70) {
      suitabilityBadge = 'Moderate Feasibility';
      badgeColor = 'amber';
    } else if (totalScore < 85) {
      suitabilityBadge = 'Suitable Alternative';
      badgeColor = 'blue';
    }

    // Calculate Land Size Scaled Metrics
    const totalYieldMin = Math.round(crop.yieldPerAcreMin * acres);
    const totalYieldMax = Math.round(crop.yieldPerAcreMax * acres);
    const totalProfitMin = Math.round(crop.profitPerAcreMin * acres);
    const totalProfitMax = Math.round(crop.profitPerAcreMax * acres);

    return {
      ...crop,
      totalScore,
      suitabilityBadge,
      badgeColor,
      landSizeAcres: acres,
      scaledYieldRange: `${totalYieldMin} - ${totalYieldMax} Quintals`,
      scaledProfitRange: `₹${totalProfitMin.toLocaleString('en-IN')} - ₹${totalProfitMax.toLocaleString('en-IN')}`,
      scoreBreakdown: {
        soilScore,
        phScore,
        seasonScore,
        waterScore,
        weatherScore
      },
      reasons,
      precautions: crop.importantPrecautions || []
    };
  });

  // Sort descending by total score and pick top 5
  scoredCrops.sort((a, b) => b.totalScore - a.totalScore);
  const topCrops = scoredCrops.slice(0, 5);

  return {
    isValid: true,
    warnings,
    confidenceScore,
    confidenceLabel,
    confidenceBadgeColor,
    topCrops
  };
}
