'use client';

import React from 'react';
import {
  Wallet,
  Calculator,
  ShoppingBag,
  Factory,
  ArrowLeftRight,
  ShoppingCart,
} from 'lucide-react';
import { Product, PurchaseBatch, ProductStock } from '@/lib/types';
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
  onOpenModal: (modal: 'purchase' | 'production' | 'movement' | 'sale') => void;
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
  const pendingBatchesCount = purchaseBatches.filter((b) => b.status === 'pending_production').length;

  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      {/* Cash & Capital Summary Card */}
      <div className="bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-900 text-white p-3.5 sm:p-5 rounded-2xl shadow-md space-y-2.5 relative overflow-hidden border border-emerald-800/40">
        <div className="flex justify-between items-center text-emerald-200 text-[11px] sm:text-xs font-semibold">
          <span className="flex items-center gap-1.5">
            <Wallet className="w-3.5 h-3.5 text-emerald-400" /> Saldo Kas Operasional
          </span>
          <span className="text-[9px] bg-emerald-800/80 px-2 py-0.5 rounded font-bold">
            Live D1
          </span>
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight">{formatRupiah(cashBalance)}</div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-emerald-800/60 text-xs">
          <div>
            <span className="text-[10px] text-emerald-300 block font-medium">Modal Aktif:</span>
            <span className="font-extrabold text-white">{formatRupiah(activeCapital)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-emerald-300 block font-medium">Nilai Stok Barang:</span>
            <span className="font-extrabold text-amber-300">{formatRupiah(stockValuation)}</span>
          </div>
        </div>
      </div>

      {/* Financial Today Cards Grid */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Omzet Hari Ini</span>
          <span className="text-xs sm:text-sm font-black text-emerald-600">
            {formatRupiah(todayStats.omzet)}
          </span>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Laba Bersih</span>
          <span className="text-xs sm:text-sm font-black text-amber-600">
            {formatRupiah(todayStats.laba)}
          </span>
        </div>
        <div className="bg-white p-2.5 sm:p-3 rounded-xl border border-slate-200 shadow-2xs text-center">
          <span className="text-[10px] font-bold text-slate-500 block mb-0.5">Belanja Modal</span>
          <span className="text-xs sm:text-sm font-black text-rose-600">
            {formatRupiah(todayStats.pengeluaran)}
          </span>
        </div>
      </div>

      {/* Compact Pending Production Notification Banner */}
      {pendingBatchesCount > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 text-white p-2.5 sm:p-3 rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-white/20 text-white">
              <Calculator className="w-3.5 h-3.5" />
            </div>
            <div>
              <h4 className="font-bold text-[11px] sm:text-xs leading-tight">Belanja Belum Ditarik Jadi Produksi</h4>
              <p className="text-[9px] text-amber-100">
                {pendingBatchesCount} batch belanja menunggu HPP.
              </p>
            </div>
          </div>
          <button
            onClick={() => onOpenModal('production')}
            className="bg-white text-amber-950 hover:bg-amber-100 font-extrabold text-[10px] px-2.5 py-1 rounded-lg shadow-2xs transition active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Tarik HPP
          </button>
        </div>
      )}

      {/* 1-Tap Quick Action Bar */}
      <div>
        <h3 className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5">
          Quick Actions (1-Tap)
        </h3>
        <div className="grid grid-cols-4 gap-2 sm:gap-3 text-center text-[10px] sm:text-xs font-bold">
          <button
            onClick={() => onOpenModal('purchase')}
            className="p-2.5 rounded-xl bg-white border border-amber-200 hover:bg-amber-50 text-amber-900 shadow-2xs flex flex-col items-center space-y-1 transition active:scale-95 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
              <ShoppingBag className="w-4 h-4 text-amber-600" />
            </div>
            <span>1. Belanja</span>
          </button>
          <button
            onClick={() => onOpenModal('production')}
            className="p-2.5 rounded-xl bg-white border border-purple-200 hover:bg-purple-50 text-purple-900 shadow-2xs flex flex-col items-center space-y-1 transition active:scale-95 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
              <Factory className="w-4 h-4 text-purple-600" />
            </div>
            <span>2. Produksi</span>
          </button>
          <button
            onClick={() => onOpenModal('movement')}
            className="p-2.5 rounded-xl bg-white border border-blue-200 hover:bg-blue-50 text-blue-900 shadow-2xs flex flex-col items-center space-y-1 transition active:scale-95 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
              <ArrowLeftRight className="w-4 h-4 text-blue-600" />
            </div>
            <span>3. Kirim</span>
          </button>
          <button
            onClick={() => onOpenModal('sale')}
            className="p-2.5 rounded-xl bg-white border border-emerald-200 hover:bg-emerald-50 text-emerald-900 shadow-2xs flex flex-col items-center space-y-1 transition active:scale-95 cursor-pointer"
          >
            <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
              <ShoppingCart className="w-4 h-4 text-emerald-600" />
            </div>
            <span>4. Jual</span>
          </button>
        </div>
      </div>

      {/* List Master Produk & Calculated Auto-HPP */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
            Ringkasan Produk & HPP
          </h3>
          <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-semibold">
            Auto Calculated
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {products.map((p) => {
            const stockSummary = getProductStockSummary(p.id);
            return (
              <div
                key={p.id}
                className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between"
              >
                <div>
                  <p className="font-bold text-xs text-slate-800">{p.name}</p>
                  <div className="flex items-center space-x-1.5 text-[10px] text-slate-500 mt-0.5">
                    <span className="text-emerald-700 font-bold">HPP: {formatRupiah(p.avgHpp)}</span>
                    <span>•</span>
                    <span>Jual: {formatRupiah(p.price)}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-black text-slate-800">{stockSummary.total} pcs</span>
                  <p className="text-[9px] text-slate-400">
                    Gudang: {stockSummary.gudang} | Mitra: {stockSummary.mitraTotal}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Log Aktivitas Terakhir */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">Log Aktivitas Terbaru</h3>
        <div className="space-y-1.5">
          {transactions.slice(0, 5).map((trx) => (
            <div
              key={trx.id}
              className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50 text-xs"
            >
              <div>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                    trx.type === 'PENJUALAN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : trx.type === 'BELANJA'
                      ? 'bg-amber-100 text-amber-800'
                      : trx.type === 'PRODUKSI'
                      ? 'bg-purple-100 text-purple-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {trx.type}
                </span>
                <p className="font-bold text-slate-800 text-[11px] mt-0.5">{trx.title}</p>
                <p className="text-[9px] text-slate-500">{trx.detail}</p>
              </div>
              <div className="text-right">
                {trx.amount > 0 && (
                  <p className={`font-black text-[11px] ${trx.category === 'in' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {trx.category === 'in' ? '+' : '-'}{formatRupiah(trx.amount)}
                  </p>
                )}
                {trx.profit > 0 && (
                  <p className="text-[9px] text-amber-600 font-bold">Profit: {formatRupiah(trx.profit)}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
