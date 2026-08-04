'use client';

import React from 'react';
import { Lock, Plus } from 'lucide-react';

interface NavbarProps {
  onLockApp?: () => void;
  onOpenPurchaseModal: () => void;
}

export default function Navbar({ onLockApp, onOpenPurchaseModal }: NavbarProps) {
  return (
    <header className="sticky top-0 z-30 bg-emerald-900 text-white shadow-sm border-b border-emerald-800">
      <div className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto px-3.5 py-2.5 sm:py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5 sm:space-x-3">
          {/* LOGO & TITLE */}
          <div className="flex items-center space-x-2.5">
            <img
              src="/logo.png"
              alt="DAPURZY Premium Logo"
              className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl object-cover shadow-xs border border-amber-400/80"
            />
            <div>
              <h1 className="font-black text-sm sm:text-base tracking-tight leading-tight flex items-center gap-1.5 text-white">
                DAPURZY{' '}
                <span className="text-[10px] bg-amber-400 text-amber-950 px-1.5 py-0.5 rounded-md font-black">
                  Ultra-Lean
                </span>
              </h1>
              <p className="text-[10px] text-emerald-200 font-medium">Sistem Operasional Dapurzy</p>
            </div>
          </div>
        </div>

        {/* RIGHT ACTION BUTTONS: PIN LOCK & + BELANJA BAHAN */}
        <div className="flex items-center space-x-2">
          {onLockApp && (
            <button
              onClick={onLockApp}
              title="Kunci Aplikasi (PIN Lock)"
              aria-label="Kunci Aplikasi (PIN Lock)"
              className="p-2 sm:px-2.5 sm:py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-950 text-amber-400 active:scale-95 transition cursor-pointer flex items-center gap-1 border border-emerald-800"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300 hidden sm:inline">Kunci</span>
            </button>
          )}

          <button
            onClick={onOpenPurchaseModal}
            className="bg-amber-400 hover:bg-amber-300 text-amber-950 font-black text-xs sm:text-sm px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl shadow-xs flex items-center space-x-1 active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>+ Belanja Bahan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
