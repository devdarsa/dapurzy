'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product } from '@/lib/types';
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';

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
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Es Lilin');
  const [priceInput, setPriceInput] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setCategory(initialData.category);
      setPriceInput(formatNumberWithDots(initialData.price));
    } else {
      setName('');
      setCategory('Es Lilin');
      setPriceInput('');
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const rawPrice = parseFormattedNumber(priceInput);
    onSubmit({
      id: initialData?.id,
      name,
      category,
      price: rawPrice,
    });
    setName('');
    setPriceInput('');
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatNumberWithDots(e.target.value);
    setPriceInput(formatted);
  };

  return (
    <ModalWrapper
      title={initialData ? 'Edit Master Produk' : 'Tambah Master Produk Baru'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 text-xs sm:text-sm">
        <div>
          <label className="block font-bold text-slate-700 mb-1">Nama Produk</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Es Lilin Cokelat, Udang Keju Crisp"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Kategori Produk</label>
          <input
            type="text"
            required
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="e.g. Es Lilin, Udang Keju, Dimsum"
            className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-purple-500 outline-none"
          />
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Harga Jual Produk (Rp)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
            <input
              type="text"
              required
              value={priceInput}
              onChange={handlePriceChange}
              placeholder="15.000"
              className="w-full p-2.5 sm:p-3 pl-10 rounded-xl border border-slate-300 font-extrabold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base"
            />
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Otomatis titik setiap 3 digit angka (Ribuan)</p>
        </div>

        <button
          type="submit"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
        >
          {initialData ? 'Simpan Perubahan Produk' : 'Simpan Produk Baru'}
        </button>
      </form>
    </ModalWrapper>
  );
}
