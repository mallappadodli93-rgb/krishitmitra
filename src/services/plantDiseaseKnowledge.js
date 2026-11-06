/**
 * KrishiMitra Multi-Crop Verified Agricultural Disease Knowledge Base
 * 
 * Sourced from Indian Council of Agricultural Research (ICAR), State Agricultural Universities (UAS Bangalore/Dharwad, TNAU, PAU),
 * and Central Institute for Subtropical Horticulture (CISH).
 * 
 * No tomato-only bias: provides detailed pathology across all major crop families.
 */

export const COMPREHENSIVE_DISEASE_LIBRARY = {
  // =========================================================================
  // 1. RICE / PADDY (ಭತ್ತ / धान)
  // =========================================================================
  'Rice Blast': {
    id: 'rice-blast',
    cropId: 'rice',
    cropName: 'Rice / Paddy',
    diseaseName: 'Rice Blast (Magnaporthe oryzae / Pyricularia oryzae)',
    pathogen: 'Magnaporthe oryzae (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Spindle-shaped or eye-shaped lesions with ash-grey centers and dark brown margins on leaves.',
      'Lesions coalesce, causing entire leaf blades to wither and turn straw-colored.',
      'Collar rot at junction of leaf blade and sheath causing leaf detachment.',
      'Neck blast: Black necrotic ring at panicle base resulting in chaffy or sterile grains ("broken neck").'
    ],
    possibleCauses: [
      'High relative humidity (>90%) with prolonged leaf wetness (dew lasting >10 hours).',
      'Moderate daytime temperatures (20°C - 28°C) with cool overcast nights.',
      'Excessive application of chemical Nitrogen fertilizers without balanced Potash.'
    ],
    favouringConditions: '20°C - 28°C, cloudy rainy weather, heavy dew, high soil nitrogen.',
    treatment: {
      organic: [
        'Foliar spray of Pseudomonas fluorescens @ 10 g/liter or Bacillus subtilis bio-fungicide @ 5 g/liter.',
        'Spray 10% fermented cow urine + vitex leaf decoction (Neem-Vitex extract) every 10 days.'
      ],
      chemical: [
        'Foliar spray of Tricyclazole 75% WP @ 0.6 g/liter at early tillering and panicle emergence.',
        'Alternatively, spray Isoprothiolane 40% EC @ 1.5 ml/liter or Kasugamycin 3% SL @ 2.5 ml/liter.',
        'Ensure spray hits both canopy and lower leaf collars.'
      ]
    },
    prevention: [
      'Seed treatment with Carbendazim 50% WP @ 2 g/kg seed or Trichoderma harzianum @ 10 g/kg seed.',
      'Split application of nitrogenous fertilizers in 3 equal doses; never dump all urea at once.',
      'Use blast-resistant varieties like MTU-1010, IR-64, or Rasi.'
    ],
    expertAdviceCriteria: 'Consult local Krishi Vigyan Kendra (KVK) or Assistant Director of Agriculture if neck blast symptoms appear on >5% panicles during the milking stage.',
    referenceSource: 'ICAR - National Rice Research Institute (NRRI), Cuttack & UAS Raichur Extension Bulletin'
  },

  'Rice Bacterial Leaf Blight': {
    id: 'rice-blb',
    cropId: 'rice',
    cropName: 'Rice / Paddy',
    diseaseName: 'Bacterial Leaf Blight (Xanthomonas oryzae pv. oryzae)',
    pathogen: 'Xanthomonas oryzae (Bacterium)',
    category: 'Bacterial',
    symptoms: [
      'Water-soaked to yellowish-white stripes with wavy margins starting from leaf tips and margins.',
      'Lesions enlarge along veins, turn grayish-white, and dry up with bacterial ooze beads on humid mornings.',
      'Severe "Kresek" phase in seedlings leading to total systemic wilting and seedling death.'
    ],
    possibleCauses: [
      'Warm temperature (25°C - 34°C) with high relative humidity and cyclonic storms.',
      'Flooding of fields causing mechanical wounds and rapid inter-plant transmission.',
      'High nitrogen fertilization.'
    ],
    favouringConditions: 'Warm, overcast stormy monsoon weather with high nitrogen.',
    treatment: {
      organic: [
        'Foliar spray of Fresh Cow Dung Extract (20 g cow dung stirred in 1 L water, filtered through muslin cloth).',
        'Application of Pseudomonas fluorescens talc formulation @ 10 g/L.'
      ],
      chemical: [
        'Foliar spray of Copper Hydroxide 77% WP @ 2 g/L mixed with Streptocycline @ 0.1 g/L (1 g in 10 liters).',
        'Drain excess standing field water immediately and withhold nitrogen application for 10-14 days.'
      ]
    },
    prevention: [
      'Hot water seed soaking at 52°C - 54°C for 15 minutes before germination.',
      'Maintain field drainage furrows to prevent dirty irrigation runoff flowing across fields.',
      'Grow BLB-resistant hybrids (e.g. Improved Samba Mahsuri - RP Bio-226).'
    ],
    expertAdviceCriteria: 'Notify agricultural officer if Kresek wilt appears in more than 10% seedlings during vegetative phase.',
    referenceSource: 'ICAR - Indian Institute of Rice Research (IIRR), Hyderabad'
  },

  // =========================================================================
  // 2. WHEAT (ಗೋಧಿ / गेहूं)
  // =========================================================================
  'Wheat Stripe / Yellow Rust': {
    id: 'wheat-yellow-rust',
    cropId: 'wheat',
    cropName: 'Wheat',
    diseaseName: 'Wheat Stripe / Yellow Rust (Puccinia striiformis f. sp. tritici)',
    pathogen: 'Puccinia striiformis (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Bright yellow to orange pustules (uredinia) arranged in narrow, parallel linear stripes along leaf veins.',
      'When wiped with fingers or white cloth, bright yellow powdery spores adhere.',
      'Leaves dry up prematurely, shrivel, and grain filling is drastically aborted.'
    ],
    possibleCauses: [
      'Cool temperatures (9°C - 15°C) with persistent winter fog, dew, and overcast skies.',
      'Wind-blown spores traveling from northern Himalayan foothills.'
    ],
    favouringConditions: '9°C - 15°C, high humidity (>85%), prolonged winter fog.',
    treatment: {
      organic: [
        'Early prophylactic spray of bio-agent Trichoderma viride @ 5 g/L.',
        'Neem seed kernel extract (NSKE 5%) spray at first sighting.'
      ],
      chemical: [
        'Immediate foliar spray of Propiconazole 25% EC (Tilt) @ 1 ml/liter (200 ml/acre in 200 L water).',
        'Alternatively, spray Tebuconazole 25.9% EC @ 1 ml/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L.',
        'Repeat spray after 15 days if yellow stripes continue expanding.'
      ]
    },
    prevention: [
      'Sow recommended rust-tolerant wheat cultivars (HD-3086, DBW-187, DBW-222).',
      'Timely sowing in November to escape late-winter rust epidemics.'
    ],
    expertAdviceCriteria: 'Stripe rust spreads exponentially. Inform KVK or Wheat Directorate if yellow stripes appear in more than 5 scattered foci in an acre.',
    referenceSource: 'ICAR - Indian Institute of Wheat and Barley Research (IIWBR), Karnal'
  },

  // =========================================================================
  // 3. MAIZE / CORN (ಮೆಕ್ಕೆಜೋಳ / मक्का)
  // =========================================================================
  'Maize Maydis Leaf Blight': {
    id: 'maize-maydis-blight',
    cropId: 'maize',
    cropName: 'Maize (Corn)',
    diseaseName: 'Maydis Leaf Blight (Bipolaris maydis / Cochliobolus heterostrophus)',
    pathogen: 'Bipolaris maydis (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Small, diamond-shaped, elongated tan-to-brown lesions bounded by leaf veins.',
      'Lesions coalesce into large necrotic blighted areas covering entire lower leaves.',
      'Infected leaves dry up and rattle in the wind; premature senescence occurs.'
    ],
    possibleCauses: [
      'Warm, damp humid weather (24°C - 30°C) with frequent monsoon rains.',
      'Dense planting density restricting airflow.'
    ],
    favouringConditions: '24°C - 30°C, high humidity, overcast days.',
    treatment: {
      organic: [
        'Foliar spray of Trichoderma harzianum @ 5 g/L + Cow urine 5% solution.',
        'Neem cake soil incorporation @ 150 kg/acre.'
      ],
      chemical: [
        'Foliar spray of Mancozeb 75% WP @ 2.5 g/liter at knee-high stage upon first symptom observation.',
        'If severe, spray Azoxystrobin 23% SC @ 1 ml/liter or Pyraclostrobin 20% WG @ 1 g/liter.'
      ]
    },
    prevention: [
      'Crop rotation avoiding continuous maize mono-cropping.',
      'Deep summer ploughing to bury crop residues and fungal sclerotia.',
      'Use resistant hybrids (DHM-117, CP-818, Pioneer 3396).'
    ],
    expertAdviceCriteria: 'Consult agronomist if blighting moves above the ear leaf before the silking stage.',
    referenceSource: 'ICAR - Indian Institute of Maize Research (IIMR), Ludhiana'
  },

  // =========================================================================
  // 4. COTTON (ಹತ್ತಿ / कपास)
  // =========================================================================
  'Cotton Leaf Curl Virus': {
    id: 'cotton-leaf-curl',
    cropId: 'cotton',
    cropName: 'Cotton',
    diseaseName: 'Cotton Leaf Curl Virus (CLCuV)',
    pathogen: 'Cotton Leaf Curl Begomovirus (Virus transmitted by Whitefly)',
    category: 'Viral',
    symptoms: [
      'Upward or downward curling of leaf margins, vein thickening, and enation (leaf-like outgrowths) on lower leaf veins.',
      'Interveinal chlorosis, severely stunted plant height, and abortion of squares/bolls.',
      'Bushes resemble deformed bonsai plants with zero harvestable bolls.'
    ],
    possibleCauses: [
      'Vector: Bemisia tabaci (Whitefly) transmitting the begomovirus during feeding.',
      'Hot and dry weather favoring rapid whitefly multiplication.'
    ],
    favouringConditions: '30°C - 38°C, dry sunny spells, presence of host weed Malva or Parthenium.',
    treatment: {
      organic: [
        'Erect 10-12 Yellow Sticky Traps per acre at 1 foot above crop canopy to capture whiteflies.',
        'Spray Neem Seed Kernel Extract (NSKE 5%) or 10,000 ppm Azadirachtin @ 2 ml/liter.'
      ],
      chemical: [
        'Manage whitefly vector immediately: Spray Diafenthiuron 50% WP @ 1.2 g/liter or Pyriproxyfen 10% EC @ 2 ml/liter.',
        'For high adult whitefly counts, spray Afidopyropen 50 g/L DC @ 2 ml/liter or Flonicamid 50% WG @ 0.3 g/liter.',
        'Note: Chemical fungicides do NOT cure viral diseases; eliminating the vector halts new infections.'
      ]
    },
    prevention: [
      'Destroy alternate weed hosts like Kanghi (Abutilon indicum) and Parthenium along field borders.',
      'Plant border rows of Bajra or Sorghum (3-4 rows) as a physical barrier to whitefly drift.',
      'Sow tolerant Bt hybrids recommended for northern and central zones.'
    ],
    expertAdviceCriteria: 'Rogue out and burn infected plants if detected within 30-40 days of sowing to halt whole-field epidemic.',
    referenceSource: 'ICAR - Central Institute for Cotton Research (CICR), Nagpur'
  },

  'Cotton Bacterial Blight / Angular Leaf Spot': {
    id: 'cotton-angular-leaf-spot',
    cropId: 'cotton',
    cropName: 'Cotton',
    diseaseName: 'Bacterial Blight / Angular Leaf Spot (Xanthomonas citri pv. malvacearum)',
    pathogen: 'Xanthomonas citri (Bacterium)',
    category: 'Bacterial',
    symptoms: [
      'Angular, water-soaked polygonal lesions restricted by small veinlets on leaf undersides.',
      'Lesions turn dark brown to black and spread along main veins (Vein Blight).',
      'Black arm phase: Dark, elongated sunken cankers girdling stems causing branches to snap.',
      'Boll rot: Round water-soaked dark spots on bolls causing stained lint.'
    ],
    possibleCauses: [
      'Seed-borne bacteria or infected crop trash.',
      'Warm rainy weather (28°C - 35°C) with driven rain or sprinkler splash.'
    ],
    favouringConditions: 'Warm, humid, rainy weather with wind-driven rain.',
    treatment: {
      organic: [
        'Foliar spray of Copper Oxychloride 50% WP @ 2.5 g/L.',
        'Application of bio-agent Pseudomonas fluorescens @ 10 g/L.'
      ],
      chemical: [
        'Foliar spray of Copper Oxychloride 50% WP @ 2.5 g/L mixed with Streptocycline @ 1 g per 10 liters of water.',
        'Repeat after 12-14 days if wet weather persists.'
      ]
    },
    prevention: [
      'Acid delinting of cotton seed with commercial Sulphuric Acid (100 ml/kg seed) to kill seed-coat bacteria.',
      'Deep winter ploughing and destruction of old stalks.'
    ],
    expertAdviceCriteria: 'Consult expert if Black Arm stage appears on main stem prior to flowering.',
    referenceSource: 'ICAR - CICR Nagpur & UAS Dharwad Cotton Research Station'
  },

  // =========================================================================
  // 5. GROUNDNUT / PEANUT (ಕಡಲೆಕಾಯಿ / मूंगफली)
  // =========================================================================
  'Groundnut Tikka Leaf Spot': {
    id: 'groundnut-tikka',
    cropId: 'groundnut',
    cropName: 'Groundnut (Peanut)',
    diseaseName: 'Tikka Leaf Spot (Cercospora arachidicola & Phaeoisariopsis personata)',
    pathogen: 'Cercospora arachidicola (Early) & Phaeoisariopsis personata (Late) (Fungi)',
    category: 'Fungal',
    symptoms: [
      'Early leaf spot: Circular reddish-brown lesions surrounded by a prominent bright yellow chlorotic halo.',
      'Late leaf spot: Dark brown to carbon-black circular spots without or with minimal yellow halo, prominent on lower leaf surface.',
      'Severe defoliation leaving bare stems ("spindly stems") and drastically reduced pod filling.'
    ],
    possibleCauses: [
      'Warm (25°C - 30°C) humid days with prolonged leaf moisture (>80% RH).',
      'Spore survival on infected soil residues and volunteer plants.'
    ],
    favouringConditions: 'Warm rainy days with high relative humidity and dewy nights.',
    treatment: {
      organic: [
        'Foliar spray of Neem seed kernel extract (NSKE 5%) or 10% fermented butter-milk solution.',
        'Bio-fungicide Trichoderma harzianum foliar application @ 5 g/L.'
      ],
      chemical: [
        'Foliar spray of Carbendazim 12% + Mancozeb 63% WP (Saaf) @ 2 g/liter upon first spot appearance.',
        'Alternatively, spray Hexaconazole 5% EC @ 2 ml/liter or Tebuconazole 25.9% EC @ 1 ml/liter.',
        'Provide second spray 15 days later if overcast conditions continue.'
      ]
    },
    prevention: [
      'Seed treatment with Trichoderma @ 10 g/kg seed or Thiram + Carbendazim (1:1) @ 3 g/kg.',
      'Crop rotation with cereals like Pearl Millet, Sorghum, or Maize.',
      'Plant moderately resistant cultivars like Kadiri-6, GJG-9, or GPBD-4.'
    ],
    expertAdviceCriteria: 'Consult extension officer if defoliation exceeds 25% of canopy before 70 days after sowing.',
    referenceSource: 'ICAR - Directorate of Groundnut Research (DGR), Junagadh'
  },

  // =========================================================================
  // 6. TOMATO (ಟೊಮೆಟೊ / टमाटर)
  // =========================================================================
  'Tomato Early Blight': {
    id: 'tomato-early-blight',
    cropId: 'tomato',
    cropName: 'Tomato',
    diseaseName: 'Tomato Early Blight (Alternaria solani)',
    pathogen: 'Alternaria solani (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Small, dark brown-to-black circular spots with concentric target-like rings ("bullseye pattern") on older lower leaves.',
      'Chlorotic yellow halos surrounding necrotic spots.',
      'Lower foliage withers and drops prematurely, exposing developing fruit to sunscald.',
      'Dark, sunken, leathery cankers at stem base and fruit calyx end.'
    ],
    possibleCauses: [
      'Fungal pathogen surviving on solanaceous crop debris and weeds.',
      'Warm temperatures (24°C - 29°C) with high humidity, heavy dew, or overhead water splashing.'
    ],
    favouringConditions: 'Warm, humid weather, wet canopy, alternating wet and dry periods.',
    treatment: {
      organic: [
        'Foliar spray of cold-pressed Neem oil (1500 ppm @ 5 ml/L) mixed with mild soap.',
        'Spray bio-fungicide Trichoderma viride or Bacillus subtilis @ 5 g/L early in morning.'
      ],
      chemical: [
        'Foliar spray of Mancozeb 75% WP @ 2.5 g/L upon first symptom sighting.',
        'In advanced cases, spray Azoxystrobin 23% SC @ 1 ml/L or Difenoconazole 25% EC @ 0.5 ml/L.',
        'Repeat spray after 10-12 days if foggy humid weather continues.'
      ]
    },
    prevention: [
      '3-year crop rotation avoiding potato, eggplant, and chilli in sequence.',
      'Mulch soil with clean straw to prevent soil-splashing spores.',
      'Adopt drip irrigation; avoid overhead sprinkler watering.'
    ],
    expertAdviceCriteria: 'Seek KVK advice if lesions cover >30% canopy within 5 days or stem cankers appear.',
    referenceSource: 'ICAR - Indian Institute of Horticultural Research (IIHR), Hessarghatta, Bangalore'
  },

  'Tomato Late Blight': {
    id: 'tomato-late-blight',
    cropId: 'tomato',
    cropName: 'Tomato',
    diseaseName: 'Tomato Late Blight (Phytophthora infestans)',
    pathogen: 'Phytophthora infestans (Oomycete)',
    category: 'Fungal',
    symptoms: [
      'Large, irregular water-soaked pale-green lesions that rapidly turn purplish-brown and necrotic.',
      'Delicate white downy fungal growth on leaf undersides during humid dewy mornings.',
      'Dark brown to black discoloration on stems and petioles.',
      'Firm, brown, greasy-textured rot expanding across green or ripening fruit.'
    ],
    possibleCauses: [
      'Cool, rainy or foggy weather (15°C - 22°C with >90% humidity).',
      'Wind-borne sporangia traveling across kilometers during overcast monsoon or winter spells.'
    ],
    favouringConditions: '15°C - 22°C, relative humidity >90%, persistent drizzle or heavy fog.',
    treatment: {
      organic: [
        'Spray 1% Bordeaux mixture or Copper Oxychloride 50% WP @ 3 g/L preventively before rainy period.',
        'Apply bio-agent Pseudomonas fluorescens @ 10 g/L.'
      ],
      chemical: [
        'Curative spray of Metalaxyl 8% + Mancozeb 64% WP (Ridomil Gold) @ 2.5 g/L.',
        'Alternatively, spray Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L within 48 hours of appearance.'
      ]
    },
    prevention: [
      'Plant resistant hybrids like Arka Rakshak or Abhinav.',
      'Ensure wide spacing and unobstructed field drainage.'
    ],
    expertAdviceCriteria: 'Act immediately. Late Blight is an explosive epidemic pathogen capable of destroying entire fields within 7 to 10 days.',
    referenceSource: 'ICAR - IIHR Bangalore & Central Potato Research Institute (CPRI)'
  },

  // =========================================================================
  // 7. CHILLI / PEPPER (ಮೆಣಸಿನಕಾಯಿ / मिर्च)
  // =========================================================================
  'Chilli Anthracnose / Dieback': {
    id: 'chilli-anthracnose',
    cropId: 'chilli',
    cropName: 'Chilli / Green Pepper',
    diseaseName: 'Chilli Anthracnose / Fruit Rot / Dieback (Colletotrichum capsici)',
    pathogen: 'Colletotrichum capsici (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Circular or elongated sunken necrotic spots on ripe chilli fruits with concentric rings of black acervuli.',
      'Fruit lesions turn straw-colored and dry with premature fruit drop.',
      'Dieback: Necrosis starting from tender growing tips and progressing downwards, turning twigs into whitish dry sticks.'
    ],
    possibleCauses: [
      'High humidity (>85%) with temperatures around 28°C - 30°C.',
      'Overhead splashing rain spreading fungal spores from soil and infected seed.'
    ],
    favouringConditions: 'Warm, humid weather with frequent rains during fruit maturation.',
    treatment: {
      organic: [
        'Spray Neem Seed Kernel Extract (NSKE 5%) or cold-pressed Neem oil @ 5 ml/L.',
        'Foliar spray of Trichoderma harzianum @ 5 g/L.'
      ],
      chemical: [
        'Spray Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/liter.',
        'Alternatively, spray Pyraclostrobin 20% WG @ 1 g/liter or Captan 50% WP @ 2.5 g/liter.',
        'Ensure thorough coverage of both foliage and developing green/red chillies.'
      ]
    },
    prevention: [
      'Seed treatment with Thiram @ 3 g/kg seed or Trichoderma viride @ 10 g/kg seed.',
      'Collect and destroy infected dropped fruits; do not leave rotting chillies in field furrows.',
      'Grow resistant varieties (Arka Meghana, Arka Harita).'
    ],
    expertAdviceCriteria: 'Consult expert if fruit rot infects >10% of harvested red/green fruits.',
    referenceSource: 'ICAR - IIHR Bangalore & TNAU Agritech Portal (Horticulture)'
  },

  'Chilli Leaf Curl Virus': {
    id: 'chilli-leaf-curl',
    cropId: 'chilli',
    cropName: 'Chilli / Green Pepper',
    diseaseName: 'Chilli Leaf Curl Virus (ChiLCV / Murda Complex)',
    pathogen: 'Begomovirus / Thrips & Mites Murda Complex',
    category: 'Viral',
    symptoms: [
      'Severe upward curling of leaves (boat-shaped curling if thrips; downward curling if yellow mites).',
      'Thickened veins, puckered leaves, shortened internodes, and stunted bushy growth.',
      'Drastic reduction in flower set and tiny deformed fruit.'
    ],
    possibleCauses: [
      'Transmitted by Whiteflies (Bemisia tabaci) and exacerbated by Scirtothrips dorsalis (Thrips) & Polyphagotarsonemus latus (Yellow Mite).'
    ],
    favouringConditions: 'Hot dry weather followed by intermittent showers.',
    treatment: {
      organic: [
        'Erect 15 Blue Sticky Traps (for thrips) and 15 Yellow Sticky Traps (for whiteflies) per acre.',
        'Spray Pongamia / Neem oil formulation (5 ml/L) mixed with 1 ml soap.'
      ],
      chemical: [
        'For Thrips: Spray Fipronil 5% SC @ 1.5 ml/L or Spinetoram 11.7% SC @ 1 ml/L.',
        'For Mites: Spray Spiromesifen 22.9% SC @ 1 ml/L or Fenpyroximate 5% EC @ 1.5 ml/L.',
        'For Whiteflies: Spray Diafenthiuron 50% WP @ 1.2 g/L.'
      ]
    },
    prevention: [
      'Barrier crops: Plant 2-3 border rows of Maize or Sorghum around chilli plots.',
      'Seedling root dip in Imidacloprid 17.8% SL (0.5 ml/L) for 15 minutes before transplanting.'
    ],
    expertAdviceCriteria: 'Rogue out virus-stunted plants early to prevent vector spread.',
    referenceSource: 'UAS Raichur & ICAR - IIHR Chilli Advisory'
  },

  // =========================================================================
  // 8. POTATO (ಆಲೂಗಡ್ಡೆ / आलू)
  // =========================================================================
  'Potato Late Blight': {
    id: 'potato-late-blight',
    cropId: 'potato',
    cropName: 'Potato',
    diseaseName: 'Potato Late Blight (Phytophthora infestans)',
    pathogen: 'Phytophthora infestans (Oomycete)',
    category: 'Fungal',
    symptoms: [
      'Water-soaked pale spots on leaves that rapidly enlarge into dark brown to black blighted areas.',
      'Fine white mildew ring on leaf undersides in humid mornings.',
      'Brown rot on stems and petioles causing vine collapse.',
      'Tubers develop dry purplish-brown sunken patches extending into granular rust-brown rot inside.'
    ],
    possibleCauses: [
      'Infected seed tubers; cool overcast weather (12°C - 20°C) with RH >85% for 48 consecutive hours.'
    ],
    favouringConditions: 'Cool winter or hill station climate with frequent rain and fog.',
    treatment: {
      organic: [
        'Preventive spray of Copper Oxychloride 50% WP @ 3 g/L or 1% Bordeaux mixture.',
        'Trichoderma viride tuber treatment @ 10 g/kg.'
      ],
      chemical: [
        'Foliar spray of Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L + Mancozeb 2 g/L.',
        'Ensure complete canopy coverage; repeat after 7-10 days if foggy conditions continue.'
      ]
    },
    prevention: [
      'Use certified disease-free seed tubers from CPRI (Kufri Jyoti, Kufri Pukhraj).',
      'High earthing-up to prevent spores washing into the soil and infecting tubers.'
    ],
    expertAdviceCriteria: 'Notify district agriculture officer if blight appears before tuber bulking phase.',
    referenceSource: 'ICAR - Central Potato Research Institute (CPRI), Shimla'
  },

  // =========================================================================
  // 9. ONION (ಈರುಳ್ಳಿ / प्याज)
  // =========================================================================
  'Onion Purple Blotch': {
    id: 'onion-purple-blotch',
    cropId: 'onion',
    cropName: 'Onion',
    diseaseName: 'Onion Purple Blotch (Alternaria porri)',
    pathogen: 'Alternaria porri (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Small, water-soaked lesions that rapidly develop into sunken, purple-to-brown elliptical spots.',
      'Spots are surrounded by a broad chlorotic yellow band extending up and down the tubular leaf.',
      'Leaves break over at the lesion point, dry up, and bulbs remain undersized and soft.'
    ],
    possibleCauses: [
      'Warm humid weather (25°C - 30°C) with rainfall, dewy mornings, and thrips injury providing entry wounds.'
    ],
    favouringConditions: 'Warm, humid weather with morning dew and thrips infestations.',
    treatment: {
      organic: [
        'Spray Neem oil (3000 ppm) @ 3 ml/L mixed with soap or agricultural sticker (Sandovit @ 0.5 ml/L).',
        'Pseudomonas fluorescens @ 10 g/L foliar application.'
      ],
      chemical: [
        'Foliar spray of Tebuconazole 25.9% EC @ 1 ml/L or Mancozeb 75% WP @ 2.5 g/L.',
        'ALWAYS add a non-ionic sticker/spreader (e.g. Wetcit / Triton @ 0.5 ml/L) because waxy onion leaves shed spray droplets.'
      ]
    },
    prevention: [
      'Control onion thrips (Thrips tabaci) which puncture leaf wax and facilitate fungal entry.',
      'Adopt raised bed planting with proper furrow drainage; avoid excessive standing water.'
    ],
    expertAdviceCriteria: 'Consult expert if purple lesions girdle >20% seed stalks in onion seed production crops.',
    referenceSource: 'ICAR - Directorate of Onion and Garlic Research (DOGR), Rajgurunagar, Pune'
  },

  // =========================================================================
  // 10. BANANA (ಬಾಳೆಹಣ್ಣು / केला)
  // =========================================================================
  'Banana Sigatoka Leaf Spot': {
    id: 'banana-sigatoka',
    cropId: 'banana',
    cropName: 'Banana',
    diseaseName: 'Sigatoka Leaf Spot / Yellow & Black Sigatoka (Pseudocercospora musae / fijiensis)',
    pathogen: 'Pseudocercospora musae (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Small, yellowish-green specks parallel to leaf veins that elongate into dark reddish-brown streaks.',
      'Centers of spots become sunken, dry, and ash-grey with a dark brown or black margin.',
      'Large portions of foliage dry up; prematurely ripened small fruit bunches fail to fill properly.'
    ],
    possibleCauses: [
      'High temperature (25°C - 32°C) combined with high rainfall or microclimatic humidity (>90%).',
      'Poor drainage and crowded plant spacing.'
    ],
    favouringConditions: 'Warm, humid monsoon months with dense plantation canopy.',
    treatment: {
      organic: [
        'De-leafing: Prune and burn severely spotted lower dried leaves below the bunch.',
        'Spray mineral oil / agricultural spray oil (Banole @ 10 ml/L) mixed with bio-agent Trichoderma.'
      ],
      chemical: [
        'Foliar spray of Propiconazole 25% EC @ 1 ml/L + mineral oil (10 ml/L) emulsion.',
        'Alternatively, spray Azoxystrobin 23% SC @ 1 ml/L or Carbendazim 50% WP @ 1 g/L with sticker.'
      ]
    },
    prevention: [
      'Ensure 1.8 m × 1.8 m or 2.1 m × 2.1 m optimal spacing.',
      'Keep suckers thinned to maximum 1 daughter follower per mother plant to improve ventilation.'
    ],
    expertAdviceCriteria: 'Ensure at least 8 to 10 functional healthy green leaves remain at bunch shooting for full commercial bunch weight.',
    referenceSource: 'ICAR - National Research Centre for Banana (NRCB), Tiruchirappalli'
  },

  // =========================================================================
  // 11. MANGO (ಮಾವಿನ ಹಣ್ಣು / आम)
  // =========================================================================
  'Mango Anthracnose': {
    id: 'mango-anthracnose',
    cropId: 'mango',
    cropName: 'Mango',
    diseaseName: 'Mango Anthracnose (Colletotrichum gloeosporioides)',
    pathogen: 'Colletotrichum gloeosporioides (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Small, dark brown, circular spots on tender copper-colored leaves that turn into shot-holes.',
      'Blossom blight: Blackening of floral panicles causing blossom drop and failure of fruit set.',
      'Tear-stain symptoms on developing fruit: Black necrotic streaks running down from fruit stalk.'
    ],
    possibleCauses: [
      'Frequent rains, heavy unseasonal showers during flowering, and relative humidity >80%.'
    ],
    favouringConditions: 'Warm, humid weather, rain showers during mango panicle emergence (Jan-March).',
    treatment: {
      organic: [
        'Prune dead diseased twigs 5 cm below infected point after harvest and paint cut ends with Bordeaux paste.',
        'Spray 1% Bordeaux mixture before panicle emergence.'
      ],
      chemical: [
        'Foliar spray of Carbendazim 12% + Mancozeb 63% WP @ 2 g/L or Azoxystrobin 23% SC @ 1 ml/L at panicle emergence.',
        'Repeat spray at pea-stage of fruit development if cloudy showers occur.'
      ]
    },
    prevention: [
      'Post-harvest hot water fruit treatment at 52°C for 10 minutes to prevent storage anthracnose rot.',
      'Annual canopy pruning to allow sunlight penetration to the tree center.'
    ],
    expertAdviceCriteria: 'Seek advice if blossom blight infects >25% of emerging flower panicles.',
    referenceSource: 'ICAR - Central Institute for Subtropical Horticulture (CISH), Lucknow'
  },

  // =========================================================================
  // 12. GRAPES (ದ್ರಾಕ್ಷಿ / अंगूर)
  // =========================================================================
  'Grape Downy Mildew': {
    id: 'grape-downy-mildew',
    cropId: 'grapes',
    cropName: 'Grapes',
    diseaseName: 'Grapevine Downy Mildew (Plasmopara viticola)',
    pathogen: 'Plasmopara viticola (Oomycete)',
    category: 'Fungal',
    symptoms: [
      'Yellowish, translucent "oil spots" on upper leaf surface.',
      'Dense, white, downy cottony fungal growth on lower leaf surface corresponding to the oil spots.',
      'Infected young berries turn dull greenish-brown, shrivel, and harden like leather ("brown rot").'
    ],
    possibleCauses: [
      'Cool to warm wet weather (18°C - 25°C) with persistent leaf wetness for over 3 hours.',
      '10-10-10 rule: 10 mm rainfall, 10°C minimum temperature, and 10 cm shoot length.'
    ],
    favouringConditions: 'Monsoon season or cloudy unseasonal rains during shoot development.',
    treatment: {
      organic: [
        'Spray 1% Bordeaux mixture or Potassium Phosphite (Phosphoric acid) @ 2.5 ml/L.',
        'Apply bio-fungicide Bacillus subtilis @ 5 g/L.'
      ],
      chemical: [
        'Preventive spray of Mancozeb 75% WP @ 2.5 g/L or Dimethomorph 50% WP @ 1 g/L.',
        'Curative spray of Famoxadone 16.6% + Cymoxanil 22.1% SC @ 1 ml/L or Fluopicolide 4.44% + Fosetyl-Al 66.67% WG @ 2.5 g/L.'
      ]
    },
    prevention: [
      'Maintain open canopy through proper canopy shoot thinning and lateral leaf removal.',
      'Drain excess standing water in vineyard rows.'
    ],
    expertAdviceCriteria: 'Downy mildew can destroy up to 100% of grape crop within days; consult Maharashtra Rajya Draksha Bagaitdar Sangh (MRDBS) or NRC Grapes immediately.',
    referenceSource: 'ICAR - National Research Centre for Grapes (NRCG), Pune'
  },

  // =========================================================================
  // 13. SUGARCANE (ಕಬ್ಬು / गन्ना)
  // =========================================================================
  'Sugarcane Red Rot': {
    id: 'sugarcane-red-rot',
    cropId: 'sugarcane',
    cropName: 'Sugarcane',
    diseaseName: 'Sugarcane Red Rot (Colletotrichum falcatum)',
    pathogen: 'Colletotrichum falcatum (Fungus)',
    category: 'Fungal',
    symptoms: [
      'Third or fourth leaf from top shows yellowing, withering, and drooping of crowns.',
      'Longitudinally split cane shows characteristic red internal discoloration with distinctive white transverse bands.',
      'Cane stalk develops an alcoholic sour odor; juice ferments and sucrose inverts.'
    ],
    possibleCauses: [
      'Infected setts (seed cane); waterlogging and high soil humidity during rainy season.'
    ],
    favouringConditions: 'Waterlogged soils, 28°C - 32°C, susceptible varieties.',
    treatment: {
      organic: [
        'Sett treatment with bio-control agent Trichoderma harzianum @ 10 g/L for 30 minutes.',
        'Soil incorporation of Trichoderma-enriched FYM @ 250 kg/acre.'
      ],
      chemical: [
        'Hot Water Treatment (HWT) of seed setts at 52°C for 30 minutes or moist hot air treatment.',
        'Dip setts in Carbendazim 50% WP (1 g/L) for 15 minutes before planting.'
      ]
    },
    prevention: [
      'Never plant setts taken from red rot affected fields or ratoon crops.',
      'Crop rotation for at least 1-2 years with non-graminaceous crops (paddy or green manure).',
      'Grow resistant cultivars like Co-86032, Co-0238 (check regional advisory).'
    ],
    expertAdviceCriteria: 'Rogue out and destroy infected clumps by burning; do not use infected fields for ratoon.',
    referenceSource: 'ICAR - Sugarcane Breeding Institute (SBI), Coimbatore'
  },

  // =========================================================================
  // 14. HEALTHY PLANT / NO PATHOGEN DETECTED
  // =========================================================================
  'Healthy Leaf': {
    id: 'healthy-leaf',
    cropId: 'all',
    cropName: 'Any Crop / Plant',
    diseaseName: 'Healthy Foliage (No Visible Pathogen or Pest Symptoms)',
    pathogen: 'None (Healthy Plant Tissue)',
    category: 'Healthy',
    symptoms: [
      'Vibrant uniform green pigmentation with no chlorotic spots or necrotic rings.',
      'Intact leaf margins and unblemished cuticle without fungal fruiting bodies or bacterial water-soaking.',
      'Normal leaf turgor and healthy vascular vein network without viral thickening or cupping.'
    ],
    possibleCauses: [
      'Optimal soil moisture, balanced nutrition, and sound preventive agronomic care.'
    ],
    favouringConditions: 'Good agricultural practices, balanced NPK, appropriate irrigation.',
    treatment: {
      organic: [
        'Continue regular preventive bio-stimulant or panchagavya foliar application @ 3% every 15-20 days.',
        'Maintain soil organic mulching and beneficial root zone mycorrhizae.'
      ],
      chemical: [
        'No chemical pesticide spray required! Avoid unnecessary chemical application to protect beneficial predators (ladybird beetles, spiders).'
      ]
    },
    prevention: [
      'Continue routine weekly crop scouting.',
      'Maintain balanced fertilizer application based on Soil Health Card recommendations.'
    ],
    expertAdviceCriteria: 'No expert escalation needed. Maintain standard seasonal crop care.',
    referenceSource: 'ICAR Good Agricultural Practices (GAP) Guidelines'
  }
};

