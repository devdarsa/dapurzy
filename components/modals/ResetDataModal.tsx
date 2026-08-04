'use client';

import React, { useState } from 'react';
import ModalWrapper from '../ModalWrapper';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface ResetDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmReset: () => void;
}

export default function ResetDataModal({
  isOpen,
  onClose,
  onConfirmReset,
}: ResetDataModalProps) {
  const [confirmInput, setConfirmInput] = useState<string>('');

  if (!isOpen) return null;

  const isConfirmed = confirmInput.trim().toUpperCase() === 'RESET';

  return (
    <ModalWrapper title="⚠️ Hapus Semua Data 100% (Factory Reset)" onClose={onClose}>
      <div className="space-y-3.5 text-xs sm:text-sm">
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-1 text-rose-900">
          <div className="flex items-center gap-1.5 font-extrabold text-xs text-rose-700">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>PERINGATAN KERAS: DATA AKAN DIHAPUS TOTAL!</span>
          </div>
          <p className="text-[11px] text-rose-800 leading-tight">
            Tindakan ini akan menghapus **100% data** (Master Produk, Master Mitra, Batch Belanja, Stok Gudang & Mitra, Riwayat Transaksi, Kas, dan Audit Trail). Tidak ada data yang tersimpan atau bisa dikembalikan!
          </p>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">
            Ketik kata <span className="text-rose-600 font-mono font-black">RESET</span> untuk mengonfirmasi:
          </label>
          <input
            type="text"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
            placeholder="RESET"
            className="w-full p-2.5 rounded-xl border border-rose-300 font-black text-rose-700 focus:ring-2 focus:ring-rose-500 outline-none uppercase tracking-wider text-center"
          />
        </div>

        <button
          type="button"
          disabled={!isConfirmed}
          onClick={() => {
            if (isConfirmed) {
              onConfirmReset();
              setConfirmInput('');
            }
          }}
          className="w-full bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer flex items-center justify-center space-x-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>HAPUS SEMUA DATA 100% SEKARANG</span>
        </button>
      </div>
    </ModalWrapper>
  );
}
