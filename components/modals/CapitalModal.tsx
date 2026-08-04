'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatNumberWithDots, parseFormattedNumber, formatRupiah, formatDate } from '@/lib/utils';
import { Calculator, PlusCircle, MinusCircle, Trash2, History, AlertCircle } from 'lucide-react';
import { CapitalLog } from '@/lib/types';

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  operatingCapital: number;
  capitalLogs?: CapitalLog[];
  onSubmit: (data: { amount: number; note: string; type: 'INJECTION' | 'WITHDRAWAL' }) => void;
  onDeleteLog?: (logId: string) => void;
}

export default function CapitalModal({
  isOpen,
  onClose,
  operatingCapital,
  capitalLogs = [],
  onSubmit,
  onDeleteLog,
}: CapitalModalProps) {
  const [modalType, setModalType] = useState<'INJECTION' | 'WITHDRAWAL'>('INJECTION');
  const [amountInput, setAmountInput] = useState('');
  const [note, setNote] = useState('');
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  if (!isOpen) return null;

  const rawAmount = parseFormattedNumber(amountInput);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rawAmount <= 0) {
      alert('Nominal harus lebih besar dari Rp 0!');
      return;
    }

    const defaultNote = modalType === 'INJECTION' ? 'Injeksi Modal Usaha' : 'Penarikan / Koreksi Modal';

    onSubmit({
      amount: rawAmount,
      note: note || defaultNote,
      type: modalType,
    });
    setAmountInput('');
    setNote('');
  };

  const handleKeypadConfirm = (val: number) => {
    setAmountInput(formatNumberWithDots(val));
  };

  return (
    <>
      <ModalWrapper title="🏦 Kelola Kas Modal Usaha" onClose={onClose}>
        <div className="space-y-4 text-xs sm:text-sm">
          {/* Banner Saldo Kas Modal */}
          <div className="bg-emerald-950 text-white p-3.5 sm:p-4 rounded-2xl border border-emerald-800 flex justify-between items-center shadow-md">
            <div>
              <span className="text-[11px] text-emerald-300 font-bold block">Saldo Kas Modal Usaha Saat Ini:</span>
              <span className="text-xl sm:text-2xl font-black text-amber-400">{formatRupiah(operatingCapital)}</span>
            </div>
            <span className="text-2xl">💰</span>
          </div>

          {/* TAB MODE (TAMBAH MODAL VS KOREKSI / TARIK MODAL) */}
          <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 font-bold">
            <button
              type="button"
              onClick={() => setModalType('INJECTION')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                modalType === 'INJECTION'
                  ? 'bg-emerald-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Tambah / Injeksi Modal</span>
            </button>
            <button
              type="button"
              onClick={() => setModalType('WITHDRAWAL')}
              className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
                modalType === 'WITHDRAWAL'
                  ? 'bg-rose-600 text-white font-extrabold shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>- Tarik / Koreksi Modal</span>
            </button>
          </div>

          {/* FORM INPUT */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                {modalType === 'INJECTION' ? 'Nominal Tambahan Modal (Rp)' : 'Nominal Pengurangan / Koreksi Modal (Rp)'}
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-3 font-black text-slate-400">Rp</span>
                <input
                  type="text"
                  required
                  readOnly
                  inputMode="none"
                  onClick={() => setIsKeypadOpen(true)}
                  value={amountInput}
                  placeholder="Sentuh untuk Buka Kalkulator..."
                  className={`w-full p-2.5 sm:p-3 pl-10 pr-10 rounded-xl border border-slate-300 font-extrabold outline-none text-base cursor-pointer bg-slate-50 hover:bg-white transition ${
                    modalType === 'INJECTION' ? 'text-emerald-700 focus:ring-emerald-500' : 'text-rose-600 focus:ring-rose-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setIsKeypadOpen(true)}
                  className={`absolute right-3 top-2.5 p-1 rounded-lg transition cursor-pointer ${
                    modalType === 'INJECTION' ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' : 'bg-rose-100 text-rose-800 hover:bg-rose-200'
                  }`}
                >
                  <Calculator className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Catatan (Opsional)</label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={modalType === 'INJECTION' ? 'Contoh: Setoran Kas Awal Pekan' : 'Contoh: Koreksi karena salah ketik modal berlebih'}
                className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              />
            </div>

            <button
              type="submit"
              className={`w-full text-white font-extrabold py-3.5 rounded-xl shadow-md active:scale-95 transition cursor-pointer text-sm sm:text-base ${
                modalType === 'INJECTION' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
              }`}
            >
              {modalType === 'INJECTION' ? '➕ Simpan Injeksi Modal (+)' : '➖ Simpan Pengurangan Modal (-)'}
            </button>
          </form>

          {/* DAFTAR RIWAYAT LOG MODAL & TOMBOL HAPUS LOG */}
          {capitalLogs && capitalLogs.length > 0 && (
            <div className="border-t border-slate-200 pt-3 space-y-2">
              <h4 className="font-extrabold text-slate-800 text-xs flex items-center gap-1">
                <History className="w-4 h-4 text-purple-600" /> Riwayat Transaksi Modal & Tombol Hapus Log Salah
              </h4>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {capitalLogs.map((log) => {
                  const isPositive = log.amount > 0;
                  return (
                    <div
                      key={log.id}
                      className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-slate-800 truncate">{log.note || 'Transaksi Modal'}</p>
                        <p className="text-[10px] text-slate-400">{formatDate(log.createdAt)} • {log.trxNumber}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`font-black text-xs ${isPositive ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isPositive ? '+' : ''}{formatRupiah(log.amount)}
                        </span>
                        {onDeleteLog && (
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Hapus log modal "${log.note}" sebesar ${formatRupiah(log.amount)}?`)) {
                                onDeleteLog(log.id);
                              }
                            }}
                            className="p-1 rounded-lg bg-rose-100 text-rose-700 hover:bg-rose-200 transition cursor-pointer"
                            title="Hapus Log Modal Ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </ModalWrapper>

      {/* KALKULATOR KEYPAD */}
      <NumericCalculatorKeypad
        isOpen={isKeypadOpen}
        title={modalType === 'INJECTION' ? 'Input Nominal Tambah Modal' : 'Input Nominal Kurangi Modal'}
        initialValue={rawAmount}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
