'use client';

import React from 'react';
import {
  X,
  Home,
  Users,
  TrendingUp,
  Layers,
  PlusCircle,
  Trash2,
  Lock,
} from 'lucide-react';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCapitalModal: () => void;
  onOpenResetModal: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  onLockApp?: () => void;
}

export default function DrawerMenu({
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
  onOpenCapitalModal,
  onOpenResetModal,
  showToast,
  onLockApp,
}: DrawerMenuProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* BACKDROP */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      />

      {/* DRAWER CONTENT */}
      <div className="relative bg-white w-72 sm:w-80 h-full shadow-2xl p-4 sm:p-5 flex flex-col justify-between z-10 animate-in slide-in-from-left duration-200">
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="DAPURZY Logo"
                className="w-7 h-7 rounded-lg object-cover shadow-xs border border-amber-400"
              />
              <div>
                <h2 className="font-black text-base text-emerald-900 leading-tight">DAPURZY Ultra-Lean</h2>
                <p className="text-[10px] text-slate-500">Batch, Consignment & Auto-Sales</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1.5 text-xs font-bold text-slate-700">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-3 rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800 font-extrabold border border-emerald-200' : 'hover:bg-slate-50'
              }`}
            >
              <Home className="w-4.5 h-4.5 text-emerald-600" />
              <span>Beranda & Dompet Kas</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('mitra');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-3 rounded-xl transition cursor-pointer ${
                activeTab === 'mitra' ? 'bg-amber-50 text-amber-900 font-extrabold border border-amber-200' : 'hover:bg-slate-50'
              }`}
            >
              <Users className="w-4.5 h-4.5 text-amber-600" />
              <span>Mitra & Rekap Setoran</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('revenue');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-3 rounded-xl transition cursor-pointer ${
                activeTab === 'revenue' ? 'bg-emerald-50 text-emerald-900 font-extrabold border border-emerald-200' : 'hover:bg-slate-50'
              }`}
            >
              <TrendingUp className="w-4.5 h-4.5 text-emerald-600" />
              <span>Riwayat Pendapatan & Profit</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('master');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-3 rounded-xl transition cursor-pointer ${
                activeTab === 'master' ? 'bg-purple-50 text-purple-900 font-extrabold border border-purple-200' : 'hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4.5 h-4.5 text-purple-600" />
              <span>Batch Produksi & Master Produk</span>
            </button>
          </nav>
        </div>

        {/* BOTTOM UTILITY ACTIONS & FACTORY RESET DANGER ZONE */}
        <div className="space-y-2 border-t border-slate-100 pt-3 text-xs font-bold">
          <button
            onClick={() => {
              onOpenCapitalModal();
              onClose();
            }}
            className="w-full flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white p-2.5 rounded-xl shadow-xs active:scale-95 transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Injeksi Modal Usaha</span>
          </button>

          {onLockApp && (
            <button
              onClick={() => {
                onLockApp();
                onClose();
              }}
              className="w-full flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white p-2.5 rounded-xl shadow-xs active:scale-95 transition cursor-pointer"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Kunci Aplikasi (PIN Lock)</span>
            </button>
          )}

          <button
            onClick={() => {
              onOpenResetModal();
              onClose();
            }}
            className="w-full flex items-center space-x-2 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 p-2.5 rounded-xl active:scale-95 transition cursor-pointer"
          >
            <Trash2 className="w-4 h-4 text-rose-600" />
            <span>Hapus Semua Data 100%</span>
          </button>

          <p className="text-[9px] text-center text-slate-400 pt-1">
            DAPURZY Ultra-Lean PWA System • PIN Security Enabled
          </p>
        </div>
      </div>
    </div>
  );
}

