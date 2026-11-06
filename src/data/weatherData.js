// Comprehensive 7-Day Agro-Meteorology Mock Data for Indian Agricultural Districts

export const DISTRICT_WEATHER_DATA = {
  "Nashik, Maharashtra": {
    district: "Nashik (Niphad / Dindori)",
    state: "Maharashtra",
    currentTemp: 28,
    feelsLike: 29,
    minTemp: 19,
    maxTemp: 30,
    condition: "Partly Cloudy",
    conditionCode: "partly-cloudy",
    rainfallChance: 15,
    rainfallAmount: "0 - 2 mm",
    humidity: 64,
    dewPoint: "18°C",
    windSpeed: 12,
    windDirection: "NW (North-West)",
    soilMoisture: "Optimal (68%)",
    soilTemp: "23°C",
    uvIndex: "5 (Moderate)",
    airQuality: "Good (AQI 58)",
    lastUpdated: "12:15 PM IST",
    
    // Actionable Farming Recommendations
    sprayWindow: {
      status: "Favorable / Safe",
      statusColor: "emerald",
      optimalTime: "7:00 AM - 11:00 AM & 3:30 PM - 5:30 PM",
      tip: "Wind speed is calm (12 km/h) and rain probability is low (<20%). Good conditions for fungicide and foliar micronutrient spraying.",
    },
    irrigation: {
      status: "Delay Heavy Irrigation",
      statusColor: "amber",
      optimalTime: "Late Evening (after 5:30 PM)",
      tip: "Rain expected in 48 hours. Postpone flood irrigation for wheat and gram to prevent waterlogging; maintain light drip irrigation only.",
    },
    rainWarning: {
      status: "Light Rain Alert in 48 Hours",
      statusColor: "blue",
      severity: "Moderate Notice",
      tip: "Scattered showers predicted for Friday afternoon. Ensure drainage channels in grape vineyards and onion nurseries are unblocked.",
    },
    precautions: {
      status: "Fungal Watch Alert",
      statusColor: "purple",
      tip: "Moderate morning humidity (64%) combined with warm afternoons may promote downy mildew in vineyards. Inspect leaf undersides daily.",
    },

    // 7-Day Forecast
    sevenDayForecast: [
      { day: "Today", date: "Nov 6", tempMax: 28, tempMin: 19, condition: "Partly Cloudy", icon: "CloudSun", rainChance: 15, advice: "Favorable spray day" },
      { day: "Fri", date: "Nov 7", tempMax: 26, tempMin: 20, condition: "Light Rain", icon: "CloudRain", rainChance: 70, advice: "Hold spray & irrigation" },
      { day: "Sat", date: "Nov 8", tempMax: 25, tempMin: 19, condition: "Scattered Showers", icon: "CloudDrizzle", rainChance: 45, advice: "Check field drainage" },
      { day: "Sun", date: "Nov 9", tempMax: 27, tempMin: 18, condition: "Mostly Sunny", icon: "Sun", rainChance: 10, advice: "Good day for intercultural ops" },
      { day: "Mon", date: "Nov 10", tempMax: 29, tempMin: 18, condition: "Sunny & Clear", icon: "Sun", rainChance: 5, advice: "Resume top-dressing" },
      { day: "Tue", date: "Nov 11", tempMax: 30, tempMin: 19, condition: "Clear Sky", icon: "Sun", rainChance: 0, advice: "Optimal harvest window" },
      { day: "Wed", date: "Nov 12", tempMax: 29, tempMin: 19, condition: "Partly Cloudy", icon: "CloudSun", rainChance: 10, advice: "Safe irrigation day" }
    ],

    // Hourly Forecast for today
    hourly: [
      { time: "06:00", temp: 20, rain: "5%", wind: "8 km/h", spray: "Good" },
      { time: "09:00", temp: 24, rain: "10%", wind: "10 km/h", spray: "Optimal" },
      { time: "12:00", temp: 28, rain: "15%", wind: "13 km/h", spray: "Fair" },
      { time: "15:00", temp: 30, rain: "15%", wind: "14 km/h", spray: "Optimal" },
      { time: "18:00", temp: 25, rain: "20%", wind: "9 km/h", spray: "Good" },
      { time: "21:00", temp: 22, rain: "15%", wind: "7 km/h", spray: "Night Rest" },
    ]
  },

  "Ludhiana, Punjab": {
    district: "Ludhiana (Khanna / Jagraon)",
    state: "Punjab",
    currentTemp: 24,
    feelsLike: 24,
    minTemp: 13,
    maxTemp: 26,
    condition: "Sunny & Clear",
    conditionCode: "sunny",
    rainfallChance: 0,
    rainfallAmount: "0 mm",
    humidity: 52,
    dewPoint: "12°C",
    windSpeed: 9,
    windDirection: "NW",
    soilMoisture: "Moderate (55%)",
    soilTemp: "19°C",
    uvIndex: "6 (High)",
    airQuality: "Moderate (AQI 142)",
    lastUpdated: "12:15 PM IST",

    sprayWindow: {
      status: "Excellent Spray Window",
      statusColor: "emerald",
      optimalTime: "8:00 AM - 12:00 PM",
      tip: "Zero rain probability and calm winds (9 km/h). Ideal window for herbicide application in newly sown wheat fields.",
    },
    irrigation: {
      status: "First Crown Root Irrigation Recommended",
      statusColor: "emerald",
      optimalTime: "Anytime during daytime",
      tip: "Fields sown 21-25 days ago must receive their first light irrigation followed by nitrogen top dressing.",
    },
    rainWarning: {
      status: "No Rain Forecasted",
      statusColor: "emerald",
      severity: "Clear Weather",
      tip: "Dry weather spell expected to continue for the next 7 days. Plan intercultural tractor operations without rain interruption.",
    },
    precautions: {
      status: "Cold Wave Precaution",
      statusColor: "blue",
      tip: "Night temperatures dipping to 12°C. Keep nursery beds protected with plastic polythene sheets during late night hours.",
    },

    sevenDayForecast: [
      { day: "Today", date: "Nov 6", tempMax: 26, tempMin: 13, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Optimal wheat sowing" },
      { day: "Fri", date: "Nov 7", tempMax: 25, tempMin: 12, condition: "Clear Sky", icon: "Sun", rainChance: 0, advice: "First irrigation window" },
      { day: "Sat", date: "Nov 8", tempMax: 24, tempMin: 13, condition: "Sunny", icon: "Sun", rainChance: 5, advice: "Weeding operations" },
      { day: "Sun", date: "Nov 9", tempMax: 24, tempMin: 12, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Herbicide spraying" },
      { day: "Mon", date: "Nov 10", tempMax: 25, tempMin: 13, condition: "Partly Cloudy", icon: "CloudSun", rainChance: 10, advice: "Safe field work" },
      { day: "Tue", date: "Nov 11", tempMax: 25, tempMin: 14, condition: "Clear", icon: "Sun", rainChance: 0, advice: "Top dress urea" },
      { day: "Wed", date: "Nov 12", tempMax: 26, tempMin: 13, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Soil testing window" }
    ],

    hourly: [
      { time: "06:00", temp: 14, rain: "0%", wind: "6 km/h", spray: "Good" },
      { time: "09:00", temp: 19, rain: "0%", wind: "8 km/h", spray: "Optimal" },
      { time: "12:00", temp: 24, rain: "0%", wind: "10 km/h", spray: "Optimal" },
      { time: "15:00", temp: 26, rain: "0%", wind: "11 km/h", spray: "Optimal" },
      { time: "18:00", temp: 20, rain: "0%", wind: "7 km/h", spray: "Good" },
      { time: "21:00", temp: 16, rain: "0%", wind: "5 km/h", spray: "Night Rest" },
    ]
  },

  "Indore, Madhya Pradesh": {
    district: "Indore (Sanwer / Mhow)",
    state: "Madhya Pradesh",
    currentTemp: 29,
    feelsLike: 30,
    minTemp: 17,
    maxTemp: 31,
    condition: "Warm & Breezy",
    conditionCode: "warm",
    rainfallChance: 5,
    rainfallAmount: "0 mm",
    humidity: 48,
    dewPoint: "14°C",
    windSpeed: 14,
    windDirection: "NE",
    soilMoisture: "Dry (42%)",
    soilTemp: "25°C",
    uvIndex: "7 (High)",
    airQuality: "Satisfactory (AQI 82)",
    lastUpdated: "12:15 PM IST",

    sprayWindow: {
      status: "Spray Before 11 AM",
      statusColor: "amber",
      optimalTime: "6:30 AM - 10:00 AM",
      tip: "Afternoon winds pick up to 16 km/h, which causes spray drift. Complete all herbicide and insecticide applications during calm morning hours.",
    },
    irrigation: {
      status: "Evening Irrigation Advisable",
      statusColor: "emerald",
      optimalTime: "Post 5:00 PM",
      tip: "Soil moisture is dropping (42%). Water chana and mustard in the late evening to reduce evaporative losses under hot midday sun.",
    },
    rainWarning: {
      status: "No Rain Expected",
      statusColor: "emerald",
      severity: "Dry Spell",
      tip: "Bright sunshine and clear skies across Malwa plateau. Safe for outdoor grain drying and threshing.",
    },
    precautions: {
      status: "Moisture Conservation Precaution",
      statusColor: "purple",
      tip: "Apply dust mulching by running a shallow blade harrow (bakhar) to break capillary rise and trap soil water.",
    },

    sevenDayForecast: [
      { day: "Today", date: "Nov 6", tempMax: 29, tempMin: 17, condition: "Sunny", icon: "Sun", rainChance: 5, advice: "Morning spray only" },
      { day: "Fri", date: "Nov 7", tempMax: 30, tempMin: 17, condition: "Sunny", icon: "Sun", rainChance: 5, advice: "Evening irrigation" },
      { day: "Sat", date: "Nov 8", tempMax: 31, tempMin: 18, condition: "Clear Sky", icon: "Sun", rainChance: 0, advice: "Grain drying safe" },
      { day: "Sun", date: "Nov 9", tempMax: 29, tempMin: 17, condition: "Partly Cloudy", icon: "CloudSun", rainChance: 10, advice: "Tractor harrowing" },
      { day: "Mon", date: "Nov 10", tempMax: 28, tempMin: 16, condition: "Sunny", icon: "Sun", rainChance: 5, advice: "Soybean storage check" },
      { day: "Tue", date: "Nov 11", tempMax: 29, tempMin: 16, condition: "Clear", icon: "Sun", rainChance: 0, advice: "Fertilizer purchase" },
      { day: "Wed", date: "Nov 12", tempMax: 30, tempMin: 17, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Check gram root nodules" }
    ],

    hourly: [
      { time: "06:00", temp: 18, rain: "0%", wind: "7 km/h", spray: "Optimal" },
      { time: "09:00", temp: 23, rain: "5%", wind: "10 km/h", spray: "Optimal" },
      { time: "12:00", temp: 28, rain: "5%", wind: "14 km/h", spray: "Caution (Drift)" },
      { time: "15:00", temp: 31, rain: "5%", wind: "16 km/h", spray: "Avoid" },
      { time: "18:00", temp: 26, rain: "5%", wind: "11 km/h", spray: "Good" },
      { time: "21:00", temp: 21, rain: "0%", wind: "8 km/h", spray: "Night Rest" },
    ]
  },

  "Karnal, Haryana": {
    district: "Karnal (Taraori / Nilokheri)",
    state: "Haryana",
    currentTemp: 25,
    feelsLike: 25,
    minTemp: 14,
    maxTemp: 27,
    condition: "Sunny & Pleasant",
    conditionCode: "sunny",
    rainfallChance: 0,
    rainfallAmount: "0 mm",
    humidity: 56,
    dewPoint: "13°C",
    windSpeed: 8,
    windDirection: "NW",
    soilMoisture: "Optimal (62%)",
    soilTemp: "20°C",
    uvIndex: "5 (Moderate)",
    airQuality: "Moderate (AQI 128)",
    lastUpdated: "12:15 PM IST",

    sprayWindow: {
      status: "Favorable Spray Conditions",
      statusColor: "emerald",
      optimalTime: "8:30 AM - 1:00 PM",
      tip: "Calm gentle winds (8 km/h). Optimal time for zinc sulfate micronutrient spray on late basmati or early wheat.",
    },
    irrigation: {
      status: "Regular Irrigation Cycle",
      statusColor: "emerald",
      optimalTime: "Morning or Late Afternoon",
      tip: "Soil moisture is in the optimal range. Plan light tubewell watering for mustard crops currently in pre-flowering stage.",
    },
    rainWarning: {
      status: "Zero Rain Warning",
      statusColor: "emerald",
      severity: "Clear",
      tip: "Stable atmospheric high pressure over Haryana. Ideal conditions for wheat seed sowing and seed treatment with Trichoderma.",
    },
    precautions: {
      status: "Stubble Management Precaution",
      statusColor: "amber",
      tip: "Incorporate paddy straw using Super Seeder or Happy Seeder rather than burning, preserving nitrogen and organic matter.",
    },

    sevenDayForecast: [
      { day: "Today", date: "Nov 6", tempMax: 27, tempMin: 14, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Seed treatment day" },
      { day: "Fri", date: "Nov 7", tempMax: 26, tempMin: 14, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Wheat drilling" },
      { day: "Sat", date: "Nov 8", tempMax: 25, tempMin: 13, condition: "Clear Sky", icon: "Sun", rainChance: 5, advice: "Mustard irrigation" },
      { day: "Sun", date: "Nov 9", tempMax: 25, tempMin: 13, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Zinc spray window" },
      { day: "Mon", date: "Nov 10", tempMax: 26, tempMin: 14, condition: "Partly Cloudy", icon: "CloudSun", rainChance: 5, advice: "Weedicide application" },
      { day: "Tue", date: "Nov 11", tempMax: 26, tempMin: 13, condition: "Sunny", icon: "Sun", rainChance: 0, advice: "Optimal tractor work" },
      { day: "Wed", date: "Nov 12", tempMax: 27, tempMin: 14, condition: "Clear", icon: "Sun", rainChance: 0, advice: "Soil moisture test" }
    ],

    hourly: [
      { time: "06:00", temp: 15, rain: "0%", wind: "5 km/h", spray: "Good" },
      { time: "09:00", temp: 20, rain: "0%", wind: "7 km/h", spray: "Optimal" },
      { time: "12:00", temp: 25, rain: "0%", wind: "9 km/h", spray: "Optimal" },
      { time: "15:00", temp: 27, rain: "0%", wind: "9 km/h", spray: "Optimal" },
      { time: "18:00", temp: 22, rain: "0%", wind: "6 km/h", spray: "Good" },
      { time: "21:00", temp: 17, rain: "0%", wind: "4 km/h", spray: "Night Rest" },
    ]
  }
};