/**
 * Find disease in knowledge base by crop name & disease name
 */
export function lookupDiseaseRecord(cropName, diseaseName) {
  if (!diseaseName) return null;
  const dNorm = diseaseName.toLowerCase();
  const cNorm = (cropName || '').toLowerCase();

  // 1. Direct key match
  for (const [key, record] of Object.entries(COMPREHENSIVE_DISEASE_LIBRARY)) {
    if (key.toLowerCase() === dNorm) return record;
  }

  // 2. Crop + Disease combined search
  for (const record of Object.values(COMPREHENSIVE_DISEASE_LIBRARY)) {
    const rCrop = record.cropName.toLowerCase();
    const rDis = record.diseaseName.toLowerCase();

    if (
      (rDis.includes(dNorm) || dNorm.includes(rDis)) &&
      (!cNorm || rCrop.includes(cNorm) || cNorm.includes(rCrop))
    ) {
      return record;
    }
  }

  // 3. Disease name loose match
  for (const record of Object.values(COMPREHENSIVE_DISEASE_LIBRARY)) {
    const rDis = record.diseaseName.toLowerCase();
    const keywords = dNorm.replace(/[^a-z0-9 ]/gi, '').split(/\s+/).filter(w => w.length > 3);
    const matches = keywords.filter(w => rDis.includes(w));
    if (matches.length >= 2) return record;
  }

  return null;
}

/**
 * Filter diseases for manual reference explorer
 */
export function filterDiseaseLibrary({ cropId, category, searchQuery }) {
  let list = Object.values(COMPREHENSIVE_DISEASE_LIBRARY);

  if (cropId && cropId !== 'all') {
    list = list.filter(item => item.cropId === cropId || item.cropId === 'all');
  }

  if (category && category !== 'all') {
    list = list.filter(item => item.category?.toLowerCase() === category.toLowerCase());
  }

  if (searchQuery && searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    list = list.filter(item =>
      item.diseaseName.toLowerCase().includes(q) ||
      item.cropName.toLowerCase().includes(q) ||
      item.pathogen.toLowerCase().includes(q) ||
      item.symptoms.some(s => s.toLowerCase().includes(q))
    );
  }

  return list;
}
