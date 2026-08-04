'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import DrawerMenu from '@/components/DrawerMenu';
import Toast from '@/components/Toast';
import PinLockScreen from '@/components/PinLockScreen';

// Import View Components & Ultra-Lean Modules
import DashboardModule from '@/components/modules/DashboardModule';
import MasterModule from '@/components/modules/MasterModule';
import RevenueHistoryModule from '@/components/modules/RevenueHistoryModule';

// Import Form Modal Dialog Components
import BatchProductionModal from '@/components/modals/BatchProductionModal';
import MitraSettlementModal from '@/components/modals/MitraSettlementModal';
import HomeSalesModal from '@/components/modals/HomeSalesModal';
import CapitalModal from '@/components/modals/CapitalModal';
import ProductModal from '@/components/modals/ProductModal';
import MitraModal from '@/components/modals/MitraModal';
import ResetDataModal from '@/components/modals/ResetDataModal';

// Import Types & Helpers
import { Product, Mitra, PurchaseBatch, Sale, PeriodFilter } from '@/lib/types';
import { formatRupiah, formatDate } from '@/lib/utils';
import { registerServiceWorkerAndRequestPermission } from '@/lib/notification';
import { Users, Plus, CheckCircle2, ShoppingBag, Trophy, Calendar, Home } from 'lucide-react';

// ── Helper Mappers ─────────────────────────────────────────────────────────────
function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Umum',
    price: Number(r.price) || 0,
    avgHpp: Number(r.avg_hpp ?? r.avgHpp ?? 0),
    status: r.status ?? 'active',
  };
}

