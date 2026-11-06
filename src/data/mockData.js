export const mockWeatherData = {
  location: "Nashik, Maharashtra",
  date: "Today, Nov 6, 2026",
  temperature: 28,
  condition: "Partly Cloudy",
  humidity: 64,
  windSpeed: 12,
  rainfallChance: 15,
  soilMoisture: "Optimal (68%)",
  uvIndex: "Moderate (5)",
  advisory: "Favorable conditions for foliar spray and weeding. Rain expected in 48 hours; plan irrigation accordingly.",
  forecast: [
    { day: "Today", temp: "28°C", minTemp: "19°C", condition: "Partly Cloudy", icon: "CloudSun", rain: "15%" },
    { day: "Thu", temp: "27°C", minTemp: "18°C", condition: "Sunny", icon: "Sun", rain: "5%" },
    { day: "Fri", temp: "25°C", minTemp: "20°C", condition: "Light Rain", icon: "CloudRain", rain: "70%" },
    { day: "Sat", temp: "26°C", minTemp: "19°C", condition: "Scattered Showers", icon: "CloudDrizzle", rain: "45%" },
    { day: "Sun", temp: "29°C", minTemp: "18°C", condition: "Sunny", icon: "Sun", rain: "10%" },
  ]
};

export const mockStats = [
  { id: 1, value: "1.2 Lakh+", label: "Farmers Empowered", icon: "Users", change: "+14% this season" },
  { id: 2, value: "85,000+", label: "Acres Monitored", icon: "LandPlot", change: "Across 18 states" },
  { id: 3, value: "94.8%", label: "Disease Detection Accuracy", icon: "CheckCircle2", change: "Verified by agronomists" },
  { id: 4, value: "450+ Mandis", label: "Live Price Tracking", icon: "TrendingUp", change: "Updated every 15 mins" }
];

export const mockFeatures = [
  {
    id: "ai-doctor",
    title: "AI Crop Doctor",
    tagline: "Instant Disease Detection",
    description: "Upload a picture of any affected leaf or stem. Our smart vision engine identifies 120+ crop diseases and recommends organic & chemical remedies.",
    icon: "ScanLine",
    badge: "Most Popular",
    color: "emerald"
  },
  {
    id: "mandi-prices",
    title: "Live Mandi Rates",
    tagline: "Transparent Market Prices",
    description: "Track real-time prices across major APMC markets in India. Compare trends, cut out middlemen, and choose the most profitable mandi to sell your harvest.",
    icon: "BadgeDollarSign",
    badge: "Real-time",
    color: "amber"
  },
  {
    id: "weather-forecast",
    title: "Agro Weather & Alerts",
    tagline: "Hyperlocal Forecasts",
    description: "Receive rain alerts, frost warnings, and humidity indices customized to your farm's pin code, helping you plan spraying and harvest safely.",
    icon: "CloudSunRain",
    badge: "Pin-code Accurate",
    color: "blue"
  },
  {
    id: "soil-nutrition",
    title: "Soil & Fertilizer Guide",
    tagline: "Balanced N-P-K Guidance",
    description: "Calculate the exact dosage of urea, DAP, and potash tailored to your crop stage. Prevent over-fertilization and nurture long-term soil health.",
    icon: "Sprout",
    badge: "Eco-Friendly",
    color: "green"
  },
  {
    id: "schemes",
    title: "Government Schemes",
    tagline: "Direct Subsidies & Insurance",
    description: "Discover eligible state & central welfare schemes like PM-KISAN, PMFBY crop insurance, and solar pump subsidies with easy application steps.",
    icon: "Landmark",
    badge: "Govt Verified",
    color: "indigo"
  },
  {
    id: "crop-calendar",
    title: "Crop Calendar & Tips",
    tagline: "Sowing to Harvest Schedule",
    description: "Step-by-step guidance on seed treatment, nursery management, irrigation intervals, and intercultural operations for Rabi, Kharif, and Zaid seasons.",
    icon: "CalendarCheck",
    badge: "Seasonal",
    color: "teal"
  }
];

