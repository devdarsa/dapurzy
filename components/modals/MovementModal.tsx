'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';

interface MovementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  mitras: Mitra[];
  onSubmit: (data: {
    productId: string;
    type: 'GUDANG_TO_MITRA' | 'MITRA_TO_GUDANG' | 'RETUR' | 'RUSAK' | 'HILANG';
    mitraId: string;
    quantity: number;
    note?: string;
  }) => void;
}

export default function MovementModal({ isOpen, onClose, products, mitras, onSubmit }: MovementModalProps) {
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [type, setType] = useState<'GUDANG_TO_MITRA' | 'MITRA_TO_GUDANG' | 'RETUR' | 'RUSAK' | 'HILANG'>('GUDANG_TO_MITRA');
  const [selectedMitraId, setSelectedMitraId] = useState<string>(mitras[0]?.id || '');
  const [qtyInput, setQtyInput] = useState<string>('10');
  const [note, setNote] = useState<string>('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawQty = parseFormattedNumber(qtyInput) || 1;
    onSubmit({
      productId: selectedProductId || products[0]?.id || '',
      type,
      mitraId: selectedMitraId || mitras[0]?.id || '',
      quantity: rawQty,
      note,
    });
    setQtyInput('10');
    setNote('');
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setQtyInput(formatted);
  };

  return (
    <ModalWrapper title="Transfer / Pergerakan Stok" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Pilih Produk</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Jenis Pergerakan</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
          >
            <option value="GUDANG_TO_MITRA">Gudang ➔ Titip ke Mitra</option>
            <option value="MITRA_TO_GUDANG">Mitra ➔ Tarik ke Gudang</option>
            <option value="RETUR">Retur Barang dari Mitra</option>
            <option value="RUSAK">Barang Rusak (Penyusutan)</option>
            <option value="HILANG">Barang Hilang (Penyusutan)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Tujuan / Asal Mitra</label>
          <select
            value={selectedMitraId}
            onChange={(e) => setSelectedMitraId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
          >
            {mitras.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Jumlah (Pcs)</label>
          <input
            type="text"
            required
            value={qtyInput}
            onChange={handleQtyChange}
            placeholder="10"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-blue-700 text-sm sm:text-base focus:ring-2 focus:ring-blue-500 outline-none"
          />
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Titip stok mingguan"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          Proses Pergerakan Stok
        </button>
      </form>
    </ModalWrapper>
  );
}
