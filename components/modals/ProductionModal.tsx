'use client';

import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  onSubmit: (data: { batchId: string; productId: string; producedQty: number; note?: string }) => void;
}

export default function ProductionModal({
  isOpen,
  onClose,
  purchaseBatches,
  products,
  onSubmit,
}: ProductionModalProps) {
  if (!isOpen) return null;

  const pendingBatches = purchaseBatches.filter((b) => b.status === 'pending_production');

  return (
    <ModalWrapper title="2. Tarik Belanja Jadi Produksi (HPP Auto)" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            batchId: String(formData.get('batchId') || ''),
            productId: String(formData.get('productId') || ''),
            producedQty: Number(formData.get('producedQty') || 0),
            note: String(formData.get('note') || ''),
          });
        }}
        className="space-y-3 text-xs"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Pilih Batch Belanja Bahan Baku</label>
          <select
            name="batchId"
            required
            className="w-full p-2.5 rounded-xl border border-amber-300 font-bold bg-amber-50 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {pendingBatches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchId} - Biaya: {formatRupiah(b.totalCost)} ({b.itemsDescription.slice(0, 25)}...)
              </option>
            ))}
          </select>
          {pendingBatches.length === 0 && (
            <p className="text-[10px] text-rose-500 font-bold mt-1">
              Belum ada batch belanja pending. Input belanja bahan terlebih dahulu.
            </p>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Barang Hasil Produksi</label>
          <select
            name="productId"
            required
            className="w-full p-2.5 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Jumlah Hasil Produksi (Pcs)</label>
          <input
            type="number"
            name="producedQty"
            min="1"
            defaultValue="100"
            required
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <p className="text-[10px] text-purple-700 font-semibold mt-1">
            Formula HPP Presisi = Dibulatkan ke Ratusan Ke Atas (Tanpa Satuan / Puluhan)
          </p>
        </div>

        <button
          type="submit"
          disabled={pendingBatches.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-bold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Kalkulasi HPP & Tambah Stok
        </button>
      </form>
    </ModalWrapper>
  );
}
