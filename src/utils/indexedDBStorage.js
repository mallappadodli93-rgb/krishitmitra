// KrishiMitra IndexedDB Storage Utility
// Manages:
// 1. Farmer Profile (Personal + Farm Details)
// 2. Farming Records (Crop logs + Acreage + Yield + Images)
// 3. Crop Schedules (Planting to Harvest Timeline + Growth Stages)
// 4. Farming Reminders (Irrigation, Fertilizer, Inspection, Pest Monitoring)

const DB_NAME = 'KrishiMitra_FarmerDB';
const DB_VERSION = 3;

export const STORES = {
  FARMER_PROFILE: 'farmerProfile',
  FARMING_RECORDS: 'farmingRecords',
  CROP_SCHEDULES: 'cropSchedules',
  FARMING_REMINDERS: 'farmingReminders',
  FARM_LOCATIONS: 'farmLocations',
};

// ==========================================
// Default Seed Datasets
// ==========================================

export const DEFAULT_INDEXEDDB_PROFILE = {
  id: 'KM-2026-8842',
  farmerId: 'KM-2026-8842',
  name: 'Ramesh Patel',
  mobile: '9876543210',
  email: 'ramesh.farmer@gmail.com',
  village: 'Niphad',
  district: 'Nashik',
  state: 'Maharashtra',
  preferredLanguage: 'kn',
  
  // Farm Details
  farmName: 'Shri Krishna Krishi Kshetra',
  farmLocation: 'Gat No. 142/A, Niphad-Pimpalgaon Road, Nashik (20.0760° N, 74.0435° E)',
  landSize: 5.5,
  landUnit: 'Acres',
  soilType: 'Medium Black Cotton (Regur) Loam',
  availableIrrigation: 'Drip Irrigation & Borewell',
  cropsGrowing: ['Wheat (HD-3086)', 'Chickpea / Gram (JG-14)', 'Nashik Red Onion'],
  
  avatarImage: '',
  syncStatus: 'local',
  storageEngine: 'IndexedDB',
  createdAt: '2026-10-15T08:30:00.000Z',
  updatedAt: new Date().toISOString(),
};

