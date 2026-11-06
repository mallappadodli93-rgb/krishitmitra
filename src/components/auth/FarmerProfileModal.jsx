import React from 'react';
import { User, Phone, Mail, MapPin, Globe, LogOut, CheckCircle, ShieldCheck, Calendar } from 'lucide-react';
import Modal from '../common/Modal';
import Button from '../common/Button';

export default function FarmerProfileModal({ isOpen, onClose, user, onLogout }) {
  if (!user) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="My Farmer Profile (किसान प्रोफाइल)" maxWidth="max-w-md">
      <div className="space-y-5">
        
        {/* Profile Card Header */}
        <div className="flex items-center gap-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-200">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h4 className="font-extrabold text-lg text-slate-900 leading-tight">
              {user.name}
            </h4>
            <span className="inline-block mt-0.5 px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-md">
              Farmer ID: {user.farmerId || 'KM-2026-DEMO'}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="space-y-2.5 text-xs">
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-600" /> Mobile Number
            </span>
            <span className="font-bold text-slate-800">{user.mobile || '9876543210'}</span>
          </div>

          {user.email && (
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1.5">
                <Mail className="w-4 h-4 text-emerald-600" /> Email
              </span>
              <span className="font-bold text-slate-800">{user.email}</span>
            </div>
          )}

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> Village / District
            </span>
            <span className="font-bold text-slate-800">{user.village || 'Niphad'}, {user.district || 'Nashik'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-600" /> State
            </span>
            <span className="font-bold text-slate-800">{user.state || 'Maharashtra'}</span>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-slate-500 flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-emerald-600" /> Preferred Language
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {user.preferredLanguage || 'Marathi'}
            </span>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-3">
          <Button
            variant="danger"
            size="sm"
            icon={LogOut}
            onClick={() => {
              onLogout();
              onClose();
            }}
          >
            Logout
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>

      </div>
    </Modal>
  );
}
