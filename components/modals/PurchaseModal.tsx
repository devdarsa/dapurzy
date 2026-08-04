'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { itemsDescription: string; totalCost: number; supplier: string }) => void;
}

export default function PurchaseModal({ isOpen, onClose, onSubmit }: PurchaseModalProps) {
  const [itemsDescription, setItemsDescription] = useState('');
  const [totalCostInput, setTotalCostInput] = useState('');
  const [supplier, setSupplier] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawCost = parseFormattedNumber(totalCostInput);
    onSubmit({ itemsDescription, totalCost: rawCost, supplier });
    setItemsDescription('');
    setTotalCostInput('');
    setSupplier('');
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setTotalCostInput(formatted);
  };

  return (
    <ModalWrapper title="Tambah Batch Belanja Bahan Baku" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Supplier / Toko Bahan</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. Toko Bahan Kue Mulia, Pasar Cihapit"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Rincian Belanja Bahan Baku</label>

          <textarea
            required
            rows={2}
            value={itemsDescription}
            onChange={(e) => setItemsDescription(e.target.value)}
            placeholder="e.g. Susu Kental 5 kaleng, Cokelat Bubuk 1kg, Plastik Es 2 pax"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Total Biaya Belanja (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
            <input
              type="text"
              required
              value={totalCostInput}
              onChange={handleCostChange}
              placeholder="200.000"
              className="w-full p-2.5 sm:p-3 pl-10 rounded-xl border border-slate-300 font-extrabold text-amber-700 focus:ring-2 focus:ring-amber-500 outline-none text-sm sm:text-base"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
        </div>

        <button
          type="submit"
          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          Simpan Batch Belanja
        </button>
      </form>
    </ModalWrapper>
  );
}
