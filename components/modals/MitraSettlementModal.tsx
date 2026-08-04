'use client';

import React, { useState, useEffect, useMemo } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Product, Mitra } from '@/lib/types';
import { formatRupiah, formatNumberWithDots, parseFormattedNumber } from '@/lib/utils';
import { Calculator, MessageCircle, Zap, Handshake } from 'lucide-react';

interface MitraSettlementModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  mitras: Mitra[];
  onSubmit: (data: {
    mitraId: string;
    productId: string;
    titipQty: number;
    returnedQty: number;
    soldQty: number;
    pricePerUnit: number;
    paymentMethod: string;
    transactionType?: 'KONSINYASI' | 'BELI_PUTUS';
  }) => void;
}

export default function MitraSettlementModal({
  isOpen,
  onClose,
  products,
  mitras,
  onSubmit,
}: MitraSettlementModalProps) {
  const [transactionType, setTransactionType] = useState<'KONSINYASI' | 'BELI_PUTUS'>('KONSINYASI');
  const [selectedMitraId, setSelectedMitraId] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  
  // Consignment state
  const [titipQtyInput, setTitipQtyInput] = useState<string>('40');
  const [returnedQtyInput, setReturnedQtyInput] = useState<string>('0');
  
  // Direct Cash Purchase state
  const [directQtyInput, setDirectQtyInput] = useState<string>('50');
  const [customPriceInput, setCustomPriceInput] = useState<string>('');
  
  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');

  useEffect(() => {
    if (isOpen) {
      if (mitras.length > 0 && !selectedMitraId) {
        setSelectedMitraId(mitras[0].id);
      }
      if (products.length > 0 && !selectedProductId) {
        setSelectedProductId(products[0].id);
      }
    }
  }, [isOpen, mitras, products, selectedMitraId, selectedProductId]);

  const selectedMitra = useMemo(() => mitras.find((m) => m.id === selectedMitraId) || mitras[0], [mitras, selectedMitraId]);
  const selectedProduct = useMemo(() => products.find((p) => p.id === selectedProductId) || products[0], [products, selectedProductId]);

  // Resolve standard custom price for this mitra if exists, otherwise product price
  const baseMitraPrice = useMemo(() => {
    if (!selectedMitra || !selectedProduct) return 0;
    if (selectedMitra.customPrices) {
      const pricesMap = typeof selectedMitra.customPrices === 'string' ? JSON.parse(selectedMitra.customPrices) : selectedMitra.customPrices;
      if (pricesMap && pricesMap[selectedProduct.id] && Number(pricesMap[selectedProduct.id]) > 0) {
        return Number(pricesMap[selectedProduct.id]);
      }
    }
    return selectedProduct.price || 0;
  }, [selectedMitra, selectedProduct]);

  // Sync custom price input when base price or product changes
  useEffect(() => {
    if (baseMitraPrice > 0 && !customPriceInput) {
      setCustomPriceInput(formatNumberWithDots(baseMitraPrice));
    }
  }, [baseMitraPrice, customPriceInput]);

  if (!isOpen) return null;

  // Final price to use
  const effectivePrice = transactionType === 'BELI_PUTUS' && customPriceInput
    ? parseFormattedNumber(customPriceInput)
    : baseMitraPrice;

  // Quantities calculation
  const titipQty = transactionType === 'BELI_PUTUS' ? parseFormattedNumber(directQtyInput) : parseFormattedNumber(titipQtyInput);
  const returnedQty = transactionType === 'BELI_PUTUS' ? 0 : parseFormattedNumber(returnedQtyInput);
  const soldQty = Math.max(0, titipQty - returnedQty);

  const totalOmzet = soldQty * effectivePrice;
  const hppPerUnit = selectedProduct?.avgHpp || 0;
  const recoveredCost = soldQty * hppPerUnit; // Pokok HPP yang dipulihkan ke Kas Modal
  const netProfit = totalOmzet - recoveredCost;

  const handleSendWhatsAppReport = () => {
    if (!selectedMitra || !selectedProduct) return;
    const cleanWa = selectedMitra.whatsapp ? selectedMitra.whatsapp.replace(/[^0-9]/g, '') : '';
    const dateStr = new Date().toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });

    const isDirect = transactionType === 'BELI_PUTUS';

    const msg = `*REKAP PENJUALAN ${isDirect ? 'BELI PUTUS (CASH)' : 'CONSIGNMENT (TITIP)'} - DAPURZY* 🍞

Halo *${selectedMitra.name}*, berikut rincian transaksi per tanggal ${dateStr}:

📦 *Produk:* ${selectedProduct.name}
• Skema: ${isDirect ? '⚡ Beli Putus (Lunas Cash)' : '🤝 Konsinyasi (Titip)'}
${isDirect ? `• Jumlah Dibeli: ${soldQty} pcs` : `• Dititipkan: ${titipQty} pcs\n• Kembali / Basi: ${returnedQty} pcs\n• Total Laku: ${soldQty} pcs`}
-----------------------------------
*Harga Satuan:* ${formatRupiah(effectivePrice)}
*TOTAL DIBAYAR: ${formatRupiah(totalOmzet)}*

Metode: ${paymentMethod}
Terima kasih banyak atas kerjasamanya! 🙏`;

    let waUrl = '';
    if (cleanWa) {
      const targetPhone = cleanWa.startsWith('0') ? '62' + cleanWa.slice(1) : cleanWa;
      waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(msg)}`;
    } else {
      waUrl = `https://wa.me/?text=${encodeURIComponent(msg)}`;
    }

    window.open(waUrl, '_blank');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMitraId || !selectedProductId || soldQty <= 0) {
      alert('Mohon isi mitra, produk, dan jumlah transaksi yang valid!');
      return;
    }

    onSubmit({
      mitraId: selectedMitraId,
      productId: selectedProductId,
      titipQty,
      returnedQty,
      soldQty,
      pricePerUnit: effectivePrice,
      paymentMethod,
      transactionType,
    });
  };

  return (
    <ModalWrapper title="🤝 Transaksi & Rekap Setoran Mitra" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-3.5 text-xs sm:text-sm pb-4">
        {/* SKEMA TRANSAKSI TOGGLE (KONSINYASI VS BELI PUTUS) */}
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 font-bold">
          <button
            type="button"
            onClick={() => setTransactionType('KONSINYASI')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
              transactionType === 'KONSINYASI'
                ? 'bg-amber-500 text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Handshake className="w-4 h-4" />
            <span>🤝 Konsinyasi (Titip)</span>
          </button>
          <button
            type="button"
            onClick={() => setTransactionType('BELI_PUTUS')}
            className={`flex-1 py-2 px-3 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 text-xs ${
              transactionType === 'BELI_PUTUS'
                ? 'bg-emerald-600 text-white font-black shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>⚡ Beli Putus (Cash)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Mitra</label>
            <select
              value={selectedMitraId}
              onChange={(e) => {
                setSelectedMitraId(e.target.value);
                setCustomPriceInput('');
              }}
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {mitras.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.type})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Pilih Produk</label>
            <select
              value={selectedProductId}
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setCustomPriceInput('');
              }}
              required
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* INPUT TRANSAKSI TERHUBUNG SKEMA */}
        {transactionType === 'BELI_PUTUS' ? (
          <div className="bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-900 flex items-center gap-1">
                <Zap className="w-4 h-4 text-emerald-600" /> Transaksi Direct Cash Beli Putus
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                Lunas di Depan
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Beli (Pcs)</label>
                <input
                  type="text"
                  value={directQtyInput}
                  onChange={(e) => setDirectQtyInput(formatNumberWithDots(e.target.value))}
                  required
                  placeholder="50"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base text-center"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Harga Mitra (Rp/Pcs)</label>
                <input
                  type="text"
                  value={customPriceInput || formatNumberWithDots(baseMitraPrice)}
                  onChange={(e) => setCustomPriceInput(formatNumberWithDots(e.target.value))}
                  required
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-emerald-700 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base text-center"
                />
              </div>
            </div>
          </div>
        ) : (
          /* KONSINYASI FORM */
          <div className="space-y-3">
            <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
              <span className="font-bold text-slate-600">Harga Disepakati Mitra Ini:</span>
              <span className="font-black text-emerald-800 text-sm">{formatRupiah(effectivePrice)} / unit</span>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-amber-50/70 p-3 rounded-2xl border border-amber-200">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Jumlah Dititipkan (Pcs)</label>
                <input
                  type="text"
                  value={titipQtyInput}
                  onChange={(e) => setTitipQtyInput(formatNumberWithDots(e.target.value))}
                  required
                  placeholder="40"
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-black text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none bg-white text-base text-center"
                />
              </div>
              <div>
                <label className="block font-bold text-rose-800 mb-1">Kembali / Basi (Pcs)</label>
                <input
                  type="text"
                  value={returnedQtyInput}
                  onChange={(e) => setReturnedQtyInput(formatNumberWithDots(e.target.value))}
                  required
                  placeholder="0"
                  className="w-full p-2.5 rounded-xl border border-rose-300 font-black text-rose-600 focus:ring-2 focus:ring-rose-500 outline-none bg-white text-base text-center"
                />
              </div>
            </div>
          </div>
        )}

        {/* LIVE CALCULATION RESULT PREVIEW */}
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2.5">
          <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs border-b border-emerald-200 pb-1.5">
            <Calculator className="w-4 h-4 text-emerald-700" /> Ringkasan Pembayaran & Kas Modal
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-bold">Barang Dibeli / Laku:</span>
              <span className="font-black text-emerald-800 text-sm">{formatNumberWithDots(soldQty)} pcs</span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] text-slate-500 block font-bold">Total Pembayaran Cash:</span>
              <span className="font-black text-emerald-700 text-sm">{formatRupiah(totalOmzet)}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-emerald-200/80">
            <div className="bg-blue-50/80 p-2 rounded-xl border border-blue-200">
              <span className="text-[10px] text-blue-700 block font-bold">🏦 Modal Pokok Kembalikan ke Kas:</span>
              <span className="font-extrabold text-blue-900 text-xs">{formatRupiah(recoveredCost)}</span>
            </div>
            <div className="bg-amber-50/80 p-2 rounded-xl border border-amber-200">
              <span className="text-[10px] text-amber-800 block font-bold">💰 Laba Bersih Masuk Profit:</span>
              <span className="font-extrabold text-amber-900 text-xs">{formatRupiah(netProfit)}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block font-bold text-slate-700 mb-1">Metode Pembayaran</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-300 font-bold bg-white"
          >
            <option value="CASH">Tunai (Cash dari Mitra)</option>
            <option value="QRIS">Transfer / QRIS</option>
          </select>
        </div>

        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={handleSendWhatsAppReport}
            className="flex-1 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold py-3.5 rounded-xl shadow-md active:scale-95 transition cursor-pointer text-xs flex items-center justify-center gap-1.5"
          >
            <MessageCircle className="w-4 h-4" />
            <span>📲 Kirim WA</span>
          </button>
          <button
            type="submit"
            className="flex-[2] bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-lg active:scale-95 transition cursor-pointer text-xs sm:text-sm"
          >
            ✅ Simpan {formatRupiah(totalOmzet)}
          </button>
        </div>
      </form>
    </ModalWrapper>
  );
}
