'use client';

import React, { useState, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra, ProductStock } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { RefreshCw, Calculator, ArrowDownLeft, ShoppingBag } from 'lucide-react';

interface MitraSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  mitras: Mitra[];
  stocks: ProductStock[];
  onSubmit: (data: {
    mitraId: string;
    productId: string;
    returnedQty: number;
    paymentMethod: string;
  }) => void;
}

export default function MitraSettlementModal({
  isOpen,
  onClose,
  products,
  mitras,
  stocks,
  onSubmit,
}: MitraSettlementModalProps) {
  const [selectedMitraId, setSelectedMitraId] = useState<string>(mitras[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');
  const [returnedQtyInput, setReturnedQtyInput] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

  if (!isOpen) return null;

  // Selected Product & Current Mitra Stock
  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const mitraStockItem = stocks.find(
    (s) => s.locationType === 'mitra' && s.mitraId === selectedMitraId && s.productId === selectedProductId
  );
  const currentMitraQty = mitraStockItem ? mitraStockItem.quantity : 0;

  // Real-time calculation: Sold Qty = Initial Stock - Returned Qty
  const returnedQty = Math.min(Math.max(0, returnedQtyInput), currentMitraQty);
  const soldQty = Math.max(0, currentMitraQty - returnedQty);

  const totalOmzet = soldQty * (selectedProduct?.price || 0);
  const totalHpp = soldQty * (selectedProduct?.avgHpp || 0);
  const netProfit = totalOmzet - totalHpp;

  return (
    <ModalWrapper title="Laporan Laku & Retur Mitra (Settlement 1-Tap)" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            mitraId: selectedMitraId,
            productId: selectedProductId,
            returnedQty: Number(returnedQty),
            paymentMethod,
          });
        }}
        className="space-y-3 sm:space-y-4 text-xs sm:text-sm"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">1. Pilih Mitra Titipan</label>
          <select
            value={selectedMitraId}
            onChange={(e) => setSelectedMitraId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {mitras.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.type})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">2. Pilih Produk Konsinyasi</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} - Harga: {formatRupiah(p.price)}
              </option>
            ))}
          </select>
        </div>

        {/* Info Stok Aktual di Mitra */}
        <div className="p-3 sm:p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
          <div>
            <span className="text-[10px] sm:text-xs text-amber-800 font-bold uppercase tracking-wider block">
              Stok Dititipkan Saat Ini
            </span>
            <span className="text-xl sm:text-2xl font-black text-amber-950">{currentMitraQty} pcs</span>
          </div>
          <RefreshCw className="w-6 h-6 text-amber-600" />
        </div>

        {/* Input Jumlah Barang Dikembalikan (Retur ke Gudang) */}
        <div>
          <label className="block font-bold text-slate-600 mb-1">
            3. Jumlah Barang Dikembalikan ke Gudang (Pcs)
          </label>
          <input
            type="number"
            min="0"
            max={currentMitraQty}
            value={returnedQtyInput}
            onChange={(e) => setReturnedQtyInput(Number(e.target.value))}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-black text-base text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none"
          />
          <p className="text-[10px] sm:text-xs text-slate-400 mt-1">
            Sisa barang yang dibawa pulang owner kembali ke Gudang Utama.
          </p>
        </div>

        {/* LIVE CALCULATION RESULT PREVIEW */}
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs sm:text-sm border-b border-emerald-200 pb-1.5">
            <Calculator className="w-4 h-4 text-emerald-700" /> Kalkulasi Otomatis Sistem
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs sm:text-sm">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-semibold">1. Laku Terjual:</span>
              <span className="font-black text-emerald-700 text-sm sm:text-base">{soldQty} pcs</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-semibold">2. Sisa Retur Gudang:</span>
              <span className="font-black text-blue-700 text-sm sm:text-base">{returnedQty} pcs</span>
            </div>
          </div>

          <div className="pt-1 flex justify-between items-center text-xs sm:text-sm">
            <div>
              <span className="text-[10px] text-slate-500 block">Total Omzet Penjualan:</span>
              <span className="font-extrabold text-emerald-800">{formatRupiah(totalOmzet)}</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block">Estimasi Laba Bersih:</span>
              <span className="font-black text-amber-600">{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">4. Metode Pembayaran</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium"
          >
            <option value="CASH">Tunai (Cash dari Mitra)</option>
            <option value="QRIS">Transfer / QRIS</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={currentMitraQty <= 0}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-extrabold py-3.5 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Proses Laku {soldQty} pcs & Retur {returnedQty} pcs
        </button>
      </form>
    </ModalWrapper>
  );
}
