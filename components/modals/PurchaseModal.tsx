'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { AlertTriangle, Wallet } from 'lucide-react';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBalance: number;
  onSubmit: (data: { itemsDescription: string; totalCost: number; supplier: string }) => void;
}

export default function PurchaseModal({ isOpen, onClose, cashBalance, onSubmit }: PurchaseModalProps) {
  const [itemsDescription, setItemsDescription] = useState('');
  const [totalCostInput, setTotalCostInput] = useState('');
  const [supplier, setSupplier] = useState('');

  if (!isOpen) return null;

  const rawCost = parseFormattedNumber(totalCostInput);
  const isInsufficientCash = rawCost > cashBalance || cashBalance <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientCash) return;

    onSubmit({ itemsDescription, totalCost: rawCost, supplier });
    setItemsDescription('');
    setTotalCostInput('');
    setSupplier('');
  };

  const handleCostChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setTotalCostInput(formatted);
  };

  return (
    <ModalWrapper title="Tambah Batch Belanja Bahan Baku" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
        {/* CASh BALANCE DISPLAY HEADER */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="w-4 h-4 text-emerald-600" />
            <span className="text-xs font-bold text-slate-700">Saldo Kas Operasional:</span>
          </div>
          <span className={`font-black text-sm ${cashBalance <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
            {formatRupiah(cashBalance)}
          </span>
        </div>

        {/* INSUFFICIENT CASH ALERT */}
        {cashBalance <= 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>Saldo Kas Operasional Habis! Harap Injeksi Modal terlebih dahulu sebelum berbelanja.</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1">Supplier / Toko Bahan</label>
          <input
            type="text"
            value={supplier}
            onChange={(e) => setSupplier(e.target.value)}
            placeholder="e.g. Toko Bahan Kue Mulia, Pasar Cihapit"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Rincian Belanja Bahan Baku</label>
          <textarea
            required
            rows={2}
            value={itemsDescription}
            onChange={(e) => setItemsDescription(e.target.value)}
            placeholder="e.g. Susu Kental 5 kaleng, Cokelat Bubuk 1kg, Plastik Es 2 pax"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Total Biaya Belanja (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
            <input
              type="text"
              required
              value={totalCostInput}
              onChange={handleCostChange}
              placeholder="200.000"
              className={`w-full p-2.5 sm:p-3 pl-10 rounded-xl border font-extrabold text-sm sm:text-base outline-none ${
                rawCost > cashBalance
                  ? 'border-rose-400 text-rose-700 focus:ring-2 focus:ring-rose-500 bg-rose-50/50'
                  : 'border-slate-300 text-amber-700 focus:ring-2 focus:ring-amber-500'
              }`}
            />
          </div>
          {rawCost > cashBalance && cashBalance > 0 && (
            <p className="text-xs text-rose-600 font-bold mt-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> Nominal belanja ({formatRupiah(rawCost)}) melebihi saldo kas ({formatRupiah(cashBalance)})!
            </p>
          )}
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
        </div>

        <button
          type="submit"
          disabled={isInsufficientCash}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          {isInsufficientCash ? 'Saldo Kas Tidak Mencukupi' : 'Simpan Batch Belanja'}
        </button>
      </form>
    </ModalWrapper>
  );
}
