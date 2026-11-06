import React, { useState } from 'react';
import { User, Lock, Phone, Mail, ArrowRight, ShieldCheck, CheckCircle } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function AuthModal({ isOpen, onClose, onLoginSuccess }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    state: 'Maharashtra',
  });
  const [demoSuccess, setDemoSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = {
      name: formData.name || (isRegister ? 'Kisan Bhai' : 'Ramesh Patel'),
      phone: formData.phone || '9876543210',
      isLoggedIn: true
    };
    setDemoSuccess(true);
    setTimeout(() => {
      onLoginSuccess(user);
      setDemoSuccess(false);
      onClose();
    }, 800);
  };

  const handleDemoLogin = () => {
    const demoUser = {
      name: 'Ramesh Patel',
      phone: '9876543210',
      location: 'Nashik, Maharashtra',
      isLoggedIn: true
    };
    setDemoSuccess(true);
    setTimeout(() => {
      onLoginSuccess(demoUser);
      setDemoSuccess(false);
      onClose();
    }, 700);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isRegister ? "Join KrishiMitra as a Farmer" : "Farmer Login"}
      maxWidth="max-w-md"
    >
      {demoSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-10 h-10 animate-bounce" />
          </div>
          <h4 className="text-xl font-bold text-slate-800">
            {isRegister ? "Registration Successful!" : "Welcome back to KrishiMitra!"}
          </h4>
          <p className="text-sm text-slate-500">Redirecting to your smart farming dashboard...</p>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-2xl">
            <button
              type="button"
              onClick={() => setIsRegister(false)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                !isRegister
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsRegister(true)}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
                isRegister
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              New Registration
            </button>
          </div>

          {/* Quick Demo Login Pill */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between gap-2">
            <div className="text-xs">
              <span className="font-bold text-emerald-900 block">Quick Access</span>
              <span className="text-emerald-700 text-[11px]">Instant test login without password</span>
            </div>
            <button
              type="button"
              onClick={handleDemoLogin}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg transition shrink-0"
            >
              1-Click Demo Login
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Full Name (किसान का नाम)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Mobile Number or Email
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. 9876543210 or farmer@gmail.com"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {isRegister && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Primary State / Region
                </label>
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Maharashtra">Maharashtra</option>
                  <option value="Punjab">Punjab</option>
                  <option value="Haryana">Haryana</option>
                  <option value="Madhya Pradesh">Madhya Pradesh</option>
                  <option value="Gujarat">Gujarat</option>
                  <option value="Uttar Pradesh">Uttar Pradesh</option>
                  <option value="Rajasthan">Rajasthan</option>
                  <option value="Bihar">Bihar</option>
                  <option value="Karnataka">Karnataka</option>
                </select>
              </div>
            )}

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full mt-4 justify-center"
              icon={ArrowRight}
              iconPosition="right"
            >
              {isRegister ? "Create Free Account" : "Sign In to Farm"}
            </Button>
          </form>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-2 border-t border-slate-100">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Govt-backed secure farmer data encryption</span>
          </div>
        </div>
      )}
    </Modal>
  );
}

