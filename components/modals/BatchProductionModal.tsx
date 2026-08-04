'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber, calculatePrecisionHpp } from '@/lib/utils';

interface BatchProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  mitras: Mitra[];
  onSubmit: (data: {
    itemsDescription: string;
    totalCost: number;
    productId: string;
    producedQty: number;
    calculatedHpp: number;
    allocations: Array<{
      mitraId: string;
      quantity: number;
      pricePerUnit: number;
    }>;
  }) => void;
}

export default function BatchProductionModal({
  isOpen,
  onClose,
  products,
  mitras,
  onSubmit,
}: BatchProductionModalProps) {
  const [itemsDescription, setItemsDescription] = useState<string>('');
  const [totalCostInput, setTotalCostInput] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [producedQtyInput, setProducedQtyInput] = useState<string>('');
  
  // State per-mitra titip quantity: { [mitraId]: number }
  const [mitraAllocations, setMitraAllocations] = useState<Record<string, number>>({});

  useEffect(() => {
    if (isOpen) {
      setItemsDescription('');
      setTotalCostInput('');
      setProducedQtyInput('');
      setMitraAllocations({});
      if (products.length > 0) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [isOpen, products]);

  const totalCost = parseFormattedNumber(totalCostInput);
  const producedQty = parseFormattedNumber(producedQtyInput);
  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId), [products, selectedProductId]);

  const calculatedHpp = useMemo(() => {
    return calculatePrecisionHpp(totalCost, producedQty);
  }, [totalCost, producedQty]);

  // Sum of quantities allocated to all mitras
  const totalAllocatedToMitra = useMemo(() => {
    return Object.values(mitraAllocations).reduce((sum, q) => sum + (Number(q) || 0), 0);
  }, [mitraAllocations]);

  // Auto-calculated sisa produk di rumah
  const remainingForHome = useMemo(() => {
    return Math.max(0, producedQty - totalAllocatedToMitra);
  }, [producedQty, totalAllocatedToMitra]);

  const homePrice = selectedProduct?.price || 0;
  const estimatedHomeOmzet = remainingForHome * homePrice;

  if (!isOpen) return null;

  const handleMitraQtyChange = (mitraId: string, valStr: string) => {
    const val = Number(valStr.replace(/\D/g, '')) || 0;
    setMitraAllocations((prev) => ({
      ...prev,
      [mitraId]: val,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemsDescription || totalCost <= 0 || !selectedProductId || producedQty <= 0) {
      alert('Mohon isi deskripsi belanja, nominal biaya, produk, dan total hasil produksi!');
      return;
    }

    if (totalAllocatedToMitra > producedQty) {
      alert(`Jumlah titipan ke mitra (${totalAllocatedToMitra} pcs) melebihi total produksi (${producedQty} pcs)!`);
      return;
    }

    const allocationsList: Array<{ mitraId: string; quantity: number; pricePerUnit: number }> = [];

    // Filter non-zero mitra allocations
    Object.entries(mitraAllocations).forEach(([mId, q]) => {
      if (q > 0) {
        const m = mitras.find((x) => x.id === mId);
        let customP = homePrice;
        if (m && m.customPrices) {
          const pricesMap = typeof m.customPrices === 'string' ? JSON.parse(m.customPrices) : m.customPrices;
          if (pricesMap && pricesMap[selectedProductId] && Number(pricesMap[selectedProductId]) > 0) {
            customP = Number(pricesMap[selectedProductId]);
          }
        }
        allocationsList.push({
          mitraId: mId,
          quantity: q,
          pricePerUnit: customP,
        });
      }
    });

    onSubmit({
      itemsDescription,
      totalCost,
      productId: selectedProductId,
      producedQty,
      calculatedHpp,
      allocations: allocationsList,
    });
  };

  return (
    <ModalWrapper title="📦 Belanja Bahan & Input Produksi Batch" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm max-h-[80vh] overflow-y-auto pr-1">
        {/* 1. Belanja Bahan */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 space-y-3">
          <h3 className="font-extrabold text-emerald-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🛒 1. Catat Belanja Bahan (Modal Keluar)</span>
          </h3>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Rincian Belanja Bahan</label>
            <input
              type="text"
              value={itemsDescription}
              onChange={(e) => setItemsDescription(e.target.value)}
              placeholder="Contoh: Tepung 10kg, Gula 5kg, Telur 3kg"
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Total Biaya Belanja (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 font-extrabold text-slate-400">Rp</span>
              <input
                type="text"
                value={totalCostInput}
                onChange={(e) => setTotalCostInput(formatNumberWithDots(e.target.value))}
                placeholder="100.000"
                required
                className="w-full pl-10 p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base"
              />
            </div>
          </div>
        </div>

        {/* 2. Hasil Produksi */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-3.5 space-y-3">
          <h3 className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs sm:text-sm">
            <span>🍞 2. Hasil Produk Jadi & HPP</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-600 mb-1">Pilih Produk Hasil</label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Eceran: {formatRupiah(p.price)})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-600 mb-1">Total Hasil (Pcs)</label>
              <input
                type="text"
                value={producedQtyInput}
                onChange={(e) => setProducedQtyInput(formatNumberWithDots(e.target.value))}
                placeholder="100"
                required
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base"
              />
            </div>
          </div>

          {/* Banner HPP Terkalkulasi */}
          {producedQty > 0 && totalCost > 0 && (
            <div className="bg-amber-100/80 border border-amber-300 rounded-xl p-2.5 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold text-amber-800">Estimasi HPP per Unit:</p>
                <p className="text-xs text-amber-900 font-medium">({formatRupiah(totalCost)} ÷ {producedQty} pcs)</p>
              </div>
              <span className="text-base font-extrabold text-amber-900 bg-white px-3 py-1 rounded-lg border border-amber-300 shadow-sm">
                {formatRupiah(calculatedHpp)} / unit
              </span>
            </div>
          )}
        </div>

        {/* 3. Alokasi Titip Mitra & Auto-Sales Rumah */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
          <h3 className="font-extrabold text-slate-800 flex items-center justify-between text-xs sm:text-sm">
            <span>🤝 3. Titip Produk ke Mitra (Opsional)</span>
            <span className="text-[10px] text-slate-500 font-medium">Sisa otomatis ke Rumah</span>
          </h3>

          {mitras.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Belum ada data Mitra. Seluruh hasil produksi ({producedQty} pcs) akan dialokasikan untuk Jual di Rumah.</p>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {mitras.map((m) => {
                let customP = homePrice;
                if (m.customPrices) {
                  const pricesMap = typeof m.customPrices === 'string' ? JSON.parse(m.customPrices) : m.customPrices;
                  if (pricesMap && pricesMap[selectedProductId] && Number(pricesMap[selectedProductId]) > 0) {
                    customP = Number(pricesMap[selectedProductId]);
                  }
                }
                return (
                  <div key={m.id} className="flex items-center justify-between bg-white p-2.5 rounded-xl border border-slate-200 gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-extrabold text-slate-800 truncate">{m.name}</p>
                      <p className="text-[10px] text-emerald-700 font-bold">Harga Mitra: {formatRupiah(customP)}</p>
                    </div>
                    <div className="w-28 flex items-center gap-1">
                      <input
                        type="number"
                        min="0"
                        max={producedQty}
                        value={mitraAllocations[m.id] || ''}
                        onChange={(e) => handleMitraQtyChange(m.id, e.target.value)}
                        placeholder="0"
                        className="w-full p-2 text-right font-extrabold text-slate-800 bg-slate-50 rounded-lg border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                      <span className="text-xs text-slate-400 font-bold">pcs</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Auto-Calculated Home Allocation Summary */}
          {producedQty > 0 && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-extrabold text-emerald-900">🏡 Alokasi Jual di Rumah (Auto):</p>
                <p className="text-[11px] text-emerald-700 font-medium">
                  {producedQty} - {totalAllocatedToMitra} pcs titip = <strong className="text-emerald-900 font-black">{remainingForHome} pcs</strong>
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-emerald-600 font-bold">Potensi Omset Rumah</p>
                <p className="text-sm font-black text-emerald-800">{formatRupiah(estimatedHomeOmzet)}</p>
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg mt-2 active:scale-95 transition cursor-pointer text-sm sm:text-base"
        >
          🚀 Simpan Batch Produksi & Distribusi
        </button>
      </form>
    </ModalWrapper>
  );
}
