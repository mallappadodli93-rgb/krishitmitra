import React, { useState } from 'react';
import { Upload, Scan, CheckCircle, AlertTriangle, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';

const sampleCrops = [
  {
    id: 'wheat-rust',
    name: 'Wheat (Gehun)',
    disease: 'Yellow / Stripe Rust (Puccinia striiformis)',
    status: 'Infected',
    severity: 'High',
    confidence: '96.4%',
    thumbnail: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=200&auto=format&fit=crop&q=80',
    symptoms: 'Yellow-orange pustules arranged in linear stripes on leaf blades, powdery spores on fingers.',
    organicSolution: 'Spray neem cake extract (5%) or sour buttermilk (chaach) spray @ 50ml/L at early onset.',
    chemicalSolution: 'Foliar spray of Propiconazole 25% EC (Tilt) @ 1 ml/litre of water immediately.',
    preventiveTip: 'Use resistant seed varieties like HD-2967, DBW-187 and avoid excessive early nitrogen application.'
  },
  {
    id: 'tomato-blight',
    name: 'Tomato (Tamatar)',
    disease: 'Early Blight (Alternaria solani)',
    status: 'Infected',
    severity: 'Medium',
    confidence: '94.2%',
    thumbnail: 'https://images.unsplash.com/photo-1592841200221-a6898f307baa?w=200&auto=format&fit=crop&q=80',
    symptoms: 'Concentric dark brown circular spots ("bullseye pattern") on older leaves, yellow halo around lesions.',
    organicSolution: 'Apply Trichoderma viride @ 5g/L with cow urine solution (10%) to build fungal defense.',
    chemicalSolution: 'Spray Mancozeb 75% WP @ 2.5g/L or Azoxystrobin 23% SC @ 1 ml/L.',
    preventiveTip: 'Mulch soil with straw to prevent soil splashing onto lower foliage during watering.'
  },
  {
    id: 'healthy-rice',
    name: 'Paddy / Rice (Dhan)',
    disease: 'Healthy Crop – No Disease Detected',
    status: 'Healthy',
    severity: 'None',
    confidence: '99.1%',
    thumbnail: 'https://images.unsplash.com/photo-1536657464919-892534f60d6e?w=200&auto=format&fit=crop&q=80',
    symptoms: 'Vibrant green canopy, uniform tiller density, no leaf blast spots or sheath blight lesions.',
    organicSolution: 'Maintain balanced micronutrient spray (Zinc sulfate 0.5% + Urea 1%) during panicle initiation.',
    chemicalSolution: 'No fungicides required. Maintain proper water level of 2-3 cm in paddy field.',
    preventiveTip: 'Ensure alternate wetting and drying (AWD) irrigation to improve root aeration and reduce methane.'
  }
];

export default function CropScannerDemoModal({ isOpen, onClose }) {
  const [selectedCrop, setSelectedCrop] = useState(sampleCrops[0]);
  const [isScanning, setIsScanning] = useState(false);
  const [analyzed, setAnalyzed] = useState(true);
  const [customImage, setCustomImage] = useState(null);

  const handleSelectSample = (crop) => {
    setSelectedCrop(crop);
    setCustomImage(null);
    triggerScanAnimation();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setCustomImage(url);
      triggerScanAnimation();
    }
  };

  const triggerScanAnimation = () => {
    setIsScanning(true);
    setAnalyzed(false);
    setTimeout(() => {
      setIsScanning(false);
      setAnalyzed(true);
    }, 1200);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="AI Crop Doctor – Instant Diagnosis" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Sample selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
            Step 1: Choose a sample leaf or upload photo
          </label>
          <div className="grid grid-cols-3 gap-3">
            {sampleCrops.map((crop) => (
              <button
                key={crop.id}
                type="button"
                onClick={() => handleSelectSample(crop)}
                className={`relative rounded-xl overflow-hidden border-2 text-left p-2 transition flex flex-col items-center gap-1.5 ${
                  selectedCrop.id === crop.id && !customImage
                    ? 'border-emerald-600 bg-emerald-50/70 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <img
                  src={crop.thumbnail}
                  alt={crop.name}
                  className="w-full h-16 object-cover rounded-lg"
                />
                <span className="text-xs font-semibold text-slate-800 text-center leading-tight truncate w-full">
                  {crop.name}
                </span>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  crop.status === 'Healthy' ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {crop.status}
                </span>
              </button>
            ))}
          </div>

          {/* Upload trigger */}
          <div className="mt-3">
            <label className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-emerald-300 rounded-xl bg-emerald-50/50 hover:bg-emerald-50 cursor-pointer transition text-xs font-semibold text-emerald-800">
              <Upload className="w-4 h-4 text-emerald-600" />
              <span>Or click here to upload photo from your farm</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {/* Scan & Results Area */}
        <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Scan className="w-4 h-4 text-emerald-600" />
              AI Visual Diagnostics
            </span>
            <span className="text-xs text-slate-500">
              Model: <strong className="text-slate-700">AgriVision-v3.2</strong>
            </span>
          </div>

          {isScanning ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
              <p className="text-sm font-semibold text-emerald-800 animate-pulse">
                Analyzing leaf texture, chlorosis & lesion patterns...
              </p>
            </div>
          ) : analyzed ? (
            <div className="space-y-4 animate-in fade-in duration-300">
              {/* Diagnosis Header */}
              <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                selectedCrop.status === 'Healthy'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-amber-50/90 border-amber-200 text-amber-950'
              }`}>
                <div>
                  <div className="flex items-center gap-2">
                    {selectedCrop.status === 'Healthy' ? (
                      <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    )}
                    <h4 className="font-bold text-base">{selectedCrop.disease}</h4>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Crop: <strong>{selectedCrop.name}</strong> • Severity: <strong>{selectedCrop.severity}</strong>
                  </p>
                </div>

                <div className="text-right sm:border-l sm:pl-4 sm:border-amber-200">
                  <span className="text-[11px] uppercase tracking-wider font-semibold text-slate-500 block">
                    Confidence
                  </span>
                  <span className="text-lg font-extrabold text-emerald-700">
                    {selectedCrop.confidence}
                  </span>
                </div>
              </div>

              {/* Symptoms */}
              <div className="text-xs space-y-1">
                <span className="font-bold text-slate-700">Observed Symptoms:</span>
                <p className="text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                  {selectedCrop.symptoms}
                </p>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-green-50/80 rounded-xl border border-green-200">
                  <span className="font-bold text-green-900 flex items-center gap-1 mb-1">
                    <Sparkles className="w-3.5 h-3.5 text-green-600" />
                    Organic / Bio Remedy
                  </span>
                  <p className="text-green-800 leading-relaxed">
                    {selectedCrop.organicSolution}
                  </p>
                </div>

                <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200">
                  <span className="font-bold text-blue-900 flex items-center gap-1 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-blue-600" />
                    Chemical Recommendation
                  </span>
                  <p className="text-blue-800 leading-relaxed">
                    {selectedCrop.chemicalSolution}
                  </p>
                </div>
              </div>

              {/* Preventive tip */}
              <div className="text-[11px] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-200">
                💡 <strong>Agronomist Tip:</strong> {selectedCrop.preventiveTip}
              </div>
            </div>
          ) : null}
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <Button
            variant="ghost"
            size="sm"
            icon={RefreshCw}
            onClick={triggerScanAnimation}
          >
            Re-analyze
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={onClose}
          >
            Done / Close Doctor
          </Button>
        </div>
      </div>
    </Modal>
  );
}

