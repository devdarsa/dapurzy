'use client';

import React from 'react';
import { formatRupiah } from '@/lib/utils';
import { PeriodFilter } from '@/lib/types';

interface FinancialOverviewCardProps {
  operatingCapital: number;
  netProfitPool: number;
  totalGrossOmzet: number;
  periodProfit: number;
  periodOmzet: number;
  period: PeriodFilter;
  onOpenCapitalModal: () => void;
}

export default function FinancialOverviewCard({
  operatingCapital,
  netProfitPool,
  totalGrossOmzet,
  periodProfit,
  periodOmzet,
  period,
  onOpenCapitalModal,
}: FinancialOverviewCardProps) {
  return (
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
          onClick={onOpenCapitalModal}
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
  );
}
