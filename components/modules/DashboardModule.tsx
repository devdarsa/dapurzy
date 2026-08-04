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
  ChevronRight,
  Clock,
} from 'lucide-react';
import { PurchaseBatch, Product, ProductStock } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

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
  transactions,
  onOpenModal,
  getProductStockSummary,
}: DashboardModuleProps) {
  const pendingProductionBatches = purchaseBatches.filter((b) => b.status === 'pending_production');

  return (
    <div className="space-y-3.5 sm:space-y-5 animate-in fade-in duration-200">
      {/* FINANCIAL OVERVIEW CARD */}
      <div className="bg-gradient-to-br from-emerald-900 via-emerald-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-md relative overflow-hidden border border-emerald-800/60 space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider block">
              Saldo Kas Operasional Usaha
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-1 tracking-tight">
              {formatRupiah(cashBalance)}
            </h2>
          </div>
          <button
            onClick={() => onOpenModal('capital')}
            className="bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 font-bold text-xs px-3 py-1.5 rounded-xl border border-emerald-700/60 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            + Injeksi Modal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-emerald-800/60 text-xs sm:text-sm">
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
            <span className="text-[11px] text-emerald-300 block">Total Modal Aktif</span>
            <span className="font-extrabold text-white text-xs sm:text-sm">{formatRupiah(activeCapital)}</span>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/40">
            <span className="text-[11px] text-emerald-300 block">Valuasi Stok Barang</span>
            <span className="font-extrabold text-amber-300 text-xs sm:text-sm">{formatRupiah(stockValuation)}</span>
          </div>
        </div>
      </div>

      {/* TODAY'S PERFORMANCE STATS */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1 text-slate-500 mb-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-[11px] font-bold">Omzet Hari Ini</span>
          </div>
          <p className="text-sm sm:text-base font-black text-slate-800">{formatRupiah(todayStats.omzet)}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1 text-slate-500 mb-1">
            <Wallet className="w-3.5 h-3.5 text-amber-600" />
            <span className="text-[11px] font-bold">Laba Bersih</span>
          </div>
          <p className="text-sm sm:text-base font-black text-emerald-600">{formatRupiah(todayStats.laba)}</p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center space-x-1 text-slate-500 mb-1">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" />
            <span className="text-[11px] font-bold">Belanja Modal</span>
          </div>
          <p className="text-sm sm:text-base font-black text-rose-600">{formatRupiah(todayStats.pengeluaran)}</p>
        </div>
      </div>

      {/* QUICK ACTION BAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-xs sm:text-sm text-slate-700 uppercase tracking-wider">Aksi Cepat Operasional</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <button
            onClick={() => onOpenModal('purchase')}
            className="p-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>1. Batch Belanja</span>
          </button>
          <button
            onClick={() => onOpenModal('production')}
            className="p-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <PackageCheck className="w-4 h-4" />
            <span>2. Produksi HPP</span>
          </button>
          <button
            onClick={() => onOpenModal('movement')}
            className="p-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <ArrowLeftRight className="w-4 h-4" />
            <span>3. Titip Mitra</span>
          </button>
          <button
            onClick={() => onOpenModal('settlement')}
            className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center space-x-1.5 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>4. Retur/Laku 1-Tap</span>
          </button>
        </div>
      </div>

      {/* PENDING PRODUCTION ALERT */}
      {pendingProductionBatches.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2.5">
            <Clock className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div>
              <p className="text-xs sm:text-sm font-extrabold text-amber-900">
                {pendingProductionBatches.length} Batch Belanja Menunggu Produksi
              </p>
              <p className="text-xs text-amber-700">Tarik ke produksi untuk mengkalkulasi Auto-HPP</p>
            </div>
          </div>
          <button
            onClick={() => onOpenModal('production')}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-2xs active:scale-95 transition cursor-pointer"
          >
            Proses
          </button>
        </div>
      )}

      {/* PRODUCT STOCK SUMMARY */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="font-bold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-emerald-600" /> Ringkasan Stok Produk Real-Time
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {products.map((p) => {
            const summary = getProductStockSummary(p.id);
            return (
              <div key={p.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs sm:text-sm text-slate-800">{p.name}</span>
                  <span className="font-extrabold text-xs text-purple-700">HPP: {formatRupiah(p.avgHpp)}</span>
                </div>
                <div className="flex justify-between items-center text-xs text-slate-600 pt-0.5">
                  <span>Gudang: <b>{summary.gudang} pcs</b></span>
                  <span>Mitra: <b>{summary.mitraTotal} pcs</b></span>
                  <span className="font-extrabold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
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
