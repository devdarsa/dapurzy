'use client';

import React from 'react';
import { Store, Users } from 'lucide-react';
import { Product, Mitra, ProductStock } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface StockModuleProps {
  products: Product[];
  mitras: Mitra[];
  stocks: ProductStock[];
}

export default function StockModule({ products, mitras, stocks }: StockModuleProps) {
  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      <h2 className="text-xs sm:text-sm font-bold text-slate-800">Stok Real-Time Multi-Lokasi</h2>

      {/* Gudang Utama Stock */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-[11px] sm:text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Store className="w-4 h-4 text-emerald-600" /> 1. Stok Gudang Utama
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-2.5">
          {products.map((p) => {
            const qty = stocks.find((s) => s.productId === p.id && s.locationType === 'gudang')?.quantity || 0;
            return (
              <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <p className="text-xs font-bold text-slate-800">{p.name}</p>
                <p className="text-base sm:text-lg font-black text-emerald-600 mt-0.5">{qty} pcs</p>
                <p className="text-[9px] text-slate-400">Valuasi: {formatRupiah(qty * p.avgHpp)}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mitra Stock Breakdown */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-2.5">
        <h3 className="font-bold text-[11px] sm:text-xs text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Users className="w-4 h-4 text-blue-600" /> 2. Stok Konsinyasi di Mitra
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-2.5">
          {mitras.map((m) => {
            const mitraStockItems = stocks.filter((s) => s.locationType === 'mitra' && s.mitraId === m.id);
            return (
              <div key={m.id} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-xs text-slate-800">
                    {m.name} ({m.type})
                  </span>
                  <span className="text-[9px] text-slate-500">{m.whatsapp}</span>
                </div>
                <div className="text-[10px] text-slate-600 space-y-0.5 pt-0.5">
                  {mitraStockItems.length > 0 ? (
                    mitraStockItems.map((si) => {
                      const prod = products.find((p) => p.id === si.productId);
                      return (
                        <div key={si.id} className="flex justify-between text-[11px]">
                          <span>• {prod?.name}</span>
                          <span className="font-bold text-blue-700">{si.quantity} pcs</span>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-[9px] text-slate-400 italic">Belum ada barang dititipkan.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
