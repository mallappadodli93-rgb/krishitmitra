import React, { useState } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Search,
  Filter,
  BadgeDollarSign,
  MapPin,
  Clock,
  ArrowUpRight,
  ShieldCheck
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { mockMarketPrices } from '../../data/mockData';

export default function MarketPricesPreview({ onOpenFullMarketPrices }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'Wheat', 'Soybean', 'Cotton', 'Onion', 'Paddy'];

  const filteredPrices = mockMarketPrices.filter((item) => {
    const matchesSearch =
      item.commodity.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.mandi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.variety.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' ||
      item.commodity.toLowerCase().includes(selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  return (
    <section id="mandi" className="py-20 bg-[#F8FAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="amber" icon={BadgeDollarSign}>
                Live APMC Mandi Rates
              </Badge>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                Updated 15 mins ago
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Transparent Market Prices Across India
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Track actual auction rates directly from government agricultural produce market committees (APMC) and eNAM platforms.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Agmarknet & eNAM Synced</span>
            </div>
            <button
              onClick={() => {
                if (onOpenFullMarketPrices) onOpenFullMarketPrices();
                else window.location.hash = 'market-prices';
              }}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-700/20 flex items-center gap-1.5 transition active:scale-95"
            >
              <TrendingUp className="w-4 h-4 text-emerald-200" />
              <span>Full Market Dashboard →</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Search box */}
          <div className="relative w-full md:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search crop, variety or mandi (e.g. Wheat, Indore)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
            />
          </div>

          {/* Category quick filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table / Cards */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-4 px-6">Commodity & Variety</th>
                  <th className="py-4 px-6">Mandi / State</th>
                  <th className="py-4 px-6">Quality Grade</th>
                  <th className="py-4 px-6 text-right">Modal Price (₹/Qtl)</th>
                  <th className="py-4 px-6 text-right">Daily Change</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredPrices.length > 0 ? (
                  filteredPrices.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-emerald-50/40 transition-colors group"
                    >
                      {/* Commodity */}
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                          {item.commodity}
                        </div>
                        <div className="text-xs text-slate-500 font-medium">
                          {item.variety}
                        </div>
                      </td>

                      {/* Mandi */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-1.5 text-slate-700 font-semibold text-xs sm:text-sm">
                          <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>{item.mandi}</span>
                        </div>
                      </td>

                      {/* Quality Grade */}
                      <td className="py-4 px-6">
                        <Badge variant="slate" size="xs">
                          {item.quality}
                        </Badge>
                      </td>

                      {/* Price */}
                      <td className="py-4 px-6 text-right font-extrabold text-slate-900 text-base">
                        ₹{item.price.toLocaleString('en-IN')}
                        <span className="text-xs font-medium text-slate-400 block sm:inline sm:ml-1">
                          / {item.unit}
                        </span>
                      </td>

                      {/* Change */}
                      <td className="py-4 px-6 text-right">
                        <span
                          className={`inline-flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full ${
                            item.trend === 'up'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {item.trend === 'up' ? (
                            <TrendingUp className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <TrendingDown className="w-3 h-3 text-red-600" />
                          )}
                          <span>{item.change}</span>
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => alert(`Showing historical price chart & buyer contact for ${item.commodity} at ${item.mandi}`)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-semibold text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition"
                        >
                          <span>Analyze</span>
                          <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-500 text-sm">
                      No mandi rates found matching "{searchTerm}". Try another crop or city.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span>Prices quoted are based on standard APMC auction averages. Actual grade pricing may vary.</span>
            <button
              onClick={() => {
                if (onOpenFullMarketPrices) onOpenFullMarketPrices();
                else window.location.hash = 'market-prices';
              }}
              className="font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
            >
              <span>Explore All 12 Commodities, Mandi Comparisons & Profit Calculator →</span>
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}