export const mockMarketPrices = [
  {
    id: 1,
    commodity: "Wheat (Sharbati)",
    mandi: "Indore APMC, MP",
    variety: "Lokwan / Sharbati",
    price: 2680,
    unit: "Quintal",
    change: "+₹45",
    trend: "up",
    quality: "Grade A"
  },
  {
    id: 2,
    commodity: "Basmati Paddy",
    mandi: "Karnal Mandi, Haryana",
    variety: "1121 Pusa",
    price: 4150,
    unit: "Quintal",
    change: "-₹30",
    trend: "down",
    quality: "Super Premium"
  },
  {
    id: 3,
    commodity: "Soybean",
    mandi: "Latur Mandi, Maharashtra",
    variety: "Yellow Seed",
    price: 4820,
    unit: "Quintal",
    change: "+₹80",
    trend: "up",
    quality: "Standard"
  },
  {
    id: 4,
    commodity: "Cotton (Kapas)",
    mandi: "Rajkot APMC, Gujarat",
    variety: "Shankar-6",
    price: 7420,
    unit: "Quintal",
    change: "+₹110",
    trend: "up",
    quality: "Long Staple"
  },
  {
    id: 5,
    commodity: "Red Onion",
    mandi: "Lasalgaon, Maharashtra",
    variety: "Nashik Medium",
    price: 2450,
    unit: "Quintal",
    change: "+₹65",
    trend: "up",
    quality: "Medium"
  },
  {
    id: 6,
    commodity: "Mustard Seed",
    mandi: "Alwar Mandi, Rajasthan",
    variety: "Black Mustard",
    price: 5350,
    unit: "Quintal",
    change: "-₹15",
    trend: "down",
    quality: "High Oil Content"
  }
];

export const mockAdvisories = [
  {
    id: 1,
    crop: "Wheat",
    stage: "Crown Root Initiation (21-25 DAS)",
    action: "First Irrigation & Nitrogen Top Dressing",
    urgency: "High",
    tip: "Apply 30 kg Nitrogen (65 kg Urea) per hectare immediately after the first irrigation for optimal tiller emergence."
  },
  {
    id: 2,
    crop: "Mustard",
    stage: "Vegetative / Pre-flowering",
    action: "Aphid Monitoring Alert",
    urgency: "Medium",
    tip: "Inspect underside of top leaves. If aphid population exceeds 20-25 per 10 cm terminal shoot, spray neem oil (1500 ppm) @ 5 ml/liter."
  },
  {
    id: 3,
    crop: "Gram (Chana)",
    stage: "Branching",
    action: "Pod Borer Preventive Measure",
    urgency: "Normal",
    tip: "Install T-shaped bird perches @ 40-50 per hectare to encourage predatory birds that naturally control larvae."
  }
];

export const mockTestimonials = [
  {
    id: 1,
    name: "Rameshwar Patil",
    village: "Niphad, Nashik",
    crop: "Grapes & Onion",
    image: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=150&auto=format&fit=crop&q=80",
    quote: "KrishiMitra helped me detect downy mildew in my vineyard 4 days before it became widespread. The spray recommendation saved me at least ₹1.5 Lakhs this harvest.",
    tag: "Saved ₹1.5L in crop damage"
  },
  {
    id: 2,
    name: "Balvinder Singh",
    village: "Khanna, Punjab",
    crop: "Wheat & Paddy",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    quote: "The live APMC mandi tracker helped me compare Khanna and Sirhind mandis in real-time. I sold my Basmati crop for ₹140 more per quintal by choosing the right buyer.",
    tag: "Increased profits by 12%"
  },
  {
    id: 3,
    name: "Sunita Devi",
    village: "Muzaffarpur, Bihar",
    crop: "Vegetables & Maize",
    image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
    quote: "The simple language and audio instructions are wonderful. Even without deep technical knowledge, I can understand fertilizer requirements and weather warnings on my phone.",
    tag: "Reduced fertilizer expense by 20%"
  }
];

