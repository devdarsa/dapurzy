'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { AlertTriangle, Wallet, Calculator } from 'lucide-react';

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
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  if (!isOpen) return null;

  const rawCost = parseFormattedNumber(totalCostInput);
  const remainingBalance = cashBalance - rawCost;
  const isInsufficientCash = rawCost > cashBalance || cashBalance <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isInsufficientCash) return;

    onSubmit({ itemsDescription, totalCost: rawCost, supplier });
    setItemsDescription('');
    setTotalCostInput('');
    setSupplier('');
  };

  const handleKeypadConfirm = (val: number) => {
    setTotalCostInput(formatNumberWithDots(val));
  };

  return (
    <>
      <ModalWrapper title="Tambah Batch Belanja Bahan Baku" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          {/* CASH BALANCE DISPLAY HEADER */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span className="text-xs font-bold text-slate-700">Saldo Kas Operasional Saat Ini:</span>
            </div>
            <span className={`font-black text-sm ${cashBalance <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatRupiah(cashBalance)}
            </span>
          </div>

          {/* INSUFFICIENT CASH ALERT */}
          {cashBalance <= 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>Saldo Kas Operasional Habis (Rp 0)! Harap Injeksi Modal terlebih dahulu sebelum berbelanja.</span>
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
                readOnly
                inputMode="none"
                onClick={() => setIsKeypadOpen(true)}
                value={totalCostInput}
                placeholder="Sentuh untuk Buka Kalkulator..."
                className={`w-full p-2.5 sm:p-3 pl-10 pr-10 rounded-xl border font-extrabold text-sm sm:text-base outline-none cursor-pointer bg-slate-50 hover:bg-white transition ${
                  rawCost > cashBalance
                    ? 'border-rose-400 text-rose-700 focus:ring-2 focus:ring-rose-500 bg-rose-50/50'
                    : 'border-slate-300 text-amber-700 focus:ring-2 focus:ring-amber-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setIsKeypadOpen(true)}
                className="absolute right-3 top-2.5 p-1 rounded-lg bg-amber-100 text-amber-800 hover:bg-amber-200 transition cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sentuh kolom di atas untuk mengetik menggunakan Kalkulator Aplikasi</p>
          </div>

          {/* REAL-TIME REMAINING CASH BALANCE CALCULATOR CARD */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold pb-1 border-b border-emerald-200">
              <Calculator className="w-3.5 h-3.5 text-emerald-700" /> Kalkulasi Sisa Kas Real-Time
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>1. Saldo Kas Operasional Awal:</span>
              <span className="font-bold text-slate-800">{formatRupiah(cashBalance)}</span>
            </div>

            <div className="flex justify-between items-center text-rose-600">
              <span>2. Total Nominal Belanja:</span>
              <span className="font-bold">- {formatRupiah(rawCost)}</span>
            </div>

            <div className="pt-1.5 border-t border-emerald-200/80 flex justify-between items-center">
              <span className="font-extrabold text-slate-800">Sisa Saldo Kas (Setelah Belanja):</span>
              <span
                className={`font-black text-sm sm:text-base ${
                  remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatRupiah(remainingBalance)}
              </span>
            </div>
          </div>

          {rawCost > cashBalance && cashBalance > 0 && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" /> Nominal belanja ({formatRupiah(rawCost)}) melebihi saldo kas ({formatRupiah(cashBalance)})!
            </p>
          )}

          <button
            type="submit"
            disabled={isInsufficientCash}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
          >
            {isInsufficientCash ? 'Saldo Kas Tidak Mencukupi' : 'Simpan Batch Belanja'}
          </button>
        </form>
      </ModalWrapper>

      {/* IN-APP NUMERIC CALCULATOR KEYPAD SHEET */}
      <NumericCalculatorKeypad
        isOpen={isKeypadOpen}
        title="Input Nominal Belanja Bahan Baku"
        initialValue={parseFormattedNumber(totalCostInput)}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