export const DEFAULT_FARM_LOCATIONS = [
  {
    id: 'FARM-LOC-001',
    name: 'Main Canal Plot (ಮುಖ್ಯ ಜಮೀನು)',
    surveyNumber: 'Sy No. 142/A',
    village: 'Niphad',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Gat No. 142/A, Pimpalgaon Road, Niphad, Nashik, Maharashtra 422303',
    lat: 20.0760,
    lng: 74.0435,
    landSize: 3.5,
    landUnit: 'Acres',
    waterSource: 'Canal & Lift Irrigation',
    soilType: 'Medium Black Cotton (Regur) Loam',
    soilPh: 7.2,
    purpose: 'Main Cereal & Onion Cultivation',
    isPrimary: true,
    boundaries: [
      { lat: 20.0780, lng: 74.0415 },
      { lat: 20.0782, lng: 74.0455 },
      { lat: 20.0745, lng: 74.0460 },
      { lat: 20.0742, lng: 74.0418 }
    ],
    createdAt: '2026-10-15T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  },
  {
    id: 'FARM-LOC-002',
    name: 'Borewell Orchard Plot (ಕೊಳವೆಬಾವಿ ತೋಟ)',
    surveyNumber: 'Gat No. 88/2',
    village: 'Dindori',
    district: 'Nashik',
    state: 'Maharashtra',
    address: 'Survey 88/2, Wani Road, Dindori, Nashik, Maharashtra 422202',
    lat: 20.2015,
    lng: 73.8320,
    landSize: 2.0,
    landUnit: 'Acres',
    waterSource: 'Single Borewell with Drip',
    soilType: 'Red Sandy Loam / Red Soil',
    soilPh: 6.8,
    purpose: 'Grapevine & Vegetable Horticulture',
    isPrimary: false,
    boundaries: [
      { lat: 20.2030, lng: 73.8305 },
      { lat: 20.2032, lng: 73.8340 },
      { lat: 20.2000, lng: 73.8338 },
      { lat: 20.1998, lng: 73.8302 }
    ],
    createdAt: '2026-10-20T10:30:00.000Z',
    updatedAt: new Date().toISOString()
  }
];

export const DEFAULT_INDEXEDDB_RECORDS = [
  {
    id: 'REC-2026-001',
    cropName: 'Wheat (HD-3086 / Gehun / ಗೋಧಿ)',
    category: 'Cereal / Rabi Grain',
    season: 'Rabi',
    status: 'Growing',
    farmArea: 3.0,
    landUnit: 'Acres',
    sowingDate: '2026-10-25',
    expectedHarvestDate: '2027-03-20',
    soilType: 'Medium Black Cotton Soil',
    irrigationType: 'Drip Irrigation (Daily 2h)',
    projectedYield: '22 Quintals / Acre',
    fertilizersApplied: 'Basal dose: DAP 50kg/acre + Top dressing Urea at CRI stage (21 DAS)',
    healthStatus: 'Excellent (Zero pest attacks logged)',
    cropImage: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=800&auto=format&fit=crop&q=80',
    notes: 'Crown root initiation irrigation completed on day 22. Vigorous tillering observed across all 3 acres.',
    syncStatus: 'local',
    createdAt: '2026-10-25T10:00:00.000Z',
    updatedAt: '2026-11-04T12:00:00.000Z'
  },
  {
    id: 'REC-2026-002',
    cropName: 'Chickpea / Gram (JG-14 / Chana / ಕಡಲೆ)',
    category: 'Pulse / Legume',
    season: 'Rabi',
    status: 'Growing',
    farmArea: 1.5,
    landUnit: 'Acres',
    sowingDate: '2026-11-02',
    expectedHarvestDate: '2027-02-28',
    soilType: 'Medium Black Loam',
    irrigationType: 'Borewell / Furrow Irrigation',
    projectedYield: '9.5 Quintals / Acre',
    fertilizersApplied: 'Rhizobium seed treatment + 20kg Elemental Sulfur basal dose',
    healthStatus: 'Good (Bird perches installed for borer control)',
    cropImage: 'https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?w=800&auto=format&fit=crop&q=80',
    notes: 'Pre-flowering vegetative phase. Strictly holding flood irrigation to avoid flower drop.',
    syncStatus: 'local',
    createdAt: '2026-11-02T09:15:00.000Z',
    updatedAt: '2026-11-05T14:30:00.000Z'
  },
  {
    id: 'REC-2026-003',
    cropName: 'Nashik Red Onion (Garwa / ಈರುಳ್ಳಿ)',
    category: 'Vegetable / Cash Crop',
    season: 'Kharif',
    status: 'Harvested',
    farmArea: 1.0,
    landUnit: 'Acres',
    sowingDate: '2026-06-15',
    expectedHarvestDate: '2026-10-18',
    soilType: 'Well-Drained Sandy Loam',
    irrigationType: 'Drip System with Fertigation',
    projectedYield: '110 Quintals / Acre',
    fertilizersApplied: '19:19:19 soluble fertilizer via drip + Trichoderma drenching',
    healthStatus: 'Harvested (Sold at APMC Pimpalgaon mandi)',
    cropImage: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800&auto=format&fit=crop&q=80',
    notes: 'Completed harvest before late October rains. Achieved average auction price of ₹2,240/quintal.',
    syncStatus: 'local',
    createdAt: '2026-06-15T08:00:00.000Z',
    updatedAt: '2026-10-22T16:45:00.000Z'
  }
];

// Crop schedule templates (editable suggestions)
export const CROP_SCHEDULE_TEMPLATES = {
  'Wheat (HD-3086)': {
    cropName: 'Wheat (HD-3086 / Gehun / ಗೋಧಿ)',
    durationDays: 125,
    stages: [
      { name: 'Sowing & Germination', days: '0 - 10 DAS', desc: 'Seed sprout and coleoptile emergence' },
      { name: 'Crown Root Initiation (CRI)', days: '20 - 25 DAS', desc: 'Critical root nodal establishment' },
      { name: 'Tillering & Jointing', days: '40 - 55 DAS', desc: 'Secondary stem elongation and canopy spread' },
      { name: 'Flowering & Booting', days: '65 - 80 DAS', desc: 'Ears emerge from the flag leaf sheath' },
      { name: 'Grain Filling (Milking & Dough)', days: '85 - 105 DAS', desc: 'Kernel starch deposition' },
      { name: 'Maturity & Golden Harvest', days: '115 - 125 DAS', desc: 'Moisture drops below 14%' }
    ],
    suggestedReminders: [
      { type: 'irrigation', daysAfterPlanting: 21, title: 'Crown Root Initiation (CRI) Irrigation', priority: 'high', desc: 'First mandatory irrigation strictly between 20-25 days after sowing.' },
      { type: 'fertilizer', daysAfterPlanting: 22, title: 'Top-Dress First Dose of Urea', priority: 'high', desc: 'Apply 30-35 kg Urea per acre immediately following CRI irrigation.' },
      { type: 'pest_monitoring', daysAfterPlanting: 35, title: 'Scout Lower Leaves for Yellow Rust', priority: 'medium', desc: 'Inspect foliage for linear yellow powdery pustules during cold foggy mornings.' },
      { type: 'inspection', daysAfterPlanting: 45, title: 'Tillering Density & Weed Inspection', priority: 'medium', desc: 'Count tillers per hill and remove broadleaf weeds if found.' },
      { type: 'irrigation', daysAfterPlanting: 60, title: 'Late Tillering / Jointing Irrigation', priority: 'medium', desc: 'Ensure moisture support as stem nodes lengthen.' },
      { type: 'fertilizer', daysAfterPlanting: 65, title: 'Second Split Urea Dose', priority: 'medium', desc: 'Apply remaining 25% Nitrogen top-dressing before booting.' },
      { type: 'pest_monitoring', daysAfterPlanting: 75, title: 'Check Flag Leaf for Aphid Colonies', priority: 'medium', desc: 'Look for aphid clusters on terminal shoots; spray neem oil if over threshold.' },
      { type: 'irrigation', daysAfterPlanting: 85, title: 'Flowering / Heading Stage Irrigation', priority: 'high', desc: 'Critical water window for pollination and fertile spikelets.' }
    ]
  },
  'Chickpea / Gram (JG-14)': {
    cropName: 'Chickpea / Gram (JG-14 / Chana / ಕಡಲೆ)',
    durationDays: 110,
    stages: [
      { name: 'Sowing & Emergence', days: '0 - 12 DAS', desc: 'Hypogeal emergence and taproot start' },
      { name: 'Vegetative Branching', days: '25 - 40 DAS', desc: 'Lateral branches and foliage development' },
      { name: 'Flower Budding', days: '45 - 55 DAS', desc: 'Blossom initiation (Caution: Zero flood watering)' },
      { name: 'Pod Setting & Filling', days: '65 - 85 DAS', desc: 'Green pod inflation and grain growth' },
      { name: 'Pod Yellowing & Harvest', days: '95 - 110 DAS', desc: 'Pods rattle with dry seeds' }
    ],
    suggestedReminders: [
      { type: 'pest_monitoring', daysAfterPlanting: 30, title: 'Install Bird Perches & Pheromone Traps', priority: 'high', desc: 'Install 40 T-shaped wooden perches per acre for natural borer predation.' },
      { type: 'irrigation', daysAfterPlanting: 35, title: 'Pre-Flowering Light Branch Irrigation', priority: 'medium', desc: 'Apply light irrigation before flower buds break open.' },
      { type: 'inspection', daysAfterPlanting: 50, title: 'Active Flowering Inspection (HOLD WATER)', priority: 'high', desc: 'Do NOT irrigate during peak bloom to prevent flower drop.' },
      { type: 'pest_monitoring', daysAfterPlanting: 65, title: 'Helicoverpa Pod Borer Scout', priority: 'high', desc: 'Check young green pods for circular entry holes.' },
      { type: 'irrigation', daysAfterPlanting: 75, title: 'Pod Development Light Watering', priority: 'medium', desc: 'Ensure moisture during pod seed swelling.' }
    ]
  },
  'Basmati Rice (Pusa 1121)': {
    cropName: 'Basmati Rice (Pusa 1121 / Dhan / ಭತ್ತ)',
    durationDays: 140,
    stages: [
      { name: 'Nursery & Seedling', days: '0 - 25 DAS', desc: 'Nursery bed preparation and seedling growth' },
      { name: 'Transplanting & Recovery', days: '25 - 35 DAS', desc: 'Field transplanting at 20x15cm' },
      { name: 'Active Tillering', days: '40 - 65 DAS', desc: 'Rapid tillering and root network expansion' },
      { name: 'Panicle Initiation & Booting', days: '70 - 90 DAS', desc: 'Panicle emergence inside stem' },
      { name: 'Heading & Grain Milking', days: '95 - 115 DAS', desc: 'Pollination and milky starch' },
      { name: 'Ripening & Harvest', days: '130 - 140 DAS', desc: 'Drain field 10 days before harvest' }
    ],
    suggestedReminders: [
      { type: 'irrigation', daysAfterPlanting: 25, title: 'Puddle Field & Transplant Seedlings', priority: 'high', desc: 'Maintain 2-3 cm shallow water level after transplanting.' },
      { type: 'fertilizer', daysAfterPlanting: 35, title: 'Apply Basal Zinc Sulfate', priority: 'medium', desc: 'Apply Zinc Sulfate 21% @ 10 kg/acre to protect against Khaira deficiency.' },
      { type: 'pest_monitoring', daysAfterPlanting: 50, title: 'Monitor for Stem Borer & Leaf Folder', priority: 'high', desc: 'Look for deadhearts in tillers or folded leaf blades.' },
      { type: 'fertilizer', daysAfterPlanting: 60, title: 'Mid-Tillering Urea Top-Dressing', priority: 'medium', desc: 'Broadcast second split of nitrogen with MOP potash.' },
      { type: 'irrigation', daysAfterPlanting: 80, title: 'Alternate Wetting and Drying (AWD)', priority: 'medium', desc: 'Practice AWD to save 25% water and curb root suffocation.' }
    ]
  },
  'Tomato (Hybrid / ಟೊಮೆಟೊ)': {
    cropName: 'Tomato (Hybrid / Tamatar / ಟೊಮೆಟೊ)',
    durationDays: 120,
    stages: [
      { name: 'Nursery & Seedling', days: '0 - 25 DAS', desc: 'Plug tray germination' },
      { name: 'Transplanting & Staking', days: '25 - 40 DAS', desc: 'Mulch and stake young plants' },
      { name: 'Flowering & Fruit Set', days: '45 - 65 DAS', desc: 'Yellow blossoms and small green berries' },
      { name: 'Fruit Development', days: '70 - 95 DAS', desc: 'Fruit enlargement and breaker stage' },
      { name: 'Harvesting Flushes', days: '100 - 120 DAS', desc: 'Weekly pickings of firm ripe tomatoes' }
    ],
    suggestedReminders: [
      { type: 'pest_monitoring', daysAfterPlanting: 30, title: 'Inspect Leaf Undersides for Whiteflies', priority: 'high', desc: 'Whiteflies transmit Leaf Curl Virus. Install yellow sticky traps.' },
      { type: 'fertilizer', daysAfterPlanting: 40, title: 'Calcium Nitrate Fertigation', priority: 'high', desc: 'Drip calcium nitrate to prevent blossom end rot.' },
      { type: 'pest_monitoring', daysAfterPlanting: 55, title: 'Check for Alternaria Early Blight Rings', priority: 'high', desc: 'Inspect lower foliage for concentric target-like brown spots.' },
      { type: 'irrigation', daysAfterPlanting: 70, title: 'Consistent Drip Irrigation Interval', priority: 'medium', desc: 'Avoid dry spells followed by heavy watering to prevent fruit cracking.' }
    ]
  }
};

export const DEFAULT_INDEXEDDB_SCHEDULES = [
  {
    id: 'SCH-2026-001',
    cropName: 'Wheat (HD-3086)',
    variety: 'HD-3086 (Pusa Tejas)',
    fieldArea: 3.0,
    landUnit: 'Acres',
    plantingDate: '2026-10-25',
    expectedHarvestDate: '2027-03-20',
    currentStageIndex: 2, // Tillering
    stages: CROP_SCHEDULE_TEMPLATES['Wheat (HD-3086)'].stages,
    notes: 'Sown with seed-cum-fertilizer drill following pre-sowing irrigation (Ronik).',
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'SCH-2026-002',
    cropName: 'Chickpea / Gram (JG-14)',
    variety: 'JG-14 (Wilt Resistant)',
    fieldArea: 1.5,
    landUnit: 'Acres',
    plantingDate: '2026-11-02',
    expectedHarvestDate: '2027-02-28',
    currentStageIndex: 1, // Vegetative
    stages: CROP_SCHEDULE_TEMPLATES['Chickpea / Gram (JG-14)'].stages,
    notes: 'Treated with Rhizobium leguminosarum culture. Good plant stand.',
    createdAt: '2026-11-02T09:15:00.000Z'
  }
];

export const DEFAULT_INDEXEDDB_REMINDERS = [
  {
    id: 'REM-101',
    scheduleId: 'SCH-2026-001',
    cropName: 'Wheat (HD-3086)',
    type: 'irrigation', // 'irrigation' | 'fertilizer' | 'inspection' | 'pest_monitoring'
    title: 'Crown Root Irrigation (21 DAS)',
    dueDate: '2026-11-15',
    dueTime: '07:00',
    priority: 'high',
    description: 'Mandatory CRI stage irrigation. Hold flood watering if rainfall occurs within 48h.',
    status: 'pending', // 'pending' | 'completed' | 'dismissed'
    isSuggested: true,
    notified: false,
    syncStatus: 'local',
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'REM-102',
    scheduleId: 'SCH-2026-001',
    cropName: 'Wheat (HD-3086)',
    type: 'fertilizer',
    title: 'Top-Dress 1st Dose Urea (30 kg/Acre)',
    dueDate: '2026-11-17',
    dueTime: '08:30',
    priority: 'high',
    description: 'Apply nitrogen top-dressing 2 days after CRI irrigation while soil has optimal moisture.',
    status: 'pending',
    isSuggested: true,
    notified: false,
    syncStatus: 'local',
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'REM-103',
    scheduleId: 'SCH-2026-001',
    cropName: 'Wheat (HD-3086)',
    type: 'pest_monitoring',
    title: 'Scout Flag Leaves for Yellow Rust Spots',
    dueDate: '2026-11-10',
    dueTime: '08:00',
    priority: 'medium',
    description: 'Walk field diagonals during cool morning fog. Check leaf blades for linear orange stripes.',
    status: 'pending',
    isSuggested: true,
    notified: false,
    syncStatus: 'local',
    createdAt: '2026-10-25T10:00:00.000Z'
  },
  {
    id: 'REM-104',
    scheduleId: 'SCH-2026-002',
    cropName: 'Chickpea / Gram (JG-14)',
    type: 'pest_monitoring',
    title: 'Install Bird Perches for Pod Borer Predation',
    dueDate: '2026-11-12',
    dueTime: '09:00',
    priority: 'high',
    description: 'Install 40 T-shaped perches per acre to attract insectivorous birds naturally.',
    status: 'pending',
    isSuggested: true,
    notified: false,
    syncStatus: 'local',
    createdAt: '2026-11-02T09:15:00.000Z'
  },
  {
    id: 'REM-105',
    scheduleId: 'SCH-2026-002',
    cropName: 'Chickpea / Gram (JG-14)',
    type: 'inspection',
    title: 'Check Moisture & Avoid Flood Irrigation',
    dueDate: '2026-11-18',
    dueTime: '10:00',
    priority: 'medium',
    description: 'Inspect soil condition. Heavy irrigation now causes flower drop and vegetative overgrowth.',
    status: 'pending',
    isSuggested: true,
    notified: false,
    syncStatus: 'local',
    createdAt: '2026-11-02T09:15:00.000Z'
  }
];

// ==========================================
// Database Setup & Connection
// ==========================================

export function openFarmerDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this browser environment.'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 1. Farmer Profile Store
      if (!db.objectStoreNames.contains(STORES.FARMER_PROFILE)) {
        db.createObjectStore(STORES.FARMER_PROFILE, { keyPath: 'id' });
      }

      // 2. Farming Records Store
      if (!db.objectStoreNames.contains(STORES.FARMING_RECORDS)) {
        const recordsStore = db.createObjectStore(STORES.FARMING_RECORDS, { keyPath: 'id' });
        recordsStore.createIndex('season', 'season', { unique: false });
        recordsStore.createIndex('status', 'status', { unique: false });
        recordsStore.createIndex('cropName', 'cropName', { unique: false });
        recordsStore.createIndex('createdAt', 'createdAt', { unique: false });
      }

      // 3. Crop Schedules Store
      if (!db.objectStoreNames.contains(STORES.CROP_SCHEDULES)) {
        const scheduleStore = db.createObjectStore(STORES.CROP_SCHEDULES, { keyPath: 'id' });
        scheduleStore.createIndex('cropName', 'cropName', { unique: false });
        scheduleStore.createIndex('plantingDate', 'plantingDate', { unique: false });
      }

      // 4. Farming Reminders Store
      if (!db.objectStoreNames.contains(STORES.FARMING_REMINDERS)) {
        const reminderStore = db.createObjectStore(STORES.FARMING_REMINDERS, { keyPath: 'id' });
        reminderStore.createIndex('dueDate', 'dueDate', { unique: false });
        reminderStore.createIndex('type', 'type', { unique: false });
        reminderStore.createIndex('status', 'status', { unique: false });
        reminderStore.createIndex('scheduleId', 'scheduleId', { unique: false });
      }

      // 5. Farm Locations Store (Multiple Farm Plots)
      if (!db.objectStoreNames.contains(STORES.FARM_LOCATIONS)) {
        const locationStore = db.createObjectStore(STORES.FARM_LOCATIONS, { keyPath: 'id' });
        locationStore.createIndex('district', 'district', { unique: false });
        locationStore.createIndex('village', 'village', { unique: false });
        locationStore.createIndex('isPrimary', 'isPrimary', { unique: false });
        locationStore.createIndex('createdAt', 'createdAt', { unique: false });
      }
    };

    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(new Error(`Failed to open IndexedDB: ${event.target.error?.message || 'Error'}`));
  });
}

