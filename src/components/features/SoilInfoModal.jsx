import React, { useState } from 'react';
import { Sprout, Droplets, Info, CheckCircle2, Calculator } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

export default function SoilInfoModal({ isOpen, onClose }) {
  const [crop, setCrop] = useState('Wheat');
  const [acres, setAcres] = useState(2);
  const [soilNitrogen, setSoilNitrogen] = useState('Medium');
  const [soilPhosphorus, setSoilPhosphorus] = useState('Medium');
  const [soilPotash, setSoilPotash] = useState('Medium');

  // Baseline bag calculations per acre
  const calculateBags = () => {
    let ureaBase = 2.5;
    let dapBase = 1.0;
    let mopBase = 0.8;

    if (crop === 'Rice') {
      ureaBase = 3.0;
      dapBase = 1.2;
      mopBase = 0.8;
    } else if (crop === 'Cotton') {
      ureaBase = 3.5;
      dapBase = 1.5;
      mopBase = 1.0;
    } else if (crop === 'Sugarcane') {
      ureaBase = 6.0;
      dapBase = 2.5;
      mopBase = 2.0;
    } else if (crop === 'Soybean') {
      ureaBase = 0.8; // legume fixes nitrogen
      dapBase = 1.5;
      mopBase = 0.8;
    }

    const totalUrea = Math.round(ureaBase * acres * 10) / 10;
    const totalDap = Math.round(dapBase * acres * 10) / 10;
    const totalMop = Math.round(mopBase * acres * 10) / 10;

    return { totalUrea, totalDap, totalMop };
  };

  const { totalUrea, totalDap, totalMop } = calculateBags();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Soil Information & Fertilizer Dosage Calculator"
      maxWidth="max-w-2xl"
    >
      <div className="space-y-6">
        {/* Intro */}
        <p className="text-xs text-slate-600 leading-relaxed">
          Balanced N-P-K nutrition prevents soil acidification and cuts input waste. Tailored for your farm acreage based on ICAR fertilizer schedules.
        </p>

        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-emerald-50/60 rounded-2xl border border-emerald-100">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Select Your Target Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              className="w-full text-xs font-semibold p-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="Wheat">Wheat (गेहूं)</option>
              <option value="Rice">Paddy / Rice (धान)</option>
              <option value="Cotton">Cotton / Kapas (कपास)</option>
              <option value="Soybean">Soybean (सोयाबीन)</option>
              <option value="Sugarcane">Sugarcane (गन्ना)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Cultivated Area (Acres)
            </label>
            <input
              type="number"
              min="0.5"
              step="0.5"
              max="100"
              value={acres}
              onChange={(e) => setAcres(Math.max(0.5, parseFloat(e.target.value) || 1))}
              className="w-full text-xs font-semibold p-2 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Output Bag Cards */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
            <Calculator className="w-4 h-4 text-emerald-600" />
            <span>Recommended Fertilizer Bags for {acres} Acres of {crop}:</span>
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Urea */}
            <div className="p-4 bg-white rounded-2xl border-2 border-emerald-500/50 shadow-sm text-center">
              <span className="text-[11px] font-bold text-emerald-800 uppercase block">Nitrogen (N)</span>
              <span className="text-2xl font-black text-slate-900 my-1 block">{totalUrea} Bags</span>
              <span className="text-xs text-slate-500">Urea (45 kg bag)</span>
              <p className="text-[11px] text-emerald-700 font-medium mt-2 pt-2 border-t border-slate-100">
                Split in 2-3 top dressings at irrigation intervals
              </p>
            </div>

            {/* DAP */}
            <div className="p-4 bg-white rounded-2xl border-2 border-amber-500/50 shadow-sm text-center">
              <span className="text-[11px] font-bold text-amber-800 uppercase block">Phosphorus (P)</span>
              <span className="text-2xl font-black text-slate-900 my-1 block">{totalDap} Bags</span>
              <span className="text-xs text-slate-500">DAP (50 kg bag)</span>
              <p className="text-[11px] text-amber-700 font-medium mt-2 pt-2 border-t border-slate-100">
                Apply 100% as basal dose at time of sowing
              </p>
            </div>

            {/* MOP */}
            <div className="p-4 bg-white rounded-2xl border-2 border-blue-500/50 shadow-sm text-center">
              <span className="text-[11px] font-bold text-blue-800 uppercase block">Potash (K)</span>
              <span className="text-2xl font-black text-slate-900 my-1 block">{totalMop} Bags</span>
              <span className="text-xs text-slate-500">MOP (50 kg bag)</span>
              <p className="text-[11px] text-blue-700 font-medium mt-2 pt-2 border-t border-slate-100">
                Improves grain weight and disease resistance
              </p>
            </div>
          </div>
        </div>

        {/* Biofertilizer tip */}
        <div className="p-3.5 bg-green-50 rounded-2xl border border-green-200 text-xs text-green-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-green-600" />
            <span>Organic & Soil Health Tip</span>
          </div>
          <p>
            Incorporate 2-3 tonnes of Farm Yard Manure (FYM) or Vermicompost per acre along with biofertilizers like <strong>PSB (Phosphate Solubilizing Bacteria)</strong> to save up to 20% on chemical DAP expense.
          </p>
        </div>

        {/* Modal actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-400">Soil Health Card Portal Compatible</span>
          <Button variant="primary" size="sm" onClick={onClose}>
            Got it, Thank You
          </Button>
        </div>
      </div>
    </Modal>
  );
}

