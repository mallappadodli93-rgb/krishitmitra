import React from 'react';
import { Quote, Star, CheckCircle, MapPin } from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { mockTestimonials } from '../../data/mockData';

export default function Testimonials() {
  return (
    <section id="stories" className="py-20 bg-[#F8FAF8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <Badge variant="emerald" icon={CheckCircle}>
            Real Farmer Stories
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Trusted by 1.2 Lakh+ Farmers Across India
          </h2>
          <p className="text-slate-600 text-sm">
            Read how grassroots farmers are cutting input costs and boosting harvest revenues using KrishiMitra.
          </p>
        </div>

        {/* Testimonials 3 Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {mockTestimonials.map((item) => (
            <Card
              key={item.id}
              className="p-7 bg-white border-slate-200/80 hover:border-emerald-300 hover:shadow-xl flex flex-col justify-between"
            >
              <div>
                {/* 5-star rating */}
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>

                {/* Quote text */}
                <p className="text-sm text-slate-700 leading-relaxed italic mb-6">
                  "{item.quote}"
                </p>
              </div>

              <div>
                {/* Highlight Tag */}
                <div className="mb-4">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200">
                    {item.tag}
                  </span>
                </div>

                {/* Farmer Profile */}
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500/40"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{item.name}</h4>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {item.village} • <span className="text-emerald-700 font-medium">{item.crop}</span>
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

      </div>
    </section>
  );
}

