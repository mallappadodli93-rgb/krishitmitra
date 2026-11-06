import React, { useState } from 'react';
import {
  Calendar,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronRight,
  Sprout,
  ShieldCheck,
  Droplet
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import Button from '../common/Button';
import { mockAdvisories } from '../../data/mockData';

export default function CropAdvisoryPreview() {
  const [activeSeason, setActiveSeason] = useState('Rabi');

  const urgencyStyles = {
    High: 'bg-red-50 text-red-700 border-red-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
    Normal: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <section id="advisory" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="emerald" icon={Calendar}>
                Agronomy Calendar
              </Badge>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Timely Seasonal Advisory & Alerts
            </h2>
            <p className="text-slate-600 text-sm mt-1 max-w-2xl">
              Stage-specific management tips formulated by agricultural universities to maximize yield while curbing chemical overhead.
            </p>
          </div>

          {/* Season Toggle */}
          <div className="flex items-center bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            {['Rabi (Current)', 'Kharif', 'Zaid (Summer)'].map((season) => {
              const cleanSeason = season.split(' ')[0];
              const isSelected = activeSeason === cleanSeason;
              return (
                <button
                  key={season}
                  onClick={() => setActiveSeason(cleanSeason)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                    isSelected
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {season}
                </button>
              );
            })}
          </div>
        </div>

        {/* Advisory Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mockAdvisories.map((advisory) => (
            <Card
              key={advisory.id}
              className="p-6 border-slate-200 flex flex-col justify-between hover:border-emerald-500 hover:shadow-lg transition-all"
            >
              <div>
                {/* Header tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      {advisory.crop.slice(0, 2).toUpperCase()}
                    </span>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">{advisory.crop}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{advisory.stage}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                      urgencyStyles[advisory.urgency]
                    }`}
                  >
                    {advisory.urgency} Urgency
                  </span>
                </div>

                {/* Recommended Action */}
                <div className="mb-4">
                  <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider block mb-1">
                    Key Activity
                  </span>
                  <p className="text-sm font-semibold text-slate-800">
                    {advisory.action}
                  </p>
                </div>

                {/* Practical Advice Tip */}
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 leading-relaxed space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Agronomist Guidance</span>
                  </div>
                  <p>{advisory.tip}</p>
                </div>
              </div>

              {/* Bottom Reminder action */}
              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-medium">Stage: 20-30 DAS</span>
                <button
                  type="button"
                  onClick={() => alert(`Added advisory reminder for ${advisory.crop} to your farm calendar!`)}
                  className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition"
                >
                  <span>Set SMS Reminder</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {/* Soil Health Callout Banner */}
        <div className="mt-12 bg-gradient-to-r from-emerald-50 via-green-50 to-emerald-100 rounded-3xl p-6 sm:p-8 border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md">
              <Droplet className="w-7 h-7" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">
                Need customized fertilizer dosage for your specific soil test?
              </h4>
              <p className="text-slate-600 text-xs sm:text-sm mt-0.5">
                Input your Soil Health Card N-P-K values to get precise bag calculations for Urea, DAP, and Potash.
              </p>
            </div>
          </div>

          <Button
            variant="primary"
            size="md"
            className="shrink-0"
            onClick={() => alert('Soil Fertilizer Calculator opened! Choose crop: Wheat, Paddy, Cotton, Soybean to calculate exact bags needed.')}
          >
            Open Fertilizer Calculator
          </Button>
        </div>

      </div>
    </section>
  );
}

