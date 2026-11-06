import React, { useState } from 'react';
import {
  Sprout,
  User,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  MapPin,
  Globe,
  Building,
  Home,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft
} from 'lucide-react';
import Button from '../components/common/Button';
import { registerFarmer } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';

const INDIAN_STATES = [
  'Maharashtra',
  'Punjab',
  'Haryana',
  'Madhya Pradesh',
  'Uttar Pradesh',
  'Gujarat',
  'Rajasthan',
  'Bihar',
  'Karnataka',
  'Andhra Pradesh',
  'Telangana',
  'Tamil Nadu',
  'West Bengal',
  'Odisha',
  'Chhattisgarh',
  'Jharkhand',
  'Himachal Pradesh',
  'Uttarakhand',
  'Assam'
];

const PREFERRED_LANGUAGES = [
  { value: 'Hindi', label: 'हिन्दी (Hindi)' },
  { value: 'English', label: 'English' },
  { value: 'Marathi', label: 'मराठी (Marathi)' },
  { value: 'Punjabi', label: 'ਪੰਜਾਬੀ (Punjabi)' },
  { value: 'Gujarati', label: 'ગુજરાતી (Gujarati)' },
  { value: 'Telugu', label: 'తెలుగు (Telugu)' },
  { value: 'Kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { value: 'Bengali', label: 'বাংলা (Bengali)' },
  { value: 'Tamil', label: 'தமிழ் (Tamil)' },
];

export default function RegisterPage({ onNavigateLogin, onNavigateHome, onRegisterSuccess }) {
  const { t, language } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    password: '',
    village: '',
    district: '',
    state: 'Maharashtra',
    preferredLanguage: 'Hindi'
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  // Validate form using pure JavaScript
  const validateForm = () => {
    const newErrors = {};

    // 1. Farmer Name
    if (!formData.name.trim()) {
      newErrors.name = 'Farmer name is required.';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters.';
    }

    // 2. Mobile Number (10 digits starting with 6,7,8,9)
    const mobilePattern = /^[6-9]\d{9}$/;
    const cleanMobile = formData.mobile.trim();
    if (!cleanMobile) {
      newErrors.mobile = 'Mobile number is required.';
    } else if (!mobilePattern.test(cleanMobile)) {
      newErrors.mobile = 'Enter a valid 10-digit Indian mobile number (e.g. 9876543210).';
    }

    // 3. Email (optional, but if provided must be valid format)
    if (formData.email.trim()) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(formData.email.trim())) {
        newErrors.email = 'Enter a valid email address.';
      }
    }

    // 4. Password
    if (!formData.password) {
      newErrors.password = 'Password is required.';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    // 5. Village
    if (!formData.village.trim()) {
      newErrors.village = 'Village / Gram Panchayat is required.';
    }

    // 6. District
    if (!formData.district.trim()) {
      newErrors.district = 'District is required.';
    }

    // 7. State
    if (!formData.state) {
      newErrors.state = 'Please select your state.';
    }

    // 8. Preferred Language
    if (!formData.preferredLanguage) {
      newErrors.preferredLanguage = 'Please select your preferred language.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear field-specific error as user types
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
    if (serverError) setServerError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = registerFarmer(formData);
      setIsSubmitting(false);

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      // Success
      setSuccessInfo(result.farmer);
      setTimeout(() => {
        onRegisterSuccess?.(result.farmer);
      }, 1600);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-10 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar / Back Navigation */}
      <div className="max-w-xl mx-auto w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('dashBackHome')}</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          {language === 'kn' ? 'ಹೊಸ ರೈತರ ನೋಂದಣಿ' : language === 'hi' ? 'नया किसान पंजीकरण' : 'New Farmer Registration'}
        </span>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-xl mx-auto w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-10 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-100/50 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-emerald-600/30">
              <Sprout className="w-8 h-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Register with <span className="text-emerald-600">KrishiMitra</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Join 1.2 Lakh+ Indian farmers receiving smart crop, weather & mandi guidance.
            </p>
          </div>

          {/* Success Banner */}
          {successInfo ? (
            <div className="py-8 text-center space-y-4 animate-in fade-in zoom-in-95">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 animate-bounce" />
              </div>
              <h3 className="text-xl font-bold text-slate-800">
                Registration Successful!
              </h3>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 max-w-sm mx-auto text-left space-y-1">
                <p><strong>Farmer Name:</strong> {successInfo.name}</p>
                <p><strong>Farmer ID:</strong> <span className="font-mono font-bold text-emerald-700">{successInfo.farmerId}</span></p>
                <p><strong>Mobile:</strong> {successInfo.mobile}</p>
                <p><strong>Location:</strong> {successInfo.village}, {successInfo.district}, {successInfo.state}</p>
              </div>
              <p className="text-xs text-slate-500">
                Data saved in LocalStorage. Logging you into KrishiMitra...
              </p>
            </div>
          ) : (
            <>
              {/* Server / General Error Alert */}
              {serverError && (
                <div className="mb-6 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* 1. Farmer Name */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Farmer Name (किसान का पूरा नाम) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. Rameshwar Patil"
                      value={formData.name}
                      onChange={(e) => handleChange('name', e.target.value)}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                        errors.name ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {errors.name && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.name}</p>}
                </div>

                {/* 2 & 3. Mobile Number & Email Address (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Mobile */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Mobile Number (मोबाइल नंबर) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        maxLength={10}
                        placeholder="10-digit number"
                        value={formData.mobile}
                        onChange={(e) => handleChange('mobile', e.target.value.replace(/\D/g, ''))}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.mobile ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    {errors.mobile && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.mobile}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address (वैकल्पिक ईमेल)
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        placeholder="farmer@gmail.com"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.email ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.email}</p>}
                  </div>
                </div>

                {/* 4. Password */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Create Password (पासवर्ड) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimum 6 characters"
                      value={formData.password}
                      onChange={(e) => handleChange('password', e.target.value)}
                      className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                        errors.password ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>}
                </div>

                {/* 5 & 6. Village and District (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Village */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Village / Gram (गाँव/ग्राम) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Home className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Niphad"
                        value={formData.village}
                        onChange={(e) => handleChange('village', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.village ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    {errors.village && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.village}</p>}
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      District (ज़िला) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="e.g. Nashik"
                        value={formData.district}
                        onChange={(e) => handleChange('district', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.district ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      />
                    </div>
                    {errors.district && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.district}</p>}
                  </div>
                </div>

                {/* 7 & 8. State and Preferred Language (Grid) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* State */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      State (राज्य) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.state}
                        onChange={(e) => handleChange('state', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.state ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      >
                        {INDIAN_STATES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.state && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.state}</p>}
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Preferred Language (पसंदीदा भाषा) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <select
                        value={formData.preferredLanguage}
                        onChange={(e) => handleChange('preferredLanguage', e.target.value)}
                        className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                          errors.preferredLanguage ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                        }`}
                      >
                        {PREFERRED_LANGUAGES.map((lang) => (
                          <option key={lang.value} value={lang.value}>
                            {lang.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.preferredLanguage && <p className="text-[11px] text-red-600 font-medium mt-1">{errors.preferredLanguage}</p>}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full justify-center shadow-emerald-600/25 shadow-lg"
                  >
                    Register as Farmer (पंजीकरण करें)
                  </Button>
                </div>

              </form>

              {/* Toggle to Login */}
              <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                Already registered with KrishiMitra?{' '}
                <button
                  type="button"
                  onClick={onNavigateLogin}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline transition ml-1"
                >
                  Sign In to Your Account
                </button>
              </div>

              {/* Trust Badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>100% Free & Secure • Data saved locally on your device</span>
              </div>
            </>
          )}

        </div>
      </div>

    </div>
  );
}

