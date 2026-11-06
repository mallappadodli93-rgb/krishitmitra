/**
 * KrishiMitra Self-Contained Leaf Demo Samples
 * 
 * Generates guaranteed, high-resolution SVG data URIs for all 12 target crops.
 * 100% reliable: zero external network dependency, zero CORS taint issues, works offline.
 */

function createLeafSvgDataUri({ cropName, condition, bgGradient, leafColor, spotsColor, spotType }) {
  let spotElements = '';

  if (spotType === 'concentric') {
    // Bullseye / target spots (Early Blight)
    spotElements = `
      <circle cx="210" cy="180" r="32" fill="${spotsColor}" opacity="0.85"/>
      <circle cx="210" cy="180" r="22" fill="#3E2723" opacity="0.9"/>
      <circle cx="210" cy="180" r="12" fill="${spotsColor}" opacity="0.95"/>
      <circle cx="210" cy="180" r="4" fill="#1B120C"/>
      <circle cx="290" cy="270" r="24" fill="${spotsColor}" opacity="0.8"/>
      <circle cx="290" cy="270" r="15" fill="#3E2723" opacity="0.9"/>
      <circle cx="150" cy="280" r="28" fill="${spotsColor}" opacity="0.85"/>
      <circle cx="150" cy="280" r="18" fill="#3E2723" opacity="0.9"/>
    `;
  } else if (spotType === 'spindle') {
    // Spindle / eye-shaped lesions (Rice Blast)
    spotElements = `
      <ellipse cx="220" cy="160" rx="35" ry="12" transform="rotate(-30 220 160)" fill="${spotsColor}" stroke="#5D4037" stroke-width="3"/>
      <ellipse cx="220" cy="160" rx="18" ry="5" transform="rotate(-30 220 160)" fill="#CFD8DC"/>
      <ellipse cx="190" cy="240" rx="40" ry="14" transform="rotate(-25 190 240)" fill="${spotsColor}" stroke="#5D4037" stroke-width="3"/>
      <ellipse cx="190" cy="240" rx="20" ry="6" transform="rotate(-25 190 240)" fill="#CFD8DC"/>
      <ellipse cx="250" cy="310" rx="30" ry="10" transform="rotate(-35 250 310)" fill="${spotsColor}" stroke="#5D4037" stroke-width="2"/>
    `;
  } else if (spotType === 'stripes') {
    // Linear rust stripes (Wheat Yellow Rust)
    spotElements = `
      <line x1="170" y1="100" x2="170" y2="340" stroke="${spotsColor}" stroke-width="7" stroke-dasharray="14 6"/>
      <line x1="190" y1="80" x2="190" y2="370" stroke="${spotsColor}" stroke-width="9" stroke-dasharray="16 5"/>
      <line x1="210" y1="70" x2="210" y2="380" stroke="${spotsColor}" stroke-width="10" stroke-dasharray="12 4"/>
      <line x1="230" y1="90" x2="230" y2="360" stroke="${spotsColor}" stroke-width="8" stroke-dasharray="18 6"/>
      <line x1="250" y1="120" x2="250" y2="330" stroke="${spotsColor}" stroke-width="7" stroke-dasharray="10 5"/>
    `;
  } else if (spotType === 'blotches') {
    // Water-soaked or irregular necrotic blotches (Late Blight / Anthracnose)
    spotElements = `
      <path d="M 140 180 Q 180 130 230 170 Q 280 210 240 260 Q 190 300 150 250 Z" fill="${spotsColor}" opacity="0.88"/>
      <path d="M 230 240 Q 290 210 310 270 Q 300 330 250 320 Q 200 300 230 240 Z" fill="${spotsColor}" opacity="0.82"/>
      <circle cx="180" cy="330" r="22" fill="${spotsColor}" opacity="0.75"/>
    `;
  } else if (spotType === 'curling') {
    // Viral curling / puckering (Leaf Curl)
    spotElements = `
      <path d="M 160 120 Q 250 80 270 170 Q 290 260 220 330 Q 140 280 160 120 Z" fill="${spotsColor}" opacity="0.35"/>
      <path d="M 170 140 Q 220 180 240 240" stroke="#FFF59D" stroke-width="8" fill="none"/>
      <path d="M 210 190 Q 260 210 270 270" stroke="#FFF59D" stroke-width="6" fill="none"/>
    `;
  } else {
    // Healthy / unblemished
    spotElements = `
      <circle cx="210" cy="200" r="6" fill="#81C784" opacity="0.4"/>
    `;
  }

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 420" width="100%" height="100%">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bgGradient[0]}"/>
        <stop offset="100%" stop-color="${bgGradient[1]}"/>
      </linearGradient>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${leafColor[0]}"/>
        <stop offset="50%" stop-color="${leafColor[1]}"/>
        <stop offset="100%" stop-color="${leafColor[2]}"/>
      </linearGradient>
      <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="6" stdDeviation="8" flood-opacity="0.25"/>
      </filter>
    </defs>

    <!-- Background Card -->
    <rect width="420" height="420" rx="32" fill="url(#bg)"/>

    <!-- Subtle Grid Lines -->
    <g stroke="white" stroke-opacity="0.08" stroke-width="1">
      <line x1="0" y1="105" x2="420" y2="105"/>
      <line x1="0" y1="210" x2="420" y2="210"/>
      <line x1="0" y1="315" x2="420" y2="315"/>
      <line x1="105" y1="0" x2="105" y2="420"/>
      <line x1="210" y1="0" x2="210" y2="420"/>
      <line x1="315" y1="0" x2="315" y2="420"/>
    </g>

    <!-- Leaf Base Geometry with Shadow -->
    <g filter="url(#shadow)">
      <!-- Main Stem / Petiole -->
      <path d="M 210 390 Q 210 250 210 50" stroke="#2E7D32" stroke-width="8" stroke-linecap="round" fill="none"/>

      <!-- Leaf Blade -->
      <path d="M 210 60 C 330 110 340 280 210 360 C 80 280 90 110 210 60 Z" fill="url(#leafGrad)"/>

      <!-- Leaf Venation -->
      <g stroke="#388E3C" stroke-width="3" stroke-linecap="round" opacity="0.8">
        <path d="M 210 300 Q 260 270 290 250"/>
        <path d="M 210 300 Q 160 270 130 250"/>
        <path d="M 210 240 Q 270 200 305 180"/>
        <path d="M 210 240 Q 150 200 115 180"/>
        <path d="M 210 180 Q 260 140 290 120"/>
        <path d="M 210 180 Q 160 140 130 120"/>
        <path d="M 210 120 Q 245 95 265 80"/>
        <path d="M 210 120 Q 175 95 155 80"/>
      </g>

      <!-- Pathology Lesions / Symptoms -->
      <g>
        ${spotElements}
      </g>
    </g>

    <!-- Crop & Disease Pill Overlay -->
    <rect x="20" y="345" width="380" height="55" rx="16" fill="#0F172A" fill-opacity="0.85"/>
    <text x="35" y="368" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="bold" fill="#F8FAFC">${cropName}</text>
    <text x="35" y="388" font-family="system-ui, -apple-system, sans-serif" font-size="11" font-weight="500" fill="#94A3B8">${condition}</text>
  </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;
}

