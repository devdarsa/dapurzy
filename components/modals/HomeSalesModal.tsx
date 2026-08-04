'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { formatNumberWithDots, parseFormattedNumber, formatRupiah } from '@/lib/utils';
import { Home, AlertCircle, PlusCircle } from 'lucide-react';
import { Product } from '@/lib/types';

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
      alert('Mohon masukkan nominal uang tunai yang valid!');
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
        /* POPUP BOUNCY ELEGAN JIKA BELUM ADA PRODUK */
        <div className="bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-purple-500/20 border-2 border-purple-400/60 p-6 rounded-3xl text-center space-y-3.5 my-3 shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden backdrop-blur-xs">
          <div className="w-14 h-14 bg-gradient-to-tr from-purple-600 to-purple-500 text-white rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-purple-500/30 animate-bounce">
            <AlertCircle className="w-8 h-8 stroke-[2.5]" />
          </div>
          <div>
            <h4 className="font-black text-purple-950 text-base sm:text-lg tracking-tight">Belum Ada Master Produk!</h4>
            <p className="text-xs font-semibold text-purple-900/80 mt-1 max-w-xs mx-auto leading-relaxed">
              Belum ada produk yang didaftarkan. Daftarkan Produk pertama Anda untuk mulai setor hasil jual di rumah!
            </p>
          </div>
          {onOpenProductModal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenProductModal();
              }}
              className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-purple-500/30 active:scale-95 transition transform cursor-pointer flex items-center justify-center gap-2 mx-auto mt-2"
            >
              <PlusCircle className="w-4 h-4 stroke-[3]" />
              <span>+ Tambah Master Produk Sekarang</span>
            </button>
          )}
        </div>
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
