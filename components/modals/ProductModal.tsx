'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product } from '@/lib/types';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Product | null;
  onSubmit: (data: { id?: string; name: string; category: string; price: number }) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  initialData,
  onSubmit,
}: ProductModalProps) {
  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<string>('Es Lilin');
  const [price, setPrice] = useState<number>(3000);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setPrice(initialData.price);
    } else {
      setName('');
      setCategory('Es Lilin');
      setPrice(3000);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  return (
    <ModalWrapper title={isEditing ? 'Edit Master Produk' : 'Tambah Master Produk Baru'} onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit({
            id: initialData?.id,
            name,
            category,
            price: Number(price),
          });
        }}
        className="space-y-3.5 text-xs sm:text-sm"
      >
        <div>
          <label className="block font-bold text-slate-600 mb-1">Nama Produk</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Contoh: Es Lilin Durian Super"
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Kategori Produk</label>
          <input
            type="text"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="Contoh: Es Lilin, Udang Keju, Bakso"
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-600 mb-1">Harga Jual per Unit (Rp)</label>
          <input
            type="number"
            min="100"
            step="100"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            required
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-black text-emerald-700 text-sm sm:text-base focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3.5 rounded-xl shadow-md mt-2 active:scale-95 transition cursor-pointer"
        >
          {isEditing ? 'Simpan Perubahan Produk' : 'Simpan Produk Baru'}
        </button>
      </form>
    </ModalWrapper>
  );
}
