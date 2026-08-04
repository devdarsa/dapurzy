'use client';

import React from 'react';
import ModalWrapper from '../ModalWrapper';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { itemsDescription: string; totalCost: number; supplier: string }) => void;
}

export default function PurchaseModal({ isOpen, onClose, onSubmit }: PurchaseModalProps) {
  if (!isOpen) return null;

  return (
    <ModalWrapper title="1. Input Belanja Bahan Baku (Batch Baru)" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            itemsDescription: String(formData.get('itemsDescription') || ''),
            totalCost: Number(formData.get('totalCost') || 0),
            supplier: String(formData.get('supplier') || ''),
          });
        }}
        className="space-y-3 text-xs"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Rincian Belanja Bahan Baku</label>
          <textarea
            name="itemsDescription"
            required
            rows={2}
            placeholder="Contoh: Susu 5 kaleng, Cokelat 2kg, Plastik es, Gas 3kg"
            className="w-full p-2.5 rounded-xl border border-slate-300 font-medium text-xs focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Total Biaya Belanja Modal (Rp)</label>
          <input
            type="number"
            name="totalCost"
            min="1000"
            defaultValue="150000"
            required
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Supplier / Toko Pembelian</label>
          <input
            type="text"
            name="supplier"
            placeholder="Misal: Toko Bahan Kue Mulia"
            className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Simpan Batch Belanja
        </button>
      </form>
    </ModalWrapper>
  );
}
