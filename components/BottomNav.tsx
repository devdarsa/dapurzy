'use client';

import React from 'react';
import {
  Home,
  Users,
  TrendingUp,
  Layers,
} from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const navItems = [
    { id: 'dashboard', label: 'Beranda & Kas', icon: Home },
    { id: 'mitra', label: 'Mitra & Setoran', icon: Users },
    { id: 'revenue', label: 'Riwayat Pendapatan', icon: TrendingUp },
    { id: 'master', label: 'Batch & Master', icon: Layers },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-lg">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl mx-auto px-4 flex justify-around items-center h-15 sm:h-16">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center flex-1 py-1 transition cursor-pointer active:scale-95 ${
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
              <span className="text-[11px] sm:text-xs mt-0.5 leading-none">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

