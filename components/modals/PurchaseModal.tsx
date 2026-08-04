'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import ModalWrapper from '../ModalWrapper';
import NumericCalculatorKeypad from '../NumericCalculatorKeypad';
import { formatRupiah, formatNumberWithDots } from '@/lib/utils';
import { AlertTriangle, Wallet, Calculator, Plus, Trash2, History, ShoppingBag, Check, Loader2 } from 'lucide-react';

export interface PurchaseItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  pricePerUnit: number;
  total: number;
}

export interface RawMaterialHistoryItem {
  id?: string;
  name: string;
  unit: string;
  lastPrice: number;
  buyCount?: number;
}

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashBalance: number;
  onSubmit: (data: { itemsDescription: string; totalCost: number; supplier: string; items: PurchaseItem[] }) => void;
}

// Preset common raw materials shown when DB has no history yet
const PRESET_RAW_MATERIALS: RawMaterialHistoryItem[] = [
  { name: 'Tepung Terigu', unit: 'kg', lastPrice: 12000 },
  { name: 'Gula Pasir', unit: 'kg', lastPrice: 16000 },
  { name: 'Susu Kental Manis', unit: 'kaleng', lastPrice: 12500 },
  { name: 'Minyak Goreng', unit: 'liter', lastPrice: 18000 },
  { name: 'Cokelat Bubuk', unit: 'kg', lastPrice: 45000 },
  { name: 'Telur Ayam', unit: 'kg', lastPrice: 28000 },
  { name: 'Margarin', unit: 'kg', lastPrice: 25000 },
  { name: 'Plastik Kemasan', unit: 'pax', lastPrice: 10000 },
  { name: 'Garam', unit: 'bungkus', lastPrice: 3000 },
  { name: 'Baking Powder', unit: 'gram', lastPrice: 5000 },
  { name: 'Vanili', unit: 'gram', lastPrice: 4000 },
  { name: 'Soda Kue', unit: 'gram', lastPrice: 3500 },
];

const COMMON_UNITS = ['kg', 'gram', 'pcs', 'liter', 'kaleng', 'bungkus', 'pax', 'botol', 'dus', 'roll', 'lusin', 'set'];

