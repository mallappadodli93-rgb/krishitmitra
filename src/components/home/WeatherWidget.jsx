import React, { useState } from 'react';
import {
  CloudSun,
  Droplets,
  Wind,
  Sun,
  CloudRain,
  CloudDrizzle,
  MapPin,
  AlertCircle,
  Thermometer,
  Compass,
  ArrowRight
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';
import { mockWeatherData } from '../../data/mockData';

const forecastIconMap = {
  CloudSun: CloudSun,
  Sun: Sun,
  CloudRain: CloudRain,
  CloudDrizzle: CloudDrizzle
};

const locationsData = {
  "Nashik, Maharashtra": {
    temp: 28,
    condition: "Partly Cloudy",
    humidity: 64,
    wind: 12,
    rainChance: 15,
    soil: "Optimal (68%)",
    advisory: "Favorable conditions for foliar spray and weeding. Rain expected in 48 hours; hold heavy irrigation.",
    forecast: [
      { day: "Today", temp: "28°C", minTemp: "19°C", condition: "Partly Cloudy", icon: "CloudSun", rain: "15%" },
      { day: "Thu", temp: "27°C", minTemp: "18°C", condition: "Sunny", icon: "Sun", rain: "5%" },
      { day: "Fri", temp: "25°C", minTemp: "20°C", condition: "Light Rain", icon: "CloudRain", rain: "70%" },
      { day: "Sat", temp: "26°C", minTemp: "19°C", condition: "Showers", icon: "CloudDrizzle", rain: "45%" },
      { day: "Sun", temp: "29°C", minTemp: "18°C", condition: "Clear Sky", icon: "Sun", rain: "10%" },
    ]
  },
  "Ludhiana, Punjab": {
    temp: 24,
    condition: "Sunny & Clear",
    humidity: 52,
    wind: 9,
    rainChance: 0,
    soil: "Moderate (55%)",
    advisory: "Ideal dry spell for wheat crown root irrigation and first top dressing of urea. Zero rain risk.",
    forecast: [
      { day: "Today", temp: "24°C", minTemp: "13°C", condition: "Sunny", icon: "Sun", rain: "0%" },
      { day: "Thu", temp: "24°C", minTemp: "12°C", condition: "Clear Sky", icon: "Sun", rain: "0%" },
      { day: "Fri", temp: "23°C", minTemp: "13°C", condition: "Partly Cloudy", icon: "CloudSun", rain: "10%" },
      { day: "Sat", temp: "24°C", minTemp: "14°C", condition: "Sunny", icon: "Sun", rain: "5%" },
      { day: "Sun", temp: "25°C", minTemp: "14°C", condition: "Clear", icon: "Sun", rain: "0%" },
    ]
  },
  "Indore, Madhya Pradesh": {
    temp: 29,
    condition: "Warm & Breezy",
    humidity: 48,
    wind: 14,
    rainChance: 5,
    soil: "Dry (42%)",
    advisory: "High evaporation rate. Schedule evening drip irrigation for gram and mustard crops.",
    forecast: [
      { day: "Today", temp: "29°C", minTemp: "17°C", condition: "Sunny", icon: "Sun", rain: "5%" },
      { day: "Thu", temp: "30°C", minTemp: "17°C", condition: "Sunny", icon: "Sun", rain: "5%" },
      { day: "Fri", temp: "28°C", minTemp: "18°C", condition: "Scattered Clouds", icon: "CloudSun", rain: "15%" },
      { day: "Sat", temp: "27°C", minTemp: "16°C", condition: "Partly Cloudy", icon: "CloudSun", rain: "20%" },
      { day: "Sun", temp: "29°C", minTemp: "17°C", condition: "Sunny", icon: "Sun", rain: "5%" },
    ]
  }
};

export default function WeatherWidget({ onOpenFullWeather }) {
  const { t, language } = useLanguage();
  const [currentCity, setCurrentCity] = useState("Nashik, Maharashtra");
  const data = locationsData[currentCity] || locationsData["Nashik, Maharashtra"];

  return (
    <section id="weather" className="py-16 bg-[#F8FAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="blue" icon={CloudSun}>
                Hyperlocal Agro-Meteorology
              </Badge>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Farm Weather & Spray Advisory
            </h2>
            <p className="text-slate-600 text-sm mt-1">
              Field-level forecasts customized for irrigation scheduling, fungicide sprays, and harvest planning.
            </p>
          </div>

          {/* Location Picker */}
          <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-2xl border border-slate-200 shadow-sm">
            <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
            <select
              value={currentCity}
              onChange={(e) => setCurrentCity(e.target.value)}
              className="text-xs font-bold text-slate-800 bg-transparent focus:outline-none cursor-pointer pr-4"
            >
              {Object.keys(locationsData).map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Main Weather Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            
            {/* Primary Current Temperature & Status */}
            <div className="lg:col-span-5 flex flex-col sm:flex-row items-start sm:items-center gap-6 pb-6 lg:pb-0 lg:border-r border-emerald-700/60">
              <div className="w-20 h-20 rounded-3xl bg-white/10 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                <Sun className="w-12 h-12 animate-pulse" />
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl sm:text-6xl font-black tracking-tight">
                    {data.temp}°
                  </span>
                  <span className="text-xl text-emerald-200 font-semibold">C</span>
                </div>
                <p className="text-base font-bold text-emerald-100">{data.condition}</p>
                <p className="text-xs text-emerald-300 flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3" /> {currentCity} • Live Updates
                </p>
              </div>
            </div>

            {/* Weather Metrics Grid */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium mb-1">
                  <Droplets className="w-4 h-4 text-emerald-300" />
                  <span>Humidity</span>
                </div>
                <p className="text-xl font-bold">{data.humidity}%</p>
                <span className="text-[10px] text-emerald-300">Moderate leaf wetness</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium mb-1">
                  <CloudRain className="w-4 h-4 text-emerald-300" />
                  <span>Rain Chance</span>
                </div>
                <p className="text-xl font-bold">{data.rainChance}%</p>
                <span className="text-[10px] text-emerald-300">Next 24 Hours</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium mb-1">
                  <Wind className="w-4 h-4 text-emerald-300" />
                  <span>Wind Speed</span>
                </div>
                <p className="text-xl font-bold">{data.wind} km/h</p>
                <span className="text-[10px] text-emerald-300">Calm breeze</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm p-3.5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-medium mb-1">
                  <Thermometer className="w-4 h-4 text-emerald-300" />
                  <span>Soil Moisture</span>
                </div>
                <p className="text-base font-bold truncate">{data.soil}</p>
                <span className="text-[10px] text-emerald-300">Root zone depth</span>
              </div>
            </div>
          </div>

          {/* Smart Agricultural Advisory Banner inside widget */}
          <div className="mt-6 pt-5 border-t border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-emerald-950/40 -mx-6 sm:-mx-8 -mb-6 sm:-mb-8 p-4 sm:px-8 rounded-b-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-400 text-emerald-950">
                <AlertCircle className="w-4 h-4" />
              </span>
              <span className="font-semibold text-emerald-100">
                KrishiMitra Advisory:
              </span>
              <span className="text-emerald-200">
                {data.advisory}
              </span>
            </div>
            <span className="text-[11px] font-bold text-amber-300 shrink-0 bg-amber-950/60 px-2.5 py-1 rounded-full border border-amber-600/40">
              Spray Window: Open until 4 PM
            </span>
          </div>
        </div>

        {/* 5-Day Mini Forecast */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-5 gap-3">
          {data.forecast.map((f, i) => {
            const Icon = forecastIconMap[f.icon] || Sun;
            return (
              <Card
                key={i}
                className="bg-white p-3.5 text-center flex flex-col items-center justify-between border-slate-200/80 hover:border-emerald-300"
              >
                <span className="text-xs font-bold text-slate-700">{f.day}</span>
                <div className="my-2 p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="text-xs">
                  <span className="font-bold text-slate-800">{f.temp}</span>
                  <span className="text-slate-400 ml-1">/ {f.minTemp}</span>
                </div>
                <span className="text-[11px] font-medium text-emerald-700 mt-1">
                  Rain: {f.rain}
                </span>
              </Card>
            );
          })}
        </div>

        {/* Full 7-Day Forecast & Field Farming Tips Button */}
        {onOpenFullWeather && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={onOpenFullWeather}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white hover:bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-2xl font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition group active:scale-95"
            >
              <span>{language === 'kn' ? 'ಸಂಪೂರ್ಣ 7-ದಿನಗಳ ಮುನ್ಸೂಚನೆ & ಕೃಷಿ ಸಲಹೆಗಳನ್ನು ನೋಡಿ' : language === 'hi' ? 'संपूर्ण 7-दिवसीय मौसम व कृषि सुझाव देखें' : 'View Complete 7-Day Weather Forecast & Agronomic Advisories'}</span>
              <ArrowRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
}

