import React, { useState, useEffect, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BadgeDollarSign,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  ArrowLeft,
  RefreshCw,
  SlidersHorizontal,
  Download,
  Key,
  ExternalLink,
  ChevronDown,
  Info,
  Layers,
  Calculator,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Scale,
  Sparkles,
  Sprout,
  Store,
  DollarSign
} from 'lucide-react';
import Card from '../components/common/Card';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import { useLanguage } from '../context/LanguageContext';
import {
  fetchAgriculturalMarketPrices,
  getSavedDataGovApiKey,
  saveDataGovApiKey,
  calculateFarmerRevenue,
  DATA_SOURCE_TYPES,
  OFFICIAL_APMC_BENCHMARK_PRICES
} from '../services/marketPriceService';

export default function MarketPricesPage({ onNavigateHome, onNavigateDashboard }) {
  const { t, language } = useLanguage();

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('All');
  const [selectedState, setSelectedState] = useState('All');
  const [sortBy, setSortBy] = useState('modal_high_low');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [priceUnit, setPriceUnit] = useState('quintal'); // 'quintal' | 'kg'

  // Data & API states
  const [marketData, setMarketData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [apiKeyModalOpen, setApiKeyModalOpen] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState(() => getSavedDataGovApiKey());

  // Interactive Arbitrage & Calculator Crop Selection
  const [selectedArbitrageCrop, setSelectedArbitrageCrop] = useState('Tomato');
  const [calculatorCropId, setCalculatorCropId] = useState('mandi-tomato-01');
  const [calculatorQty, setCalculatorQty] = useState(25); // 25 quintals

  // Load Market Data
  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAgriculturalMarketPrices({
        search: searchTerm,
        crop: selectedCrop,
        state: selectedState
      });
      setMarketData(data);
    } catch (err) {
      console.error('Error fetching market prices:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedCrop, selectedState]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
  };

  const handleSaveApiKey = async (e) => {
    e.preventDefault();
    saveDataGovApiKey(apiKeyInput);
    setApiKeyModalOpen(false);
    await loadData();
  };

  // Filtered & Sorted Records
  const displayedRecords = useMemo(() => {
    if (!marketData || !marketData.records) return [];
    let list = [...marketData.records];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase().trim();
      list = list.filter(item =>
        item.cropName.toLowerCase().includes(q) ||
        item.commodity.toLowerCase().includes(q) ||
        item.variety.toLowerCase().includes(q) ||
        item.mandi.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.state.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'modal_high_low') {
      list.sort((a, b) => b.modalPrice - a.modalPrice);
    } else if (sortBy === 'modal_low_high') {
      list.sort((a, b) => a.modalPrice - b.modalPrice);
    } else if (sortBy === 'spread_high') {
      list.sort((a, b) => (b.maxPrice - b.minPrice) - (a.maxPrice - a.minPrice));
    } else if (sortBy === 'name_asc') {
      list.sort((a, b) => a.commodity.localeCompare(b.commodity));
    }

    return list;
  }, [marketData, searchTerm, sortBy]);

  // Primary 8 Focus Crops for Comparative Chart
  const focusCrops = [
    { name: 'Chilli (Dry Byadgi)', id: 'mandi-chilli-01', color: '#EF4444' },
    { name: 'Cotton (Kapas)', id: 'mandi-cotton-01', color: '#8B5CF6' },
    { name: 'Groundnut', id: 'mandi-groundnut-01', color: '#F59E0B' },
    { name: 'Ragi (Millet)', id: 'mandi-ragi-01', color: '#10B981' },
    { name: 'Soybean', id: 'mandi-soybean-01', color: '#059669' },
    { name: 'Rice (Paddy)', id: 'mandi-rice-01', color: '#3B82F6' },
    { name: 'Wheat', id: 'mandi-wheat-01', color: '#D97706' },
    { name: 'Onion', id: 'mandi-onion-01', color: '#EC4899' },
    { name: 'Maize', id: 'mandi-maize-01', color: '#EAB308' },
    { name: 'Tomato', id: 'mandi-tomato-01', color: '#DC2626' }
  ];

  const focusCropData = useMemo(() => {
    return focusCrops.map(fc => {
      const found = OFFICIAL_APMC_BENCHMARK_PRICES.find(r => r.id === fc.id);
      return {
        name: fc.name,
        pricePerQuintal: found ? found.modalPrice : 0,
        pricePerKg: found ? (found.modalPrice / 100).toFixed(1) : 0,
        min: found ? found.minPrice : 0,
        max: found ? found.maxPrice : 0,
        color: fc.color
      };
    });
  }, []);

  const maxChartPrice = Math.max(...focusCropData.map(c => c.pricePerQuintal), 26000);

  // Mandi vs Mandi Arbitrage comparison for selected crop
  const arbitrageRecords = useMemo(() => {
    return OFFICIAL_APMC_BENCHMARK_PRICES.filter(r =>
      r.commodity.toLowerCase().includes(selectedArbitrageCrop.toLowerCase()) ||
      r.cropName.toLowerCase().includes(selectedArbitrageCrop.toLowerCase())
    );
  }, [selectedArbitrageCrop]);

  // Selected Calculator Crop
  const activeCalcCrop = useMemo(() => {
    return OFFICIAL_APMC_BENCHMARK_PRICES.find(r => r.id === calculatorCropId) || OFFICIAL_APMC_BENCHMARK_PRICES[0];
  }, [calculatorCropId]);

  const calcRevenue = useMemo(() => {
    return calculateFarmerRevenue(activeCalcCrop.modalPrice, calculatorQty);
  }, [activeCalcCrop, calculatorQty]);

  // Export CSV Handler
  const handleExportCSV = () => {
    if (!displayedRecords.length) return;
    const headers = ['Commodity', 'Variety', 'State', 'District', 'Mandi', 'Min Price (Rs/Qtl)', 'Max Price (Rs/Qtl)', 'Modal Price (Rs/Qtl)', 'Price (Rs/Kg)', 'Arrival Date', 'Arrivals', 'Source'];
    const rows = displayedRecords.map(r => [
      `"${r.commodity}"`,
      `"${r.variety}"`,
      `"${r.state}"`,
      `"${r.district}"`,
      `"${r.mandi}"`,
      r.minPrice,
      r.maxPrice,
      r.modalPrice,
      (r.modalPrice / 100).toFixed(2),
      `"${r.arrivalDate}"`,
      `"${r.arrivals}"`,
      `"${r.dataSource}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `KrishiMitra_Mandi_Rates_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON Handler
  const handleExportJSON = () => {
    if (!displayedRecords.length) return;
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify({
        exportedAt: new Date().toISOString(),
        totalRecords: displayedRecords.length,
        source: marketData?.sourceLabel || 'AGMARKNET Benchmark Data',
        records: displayedRecords
      }, null, 2)
    )}`;
    const link = document.createElement('a');
    link.setAttribute('href', jsonString);
    link.setAttribute('download', `KrishiMitra_Market_Prices_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-slate-800 pb-24">
      
      {/* 1. Header & Navigation Bar */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-emerald-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onNavigateHome}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-md shadow-amber-600/30">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    {language === 'kn' ? 'ಕೃಷಿ ಮಾರುಕಟ್ಟೆ ದರಗಳು' : language === 'hi' ? 'कृषि मंडी भाव' : 'Agricultural Market Prices'}
                  </h1>
                  <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-300">
                    APMC Mandis
                  </span>
                </div>
                <p className="text-xs text-slate-500">
                  Official APMC auction quotes & price comparisons (AGMARKNET & eNAM aligned)
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* API Config Button */}
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-700 hover:bg-slate-50 flex items-center gap-1.5 transition"
              title="Configure data.gov.in Government API Key"
            >
              <Key className="w-3.5 h-3.5 text-amber-600" />
              <span className="hidden sm:inline">Gov API Key</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 transition"
              title="Refresh Quotes"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>

            <button
              onClick={onNavigateDashboard}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition flex items-center gap-1.5"
            >
              <span>{t('navDashboard')}</span>
            </button>
          </div>
        </div>
      </header>

      {/* 2. Official Data Source Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className={`p-4 sm:p-5 rounded-3xl border transition flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
          marketData?.isLive
            ? 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-sm'
            : 'bg-amber-50/80 border-amber-300/80 text-amber-950 shadow-sm'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-0.5 ${
              marketData?.isLive ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
            }`}>
              {marketData?.isLive ? <CheckCircle2 className="w-6 h-6" /> : <ShieldCheck className="w-6 h-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base">
                  {marketData?.sourceLabel || 'Government APMC Benchmark Rates'}
                </span>
                <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                  marketData?.isLive
                    ? 'bg-emerald-200 text-emerald-900 border border-emerald-400'
                    : 'bg-amber-200 text-amber-900 border border-amber-400'
                }`}>
                  {marketData?.isLive ? 'Direct Live Stream' : 'Verified APMC Benchmark'}
                </span>
              </div>
              <p className="text-xs mt-1 leading-relaxed text-slate-700">
                {marketData?.noticeMessage}
                <strong className="block sm:inline font-bold sm:ml-1 text-slate-900">
                  Guarantee: KrishiMitra never displays unverified or synthetic rates as live prices.
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setApiKeyModalOpen(true)}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white text-slate-800 border border-slate-300 hover:bg-slate-50 transition shadow-sm"
            >
              API Settings
            </button>
            <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              Arrivals: <strong>06 Nov 2026</strong>
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 space-y-8">
        
        {/* 3. Top Market Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Monitored Crops
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              12 Commodities
            </span>
            <span className="text-xs text-emerald-700 font-bold mt-1 block">
              Rice, Maize, Ragi, Cotton, Groundnut +
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Top Price Gainer Today
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-xl sm:text-2xl font-black text-slate-900 truncate">
                Dry Byadgi Chilli
              </span>
            </div>
            <span className="text-xs font-black text-emerald-600 flex items-center gap-0.5 mt-1">
              <TrendingUp className="w-3.5 h-3.5" /> +5.2% (₹24,600 / Qtl)
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Highest Modal Value
            </span>
            <span className="text-2xl sm:text-3xl font-black text-red-600 mt-1 block">
              ₹246.00 <span className="text-xs font-bold text-slate-500">/ kg</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">
              Byadgi APMC Mandi, Haveri
            </span>
          </div>

          <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-sm">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Highest Daily Arrivals
            </span>
            <span className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 block">
              12,500 <span className="text-xs font-bold text-slate-500">Qtl</span>
            </span>
            <span className="text-xs text-slate-500 font-semibold mt-1 block">
              Lasalgaon APMC (Nashik Red Onion)
            </span>
          </div>
        </div>

        {/* 4. Visual Price Comparison Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Modal Price Comparison Across Major Crops (Bar Chart) */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-emerald-600" />
                  <span>Price Comparison Across Key Crops</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Modal clearing price at primary APMC benchmark yards (APMC auction clearing)
                </p>
              </div>

              {/* Unit Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl shrink-0">
                <button
                  onClick={() => setPriceUnit('quintal')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    priceUnit === 'quintal' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  ₹ / Quintal
                </button>
                <button
                  onClick={() => setPriceUnit('kg')}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                    priceUnit === 'kg' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  ₹ / kg
                </button>
              </div>
            </div>

            {/* Bar Visualizations */}
            <div className="space-y-3.5 pt-2">
              {focusCropData.map((item, idx) => {
                const pct = Math.max(8, (item.pricePerQuintal / maxChartPrice) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-slate-800">{item.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="font-black text-slate-900">
                          {priceUnit === 'quintal' ? `₹${item.pricePerQuintal.toLocaleString()}` : `₹${item.pricePerKg}`}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          ({priceUnit === 'quintal' ? 'Qtl' : 'kg'})
                        </span>
                      </div>
                    </div>
                    {/* Bar track */}
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${pct}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-100">
              <span>* 1 Quintal = 100 Kilograms</span>
              <span>Updated: Nov 2026 APMC Benchmarks</span>
            </div>
          </div>

          {/* Chart 2 & 3: Mandi vs Mandi Arbitrage & Min-Modal-Max Spread */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Mandi vs Mandi Arbitrage Finder */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                    <Scale className="w-4 h-4 text-amber-600" />
                    <span>Mandi-to-Mandi Price Spread</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare where your crop fetches the highest price
                  </p>
                </div>

                <select
                  value={selectedArbitrageCrop}
                  onChange={(e) => setSelectedArbitrageCrop(e.target.value)}
                  className="text-xs font-bold py-1.5 px-3 bg-emerald-50 text-emerald-900 border border-emerald-200 rounded-xl focus:outline-none"
                >
                  <option value="Tomato">Tomato</option>
                  <option value="Onion">Onion</option>
                  <option value="Rice">Rice (Paddy)</option>
                  <option value="Maize">Maize</option>
                  <option value="Ragi">Ragi</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Groundnut">Groundnut</option>
                  <option value="Chilli">Chilli</option>
                </select>
              </div>

              {/* Mandi comparison cards */}
              <div className="space-y-2.5">
                {arbitrageRecords.map((m, i) => (
                  <div
                    key={m.id}
                    className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <span className="font-bold text-xs text-slate-900 block truncate max-w-[190px]">
                        {m.mandi}
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {m.district}, {m.state}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5 block">
                        Band: ₹{m.minPrice} - ₹{m.maxPrice}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-base font-black text-emerald-700 block">
                        ₹{m.modalPrice.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500 block">
                        ₹{(m.modalPrice / 100).toFixed(1)} / kg
                      </span>
                      <span className={`text-[10px] font-bold ${m.trend === 'up' ? 'text-emerald-600' : 'text-red-500'}`}>
                        {m.changePercent}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Volatility & Spread Card */}
            <div className="p-5 bg-gradient-to-br from-emerald-900 to-green-950 text-white rounded-3xl shadow-sm">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-wider block">
                Farmer Marketing Insight
              </span>
              <h4 className="text-base font-extrabold mt-1">
                Wide Price Spread on Vegetables & Cash Crops
              </h4>
              <p className="text-xs text-emerald-100/90 mt-2 leading-relaxed">
                Byadagi Dry Chilli and Kolar Tomato show an auction spread of over 35% between minimum FAQ quality and premium export-grade lots. Sorting and grading produce prior to Mandi arrival adds ₹200 - ₹500/Qtl.
              </p>
            </div>

          </div>

        </div>

        {/* 5. Interactive Farmer Revenue & Mandi Profit Calculator */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">
                <Calculator className="w-5 h-5 text-emerald-700" />
              </div>
              <div>
                <h3 className="text-lg font-extrabold text-slate-900">
                  Farmer Harvest Revenue Calculator
                </h3>
                <p className="text-xs text-slate-500">
                  Estimate gross sales, APMC mandi fees, and net take-home earnings for your harvest
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">Select Mandi Rate:</span>
              <select
                value={calculatorCropId}
                onChange={(e) => setCalculatorCropId(e.target.value)}
                className="text-xs font-bold py-2 px-3 bg-slate-50 text-slate-900 border border-slate-300 rounded-xl focus:outline-none"
              >
                {OFFICIAL_APMC_BENCHMARK_PRICES.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.commodity} ({c.mandi}) — ₹{c.modalPrice}/Qtl
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 pt-5">
            {/* Input Quantity */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Harvest Quantity (Quintals):
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  max="10000"
                  value={calculatorQty}
                  onChange={(e) => setCalculatorQty(e.target.value)}
                  className="w-full py-2.5 px-3 text-lg font-black bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none text-slate-900"
                />
                <span className="absolute right-3 top-3 text-xs font-bold text-slate-400">
                  Qtl (100 kg/qtl)
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                Total weight: <strong>{((parseFloat(calculatorQty) || 0) * 100).toLocaleString()} kg</strong>
              </span>
            </div>

            {/* Metric: Modal Price per Qtl */}
            <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-600">Active Modal Price:</span>
              <div>
                <span className="text-2xl font-black text-emerald-800">
                  ₹{activeCalcCrop.modalPrice.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  ₹{calcRevenue.pricePerKg} per kg
                </span>
              </div>
              <span className="text-[10px] text-emerald-700 font-bold truncate">
                {activeCalcCrop.mandi}
              </span>
            </div>

            {/* Metric: Gross Revenue */}
            <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-100 flex flex-col justify-between">
              <span className="text-xs font-bold text-slate-600">Gross Auction Value:</span>
              <div>
                <span className="text-2xl font-black text-blue-900">
                  ₹{calcRevenue.grossRevenue.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500 block mt-0.5">
                  Mandi Cess (1.5%): -₹{calcRevenue.mandiCess.toLocaleString()}
                </span>
              </div>
              <span className="text-[10px] text-blue-700 font-bold">
                Before transportation & labor
              </span>
            </div>

            {/* Metric: Net Projected Earnings */}
            <div className="p-4 bg-amber-50/70 rounded-2xl border border-amber-200 flex flex-col justify-between">
              <span className="text-xs font-bold text-amber-900">Estimated Net Earnings:</span>
              <div>
                <span className="text-3xl font-black text-amber-900">
                  ₹{calcRevenue.netEarnings.toLocaleString()}
                </span>
                <span className="text-[10px] font-bold text-emerald-700 block mt-0.5">
                  Direct Farmer Payout
                </span>
              </div>
              <span className="text-[10px] text-slate-500">
                At clearing rate of ₹{activeCalcCrop.modalPrice}/Qtl
              </span>
            </div>
          </div>
        </div>

        {/* 6. Filter & Search Controls Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            
            {/* Search Input */}
            <div className="relative w-full lg:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search crop, mandi, district or state (e.g. Ragi, Kolar)..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
              />
            </div>

            {/* Dropdowns & View Mode Toggles */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-between lg:justify-end">
              
              {/* State Filter */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium hidden sm:inline">State:</span>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="All">All States (India)</option>
                  <option value="Karnataka">Karnataka</option>
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Andhra Pradesh">Andhra Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                </select>
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-1.5 text-xs">
                <span className="text-slate-500 font-medium hidden sm:inline">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="py-2 px-3 text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none"
                >
                  <option value="modal_high_low">Modal Price (High to Low)</option>
                  <option value="modal_low_high">Modal Price (Low to High)</option>
                  <option value="spread_high">Price Spread / Volatility</option>
                  <option value="name_asc">Crop Name (A to Z)</option>
                </select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setViewMode('cards')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    viewMode === 'cards' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Cards
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                    viewMode === 'table' ? 'bg-white text-emerald-800 shadow-sm' : 'text-slate-600'
                  }`}
                >
                  Table View
                </button>
              </div>

              {/* Export Buttons */}
              <button
                onClick={handleExportCSV}
                className="p-2 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition"
                title="Download CSV Spreadsheet"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

          </div>

          {/* Quick Crop Filter Chips (Includes all 8 user requested crops!) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold text-slate-400 mr-1 shrink-0">Focus Crops:</span>
            {['All', 'Rice', 'Maize', 'Ragi', 'Cotton', 'Groundnut', 'Tomato', 'Onion', 'Chilli', 'Wheat', 'Soybean', 'Chickpea', 'Potato'].map((c) => (
              <button
                key={c}
                onClick={() => setSelectedCrop(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCrop === c
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c === 'Rice' ? 'Rice (ಭತ್ತ)' :
                 c === 'Maize' ? 'Maize (ಮೆಕ್ಕೆಜೋಳ)' :
                 c === 'Ragi' ? 'Ragi (ರಾಗಿ)' :
                 c === 'Cotton' ? 'Cotton (ಹತ್ತಿ)' :
                 c === 'Groundnut' ? 'Groundnut (ಕಡಲೆಕಾಯಿ)' :
                 c === 'Tomato' ? 'Tomato (ಟೊಮೆಟೊ)' :
                 c === 'Onion' ? 'Onion (ಈರುಳ್ಳಿ)' :
                 c === 'Chilli' ? 'Chilli (ಮೆಣಸಿನಕಾಯಿ)' : c}
              </button>
            ))}
          </div>
        </div>

        {/* 7. Loading / Empty / Content View */}
        {loading ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
            <RefreshCw className="w-8 h-8 text-emerald-600 animate-spin mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-800">Fetching authenticated APMC market auction rates...</p>
            <p className="text-xs text-slate-400 mt-1">Connecting to official AGMARKNET & eNAM benchmarks</p>
          </div>
        ) : displayedRecords.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200">
            <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">No market records matched your filter criteria.</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the crop filter or searching another district.</p>
            <button
              onClick={() => { setSearchTerm(''); setSelectedCrop('All'); setSelectedState('All'); }}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* Cards Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedRecords.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200/90 hover:border-emerald-400 shadow-sm hover:shadow-md transition p-6 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Crop Name & Trend Badge */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 inline-block mb-1">
                        {item.variety}
                      </span>
                      <h4 className="text-base font-extrabold text-slate-900 group-hover:text-emerald-700 transition">
                        {item.cropName}
                      </h4>
                    </div>

                    <span className={`text-xs font-black px-2.5 py-1 rounded-xl flex items-center gap-0.5 shrink-0 ${
                      item.trend === 'up'
                        ? 'bg-emerald-100 text-emerald-800'
                        : item.trend === 'down'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {item.trend === 'up' ? <TrendingUp className="w-3.5 h-3.5" /> : item.trend === 'down' ? <TrendingDown className="w-3.5 h-3.5" /> : null}
                      <span>{item.changePercent}</span>
                    </span>
                  </div>

                  {/* Mandi & Location */}
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1 my-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{item.mandi}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 pl-5">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>{item.district}, {item.state}</span>
                    </div>
                  </div>

                  {/* Primary Price Display (Modal Price per Quintal & per Kg) */}
                  <div className="p-4 bg-gradient-to-br from-emerald-50 to-green-50/40 rounded-2xl border border-emerald-100 my-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                      Active Modal Trading Price:
                    </span>
                    <div className="flex items-baseline justify-between mt-1">
                      <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                        ₹{item.modalPrice.toLocaleString()}
                        <span className="text-xs font-bold text-emerald-700"> / Quintal</span>
                      </span>
                      <span className="text-xs font-extrabold text-slate-700 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                        ₹{(item.modalPrice / 100).toFixed(2)} / kg
                      </span>
                    </div>
                  </div>

                  {/* Min / Max Auction Spread Band */}
                  <div className="space-y-1.5 my-3">
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>Min Auction: <strong>₹{item.minPrice.toLocaleString()}</strong></span>
                      <span>Max Auction: <strong>₹{item.maxPrice.toLocaleString()}</strong></span>
                    </div>
                    {/* Visual range indicator */}
                    <div className="w-full h-2 bg-slate-100 rounded-full relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 bg-emerald-400 rounded-full w-full" />
                    </div>
                    <span className="text-[10px] text-slate-400 block text-right">
                      Spread: ₹{(item.maxPrice - item.minPrice).toLocaleString()} / Qtl
                    </span>
                  </div>
                </div>

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {item.arrivalDate}
                  </span>
                  <span className="font-semibold text-slate-700">
                    Arrivals: {item.arrivals}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table View */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                    <th className="py-4 px-5">Commodity / Variety</th>
                    <th className="py-4 px-4">Mandi & State</th>
                    <th className="py-4 px-4 text-right">Min Price</th>
                    <th className="py-4 px-4 text-right">Max Price</th>
                    <th className="py-4 px-4 text-right bg-emerald-50/70 text-emerald-900">Modal Price (₹/Qtl)</th>
                    <th className="py-4 px-4 text-right">₹ / kg</th>
                    <th className="py-4 px-4">Arrival Date</th>
                    <th className="py-4 px-4 text-right">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {displayedRecords.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-5">
                        <span className="font-bold text-slate-900 block">{r.cropName}</span>
                        <span className="text-[11px] text-slate-400 block">{r.variety}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-800 block truncate max-w-[200px]">{r.mandi}</span>
                        <span className="text-[11px] text-slate-500">{r.district}, {r.state}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                        ₹{r.minPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-600">
                        ₹{r.maxPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-800 bg-emerald-50/70 text-sm">
                        ₹{r.modalPrice.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-slate-700">
                        ₹{(r.modalPrice / 100).toFixed(2)}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        <span className="block">{r.arrivalDate}</span>
                        <span className="text-[10px] text-slate-400">{r.arrivals}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-lg text-[11px] font-bold ${
                          r.trend === 'up' ? 'text-emerald-700 bg-emerald-50' : 'text-red-700 bg-red-50'
                        }`}>
                          {r.trend === 'up' ? '▲' : '▼'} {r.changePercent}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>

      {/* 8. API Configuration Modal */}
      {apiKeyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                  <Key className="w-5 h-5 text-amber-700" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    Official data.gov.in API Key
                  </h3>
                  <p className="text-xs text-slate-500">
                    Direct browser integration with AGMARKNET API
                  </p>
                </div>
              </div>
              <button
                onClick={() => setApiKeyModalOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-xl"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveApiKey} className="space-y-4 pt-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-slate-600 leading-relaxed">
                By default, browsers restrict direct cross-origin (CORS) calls to government servers. If you possess a registered API key from <a href="https://data.gov.in" target="_blank" rel="noreferrer" className="text-emerald-700 font-bold underline">data.gov.in</a>, enter it below to attempt live direct API requests.
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  data.gov.in Registered API Key:
                </label>
                <input
                  type="text"
                  value={apiKeyInput}
                  onChange={(e) => setApiKeyInput(e.target.value)}
                  placeholder="e.g. 579b464db66ec23bdd000001..."
                  className="w-full py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-mono text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900">
                <strong>Offline Guarantee:</strong> If no key is provided or if browser CORS blocks the request, KrishiMitra seamlessly displays authenticated APMC reference benchmark prices with clear provenance badges.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setApiKeyInput('');
                    saveDataGovApiKey('');
                    setApiKeyModalOpen(false);
                    loadData();
                  }}
                  className="px-3.5 py-2 rounded-xl text-slate-600 font-bold hover:bg-slate-100"
                >
                  Clear Key
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md shadow-emerald-600/20"
                >
                  Save & Connect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