/**
 * Seed initial farmer profile, records, schedules and reminders if empty
 */
export async function seedIndexedDBIfEmpty() {
  try {
    const db = await openFarmerDB();

    // Profile Store
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.FARMER_PROFILE, 'readwrite');
      const store = tx.objectStore(STORES.FARMER_PROFILE);
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) store.put(DEFAULT_INDEXEDDB_PROFILE);
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // Records Store
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.FARMING_RECORDS, 'readwrite');
      const store = tx.objectStore(STORES.FARMING_RECORDS);
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) DEFAULT_INDEXEDDB_RECORDS.forEach(r => store.put(r));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // Schedules Store
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.CROP_SCHEDULES, 'readwrite');
      const store = tx.objectStore(STORES.CROP_SCHEDULES);
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) DEFAULT_INDEXEDDB_SCHEDULES.forEach(s => store.put(s));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // Reminders Store
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.FARMING_REMINDERS, 'readwrite');
      const store = tx.objectStore(STORES.FARMING_REMINDERS);
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) DEFAULT_INDEXEDDB_REMINDERS.forEach(rem => store.put(rem));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    // Farm Locations Store (Multiple Farm Locations)
    await new Promise((resolve) => {
      if (!db.objectStoreNames.contains(STORES.FARM_LOCATIONS)) {
        resolve();
        return;
      }
      const tx = db.transaction(STORES.FARM_LOCATIONS, 'readwrite');
      const store = tx.objectStore(STORES.FARM_LOCATIONS);
      const countReq = store.count();
      countReq.onsuccess = () => {
        if (countReq.result === 0) DEFAULT_FARM_LOCATIONS.forEach(loc => store.put(loc));
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });

    db.close();
  } catch (err) {
    console.warn('Could not seed IndexedDB:', err);
  }
}

