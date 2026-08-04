'use client';

import React from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface SaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  mitras: Mitra[];
  onSubmit: (data: {
    productId: string;
    quantity: number;
    locationType: 'gudang' | 'mitra';
    mitraId?: string | null;
    paymentMethod?: string;
  }) => void;
}

export default function SaleModal({ isOpen, onClose, products, mitras, onSubmit }: SaleModalProps) {
  if (!isOpen) return null;

  return (
    <ModalWrapper title="Input Penjualan Produk" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            productId: String(formData.get('productId') || ''),
            quantity: Number(formData.get('quantity') || 0),
            locationType: formData.get('locationType') as 'gudang' | 'mitra',
            mitraId: String(formData.get('mitraId') || '') || null,
            paymentMethod: String(formData.get('paymentMethod') || 'CASH'),
          });
        }}
        className="space-y-3 text-xs"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Produk Terjual</label>
          <select name="productId" required className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - Harga: {formatRupiah(p.price)} (HPP: {formatRupiah(p.avgHpp)})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Sumber Stok Barang</label>
          <select name="locationType" required className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            <option value="gudang">Gudang Utama (Penjualan Direct)</option>
            <option value="mitra">Mitra Titipan / Konsinyasi</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Pilih Mitra (Jika dari Mitra)</label>
          <select name="mitraId" className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            {mitras.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Jumlah Terjual (Pcs)</label>
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
          <label className="block font-bold text-slate-600 mb-1">Metode Pembayaran</label>
          <select name="paymentMethod" className="w-full p-2.5 rounded-xl border border-slate-300 font-medium">
            <option value="CASH">Tunai (Cash)</option>
            <option value="QRIS">QRIS / Transfer Bank</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Simpan Penjualan & Pengakuan Laba
        </button>
      </form>
    </ModalWrapper>
  );
}
