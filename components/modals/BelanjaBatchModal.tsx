'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatNumberWithDots, parseFormattedNumber, formatRupiah } from '@/lib/utils';
import { Calculator, Calendar, ShoppingBag, AlertCircle, PlusCircle } from 'lucide-react';

interface BelanjaBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatingCapital: number;
  onOpenCapitalModal?: () => void;
  onSubmit: (data: { date: string; itemsDescription: string; totalCost: number }) => void;
}

export default function BelanjaBatchModal({
  isOpen,
  onClose,
  operatingCapital,
  onOpenCapitalModal,
  onSubmit,
}: BelanjaBatchModalProps) {
  // Tanggal semi otomatis (default to current date string YYYY-MM-DD)
  const [date, setDate] = useState<string>('');
  const [itemsDescription, setItemsDescription] = useState<string>('');
  const [totalCostInput, setTotalCostInput] = useState<string>('');
  const [isKeypadOpen, setIsKeypadOpen] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      // Semi-otomatis: Isi tanggal hari ini secara otomatis
      const today = new Date().toISOString().split('T')[0];
      setDate(today);
      setItemsDescription('');
      setTotalCostInput('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const totalCost = parseFormattedNumber(totalCostInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemsDescription.trim()) {
      alert('Mohon isi Keterangan Belanja!');
      return;
    }
    if (totalCost <= 0) {
      alert('Nominal Pengeluaran Belanja harus lebih dari Rp 0!');
      return;
    }
    onSubmit({
      date: date || new Date().toISOString().split('T')[0],
      itemsDescription,
      totalCost,
    });
  };

  const handleKeypadConfirm = (val: number) => {
    setTotalCostInput(formatNumberWithDots(val));
  };

  return (
    <>
      <ModalWrapper title="🛒 Modul Belanja (Buat Batch Belanja)" onClose={onClose}>
        {operatingCapital <= 0 ? (
          /* POPUP BOUNCY ELEGAN JIKA BELUM ADA KAS MODAL */
          <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-amber-500/20 border-2 border-amber-400/60 p-6 rounded-3xl text-center space-y-3.5 my-3 shadow-xl animate-in zoom-in-95 duration-300 relative overflow-hidden backdrop-blur-xs">
            <div className="w-14 h-14 bg-gradient-to-tr from-amber-500 to-amber-400 text-amber-950 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-amber-500/30 animate-bounce">
              <AlertCircle className="w-8 h-8 stroke-[2.5]" />
            </div>
            <div>
              <h4 className="font-black text-amber-950 text-base sm:text-lg tracking-tight">Saldo Kas Modal Usaha Kosong (Rp 0)!</h4>
              <p className="text-xs font-semibold text-amber-900/80 mt-1 max-w-xs mx-auto leading-relaxed">
                Belum ada saldo Kas Modal untuk belanja. Silakan lakukan <b>Injeksi Modal Usaha</b> terlebih dahulu sebelum membuat Batch Belanja!
              </p>
            </div>
            {onOpenCapitalModal && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenCapitalModal();
                }}
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-emerald-600/30 active:scale-95 transition transform cursor-pointer flex items-center justify-center gap-2 mx-auto mt-2"
              >
                <PlusCircle className="w-4 h-4 stroke-[3]" />
                <span>+ Injeksi Kas Modal Sekarang</span>
              </button>
            )}
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            {/* Banner Status Kas Modal */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 flex justify-between items-center">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 block">Saldo Kas Modal Tersedia:</span>
                <span className="text-base sm:text-lg font-black text-emerald-700">{formatRupiah(operatingCapital)}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-1 rounded-full font-bold">Sumber Dana</span>
              </div>
            </div>

            {/* Warning jika nominal > Kas Modal */}
            {totalCost > operatingCapital && (
              <div className="bg-rose-50 border border-rose-200 p-2.5 rounded-xl flex items-center gap-2 text-rose-700 font-medium text-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Nominal belanja melebihi sisa Kas Modal. Transaksi akan mengurangi Kas Modal.</span>
              </div>
            )}

            {/* 1. Tanggal Belanja (Semi Otomatis) */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" /> Tanggal Belanja (Semi-Otomatis)
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-extrabold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-slate-50 focus:bg-white transition"
              />
              <p className="text-[10px] text-slate-500 mt-0.5">Terisi otomatis tanggal hari ini. Dapat diubah jika tanggal berbeda.</p>
            </div>

            {/* 2. Keterangan Belanja */}
            <div>
              <label className="block font-bold text-slate-700 mb-1 flex items-center gap-1">
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" /> Keterangan Belanja (Bahan / Material)
              </label>
              <input
                type="text"
                required
                value={itemsDescription}
                onChange={(e) => setItemsDescription(e.target.value)}
                placeholder="Contoh: Tepung 10kg, Gula 5kg, Telur 3kg"
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            {/* 3. Nominal Pengeluaran Belanja */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nominal Pengeluaran Belanja (Rp)</label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-black text-slate-400">Rp</span>
                <input
                  type="text"
                  required
                  readOnly
                  inputMode="none"
                  onClick={() => setIsKeypadOpen(true)}
                  value={totalCostInput}
                  placeholder="Sentuh untuk Buka Kalkulator..."
                  className="w-full p-2.5 sm:p-3 pl-10 pr-10 rounded-xl border border-slate-300 font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none text-base cursor-pointer bg-slate-50 hover:bg-white transition"
                />
                <button
                  type="button"
                  onClick={() => setIsKeypadOpen(true)}
                  className="absolute right-3 top-2.5 p-1 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Nominal ini otomatis memotong Kas Modal Usaha</p>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-sm sm:text-base mt-2"
            >
              📦 Simpan Batch Belanja (Status: Tersedia)
            </button>
          </form>
        )}
      </ModalWrapper>

      {/* Kalkulator Keypad untuk kemudahan input angka */}
      <NumericCalculatorKeypad
        isOpen={isKeypadOpen}
        title="Input Nominal Belanja Batch"
        initialValue={totalCost}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
