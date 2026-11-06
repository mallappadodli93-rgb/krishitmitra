import React from 'react';
import {
  Sprout,
  ScanLine,
  CloudSun,
  Layers,
  Bot,
  BadgeDollarSign,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Card from '../common/Card';
import Badge from '../common/Badge';
import { useLanguage } from '../../context/LanguageContext';

export default function FeatureCards({
  onOpenCropRecommendation,
  onOpenDiseaseDetection,
  onOpenWeather,
  onOpenSoilInfo,
  onOpenAIAssistant,
  onOpenMarketPrice
}) {
  const { t } = useLanguage();

  const features = [
    {
      id: 'crop-recommendation',
      title: t('featCropRecTitle'),
      description: t('featCropRecDesc'),
      icon: Sprout,
      badge: 'Smart Engine',
      badgeColor: 'emerald',
      actionText: t('featCropRecAction'),
      action: onOpenCropRecommendation
    },
    {
      id: 'disease-detection',
      title: t('featDiseaseTitle'),
      description: t('featDiseaseDesc'),
      icon: ScanLine,
      badge: 'Visual AI',
      badgeColor: 'amber',
      actionText: t('featDiseaseAction'),
      action: onOpenDiseaseDetection
    },
    {
      id: 'weather-prediction',
      title: t('featWeatherTitle'),
      description: t('featWeatherDesc'),
      icon: CloudSun,
      badge: 'Live Radar',
      badgeColor: 'blue',
      actionText: t('featWeatherAction'),
      action: onOpenWeather
    },
    {
      id: 'soil-information',
      title: t('featSoilTitle'),
      description: t('featSoilDesc'),
      icon: Layers,
      badge: 'Soil Health',
      badgeColor: 'emerald',
      actionText: t('featSoilAction'),
      action: onOpenSoilInfo
    },
    {
      id: 'farming-assistant',
      title: t('featAssistantTitle'),
      description: t('featAssistantDesc'),
      icon: Bot,
      badge: '24/7 Live',
      badgeColor: 'purple',
      actionText: t('featAssistantAction'),
      action: onOpenAIAssistant
    },
    {
      id: 'market-price-information',
      title: t('featMarketTitle'),
      description: t('featMarketDesc'),
      icon: BadgeDollarSign,
      badge: 'eNAM Synced',
      badgeColor: 'gold',
      actionText: t('featMarketAction'),
      action: onOpenMarketPrice
    }
  ];

  return (
    <section id="features" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-1.5">
            <Badge variant="emerald" icon={Sparkles}>
              {t('featuresHeaderBadge')}
            </Badge>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            {t('featuresHeading')}
          </h2>
          <p className="text-slate-600 text-base leading-relaxed">
            {t('featuresSubheading')}
          </p>
        </div>

        {/* 6 Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feat) => {
            const Icon = feat.icon;

            return (
              <Card
                key={feat.id}
                onClick={feat.action}
                className="group relative p-7 flex flex-col justify-between border-slate-200/90 hover:border-emerald-500 hover:shadow-xl transition-all duration-300 bg-white cursor-pointer"
              >
                <div>
                  {/* Top Bar: Icon & Badge */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 shadow-sm">
                      <Icon className="w-7 h-7" />
                    </div>
                    <Badge variant={feat.badgeColor} size="xs">
                      {feat.badge}
                    </Badge>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-700 transition-colors mb-2">
                    {feat.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                {/* Card Action Link */}
                <div className="pt-6 mt-6 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-emerald-700 group-hover:text-emerald-800">
                  <span>{feat.actionText}</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
                </div>
              </Card>
            );
          })}
        </div>

      </div>
    </section>
  );
}
