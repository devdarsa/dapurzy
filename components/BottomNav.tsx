'use client';

import React from 'react';
import { Home, Layers, ArrowLeftRight, ShoppingCart, Package } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 px-2 pb-1">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto bg-white/95 backdrop-blur-md border border-slate-200 h-13 sm:h-14 rounded-t-xl sm:rounded-xl flex items-center justify-around px-1 shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'dashboard' ? 'text-emerald-700 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Home className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Beranda</span>
        </button>

        <button
          onClick={() => setActiveTab('batch_laporan')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'batch_laporan' ? 'text-amber-600 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Batch</span>
        </button>

        <button
          onClick={() => setActiveTab('pergerakan')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'pergerakan' ? 'text-blue-600 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Pergerakan</span>
        </button>

        <button
          onClick={() => setActiveTab('penjualan')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'penjualan' ? 'text-emerald-600 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <ShoppingCart className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Penjualan</span>
        </button>

        <button
          onClick={() => setActiveTab('stok')}
          className={`flex flex-col items-center justify-center w-full h-full space-y-0.5 text-[9px] sm:text-[10px] font-bold transition cursor-pointer ${
            activeTab === 'stok' ? 'text-purple-600 font-black' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-4 h-4 sm:w-4.5 sm:h-4.5" />
          <span>Stok</span>
        </button>
      </div>
    </nav>
  );
}
