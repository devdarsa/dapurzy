'use client';

import React from 'react';
import { Box, ChefHat } from 'lucide-react';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface BatchStatusListProps {
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  onOpenModal: (modal: 'pengolahan') => void;
  onOpenPengolahanForBatch?: (batchId: string) => void;
}

export default function BatchStatusList({
  purchaseBatches,
  products,
  onOpenModal,
  onOpenPengolahanForBatch,
}: BatchStatusListProps) {
  const activeBatches = purchaseBatches.slice(0, 6);

  return (
    <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
      <div className="flex justify-between items-center border-b border-slate-100 pb-2">
        <h3 className="font-extrabold text-xs sm:text-sm text-slate-800 flex items-center gap-1.5">
          <Box className="w-4 h-4 text-purple-600" /> Status Batch Belanja & Produksi
        </h3>
        <span className="text-[10px] font-black bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">
          {purchaseBatches.length} Total Batch
        </span>
      </div>

      {activeBatches.length === 0 ? (
        <div className="text-center py-6 text-slate-400 text-xs">
          Belum ada batch belanja/produksi. Klik <b>"1. Belanja (Buat Batch)"</b> untuk memulai siklus pertama!
        </div>
      ) : (
        <div className="space-y-3">
          {activeBatches.map((b) => {
            const product = products.find((p) => p.id === b.productId);
            const isTersedia = b.status === 'tersedia';

            return (
              <div key={b.id} className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-black bg-slate-200 text-slate-800 px-2 py-0.5 rounded-md">
                        {b.batchId}
                      </span>
                      {isTersedia ? (
                        <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                          ● Status: Tersedia
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold bg-slate-100 text-slate-500 border border-slate-300 px-2 py-0.5 rounded-full">
                          ✓ Status: Habis
                        </span>
                      )}
                    </div>
                    <h4 className="font-black text-slate-800 text-xs sm:text-sm mt-1">
                      {b.itemsDescription}
                    </h4>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">Biaya Belanja</span>
                    <span className="text-xs sm:text-sm font-black text-rose-600">{formatRupiah(b.totalCost)}</span>
                  </div>
                </div>

                {!isTersedia && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-slate-200/60">
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-slate-400 font-bold block">Hasil Pengolahan:</span>
                      <span className="font-extrabold text-slate-800">{b.producedQty} pcs ({product?.name || 'Produk'})</span>
                    </div>
                    <div className="bg-white p-2 rounded-xl border border-slate-200">
                      <span className="text-[10px] text-amber-700 font-bold block">HPP Terhitung:</span>
                      <span className="font-black text-amber-900">{formatRupiah(b.calculatedHpp)} / unit</span>
                    </div>
                  </div>
                )}

                {isTersedia && (
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        if (onOpenPengolahanForBatch) {
                          onOpenPengolahanForBatch(b.batchId);
                        } else {
                          onOpenModal('pengolahan');
                        }
                      }}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1 shadow-xs"
                    >
                      <ChefHat className="w-3.5 h-3.5" />
                      <span>Olah Batch Ini Sekarang →</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
