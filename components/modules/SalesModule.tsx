'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { formatRupiah } from '@/lib/utils';

interface SalesModuleProps {
  transactions: any[];
  onOpenSaleModal: () => void;
}

export default function SalesModule({ transactions, onOpenSaleModal }: SalesModuleProps) {
  const salesTrxs = transactions.filter((t) => t.type === 'PENJUALAN');

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-slate-800">Penjualan Produk</h2>
          <p className="text-xs text-slate-500">Direct Gudang & Laporan Konsinyasi Mitra</p>
        </div>
        <button
          onClick={onOpenSaleModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center space-x-1 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Catat Jual</span>
        </button>
      </div>

      <div className="space-y-2">
        {salesTrxs.map((trx) => (
          <div
            key={trx.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-sm flex justify-between items-center"
          >
            <div>
              <p className="font-bold text-xs text-slate-800">{trx.title}</p>
              <p className="text-[10px] text-slate-500 mt-0.5">{trx.detail}</p>
            </div>
            <div className="text-right">
              <p className="font-black text-xs text-emerald-600">+{formatRupiah(trx.amount)}</p>
              <p className="text-[9px] text-amber-600 font-bold">Laba: {formatRupiah(trx.profit)}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
