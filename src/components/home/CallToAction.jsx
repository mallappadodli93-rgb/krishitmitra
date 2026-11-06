import React from 'react';
import { Sparkles, Phone, ShieldCheck, ArrowRight, MessageCircle } from 'lucide-react';
import Button from '../common/Button';

export default function CallToAction({ onOpenScanner }) {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl bg-gradient-to-r from-emerald-900 via-green-800 to-emerald-950 p-8 sm:p-14 text-white overflow-hidden shadow-2xl border border-emerald-800">
          
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-green-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-700/60 border border-emerald-500/40 text-emerald-200 text-xs font-bold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              100% Free For All Indian Farmers
            </span>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-tight">
              Start Protecting Your Crop & Boosting Profits Today
            </h2>

            <p className="text-emerald-100 text-sm sm:text-base leading-relaxed max-w-2xl">
              No complex setup or fees required. Scan your crop with AI, check today's live mandi rates in your district, and receive weather alerts directly on your phone.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
              <Button
                variant="white"
                size="lg"
                icon={Sparkles}
                onClick={onOpenScanner}
                className="font-bold text-emerald-900 shadow-xl hover:bg-emerald-50"
              >
                Launch AI Crop Doctor
              </Button>

              <a
                href="https://wa.me/?text=Hello%20KrishiMitra%20Farming%20Assistant"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-emerald-800/80 hover:bg-emerald-700 border border-emerald-600/50 text-white font-semibold text-base transition shadow-md"
              >
                <MessageCircle className="w-5 h-5 text-emerald-300" />
                <span>Ask on WhatsApp</span>
              </a>

              <a
                href="tel:18001801551"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-emerald-200 hover:text-white hover:bg-emerald-800/40 text-sm font-semibold transition"
              >
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>Call 1800-180-1551</span>
              </a>
            </div>

            {/* Trust Footer */}
            <div className="pt-6 border-t border-emerald-800/60 flex flex-wrap items-center gap-6 text-xs text-emerald-300">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>No sign-up mandatory</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Zero Ads / Commercial Bias</span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Available in 6 Indian Languages</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

