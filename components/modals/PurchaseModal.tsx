'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { AlertTriangle, Wallet, Calculator, Plus, Trash2, History, ShoppingBag, Check } from 'lucide-react';
import { PurchaseBatch } from '@/lib/types';

export interface PurchaseItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface RawMaterialHistoryItem {
  name: string;
  unit: string;
  pricePerUnit: number;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBalance: number;
  purchaseBatches?: PurchaseBatch[];
  onSubmit: (data: { itemsDescription: string; totalCost: number; supplier: string }) => void;
}

// Preset common raw materials for initial suggestion list
const PRESET_RAW_MATERIALS: RawMaterialHistoryItem[] = [
  { name: 'Tepung Terigu', unit: 'kg', pricePerUnit: 12000 },
  { name: 'Gula Pasir', unit: 'kg', pricePerUnit: 16000 },
  { name: 'Susu Kental Manis', unit: 'kaleng', pricePerUnit: 12500 },
  { name: 'Minyak Goreng', unit: 'liter', pricePerUnit: 18000 },
  { name: 'Cokelat Bubuk', unit: 'kg', pricePerUnit: 45000 },
  { name: 'Telur Ayam', unit: 'kg', pricePerUnit: 28000 },
  { name: 'Margarin', unit: 'kg', pricePerUnit: 25000 },
  { name: 'Plastik Kemasan', unit: 'pax', pricePerUnit: 10000 },
];

const COMMON_UNITS = ['kg', 'gram', 'pcs', 'liter', 'kaleng', 'bungkus', 'pax', 'botol', 'dus', 'roll'];

