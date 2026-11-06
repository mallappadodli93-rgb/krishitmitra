import React from 'react';
import {
  Sprout,
  Phone,
  Mail,
  MapPin,
  Heart,
  ShieldCheck,
  ArrowUpRight,
  MessageCircle,
  ExternalLink
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export default function Footer({
  onOpenCropRecommendation,
  onOpenDiseaseDetection,
  onOpenWeather,
  onOpenAIAssistant,
  onOpenSoilInfo,
  onOpenMarketPrices
}) {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-slate-950 text-slate-300 pt-16 pb-12 border-t border-emerald-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main 4-column footer grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                <Sprout className="w-6 h-6" />
              </div>
              <div>
                <span className="text-2xl font-black text-white tracking-tight">
                  {t('brandName')}
                </span>
                <p className="text-xs text-emerald-300 font-medium">{t('brandTagline')}</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
              {t('footerDesc')}
            </p>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{t('footerFreeBadge')}</span>
            </div>
          </div>

          {/* Column 2: Useful Platform Links */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              {t('footerUsefulLinks')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('navHome')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenCropRecommendation}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featCropRecTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenWeather || (() => scrollTo('weather'))}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featWeatherTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenDiseaseDetection}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featDiseaseTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAIAssistant}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featAssistantTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSoilInfo}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featSoilTitle')}
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenMarketPrices || (() => scrollTo('mandi'))}
                  className="hover:text-emerald-400 transition-colors text-left"
                >
                  {t('featMarketTitle')}
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Agricultural Government Portals */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              {t('footerGovtPortals')}
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm">
              <li>
                <a
                  href="https://enam.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>eNAM National Market</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmkisan.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>PM-KISAN Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://pmfby.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>PM Fasal Bima (PMFBY)</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://soilhealth.dac.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Soil Health Card Portal</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
              <li>
                <a
                  href="https://agmarknet.gov.in"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-emerald-400 transition-colors"
                >
                  <span>Agmarknet Mandi Prices</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Information */}
          <div>
            <h4 className="text-white font-bold text-sm mb-4 uppercase tracking-wider">
              {t('footerContactInfo')}
            </h4>
            <div className="space-y-3.5 text-xs sm:text-sm">
              {/* Kisan Call Center Helpline */}
              <div className="bg-slate-900 p-3.5 rounded-2xl border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-1">
                  {t('footerTollFree')}
                </span>
                <a
                  href="tel:18001801551"
                  className="font-black text-emerald-400 hover:text-emerald-300 text-base flex items-center gap-2"
                >
                  <Phone className="w-4 h-4" />
                  <span>1800-180-1551</span>
                </a>
                <span className="text-[10px] text-slate-500 block mt-1">
                  24/7 Helpline • 6:00 AM to 10:00 PM
                </span>
              </div>

              {/* WhatsApp Support */}
              <a
                href="https://wa.me/?text=Namaste%20KrishiMitra"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 text-slate-300 hover:text-emerald-400 transition"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>WhatsApp: +91 98765 43210</span>
              </a>

              {/* Email */}
              <div className="flex items-center gap-2.5 text-slate-300">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>contact@krishimitra.org</span>
              </div>

              {/* Address */}
              <div className="flex items-start gap-2.5 text-slate-400">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Krishi Bhawan, Agritech Innovation Hub, New Delhi, India</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {currentYear} {t('brandName')} – {t('brandTagline')}. {t('footerAllRights')}</p>
          <p className="flex items-center gap-1.5">
            {t('footerMadeForFarmers')} <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 ml-1" />
          </p>
        </div>

      </div>
    </footer>
  );
}
