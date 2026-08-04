'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber, calculatePrecisionHpp } from '@/lib/utils';
import { Plus, Trash2, Calculator, Check, AlertTriangle, PackageCheck } from 'lucide-react';

export interface ProductionOutputItem {
  id: string;
  productId: string;
  allocatedCost: number;
  producedQty: number;
  calculatedHpp: number;
}

interface ProductionModalProps {
  isOpen: boolean;
  onClose: () => void;
  purchaseBatches: PurchaseBatch[];
  products: Product[];
  onSubmit: (data: {
    batchId: string;
    outputs: Array<{
      productId: string;
      allocatedCost: number;
      producedQty: number;
      calculatedHpp: number;
    }>;
  }) => void;
}

export default function ProductionModal({
  isOpen,
  onClose,
  purchaseBatches = [],
  products = [],
  onSubmit,
}: ProductionModalProps) {
  const pendingBatches = purchaseBatches.filter((b) => b.status === 'pending_production');
  const [selectedBatchId, setSelectedBatchId] = useState<string>('');
  const [outputs, setOutputs] = useState<ProductionOutputItem[]>([]);

  // Keypad State
  const [keypadTarget, setKeypadTarget] = useState<{
    isOpen: boolean;
    outputIndex: number;
    field: 'allocatedCost' | 'producedQty';
    initialValue: number;
    title: string;
  }>({
    isOpen: false,
    outputIndex: 0,
    field: 'allocatedCost',
    initialValue: 0,
    title: '',
  });

  // Selected Batch
  const currentBatch = pendingBatches.find(
    (b) => b.batchId === (selectedBatchId || pendingBatches[0]?.batchId)
  );

  // Initialize outputs when batch or modal changes
  useEffect(() => {
    if (!isOpen) return;
    if (pendingBatches.length > 0) {
      const bId = selectedBatchId || pendingBatches[0].batchId;
      setSelectedBatchId(bId);
      const batchObj = pendingBatches.find((b) => b.batchId === bId) || pendingBatches[0];
      const defaultProductId = products[0]?.id || '';
      const totalCost = batchObj ? batchObj.totalCost : 0;

      setOutputs([
        {
          id: '1',
          productId: defaultProductId,
          allocatedCost: totalCost,
          producedQty: 100,
          calculatedHpp: calculatePrecisionHpp(totalCost, 100),
        },
      ]);
    } else {
      setSelectedBatchId('');
      setOutputs([]);
    }
  }, [isOpen, selectedBatchId]);

  if (!isOpen) return null;

  const totalCost = currentBatch ? currentBatch.totalCost : 0;
  const totalAllocatedCost = outputs.reduce((sum, o) => sum + (o.allocatedCost || 0), 0);
  const totalProducedQty = outputs.reduce((sum, o) => sum + (o.producedQty || 0), 0);
  const remainingUnallocated = totalCost - totalAllocatedCost;

  const isFormValid =
    pendingBatches.length > 0 &&
    currentBatch &&
    outputs.length > 0 &&
    outputs.every((o) => o.productId && o.allocatedCost > 0 && o.producedQty > 0) &&
    totalAllocatedCost <= totalCost;

  // Add Output Product Row
  const handleAddOutput = () => {
    // Distribute remaining cost evenly or assign to new row
    const unusedCost = Math.max(0, remainingUnallocated);
    const availableProducts = products.filter(
      (p) => !outputs.some((o) => o.productId === p.id)
    );
    const nextProductId = availableProducts[0]?.id || products[0]?.id || '';

    setOutputs((prev) => {
      const newOutputs = [
        ...prev,
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
          productId: nextProductId,
          allocatedCost: unusedCost,
          producedQty: 100,
          calculatedHpp: calculatePrecisionHpp(unusedCost, 100),
        },
      ];
      return newOutputs;
    });
  };

  // Remove Output Product Row
  const handleRemoveOutput = (index: number) => {
    if (outputs.length <= 1) return;
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  };

  // Equalize Cost Distribution Button
  const handleEqualizeCost = () => {
    if (!currentBatch || outputs.length === 0) return;
    const splitCost = Math.floor(currentBatch.totalCost / outputs.length);
    setOutputs((prev) =>
      prev.map((o) => {
        const hpp = calculatePrecisionHpp(splitCost, o.producedQty);
        return { ...o, allocatedCost: splitCost, calculatedHpp: hpp };
      })
    );
  };

  // Update Output Fields
  const handleOutputChange = (index: number, field: keyof ProductionOutputItem, value: any) => {
    setOutputs((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'allocatedCost' || field === 'producedQty') {
          updated.calculatedHpp = calculatePrecisionHpp(updated.allocatedCost, updated.producedQty);
        }
        return updated;
      })
    );
  };

  // Open Keypad for Numeric Fields
  const openKeypad = (outputIndex: number, field: 'allocatedCost' | 'producedQty') => {
    const item = outputs[outputIndex];
    const prod = products.find((p) => p.id === item.productId);
    const prodName = prod ? prod.name : `Produk ${outputIndex + 1}`;
    const val = field === 'allocatedCost' ? item.allocatedCost : item.producedQty;
    const title = field === 'allocatedCost' ? `Porsi Biaya (Rp) — ${prodName}` : `Jumlah Produksi (Pcs) — ${prodName}`;

    setKeypadTarget({
      isOpen: true,
      outputIndex,
      field,
      initialValue: val,
      title,
    });
  };

  const handleKeypadConfirm = (val: number) => {
    const { outputIndex, field } = keypadTarget;
    handleOutputChange(outputIndex, field, val);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !currentBatch) return;

    onSubmit({
      batchId: currentBatch.batchId,
      outputs: outputs.map((o) => ({
        productId: o.productId,
        allocatedCost: o.allocatedCost,
        producedQty: o.producedQty,
        calculatedHpp: o.calculatedHpp,
      })),
    });
  };

  return (
    <>
      <ModalWrapper title="Tarik Belanja Jadi Produksi (Multi-Produk Output)" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* BATCH BELANJA SELECTOR */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pilih Batch Belanja Bahan Baku yang Akan Diproses
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-amber-300 font-bold bg-amber-50 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
            >
              {pendingBatches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} — Total Biaya: {formatRupiah(b.totalCost)} ({b.itemsDescription.slice(0, 35)}...)
                </option>
              ))}
            </select>
            {pendingBatches.length === 0 && (
              <p className="text-xs text-rose-600 font-bold mt-1">
                Belum ada batch belanja pending. Silakan catat belanja bahan baku terlebih dahulu.
              </p>
            )}
          </div>

          {currentBatch && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center text-purple-950 font-extrabold">
                <span>Detail Batch {currentBatch.batchId}:</span>
                <span className="text-purple-700 font-black text-sm">{formatRupiah(currentBatch.totalCost)}</span>
              </div>
              <p className="text-slate-600 text-[11px] italic line-clamp-2">
                Rincian Bahan: {currentBatch.itemsDescription}
              </p>
            </div>
          )}

          {/* DAFTAR HASIL PRODUKSI MULTI-PRODUK */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-200">
              <label className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-purple-600" />
                Hasil Produksi Produk ({outputs.length} Jenis Produk)
              </label>
              {outputs.length > 1 && (
                <button
                  type="button"
                  onClick={handleEqualizeCost}
                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 underline cursor-pointer"
                >
                  ⚖️ Bagi Rata Porsi Biaya
                </button>
              )}
            </div>

            {outputs.map((item, index) => {
              const productObj = products.find((p) => p.id === item.productId);

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 hover:border-purple-300 transition"
                >
                  {/* OUTPUT ROW HEADER */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-xs">
                      Hasil Produksi #{index + 1}
                    </span>
                    {outputs.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveOutput(index)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* PILIH PRODUK HASIL */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Produk Hasil Olahan Dapur <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleOutputChange(index, 'productId', e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category}) — Harga Jual: {formatRupiah(p.price)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* GRID FORM: PORSI BIAYA, JUMLAH PCS, AUTO HPP */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* PORSI BIAYA (KEYPAD NOMINAL) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Porsi Biaya Dialokasikan (Rp)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'allocatedCost')}
                          value={formatNumberWithDots(item.allocatedCost)}
                          placeholder="Rp 0"
                          className="w-full p-2 pr-7 rounded-xl border border-slate-300 bg-white font-extrabold text-right text-slate-800 outline-none cursor-pointer hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => openKeypad(index, 'allocatedCost')}
                          className="absolute right-1.5 top-1.5 p-0.5 text-purple-600 hover:bg-purple-100 rounded cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* JUMLAH PCS (KEYPAD NOMINAL) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Hasil Produksi (Pcs)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'producedQty')}
                          value={formatNumberWithDots(item.producedQty)}
                          placeholder="100"
                          className="w-full p-2 pr-7 rounded-xl border border-slate-300 bg-white font-extrabold text-center text-purple-900 outline-none cursor-pointer hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => openKeypad(index, 'producedQty')}
                          className="absolute right-1.5 top-1.5 p-0.5 text-purple-600 hover:bg-purple-100 rounded cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* AUTO HPP PRESISI DISPLAY */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        HPP Presisi Per Pcs
                      </label>
                      <div className="p-2 bg-purple-50 border border-purple-200 rounded-xl font-black text-right text-purple-700 text-xs flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-normal">HPP:</span>
                        <span>{formatRupiah(item.calculatedHpp)} / pcs</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BUTTON TAMBAH PRODUK HASIL */}
            <button
              type="button"
              onClick={handleAddOutput}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-dashed border-purple-300 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-1.5 active:scale-98 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-purple-700 stroke-[3]" />
              <span>➕ Tambah Hasil Produksi Produk Lain (Multi-Produk dari 1 Belanja)</span>
            </button>
          </div>

          {/* SUMMARY REKAP ALOKASI BIAYA BATCH */}
          {currentBatch && (
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2 text-xs shadow-md">
              <div className="flex justify-between items-center pb-1.5 border-b border-slate-800 font-black">
                <span className="text-slate-300">Ringkasan Alokasi Batch Belanja:</span>
                <span className="text-amber-400">{formatRupiah(totalCost)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>1. Total Biaya Dialokasikan ({outputs.length} Produk):</span>
                <span className="font-bold text-emerald-400">{formatRupiah(totalAllocatedCost)}</span>
              </div>

              <div className="flex justify-between text-slate-300">
                <span>2. Total Hasil Kuantitas Produksi:</span>
                <span className="font-bold text-purple-300">{formatNumberWithDots(totalProducedQty)} Pcs</span>
              </div>

              <div className="pt-1.5 border-t border-slate-800 flex justify-between items-center font-bold">
                <span>Status Alokasi Biaya:</span>
                {remainingUnallocated === 0 ? (
                  <span className="text-emerald-400 font-black flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> 100% Dialokasikan Pas
                  </span>
                ) : remainingUnallocated > 0 ? (
                  <span className="text-amber-300">
                    Sisa Rp {formatNumberWithDots(remainingUnallocated)} belum dialokasikan
                  </span>
                ) : (
                  <span className="text-rose-400 font-black flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Kelebihan Rp {formatNumberWithDots(Math.abs(remainingUnallocated))}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl shadow-md active:scale-95 transition cursor-pointer text-xs sm:text-sm flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Kalkulasi HPP Multi-Produk & Tambah Stok Gudang</span>
          </button>
        </form>
      </ModalWrapper>

      {/* IN-APP NUMERIC CALCULATOR KEYPAD */}
      <NumericCalculatorKeypad
        isOpen={keypadTarget.isOpen}
        title={keypadTarget.title}
        initialValue={keypadTarget.initialValue}
        onClose={() => setKeypadTarget((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
