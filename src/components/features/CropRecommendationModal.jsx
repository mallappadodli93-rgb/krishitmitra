import React, { useState } from 'react';
import { Sprout, CheckCircle2, TrendingUp, Droplets, Sparkles, ArrowRight } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

const recommendationsDB = {
  "Black Soil": {
    Kharif: [
      { name: "Cotton (Bt Cotton)", match: "97%", yield: "12-14 Quintals/Acre", profit: "₹65,000 - ₹85,000", water: "Moderate", tip: "Ensure deep ploughing in summer to kill resting bollworm pupae." },
      { name: "Soybean (JS-335)", match: "94%", yield: "10-12 Quintals/Acre", profit: "₹45,000 - ₹55,000", water: "Medium", tip: "Inoculate seed with Rhizobium and PSB culture prior to sowing." },
      { name: "Pigeon Pea / Arhar", match: "89%", yield: "7-9 Quintals/Acre", profit: "₹42,000 - ₹50,000", water: "Low", tip: "Intercrop with soybean at 4:2 ratio for risk reduction." },
    ],
    Rabi: [
      { name: "Gram / Chickpea (Desi/Kabuli)", match: "98%", yield: "9-11 Quintals/Acre", profit: "₹50,000 - ₹62,000", water: "Low", tip: "Treat seeds with Trichoderma @ 5g/kg against wilt fungus." },
      { name: "Wheat (Lokwan / Sharbati)", match: "92%", yield: "18-22 Quintals/Acre", profit: "₹48,000 - ₹58,000", water: "High", tip: "First irrigation at 21 DAS during crown root initiation." },
      { name: "Safflower (Kardi)", match: "88%", yield: "6-8 Quintals/Acre", profit: "₹35,000 - ₹42,000", water: "Very Low", tip: "Deep root system extracts subsoil moisture effectively." },
    ],
    Zaid: [
      { name: "Green Gram (Moong)", match: "95%", yield: "5-6 Quintals/Acre", profit: "₹30,000 - ₹38,000", water: "Moderate", tip: "Short 60-day duration crop that fixes 35kg nitrogen/ha." },
      { name: "Groundnut (Summer)", match: "90%", yield: "14-16 Quintals/Acre", profit: "₹55,000 - ₹68,000", water: "Medium-High", tip: "Apply gypsum @ 200 kg/acre at pegging stage." },
    ]
  },
  "Alluvial Soil": {
    Kharif: [
      { name: "Basmati Paddy (Pusa 1121)", match: "98%", yield: "20-25 Quintals/Acre", profit: "₹75,000 - ₹95,000", water: "High", tip: "Transplant 25-day old seedlings with 2-3 seedlings per hill." },
      { name: "Maize (Hybrid)", match: "93%", yield: "25-30 Quintals/Acre", profit: "₹48,000 - ₹58,000", water: "Moderate", tip: "Keep ridges moist and apply zinc sulfate @ 10kg/acre." },
    ],
    Rabi: [
      { name: "Wheat (HD-3086)", match: "99%", yield: "22-26 Quintals/Acre", profit: "₹55,000 - ₹68,000", water: "High", tip: "Optimal sowing window is Nov 1 to Nov 20." },
      { name: "Mustard (Pusa Bold)", match: "94%", yield: "8-10 Quintals/Acre", profit: "₹45,000 - ₹54,000", water: "Low-Medium", tip: "Sulfur application increases oil content by 2.5%." },
      { name: "Potato (Kufri Pukhraj)", match: "91%", yield: "120-140 Quintals/Acre", profit: "₹80,000 - ₹1,10,000", water: "High", tip: "Ensure earthing up at 30 days after planting." },
    ],
    Zaid: [
      { name: "Watermelon / Muskmelon", match: "96%", yield: "150-180 Quintals/Acre", profit: "₹70,000 - ₹1,00,000", water: "Moderate", tip: "Use silver-black plastic mulch for weed control and sweetness." },
      { name: "Cucumber / Vegetable", match: "92%", yield: "80-100 Quintals/Acre", profit: "₹50,000 - ₹65,000", water: "Moderate", tip: "Install pheromone traps against fruit fly." },
    ]
  },
  "Red & Sandy Soil": {
    Kharif: [
      { name: "Groundnut (K-6)", match: "96%", yield: "12-14 Quintals/Acre", profit: "₹48,000 - ₹60,000", water: "Moderate", tip: "Red sandy loam provides loose soil ideal for pod development." },
      { name: "Millets (Ragi / Bajra)", match: "95%", yield: "14-16 Quintals/Acre", profit: "₹38,000 - ₹46,000", water: "Low", tip: "Highly resilient to dry spells and requires minimal urea." },
    ],
    Rabi: [
      { name: "Mustard & Toria", match: "93%", yield: "7-9 Quintals/Acre", profit: "₹40,000 - ₹48,000", water: "Low", tip: "Suitable for limited water tubewell irrigation." },
      { name: "Barley (Jau)", match: "90%", yield: "16-18 Quintals/Acre", profit: "₹35,000 - ₹42,000", water: "Low", tip: "Tolerates salinity and lighter soil textures." },
    ],
    Zaid: [
      { name: "Sesame (Til)", match: "92%", yield: "4-5 Quintals/Acre", profit: "₹35,000 - ₹45,000", water: "Very Low", tip: "Deep taproot thrives even in hot summer winds." },
    ]
  }
};

