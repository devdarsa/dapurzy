'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber, calculatePrecisionHpp } from '@/lib/utils';
import { ChefHat, AlertCircle, CheckCircle2 } from 'lucide-react';

interface PengolahanModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableBatches: PurchaseBatch[];
  products: Product[];
  // D2 FIX: Jika diisi, batch ini akan otomatis dipilih di dropdown saat modal dibuka
  initialBatchId?: string;
  onOpenBelanjaModal?: () => void;
  onSubmit: (data: {
    batchId: string;
    productId: string;
    producedQty: number;
    calculatedHpp: number;
  }) => void;
}

export default function PengolahanModal({
  isOpen,
  onClose,
  availableBatches,
  products,
  initialBatchId,
  onOpenBelanjaModal,
  onSubmit,
}: PengolahanModalProps) {
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [producedQtyInput, setProducedQtyInput] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      setProducedQtyInput('');
      // D2 FIX: Jika initialBatchId diberikan, gunakan sebagai pilihan awal
      // Jika tidak ditemukan di daftar tersedia, fallback ke batch pertama
      const targetBatch = initialBatchId
        ? availableBatches.find((b) => b.batchId === initialBatchId)
        : null;
      if (targetBatch) {
        setSelectedBatchId(targetBatch.batchId);
      } else if (availableBatches.length > 0) {
        setSelectedBatchId(availableBatches[0].batchId);
      } else {
        setSelectedBatchId('');
      }
      if (products.length > 0) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [isOpen, availableBatches, products, initialBatchId]);

  const selectedBatch = useMemo(
    () => availableBatches.find((b) => b.batchId === selectedBatchId),
    [availableBatches, selectedBatchId]
  );

  const totalCost = selectedBatch?.totalCost || 0;
  const producedQty = parseFormattedNumber(producedQtyInput);

  // Calculate precision HPP: Nominal Batch / Jumlah Hasil Production
  const calculatedHpp = useMemo(() => {
    return calculatePrecisionHpp(totalCost, producedQty);
  }, [totalCost, producedQty]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBatchId) {
      alert('Pilih Batch Belanja yang masih Tersedia!');
      return;
    }
    if (!selectedProductId) {
      alert('Pilih Produk Olahan!');
      return;
    }
    if (producedQty <= 0) {
      alert('Jumlah Hasil Produksi (PCS) harus lebih dari 0!');
      return;
    }

    onSubmit({
      batchId: selectedBatchId,
      productId: selectedProductId,
      producedQty,
      calculatedHpp,
    });
  };

  return (
    <ModalWrapper title="🍳 Modul Pembuatan / Pengolahan Produk" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
        {availableBatches.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-3 my-2">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h4 className="font-extrabold text-amber-900 text-sm sm:text-base">Tidak Ada Batch Belanja Tersedia</h4>
            <p className="text-xs text-amber-700 leading-relaxed max-w-xs mx-auto">
              Semua Batch Belanja telah terpakai atau belum ada transaksi belanja. Silakan buat <b>Batch Belanja</b> baru terlebih dahulu!
            </p>
            {onOpenBelanjaModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenBelanjaModal();
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-md transition cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 mx-auto mt-2"
              >
                <span>🛒 + Buat Batch Belanja Baru Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <>
            {/* 1. Pilih Batch Belanja Tersedia */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
              <label className="block font-bold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
                <ChefHat className="w-4 h-4 text-emerald-700" />
                <span>1. Pilih Batch Belanja (Status: Tersedia)</span>
              </label>
              <select
                value={selectedBatchId}
                onChange={(e) => setSelectedBatchId(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800 text-xs sm:text-sm"
              >
                {availableBatches.map((b) => (
                  <option key={b.id} value={b.batchId}>
                    {b.batchId} - {b.itemsDescription} ({formatRupiah(b.totalCost)})
                  </option>
                ))}
              </select>

              {selectedBatch && (
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-bold block">Detail Batch Terpilih:</span>
                    <span className="font-extrabold text-slate-800">{selectedBatch.itemsDescription}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-bold block">Nominal Belanja:</span>
                    <span className="font-black text-rose-600">{formatRupiah(selectedBatch.totalCost)}</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Pilih Nama Produk */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">2. Pilih Nama Produk Hasil Pengolahan</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-slate-800"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Kategori: {p.category} | Harga Jual: {formatRupiah(p.price)})
                  </option>
                ))}
              </select>
            </div>

            {/* 3. Jumlah Hasil (PCS) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">3. Jumlah Hasil Produksi (PCS)</label>
              <input
                type="text"
                value={producedQtyInput}
                onChange={(e) => setProducedQtyInput(formatNumberWithDots(e.target.value))}
                placeholder="Contoh: 100"
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base"
              />
            </div>

            {/* Banner Otomatis HPP Kalkulasi */}
            {producedQty > 0 && totalCost > 0 && (
              <div className="bg-amber-50 border border-amber-300 rounded-2xl p-3.5 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-bold text-amber-900">Perhitungan Otomatis HPP per Unit:</p>
                  <p className="text-xs text-amber-800 font-medium">({formatRupiah(totalCost)} ÷ {producedQty} pcs)</p>
                </div>
                <span className="text-sm sm:text-base font-black text-amber-900 bg-white px-3 py-1.5 rounded-xl border border-amber-300 shadow-sm">
                  {formatRupiah(calculatedHpp)} / unit
                </span>
              </div>
            )}

            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-[11px] text-slate-500 space-y-1">
              <p className="flex items-center gap-1 font-bold text-slate-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Setelah Pengolahan Selesai:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-slate-600 pl-1">
                <li>Status Batch akan otomatis berubah menjadi <b>Habis</b>.</li>
                <li>{producedQty || 0} pcs produk jadi akan ditambahkan ke <b>Stok Produk Jadi (Gudang)</b>.</li>
              </ul>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-sm sm:text-base mt-2"
            >
              🚀 Selesaikan Pengolahan & Update Stok Produk Jadi
            </button>
          </>
        )}
      </form>
    </ModalWrapper>
  );
}
