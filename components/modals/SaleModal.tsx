'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';

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
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [locationType, setLocationType] = useState<'gudang' | 'mitra'>('gudang');
  const [mitraId, setMitraId] = useState<string>(mitras[0]?.id || '');
  const [qtyInput, setQtyInput] = useState<string>('1');
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === (selectedProductId || products[0]?.id));
  const rawQty = parseFormattedNumber(qtyInput) || 1;
  const totalOmzet = currentProduct ? rawQty * currentProduct.price : 0;
  const totalProfit = currentProduct ? rawQty * (currentProduct.price - currentProduct.avgHpp) : 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      productId: selectedProductId || products[0]?.id || '',
      quantity: rawQty,
      locationType,
      mitraId: locationType === 'mitra' ? mitraId : null,
      paymentMethod,
    });
    setQtyInput('1');
  };

  const handleQtyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setQtyInput(formatted);
  };

  return (
    <ModalWrapper title="Input Penjualan Produk & Laba" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Produk Terjual</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} — Harga: {formatRupiah(p.price)} (HPP: {formatRupiah(p.avgHpp)})
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Sumber Stok</label>
            <select
              value={locationType}
              onChange={(e) => setLocationType(e.target.value as 'gudang' | 'mitra')}
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
            >
              <option value="gudang">Gudang Utama (Direct)</option>
              <option value="mitra">Mitra Konsinyasi</option>
            </select>
          </div>

          {locationType === 'mitra' && (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Pilih Mitra</label>
              <select
                value={mitraId}
                onChange={(e) => setMitraId(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
              >
                {mitras.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.type})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Jumlah Terjual (Pcs)</label>
          <input
            type="text"
            required
            value={qtyInput}
            onChange={handleQtyChange}
            placeholder="1"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 text-sm sm:text-base outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <p className="text-[11px] text-slate-500 mt-1">Otomatis pemisah titik ribuan saat mengetik</p>
        </div>

        {/* REAL-TIME TOTAL CALCULATIONS */}
        <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 grid grid-cols-2 gap-2 text-xs">
          <div>
            <span className="text-[10px] text-slate-500 block">Total Omzet Penjualan</span>
            <span className="font-extrabold text-slate-800 text-xs sm:text-sm">{formatRupiah(totalOmzet)}</span>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-500 block">Estimasi Laba Bersih</span>
            <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">{formatRupiah(totalProfit)}</span>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
          >
            <option value="CASH">Tunai (Cash)</option>
            <option value="QRIS">QRIS / Transfer Bank</option>
          </select>
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          Simpan Penjualan & Pengakuan Laba
        </button>
      </form>
    </ModalWrapper>
  );
}
