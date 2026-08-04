'use client';

import React from 'react';
import { Plus, Edit3, Trash2, Package, Users, Phone, MapPin } from 'lucide-react';
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
  return (
    <div className="space-y-4 sm:space-y-5 animate-in fade-in duration-200">
      {/* 1. MASTER PRODUK SECTION (GRID LAYOUT) */}
      <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Package className="w-4 h-4 text-purple-600" /> Master Produk ({products.length})
            </h2>
            <p className="text-xs text-slate-500">Kelola katalog produk & harga jual</p>
          </div>
          <button
            onClick={onOpenCreateProductModal}
            className="bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Produk</span>
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2.5 text-xs sm:text-sm"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-purple-800 bg-purple-100 px-1.5 py-0.5 rounded">
                    {p.category}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{p.id}</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 mt-1 leading-tight">{p.name}</h3>

                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Harga Jual</span>
                    <span className="font-extrabold text-emerald-600 text-xs sm:text-sm">{formatRupiah(p.price)}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">HPP Auto</span>
                    <span className="font-extrabold text-purple-700 text-xs sm:text-sm">{formatRupiah(p.avgHpp)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => onOpenEditProductModal(p)}
                  className="py-1.5 rounded-lg bg-white hover:bg-purple-100 text-slate-700 hover:text-purple-800 font-bold flex items-center justify-center space-x-1 border border-slate-200/80 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteProduct(p.id)}
                  className="py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center space-x-1 border border-rose-200/60 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. MASTER MITRA SECTION (GRID LAYOUT) */}
      <div className="bg-white p-3.5 sm:p-4.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex justify-between items-center border-b border-slate-100 pb-3">
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-emerald-600" /> Master Mitra Titipan ({mitras.length})
            </h2>
            <p className="text-xs text-slate-500">Kelola daftar warung & kantin konsinyasi</p>
          </div>
          <button
            onClick={onOpenCreateMitraModal}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl flex items-center space-x-1 shadow-2xs active:scale-95 transition cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Tambah Mitra</span>
          </button>
        </div>

        {/* Mitra Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 sm:gap-3">
          {mitras.map((m) => (
            <div
              key={m.id}
              className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 flex flex-col justify-between space-y-2.5 text-xs sm:text-sm"
            >
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded">
                    {m.type}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">{m.id}</span>
                </div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 mt-1 leading-tight">{m.name}</h3>

                <div className="mt-2 text-xs text-slate-600 space-y-1">
                  {m.whatsapp && (
                    <p className="flex items-center gap-1.5 text-xs truncate">
                      <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {m.whatsapp}
                    </p>
                  )}
                  {m.address && (
                    <p className="flex items-center gap-1.5 text-xs truncate">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" /> {m.address}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons Grid */}
              <div className="pt-2 border-t border-slate-200/60 grid grid-cols-2 gap-1.5 text-xs">
                <button
                  onClick={() => onOpenEditMitraModal(m)}
                  className="py-1.5 rounded-lg bg-white hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-bold flex items-center justify-center space-x-1 border border-slate-200/80 transition cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => onDeleteMitra(m.id)}
                  className="py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold flex items-center justify-center space-x-1 border border-rose-200/60 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
