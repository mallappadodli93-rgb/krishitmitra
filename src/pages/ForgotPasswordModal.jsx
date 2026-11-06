import React, { useState } from 'react';
import { KeyRound, Phone, Lock, CheckCircle2, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { resetFarmerPassword } from '../utils/authStorage';

export default function ForgotPasswordModal({ isOpen, onClose, onPasswordResetSuccess }) {
  const [step, setStep] = useState(1); // 1: Enter mobile/email, 2: Enter OTP & new password
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setError('');
    const clean = identifier.trim();
    if (!clean) {
      setError('Please enter your registered mobile number or email.');
      return;
    }
    // Simulate OTP sent
    setStep(2);
    setOtp('1234'); // Auto-filled for convenient demo testing
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    setError('');

    if (otp !== '1234' && otp.length < 4) {
      setError('Please enter a valid 4-digit verification OTP (Demo OTP: 1234)');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      return;
    }

    const res = resetFarmerPassword(identifier, newPassword);
    if (!res.success) {
      setError(res.message);
      return;
    }

    setSuccess(res.message);
    setTimeout(() => {
      onPasswordResetSuccess?.(identifier);
      handleClose();
    }, 1500);
  };

  const handleClose = () => {
    setStep(1);
    setIdentifier('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccess('');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Reset Farmer Account Password" maxWidth="max-w-md">
      <div className="space-y-5">
        {success ? (
          <div className="p-6 text-center space-y-3">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-lg text-slate-800">Password Reset Complete</h4>
            <p className="text-xs text-slate-600">{success}</p>
          </div>
        ) : (
          <>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <p className="text-xs text-slate-600">
                  Enter your registered mobile number or email address. We will verify your account with an SMS OTP.
                </p>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Registered Mobile or Email
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="e.g. 9876543210 or ramesh.farmer@gmail.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  className="w-full justify-center"
                  icon={ArrowRight}
                  iconPosition="right"
                >
                  Send Verification Code (OTP)
                </Button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-3.5">
                <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-800 flex items-center justify-between">
                  <span>Demo OTP auto-filled: <strong>1234</strong></span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">Auto</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    4-Digit OTP Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="w-full text-center tracking-widest text-base font-bold py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="At least 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={() => setStep(1)}
                    className="flex-1 justify-center"
                  >
                    Back
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    size="md"
                    className="flex-1 justify-center"
                  >
                    Set New Password
                  </Button>
                </div>
              </form>
            )}

            <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-[11px] text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Direct farmer authentication via LocalStorage</span>
            </div>
          </>
        )}
      </div>
    </Modal>
  );
}