// ==========================================
// 1. Farmer Profile Repository
// ==========================================

export async function getFarmerProfileFromDB(profileId = DEFAULT_INDEXEDDB_PROFILE.id) {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMER_PROFILE, 'readonly');
    const store = tx.objectStore(STORES.FARMER_PROFILE);
    const request = store.get(profileId);

    request.onsuccess = () => {
      if (request.result) {
        resolve(request.result);
      } else {
        const cursorReq = store.openCursor();
        cursorReq.onsuccess = (e) => {
          const cursor = e.target.result;
          resolve(cursor ? cursor.value : DEFAULT_INDEXEDDB_PROFILE);
        };
        cursorReq.onerror = () => resolve(DEFAULT_INDEXEDDB_PROFILE);
      }
    };
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveFarmerProfileToDB(profileData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMER_PROFILE, 'readwrite');
    const store = tx.objectStore(STORES.FARMER_PROFILE);

    const enriched = {
      ...profileData,
      id: profileData.id || profileData.farmerId || DEFAULT_INDEXEDDB_PROFILE.id,
      farmerId: profileData.farmerId || profileData.id || DEFAULT_INDEXEDDB_PROFILE.farmerId,
      updatedAt: new Date().toISOString(),
      syncStatus: 'local',
      storageEngine: 'IndexedDB'
    };

    const request = store.put(enriched);
    request.onsuccess = () => resolve(enriched);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

