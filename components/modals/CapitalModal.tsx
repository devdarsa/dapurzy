'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; note: string }) => void;
}

export default function CapitalModal({ isOpen, onClose, onSubmit }: CapitalModalProps) {
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawAmount = parseFormattedNumber(amountInput);
    onSubmit({ amount: rawAmount, note });
    setAmountInput('');
    setNote('');
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setAmountInput(formatted);
  };

  return (
    <ModalWrapper title="Injeksi Modal Usaha (Tambah Saldo Kas)" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nominal Modal Tambahan (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
            <input
              type="text"
              required
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="1.000.000"
              className="w-full p-2.5 sm:p-3 pl-10 rounded-xl border border-slate-300 font-extrabold text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none text-sm sm:text-base"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
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
  );
}
