'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { PurchaseBatch, Product } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, calculatePrecisionHpp } from '@/lib/utils';
import { Plus, Trash2, Calculator, Check, PackageCheck, Info } from 'lucide-react';

export interface ProductionOutputRow {
  id: string;
  productId: string;
  producedQty: number;
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
      producedQty: number;
    }>;
    calculatedHpp: number;
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
  const [outputs, setOutputs] = useState<ProductionOutputRow[]>([]);

  // Keypad state for producedQty
  const [keypadTarget, setKeypadTarget] = useState<{
    isOpen: boolean;
    rowIndex: number;
    initialValue: number;
    title: string;
  }>({
    isOpen: false,
    rowIndex: 0,
    initialValue: 0,
    title: '',
  });

  // Selected Batch object
  const currentBatch = pendingBatches.find(
    (b) => b.batchId === (selectedBatchId || pendingBatches[0]?.batchId)
  );

  // Initialize outputs when modal opens or batch changes
  useEffect(() => {
    if (!isOpen) return;
    if (pendingBatches.length > 0) {
      const bId = selectedBatchId || pendingBatches[0].batchId;
      setSelectedBatchId(bId);
      setOutputs([
        {
          id: '1',
          productId: products[0]?.id || '',
          producedQty: 0,
        },
      ]);
    } else {
      setSelectedBatchId('');
      setOutputs([]);
    }
  }, [isOpen, selectedBatchId]);

  if (!isOpen) return null;

  // Global HPP Calculation: HPP = Total Nilai Batch / Total Jumlah Produk Hasil Olahan
  const totalBatchCost = currentBatch ? currentBatch.totalCost : 0;
  const totalProducedQty = outputs.reduce((sum, o) => sum + (o.producedQty || 0), 0);
  const calculatedHpp = totalProducedQty > 0 ? calculatePrecisionHpp(totalBatchCost, totalProducedQty) : 0;

  const isFormValid =
    pendingBatches.length > 0 &&
    currentBatch &&
    outputs.length > 0 &&
    totalProducedQty > 0 &&
    outputs.every((o) => o.productId && o.producedQty > 0);

  // Add Output Row
  const handleAddOutput = () => {
    const availableProducts = products.filter(
      (p) => !outputs.some((o) => o.productId === p.id)
    );
    const nextProductId = availableProducts[0]?.id || products[0]?.id || '';

    setOutputs((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        productId: nextProductId,
        producedQty: 0,
      },
    ]);
  };

  // Remove Output Row
  const handleRemoveOutput = (index: number) => {
    if (outputs.length <= 1) return;
    setOutputs((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Output Row
  const handleOutputChange = (index: number, field: keyof ProductionOutputRow, value: any) => {
    setOutputs((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return { ...item, [field]: value };
      })
    );
  };

  // Open Keypad for Produced Quantity
  const openKeypad = (rowIndex: number) => {
    const item = outputs[rowIndex];
    const prod = products.find((p) => p.id === item.productId);
    const prodName = prod ? prod.name : `Produk #${rowIndex + 1}`;

    setKeypadTarget({
      isOpen: true,
      rowIndex,
      initialValue: item.producedQty,
      title: `Jumlah Hasil Produksi (Pcs) — ${prodName}`,
    });
  };

  const handleKeypadConfirm = (val: number) => {
    handleOutputChange(keypadTarget.rowIndex, 'producedQty', val);
  };

  // Submit Form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid || !currentBatch) return;

    onSubmit({
      batchId: currentBatch.batchId,
      outputs: outputs.map((o) => ({
        productId: o.productId,
        producedQty: o.producedQty,
      })),
      calculatedHpp,
    });
  };

  return (
    <>
      <ModalWrapper title="Tarik Belanja Jadi Produksi (HPP Auto per Batch)" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* PILIH BATCH BELANJA */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Pilih Batch Belanja Bahan Baku
            </label>
            <select
              value={selectedBatchId}
              onChange={(e) => setSelectedBatchId(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-amber-300 font-bold bg-amber-50 focus:ring-2 focus:ring-purple-500 outline-none text-slate-800"
            >
              {pendingBatches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId} — Total Nilai: {formatRupiah(b.totalCost)} ({b.itemsDescription.slice(0, 35)}...)
                </option>
              ))}
            </select>
            {pendingBatches.length === 0 && (
              <p className="text-xs text-rose-600 font-bold mt-1">
                Belum ada batch belanja pending. Catat belanja bahan baku terlebih dahulu.
              </p>
            )}
          </div>

          {currentBatch && (
            <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between items-center text-purple-950 font-extrabold">
                <span>Nilai Batch {currentBatch.batchId}:</span>
                <span className="text-purple-700 font-black text-sm">{formatRupiah(currentBatch.totalCost)}</span>
              </div>
              <p className="text-slate-600 text-[11px] italic line-clamp-2">
                Bahan Baku: {currentBatch.itemsDescription}
              </p>
            </div>
          )}

          {/* DAFTAR PRODUK HASIL OLAHAN */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-200">
              <label className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <PackageCheck className="w-4 h-4 text-purple-600" />
                Jenis Produk Hasil Olahan ({outputs.length} Jenis Produk)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Input Pcs via Keypad Aplikasi</span>
            </div>

            {outputs.map((item, index) => (
              <div
                key={item.id}
                className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5 hover:border-purple-300 transition"
              >
                {/* ROW HEADER */}
                <div className="flex justify-between items-center">
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-black text-xs">
                    Hasil Olahan #{index + 1}
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

                {/* GRID: PILIH PRODUK & JUMLAH PCS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* PILIH PRODUK HASIL */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Nama Jenis Produk <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={item.productId}
                      onChange={(e) => handleOutputChange(index, 'productId', e.target.value)}
                      required
                      className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white text-slate-800 text-xs sm:text-sm outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name} ({p.category})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* JUMLAH PRODUK (KEYPAD NOMINAL) */}
                  <div>
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Jumlah Hasil Produksi (Pcs) <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        readOnly
                        inputMode="none"
                        onClick={() => openKeypad(index)}
                        value={item.producedQty > 0 ? formatNumberWithDots(item.producedQty) : ''}
                        placeholder="Ketuk untuk input Pcs"
                        className="w-full p-2.5 pr-8 rounded-xl border border-slate-300 bg-white font-extrabold text-center text-purple-900 text-xs sm:text-sm outline-none cursor-pointer hover:border-purple-500 focus:ring-2 focus:ring-purple-500 transition"
                      />
                      <button
                        type="button"
                        onClick={() => openKeypad(index)}
                        className="absolute right-2 top-2.5 p-0.5 text-purple-600 hover:bg-purple-100 rounded cursor-pointer"
                      >
                        <Calculator className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* BUTTON TAMBAH JENIS PRODUK */}
            <button
              type="button"
              onClick={handleAddOutput}
              className="w-full py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-900 border-2 border-dashed border-purple-300 rounded-2xl font-extrabold text-xs sm:text-sm flex items-center justify-center space-x-1.5 active:scale-98 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-purple-700 stroke-[3]" />
              <span>➕ Tambah Jenis Produk Hasil Olahan Lain</span>
            </button>
          </div>

          {/* CARD KALKULASI RUMUS HPP MULTI-PRODUK BATCH */}
          {currentBatch && (
            <div className="p-3.5 bg-slate-900 text-white rounded-2xl space-y-2.5 text-xs shadow-md border border-slate-800">
              <div className="flex items-center gap-1.5 text-amber-400 font-black pb-1.5 border-b border-slate-800">
                <Info className="w-4 h-4 text-amber-400" />
                <span>Kalkulasi Rumus HPP Presisi Batch:</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-[10px] text-slate-400 block">1. Nilai Batch Belanja:</span>
                  <span className="font-extrabold text-amber-300 text-xs sm:text-sm">
                    {formatRupiah(totalBatchCost)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block">2. Total Produk Hasil Olahan:</span>
                  <span className="font-extrabold text-purple-300 text-xs sm:text-sm">
                    {formatNumberWithDots(totalProducedQty)} Pcs
                    {outputs.length > 1 ? ` (${outputs.map((o) => o.producedQty).join(' + ')} Pcs)` : ''}
                  </span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-200 block text-[11px]">
                    HPP Presisi = Total Nilai ÷ Total Produk:
                  </span>
                  <span className="text-[10px] text-slate-400">
                    Sama untuk seluruh unit produk dari batch ini
                  </span>
                </div>
                <span className="font-black text-emerald-400 text-sm sm:text-base">
                  {formatRupiah(calculatedHpp)} / unit
                </span>
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
            <span>Simpan Produksi & Terapkan HPP ({formatRupiah(calculatedHpp)}/unit)</span>
          </button>
        </form>
      </ModalWrapper>

      {/* NUMERIC CALCULATOR KEYPAD */}
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