// ==========================================
// 2. Farming Records Repository
// ==========================================

export async function getAllFarmingRecordsFromDB() {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.FARMING_RECORDS);
    const request = store.getAll();

    request.onsuccess = () => {
      const records = (request.result || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      resolve(records);
    };
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function getFarmingRecordByIdFromDB(id) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_RECORDS, 'readonly');
    const store = tx.objectStore(STORES.FARMING_RECORDS);
    const request = store.get(id);

    request.onsuccess = () => resolve(request.result || null);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function addFarmingRecordToDB(recordData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_RECORDS);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const newRecord = {
      ...recordData,
      id: recordData.id || `REC-${new Date().getFullYear()}-${randomSuffix}`,
      syncStatus: 'local',
      createdAt: recordData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const request = store.add(newRecord);
    request.onsuccess = () => resolve(newRecord);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function updateFarmingRecordInDB(recordData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_RECORDS);

    const updated = {
      ...recordData,
      syncStatus: 'local',
      updatedAt: new Date().toISOString()
    };

    const request = store.put(updated);
    request.onsuccess = () => resolve(updated);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteFarmingRecordFromDB(id) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_RECORDS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_RECORDS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

// ==========================================
// 3. Crop Schedules Repository
// ==========================================

export async function getAllCropSchedulesFromDB() {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CROP_SCHEDULES, 'readonly');
    const store = tx.objectStore(STORES.CROP_SCHEDULES);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result || []);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function saveCropScheduleToDB(scheduleData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CROP_SCHEDULES, 'readwrite');
    const store = tx.objectStore(STORES.CROP_SCHEDULES);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const schedule = {
      ...scheduleData,
      id: scheduleData.id || `SCH-${new Date().getFullYear()}-${randomSuffix}`,
      syncStatus: 'local',
      updatedAt: new Date().toISOString()
    };

    const request = store.put(schedule);
    request.onsuccess = () => resolve(schedule);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteCropScheduleFromDB(id) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.CROP_SCHEDULES, 'readwrite');
    const store = tx.objectStore(STORES.CROP_SCHEDULES);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