export const mockCropCategories = [
  { name: "Cereals & Grains", count: "12 Crops", icon: "Wheat" },
  { name: "Pulses & Legumes", count: "8 Crops", icon: "Nut" },
  { name: "Oilseeds", count: "6 Crops", icon: "Droplets" },
  { name: "Vegetables", count: "24 Crops", icon: "Carrot" },
  { name: "Fruits & Orchards", count: "15 Crops", icon: "Apple" },
  { name: "Cash Crops", count: "5 Crops", icon: "Coins" },
];

export const mockDashboardActivities = [
  {
    id: 1,
    type: "scan",
    title: "Crop Disease Diagnosis",
    description: "Scanned Wheat field (Block A) — Yellow Rust detected (96.4% match). Foliar spray recommended.",
    time: "2 hours ago",
    status: "Action Required",
    badgeColor: "amber",
    icon: "ScanLine"
  },
  {
    id: 2,
    type: "mandi",
    title: "Mandi Rate Alert",
    description: "Tracked Sharbati Wheat at Indore APMC (₹2,680/Qtl, +₹45 gain today).",
    time: "5 hours ago",
    status: "Price Up",
    badgeColor: "emerald",
    icon: "TrendingUp"
  },
  {
    id: 3,
    type: "soil",
    title: "Fertilizer Calculation",
    description: "Calculated N-P-K bags for 3.5 Acres of Rabi Wheat (Urea: 8.8 bags, DAP: 3.5 bags).",
    time: "Yesterday, 4:30 PM",
    status: "Saved",
    badgeColor: "blue",
    icon: "Layers"
  },
  {
    id: 4,
    type: "weather",
    title: "Weather Spray Window Checked",
    description: "Safe spray condition validated for Nashik district with calm wind (12 km/h).",
    time: "Yesterday, 9:15 AM",
    status: "Completed",
    badgeColor: "emerald",
    icon: "CloudSun"
  }
];

export const mockFarmingTips = [
  {
    id: 1,
    title: "Crown Root Irrigation Window",
    category: "Wheat Management",
    tip: "Ensure first irrigation between 21-25 days after sowing. Delayed watering at CRI stage permanently stunts tiller development.",
    urgency: "High Priority",
    date: "Nov 6, 2026"
  },
  {
    id: 2,
    title: "Neem Oil Spray for Mustard Aphids",
    category: "Pest Prevention",
    tip: "Spray cold-pressed neem oil (1500 ppm @ 5 ml/liter water) early morning to curb emerging aphid colonies without killing pollinator honeybees.",
    urgency: "Eco-Friendly",
    date: "Nov 5, 2026"
  },
  {
    id: 3,
    title: "Zinc Deficiency Foliar Correction",
    category: "Micronutrient",
    tip: "If young leaves show yellowing between veins, spray 0.5% Zinc Sulfate + 0.25% Lime solution. Dissolve separately before mixing.",
    urgency: "Yield Booster",
    date: "Nov 4, 2026"
  }
];

export const mockSoilHealthData = {
  testDate: "October 14, 2026",
  lab: "District Soil Testing Lab, Nashik",
  soilType: "Medium Black Soil",
  ph: "7.2 (Neutral & Healthy)",
  organicCarbon: "0.68% (Medium)",
  nitrogen: "Low (210 kg/ha)",
  phosphorus: "Medium (18.5 kg/ha)",
  potash: "High (315 kg/ha)",
  zinc: "Slightly Deficient",
  iron: "Sufficient",
  recommendation: "Increase Farm Yard Manure (FYM) by 2 tonnes/acre to elevate organic carbon and split Urea top-dressing into 3 doses."
};


