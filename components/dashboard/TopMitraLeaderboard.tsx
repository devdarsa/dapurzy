'use client';

import React from 'react';
import { Trophy } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';
import { PeriodFilter } from '@/lib/types';

interface TopMitraLeaderboardProps {
  topMitras: Array<{
    mitraId: string;
    name: string;
    type: string;
    omzet: number;
    soldQty: number;
  }>;
  period: PeriodFilter;
}

export default function TopMitraLeaderboard({ topMitras, period }: TopMitraLeaderboardProps) {
  if (!topMitras || topMitras.length === 0) return null;

  return (
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
  );
}
