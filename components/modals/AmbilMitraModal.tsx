'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import EmptyPrerequisiteState from './EmptyPrerequisiteState';
import { Mitra, Product, ProductStock } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { Truck, Package, AlertCircle, PlusCircle } from 'lucide-react';

interface AmbilMitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  mitras: Mitra[];
  products: Product[];
  stocks: ProductStock[];
  onOpenMitraModal?: () => void;
  onOpenProductModal?: () => void;
  onSubmit: (data: {
    mitraId: string;
    productId: string;
    quantity: number;
    note?: string;
  }) => void;
}

export default function AmbilMitraModal({
  isOpen,
  onClose,
  mitras,
  products,
  stocks,
  onOpenMitraModal,
  onOpenProductModal,
  onSubmit,
}: AmbilMitraModalProps) {
  const [selectedMitraId, setSelectedMitraId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantityInput, setQuantityInput] = useState<string>('');
  const [note, setNote] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setQuantityInput('');
      setNote('');
      if (mitras.length > 0) setSelectedMitraId(mitras[0].id);
      if (products.length > 0) setSelectedProductId(products[0].id);
    }
  }, [isOpen, mitras, products]);

  // Current stock count in warehouse (Stok Produk Jadi)
  const currentWarehouseStock = useMemo(() => {
    const stk = stocks.find((s) => s.productId === selectedProductId && s.locationType === 'gudang');
    return stk ? stk.quantity : 0;
  }, [stocks, selectedProductId]);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const selectedMitra = useMemo(
    () => mitras.find((m) => m.id === selectedMitraId),
    [mitras, selectedMitraId]
  );

  if (!isOpen) return null;

  const quantity = parseFormattedNumber(quantityInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMitraId) {
      alert('Pilih Mitra Konsinyasi / Toko!');
      return;
    }
    if (!selectedProductId) {
      alert('Pilih Produk Jadi yang diambil!');
      return;
    }
    if (quantity <= 0) {
      alert('Jumlah produk diambil harus lebih dari 0 pcs!');
      return;
    }
    if (quantity > currentWarehouseStock) {
      alert(`Stok Produk Jadi tidak mencukupi! Tersedia di Gudang: ${currentWarehouseStock} pcs, ingin diambil: ${quantity} pcs.`);
      return;
    }

    onSubmit({
      mitraId: selectedMitraId,
      productId: selectedProductId,
      quantity,
      note: note || `Ambil produk oleh ${selectedMitra?.name || 'Mitra'}`,
    });
  };

  return (
    <ModalWrapper title="🚚 Modul Ambil Produk Mitra (Titip Barang)" onClose={onClose}>
      {mitras.length === 0 ? (
        <EmptyPrerequisiteState
          title="Belum Ada Data Mitra Titipan!"
          description="Anda belum mendaftarkan Warung atau Kantin Mitra. Daftarkan Mitra pertama Anda terlebih dahulu untuk pengambilan barang!"
          buttonText="+ Tambah Mitra Baru Sekarang"
          onButtonClick={() => {
            onClose();
            if (onOpenMitraModal) onOpenMitraModal();
          }}
          colorScheme="amber"
        />
      ) : products.length === 0 ? (
        <EmptyPrerequisiteState
          title="Belum Ada Master Produk!"
          description="Belum ada produk yang didaftarkan. Daftarkan Produk pertama Anda untuk mulai pengambilan!"
          buttonText="+ Tambah Master Produk Sekarang"
          onButtonClick={() => {
            onClose();
            if (onOpenProductModal) onOpenProductModal();
          }}
          colorScheme="purple"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <>
            {/* 1. Pilih Mitra */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-emerald-600" /> Pilih Mitra / Warung / Toko
              </label>
              <select
                value={selectedMitraId}
                onChange={(e) => setSelectedMitraId(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {mitras.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.type} - {m.address || 'Tanpa Alamat'})
                  </option>
                ))}
              </select>
            </div>

            {/* 2. Pilih Produk Jadi */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-600" /> Pilih Produk Jadi (Hasil Pengolahan)
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {products.map((p) => {
                  const stk = stocks.find((s) => s.productId === p.id && s.locationType === 'gudang')?.quantity || 0;
                  return (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok Jadi Gudang: {stk} pcs)
                    </option>
                  );
                })}
              </select>
            </div>

            {/* Banner Informasi Sisa Stok Produk Jadi Gudang */}
            <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex justify-between items-center text-xs">
              <div>
                <span className="text-[10px] text-slate-500 font-bold block">Stok Produk Jadi Gudang Saat Ini:</span>
                <span className="text-sm font-black text-emerald-800">
                  {currentWarehouseStock} pcs {selectedProduct ? `(${selectedProduct.name})` : ''}
                </span>
              </div>
              <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded-lg font-bold">
                Tersedia
              </span>
            </div>

            {/* 3. Jumlah Produk Diambil (PCS) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Jumlah Diambil oleh Mitra (PCS)</label>
              <input
                type="text"
                value={quantityInput}
                onChange={(e) => setQuantityInput(formatNumberWithDots(e.target.value))}
                placeholder="Contoh: 20"
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base"
              />
            </div>

            {/* Catatan (Opsional) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan Pengambilan (Opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Contoh: Pengambilan rutin Selasa pagi"
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-sm sm:text-base mt-2"
            >
              📦 Simpan Pengambilan Mitra & Kurangi Stok Gudang
            </button>
          </>
        </form>
      )}
    </ModalWrapper>
  );
}
