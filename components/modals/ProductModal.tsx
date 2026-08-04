'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { Product } from '@/lib/types';
import { formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { Calculator } from 'lucide-react';

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  initialData?: Product | null;
  onSubmit: (data: { id?: string; name: string; category: string; price: number }) => void;
}

export default function ProductModal({
  isOpen,
  onClose,
  products = [],
  initialData,
  onSubmit,
}: ProductModalProps) {
  const [name, setName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Es Lilin');
  const [customCategory, setCustomCategory] = useState('');
  const [priceInput, setPriceInput] = useState('');
  const [isKeypadOpen, setIsKeypadOpen] = useState(false);

  // Extract unique existing categories automatically
  const existingCategories = useMemo(() => {
    const set = new Set(['Es Lilin', 'Udang Keju', 'Bakso Bakar', 'Snack', 'Minuman', 'Bahan Baku']);
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [products]);

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      if (existingCategories.includes(initialData.category)) {
        setSelectedCategory(initialData.category);
        setCustomCategory('');
      } else {
        setSelectedCategory('__NEW__');
        setCustomCategory(initialData.category);
      }
      setPriceInput(formatNumberWithDots(initialData.price));
    } else {
      setName('');
      setSelectedCategory(existingCategories[0] || 'Es Lilin');
      setCustomCategory('');
      setPriceInput('');
    }
  }, [initialData, isOpen, existingCategories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCategory =
      selectedCategory === '__NEW__' ? customCategory.trim() || 'Umum' : selectedCategory;
    const rawPrice = parseFormattedNumber(priceInput);

    onSubmit({
      id: initialData?.id,
      name,
      category: finalCategory,
      price: rawPrice,
    });
    setName('');
    setCustomCategory('');
    setPriceInput('');
  };

  const handleKeypadConfirm = (val: number) => {
    setPriceInput(formatNumberWithDots(val));
  };

  return (
    <>
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
            <label className="block font-bold text-slate-700 mb-1">Kategori Produk (Dropdown)</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-purple-500 outline-none"
            >
              {existingCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
              <option value="__NEW__">➕ Tambah Kategori Baru...</option>
            </select>
          </div>

          {selectedCategory === '__NEW__' && (
            <div className="p-2.5 bg-purple-50 rounded-xl border border-purple-200">
              <label className="block font-bold text-purple-900 mb-1">Nama Kategori Baru</label>
              <input
                type="text"
                required
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Ketik nama kategori baru..."
                className="w-full p-2.5 rounded-xl border border-purple-300 font-bold focus:ring-2 focus:ring-purple-500 outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 mb-1">Harga Jual Produk (Rp)</label>
            <div className="relative">
              <span className="absolute left-3 top-3 font-bold text-slate-400">Rp</span>
              <input
                type="text"
                required
                readOnly
                inputMode="none"
                onClick={() => setIsKeypadOpen(true)}
                value={priceInput}
                placeholder="Sentuh untuk Buka Kalkulator..."
                className="w-full p-2.5 sm:p-3 pl-10 pr-10 rounded-xl border border-slate-300 font-extrabold text-purple-700 focus:ring-2 focus:ring-purple-500 outline-none text-sm sm:text-base cursor-pointer bg-slate-50 hover:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setIsKeypadOpen(true)}
                className="absolute right-3 top-2.5 p-1 rounded-lg bg-purple-100 text-purple-800 hover:bg-purple-200 transition cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-slate-500 mt-1">Sentuh kolom di atas untuk mengetik menggunakan Kalkulator Aplikasi</p>
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-extrabold py-3 rounded-xl shadow-md active:scale-95 transition cursor-pointer"
          >
            {initialData ? 'Simpan Perubahan Produk' : 'Simpan Produk Baru'}
          </button>
        </form>
      </ModalWrapper>

      {/* IN-APP NUMERIC CALCULATOR KEYPAD SHEET */}
      <NumericCalculatorKeypad
        isOpen={isKeypadOpen}
        title="Input Harga Jual Produk"
        initialValue={parseFormattedNumber(priceInput)}
        onClose={() => setIsKeypadOpen(false)}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
