import React, { useState } from 'react';
import {
  Sprout,
  Phone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  KeyRound
} from 'lucide-react';
import Button from '../components/common/Button';
import ForgotPasswordModal from './ForgotPasswordModal';
import { loginFarmer, DEFAULT_DEMO_FARMER, getRegisteredFarmers } from '../utils/authStorage';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage({
  onNavigateRegister,
  onNavigateHome,
  onLoginSuccess,
  prefilledIdentifier = ''
}) {
  const { t, language } = useLanguage();
  const [identifier, setIdentifier] = useState(prefilledIdentifier || '');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [successUser, setSuccessUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);

  // Validate form with JavaScript
  const validateForm = () => {
    const newErrors = {};

    if (!identifier.trim()) {
      newErrors.identifier = 'Please enter your registered mobile number or email.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setServerError('');

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginFarmer(identifier, password);
      setIsSubmitting(false);

      if (!result.success) {
        setServerError(result.message);
        return;
      }

      setSuccessUser(result.farmer);
      setTimeout(() => {
        onLoginSuccess?.(result.farmer);
      }, 1000);
    }, 600);
  };

  // Instant 1-Click Demo Login using pre-seeded farmer
  const handleQuickDemoLogin = (farmer = DEFAULT_DEMO_FARMER) => {
    setIdentifier(farmer.mobile);
    setPassword(farmer.password);
    setServerError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const result = loginFarmer(farmer.mobile, farmer.password);
      setIsSubmitting(false);
      if (result.success) {
        setSuccessUser(result.farmer);
        setTimeout(() => {
          onLoginSuccess?.(result.farmer);
        }, 800);
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      
      {/* Top Bar / Back Navigation */}
      <div className="max-w-md mx-auto w-full mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('dashBackHome')}</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          {language === 'kn' ? 'ರೈತ ಪೋರ್ಟಲ್ ಲಾಗಿನ್' : language === 'hi' ? 'किसान पोर्टल लॉगिन' : 'Farmer Portal Sign In'}
        </span>
      </div>

      {/* Main Login Card */}
      <div className="max-w-md mx-auto w-full bg-white rounded-3xl shadow-xl border border-emerald-100 p-6 sm:p-9 relative overflow-hidden">
        
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-44 h-44 bg-emerald-100/40 rounded-full blur-2xl pointer-events-none -z-0" />

        <div className="relative z-10">
          
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-emerald-600/30">
              <Sprout className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              Welcome to <span className="text-emerald-600">KrishiMitra</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Sign in to access your farm advisory, disease doctor & live mandi prices.
            </p>
          </div>

          {/* Quick Demo Login Option */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200 flex items-center justify-between gap-3">
            <div className="text-xs">
              <span className="font-extrabold text-emerald-900 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Demo Access</span>
              </span>
              <span className="text-[11px] text-emerald-700">
                Log in instantly as Ramesh Patel ({DEFAULT_DEMO_FARMER.mobile})
              </span>
            </div>
            <button
              type="button"
              onClick={() => handleQuickDemoLogin()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow-sm shrink-0 active:scale-95"
            >
              1-Click Login
            </button>
          </div>

          {/* Success Banner */}
          {successUser ? (
            <div className="py-6 text-center space-y-3 animate-in fade-in zoom-in-95">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 animate-bounce" />
              </div>
              <h3 className="text-lg font-bold text-slate-800">
                Welcome back, {successUser.name}!
              </h3>
              <p className="text-xs text-slate-500">
                Farmer ID: <strong>{successUser.farmerId}</strong> • {successUser.village}, {successUser.district}
              </p>
              <p className="text-xs text-emerald-700 font-semibold">
                Opening your smart farming dashboard...
              </p>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {serverError && (
                <div className="mb-5 p-3.5 bg-red-50 border border-red-200 rounded-2xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                
                {/* Mobile or Email */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mobile Number or Email (मोबाइल या ईमेल) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210 or farmer@gmail.com"
                      value={identifier}
                      onChange={(e) => {
                        setIdentifier(e.target.value);
                        if (errors.identifier) setErrors({ ...errors, identifier: '' });
                        if (serverError) setServerError('');
                      }}
                      className={`w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition ${
                        errors.identifier ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-emerald-500'
                      }`}
                    />
                  </div>
                  {errors.identifier && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.identifier}</p>
                  )}
                </div>

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Password (पासवर्ड) <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsForgotModalOpen(true)}
                      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors({ ...errors, password: '' });
                        if (serverError) setServerError('');
                      }}
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
                  {errors.password && (
                    <p className="text-[11px] text-red-600 font-medium mt-1">{errors.password}</p>
                  )}
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={isSubmitting}
                    icon={ArrowRight}
                    iconPosition="right"
                    className="w-full justify-center shadow-emerald-600/25 shadow-lg"
                  >
                    {language === 'kn' ? 'ಕೃಷಿಮಿತ್ರ ಲಾಗಿನ್ ಮಾಡಿ' : language === 'hi' ? 'कृषिमित्र में लॉगिन करें' : 'Login to KrishiMitra'}
                  </Button>
                </div>

              </form>

              {/* Register Option */}
              <div className="text-center pt-6 mt-6 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
                {language === 'kn' ? 'ಹೊಸ ರೈತರಾಗಿದ್ದೀರಾ? ' : language === 'hi' ? 'नए किसान हैं? ' : 'New to KrishiMitra? '}
                <button
                  type="button"
                  onClick={onNavigateRegister}
                  className="font-bold text-emerald-700 hover:text-emerald-800 underline transition ml-1"
                >
                  {language === 'kn' ? 'ರೈತ ಖಾತೆ ರಚಿಸಿ (ನೋಂದಣಿ)' : language === 'hi' ? 'नया किसान खाता बनाएं (पंजीकरण)' : 'Create Farmer Account (Register)'}
                </button>
              </div>

              {/* Trust Badge */}
              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-slate-400 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encrypted offline storage via HTML5 LocalStorage</span>
              </div>
            </>
          )}

        </div>
      </div>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        onPasswordResetSuccess={(id) => {
          setIdentifier(id);
        }}
      />

    </div>
  );
}