export default function PurchaseModal({ isOpen, onClose, cashBalance, onSubmit }: PurchaseModalProps) {
  // ─── ALL HOOKS MUST BE BEFORE ANY CONDITIONAL RETURN ───────────────────────
  const [supplier, setSupplier] = useState('');
  const [items, setItems] = useState<PurchaseItem[]>([
    { id: '1', name: '', qty: 1, unit: 'kg', pricePerUnit: 0, total: 0 },
  ]);
  const [activeItemFocus, setActiveItemFocus] = useState<number | null>(null);
  const [rawMaterialHistory, setRawMaterialHistory] = useState<RawMaterialHistoryItem[]>(PRESET_RAW_MATERIALS);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const suggestionRefs = useRef<(HTMLDivElement | null)[]>([]);

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

  // ── Fetch raw material history from D1 when modal opens ─────────────────────
  useEffect(() => {
    if (!isOpen) return;
    setIsLoadingHistory(true);
    fetch('/api/raw-material-history')
      .then((res) => res.ok ? res.json() : null)
      .then((json) => {
        if (json?.success && json.data && json.data.length > 0) {
          const dbItems: RawMaterialHistoryItem[] = json.data.map((r: any) => ({
            id: r.id,
            name: r.name,
            unit: r.unit ?? 'kg',
            lastPrice: r.last_price ?? 0,
            buyCount: r.buy_count ?? 1,
          }));
          // Merge: DB items first (with accurate prices), then presets that aren't in DB
          const dbNames = new Set(dbItems.map((d) => d.name.toLowerCase()));
          const merged = [
            ...dbItems,
            ...PRESET_RAW_MATERIALS.filter((p) => !dbNames.has(p.name.toLowerCase())),
          ];
          setRawMaterialHistory(merged);
        }
      })
      .catch((e) => console.log('Failed to load raw material history:', e))
      .finally(() => setIsLoadingHistory(false));
  }, [isOpen]);

  // ── Reset form when modal is opened ─────────────────────────────────────────
  useEffect(() => {
    if (isOpen) {
      setSupplier('');
      setItems([{ id: '1', name: '', qty: 1, unit: 'kg', pricePerUnit: 0, total: 0 }]);
      setActiveItemFocus(null);
    }
  }, [isOpen]);

  // ── Click-outside closes suggestion dropdown ─────────────────────────────────
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (activeItemFocus === null) return;
      const ref = suggestionRefs.current[activeItemFocus];
      if (ref && !ref.contains(e.target as Node)) {
        setActiveItemFocus(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeItemFocus]);

  // ─── CONDITIONAL RETURN — after all hooks ────────────────────────────────────
  if (!isOpen) return null;

  // ── Derived Values ────────────────────────────────────────────────────────────
  const grandTotalCost = items.reduce((sum, item) => sum + (item.total || 0), 0);
  const remainingBalance = cashBalance - grandTotalCost;
  const isInsufficientCash = grandTotalCost > cashBalance || cashBalance <= 0;
  const isFormValid =
    items.length > 0 &&
    items.every((i) => i.name.trim() !== '' && i.total > 0) &&
    !isInsufficientCash;

  // ── Keypad Handlers ───────────────────────────────────────────────────────────
  const openKeypad = (itemIndex: number, field: 'qty' | 'pricePerUnit' | 'total') => {
    const item = items[itemIndex];
    let val = 0;
    let title = '';
    const label = item.name || `Barang ${itemIndex + 1}`;

    if (field === 'qty') { val = item.qty; title = `Jumlah — ${label}`; }
    else if (field === 'pricePerUnit') { val = item.pricePerUnit; title = `Harga Satuan (Rp) — ${label}`; }
    else if (field === 'total') { val = item.total; title = `Total Harga (Rp) — ${label}`; }

    setKeypadTarget({ isOpen: true, itemIndex, field, initialValue: val, title });
  };

  const handleKeypadConfirm = (val: number) => {
    const { itemIndex, field } = keypadTarget;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== itemIndex) return item;
        const u = { ...item };
        if (field === 'qty') {
          u.qty = Math.max(1, val);
          u.total = u.qty * u.pricePerUnit;
        } else if (field === 'pricePerUnit') {
          u.pricePerUnit = Math.max(0, val);
          u.total = u.qty * u.pricePerUnit;
        } else if (field === 'total') {
          u.total = Math.max(0, val);
          if (u.qty > 0) u.pricePerUnit = Math.round(u.total / u.qty);
        }
        return u;
      })
    );
  };

  // ── Item CRUD ─────────────────────────────────────────────────────────────────
  const handleAddItem = () =>
    setItems((prev) => [
      ...prev,
      {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
        name: '',
        qty: 1,
        unit: 'kg',
        pricePerUnit: 0,
        total: 0,
      },
    ]);

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        const u = { ...item, [field]: value };
        // If typing name, try exact-match autofill from history
        if (field === 'name') {
          const match = rawMaterialHistory.find(
            (h) => h.name.toLowerCase() === String(value).trim().toLowerCase()
          );
          if (match) {
            u.unit = match.unit;
            if (match.lastPrice > 0) {
              u.pricePerUnit = match.lastPrice;
              u.total = u.qty * match.lastPrice;
            }
          }
        }
        return u;
      })
    );
  };

  // ── Suggestion Selection ──────────────────────────────────────────────────────
  const handleSelectSuggestion = (index: number, hist: RawMaterialHistoryItem) => {
    const price = hist.lastPrice || 0;
    setItems((prev) =>
      prev.map((item, idx) => {
        if (idx !== index) return item;
        return {
          ...item,
          name: hist.name,
          unit: hist.unit || 'kg',
          pricePerUnit: price,
          total: item.qty * price,
        };
      })
    );
    setActiveItemFocus(null);
  };

  // ── Form Submission ───────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormValid) return;

    // Build itemsDescription string
    const itemsDescription = items
      .map(
        (i) =>
          `${i.name.trim()} (${i.qty} ${i.unit} @ Rp ${formatNumberWithDots(i.pricePerUnit)} = Rp ${formatNumberWithDots(i.total)})`
      )
      .join(', ');

    // Save raw material history to D1 (non-blocking)
    const historyPayload = items
      .filter((i) => i.name.trim())
      .map((i) => ({ name: i.name.trim(), unit: i.unit, lastPrice: i.pricePerUnit }));

    if (historyPayload.length > 0) {
      fetch('/api/raw-material-history', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: historyPayload }),
      }).catch((e) => console.log('Failed to save material history:', e));
    }

    onSubmit({ itemsDescription, totalCost: grandTotalCost, supplier, items });
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <>
      <ModalWrapper title="Form Belanja Bahan Baku" onClose={onClose}>
        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">

          {/* SALDO KAS */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Wallet className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-bold text-slate-700 text-xs">Saldo Kas Operasional:</span>
            </div>
            <span className={`font-black text-sm ${cashBalance <= 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatRupiah(cashBalance)}
            </span>
          </div>

          {/* ALERT SALDO HABIS */}
          {cashBalance <= 0 && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-rose-800 text-xs font-bold">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
              <span>Saldo Kas Habis (Rp 0)! Harap Injeksi Modal terlebih dahulu.</span>
            </div>
          )}

          {/* SUPPLIER */}
          <div>
            <label className="block font-bold text-slate-700 mb-1">Supplier / Toko Bahan <span className="text-slate-400 font-normal">(opsional)</span></label>
            <input
              type="text"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="e.g. Toko Bahan Kue Mulia, Pasar Cihapit"
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white text-slate-800"
            />
          </div>

          {/* DAFTAR ITEM BELANJA */}
          <div className="space-y-3">
            {/* SECTION HEADER */}
            <div className="flex flex-wrap justify-between items-center gap-1 pb-1 border-b border-slate-200">
              <span className="font-extrabold text-slate-800 flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-amber-600" />
                Rincian Item Belanja ({items.length} Item)
              </span>
              {isLoadingHistory ? (
                <span className="flex items-center gap-1 text-[11px] text-amber-600">
                  <Loader2 className="w-3 h-3 animate-spin" /> Memuat riwayat...
                </span>
              ) : (
                <span className="text-[11px] text-slate-400">Nominal via Keypad Aplikasi</span>
              )}
            </div>

            {/* ITEM CARDS */}
            {items.map((item, index) => {
              const query = item.name.trim().toLowerCase();
              const suggestions = rawMaterialHistory.filter(
                (h) => !query || h.name.toLowerCase().includes(query)
              );

              return (
                <div
                  key={item.id}
                  className="p-3 bg-slate-50/80 border border-slate-200 rounded-2xl space-y-2.5 hover:border-amber-300 transition-colors"
                >
                  {/* ITEM HEADER */}
                  <div className="flex justify-between items-center">
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px]">
                      Item #{index + 1}
                    </span>
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="flex items-center gap-1 text-[11px] font-semibold text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2 py-0.5 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                      </button>
                    )}
                  </div>

                  {/* NAMA BARANG + RIWAYAT SUGGESTIONS */}
                  <div
                    className="relative"
                    ref={(el) => { suggestionRefs.current[index] = el; }}
                  >
                    <label className="block font-bold text-slate-700 text-[11px] mb-1">
                      Nama Barang / Bahan Baku <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={item.name}
                      onFocus={() => setActiveItemFocus(index)}
                      onChange={(e) => {
                        handleItemChange(index, 'name', e.target.value);
                        setActiveItemFocus(index);
                      }}
                      placeholder="e.g. Tepung Terigu, Gula Pasir, Susu Kental..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500 outline-none bg-white font-medium text-slate-800 text-xs sm:text-sm"
                    />

                    {/* RIWAYAT BAHAN BAKU DROPDOWN */}
                    {activeItemFocus === index && suggestions.length > 0 && (
                      <div className="mt-1.5 p-2 bg-white border border-amber-200 rounded-xl shadow-lg z-20 relative">
                        <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-800 mb-1.5">
                          <History className="w-3.5 h-3.5 text-amber-600" />
                          Riwayat Bahan Baku — Klik untuk Pilih Otomatis:
                        </div>
                        <div className="flex flex-wrap gap-1.5 max-h-40 overflow-y-auto">
                          {suggestions.map((hist, hIdx) => (
                            <button
                              key={hIdx}
                              type="button"
                              onMouseDown={(e) => {
                                e.preventDefault(); // prevent blur before click fires
                                handleSelectSuggestion(index, hist);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-300 hover:bg-amber-500 hover:text-white text-slate-700 hover:border-amber-500 text-[11px] font-semibold transition flex flex-col items-start cursor-pointer active:scale-95"
                            >
                              <span className="font-bold">Beli {hist.name} Lagi?</span>
                              {hist.lastPrice > 0 && (
                                <span className="text-amber-600 text-[10px]">
                                  {formatRupiah(hist.lastPrice)}/{hist.unit}
                                  {hist.buyCount && hist.buyCount > 1 ? ` • ${hist.buyCount}× dibeli` : ''}
                                </span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* GRID: JUMLAH | SATUAN | HARGA SATUAN | TOTAL */}
                  <div className="grid grid-cols-2 gap-2">
                    {/* JUMLAH */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Jumlah</label>
                      <input
                        type="text"
                        readOnly
                        inputMode="none"
                        onClick={() => openKeypad(index, 'qty')}
                        value={formatNumberWithDots(item.qty)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-extrabold text-center text-slate-800 outline-none cursor-pointer hover:border-amber-400 active:bg-amber-50 transition text-xs"
                      />
                    </div>

                    {/* SATUAN */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Satuan</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full p-2 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 outline-none focus:ring-2 focus:ring-amber-500 transition text-xs"
                      >
                        {COMMON_UNITS.map((u) => (
                          <option key={u} value={u}>{u}</option>
                        ))}
                      </select>
                    </div>

                    {/* HARGA SATUAN */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">Harga Satuan (Rp)</label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'pricePerUnit')}
                          value={item.pricePerUnit > 0 ? formatNumberWithDots(item.pricePerUnit) : ''}
                          placeholder="Ketuk untuk input"
                          className="w-full p-2 pr-7 rounded-xl border border-slate-300 bg-white font-extrabold text-right text-slate-800 placeholder:text-slate-300 outline-none cursor-pointer hover:border-amber-400 active:bg-amber-50 transition text-xs"
                        />
                        <button type="button" onClick={() => openKeypad(index, 'pricePerUnit')}
                          className="absolute right-1.5 top-1.5 text-amber-600 hover:bg-amber-100 rounded p-0.5 cursor-pointer">
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* TOTAL ITEM */}
                    <div>
                      <label className="block font-bold text-slate-700 text-[11px] mb-1">
                        Total Item (Rp) <span className="text-emerald-600 font-normal text-[10px]">= Jml × Harga</span>
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          inputMode="none"
                          onClick={() => openKeypad(index, 'total')}
                          value={item.total > 0 ? formatNumberWithDots(item.total) : ''}
                          placeholder="Otomatis / ketuk"
                          className="w-full p-2 pr-7 rounded-xl border border-amber-300 bg-amber-50/70 font-black text-right text-amber-900 placeholder:text-amber-300 outline-none cursor-pointer hover:border-amber-500 active:bg-amber-100 transition text-xs"
                        />
                        <button type="button" onClick={() => openKeypad(index, 'total')}
                          className="absolute right-1.5 top-1.5 text-amber-700 hover:bg-amber-100 rounded p-0.5 cursor-pointer">
                          <Calculator className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* TOMBOL TAMBAH ITEM */}
            <button
              type="button"
              onClick={handleAddItem}
              className="w-full py-2.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border-2 border-dashed border-amber-300 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer active:scale-[.98]"
            >
              <Plus className="w-4 h-4 stroke-[3] text-amber-700" />
              ➕ Tambah Item Belanja (Tanpa Batas)
            </button>
          </div>

          {/* GRAND TOTAL + SISA KAS CARD */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2 text-xs">
            <div className="flex flex-wrap justify-between items-center gap-1 pb-1.5 border-b border-emerald-200 font-extrabold text-emerald-900">
              <span className="flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-emerald-700" />
                Kalkulasi Sisa Kas Real-Time
              </span>
              <span className="text-emerald-800 font-bold text-[11px]">
                Grand Total ({items.length} Item): {formatRupiah(grandTotalCost)}
              </span>
            </div>

            <div className="flex justify-between text-slate-600">
              <span>Saldo Kas Awal:</span>
              <span className="font-bold text-slate-800">{formatRupiah(cashBalance)}</span>
            </div>

            <div className="flex justify-between text-rose-600">
              <span>Grand Total Belanja:</span>
              <span className="font-bold">− {formatRupiah(grandTotalCost)}</span>
            </div>

            <div className="flex justify-between pt-1.5 border-t border-emerald-200">
              <span className="font-extrabold text-slate-800">Sisa Saldo Kas:</span>
              <span className={`font-black text-sm ${remainingBalance < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {formatRupiah(remainingBalance)}
              </span>
            </div>
          </div>

          {/* ALERT KURANG KAS */}
          {grandTotalCost > cashBalance && cashBalance > 0 && (
            <p className="flex items-center gap-1 text-xs text-rose-600 font-bold">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Total belanja ({formatRupiah(grandTotalCost)}) melebihi saldo kas ({formatRupiah(cashBalance)})!
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-extrabold py-3.5 rounded-2xl shadow-md active:scale-95 transition cursor-pointer text-xs sm:text-sm flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            {isInsufficientCash
              ? 'Saldo Kas Tidak Mencukupi'
              : `Simpan Batch Belanja · ${formatRupiah(grandTotalCost)}`}
          </button>
        </form>
      </ModalWrapper>

      {/* KALKULATOR KEYPAD APLIKASI */}
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
