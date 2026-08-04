'use client';

import React from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Layers,
  ShoppingCart,
  ArrowLeftRight,
  PackageCheck,
  Store,
  Clock,
} from 'lucide-react';
import { PurchaseBatch, Product, ProductStock } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface DashboardModuleProps {
  cashBalance: number;
  activeCapital: number;
  stockValuation: number;
  todayStats: {
    omzet: number;
    laba: number;
    pengeluaran: number;
  };
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  stocks: ProductStock[];
  transactions: any[];
  onOpenModal: (
    modal: 'sale' | 'movement' | 'production' | 'purchase' | 'capital' | 'settlement'
  ) => void;
  getProductStockSummary: (productId: string) => { gudang: number; mitraTotal: number; total: number };
}

export default function DashboardModule({
  cashBalance,
  activeCapital,
  stockValuation,
  todayStats,
  purchaseBatches,
  products,
  onOpenModal,
  getProductStockSummary,
}: DashboardModuleProps) {
  const pendingProductionBatches = purchaseBatches.filter((b) => b.status === 'pending_production');

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
      {/* FINANCIAL OVERVIEW CARD */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden border border-emerald-800/60 space-y-3">
        <div className="flex flex-wrap sm:flex-nowrap justify-between items-start gap-2">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-semibold text-emerald-200 uppercase tracking-wider block truncate">
              Saldo Kas Operasional Usaha
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 tracking-tight">
              {formatRupiah(cashBalance)}
            </h2>
          </div>
          <button
            onClick={() => onOpenModal('capital')}
            className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-extrabold text-xs px-3 py-2 rounded-xl border border-emerald-700/80 shadow-2xs active:scale-95 transition cursor-pointer flex-shrink-0 self-start mt-0.5"
          >
            + Injeksi Modal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-emerald-800/60 text-xs sm:text-sm">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
            <span className="text-[11px] text-emerald-300 block whitespace-nowrap">Total Modal Aktif</span>
            <span className="font-extrabold text-white text-xs sm:text-sm whitespace-nowrap">{formatRupiah(activeCapital)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
            <span className="text-[11px] text-emerald-300 block whitespace-nowrap">Valuasi Stok Barang</span>
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm whitespace-nowrap">{formatRupiah(stockValuation)}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S PERFORMANCE STATS (STRICT SINGLE-LINE HEADINGS) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-1 text-slate-500 overflow-hidden">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap truncate">Omzet Hari Ini</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-800 whitespace-nowrap truncate">{formatRupiah(todayStats.omzet)}</p>
        </div>

        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-1 text-slate-500 overflow-hidden">
            <Wallet className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap truncate">Laba Bersih</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-emerald-600 whitespace-nowrap truncate">{formatRupiah(todayStats.laba)}</p>
        </div>

        <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-1">
          <div className="flex items-center space-x-1 text-slate-500 overflow-hidden">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
            <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap truncate">Belanja Modal</span>
          </div>
          <p className="text-xs sm:text-sm font-black text-rose-600 whitespace-nowrap truncate">{formatRupiah(todayStats.pengeluaran)}</p>
        </div>
      </div>

      {/* QUICK ACTION BAR (STRICT SINGLE-LINE BUTTON TITLES) */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-xs sm:text-sm text-slate-700 uppercase tracking-wider whitespace-nowrap">Aksi Cepat Operasional</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onOpenModal('purchase')}
            className="p-2.5 sm:p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer overflow-hidden"
          >
            <Layers className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">1. Belanja</span>
          </button>
          <button
            onClick={() => onOpenModal('production')}
            className="p-2.5 sm:p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer overflow-hidden"
          >
            <PackageCheck className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">2. Produksi</span>
          </button>
          <button
            onClick={() => onOpenModal('movement')}
            className="p-2.5 sm:p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer overflow-hidden"
          >
            <ArrowLeftRight className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">3. Titip Mitra</span>
          </button>
          <button
            onClick={() => onOpenModal('settlement')}
            className="p-2.5 sm:p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer overflow-hidden"
          >
            <ShoppingCart className="w-4 h-4 flex-shrink-0" />
            <span className="whitespace-nowrap truncate">4. Retur 1-Tap</span>
          </button>
        </div>
      </div>

      {/* PENDING PRODUCTION ALERT */}
      {pendingProductionBatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5 overflow-hidden">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="overflow-hidden">
              <p className="text-xs sm:text-sm font-extrabold text-amber-900 whitespace-nowrap truncate">
                {pendingProductionBatches.length} Batch Belanja Menunggu Produksi
              </p>
              <p className="text-xs text-amber-700 whitespace-nowrap truncate">Tarik ke produksi untuk Auto-HPP</p>
            </div>
          </div>
          <button
            onClick={() => onOpenModal('production')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition cursor-pointer flex-shrink-0 whitespace-nowrap"
          >
            Proses
          </button>
        </div>
      )}

      {/* PRODUCT STOCK SUMMARY */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5 whitespace-nowrap">
            <Store className="w-4 h-4 text-emerald-600 flex-shrink-0" /> Ringkasan Stok Produk Real-Time
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {products.map((p) => {
            const summary = getProductStockSummary(p.id);
            return (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex justify-between items-center overflow-hidden">
                  <span className="font-bold text-xs sm:text-sm text-slate-800 whitespace-nowrap truncate">{p.name}</span>
                  <span className="font-extrabold text-xs text-purple-700 whitespace-nowrap flex-shrink-0">HPP: {formatRupiah(p.avgHpp)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 pt-0.5">
                  <span className="whitespace-nowrap">Gudang: <b>{summary.gudang} pcs</b></span>
                  <span className="whitespace-nowrap">Mitra: <b>{summary.mitraTotal} pcs</b></span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded whitespace-nowrap">
                    Total: {summary.total} pcs
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
