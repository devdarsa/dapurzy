'use client';

import React, { useMemo, useState } from 'react';
import { PurchaseBatch, Product, Sale, Mitra, PeriodFilter } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { TrendingUp, Box, Calendar, Wallet, CheckCircle, PieChart } from 'lucide-react';

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
  const [period, setPeriod] = useState<PeriodFilter>('all');

  // Filter Sales & Batches based on Selected Period
  const filteredBatches = useMemo(() => {
    const now = new Date();
    const todayStr = now.toDateString();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return purchaseBatches.filter((b) => {
      if (!b.date) return true;
      const bDate = new Date(b.date);

      if (period === 'today') {
        return bDate.toDateString() === todayStr;
      } else if (period === 'month') {
        return bDate.getMonth() === currentMonth && bDate.getFullYear() === currentYear;
      }
      return true; // 'all'
    });
  }, [purchaseBatches, period]);

  // Aggregate Batch Revenue & Profit Details
  const batchRevenueList = useMemo(() => {
    return filteredBatches.map((b) => {
      const product = products.find((p) => p.id === b.productId);
      
      // Find all sales belonging to this batch (by batch_id or matching product)
      const matchingSales = sales.filter((s) => {
        if (s.batchId && b.batchId) {
          return s.batchId === b.batchId;
        }
        return s.productId === b.productId;
      });

      const totalOmzetKotor = matchingSales.reduce((sum, s) => sum + (Number(s.totalAmount) || 0), 0);
      const totalProfit = matchingSales.reduce((sum, s) => sum + (Number(s.profit) || 0), 0);
      const totalSoldQty = matchingSales.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);

      // Omset Bersih = Omset Kotor - Modal
      // or Total Net Profit earned
      const omsetBersih = totalOmzetKotor > 0 ? totalProfit : 0;

      return {
        batchId: b.batchId,
        date: b.date || b.createdAt,
        itemsDescription: b.itemsDescription,
        productName: product?.name || 'Produk Umum',
        modalBelanja: b.totalCost,            // 🏦 MODAL
        producedQty: b.producedQty,          // 📦 HASIL PRODUK (Pcs)
        calculatedHpp: b.calculatedHpp,
        omzetKotor: totalOmzetKotor,          // 📊 OMSET KOTOR
        omzetBersih: omsetBersih,             // 💰 OMSET BERSIH (PROFIT)
        totalSoldQty: totalSoldQty,
      };
    });
  }, [filteredBatches, products, sales]);

  // Total Summaries for Selected Period
  const totalModal = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.modalBelanja, 0), [batchRevenueList]);
  const totalOmzetKotorAll = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.omzetKotor, 0), [batchRevenueList]);
  const totalOmzetBersihAll = useMemo(() => batchRevenueList.reduce((sum, item) => sum + item.omzetBersih, 0), [batchRevenueList]);

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* HEADER CONTROLS & PERIODE SWITCHER */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <TrendingUp className="w-5 h-5 text-emerald-600" /> Riwayat Pendapatan & Kinerja Batch
          </h2>
          <p className="text-[11px] text-slate-500">Rincian Modal, Hasil Produk, Omset Kotor, & Omset Bersih</p>
        </div>

        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
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

      {/* SUMMARY 4 CARDS OVERVIEW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">🏦 Total Modal</span>
          <span className="text-sm sm:text-base font-black text-rose-600">{formatRupiah(totalModal)}</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">📦 Batch Diproduksi</span>
          <span className="text-sm sm:text-base font-black text-slate-800">{batchRevenueList.length} Batch</span>
        </div>
        <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-[10px] text-slate-400 font-extrabold uppercase block">📊 Total Omset Kotor</span>
          <span className="text-sm sm:text-base font-black text-slate-900">{formatRupiah(totalOmzetKotorAll)}</span>
        </div>
        <div className="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 shadow-xs">
          <span className="text-[10px] text-emerald-800 font-extrabold uppercase block">💰 Omset Bersih (Profit)</span>
          <span className="text-sm sm:text-base font-black text-emerald-700">{formatRupiah(totalOmzetBersihAll)}</span>
        </div>
      </div>

      {/* REVENUE HISTORY CARDS LIST (MODAL | HASIL PRODUK | OMSET KOTOR | OMSET BERSIH) */}
      <div className="space-y-3">
        {batchRevenueList.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-400 text-xs">
            Belum ada data riwayat pendapatan untuk periode ini.
          </div>
        ) : (
          batchRevenueList.map((item, idx) => (
            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
              {/* Batch Header */}
              <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                <div>
                  <span className="text-[10px] font-black bg-amber-400 text-amber-950 px-2 py-0.5 rounded-md">
                    {item.batchId}
                  </span>
                  <h3 className="font-black text-slate-800 text-sm mt-1">{item.itemsDescription}</h3>
                  <p className="text-[11px] text-slate-500">{formatDate(item.date)}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg border border-emerald-200">
                    HPP: {formatRupiah(item.calculatedHpp)} / pcs
                  </span>
                </div>
              </div>

              {/* 4 CORE INDICATORS: MODAL | HASIL PRODUK | OMSET KOTOR | OMSET BERSIH */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                {/* 1. MODAL */}
                <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-200">
                  <span className="text-[10px] text-rose-700 font-extrabold block uppercase">🏦 MODAL BELANJA</span>
                  <span className="font-black text-rose-800 text-sm">{formatRupiah(item.modalBelanja)}</span>
                </div>

                {/* 2. HASIL PRODUK */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] text-slate-500 font-extrabold block uppercase">📦 HASIL PRODUK</span>
                  <span className="font-black text-slate-800 text-sm">{item.producedQty} pcs</span>
                  <span className="text-[10px] text-slate-500 block truncate">({item.productName})</span>
                </div>

                {/* 3. OMSET KOTOR */}
                <div className="bg-blue-50/70 p-2.5 rounded-xl border border-blue-200">
                  <span className="text-[10px] text-blue-700 font-extrabold block uppercase">📊 OMSET KOTOR</span>
                  <span className="font-black text-blue-900 text-sm">{formatRupiah(item.omzetKotor)}</span>
                  <span className="text-[10px] text-blue-600 block">{item.totalSoldQty} pcs laku</span>
                </div>

                {/* 4. OMSET BERSIH */}
                <div className="bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <span className="text-[10px] text-emerald-800 font-extrabold block uppercase">💰 OMSET BERSIH</span>
                  <span className="font-black text-emerald-700 text-sm">{formatRupiah(item.omzetBersih)}</span>
                  <span className="text-[10px] text-emerald-600 block">Laba murni</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
