'use client';

import React from 'react';
import { Menu, Plus } from 'lucide-react';

interface NavbarProps {
  onOpenDrawer: () => void;
  onOpenPurchaseModal: () => void;
}

export default function Navbar({ onOpenDrawer, onOpenPurchaseModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-sm border-b border-emerald-800">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-3 sm:px-5 py-2 sm:py-2.5 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenDrawer}
            aria-label="Buka Menu Navigation"
            className="p-1.5 sm:p-2 rounded-lg bg-emerald-950/60 hover:bg-emerald-950 active:scale-95 transition cursor-pointer"
          >
            <Menu className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-100" />
          </button>
          <div className="flex items-center space-x-2">
            <img
              src="/logo.png"
              alt="DAPURZY Premium Logo"
              className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg object-cover shadow-xs border border-amber-400/60"
            />
            <div>
              <h1 className="font-extrabold text-xs sm:text-sm tracking-wide leading-tight flex items-center gap-1.5">
                DAPURZY{' '}
                <span className="text-[9px] bg-amber-400 text-amber-950 px-1.5 py-0.2 rounded font-black">
                  v1.2
                </span>
              </h1>
              <p className="text-[9px] sm:text-[10px] text-emerald-200 font-medium">Batch Procurement & Auto-HPP</p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenPurchaseModal}
          className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-extrabold text-[11px] sm:text-xs px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl shadow-xs flex items-center space-x-1 active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[3]" />
          <span>Belanja</span>
        </button>
      </div>
    </header>
  );
}
