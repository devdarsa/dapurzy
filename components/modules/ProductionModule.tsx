'use client';

import React from 'react';
import { Plus, Calculator, Lock } from 'lucide-react';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductionModuleProps {
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  onOpenProductionModal: () => void;
}

export default function ProductionModule({
  purchaseBatches,
  products,
  onOpenProductionModal,
}: ProductionModuleProps) {
  const producedBatches = purchaseBatches.filter((b) => b.status === 'produced');

  return (
    <div className="space-y-4 sm:space-y-6 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-base sm:text-lg md:text-xl font-bold text-slate-800">Modul Produksi & HPP</h2>
          <p className="text-xs sm:text-sm text-slate-500">Kalkulasi otomatis HPP presisi per unit (Max 1x Penarikan)</p>
        </div>
        <button
          onClick={onOpenProductionModal}
          className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs sm:text-sm px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl sm:rounded-2xl flex items-center space-x-1.5 shadow-sm active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-4 h-4 sm:w-5 sm:h-5 stroke-[3]" />
          <span>Input Produksi</span>
        </button>
      </div>

      <div className="bg-purple-50 border border-purple-200 p-4 sm:p-5 rounded-2xl sm:rounded-3xl space-y-2">
        <h4 className="font-extrabold text-xs sm:text-sm text-purple-900 flex items-center gap-1.5 sm:gap-2">
          <Calculator className="w-4 h-4 sm:w-5 sm:h-5" /> Aturan Auto-HPP Presisi DAPURZY
        </h4>
        <p className="text-xs sm:text-sm text-purple-800 font-semibold">
          HPP Presisi per Unit = Dibulatkan ke Ratusan Ke Atas (Tanpa Satuan / Puluhan)
        </p>
        <p className="text-[10px] sm:text-xs text-purple-700 flex items-center gap-1 font-bold pt-1">
          <Lock className="w-3.5 h-3.5" /> Setiap batch belanja modal hanya bisa ditarik 1 kali ke produksi untuk mengunci presisi HPP.
        </p>
      </div>

      <div className="space-y-3 sm:space-y-4">
        <h3 className="font-bold text-xs sm:text-sm uppercase tracking-wider text-slate-700">Riwayat Produksi Batch (Terkunci)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {producedBatches.map((b) => {
            const prod = products.find((p) => p.id === b.productId);
            return (
              <div key={b.id} className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-2.5 text-xs sm:text-sm">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>
                    {b.batchId} ➔ {prod?.name}
                  </span>
                  <span className="text-emerald-600 font-black">HPP: {formatRupiah(b.calculatedHpp)}</span>
                </div>
                <p className="text-slate-500 text-[11px] sm:text-xs">
                  {b.producedQty} pcs diproduksi dari total modal {formatRupiah(b.totalCost)}
                </p>
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-[9px] sm:text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Status: Terkunci (Selesai 1x Tarik)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
