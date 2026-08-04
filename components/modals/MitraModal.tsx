'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Mitra } from '@/lib/types';

interface MitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Mitra | null;
  onSubmit: (data: {
    id?: string;
    name: string;
    type: string;
    whatsapp: string;
    address: string;
  }) => void;
}

export default function MitraModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: MitraModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('Warung');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setWhatsapp(initialData.whatsapp || '');
      setAddress(initialData.address || '');
    } else {
      setName('');
      setType('Warung');
      setWhatsapp('');
      setAddress('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  return (
    <ModalWrapper title={isEditing ? 'Edit Master Mitra' : 'Tambah Mitra Titipan Baru'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            id: initialData?.id,
            name,
            type,
            whatsapp,
            address,
          });
        }}
        className="space-y-3.5 text-xs sm:text-sm"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Nama Mitra / Toko</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Warung Bu Sri"
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Tipe Mitra</label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          >
            <option value="Warung">Warung / Kelontong</option>
            <option value="Kantin">Kantin Sekolah / Kantor</option>
            <option value="Reseller">Reseller Agen</option>
            <option value="Kafe">Kafe / Mini Market</option>
          </select>
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">No. WhatsApp</label>
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Contoh: 081234567890"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Alamat Lokasi</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Contoh: Jl. Mawar No. 12, RT 02/05"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          {isEditing ? 'Simpan Perubahan Mitra' : 'Simpan Mitra Baru'}
        </button>
      </form>
    </ModalWrapper>
  );
}
