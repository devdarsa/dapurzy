'use client';

import React, { useState, useEffect } from 'react';
import ModalWrapper from '../ModalWrapper';
import { Mitra, Product } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface MitraModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Mitra | null;
  products?: Product[];
  onSubmit: (data: {
    id?: string;
    name: string;
    type: string;
    whatsapp: string;
    address: string;
    customPrices?: Record<string, number>;
  }) => void;
}

export default function MitraModal({
  isOpen,
  onClose,
  initialData,
  products = [],
  onSubmit,
}: MitraModalProps) {
  const [name, setName] = useState<string>('');
  const [type, setType] = useState<string>('Warung');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setType(initialData.type);
      setWhatsapp(initialData.whatsapp || '');
      setAddress(initialData.address || '');
      
      let parsedPrices: Record<string, number> = {};
      if (initialData.customPrices) {
        if (typeof initialData.customPrices === 'string') {
          try {
            parsedPrices = JSON.parse(initialData.customPrices);
          } catch (e) {
            parsedPrices = {};
          }
        } else {
          parsedPrices = initialData.customPrices;
        }
      }
      setCustomPrices(parsedPrices);
    } else {
      setName('');
      setType('Warung');
      setWhatsapp('');
      setAddress('');
      setCustomPrices({});
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  const handleCustomPriceChange = (productId: string, valStr: string) => {
    const val = Number(valStr.replace(/\D/g, '')) || 0;
    setCustomPrices((prev) => ({
      ...prev,
      [productId]: val,
    }));
  };

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
            customPrices,
          });
        }}
        className="space-y-3.5 text-xs sm:text-sm max-h-[75vh] overflow-y-auto pr-1"
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-600 mb-1">No. WhatsApp</label>
            <input
              type="text"
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="081234567890"
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
          <div>
            <label className="block font-bold text-slate-600 mb-1">Alamat Lokasi</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Jl. Mawar No. 12"
              className="w-full p-2.5 sm:p-3 rounded-xl border border-slate-300 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>
        </div>

        {/* Harga Khusus Konsinyasi per Produk */}
        {products.length > 0 && (
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-2 mt-2">
            <h4 className="font-extrabold text-slate-800 flex items-center justify-between text-xs sm:text-sm">
              <span>🏷️ Harga Konsinyasi Khusus Mitra Ini</span>
              <span className="text-[10px] text-emerald-600 font-medium">Opsional (Kosongkan jika ikut Harga Rumah)</span>
            </h4>
            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {products.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between bg-white p-2 rounded-lg border border-slate-200 gap-2">
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-700 truncate">{prod.name}</p>
                    <p className="text-[10px] text-slate-400">Harga Master: {formatRupiah(prod.price)}</p>
                  </div>
                  <div className="w-32">
                    <input
                      type="number"
                      value={customPrices[prod.id] || ''}
                      onChange={(e) => handleCustomPriceChange(prod.id, e.target.value)}
                      placeholder={String(prod.price)}
                      className="w-full p-1.5 text-right font-bold text-emerald-700 bg-emerald-50/50 rounded-lg border border-emerald-300 focus:ring-2 focus:ring-emerald-500 outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold py-3.5 rounded-xl shadow-md mt-3 active:scale-95 transition cursor-pointer"
        >
          {isEditing ? 'Simpan Perubahan Mitra' : 'Simpan Mitra Baru'}
        </button>
      </form>
    </ModalWrapper>
  );
}

