import React from 'react';
import { ArrowRight, Sparkles, Sprout, CloudSun, ShieldCheck, CheckCircle2 } from 'lucide-react';
import Button from '../common/Button';
import { useLanguage } from '../../context/LanguageContext';

export default function HeroSection({
  onGetStarted,
  onExploreFeatures,
  onOpenScanner
}) {
  const { t } = useLanguage();

  return (
    <section id="home" className="relative min-h-[580px] lg:min-h-[640px] flex items-center justify-center overflow-hidden">
      
      {/* Beautiful High-Resolution Farming Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=1920&auto=format&fit=crop&q=85"
          alt="Lush green farm landscape"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Modern multi-layer gradient overlay for readability & agricultural branding */}
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-900/80 to-slate-950/75" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-transparent to-black/30" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center lg:text-left w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Heading, Description & Action Buttons */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/20 backdrop-blur-md border border-emerald-400/30 text-emerald-200 text-xs font-bold tracking-wide shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-300"></span>
              </span>
              <span>{t('heroBadge')}</span>
            </div>

            {/* Multilingual Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.25]">
              {t('heroHeadingMain')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-green-300 to-lime-300">
                {t('heroHeadingHighlight')}
              </span>
            </h1>

            {/* Multilingual Description */}
            <p className="text-lg sm:text-xl text-emerald-100/90 font-medium leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t('heroDescription')}
            </p>

            {/* Action Buttons: Get Started & Explore Features */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
              <Button
                variant="primary"
                size="lg"
                icon={Sparkles}
                onClick={onGetStarted}
                className="w-full sm:w-auto shadow-emerald-500/25 shadow-xl hover:shadow-2xl font-bold"
              >
                {t('heroGetStarted')}
              </Button>

              <Button
                variant="white"
                size="lg"
                icon={ArrowRight}
                iconPosition="right"
                onClick={onExploreFeatures}
                className="w-full sm:w-auto font-bold text-emerald-900 hover:bg-emerald-50"
              >
                {t('heroExploreFeatures')}
              </Button>
            </div>

            {/* Trust Points */}
            <div className="pt-6 border-t border-emerald-800/60 grid grid-cols-3 gap-3 text-emerald-200 text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{t('heroAiPrecision')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{t('heroLocalForecast')}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{t('heroFreeBadge')}</span>
              </div>
            </div>

          </div>

          {/* Right Column: Interactive Quick Card */}
          <div className="lg:col-span-5">
            <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 sm:p-7 text-white shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Sprout className="w-4 h-4 text-emerald-400" />
                  <span>{t('brandTagline')}</span>
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
                  {t('dashRabiSeason')}
                </span>
              </div>

              <div className="my-5 space-y-3.5">
                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-200 block">{t('tipSprayTimeTitle')}</span>
                    <strong className="text-sm text-white">{t('heroIdealSpray')}</strong>
                  </div>
                  <CloudSun className="w-7 h-7 text-amber-300" />
                </div>

                <div className="bg-white/10 p-3.5 rounded-2xl border border-white/10 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-emerald-200 block">{t('dashCropCardTitle')}</span>
                    <strong className="text-sm text-emerald-300">96.4% {t('heroAiPrecision')}</strong>
                  </div>
                  <ShieldCheck className="w-7 h-7 text-emerald-400" />
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenScanner}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>{t('heroScanLeafDemo')}</span>
              </button>
            </div>
          </div>

        </div>
      </div>

    </section>
  );
}
