'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber, calculatePrecisionHpp } from '@/lib/utils';

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
  const pendingBatches = purchaseBatches.filter((b) => b.status === 'pending_production');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(pendingBatches[0]?.batchId || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [qtyInput, setQtyInput] = useState<string>('100');

  if (!isOpen) return null;

  const currentBatch = pendingBatches.find((b) => b.batchId === (selectedBatchId || pendingBatches[0]?.batchId));
  const rawQty = parseFormattedNumber(qtyInput) || 1;
  const estimatedHpp = currentBatch ? calculatePrecisionHpp(currentBatch.totalCost, rawQty) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      batchId: selectedBatchId || pendingBatches[0]?.batchId || '',
      productId: selectedProductId || products[0]?.id || '',
      producedQty: rawQty,
    });
    setQtyInput('100');
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setQtyInput(formatted);
  };

  return (
    <ModalWrapper title="Tarik Belanja Jadi Produksi (HPP Auto)" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Pilih Batch Belanja Bahan Baku</label>
          <select
            value={selectedBatchId}
            onChange={(e) => setSelectedBatchId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-amber-300 font-bold bg-amber-50 focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {pendingBatches.map((b) => (
              <option key={b.batchId} value={b.batchId}>
                {b.batchId} — Biaya: {formatRupiah(b.totalCost)} ({b.itemsDescription.slice(0, 25)}...)
              </option>
            ))}
          </select>
          {pendingBatches.length === 0 && (
            <p className="text-xs text-rose-500 font-bold mt-1">
              Belum ada batch belanja pending. Input belanja bahan terlebih dahulu.
            </p>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Barang Hasil Produksi</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Jumlah Hasil Produksi (Pcs)</label>
          <input
            type="text"
            required
            value={qtyInput}
            onChange={handleQtyChange}
            placeholder="100"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-purple-700 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
        </div>

        {/* REAL-TIME HPP ESTIMATION CARD */}
        {currentBatch && (
          <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex justify-between items-center text-xs">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Biaya Batch</span>
              <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{formatRupiah(currentBatch.totalCost)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Auto-HPP Presisi (Ratusan Ke Atas)</span>
              <span className="font-black text-purple-700 text-xs sm:text-sm">{formatRupiah(estimatedHpp)} / pcs</span>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={pendingBatches.length === 0}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          Kalkulasi HPP & Tambah Stok
        </button>
      </form>
    </ModalWrapper>
  );
}
