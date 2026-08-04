'use client';

import React, { useState } from 'react';
import { Plus, Edit3, Trash2, Package, Users, Phone, MapPin, MessageCircle } from 'lucide-react';
import { Product, Mitra } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';

interface MasterModuleProps {
  products: Product[];
  mitras: Mitra[];
  onOpenCreateProductModal: () => void;
  onOpenEditProductModal: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onOpenCreateMitraModal: () => void;
  onOpenEditMitraModal: (mitra: Mitra) => void;
  onDeleteMitra: (mitraId: string) => void;
}

export default function MasterModule({
  products,
  mitras,
  onOpenCreateProductModal,
  onOpenEditProductModal,
  onDeleteProduct,
  onOpenCreateMitraModal,
  onOpenEditMitraModal,
  onDeleteMitra,
}: MasterModuleProps) {
  const [viewMode, setViewMode] = useState<'all' | 'products' | 'mitras'>('all');

  const formatWaNumber = (phoneStr?: string) => {
    if (!phoneStr) return '';
    let cleaned = phoneStr.replace(/\D/g, '');
    if (cleaned.startsWith('0')) {
      cleaned = '62' + cleaned.substring(1);
    }
    return cleaned;
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* TOP HEADER CONTROLS & SUB-TAB SWITCHER */}
      <div className="flex flex-wrap justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
        <div>
          <h2 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
            <Package className="w-5 h-5 text-purple-600" /> Pengelolaan Master Data Usaha
          </h2>
          <p className="text-[11px] text-slate-500">Kelola katalog produk, HPP, & jaringan mitra titipan</p>
        </div>

        {/* SUB-TAB MODE SWITCHER */}
        <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold w-full sm:w-auto justify-around">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex-1 sm:flex-none text-center ${
              viewMode === 'all' ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua ({products.length + mitras.length})
          </button>
          <button
            onClick={() => setViewMode('products')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex-1 sm:flex-none text-center ${
              viewMode === 'products' ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            📦 Produk ({products.length})
          </button>
          <button
            onClick={() => setViewMode('mitras')}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex-1 sm:flex-none text-center ${
              viewMode === 'mitras' ? 'bg-purple-600 text-white font-black shadow-xs' : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            🤝 Mitra ({mitras.length})
          </button>
        </div>
      </div>

      {/* 1. MASTER PRODUK SECTION */}
      {(viewMode === 'all' || viewMode === 'products') && (
        <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 min-w-0 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 truncate">
                <Package className="w-4 h-4 text-purple-600 shrink-0" /> Katalog Master Produk ({products.length})
              </h3>
              <p className="text-[11px] text-slate-500 truncate">Daftar harga jual & HPP otomatis per produk</p>
            </div>
            <button
              onClick={onOpenCreateProductModal}
              className="bg-purple-600 hover:bg-purple-700 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center space-x-1 shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Produk</span>
            </button>
          </div>

          {products.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-2">
              <p>Belum ada produk terdaftar.</p>
              <button
                onClick={onOpenCreateProductModal}
                className="bg-purple-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
              >
                + Tambah Produk Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3 text-xs sm:text-sm hover:border-purple-300 transition"
                >
                  <div>
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-extrabold text-purple-900 bg-purple-100 px-2 py-0.5 rounded-md border border-purple-200">
                        {p.category}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 font-bold">{p.id}</span>
                    </div>
                    <h4 className="font-black text-sm text-slate-800 mt-2 leading-tight">{p.name}</h4>

                    <div className="mt-3 pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                      <div className="bg-emerald-50/80 p-2 rounded-xl border border-emerald-200">
                        <span className="text-[10px] text-emerald-800 font-bold block uppercase">Harga Jual</span>
                        <span className="font-black text-emerald-700 text-sm">{formatRupiah(p.price)}</span>
                      </div>
                      <div className="bg-purple-50/80 p-2 rounded-xl border border-purple-200 text-right">
                        <span className="text-[10px] text-purple-800 font-bold block uppercase">HPP Auto</span>
                        <span className="font-black text-purple-700 text-sm">{formatRupiah(p.avgHpp)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons Grid */}
                  <div className="pt-2 border-t border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <button
                      onClick={() => onOpenEditProductModal(p)}
                      className="py-1.5 rounded-xl bg-white hover:bg-purple-100 text-slate-700 hover:text-purple-900 font-extrabold flex items-center justify-center space-x-1 border border-slate-200 transition cursor-pointer active:scale-95"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => onDeleteProduct(p.id)}
                      className="py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold flex items-center justify-center space-x-1 border border-rose-200 transition cursor-pointer active:scale-95"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 2. MASTER MITRA SECTION */}
      {(viewMode === 'all' || viewMode === 'mitras') && (
        <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3 min-w-0 gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5 truncate">
                <Users className="w-4 h-4 text-emerald-600 shrink-0" /> Master Mitra Titipan ({mitras.length})
              </h3>
              <p className="text-[11px] text-slate-500 truncate">Daftar warung, kantin & kontak konsinyasi</p>
            </div>
            <button
              onClick={onOpenCreateMitraModal}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-3 py-2 rounded-xl flex items-center space-x-1 shadow-xs active:scale-95 transition cursor-pointer whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>+ Mitra</span>
            </button>
          </div>

          {mitras.length === 0 ? (
            <div className="text-center py-8 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 text-xs space-y-2">
              <p>Belum ada mitra titipan terdaftar.</p>
              <button
                onClick={onOpenCreateMitraModal}
                className="bg-emerald-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg"
              >
                + Tambah Mitra Pertama
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {mitras.map((m) => {
                const waFormatted = formatWaNumber(m.whatsapp || undefined);
                return (
                  <div
                    key={m.id}
                    className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/90 flex flex-col justify-between space-y-3 text-xs sm:text-sm hover:border-emerald-300 transition"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-extrabold text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-200">
                          {m.type}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400 font-bold">{m.id}</span>
                      </div>
                      <h4 className="font-black text-sm text-slate-800 mt-2 leading-tight">{m.name}</h4>

                      <div className="mt-2.5 text-xs text-slate-600 space-y-1 bg-white p-2.5 rounded-xl border border-slate-200/60">
                        {m.whatsapp ? (
                          <p className="flex items-center gap-1.5 text-xs font-bold text-slate-700 truncate">
                            <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> {m.whatsapp}
                          </p>
                        ) : (
                          <p className="text-[10px] text-slate-400 italic">Tidak ada nomor WA</p>
                        )}
                        {m.address ? (
                          <p className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" /> {m.address}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {/* Action Buttons Grid */}
                    <div className="pt-2 border-t border-slate-200/80 flex gap-1.5 text-xs">
                      {waFormatted ? (
                        <a
                          href={`https://wa.me/${waFormatted}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="py-1.5 px-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-extrabold flex items-center justify-center space-x-1 border border-emerald-200 transition cursor-pointer active:scale-95 shrink-0"
                        >
                          <MessageCircle className="w-3.5 h-3.5 text-emerald-700" />
                          <span>WA</span>
                        </a>
                      ) : null}
                      <button
                        onClick={() => onOpenEditMitraModal(m)}
                        className="py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 font-extrabold flex-1 flex items-center justify-center space-x-1 border border-slate-200 transition cursor-pointer active:scale-95"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => onDeleteMitra(m.id)}
                        className="py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold flex-1 flex items-center justify-center space-x-1 border border-rose-200 transition cursor-pointer active:scale-95"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Hapus</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
