'use client';

import React, { useMemo, useState } from 'react';
import { PurchaseBatch, Product, Sale, Mitra } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { TrendingUp, Calendar, ChevronDown } from 'lucide-react';

interface RevenueHistoryModuleProps {
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  sales: Sale[];
  mitras: Mitra[];
}

export default function RevenueHistoryModule({
  purchaseBatches,
  products,
  sales,
  mitras,
}: RevenueHistoryModuleProps) {
  // Selected Month State: 'CURRENT_MONTH' | 'ALL' | 'YYYY-MM'
  const [selectedMonth, setSelectedMonth] = useState<string>('CURRENT_MONTH');

  // Extract distinct available months (YYYY-MM) from purchase batches and sales
  const availableMonths = useMemo(() => {
    const monthSet = new Set<string>();
    
    // Always include current month
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    monthSet.add(currentMonthKey);

    purchaseBatches.forEach((b) => {
      if (b.date || b.createdAt) {
        const d = new Date(b.date || b.createdAt!);
        if (!isNaN(d.getTime())) {
          monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
    });

    sales.forEach((s) => {
      if (s.createdAt) {
        const d = new Date(s.createdAt);
        if (!isNaN(d.getTime())) {
          monthSet.add(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
        }
      }
    });

    return Array.from(monthSet).sort().reverse();
  }, [purchaseBatches, sales]);

  // Helper to format YYYY-MM into Indonesian Month String (e.g. "Agustus 2026")
  const formatMonthLabel = (monthKey: string) => {
    const [yearStr, monthStr] = monthKey.split('-');
    const date = new Date(Number(yearStr), Number(monthStr) - 1, 1);
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  };

  // Real-time Filter Batches based on Selected Month
  const filteredBatches = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    return purchaseBatches.filter((b) => {
      if (!b.date && !b.createdAt) return true;
      const bDate = new Date(b.date || b.createdAt!);
      if (isNaN(bDate.getTime())) return true;

      if (selectedMonth === 'ALL') {
        return true;
      } else if (selectedMonth === 'CURRENT_MONTH') {
        return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
      } else {
        const key = `${bDate.getFullYear()}-${String(bDate.getMonth() + 1).padStart(2, '0')}`;
        return key === selectedMonth;
      }
    });
  }, [purchaseBatches, selectedMonth]);

  // Real-Time Aggregate Batch Revenue & Profit Details
  const batchRevenueList = useMemo(() => {
    return filteredBatches.map((b) => {
      const product = products.find((p) => p.id === b.productId);
      
      // Find matching sales belonging to this batch
      const matchingSales = sales.filter((s) => {
        if (s.batchId && b.batchId) {
          return s.batchId === b.batchId;
        }
        return s.productId === b.productId;
      });

      const totalOmzetKotor = matchingSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
      const totalProfit = matchingSales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
      const totalSoldQty = matchingSales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      const omsetBersih = totalOmzetKotor > 0 ? totalProfit : 0;

      return {
        batchId: b.batchId,
        date: b.date || b.createdAt,
        itemsDescription: b.itemsDescription,
        productName: product?.name || 'Produk Umum',
        modalBelanja: b.totalCost,            // 🏦 MODAL
        producedQty: b.producedQty,          // 📦 HASIL PRODUK
        calculatedHpp: b.calculatedHpp,
        omzetKotor: totalOmzetKotor,          // 📊 OMSET KOTOR
        omzetBersih: omsetBersih,             // 💰 OMSET BERSIH (PROFIT)
        totalSoldQty: totalSoldQty,
      };
    });
  }, [filteredBatches, products, sales]);

  // Real-Time Total Summaries
  const totalModal = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.modalBelanja, 0), [batchRevenueList]);
  const totalOmzetKotorAll = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.omzetKotor, 0), [batchRevenueList]);
  const totalOmzetBersihAll = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.omzetBersih, 0), [batchRevenueList]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* HEADER CONTROLS & DYNAMIC MONTH PICKER DROPDOWN */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Riwayat Pendapatan & Kinerja Batch
          </h2>
          <p className="text-[11px] text-slate-500">Pilih bulan berjalan, bulan spesifik, atau semua data</p>
        </div>

        {/* MONTH PICKER DROPDOWN SELECTOR */}
        <div className="relative flex items-center">
          <Calendar className="w-4 h-4 text-emerald-600 absolute left-3 pointer-events-none z-10" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-9 pr-8 py-2 rounded-xl bg-emerald-50 border border-emerald-300 font-extrabold text-emerald-900 text-xs focus:ring-2 focus:ring-emerald-500 outline-none cursor-pointer appearance-none shadow-2xs"
          >
            <option value="CURRENT_MONTH">📅 Bulan Berjalan ({formatMonthLabel(availableMonths[0] || '2026-08')})</option>
            <option value="ALL">🌐 Semua Data (Lifetime)</option>
            {availableMonths.map((mKey) => (
              <option key={mKey} value={mKey}>
                🗓️ {formatMonthLabel(mKey)}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-emerald-700 absolute right-2.5 pointer-events-none z-10" />
        </div>
      </div>

      {/* SUMMARY 4 CARDS OVERVIEW (REAL-TIME UPDATED) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block truncate">🏦 Total Modal</span>
          <span className="text-sm sm:text-base font-black text-rose-600">{formatRupiah(totalModal)}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block truncate">📦 Batch Produksi</span>
          <span className="text-sm sm:text-base font-black text-slate-800">{batchRevenueList.length} Batch</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block truncate">📊 Omset Kotor</span>
          <span className="text-sm sm:text-base font-black text-slate-900">{formatRupiah(totalOmzetKotorAll)}</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-extrabold uppercase block truncate">💰 Omset Bersih</span>
          <span className="text-sm sm:text-base font-black text-emerald-700">{formatRupiah(totalOmzetBersihAll)}</span>
        </div>
      </div>

      {/* REVENUE HISTORY CARDS LIST (MODAL | HASIL PRODUK | OMSET KOTOR | OMSET BERSIH) */}
      <div className="space-y-3">
        {batchRevenueList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Belum ada data riwayat pendapatan untuk pilihan periode bulan ini.
          </div>
        ) : (
          batchRevenueList.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              {/* Batch Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5 min-w-0 gap-2">
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                    {item.batchId}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm mt-1 truncate">{item.itemsDescription}</h3>
                  <p className="text-[11px] text-slate-500">{formatDate(item.date)}</p>
                </div>
                <div className="text-right whitespace-nowrap shrink-0">
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                    HPP: {formatRupiah(item.calculatedHpp)} / pcs
                  </span>
                </div>
              </div>

              {/* 4 CORE INDICATORS: MODAL | HASIL PRODUK | OMSET KOTOR | OMSET BERSIH */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. MODAL */}
                <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-extrabold block uppercase truncate">🏦 MODAL BELANJA</span>
                  <span className="font-black text-rose-800 text-sm">{formatRupiah(item.modalBelanja)}</span>
                </div>

                {/* 2. HASIL PRODUK */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-extrabold block uppercase truncate">📦 HASIL PRODUK</span>
                  <span className="font-black text-slate-800 text-sm">{item.producedQty} pcs</span>
                  <span className="text-[10px] text-slate-500 block truncate">({item.productName})</span>
                </div>

                {/* 3. OMSET KOTOR */}
                <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 font-extrabold block uppercase truncate">📊 OMSET KOTOR</span>
                  <span className="font-black text-blue-900 text-sm">{formatRupiah(item.omzetKotor)}</span>
                  <span className="text-[10px] text-blue-600 block truncate">{item.totalSoldQty} pcs laku</span>
                </div>

                {/* 4. OMSET BERSIH */}
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-extrabold block uppercase truncate">💰 OMSET BERSIH</span>
                  <span className="font-black text-emerald-700 text-sm">{formatRupiah(item.omzetBersih)}</span>
                  <span className="text-[10px] text-emerald-600 block truncate">Laba murni</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

