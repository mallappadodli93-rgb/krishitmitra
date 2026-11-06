import React, { useState } from 'react';
import {
  Sun,
  CloudSun,
  CloudRain,
  CloudDrizzle,
  CloudLightning,
  Droplets,
  Wind,
  Thermometer,
  Compass,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Sprout,
  Clock,
  Sparkles,
  Info,
  PhoneCall,
  RefreshCw,
  WifiOff,
  Globe,
  ChevronDown
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { DISTRICT_WEATHER_DATA } from '../data/weatherData';
import { useLanguage } from '../context/LanguageContext';
import { useOffline } from '../context/OfflineContext';

const iconMap = {
  Sun: Sun,
  CloudSun: CloudSun,
  CloudRain: CloudRain,
  CloudDrizzle: CloudDrizzle,
  CloudLightning: CloudLightning,
};

export default function WeatherPage({ onNavigateHome, onNavigateDashboard, onNavigateLocation }) {
  const { t, language, changeLanguage, languages } = useLanguage();
  const { isOffline, openOfflineGuide } = useOffline();
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState("Nashik, Maharashtra");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeHourlyFilter, setActiveHourlyFilter] = useState('all');

  const weather = DISTRICT_WEATHER_DATA[selectedDistrict] || DISTRICT_WEATHER_DATA["Nashik, Maharashtra"];

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 700);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-20">
      
      {/* 1. Header with Back Navigation */}
      <header className="bg-white border-b border-emerald-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNavigateHome}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-emerald-800 bg-slate-50 hover:bg-emerald-50 px-3 py-2 rounded-xl border border-slate-200 hover:border-emerald-200 transition"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t('weatherBackHome')}</span>
            </button>

            <button
              type="button"
              onClick={onNavigateDashboard}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-2 rounded-xl border border-emerald-200 transition"
            >
              <span>{t('navDashboard')}</span>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 border border-slate-200 transition"
                title="Change Language"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-600" />
                <span className="hidden sm:inline">
                  {languages.find(l => l.code === language)?.name || 'Language'}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {langDropdownOpen && (
                <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-2xl shadow-xl py-1.5 z-50 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                    ಆಯ್ಕೆ / Language:
                  </div>
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        changeLanguage(lang.code);
                        setLangDropdownOpen(false);
                      }}
                      className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-emerald-50 hover:text-emerald-800 transition flex items-center justify-between ${
                        language === lang.code ? 'bg-emerald-50 text-emerald-700 font-extrabold' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.label}</span>
                      {language === lang.code && <span className="w-2 h-2 rounded-full bg-emerald-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {t('featWeatherTitle')}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* Offline Notice Banner */}
        {isOffline && (
          <div className="p-3.5 bg-amber-50 border border-amber-300 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-950 shadow-sm">
            <div className="flex items-center gap-2.5">
              <WifiOff className="w-4 h-4 text-amber-600 shrink-0" />
              <span><strong>Offline Mode:</strong> Displaying cached weather parameters. Live radar and satellite radar require an active internet connection.</span>
            </div>
            <button
              type="button"
              onClick={openOfflineGuide}
              className="px-3 py-1 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl text-xs transition shrink-0"
            >
              View Offline Farming Guide
            </button>
          </div>
        )}

        {/* Title, Location Selector & GPS Action */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-2">
          <div>
            <div className="inline-flex items-center gap-1.5 mb-2">
              <Badge variant="blue" icon={CloudSun}>
                Field-Level Weather Advisory
              </Badge>
              <span className="text-xs text-slate-400">
                Updated {weather.lastUpdated}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Farm Weather & Agronomic Insights
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-2xl">
              Real-time weather parameters calibrated for crop spraying, irrigation intervals, rain warnings, and pest precautions.
            </p>
          </div>

          {/* Location Selector Controls */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Village / District Dropdown */}
            <div className="flex items-center gap-2 bg-white px-3.5 py-2.5 rounded-2xl border border-slate-200 shadow-sm">
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <div className="text-left">
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Select Village / District:
                </span>
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="text-xs sm:text-sm font-extrabold text-slate-900 bg-transparent focus:outline-none cursor-pointer pr-3"
                >
                  {Object.keys(DISTRICT_WEATHER_DATA).map((loc) => (
                    <option key={loc} value={loc}>
                      {loc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Map GPS Button */}
            <Button
              variant="outline"
              size="md"
              icon={Compass}
              onClick={onNavigateLocation}
              className="text-xs font-bold border-slate-200"
            >
              Pin on Map
            </Button>

            {/* Refresh */}
            <button
              type="button"
              onClick={handleRefresh}
              className="p-3 bg-white text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-2xl border border-slate-200 transition shadow-sm"
              title="Refresh Live Weather"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>
        </div>

        {/* 1, 2, 3, 4, 5. Main Hero Weather Card */}
        <div className="bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-950 rounded-3xl p-6 sm:p-10 text-white shadow-2xl relative overflow-hidden border border-emerald-800">
          
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Temperature & Weather Condition */}
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-200 text-xs font-bold">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{weather.district}, {weather.state}</span>
              </div>

              <div className="flex items-center gap-6">
                <div className="w-24 h-24 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-amber-300 shadow-xl">
                  {weather.conditionCode === 'partly-cloudy' ? (
                    <CloudSun className="w-14 h-14 animate-pulse" />
                  ) : weather.conditionCode === 'rainy' ? (
                    <CloudRain className="w-14 h-14 animate-bounce" />
                  ) : (
                    <Sun className="w-14 h-14 animate-spin [animation-duration:12s]" />
                  )}
                </div>

                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-6xl sm:text-7xl font-black tracking-tight leading-none">
                      {weather.currentTemp}°
                    </span>
                    <span className="text-2xl text-emerald-200 font-bold">C</span>
                  </div>
                  <h3 className="text-xl font-bold text-emerald-100 mt-1">
                    {weather.condition}
                  </h3>
                  <p className="text-xs text-emerald-300 font-medium">
                    Feels like {weather.feelsLike}°C • Min: {weather.minTemp}°C / Max: {weather.maxTemp}°C
                  </p>
                </div>
              </div>
            </div>

            {/* Live Weather Metrics (Rainfall, Humidity, Wind, Soil) */}
            <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              
              {/* Rainfall Prediction */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                  <CloudRain className="w-4 h-4 text-blue-300 shrink-0" />
                  <span>Rainfall Chance</span>
                </div>
                <div className="text-2xl font-black text-white">{weather.rainfallChance}%</div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Est. Rain: {weather.rainfallAmount}
                </p>
              </div>

              {/* Humidity */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                  <Droplets className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Air Humidity</span>
                </div>
                <div className="text-2xl font-black text-white">{weather.humidity}%</div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Dew Point: {weather.dewPoint}
                </p>
              </div>

              {/* Wind Speed */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                  <Wind className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>Wind Speed</span>
                </div>
                <div className="text-2xl font-black text-white">{weather.windSpeed} km/h</div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Direction: {weather.windDirection}
                </p>
              </div>

              {/* Soil Moisture */}
              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-200 text-xs font-semibold">
                  <Thermometer className="w-4 h-4 text-amber-300 shrink-0" />
                  <span>Soil Moisture</span>
                </div>
                <div className="text-base sm:text-lg font-bold text-white truncate">
                  {weather.soilMoisture.split(' ')[0]}
                </div>
                <p className="text-[11px] text-emerald-300 font-medium">
                  Soil Temp: {weather.soilTemp}
                </p>
              </div>

            </div>

          </div>

          {/* Bottom Alert Ticker */}
          <div className="mt-8 pt-5 border-t border-emerald-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs bg-emerald-950/50 -mx-6 sm:-mx-10 -mb-6 sm:-mb-10 p-4 sm:px-10 rounded-b-3xl">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-400 text-emerald-950">
                <AlertTriangle className="w-4 h-4" />
              </span>
              <span className="font-bold text-amber-300">Agricultural Weather Advisory:</span>
              <span className="text-emerald-100">
                {weather.sprayWindow.tip}
              </span>
            </div>
            <span className="text-[11px] font-bold text-emerald-300 shrink-0 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-600/40">
              UV Index: {weather.uvIndex}
            </span>
          </div>
        </div>

        {/* 7. Helpful Farming Tips & Recommendations (4 High-Impact Cards) */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <span>{t('weatherHeading')}</span>
            </h2>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
              Personalized for {weather.district.split(' ')[0]}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Card 1: Suitable Time for Spraying Crops */}
            <Card className="p-6 border-slate-200 hover:border-emerald-400 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <Badge variant="emerald" size="xs">
                    {weather.sprayWindow.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t('tipSprayTimeTitle')}
                </h3>

                <div className="p-2.5 bg-emerald-50/70 rounded-xl border border-emerald-200/80 text-xs mb-3 font-semibold text-emerald-900">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-emerald-600" />
                  {weather.sprayWindow.optimalTime}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('tipSprayTimeDesc')}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Rule: Wind &lt; 15 km/h & Rain &lt; 20%
              </div>
            </Card>

            {/* Card 2: Best Time for Irrigation */}
            <Card className="p-6 border-slate-200 hover:border-blue-400 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                    <Sprout className="w-5 h-5" />
                  </div>
                  <Badge variant="amber" size="xs">
                    {weather.irrigation.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t('tipIrrigationTitle')}
                </h3>

                <div className="p-2.5 bg-blue-50/70 rounded-xl border border-blue-200/80 text-xs mb-3 font-semibold text-blue-900">
                  <Clock className="w-3.5 h-3.5 inline mr-1 text-blue-600" />
                  {weather.irrigation.optimalTime}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('tipIrrigationDesc')}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Rule: Soil moisture &gt; 50% = Delay flood watering
              </div>
            </Card>

            {/* Card 3: Rain Warning & Precautions */}
            <Card className="p-6 border-slate-200 hover:border-amber-400 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <CloudRain className="w-5 h-5" />
                  </div>
                  <Badge variant="amber" size="xs">
                    {weather.rainWarning.severity}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t('tipRainWarningTitle')}
                </h3>

                <div className="p-2.5 bg-amber-50/70 rounded-xl border border-amber-200/80 text-xs mb-3 font-semibold text-amber-900">
                  <AlertTriangle className="w-3.5 h-3.5 inline mr-1 text-amber-600" />
                  {weather.rainWarning.status}
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('tipRainWarningDesc')}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Tip: Clear drains to prevent root rot
              </div>
            </Card>

            {/* Card 4: Weather-Related Precautions */}
            <Card className="p-6 border-slate-200 hover:border-purple-400 flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <Badge variant="purple" size="xs">
                    {weather.precautions.status}
                  </Badge>
                </div>

                <h3 className="font-bold text-base text-slate-900 mb-1">
                  {t('tipPrecautionsTitle')}
                </h3>

                <div className="p-2.5 bg-purple-50/70 rounded-xl border border-purple-200/80 text-xs mb-3 font-semibold text-purple-900">
                  <Info className="w-3.5 h-3.5 inline mr-1 text-purple-600" />
                  Disease & Temperature Watch
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {t('tipPrecautionsDesc')}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 font-medium">
                Tip: Scout for early aphid/mildew spots
              </div>
            </Card>

          </div>
        </div>

        {/* 6. Seven-Day Weather Forecast */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <span>Seven-Day Weather Forecast & Agronomy Outlook</span>
            </h2>
            <span className="text-xs text-slate-400 hidden sm:inline">
              Daily Max/Min & Rain Probability
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
            {weather.sevenDayForecast.map((dayItem, idx) => {
              const Icon = iconMap[dayItem.icon] || Sun;

              return (
                <Card
                  key={dayItem.day}
                  className={`p-4 text-center flex flex-col justify-between transition-all ${
                    idx === 0
                      ? 'border-2 border-emerald-500 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200/90 hover:border-emerald-300 bg-white'
                  }`}
                >
                  <div>
                    {/* Day & Date */}
                    <div className="pb-2 border-b border-slate-100">
                      <span className="text-sm font-black text-slate-900 block">
                        {dayItem.day}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {dayItem.date}
                      </span>
                    </div>

                    {/* Icon */}
                    <div className="my-3 flex justify-center">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shadow-inner">
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>

                    {/* Condition */}
                    <span className="text-xs font-bold text-slate-800 block truncate">
                      {dayItem.condition}
                    </span>

                    {/* Temp Range */}
                    <div className="mt-1 text-xs">
                      <span className="font-black text-slate-900">{dayItem.tempMax}°</span>
                      <span className="text-slate-400 ml-1">/ {dayItem.tempMin}°C</span>
                    </div>

                    {/* Rain Probability Pill */}
                    <div className="mt-2.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block ${
                          dayItem.rainChance > 40
                            ? 'bg-blue-100 text-blue-800'
                            : dayItem.rainChance > 15
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        💧 {dayItem.rainChance}% Rain
                      </span>
                    </div>
                  </div>

                  {/* Agricultural Advice Snippet */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 text-[10px] text-emerald-800 font-medium italic">
                    {dayItem.advice}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Hourly Weather & Spray Suitability Timeline */}
        <Card className="p-6 border-slate-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Today's Hourly Weather & Spray Suitability Timeline</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hourly temperature, rain probability, and spray drift advisory
              </p>
            </div>

            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              Safe Spray Window Active
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-5">
            {weather.hourly.map((h, i) => (
              <div
                key={i}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-1 hover:bg-emerald-50/50 transition"
              >
                <span className="text-xs font-bold text-slate-500 block">{h.time}</span>
                <span className="text-lg font-black text-slate-900 block">{h.temp}°C</span>
                <span className="text-[11px] text-blue-600 block">Rain: {h.rain}</span>
                <span className="text-[10px] text-slate-400 block">{h.wind}</span>
                <span
                  className={`inline-block mt-1 text-[10px] font-extrabold px-2 py-0.5 rounded ${
                    h.spray === 'Optimal'
                      ? 'bg-emerald-100 text-emerald-800'
                      : h.spray === 'Good'
                      ? 'bg-green-100 text-green-800'
                      : h.spray === 'Fair'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {h.spray}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* Kisan Toll-Free Weather Support Banner */}
        <div className="p-6 bg-gradient-to-r from-emerald-50 to-green-100 rounded-3xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <PhoneCall className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-bold text-slate-900">
                Need localized weather forecast for your specific pin code?
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                Call the National Kisan Call Center toll-free at <strong>1800-180-1551</strong> or consult your district Krishi Vigyan Kendra (KVK).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="tel:18001801551"
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition"
            >
              Call 1800-180-1551
            </a>
            <Button
              variant="white"
              size="md"
              onClick={onNavigateDashboard}
              className="text-xs font-bold text-slate-700 border-slate-200"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>

      </div>

    </div>
  );
}