// ==========================================
// 4. Farming Reminders Repository
// ==========================================

export async function getAllFarmingRemindersFromDB() {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_REMINDERS, 'readonly');
    const store = tx.objectStore(STORES.FARMING_REMINDERS);
    const request = store.getAll();

    request.onsuccess = () => {
      // Sort chronologically by dueDate
      const reminders = (request.result || []).sort((a, b) => {
        return (a.dueDate || '').localeCompare(b.dueDate || '');
      });
      resolve(reminders);
    };
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function addFarmingReminderToDB(reminderData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_REMINDERS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_REMINDERS);

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const reminder = {
      ...reminderData,
      id: reminderData.id || `REM-${randomSuffix}`,
      status: reminderData.status || 'pending',
      syncStatus: 'local',
      createdAt: reminderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const request = store.put(reminder);
    request.onsuccess = () => resolve(reminder);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function updateFarmingReminderInDB(reminderData) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_REMINDERS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_REMINDERS);

    const updated = {
      ...reminderData,
      updatedAt: new Date().toISOString()
    };

    const request = store.put(updated);
    request.onsuccess = () => resolve(updated);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

export async function deleteFarmingReminderFromDB(id) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARMING_REMINDERS, 'readwrite');
    const store = tx.objectStore(STORES.FARMING_REMINDERS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
    tx.oncomplete = () => db.close();
  });
}

