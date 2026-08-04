'use client';

import React, { useState, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  Box,
  ShoppingBag,
  ChefHat,
  Truck,
  CheckCircle2,
  Home,
  Trophy,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { PurchaseBatch, Product, Mitra, Sale, PeriodFilter, ProductStock } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface DashboardModuleProps {
  operatingCapital: number; // Kas Modal Operasional
  netProfitPool: number;    // Kantong Profit Bersih
  totalGrossOmzet: number;  // Total Omset Kotor
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  mitras: Mitra[];
  sales: Sale[];
  stocks?: ProductStock[];
  onOpenModal: (
    modal:
      | 'belanja_batch'
      | 'pengolahan'
      | 'ambil_mitra'
      | 'settlement'
      | 'home_sales'
      | 'capital'
      | 'product'
      | 'mitra'
  ) => void;
  // D2 FIX: Callback untuk membuka PengolahanModal dengan batch tertentu sudah pre-selected
  onOpenPengolahanForBatch?: (batchId: string) => void;
}

export default function DashboardModule({
  operatingCapital,
  netProfitPool,
  totalGrossOmzet,
  purchaseBatches,
  products,
  mitras,
  sales,
  stocks = [],
  onOpenModal,
  onOpenPengolahanForBatch,
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
  const activeBatches = purchaseBatches.slice(0, 6);

  // Available batches count (status Tersedia)
  // D6 FIX: Hapus cek 'pending_production' — enum sudah disederhanakan ke ['tersedia', 'habis']
  const tersediaBatchesCount = useMemo(() => {
    return purchaseBatches.filter((b) => b.status === 'tersedia').length;
  }, [purchaseBatches]);

  // Total Finished Goods Stock (Gudang)
  const totalWarehouseStock = useMemo(() => {
    return stocks
      .filter((s) => s.locationType === 'gudang')
      .reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
  }, [stocks]);

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

      {/* FINANCIAL OVERVIEW (KAS MODAL & PROFIT CARD) */}
      <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-lg relative overflow-hidden border border-emerald-800/60 space-y-3.5">
        <div className="flex justify-between items-start gap-2 min-w-0">
          <div className="min-w-0 flex-1">
            <span className="text-[11px] sm:text-xs font-bold text-emerald-300 uppercase tracking-wider block">
              🏦 Kas Modal Usaha (Saldo Terpotong Belanja)
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-amber-400 mt-0.5 tracking-tight truncate">
              {formatRupiah(operatingCapital)}
            </h2>
            <p className="text-[10px] text-emerald-200/80 mt-0.5 font-medium truncate">
              (Setiap Belanja memotong Kas Modal & terisi dari HPP Setoran)
            </p>
          </div>
          <button
            onClick={() => onOpenModal('capital')}
            className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-extrabold text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl border border-emerald-700/80 shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
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

      {/* QUICK STATUS SUMMARY BAR */}
      <div className="grid grid-cols-2 gap-2.5 text-xs">
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-amber-800 font-bold block">Batch Belanja Tersedia:</span>
            <span className="text-sm font-black text-amber-900">{tersediaBatchesCount} Batch Siap Olah</span>
          </div>
          <span className="text-xl">📦</span>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl flex justify-between items-center">
          <div>
            <span className="text-[10px] text-emerald-800 font-bold block">Stok Produk Jadi (Gudang):</span>
            <span className="text-sm font-black text-emerald-900">{totalWarehouseStock} Pcs Tersedia</span>
          </div>
          <span className="text-xl">🍞</span>
        </div>
      </div>

      {/* MAIN OPERATIONAL MODULE ACTION BUTTONS (SEPARATED ACCORDING TO ALUR) */}
      <div className="space-y-2">
        <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider pl-1 flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-emerald-600" /> Modul Utama Alur Operasional
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Modul 2: Belanja (Batch) */}
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

          {/* Modul 3: Pembuatan / Pengolahan */}
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

          {/* Modul 4a: Ambil Produk Mitra */}
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

          {/* Modul 4b: Setor Mitra */}
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
      </div>

      {/* SECONDARY QUICK ACTIONS */}
      <div className="grid grid-cols-3 gap-2">
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
            <Box className="w-4 h-4 text-purple-600" /> Status Batch Belanja & Produksi
          </h3>
          <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
            {purchaseBatches.length} Total Batch
          </span>
        </div>

        {activeBatches.length === 0 ? (
          <div className="text-center py-6 text-slate-400 text-xs">
            Belum ada batch belanja/produksi. Klik <b>"1. Belanja (Buat Batch)"</b> untuk memulai siklus pertama!
          </div>
        ) : (
          <div className="space-y-3">
            {activeBatches.map((b) => {
              const product = products.find((p) => p.id === b.productId);
              // D6 FIX: Cek status hanya 'tersedia' — tidak perlu fallback ke 'pending_production'
              const isTersedia = b.status === 'tersedia';

              return (
                <div key={b.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                          {b.batchId}
                        </span>
                        {isTersedia ? (
                          <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            ● Status: Tersedia
                          </span>
                        ) : (
                          <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-300 px-2 py-0.5 rounded-full">
                            ✓ Status: Habis
                          </span>
                        )}
                      </div>
                      <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-1">
                        {b.itemsDescription}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 font-bold block">Biaya Belanja</span>
                      <span className="text-xs sm:text-sm font-black text-rose-600">{formatRupiah(b.totalCost)}</span>
                    </div>
                  </div>

                  {!isTersedia && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60">
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-slate-400 font-bold block">Hasil Pengolahan:</span>
                        <span className="font-extrabold text-slate-800">{b.producedQty} pcs ({product?.name || 'Produk'})</span>
                      </div>
                      <div className="bg-white p-2 rounded-xl border border-slate-200">
                        <span className="text-[10px] text-amber-700 font-bold block">HPP Terhitung:</span>
                        <span className="font-black text-amber-900">{formatRupiah(b.calculatedHpp)} / unit</span>
                      </div>
                    </div>
                  )}

                  {isTersedia && (
                    <div className="pt-1">
                      <button
                        onClick={() => {
                          // D2 FIX: Gunakan onOpenPengolahanForBatch jika tersedia
                          // agar PengolahanModal langsung pre-select batch yang diklik
                          if (onOpenPengolahanForBatch) {
                            onOpenPengolahanForBatch(b.batchId);
                          } else {
                            onOpenModal('pengolahan');
                          }
                        }}
                        className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                      >
                        <ChefHat className="w-3.5 h-3.5" />
                        <span>Olah Batch Ini Sekarang →</span>
                      </button>
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
