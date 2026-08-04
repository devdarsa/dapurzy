'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import EmptyPrerequisiteState from './EmptyPrerequisiteState';
import { formatNumberWithDots, parseFormattedNumber, formatRupiah } from '@/lib/utils';
import { Home, AlertCircle, PlusCircle } from 'lucide-react';
import { Product } from '@/lib/types';
import { toast } from '@/lib/toast';

interface HomeSalesModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onOpenProductModal?: () => void;
  onSubmit: (data: { amount: number; note: string }) => void;
}

export default function HomeSalesModal({
  isOpen,
  onClose,
  products = [],
  onOpenProductModal,
  onSubmit,
}: HomeSalesModalProps) {
  const [amountInput, setAmountInput] = useState<string>('');
  const [note, setNote] = useState<string>('Setoran Toples Jual di Rumah');

  if (!isOpen) return null;

  const rawAmount = parseFormattedNumber(amountInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      toast.warning('Mohon masukkan nominal uang tunai yang valid!');
      return;
    }
    onSubmit({
      amount: rawAmount,
      note: note || 'Setoran Uang Rumah',
    });
    setAmountInput('');
  };

  return (
    <ModalWrapper title="🏡 Setor Uang Hasil Jual di Rumah (1-Tap)" onClose={onClose}>
      {products.length === 0 ? (
        <EmptyPrerequisiteState
          title="Belum Ada Master Produk!"
          description="Belum ada produk yang didaftarkan. Daftarkan Produk pertama Anda untuk mulai setor hasil jual di rumah!"
          buttonText="+ Tambah Master Produk Sekarang"
          onButtonClick={() => {
            onClose();
            if (onOpenProductModal) onOpenProductModal();
          }}
          colorScheme="purple"
        />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs">
              <Home className="w-4 h-4 text-emerald-700" /> Tanpa Ribet Catat Eceran Item
            </div>
            <p className="text-[11px] text-emerald-800 font-medium">
              Masukkan total uang tunai yang terkumpul di toples / dompet jual di rumah. Kas di aplikasi akan 100% klop dengan fisik uang Anda!
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Nominal Uang Terkumpul (Rp)</label>
            <div className="relative">
              <span className="absolute left-3.5 top-3 font-black text-slate-400">Rp</span>
              <input
                type="text"
                value={amountInput}
                onChange={(e) => setAmountInput(formatNumberWithDots(e.target.value))}
                required
                placeholder="50.000"
                className="w-full pl-10 p-3 rounded-xl border border-slate-300 font-black text-emerald-700 text-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Setoran Toples Jual di Rumah"
              className="w-full p-2.5 rounded-xl border border-slate-300 font-medium bg-white outline-none"
            />
          </div>

          {rawAmount > 0 && (
            <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Total Masuk Kas Operasional & Profit:</span>
              <span className="font-black text-emerald-800 text-sm">{formatRupiah(rawAmount)}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-sm"
          >
            ✅ Terima Setoran Uang Rumah {formatRupiah(rawAmount)}
          </button>
        </form>
      )}
    </ModalWrapper>
  );
}
