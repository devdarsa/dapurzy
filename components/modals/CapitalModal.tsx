'use client';

import React from 'react';
import ModalWrapper from '../ModalWrapper';

interface CapitalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { amount: number; note: string }) => void;
}

export default function CapitalModal({ isOpen, onClose, onSubmit }: CapitalModalProps) {
  if (!isOpen) return null;

  return (
    <ModalWrapper title="Injeksi Modal Operasional Usaha" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const formData = new FormData(e.currentTarget);
          onSubmit({
            amount: Number(formData.get('amount') || 0),
            note: String(formData.get('note') || ''),
          });
        }}
        className="space-y-3 text-xs"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Nominal Tambah Modal (Rp)</label>
          <input
            type="number"
            name="amount"
            min="10000"
            defaultValue="500000"
            required
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold text-sm"
          />
        </div>
        <div>
          <label className="block font-bold text-slate-600 mb-1">Catatan Injeksi Modal</label>
          <input
            type="text"
            name="note"
            placeholder="Misal: Tambahan Modal Kas dari Owner"
            className="w-full p-2.5 rounded-xl border border-slate-300"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          Simpan Tambah Modal
        </button>
      </form>
    </ModalWrapper>
  );
}
