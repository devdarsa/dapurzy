'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatNumberWithDots, parseFormattedNumber, formatRupiah } from '@/lib/utils';
import { Calculator } from 'lucide-react';

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; note: string }) => void;
}

export default function CapitalModal({ isOpen, onClose, onSubmit }: CapitalModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFormattedNumber(amountInput);
    onSubmit({ amount: rawAmount, note });
    setAmountInput('');
    setNote('');
  };

  const handleKeypadConfirm = (val: number) => {
    setAmountInput(formatNumberWithDots(val));
  };

  return (
    <>
      <ModalWrapper title="Injeksi Modal Usaha (Tambah Saldo Kas)" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal Modal Tambahan (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
              <input
                type="text"
                required
                readOnly
                inputMode="none"
                onClick={() => setIsKeypadOpen(true)}
                value={amountInput}
                placeholder="Sentuh untuk Buka Kalkulator..."
                className="w-full p-2.5 sm:p-3 pl-10 pr-10 rounded-xl border border-slate-300 font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm sm:text-base cursor-pointer bg-slate-50 hover:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setIsKeypadOpen(true)}
                className="absolute right-3 top-2.5 p-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sentuh kolom di atas untuk mengetik menggunakan Kalkulator Aplikasi</p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan Injeksi Modal</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Setoran Kas Awal Pekan"
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
          >
            Simpan Injeksi Modal
          </button>
        </form>
      </ModalWrapper>

      {/* IN-APP NUMERIC CALCULATOR KEYPAD SHEET */}
      <NumericCalculatorKeypad
        isOpen={isKeypadOpen}
        title="Input Nominal Injeksi Modal"
        initialValue={parseFormattedNumber(amountInput)}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