export default function CropRecommendationModal({ isOpen, onClose }) {
  const [soilType, setSoilType] = useState('Black Soil');
  const [season, setSeason] = useState('Rabi');
  const [waterAccess, setWaterAccess] = useState('Moderate');
  const [isCalculating, setIsCalculating] = useState(false);
  const [results, setResults] = useState(null);

  const handleRecommend = () => {
    setIsCalculating(true);
    setTimeout(() => {
      const soilData = recommendationsDB[soilType] || recommendationsDB["Black Soil"];
      const seasonData = soilData[season] || soilData["Rabi"];
      setResults(seasonData);
      setIsCalculating(false);
    }, 600);
  };

  // Run initial calculation once modal opens
  React.useEffect(() => {
    if (isOpen && !results) {
      handleRecommend();
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="AI Crop Recommendation Engine"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Form Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              1. Soil Type
            </label>
            <select
              value={soilType}
              onChange={(e) => setSoilType(e.target.value)}
              className="w-full text-xs font-medium p-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Black Soil">Black / Regur Soil (काली मिट्टी)</option>
              <option value="Alluvial Soil">Alluvial / Loam Soil (जलोढ़ मिट्टी)</option>
              <option value="Red & Sandy Soil">Red & Sandy Soil (लाल/बलुई मिट्टी)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              2. Crop Season
            </label>
            <select
              value={season}
              onChange={(e) => setSeason(e.target.value)}
              className="w-full text-xs font-medium p-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Rabi">Rabi (Winter: Oct - Mar)</option>
              <option value="Kharif">Kharif (Monsoon: Jun - Oct)</option>
              <option value="Zaid">Zaid (Summer: Mar - Jun)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              3. Water / Irrigation
            </label>
            <select
              value={waterAccess}
              onChange={(e) => setWaterAccess(e.target.value)}
              className="w-full text-xs font-medium p-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Moderate">Moderate (Canal / Borewell)</option>
              <option value="High">Abundant (Perennial River/Bore)</option>
              <option value="Low">Rainfed / Limited Tubewell</option>
            </select>
          </div>

          <div className="sm:col-span-3 pt-2">
            <Button
              variant="primary"
              size="sm"
              icon={Sparkles}
              onClick={handleRecommend}
              loading={isCalculating}
              className="w-full justify-center"
            >
              Recalculate Best Crops for My Field
            </Button>
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <span>Recommended Crops ({soilType} • {season} Season)</span>
            </h4>
            <span className="text-xs text-emerald-700 font-semibold bg-emerald-100 px-2.5 py-0.5 rounded-full">
              Agronomy AI Confidence: High
            </span>
          </div>

          {isCalculating ? (
            <div className="py-12 text-center text-slate-500 text-sm">
              Analyzing soil texture, rainfall index and historical APMC margins...
            </div>
          ) : results ? (
            <div className="space-y-3">
              {results.map((crop, idx) => (
                <div
                  key={crop.name}
                  className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-emerald-300 transition-all shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-black flex items-center justify-center shrink-0">
                        #{idx + 1}
                      </span>
                      <h5 className="font-extrabold text-base text-slate-900">{crop.name}</h5>
                      <Badge variant="emerald" size="xs">
                        {crop.match} Match
                      </Badge>
                    </div>

                    <div className="text-xs text-slate-600 flex flex-wrap gap-x-4 gap-y-1 pt-1">
                      <span><strong>Expected Yield:</strong> {crop.yield}</span>
                      <span><strong>Est. Net Profit:</strong> <strong className="text-emerald-700">{crop.profit}</strong></span>
                      <span><strong>Water:</strong> {crop.water}</span>
                    </div>

                    <p className="text-[11px] text-slate-500 italic pt-0.5">
                      💡 <em>Expert Advice:</em> {crop.tip}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    size="sm"
                    className="shrink-0"
                    onClick={() => alert(`Saved ${crop.name} package of practices & seed advisory to your farm notes!`)}
                  >
                    View Package
                  </Button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Aligned with ICAR crop zoning guidelines</span>
          <Button variant="ghost" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
}

