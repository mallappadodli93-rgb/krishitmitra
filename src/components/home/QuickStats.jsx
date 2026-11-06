import React from 'react';
import { Users, LandPlot, CheckCircle2, TrendingUp } from 'lucide-react';
import Card from '../common/Card';
import { mockStats } from '../../data/mockData';

const iconMap = {
  Users: Users,
  LandPlot: LandPlot,
  CheckCircle2: CheckCircle2,
  TrendingUp: TrendingUp,
};

export default function QuickStats() {
  return (
    <section className="relative z-10 -mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {mockStats.map((stat) => {
          const IconComponent = iconMap[stat.icon] || TrendingUp;
          return (
            <Card
              key={stat.id}
              className="bg-white/90 backdrop-blur-md border border-emerald-100 shadow-md p-5 flex items-center gap-4 group"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-slate-900 tracking-tight block">
                  {stat.value}
                </span>
                <span className="text-xs font-bold text-slate-600 block">
                  {stat.label}
                </span>
                <span className="text-[11px] text-emerald-600 font-medium">
                  {stat.change}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

