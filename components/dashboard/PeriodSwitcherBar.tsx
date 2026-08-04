'use client';

import React from 'react';
import { Calendar } from 'lucide-react';
import { PeriodFilter } from '@/lib/types';

interface PeriodSwitcherBarProps {
  period: PeriodFilter;
  setPeriod: (p: PeriodFilter) => void;
}

export default function PeriodSwitcherBar({ period, setPeriod }: PeriodSwitcherBarProps) {
  return (
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
  );
}