export default function PurchaseModal({ isOpen, onClose, cashBalance, purchaseBatches = [], onSubmit }: PurchaseModalProps) {
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', name: '', qty: 1, unit: 'kg', pricePerUnit: 0, total: 0 },
  ]);
  const [activeItemFocus, setActiveItemFocus] = useState<number | null>(null);

  // Keypad target state
  const [keypadTarget, setKeypadTarget] = useState<{
    isOpen: boolean;
    itemIndex: number;
    field: 'qty' | 'pricePerUnit' | 'total';
    initialValue: number;
    title: string;
  }>({
    isOpen: false,
    itemIndex: 0,
    field: 'qty',
    initialValue: 0,
    title: '',
  });

  // Extract raw material history from past purchase batches + preset + local storage
  const rawMaterialHistory = useMemo(() => {
    const map = new Map<string, RawMaterialHistoryItem>();

    // 1. Add Presets
    PRESET_RAW_MATERIALS.forEach((item) => {
      map.set(item.name.toLowerCase(), item);
    });

    // 2. Parse from purchase batches description if any
    purchaseBatches.forEach((batch) => {
      if (batch.itemsDescription) {
        // e.g. "Tepung Terigu (5 kg @ Rp 12.000 = Rp 60.000)"
        const parts = batch.itemsDescription.split(/,|\n/);
        parts.forEach((part) => {
          const match = part.match(/([A-Za-z0-9\s]+)\s*\(([\d.]+)\s*([A-Za-z]+)\s*@\s*Rp\s*([\d.]+)/i);
          if (match) {
            const name = match[1].trim();
            const unit = match[3].trim().toLowerCase();
            const price = parseFormattedNumber(match[4]);
            if (name && price > 0) {
              map.set(name.toLowerCase(), { name, unit, pricePerUnit: price });
            }
          } else {
            // Simple match e.g. "Susu Kental 5 kaleng"
            const nameClean = part.replace(/\([^)]*\)/g, '').trim();
            if (nameClean && nameClean.length > 2) {
              map.set(nameClean.toLowerCase(), { name: nameClean, unit: 'pcs', pricePerUnit: 0 });
            }
          }
        });
      }
    });

    // 3. Parse saved local storage history
    try {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('dapurzy_raw_material_history');
        if (saved) {
          const parsed: RawMaterialHistoryItem[] = JSON.parse(saved);
          parsed.forEach((item) => map.set(item.name.toLowerCase(), item));
        }
      }
    } catch (e) {
      console.log('Error reading material history:', e);
    }

    return Array.from(map.values());
  }, [purchaseBatches]);

  if (!isOpen) return null;

  // Grand Total calculation
  const grandTotalCost = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const remainingBalance = cashBalance - grandTotalCost;
  const isInsufficientCash = grandTotalCost > cashBalance || cashBalance <= 0;
  const isFormValid = items.length > 0 && items.every((i) => i.name.trim() !== '' && i.total > 0) && !isInsufficientCash;

  // Keypad Handlers
  const openKeypad = (itemIndex: number, field: 'qty' | 'pricePerUnit' | 'total') => {
    const item = items[itemIndex];
    let val = 0;
    let title = '';

    if (field === 'qty') {
      val = item.qty;
      title = `Input Jumlah (${item.name || 'Barang ' + (itemIndex + 1)})`;
    } else if (field === 'pricePerUnit') {
      val = item.pricePerUnit;
      title = `Input Harga Satuan (Rp) (${item.name || 'Barang ' + (itemIndex + 1)})`;
    } else if (field === 'total') {
      val = item.total;
      title = `Input Total Harga Item (Rp) (${item.name || 'Barang ' + (itemIndex + 1)})`;
    }

    setKeypadTarget({
      isOpen: true,
      itemIndex,
      field,
      initialValue: val,
      title,
    });
  };

  const handleKeypadConfirm = (val: number) => {
    const { itemIndex, field } = keypadTarget;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const updated = { ...item };
        if (field === 'qty') {
          updated.qty = Math.max(1, val);
          updated.total = updated.qty * updated.pricePerUnit;
        } else if (field === 'pricePerUnit') {
          updated.pricePerUnit = Math.max(0, val);
          updated.total = updated.qty * updated.pricePerUnit;
        } else if (field === 'total') {
          updated.total = Math.max(0, val);
          if (updated.qty > 0) {
            updated.pricePerUnit = Math.round(updated.total / updated.qty);
          }
        }
        return updated;
      })
    );
  };

  // Add Item Row
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString().slice(2, 5),
        name: '',
        qty: 1,
        unit: 'kg',
        pricePerUnit: 0,
        total: 0,
      },
    ]);
  };

  // Remove Item Row
  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Update Item Fields
  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const updated = { ...item, [field]: value };
        if (field === 'name') {
          // If name matches a historical item exactly, auto-fill unit & price
          const match = rawMaterialHistory.find((h) => h.name.toLowerCase() === String(value).trim().toLowerCase());
          if (match) {
            updated.unit = match.unit;
            if (match.pricePerUnit > 0) {
              updated.pricePerUnit = match.pricePerUnit;
              updated.total = updated.qty * match.pricePerUnit;
            }
          }
        }
        return updated;
      })
    );
  };

  // Select suggestion from Riwayat Bahan Baku
  const handleSelectSuggestion = (index: number, historyItem: RawMaterialHistoryItem) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const price = historyItem.pricePerUnit || item.pricePerUnit;
        return {
          ...item,
          name: historyItem.name,
          unit: historyItem.unit || 'kg',
          pricePerUnit: price,
          total: item.qty * price,
        };
      })
    );
    setActiveItemFocus(null);
  };

  // Save batch submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Generate clean itemsDescription string
    const itemsFormatted = items.map(
      (i) => `${i.name.trim()} (${i.qty} ${i.unit} @ Rp ${formatNumberWithDots(i.pricePerUnit)} = Rp ${formatNumberWithDots(i.total)})`
    );
    const itemsDescription = itemsFormatted.join(', ');

    // Save items to local raw material history
    try {
      if (typeof window !== 'undefined') {
        const newHistory = [...rawMaterialHistory];
        items.forEach((item) => {
          if (item.name.trim()) {
            const existingIdx = newHistory.findIndex((h) => h.name.toLowerCase() === item.name.trim().toLowerCase());
            if (existingIdx >= 0) {
              newHistory[existingIdx] = {
                name: item.name.trim(),
                unit: item.unit,
                pricePerUnit: item.pricePerUnit || newHistory[existingIdx].pricePerUnit,
              };
            } else {
              newHistory.push({
                name: item.name.trim(),
                unit: item.unit,
                pricePerUnit: item.pricePerUnit,
              });
            }
          }
        });
        localStorage.setItem('dapurzy_raw_material_history', JSON.stringify(newHistory));
      }
    } catch (e) {
      console.log('Error saving material history:', e);
    }

    onSubmit({ itemsDescription, totalCost: grandTotalCost, supplier });

    // Reset Form
    setSupplier('');
    setItems([{ id: '1', name: '', qty: 1, unit: 'kg', pricePerUnit: 0, total: 0 }]);
  };

  return (
    <>
      <ModalWrapper title="Form Belanja Bahan Baku (Rincian Multi-Item)" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          {/* CASH BALANCE DISPLAY HEADER */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between shadow-xs">
            <div className="flex items-center space-x-2">
              <Wallet className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
              <span className="text-xs font-bold text-slate-700">Saldo Kas Operasional:</span>
            </div>
            <span className={`font-black text-sm sm:text-base ${cashBalance <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatRupiah(cashBalance)}
            </span>
          </div>

          {/* INSUFFICIENT CASH ALERT */}
          {cashBalance <= 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              <span>Saldo Kas Operasional Habis (Rp 0)! Harap Injeksi Modal terlebih dahulu.</span>
            </div>
          )}

          {/* SUPPLIER / TOKO BAHAN */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Supplier / Toko Bahan (Opsional)</label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Toko Bahan Kue Mulia, Pasar Cihapit"
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-800"
            />
          </div>

          {/* RINCIAN ITEM BELANJA DAFTAR FORM */}
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-1 border-b border-slate-200">
              <label className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                Rincian Item Belanja Bahan Baku ({items.length} Item)
              </label>
              <span className="text-[11px] text-slate-500 font-medium">Input Nominal via Keypad Aplikasi</span>
            </div>

            {items.map((item, index) => {
              const suggestions = rawMaterialHistory.filter(
                (h) => !item.name || h.name.toLowerCase().includes(item.name.toLowerCase())
              );

              return (
                <div
                  key={item.id}
                  className="p-3.5 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-3 relative hover:border-amber-300 transition"
                >
                  {/* ITEM ROW HEADER */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-xs">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-rose-500 hover:text-rose-700 hover:bg-rose-100 rounded-lg transition cursor-pointer flex items-center gap-1 text-xs font-semibold"
                        title="Hapus Item Ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>

                  {/* NAMA BARANG (TEXT INPUT + RIWAYAT SUGGESTIONS) */}
                  <div className="relative">
                    <label className="block font-bold text-slate-700 text-xs mb-1">
                      Nama Barang / Bahan Baku <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onFocus={() => setActiveItemFocus(index)}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      placeholder="e.g. Tepung Terigu, Gula Pasir, Susu Kental Manis"
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium text-slate-800 text-xs sm:text-sm"
                    />

                    {/* RIWAYAT BAHAN BAKU AUTO-SUGGESTION CAROUSEL / PILLS */}
                    {activeItemFocus === index && suggestions.length > 0 && (
                      <div className="mt-2 p-2 bg-amber-50/90 border border-amber-200 rounded-xl space-y-1.5 shadow-sm">
                        <div className="flex items-center space-x-1 text-[11px] font-extrabold text-amber-900">
                          <History className="w-3.5 h-3.5 text-amber-700" />
                          <span>Riwayat Bahan Baku (Klik untuk Pilih Otomatis):</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
                          {suggestions.map((hist, hIdx) => (
                            <button
                              key={hIdx}
                              type="button"
                              onClick={() => handleSelectSuggestion(index, hist)}
                              className="px-2.5 py-1 rounded-lg bg-white border border-amber-300 hover:bg-amber-500 hover:text-white text-slate-700 text-[11px] font-bold transition flex items-center space-x-1 cursor-pointer active:scale-95 shadow-2xs"
                            >
                              <span>Beli Bahan Baku ({hist.name}) Lagi?</span>
                              {hist.pricePerUnit > 0 && (
                                <span className="text-amber-700 group-hover:text-white font-mono">
                                  [{formatRupiah(hist.pricePerUnit)}/{hist.unit}]
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GRID FORM UNTUK: JUMLAH, SATUAN, HARGA SATUAN, TOTAL */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {/* JUMLAH (KEYPAD NOMINAL) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Jumlah</label>
                      <input
                        type="text"
                        readOnly
                        inputMode="none"
                        onClick={() => openKeypad(index, 'qty')}
                        value={formatNumberWithDots(item.qty)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-extrabold text-center text-slate-800 outline-none cursor-pointer hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition"
                      />
                    </div>

                    {/* SATUAN (SELECT / TEXT) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Satuan</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 transition text-xs"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u}>
                            {u}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* HARGA SATUAN (KEYPAD NOMINAL) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Harga Satuan (Rp)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'pricePerUnit')}
                          value={formatNumberWithDots(item.pricePerUnit)}
                          placeholder="Rp 0"
                          className="w-full p-2 pr-7 rounded-xl border border-slate-300 bg-white font-extrabold text-right text-slate-800 outline-none cursor-pointer hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => openKeypad(index, 'pricePerUnit')}
                          className="absolute right-1.5 top-1.5 p-0.5 text-amber-600 hover:bg-amber-100 rounded cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* TOTAL ITEM (AUTO CALCULATED / KEYPAD NOMINAL) */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Total (Rp)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'total')}
                          value={formatNumberWithDots(item.total)}
                          placeholder="Rp 0"
                          className="w-full p-2 pr-7 rounded-xl border border-amber-300 bg-amber-50/60 font-black text-right text-amber-900 outline-none cursor-pointer hover:border-amber-500 focus:ring-2 focus:ring-amber-500 transition text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => openKeypad(index, 'total')}
                          className="absolute right-1.5 top-1.5 p-0.5 text-amber-700 hover:bg-amber-200 rounded cursor-pointer"
                        >
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* BUTTON TAMBAH ITEM */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-dashed border-amber-300 rounded-2xl font-black text-xs sm:text-sm flex items-center justify-center space-x-1.5 active:scale-98 transition cursor-pointer shadow-2xs"
            >
              <Plus className="w-4 h-4 text-amber-700 stroke-[3]" />
              <span>➕ Tambah Item Belanja (Bisa Bebas Tanpa Batas)</span>
            </button>
          </div>

          {/* GRAND TOTAL & SISA KAS CALCULATOR CARD */}
          <div className="p-3.5 bg-emerald-50/90 border border-emerald-200 rounded-2xl space-y-2 text-xs shadow-xs">
            <div className="flex items-center justify-between text-emerald-950 font-black pb-1.5 border-b border-emerald-200">
              <div className="flex items-center space-x-1.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                <span>Kalkulasi Sisa Kas Real-Time</span>
              </div>
              <span className="text-emerald-800 text-[11px] font-bold">
                Grand Total ({items.length} Item): {formatRupiah(grandTotalCost)}
              </span>
            </div>

            <div className="flex justify-between items-center text-slate-600">
              <span>1. Saldo Kas Operasional Awal:</span>
              <span className="font-bold text-slate-800">{formatRupiah(cashBalance)}</span>
            </div>

            <div className="flex justify-between items-center text-rose-600">
              <span>2. Grand Total Seluruh Item Belanja:</span>
              <span className="font-bold">- {formatRupiah(grandTotalCost)}</span>
            </div>

            <div className="pt-1.5 border-t border-emerald-200/80 flex justify-between items-center">
              <span className="font-extrabold text-slate-800">Sisa Saldo Kas (Setelah Belanja):</span>
              <span
                className={`font-black text-sm sm:text-base ${
                  remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}
              >
                {formatRupiah(remainingBalance)}
              </span>
            </div>
          </div>

          {grandTotalCost > cashBalance && cashBalance > 0 && (
            <p className="text-xs text-rose-600 font-bold flex items-center gap-1">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" /> Total belanja ({formatRupiah(grandTotalCost)}) melebihi saldo kas ({formatRupiah(cashBalance)})!
            </p>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl shadow-md active:scale-95 transition cursor-pointer text-xs sm:text-sm flex items-center justify-center space-x-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>
              {isInsufficientCash
                ? 'Saldo Kas Tidak Mencukupi'
                : `Simpan Batch Belanja (${formatRupiah(grandTotalCost)})`}
            </span>
          </button>
        </form>
      </ModalWrapper>

      {/* IN-APP NUMERIC CALCULATOR KEYPAD SHEET */}
      <NumericCalculatorKeypad
        isOpen={keypadTarget.isOpen}
        title={keypadTarget.title}
        initialValue={keypadTarget.initialValue}
        onClose={() => setKeypadTarget((prev) => ({ ...prev, isOpen: false }))}
        onConfirm={handleKeypadConfirm}
      />
    </>
  );
}
