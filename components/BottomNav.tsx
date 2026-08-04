'use client';

import React from 'react';
import {
  Home,
  Users,
  TrendingUp,
  Layers,
  Plus,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPurchaseModal: () => void;
}

export default function BottomNav({
  activeTab,
  setActiveTab,
  onOpenPurchaseModal,
}: BottomNavProps) {
  const leftItems = [
    { id: 'dashboard', label: 'Beranda', icon: Home },
    { id: 'mitra', label: 'Mitra', icon: Users },
  ];

  const rightItems = [
    { id: 'revenue', label: 'Pendapatan', icon: TrendingUp },
    { id: 'master', label: 'Master', icon: Layers },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-2 sm:px-4 flex justify-between items-center h-15 sm:h-16 relative">
        {/* LEFT NAV ITEMS (Beranda & Mitra) */}
        <div className="flex flex-1 justify-around items-center">
          {leftItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer active:scale-95 min-w-0 ${
                  isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isActive ? 'bg-emerald-100/90 text-emerald-800' : 'bg-transparent'
                  }`}
                >
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 leading-none whitespace-nowrap truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* CENTER FLOATING ACTION BUTTON (MODERN FLOATING FAB + BELANJA BAHAN) */}
        <div className="relative -top-4 flex flex-col items-center justify-center px-2">
          <button
            onClick={onOpenPurchaseModal}
            title="Tambah Batch Belanja Bahan"
            aria-label="Tambah Batch Belanja Bahan"
            className="w-12 h-12 sm:w-13 sm:h-13 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-amber-950 font-black shadow-lg shadow-amber-500/40 ring-4 ring-white flex items-center justify-center active:scale-90 transition transform cursor-pointer shrink-0"
          >
            <Plus className="w-7 h-7 stroke-[3.2]" />
          </button>
          <span className="text-[9px] sm:text-[10px] font-black text-amber-800 mt-0.5 tracking-tight whitespace-nowrap">
            + Belanja
          </span>
        </div>

        {/* RIGHT NAV ITEMS (Pendapatan & Master) */}
        <div className="flex flex-1 justify-around items-center">
          {rightItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer active:scale-95 min-w-0 ${
                  isActive ? 'text-emerald-700 font-extrabold' : 'text-slate-500 hover:text-slate-800 font-medium'
                }`}
              >
                <div
                  className={`p-1.5 rounded-xl transition ${
                    isActive ? 'bg-emerald-100/90 text-emerald-800' : 'bg-transparent'
                  }`}
                >
                  <IconComponent className="w-5 h-5 stroke-[2.2]" />
                </div>
                <span className="text-[10px] sm:text-xs mt-0.5 leading-none whitespace-nowrap truncate max-w-full">
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
