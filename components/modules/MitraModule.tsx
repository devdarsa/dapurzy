'use client';

import React, { useState } from 'react';
import { Users, Plus, CheckCircle2, ShoppingBag } from 'lucide-react';
import { Mitra, Product, Sale, PeriodFilter } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface MitraModuleProps {
  mitras: Mitra[];
  products: Product[];
  sales: Sale[];
  onOpenCreateMitraModal: () => void;
  onOpenSettlementModal: () => void;
  onNavigateToMaster: () => void;
  onShareSaleToWhatsApp: (sale: Sale) => void;
}

export default function MitraModule({
  mitras,
  products,
  sales,
  onOpenCreateMitraModal,
  onOpenSettlementModal,
  onNavigateToMaster,
  onShareSaleToWhatsApp,
}: MitraModuleProps) {
  const [period, setPeriod] = useState<PeriodFilter>('all');

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Header Controls */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <Users className="w-5 h-5 text-amber-600" /> Konsinyasi & Rekap Setoran Mitra
          </h2>
          <p className="text-[11px] text-slate-500">Omset harian, bulanan & record total kerjasama</p>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          {/* Period Filter Switcher */}
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
            <button
              onClick={() => setPeriod('today')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                period === 'today' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                period === 'month' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                period === 'all' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              Lifetime
            </button>
          </div>

          <button
            onClick={onOpenCreateMitraModal}
            className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Mitra</span>
          </button>
          <button
            onClick={onOpenSettlementModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Rekap Setoran</span>
          </button>
        </div>
      </div>

      {/* LIST MITRA CARDS WITH ANALYTICS BADGES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {mitras.length === 0 ? (
          <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
            Belum ada mitra. Klik <b>"Tambah Mitra"</b> untuk menambahkan warung/kantin titipan!
          </div>
        ) : (
          mitras.map((m) => {
            const displayedOmzet =
              period === 'today'
                ? m.todayOmzet || 0
                : period === 'month'
                ? m.monthlyOmzet || 0
                : m.lifetimeOmzet || 0;

            return (
              <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                      {m.type}
                    </span>
                    <h3 className="font-black text-slate-800 text-sm mt-1">{m.name}</h3>
                    {m.address && <p className="text-xs text-slate-500">{m.address}</p>}
                    {m.whatsapp && <p className="text-[11px] text-emerald-700 font-medium">WA: {m.whatsapp}</p>}
                  </div>
                  {/* Shortcut ke Tab Master untuk mengedit mitra */}
                  <button
                    onClick={onNavigateToMaster}
                    className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg hover:bg-slate-100 cursor-pointer border border-slate-200"
                    title="Edit mitra di Master Data"
                  >
                    ⚙️ Master
                  </button>
                </div>

                {/* MITRA ANALYTICS DISPLAY BADGE */}
                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">
                      Omset ({period === 'today' ? 'Hari Ini' : period === 'month' ? 'Bulan Ini' : 'Lifetime'})
                    </span>
                    <span className="font-black text-emerald-800 text-sm">{formatRupiah(displayedOmzet)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Barang Laku</span>
                    <span className="font-black text-slate-800 text-sm">{m.totalSoldQty || 0} pcs</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* SETORAN HISTORY TABLE */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
          <ShoppingBag className="w-4 h-4 text-emerald-600" /> Riwayat Rekap Setoran Diterima
        </h3>
        {sales.length === 0 ? (
          <p className="text-xs text-slate-400 italic">Belum ada riwayat setoran.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar pr-0.5">
            {sales.map((s) => {
              const product = products.find((p) => p.id === s.productId);
              const mitra = mitras.find((m) => m.id === s.mitraId);
              return (
                <div key={s.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-bold text-slate-800">
                      {s.saleType === 'DIRECT' ? '🏡 Setoran Toples Rumah' : `🤝 Setoran: ${mitra?.name || 'Mitra'}`}
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {product?.name || 'Produk'} ({s.quantity} pcs laku) • {formatDate(s.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-right">
                      <p className="font-black text-emerald-800">{formatRupiah(s.totalAmount)}</p>
                      <p className="text-[10px] text-amber-700 font-bold">Profit: {formatRupiah(s.profit)}</p>
                    </div>
                    {s.saleType !== 'DIRECT' && (
                      <button
                        onClick={() => onShareSaleToWhatsApp(s)}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-300 active:scale-95 transition cursor-pointer flex items-center gap-1"
                        title="Kirim Nota ke WA Mitra"
                      >
                        <span>📲 WA</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
