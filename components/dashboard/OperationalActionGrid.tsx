'use client';

import React from 'react';
import { ShoppingBag, ChefHat, Truck, CheckCircle2, Home, Sparkles } from 'lucide-react';

interface OperationalActionGridProps {
  onOpenModal: (
    modal:
      | 'belanja_batch'
      | 'pengolahan'
      | 'ambil_mitra'
      | 'settlement'
      | 'home_sales'
      | 'product'
      | 'mitra'
  ) => void;
}

export default function OperationalActionGrid({ onOpenModal }: OperationalActionGridProps) {
  return (
    <div className="space-y-2">
      <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider pl-1 flex items-center gap-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Modul Utama Alur Operasional
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Modul 1: Belanja (Batch) */}
        <button
          onClick={() => onOpenModal('belanja_batch')}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow-inner">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">1. Belanja (Buat Batch)</p>
              <p className="text-[10px] font-normal text-emerald-100">Potong Kas Modal → Status Tersedia</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>

        {/* Modul 2: Pembuatan / Pengolahan */}
        <button
          onClick={() => onOpenModal('pengolahan')}
          className="p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-inner">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">2. Pembuatan / Pengolahan</p>
              <p className="text-[10px] font-normal text-amber-100">Olah Batch Tersedia → Hitung HPP</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>

        {/* Modul 3: Ambil Produk Mitra */}
        <button
          onClick={() => onOpenModal('ambil_mitra')}
          className="p-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-inner">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">3. Ambil Produk Mitra</p>
              <p className="text-[10px] font-normal text-blue-100">Ambil dari Stok Produk Jadi</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>

        {/* Modul 4: Setor Mitra */}
        <button
          onClick={() => onOpenModal('settlement')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group border border-slate-800"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-amber-950 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">4. Setor Mitra (Konsinyasi/Cash)</p>
              <p className="text-[10px] font-normal text-slate-300">Setor Omset & Kembalikan HPP</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>
      </div>

      {/* SECONDARY QUICK ACTIONS */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <button
          onClick={() => onOpenModal('home_sales')}
          className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Setor Rumah</span>
        </button>

        <button
          onClick={() => onOpenModal('product')}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs transition cursor-pointer"
        >
          <span>📦 + Produk</span>
        </button>

        <button
          onClick={() => onOpenModal('mitra')}
          className="p-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-center gap-1.5 border border-slate-200 shadow-xs transition cursor-pointer"
        >
          <span>🤝 + Mitra</span>
        </button>
      </div>
    </div>
  );
}