// ==========================================
// 5. Full Export & Import Functions
// ==========================================

export async function exportAllDataToJSON() {
  const profile = await getFarmerProfileFromDB();
  const records = await getAllFarmingRecordsFromDB();
  const schedules = await getAllCropSchedulesFromDB();
  const reminders = await getAllFarmingRemindersFromDB();

  const payload = {
    appName: 'KrishiMitra – Smart Farming Assistant',
    exportVersion: '2.0',
    exportedAt: new Date().toISOString(),
    storageEngine: 'IndexedDB',
    profile,
    records,
    schedules,
    reminders
  };

  return JSON.stringify(payload, null, 2);
}

export async function exportRecordsToCSV() {
  const records = await getAllFarmingRecordsFromDB();
  const headers = [
    'Record ID', 'Crop Name', 'Category', 'Season', 'Status',
    'Area (Acres)', 'Sowing Date', 'Expected Harvest Date', 'Soil Type',
    'Irrigation Type', 'Projected Yield', 'Fertilizers Applied', 'Health Status', 'Notes'
  ];

  const escapeCSV = (str) => {
    if (str === null || str === undefined) return '""';
    return `"${String(str).replace(/"/g, '""')}"`;
  };

  const rows = records.map((r) => [
    escapeCSV(r.id), escapeCSV(r.cropName), escapeCSV(r.category),
    escapeCSV(r.season), escapeCSV(r.status), escapeCSV(r.farmArea),
    escapeCSV(r.sowingDate), escapeCSV(r.expectedHarvestDate), escapeCSV(r.soilType),
    escapeCSV(r.irrigationType), escapeCSV(r.projectedYield),
    escapeCSV(r.fertilizersApplied), escapeCSV(r.healthStatus), escapeCSV(r.notes)
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}

export async function importDataFromJSON(rawData) {
  let parsed = rawData;
  if (typeof rawData === 'string') {
    try {
      parsed = JSON.parse(rawData);
    } catch (e) {
      throw new Error('Invalid JSON format.');
    }
  }

  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Import data is invalid.');
  }

  let importedRecords = 0;
  let importedReminders = 0;

  if (parsed.profile) {
    await saveFarmerProfileToDB(parsed.profile);
  }

  const db = await openFarmerDB();

  // Import Records
  if (Array.isArray(parsed.records)) {
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.FARMING_RECORDS, 'readwrite');
      const store = tx.objectStore(STORES.FARMING_RECORDS);
      parsed.records.forEach((rec) => {
        if (rec && rec.id) {
          store.put({ ...rec, syncStatus: 'local', updatedAt: new Date().toISOString() });
          importedRecords++;
        }
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // Import Schedules
  if (Array.isArray(parsed.schedules)) {
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.CROP_SCHEDULES, 'readwrite');
      const store = tx.objectStore(STORES.CROP_SCHEDULES);
      parsed.schedules.forEach((sch) => {
        if (sch && sch.id) store.put(sch);
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  // Import Reminders
  if (Array.isArray(parsed.reminders)) {
    await new Promise((resolve) => {
      const tx = db.transaction(STORES.FARMING_REMINDERS, 'readwrite');
      const store = tx.objectStore(STORES.FARMING_REMINDERS);
      parsed.reminders.forEach((rem) => {
        if (rem && rem.id) {
          store.put(rem);
          importedReminders++;
        }
      });
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
    });
  }

  db.close();

  return {
    success: true,
    message: `Imported profile, ${importedRecords} crop records, and ${importedReminders} reminders into IndexedDB!`,
    importedRecords,
    importedReminders
  };
}

// ==========================================
// 6. Farm Locations Repository (Multiple Farm Plots)
// ==========================================

export async function getAllFarmLocationsFromDB() {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve) => {
    if (!db.objectStoreNames.contains(STORES.FARM_LOCATIONS)) {
      resolve(DEFAULT_FARM_LOCATIONS);
      return;
    }
    const tx = db.transaction(STORES.FARM_LOCATIONS, 'readonly');
    const store = tx.objectStore(STORES.FARM_LOCATIONS);
    const request = store.getAll();

    request.onsuccess = () => {
      const results = request.result || [];
      if (results.length === 0) {
        resolve(DEFAULT_FARM_LOCATIONS);
      } else {
        // Sort with primary farm first, then newest
        results.sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));
        resolve(results);
      }
    };

    request.onerror = () => {
      resolve(DEFAULT_FARM_LOCATIONS);
    };
  });
}

export async function saveFarmLocationToDB(farmLocation) {
  await seedIndexedDBIfEmpty();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARM_LOCATIONS, 'readwrite');
    const store = tx.objectStore(STORES.FARM_LOCATIONS);

    const newLocation = {
      ...farmLocation,
      id: farmLocation.id || `FARM-LOC-${Date.now().toString().slice(-4)}`,
      createdAt: farmLocation.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const request = store.put(newLocation);

    request.onsuccess = () => resolve(newLocation);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function updateFarmLocationInDB(farmLocation) {
  return saveFarmLocationToDB(farmLocation);
}

export async function deleteFarmLocationFromDB(id) {
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARM_LOCATIONS, 'readwrite');
    const store = tx.objectStore(STORES.FARM_LOCATIONS);
    const request = store.delete(id);

    request.onsuccess = () => resolve(true);
    request.onerror = (e) => reject(e.target.error);
  });
}

export async function setPrimaryFarmLocationInDB(id) {
  const locations = await getAllFarmLocationsFromDB();
  const db = await openFarmerDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES.FARM_LOCATIONS, 'readwrite');
    const store = tx.objectStore(STORES.FARM_LOCATIONS);

    locations.forEach((loc) => {
      const updated = {
        ...loc,
        isPrimary: loc.id === id,
        updatedAt: new Date().toISOString()
      };
      store.put(updated);
    });

    tx.oncomplete = () => resolve(true);
    tx.onerror = (e) => reject(e.target.error);
  });
}


