'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  Box,
  PlusCircle,
  CheckCircle2,
  Home,
  Trophy,
  Calendar,
} from 'lucide-react';
import { PurchaseBatch, Product, Mitra, Sale, PeriodFilter } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface DashboardModuleProps {
  operatingCapital: number; // Kas Modal Operasional
  netProfitPool: number;    // Kantong Profit Bersih
  totalGrossOmzet: number;  // Total Omset Kotor
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  mitras: Mitra[];
  sales: Sale[];
  onOpenModal: (
    modal: 'batch_production' | 'settlement' | 'home_sales' | 'capital' | 'product' | 'mitra'
  ) => void;
}

export default function DashboardModule({
  operatingCapital,
  netProfitPool,
  totalGrossOmzet,
  purchaseBatches,
  products,
  mitras,
  sales,
  onOpenModal,
}: DashboardModuleProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all');

  // Filter Sales based on Selected Period
  const filteredSales = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return sales.filter((s) => {
      if (!s.createdAt) return true;
      const sDate = new Date(s.createdAt);

      if (period === 'today') {
        return sDate.toDateString() === todayStr;
      } else if (period === 'month') {
        return sDate.getMonth() === currentMonth && sDate.getFullYear() === currentYear;
      }
      return true; // 'all'
    });
  }, [sales, period]);

  // Compute Period Metrics
  const periodOmzet = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
  }, [filteredSales]);

  const periodProfit = useMemo(() => {
    return filteredSales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
  }, [filteredSales]);

  // Top Mitra Leaderboard (Rank Top 3 Mitras in Period)
  const topMitras = useMemo(() => {
    const mitraStats: Record<string, { omzet: number; soldQty: number }> = {};

    filteredSales.forEach((s) => {
      if ((s.saleType === 'CONSIGNMENT' || s.saleType === 'MITRA') && s.mitraId) {
        if (!mitraStats[s.mitraId]) {
          mitraStats[s.mitraId] = { omzet: 0, soldQty: 0 };
        }
        mitraStats[s.mitraId].omzet += Number(s.totalAmount) || 0;
        mitraStats[s.mitraId].soldQty += Number(s.quantity) || 0;
      }
    });

    const ranked = Object.entries(mitraStats)
      .map(([mId, stat]) => {
        const mitraObj = mitras.find((m) => m.id === mId);
        return {
          mitraId: mId,
          name: mitraObj?.name || 'Mitra',
          type: mitraObj?.type || 'Warung',
          omzet: stat.omzet,
          soldQty: stat.soldQty,
        };
      })
      .sort((a, b) => b.omzet - a.omzet);

    return ranked.slice(0, 3);
  }, [filteredSales, mitras]);

  // Recent batches
  const activeBatches = purchaseBatches.slice(0, 5);

  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* PERIODE SWITCHER BAR */}
      <div className="flex items-center justify-between bg-white p-2 sm:p-2.5 rounded-2xl border border-slate-200 shadow-xs text-xs font-bold">
        <div className="flex items-center gap-1.5 text-slate-700 pl-2">
          <Calendar className="w-4 h-4 text-emerald-600" />
          <span className="hidden sm:inline">Periode Tampilan:</span>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              period === 'today' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              period === 'month' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bulan Ini
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              period === 'all' ? 'bg-emerald-600 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Waktu
          </button>
        </div>
      </div>

      {/* FINANCIAL OVERVIEW (3 WALLETS CARD) */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden border border-emerald-800/60 space-y-3.5">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[11px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              🏦 Kas Modal Operasional Usaha
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 tracking-tight">
              {formatRupiah(operatingCapital)}
            </h2>
            <p className="text-[10px] text-emerald-200/80 mt-0.5 font-medium">
              (Berputar untuk belanja & terisi kembali dari HPP setoran)
            </p>
          </div>
          <button
            onClick={() => onOpenModal('capital')}
            className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-extrabold text-xs px-3 py-2 rounded-xl border border-emerald-700/80 shadow-sm active:scale-95 transition cursor-pointer"
          >
            + Injeksi Modal
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-3 border-t border-emerald-800/60 text-xs sm:text-sm">
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/50">
            <span className="text-[10px] text-emerald-300 block font-semibold">
              💰 Profit ({period === 'today' ? 'Hari Ini' : period === 'month' ? 'Bulan Ini' : 'Total'})
            </span>
            <span className="font-extrabold text-amber-300 text-sm sm:text-base">
              {formatRupiah(period === 'all' ? netProfitPool : periodProfit)}
            </span>
          </div>
          <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/50">
            <span className="text-[10px] text-emerald-300 block font-semibold">
              📊 Omset ({period === 'today' ? 'Hari Ini' : period === 'month' ? 'Bulan Ini' : 'Total'})
            </span>
            <span className="font-extrabold text-white text-sm sm:text-base">
              {formatRupiah(period === 'all' ? totalGrossOmzet : periodOmzet)}
            </span>
          </div>
        </div>
      </div>

      {/* 3 MAIN QUICK ACTION BUTTONS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <button
          onClick={() => onOpenModal('batch_production')}
          className="p-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/80 flex items-center justify-center text-white shadow-inner">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">Belanja & Produksi</p>
              <p className="text-[10px] font-normal text-emerald-100">Input Batch & Titip</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>

        <button
          onClick={() => onOpenModal('settlement')}
          className="p-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group border border-slate-800"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500/90 flex items-center justify-center text-amber-950 shadow-inner">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">Rekap Setoran Mitra</p>
              <p className="text-[10px] font-normal text-slate-300">Setor Uang Warung</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>

        <button
          onClick={() => onOpenModal('home_sales')}
          className="p-3.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-between shadow-md active:scale-95 transition cursor-pointer group"
        >
          <div className="flex items-center gap-2.5 text-left">
            <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-inner">
              <Home className="w-5 h-5" />
            </div>
            <div>
              <p className="font-black leading-tight">Setor Uang Rumah</p>
              <p className="text-[10px] font-normal text-amber-100">Toples Jual Rumah 1-Tap</p>
            </div>
          </div>
          <span className="text-base">➔</span>
        </button>
      </div>

      {/* SECONDARY QUICK ACTIONS: MASTER DATA CREATION */}
      <div className="grid grid-cols-2 gap-2.5">
        <button
          onClick={() => onOpenModal('product')}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-between border border-slate-200 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">📦</span>
            <div className="text-left">
              <p className="font-black text-slate-800">Master Produk</p>
              <p className="text-[10px] text-slate-500 font-normal">+ Tambah Produk Baru</p>
            </div>
          </div>
          <span className="text-xs text-emerald-600 font-black">+</span>
        </button>

        <button
          onClick={() => onOpenModal('mitra')}
          className="p-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs flex items-center justify-between border border-slate-200 shadow-xs active:scale-95 transition cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-black">🤝</span>
            <div className="text-left">
              <p className="font-black text-slate-800">Master Mitra</p>
              <p className="text-[10px] text-slate-500 font-normal">+ Tambah Mitra Baru</p>
            </div>
          </div>
          <span className="text-xs text-amber-600 font-black">+</span>
        </button>
      </div>

      {/* TOP MITRA TERLARIS LEADERBOARD WIDGET */}
      {topMitras.length > 0 && (
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-500" /> 🏆 Top Mitra Terlaris ({period === 'today' ? 'Hari Ini' : period === 'month' ? 'Bulan Ini' : 'Semua Waktu'})
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {topMitras.map((tm, idx) => (
              <div
                key={tm.mitraId}
                className={`p-3 rounded-xl border flex items-center justify-between gap-2 ${
                  idx === 0
                    ? 'bg-amber-50/80 border-amber-200/90'
                    : idx === 1
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-orange-50/60 border-orange-200/60'
                }`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-black text-xs ${
                      idx === 0
                        ? 'bg-amber-400 text-amber-950'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-800'
                        : 'bg-orange-300 text-orange-900'
                    }`}
                  >
                    #{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="font-black text-slate-800 text-xs truncate">{tm.name}</p>
                    <p className="text-[10px] text-slate-500">{tm.soldQty} pcs laku</p>
                  </div>
                </div>
                <span className="font-black text-emerald-800 text-xs">{formatRupiah(tm.omzet)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE BATCHES & DISTRIBUTION CARDS */}
      <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
            <Box className="w-4 h-4 text-purple-600" /> Riwayat Batch Produksi & Distribusi Terakhir
          </h3>
          <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
            {purchaseBatches.length} Total Batch
          </span>
        </div>

        {activeBatches.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada batch belanja/produksi. Klik <b>"Belanja & Produksi Baru"</b> untuk memulai siklus pertama!
          </div>
        ) : (
          <div className="space-y-3">
            {activeBatches.map((b) => {
              const product = products.find((p) => p.id === b.productId);
              let allocationsList: any[] = [];
              if (b.allocations) {
                try {
                  allocationsList = typeof b.allocations === 'string' ? JSON.parse(b.allocations) : b.allocations;
                } catch (e) {
                  allocationsList = [];
                }
              }

              const totalTitipMitra = allocationsList.reduce((sum, a) => sum + (Number(a.quantity) || 0), 0);
              const homeAllocation = Math.max(0, b.producedQty - totalTitipMitra);

              return (
                <div key={b.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                        {b.batchId}
                      </span>
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-1">
                        {b.itemsDescription}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Biaya Belanja</span>
                      <span className="text-xs sm:text-sm font-black text-rose-600">{formatRupiah(b.totalCost)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Hasil Produksi:</span>
                      <span className="font-extrabold text-slate-800">{b.producedQty} pcs ({product?.name || 'Produk'})</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-amber-700 font-bold block">HPP per Unit:</span>
                      <span className="font-black text-amber-900">{formatRupiah(b.calculatedHpp)}</span>
                    </div>
                    <div className="bg-emerald-50 p-2 rounded-xl border border-emerald-200 col-span-2 sm:col-span-1">
                      <span className="text-[10px] text-emerald-800 font-bold block">🏡 Alokasi Jual Rumah:</span>
                      <span className="font-black text-emerald-900">{homeAllocation} pcs</span>
                    </div>
                  </div>

                  {/* Mitra Allocations Badge */}
                  {allocationsList.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {allocationsList.map((alloc, idx) => {
                        const m = mitras.find((x) => x.id === alloc.mitraId);
                        return (
                          <span key={idx} className="text-[10px] font-bold bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <span>🤝 {m?.name || 'Mitra'}:</span>
                            <strong className="text-emerald-700">{alloc.quantity} pcs</strong>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}


