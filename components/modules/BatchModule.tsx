'use client';

import React from 'react';
import { Plus } from 'lucide-react';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';

interface BatchModuleProps {
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  onOpenPurchaseModal: () => void;
  onOpenProductionModal: () => void;
}

export default function BatchModule({
  purchaseBatches,
  products,
  onOpenPurchaseModal,
  onOpenProductionModal,
}: BatchModuleProps) {
  return (
    <div className="space-y-3 sm:space-y-4 animate-in fade-in duration-200">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xs sm:text-sm font-bold text-slate-800">Batch Belanja Bahan Baku</h2>
          <p className="text-[10px] sm:text-xs text-slate-500">Pencatatan modal belanja untuk Auto-HPP</p>
        </div>
        <button
          onClick={onOpenPurchaseModal}
          className="bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-lg sm:rounded-xl flex items-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Batch Belanja</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
        {purchaseBatches.map((b) => {
          const prod = products.find((p) => p.id === b.productId);
          return (
            <div key={b.id} className="bg-white p-3 sm:p-3.5 rounded-xl border border-slate-200 shadow-2xs space-y-2 text-xs">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <div className="flex items-center space-x-1.5">
                  <span className="text-[10px] font-black text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                    {b.batchId}
                  </span>
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      b.status === 'produced' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {b.status === 'produced' ? '✓ Sudah Diproduksi' : '⏳ Menunggu Produksi'}
                  </span>
                </div>
                <span className="text-[9px] text-slate-400">{formatDate(b.date)}</span>
              </div>

              <div>
                <p className="text-[11px] font-bold text-slate-800">{b.itemsDescription}</p>
                <p className="text-[9px] text-slate-500">Supplier: {b.supplier}</p>
              </div>

              <div className="p-2 sm:p-2.5 rounded-lg bg-slate-50 border border-slate-200/60 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[9px] text-slate-400 block font-semibold">Total Modal Belanja</span>
                  <span className="font-extrabold text-rose-600 text-xs sm:text-sm">{formatRupiah(b.totalCost)}</span>
                </div>

                {b.status === 'produced' ? (
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 block">
                      Hasil: {b.producedQty} pcs {prod?.name}
                    </span>
                    <span className="font-black text-emerald-600 text-[11px]">
                      HPP Presisi: {formatRupiah(b.calculatedHpp)}/pcs
                    </span>
                  </div>
                ) : (
                  <button
                    onClick={onOpenProductionModal}
                    className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] px-2.5 py-1 rounded-lg shadow-2xs active:scale-95 transition cursor-pointer"
                  >
                    Tarik Produksi
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
