'use client';

import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';

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
  if (!isOpen) return null;

  return (
    <ModalWrapper title="Transfer / Pergerakan Stok" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            productId: String(formData.get('productId') || ''),
            type: formData.get('type') as any,
            mitraId: String(formData.get('mitraId') || ''),
            quantity: Number(formData.get('quantity') || 0),
            note: String(formData.get('note') || ''),
          });
        }}
        className="space-y-3 text-xs"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Pilih Produk</label>
          <select name="productId" required className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Jenis Pergerakan</label>
          <select name="type" required className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            <option value="GUDANG_TO_MITRA">Gudang ➔ Titip ke Mitra</option>
            <option value="MITRA_TO_GUDANG">Mitra ➔ Tarik ke Gudang</option>
            <option value="RETUR">Retur Barang dari Mitra</option>
            <option value="RUSAK">Barang Rusak (Penyusutan)</option>
            <option value="HILANG">Barang Hilang (Penyusutan)</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Tujuan / Asal Mitra</label>
          <select name="mitraId" required className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            {mitras.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Jumlah (Pcs)</label>
          <input
            type="number"
            name="quantity"
            min="1"
            defaultValue="1"
            required
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Catatan</label>
          <input
            type="text"
            name="note"
            placeholder="Opsional"
            className="w-full p-2.5 rounded-xl border border-slate-300"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Proses Pergerakan Stok
        </button>
      </form>
    </ModalWrapper>
  );
}
