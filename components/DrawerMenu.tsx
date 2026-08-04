'use client';

import React from 'react';
import {
  X,
  Home,
  Layers,
  ArrowLeftRight,
  ShoppingCart,
  Package,
  FileText,
  Database,
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
                <h2 className="font-black text-base text-emerald-900 leading-tight">DAPURZY v1.2</h2>
                <p className="text-[10px] text-slate-500">Batch HPP & Consignment Engine</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <nav className="space-y-1 text-xs font-bold text-slate-700">
            <button
              onClick={() => {
                setActiveTab('dashboard');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'dashboard' ? 'bg-emerald-50 text-emerald-800 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-emerald-600" />
              <span>Beranda Dashboard</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('batch_laporan');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'batch_laporan' ? 'bg-amber-50 text-amber-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <Layers className="w-4 h-4 text-amber-600" />
              <span>Batch Belanja & Laporan</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('produksi');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'produksi' ? 'bg-purple-50 text-purple-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-purple-600" />
              <span>Modul Produksi & HPP</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('pergerakan');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'pergerakan' ? 'bg-blue-50 text-blue-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
              <span>Pergerakan Stok Konsinyasi</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('penjualan');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'penjualan' ? 'bg-emerald-50 text-emerald-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
              <span>Penjualan Direct & Mitra</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('stok');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'stok' ? 'bg-purple-50 text-purple-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <Package className="w-4 h-4 text-purple-600" />
              <span>Stok Real-Time Multi-Lokasi</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('traceability');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'traceability' ? 'bg-emerald-50 text-emerald-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4 h-4 text-emerald-600" />
              <span>Audit Keuangan & Export WA</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('master');
                onClose();
              }}
              className={`w-full flex items-center space-x-2.5 p-2.5 rounded-xl transition cursor-pointer ${
                activeTab === 'master' ? 'bg-slate-100 text-slate-900 font-extrabold' : 'hover:bg-slate-50'
              }`}
            >
              <Database className="w-4 h-4 text-slate-600" />
              <span>Master Data (Produk & Mitra)</span>
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
              <span>Kunci Application & Purge Cache</span>
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
            DAPURZY Blueprint v1.2 PWA System • Masa Aktif PIN 3 Hari
          </p>
        </div>
      </div>
    </div>
  );
}