export const TARGET_12_DEMO_SAMPLES = [
  {
    id: 'demo-tomato-early-blight',
    cropId: 'tomato',
    cropName: 'Tomato',
    diseaseName: 'Tomato Early Blight (Alternaria solani)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Tomato (Solanaceae)',
      condition: 'Early Blight (Target Spots & Rings)',
      bgGradient: ['#1C1917', '#292524'],
      leafColor: ['#84CC16', '#4D7C0F', '#3F6212'],
      spotsColor: '#78350F',
      spotType: 'concentric'
    }),
    location: 'Raichur Vegetable Farm Plot 1',
    hint: 'Tomato foliage with concentric ring bullseye lesions'
  },
  {
    id: 'demo-rice-blast',
    cropId: 'rice',
    cropName: 'Rice / Paddy',
    diseaseName: 'Rice Blast (Magnaporthe oryzae)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Rice / Paddy (Oryza sativa)',
      condition: 'Rice Blast (Spindle Eye Lesions)',
      bgGradient: ['#064E3B', '#022C22'],
      leafColor: ['#A3E635', '#65A30D', '#3F6212'],
      spotsColor: '#713F12',
      spotType: 'spindle'
    }),
    location: 'Koppal Canal Field',
    hint: 'Spindle-shaped necrotic lesions with grey centers'
  },
  {
    id: 'demo-wheat-rust',
    cropId: 'wheat',
    cropName: 'Wheat',
    diseaseName: 'Wheat Stripe / Yellow Rust (Puccinia striiformis)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Wheat (Triticum aestivum)',
      condition: 'Stripe / Yellow Rust (Parallel Pustules)',
      bgGradient: ['#1E293B', '#0F172A'],
      leafColor: ['#BEF264', '#65A30D', '#4D7C0F'],
      spotsColor: '#EAB308',
      spotType: 'stripes'
    }),
    location: 'Belagavi Rabi Farm',
    hint: 'Linear parallel bright yellow rust stripes'
  },
  {
    id: 'demo-maize-blight',
    cropId: 'maize',
    cropName: 'Maize (Corn)',
    diseaseName: 'Maydis Leaf Blight (Bipolaris maydis)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Maize (Zea mays)',
      condition: 'Maydis Blight (Elongated Tan Lesions)',
      bgGradient: ['#14532D', '#052E16'],
      leafColor: ['#A3E635', '#4D7C0F', '#365314'],
      spotsColor: '#854D0E',
      spotType: 'blotches'
    }),
    location: 'Davanagere Corn Field',
    hint: 'Elongated tan-brown blighted lesions'
  },
  {
    id: 'demo-cotton-curl',
    cropId: 'cotton',
    cropName: 'Cotton',
    diseaseName: 'Cotton Leaf Curl Virus (CLCuV)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Cotton (Gossypium hirsutum)',
      condition: 'Cotton Leaf Curl Virus (Vein Enations)',
      bgGradient: ['#18181B', '#09090B'],
      leafColor: ['#FACC15', '#CA8A04', '#4D7C0F'],
      spotsColor: '#EAB308',
      spotType: 'curling'
    }),
    location: 'Ballari Black Soil Farm',
    hint: 'Upward leaf margin curling and vein thickening'
  },
  {
    id: 'demo-chilli-anthracnose',
    cropId: 'chilli',
    cropName: 'Chilli / Green Pepper',
    diseaseName: 'Chilli Anthracnose / Fruit Rot (Colletotrichum)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Chilli (Capsicum annuum)',
      condition: 'Anthracnose & Twig Dieback',
      bgGradient: ['#450A0A', '#1C1917'],
      leafColor: ['#4ADE80', '#15803D', '#14532D'],
      spotsColor: '#1C1917',
      spotType: 'blotches'
    }),
    location: 'Byadagi Chilli Plot',
    hint: 'Sunken necrotic spots on chilli pods and dieback twigs'
  },
  {
    id: 'demo-potato-blight',
    cropId: 'potato',
    cropName: 'Potato',
    diseaseName: 'Potato Late Blight (Phytophthora infestans)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Potato (Solanum tuberosum)',
      condition: 'Late Blight (Water-Soaked Necrosis)',
      bgGradient: ['#1C1917', '#0C0A09'],
      leafColor: ['#86EFAC', '#22C55E', '#15803D'],
      spotsColor: '#451A03',
      spotType: 'blotches'
    }),
    location: 'Hassan Potato Farm',
    hint: 'Water-soaked purplish lesions on potato canopy'
  },
  {
    id: 'demo-groundnut-tikka',
    cropId: 'groundnut',
    cropName: 'Groundnut (Peanut)',
    diseaseName: 'Tikka Leaf Spot (Cercospora)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Groundnut (Arachis hypogaea)',
      condition: 'Tikka Leaf Spot (Yellow Halo Lesions)',
      bgGradient: ['#1E293B', '#0F172A'],
      leafColor: ['#A3E635', '#4D7C0F', '#15803D'],
      spotsColor: '#78350F',
      spotType: 'concentric'
    }),
    location: 'Tumakuru Groundnut Plot',
    hint: 'Circular leaf spots with chlorotic yellow rings'
  },
  {
    id: 'demo-mango-anthracnose',
    cropId: 'mango',
    cropName: 'Mango',
    diseaseName: 'Mango Anthracnose (Colletotrichum)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Mango (Mangifera indica)',
      condition: 'Anthracnose (Tear-Stain Spots)',
      bgGradient: ['#042F2E', '#022C22'],
      leafColor: ['#22C55E', '#166534', '#14532D'],
      spotsColor: '#18181B',
      spotType: 'blotches'
    }),
    location: 'Srinivaspur Mango Orchard',
    hint: 'Tear-stain dark lesions on mango foliage'
  },
  {
    id: 'demo-banana-sigatoka',
    cropId: 'banana',
    cropName: 'Banana',
    diseaseName: 'Banana Sigatoka Leaf Spot',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Banana (Musa acuminata)',
      condition: 'Sigatoka (Reddish-Brown Streaks)',
      bgGradient: ['#064E3B', '#022C22'],
      leafColor: ['#84CC16', '#4D7C0F', '#15803D'],
      spotsColor: '#7C2D12',
      spotType: 'spindle'
    }),
    location: 'Nanjangud Banana Plantation',
    hint: 'Elongated reddish-brown necrotic streaks'
  },
  {
    id: 'demo-grapes-downy',
    cropId: 'grapes',
    cropName: 'Grapes',
    diseaseName: 'Grapevine Downy Mildew (Plasmopara viticola)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Grapes (Vitis vinifera)',
      condition: 'Downy Mildew (Translucent Oil Spots)',
      bgGradient: ['#1E1B4B', '#0F172A'],
      leafColor: ['#4ADE80', '#15803D', '#166534'],
      spotsColor: '#CA8A04',
      spotType: 'blotches'
    }),
    location: 'Vijayapura Vineyard',
    hint: 'Yellow translucent oil spots on upper leaf surface'
  },
  {
    id: 'demo-healthy-garden',
    cropId: 'garden',
    cropName: 'Garden / House Plants',
    diseaseName: 'Healthy Foliage (No Visible Pathogen)',
    sampleImage: createLeafSvgDataUri({
      cropName: 'Garden Foliage (Healthy Plant)',
      condition: 'Normal Plant Tissue (Zero Pathogen)',
      bgGradient: ['#022C22', '#064E3B'],
      leafColor: ['#4ADE80', '#16A34A', '#15803D'],
      spotsColor: '#22C55E',
      spotType: 'healthy'
    }),
    location: 'Home Garden / Farm Nursery',
    hint: 'Lush green unblemished foliage with zero pathogen symptoms'
  }
];