function mapMitra(r: any): Mitra {
  let customPrices = {};
  if (r.custom_prices || r.customPrices) {
    try {
      const raw = r.custom_prices ?? r.customPrices;
      customPrices = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch (e) {
      customPrices = {};
    }
  }
  return {
    id: r.id,
    name: r.name,
    type: r.type || 'Warung',
    whatsapp: r.whatsapp ?? '',
    address: r.address ?? '',
    customPrices,
    status: r.status ?? 'active',
    lifetimeOmzet: Number(r.lifetimeOmzet ?? r.lifetime_omzet ?? 0),
    monthlyOmzet: Number(r.monthlyOmzet ?? r.monthly_omzet ?? 0),
    todayOmzet: Number(r.todayOmzet ?? r.today_omzet ?? 0),
    totalSoldQty: Number(r.totalSoldQty ?? r.total_sold_qty ?? 0),
  };
}

function mapBatch(r: any): PurchaseBatch {
  let allocations = [];
  if (r.allocations) {
    try {
      allocations = typeof r.allocations === 'string' ? JSON.parse(r.allocations) : r.allocations;
    } catch (e) {
      allocations = [];
    }
  }
  return {
    id: r.id,
    batchId: r.batch_id ?? r.batchId,
    date: r.created_at ?? r.date ?? new Date().toISOString(),
    itemsDescription: r.items_description ?? r.itemsDescription ?? '',
    totalCost: Number(r.total_cost ?? r.totalCost ?? 0),
    supplier: r.supplier ?? 'Supplier Umum',
    status: r.status ?? 'produced',
    productId: r.product_id ?? r.productId ?? null,
    producedQty: Number(r.produced_qty ?? r.producedQty ?? 0),
    calculatedHpp: Number(r.calculated_hpp ?? r.calculatedHpp ?? 0),
    allocations,
  };
}

function mapSale(r: any): Sale {
  return {
    id: r.id,
    trxNumber: r.trx_number ?? r.trxNumber,
    saleType: r.sale_type ?? r.saleType ?? 'DIRECT',
    mitraId: r.mitra_id ?? r.mitraId ?? null,
    productId: r.product_id ?? r.productId ?? 'P-HOME',
    batchId: r.batch_id ?? r.batchId ?? null,
    titipQty: Number(r.titip_qty ?? r.titipQty ?? 0),
    returnedQty: Number(r.returned_qty ?? r.returnedQty ?? 0),
    quantity: Number(r.quantity ?? 0),
    pricePerUnit: Number(r.price_per_unit ?? r.pricePerUnit ?? 0),
    totalAmount: Number(r.total_amount ?? r.totalAmount ?? 0),
    hppPerUnit: Number(r.hpp_per_unit ?? r.hppPerUnit ?? 0),
    recoveredCost: Number(r.recovered_cost ?? r.recoveredCost ?? 0),
    profit: Number(r.profit ?? 0),
    paymentMethod: r.payment_method ?? r.paymentMethod ?? 'CASH',
    createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  };
}

export default function DAPURZYApp() {
  // --- STATE PIN SECURITY ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

  useEffect(() => {
    registerServiceWorkerAndRequestPermission();

    const savedUnlocked = sessionStorage.getItem('dapurzy_unlocked');
    const savedTimestamp = localStorage.getItem('dapurzy_unlock_timestamp');

    if (savedUnlocked === 'true' && savedTimestamp) {
      const elapsed = Date.now() - Number(savedTimestamp);
      if (elapsed > THREE_DAYS_MS) {
        handleLockApp();
      } else {
        setIsUnlocked(true);
        loadFromD1();
      }
    } else {
      setIsUnlocked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUnlockSuccess = () => {
    setIsUnlocked(true);
    sessionStorage.setItem('dapurzy_unlocked', 'true');
    localStorage.setItem('dapurzy_unlock_timestamp', Date.now().toString());
    registerServiceWorkerAndRequestPermission();
    loadFromD1();
    showToast('Sistem DAPURZY Live Berhasil Dibuka!', 'success');
  };

  const handleLockApp = async () => {
    setIsUnlocked(false);
    sessionStorage.clear();
    localStorage.removeItem('dapurzy_unlock_timestamp');
    showToast('Aplikasi Terkunci!', 'error');
  };

  // --- STATE NAVIGATION & UI ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeModal, setActiveModal] = useState<
    'batch_production' | 'settlement' | 'home_sales' | 'capital' | 'product' | 'mitra' | 'reset' | null
  >(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [mitraTabPeriod, setMitraTabPeriod] = useState<PeriodFilter>('all');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- FINANCIAL & CORE STATE ---
  const [operatingCapital, setOperatingCapital] = useState<number>(0);
  const [netProfitPool, setNetProfitPool] = useState<number>(0);
  const [totalGrossOmzet, setTotalGrossOmzet] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── LOAD ALL DATA FROM D1 ──────────────────────────────────────────────────
  const loadFromD1 = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/sync');
      if (!res.ok) {
        showToast('Gagal memuat data dari database.', 'error');
        setIsLoading(false);
        return;
      }
      const json = await res.json();
      if (json.success && json.data) {
        const d = json.data;
        setOperatingCapital(d.operatingCapital ?? 0);
        setNetProfitPool(d.netProfitPool ?? 0);
        setTotalGrossOmzet(d.totalGrossOmzet ?? 0);
        setProducts((d.products ?? []).map(mapProduct));
        setMitras((d.mitras ?? []).map(mapMitra));
        setPurchaseBatches((d.purchaseBatches ?? []).map(mapBatch));
        setSales((d.sales ?? []).map(mapSale));
      }
    } catch (e) {
      showToast('Koneksi ke database gagal.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  // 1. Injeksi Modal Usaha
  const handleCapital = async (data: { amount: number; note: string }) => {
    const { amount, note } = data;
    if (amount <= 0) {
      showToast('Nominal modal harus lebih besar dari 0!', 'error');
      return;
    }

    const id = `CAP-${Date.now()}`;
    const trxNumber = `TRX-CAP-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('/api/capital', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, trxNumber, amount, note: note || 'Injeksi Modal Usaha' }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan injeksi modal!', 'error'); return; }

      showToast(`Injeksi modal ${formatRupiah(amount)} berhasil disimpan!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat injeksi modal.', 'error');
    }
  };

  // 2. Batch Belanja & Produksi
  const handleBatchProduction = async (data: {
    itemsDescription: string;
    totalCost: number;
    productId: string;
    producedQty: number;
    calculatedHpp: number;
    allocations: Array<{
      mitraId: string;
      quantity: number;
      pricePerUnit: number;
    }>;
  }) => {
    const { itemsDescription, totalCost, productId, producedQty, calculatedHpp, allocations } = data;
    const batchSeq = String(purchaseBatches.length + 1).padStart(3, '0');
    const batchId = `BATCH-${new Date().getFullYear()}-${batchSeq}`;
    const id = `PB-${Date.now()}`;

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          batchId,
          itemsDescription,
          totalCost,
          productId,
          producedQty,
          calculatedHpp,
          allocations: JSON.stringify(allocations),
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan batch produksi!', 'error'); return; }

      showToast(`Batch ${batchId} berhasil disimpan! (${producedQty} pcs, HPP: ${formatRupiah(calculatedHpp)})`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan batch.', 'error');
    }
  };

  // 3. Rekap Setoran Mitra
  const handleMitraSettlement = async (data: {
    mitraId: string;
    productId: string;
    titipQty: number;
    returnedQty: number;
    soldQty: number;
    pricePerUnit: number;
    paymentMethod: string;
  }) => {
    const { mitraId, productId, titipQty, returnedQty, soldQty, pricePerUnit, paymentMethod } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);

    if (!product || !mitraObj) {
      showToast('Produk atau mitra tidak valid!', 'error');
      return;
    }

    const hpp = product.avgHpp || 0;
    const totalAmount = soldQty * pricePerUnit;
    const profit = totalAmount - (soldQty * hpp);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `SALE-MITRA-${Date.now()}`,
          trxNumber: `TRX-SETTLE-${Date.now().toString().slice(-6)}`,
          productId,
          mitraId,
          titipQty,
          returnedQty,
          quantity: soldQty,
          pricePerUnit,
          hppPerUnit: hpp,
          totalAmount,
          profit,
          saleType: 'CONSIGNMENT',
          paymentMethod,
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan setoran!', 'error'); return; }

      showToast(`Rekap Setoran ${mitraObj.name} berhasil! (${soldQty} pcs laku, Omset: ${formatRupiah(totalAmount)})`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan setoran.', 'error');
    }
  };

  // 4. Setor Uang Toples Rumah 1-Tap (Opsi 1)
  const handleHomeSalesDeposit = async (data: { amount: number; note: string }) => {
    const { amount, note } = data;
    if (amount <= 0) {
      showToast('Nominal setor uang rumah harus lebih dari 0!', 'error');
      return;
    }

    const defaultProd = products[0];
    const productId = defaultProd?.id || 'P-HOME';
    const hpp = defaultProd?.avgHpp || 0;
    
    // Profit estimate (default 40% margin if pure cash deposit)
    const profit = Math.round(amount * 0.4);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: `SALE-HOME-${Date.now()}`,
          trxNumber: `TRX-HOME-${Date.now().toString().slice(-6)}`,
          productId,
          mitraId: null,
          titipQty: 0,
          returnedQty: 0,
          quantity: 1,
          pricePerUnit: amount,
          hppPerUnit: hpp,
          totalAmount: amount,
          profit,
          saleType: 'DIRECT',
          paymentMethod: 'CASH',
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan setor uang rumah!', 'error'); return; }

      showToast(`Setoran Uang Rumah ${formatRupiah(amount)} berhasil disimpan! (${note})`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  // 5. Save Product
  const handleSaveProduct = async (data: { id?: string; name: string; category: string; price: number }) => {
    if (!data.name || data.price <= 0) { showToast('Nama produk dan harga jual harus valid!', 'error'); return; }

    const id = data.id || `P-${Date.now()}`;
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: data.name, category: data.category || 'Umum', price: data.price, avgHpp: 0 }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan produk!', 'error'); return; }

      showToast(`Master produk "${data.name}" berhasil disimpan!`);
      setEditingProduct(null);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  // 6. Delete Product
  const handleDeleteProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus master produk "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus produk!', 'error'); return; }

      showToast(`Master produk "${product.name}" telah dihapus!`);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  // 7. Save Mitra (with custom prices)
  const handleSaveMitra = async (data: {
    id?: string;
    name: string;
    type: string;
    whatsapp: string;
    address: string;
    customPrices?: Record<string, number>;
  }) => {
    if (!data.name) { showToast('Nama mitra harus diisi!', 'error'); return; }

    const id = data.id || `M-${Date.now()}`;
    try {
      const res = await fetch('/api/mitras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          name: data.name,
          type: data.type || 'Warung',
          whatsapp: data.whatsapp || '',
          address: data.address || '',
          customPrices: data.customPrices || {},
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan mitra!', 'error'); return; }

      showToast(`Mitra "${data.name}" berhasil disimpan!`);
      setEditingMitra(null);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  // 8. Delete Mitra
  const handleDeleteMitra = async (mitraId: string) => {
    const mitra = mitras.find((m) => m.id === mitraId);
    if (!mitra) return;
    if (!confirm(`Apakah Anda yakin ingin menghapus master mitra "${mitra.name}"?`)) return;

    try {
      const res = await fetch(`/api/mitras?id=${mitraId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus mitra!', 'error'); return; }

      showToast(`Mitra "${mitra.name}" telah dihapus!`);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  const handleShareSaleToWhatsApp = (sale: Sale) => {
    const mitra = mitras.find((m) => m.id === sale.mitraId);
    const product = products.find((p) => p.id === sale.productId);
    const dateStr = formatDate(sale.createdAt);

    const cleanWa = mitra?.whatsapp ? mitra.whatsapp.replace(/[^0-9]/g, '') : '';
    const msg = `*NOTA REKAP SETORAN - DAPURZY* 🍞

Halo *${mitra?.name || 'Mitra'}*, berikut nota rekap setoran konsinyasi (${dateStr}):

📦 *Produk:* ${product?.name || 'Produk'}
• Dititipkan: ${sale.titipQty || sale.quantity} pcs
• Kembali / Basi: ${sale.returnedQty || 0} pcs
-----------------------------------
*Total Laku:* ${sale.quantity} pcs
*Total Setoran Uang:* ${formatRupiah(sale.totalAmount)}

Metode: ${sale.paymentMethod || 'CASH'}
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

  // 9. Factory Reset
  const handleFactoryResetAllData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus data!', 'error'); return; }

      showToast('Seluruh data aplikasi berhasil dihapus 100%!', 'success');
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal.', 'error');
    }
  };

  if (!isUnlocked) {
    return <PinLockScreen onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 sm:pb-24 select-none relative max-w-full overflow-x-hidden no-scrollbar border-x border-slate-200">
      <Toast notification={notification} />

      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-xs flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs sm:text-sm font-bold text-slate-700">Memuat data Dapurzy...</p>
          </div>
        </div>
      )}

      {/* HEADER UTAMA APP */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenPurchaseModal={() => setActiveModal('batch_production')}
      />

      {/* DRAWER MENU */}
      <DrawerMenu
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCapitalModal={() => setActiveModal('capital')}
        onOpenResetModal={() => setActiveModal('reset')}
        showToast={showToast}
        onLockApp={handleLockApp}
      />

      {/* MAIN CONTENT AREA */}
      <main className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-2.5 sm:p-4 lg:p-6 space-y-4">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <DashboardModule
            operatingCapital={operatingCapital}
            netProfitPool={netProfitPool}
            totalGrossOmzet={totalGrossOmzet}
            purchaseBatches={purchaseBatches}
            products={products}
            mitras={mitras}
            sales={sales}
            onOpenModal={(modal) => setActiveModal(modal)}
          />
        )}

        {/* TAB REVENUE HISTORY: MODAL | HASIL PRODUK | OMSET KOTOR | OMSET BERSIH */}
        {activeTab === 'revenue' && (
          <RevenueHistoryModule
            purchaseBatches={purchaseBatches}
            products={products}
            sales={sales}
            mitras={mitras}
          />
        )}

        {/* TAB 2: MITRA & SETORAN WITH ANALYTICS */}
        {activeTab === 'mitra' && (
          <div className="space-y-4 animate-in fade-in duration-200">
            {/* Header Controls */}
            <div className="flex flex-wrap justify-between items-center bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-xs gap-3">
              <div>
                <h2 className="font-black text-slate-800 text-sm sm:text-base flex items-center gap-1.5">
                  <Users className="w-5 h-5 text-amber-600" /> Konsinyasi & Rekap Setoran Mitra
                </h2>
                <p className="text-[11px] text-slate-500">Omset harian, bulanan & record total kerjasama</p>
              </div>

              <div className="flex flex-wrap gap-2 items-center">
                {/* Period Filter Switcher */}
                <div className="flex bg-slate-100 p-1 rounded-xl gap-1 text-xs font-bold">
                  <button
                    onClick={() => setMitraTabPeriod('today')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      mitraTabPeriod === 'today' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Hari Ini
                  </button>
                  <button
                    onClick={() => setMitraTabPeriod('month')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      mitraTabPeriod === 'month' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Bulan Ini
                  </button>
                  <button
                    onClick={() => setMitraTabPeriod('all')}
                    className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      mitraTabPeriod === 'all' ? 'bg-amber-500 text-white font-extrabold shadow-xs' : 'text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Lifetime
                  </button>
                </div>

                <button
                  onClick={() => { setEditingMitra(null); setActiveModal('mitra'); }}
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mitra</span>
                </button>
                <button
                  onClick={() => setActiveModal('settlement')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-2 rounded-xl shadow-xs active:scale-95 transition cursor-pointer flex items-center gap-1"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Rekap Setoran</span>
                </button>
              </div>
            </div>

            {/* LIST MITRA CARDS WITH ANALYTICS BADGES */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {mitras.length === 0 ? (
                <div className="col-span-2 text-center py-8 bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
                  Belum ada mitra. Klik <b>"Tambah Mitra"</b> untuk menambahkan warung/kantin titipan!
                </div>
              ) : (
                mitras.map((m) => {
                  const displayedOmzet =
                    mitraTabPeriod === 'today'
                      ? m.todayOmzet || 0
                      : mitraTabPeriod === 'month'
                      ? m.monthlyOmzet || 0
                      : m.lifetimeOmzet || 0;

                  return (
                    <div key={m.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 relative">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-black bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                            {m.type}
                          </span>
                          <h3 className="font-black text-slate-800 text-sm mt-1">{m.name}</h3>
                          {m.address && <p className="text-xs text-slate-500">{m.address}</p>}
                          {m.whatsapp && <p className="text-[11px] text-emerald-700 font-medium">WA: {m.whatsapp}</p>}
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={() => { setEditingMitra(m); setActiveModal('mitra'); }}
                            className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMitra(m.id)}
                            className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg hover:bg-rose-100 cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                      {/* MITRA ANALYTICS DISPLAY BADGE */}
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">
                            Omset ({mitraTabPeriod === 'today' ? 'Hari Ini' : mitraTabPeriod === 'month' ? 'Bulan Ini' : 'Lifetime'})
                          </span>
                          <span className="font-black text-emerald-800 text-sm">{formatRupiah(displayedOmzet)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-bold block uppercase">Total Barang Laku</span>
                          <span className="font-black text-slate-800 text-sm">{m.totalSoldQty || 0} pcs</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* SETORAN HISTORY TABLE */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <h3 className="font-extrabold text-slate-800 text-xs sm:text-sm flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-emerald-600" /> Riwayat Rekap Setoran Diterima
              </h3>
              {sales.length === 0 ? (
                <p className="text-xs text-slate-400 italic">Belum ada riwayat setoran.</p>
              ) : (
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {sales.map((s) => {
                    const product = products.find((p) => p.id === s.productId);
                    const mitra = mitras.find((m) => m.id === s.mitraId);
                    return (
                      <div key={s.id} className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">
                            {s.saleType === 'DIRECT' ? '🏡 Setoran Toples Rumah' : `🤝 Setoran: ${mitra?.name || 'Mitra'}`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {product?.name || 'Produk'} ({s.quantity} pcs laku) • {formatDate(s.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <p className="font-black text-emerald-800">{formatRupiah(s.totalAmount)}</p>
                            <p className="text-[10px] text-amber-700 font-bold">Profit: {formatRupiah(s.profit)}</p>
                          </div>
                          {s.saleType !== 'DIRECT' && (
                            <button
                              onClick={() => handleShareSaleToWhatsApp(s)}
                              className="bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[10px] font-black px-2 py-1 rounded-lg border border-emerald-300 active:scale-95 transition cursor-pointer flex items-center gap-1"
                              title="Kirim Nota ke WA Mitra"
                            >
                              <span>📲 WA</span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: BATCH & MASTER */}
        {activeTab === 'master' && (
          <MasterModule
            products={products}
            mitras={mitras}
            onOpenCreateProductModal={() => { setEditingProduct(null); setActiveModal('product'); }}
            onOpenEditProductModal={(product) => { setEditingProduct(product); setActiveModal('product'); }}
            onDeleteProduct={handleDeleteProduct}
            onOpenCreateMitraModal={() => { setEditingMitra(null); setActiveModal('mitra'); }}
            onOpenEditMitraModal={(mitra) => { setEditingMitra(mitra); setActiveModal('mitra'); }}
            onDeleteMitra={handleDeleteMitra}
          />
        )}
      </main>

      {/* FORM MODAL DIALOGS */}
      <BatchProductionModal
        isOpen={activeModal === 'batch_production'}
        onClose={() => setActiveModal(null)}
        products={products}
        mitras={mitras}
        onSubmit={handleBatchProduction}
      />

      <MitraSettlementModal
        isOpen={activeModal === 'settlement'}
        onClose={() => setActiveModal(null)}
        products={products}
        mitras={mitras}
        onSubmit={handleMitraSettlement}
      />

      <HomeSalesModal
        isOpen={activeModal === 'home_sales'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleHomeSalesDeposit}
      />

      <CapitalModal
        isOpen={activeModal === 'capital'}
        onClose={() => setActiveModal(null)}
        onSubmit={handleCapital}
      />

      <ProductModal
        isOpen={activeModal === 'product'}
        onClose={() => { setActiveModal(null); setEditingProduct(null); }}
        products={products}
        initialData={editingProduct}
        onSubmit={handleSaveProduct}
      />

      <MitraModal
        isOpen={activeModal === 'mitra'}
        onClose={() => { setActiveModal(null); setEditingMitra(null); }}
        products={products}
        initialData={editingMitra}
        onSubmit={handleSaveMitra}
      />

      <ResetDataModal
        isOpen={activeModal === 'reset'}
        onClose={() => setActiveModal(null)}
        onConfirmReset={handleFactoryResetAllData}
      />

      {/* MOBILE FLOATING BOTTOM NAVIGATION */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
