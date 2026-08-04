'use client';

import React, { useState, useEffect, useCallback } from 'react';

// Core UI Components & Modals Container
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import Toast from '@/components/Toast';
import { toast } from '@/lib/toast';
import PinLockScreen from '@/components/PinLockScreen';
import ModalsContainer from '@/components/modals/ModalsContainer';

// Modules
import DashboardModule from '@/components/modules/DashboardModule';
import MasterModule from '@/components/modules/MasterModule';
import RevenueHistoryModule from '@/components/modules/RevenueHistoryModule';
import MitraModule from '@/components/modules/MitraModule';

// Types & Utilities
import { Product, Mitra, PurchaseBatch, Sale, ProductStock, CapitalLog } from '@/lib/types';
import { formatRupiah } from '@/lib/utils';
import { mapProduct, mapMitra, mapBatch, mapSale } from '@/lib/mappers';
import { registerServiceWorkerAndRequestPermission } from '@/lib/notification';

// API Service Layer
import * as api from '@/lib/api/dapurzyApi';

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
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pengolahanInitialBatchId, setPengolahanInitialBatchId] = useState<string>('');

  // --- FINANCIAL & CORE STATE ---
  const [operatingCapital, setOperatingCapital] = useState<number>(0);
  const [netProfitPool, setNetProfitPool] = useState<number>(0);
  const [totalGrossOmzet, setTotalGrossOmzet] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [capitalLogs, setCapitalLogs] = useState<CapitalLog[]>([]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'success') => {
    if (type === 'error') toast.error(message);
    else if (type === 'warning') toast.warning(message);
    else if (type === 'info') toast.info(message);
    else toast.success(message);
  };

  // ── LOAD DATA ──────────────────────────────────────────────────────────────
  const loadFromD1 = useCallback(async () => {
    setIsLoading(true);
    try {
      const json = await api.fetchSyncData();
      if (json.success && json.data) {
        const d = json.data;
        setOperatingCapital(d.operatingCapital ?? 0);
        setNetProfitPool(d.netProfitPool ?? 0);
        setTotalGrossOmzet(d.totalGrossOmzet ?? 0);
        setProducts((d.products ?? []).map(mapProduct));
        setMitras((d.mitras ?? []).map(mapMitra));
        setPurchaseBatches((d.purchaseBatches ?? []).map(mapBatch));
        setSales((d.sales ?? []).map(mapSale));
        setStocks(d.stocks ?? []);
        setCapitalLogs(d.capitalLogs ?? []);
      }
    } catch (e) {
      showToast('Koneksi ke database gagal.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ── HANDLERS ───────────────────────────────────────────────────────────────

  // 1. Injeksi atau Pengurangan Modal Usaha
  const handleCapital = async (data: { amount: number; note: string; type?: 'INJECTION' | 'WITHDRAWAL' }) => {
    const { amount, note, type = 'INJECTION' } = data;
    if (amount <= 0) {
      showToast('Nominal modal harus lebih besar dari 0!', 'error');
      return;
    }
    const id = `CAP-${Date.now()}`;
    const trxNumber = `TRX-CAP-${Date.now().toString().slice(-6)}`;

    try {
      const json = await api.postCapital({ id, trxNumber, amount, note, type });
      if (!json.success) { showToast(json.error || 'Gagal menyimpan transaksi modal!', 'error'); return; }

      const actionMsg = type === 'WITHDRAWAL' ? 'Pengurangan / koreksi modal' : 'Injeksi modal';
      showToast(`${actionMsg} ${formatRupiah(amount)} berhasil disimpan!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat transaksi modal.', 'error');
    }
  };

  // 1e. Hapus Log Modal Usaha
  const handleDeleteCapitalLog = async (logId: string) => {
    try {
      const json = await api.deleteCapitalLog(logId);
      if (!json.success) { showToast(json.error || 'Gagal menghapus log modal!', 'error'); return; }
      showToast('Log modal berhasil dihapus!');
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menghapus log modal.', 'error');
    }
  };

  // 1b. Modul Belanja (Batch Baru - Status Tersedia, Memotong Kas Modal)
  const handleBelanjaBatch = async (data: { date: string; itemsDescription: string; totalCost: number }) => {
    const { date, itemsDescription, totalCost } = data;
    const batchSeq = String(purchaseBatches.length + 1).padStart(3, '0');
    const batchId = `BATCH-${new Date().getFullYear()}-${batchSeq}`;
    const id = `PB-${Date.now()}`;

    try {
      const json = await api.postBelanjaBatch({ id, batchId, itemsDescription, totalCost, date, supplier: 'Supplier Umum' });
      if (!json.success) { showToast(json.error || 'Gagal menyimpan batch belanja!', 'error'); return; }

      showToast(`Batch Belanja ${batchId} berhasil disimpan! (${formatRupiah(totalCost)} memotong Kas Modal)`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan batch belanja.', 'error');
    }
  };

  // 1c. Modul Pembuatan / Pengolahan (Batch Tersedia -> Status Habis, Masuk Stok Produk Jadi)
  const handlePengolahan = async (data: { batchId: string; productId: string; producedQty: number; calculatedHpp: number }) => {
    const { batchId, productId, producedQty, calculatedHpp } = data;

    try {
      const json = await api.putPengolahan({ batchId, productId, producedQty, calculatedHpp });
      if (!json.success) { showToast(json.error || 'Gagal memproses pengolahan batch!', 'error'); return; }

      showToast(`Pengolahan selesai! ${producedQty} pcs masuk ke Stok Produk Jadi (HPP: ${formatRupiah(calculatedHpp)})`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat memproses pengolahan.', 'error');
    }
  };

  // 1d. Modul Ambil Produk Mitra (Stok Produk Jadi -> Stok Mitra)
  const handleAmbilMitra = async (data: { mitraId: string; productId: string; quantity: number; note?: string }) => {
    const { mitraId, productId, quantity, note } = data;
    const mitraObj = mitras.find((m) => m.id === mitraId);

    const sourceStock = stocks.find((s) => s.productId === productId && s.locationType === 'gudang');
    const targetStock = stocks.find((s) => s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId);

    const sourceStockId = sourceStock?.id;
    const sourceNewQty = Math.max(0, (sourceStock?.quantity || 0) - quantity);

    const targetStockId = targetStock?.id;
    const targetNewQty = (targetStock?.quantity || 0) + quantity;

    const newTargetStock = !targetStockId
      ? { id: `STK-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, productId, locationType: 'mitra', mitraId, quantity }
      : undefined;

    try {
      const json = await api.postAmbilMitra({
        id: `MOV-${Date.now()}`,
        trxNumber: `TRX-AMBIL-${Date.now().toString().slice(-6)}`,
        productId,
        type: 'GUDANG_TO_MITRA',
        mitraId,
        quantity,
        note: note || `Ambil ${quantity} pcs oleh ${mitraObj?.name || 'Mitra'}`,
        sourceStockId,
        sourceNewQty,
        targetStockId,
        targetNewQty,
        newTargetStock,
      });
      if (!json.success) { showToast(json.error || 'Gagal mencatat pengambilan mitra!', 'error'); return; }

      showToast(`Pengambilan ${quantity} pcs oleh ${mitraObj?.name || 'Mitra'} berhasil dicatat!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat mencatat pengambilan mitra.', 'error');
    }
  };

  // 3. Rekap Setoran Mitra (Konsinyasi & Beli Putus)
  const handleMitraSettlement = async (data: {
    mitraId: string;
    productId: string;
    titipQty: number;
    returnedQty: number;
    soldQty: number;
    pricePerUnit: number;
    paymentMethod: string;
    transactionType?: 'KONSINYASI' | 'BELI_PUTUS';
  }) => {
    const { mitraId, productId, titipQty, returnedQty, soldQty, pricePerUnit, paymentMethod, transactionType } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);

    if (!product || !mitraObj) {
      showToast('Produk atau mitra tidak valid!', 'error');
      return;
    }

    const hpp = product.avgHpp || 0;
    const totalAmount = soldQty * pricePerUnit;
    const recoveredCost = soldQty * hpp;
    const profit = totalAmount - recoveredCost;
    const trxNumber = `TRX-${Date.now().toString().slice(-6)}`;
    const id = `SALE-${Date.now()}`;

    try {
      const json = await api.postSale({
        id,
        trxNumber,
        saleType: transactionType === 'BELI_PUTUS' ? 'MITRA' : 'CONSIGNMENT',
        transactionType: transactionType || 'KONSINYASI',
        mitraId,
        productId,
        titipQty,
        returnedQty,
        quantity: soldQty,
        pricePerUnit,
        totalAmount,
        hppPerUnit: hpp,
        recoveredCost,
        profit,
        paymentMethod,
      });

      if (!json.success) { showToast(json.error || 'Gagal menyimpan setoran mitra!', 'error'); return; }

      showToast(`Setoran ${mitraObj.name} sebesar ${formatRupiah(totalAmount)} berhasil diterima!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan setoran.', 'error');
    }
  };

  // 4. Setoran Jual di Rumah (1-Tap Deposit)
  const handleHomeSalesDeposit = async (data: { amount: number; note: string }) => {
    const { amount, note } = data;
    if (amount <= 0) {
      showToast('Nominal setoran rumah harus lebih dari Rp 0!', 'error');
      return;
    }

    const firstProd = products.length > 0 ? products[0] : null;
    const price = firstProd?.price || 1;
    const avgHpp = firstProd?.avgHpp || 0;
    const hppRatio = price > 0 ? (avgHpp / price) : 0.6;

    const estimatedQty = Math.max(1, Math.round(amount / price));
    const hppPerUnit = avgHpp > 0 ? avgHpp : Math.round((amount * hppRatio) / estimatedQty);
    const recoveredCost = Math.round(amount * hppRatio);
    const profit = amount - recoveredCost;

    const trxNumber = `TRX-HOME-${Date.now().toString().slice(-6)}`;
    const id = `SALE-HOME-${Date.now()}`;

    try {
      const json = await api.postSale({
        id,
        trxNumber,
        saleType: 'DIRECT',
        mitraId: null,
        productId: firstProd?.id || 'P-HOME',
        quantity: estimatedQty,
        pricePerUnit: Math.round(amount / estimatedQty),
        totalAmount: amount,
        hppPerUnit,
        recoveredCost,
        profit,
        paymentMethod: 'CASH',
      });

      if (!json.success) { showToast(json.error || 'Gagal menyimpan setoran rumah!', 'error'); return; }

      showToast(`Setoran Uang Rumah ${formatRupiah(amount)} berhasil diterima!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan setoran rumah.', 'error');
    }
  };

  // 5. Tambah / Edit Master Produk
  const handleCreateOrUpdateProduct = async (data: { id?: string; name: string; category: string; price: number }) => {
    const id = data.id || `P-${Date.now()}`;
    const avgHpp = editingProduct ? editingProduct.avgHpp : 0;

    try {
      const json = await api.postProduct({ id, name: data.name, category: data.category, price: data.price, avgHpp });
      if (!json.success) { showToast(json.error || 'Gagal menyimpan produk!', 'error'); return; }

      showToast(`Produk ${data.name} berhasil disimpan!`);
      setActiveModal(null);
      setEditingProduct(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan produk.', 'error');
    }
  };

  // 6. Hapus Master Produk
  const handleDeleteProduct = async (productId: string) => {
    const confirmed = await toast.confirm({
      title: 'Hapus Master Produk',
      message: 'Apakah Anda yakin ingin menghapus produk ini dari Master?',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
    });
    if (!confirmed) return;
    try {
      const json = await api.deleteProduct(productId);
      if (!json.success) { showToast(json.error || 'Gagal menghapus produk!', 'error'); return; }

      showToast('Produk berhasil dihapus!');
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menghapus produk.', 'error');
    }
  };

  // 7. Tambah / Edit Master Mitra
  const handleCreateOrUpdateMitra = async (data: {
    id?: string;
    name: string;
    type: string;
    whatsapp: string;
    address: string;
    customPrices?: Record<string, number>;
  }) => {
    const id = data.id || `M-${Date.now()}`;

    try {
      const json = await api.postMitra({ id, name: data.name, type: data.type, whatsapp: data.whatsapp, address: data.address, customPrices: data.customPrices });
      if (!json.success) { showToast(json.error || 'Gagal menyimpan mitra!', 'error'); return; }

      showToast(`Mitra ${data.name} berhasil disimpan!`);
      setActiveModal(null);
      setEditingMitra(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menyimpan mitra.', 'error');
    }
  };

  // 8. Hapus Master Mitra
  const handleDeleteMitra = async (mitraId: string) => {
    const confirmed = await toast.confirm({
      title: 'Hapus Master Mitra',
      message: 'Apakah Anda yakin ingin menghapus mitra ini?',
      variant: 'danger',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
    });
    if (!confirmed) return;
    try {
      const json = await api.deleteMitra(mitraId);
      if (!json.success) { showToast(json.error || 'Gagal menghapus mitra!', 'error'); return; }

      showToast('Mitra berhasil dihapus!');
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi database gagal saat menghapus mitra.', 'error');
    }
  };

  // Share Sale Nota to WhatsApp
  const handleShareSaleToWhatsApp = (sale: Sale) => {
    const mitra = mitras.find((m) => m.id === sale.mitraId);
    const product = products.find((p) => p.id === sale.productId);
    const cleanWa = mitra?.whatsapp ? mitra.whatsapp.replace(/[^0-9]/g, '') : '';
    const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

    const msg = `*NOTA PENJUALAN - DAPURZY* 🍞
No. Trx: ${sale.trxNumber}
Tanggal: ${dateStr}

Mitra: ${mitra?.name || 'Mitra'}
Produk: ${product?.name || 'Produk'}
Item Laku: ${sale.quantity} pcs
Total Dibayar: ${formatRupiah(sale.totalAmount)}
Metode: ${sale.paymentMethod}

Terima kasih atas kerjasamanya! 🙏`;

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
      const json = await api.postFactoryReset();
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

      {/* HEADER UTAMA APP (ULTRA-CLEAN WITH LOCK BUTTON ONLY) */}
      <Navbar
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
            stocks={stocks}
            onOpenModal={(modal) => setActiveModal(modal)}
            onOpenPengolahanForBatch={(batchId) => {
              setPengolahanInitialBatchId(batchId);
              setActiveModal('pengolahan');
            }}
          />
        )}

        {/* TAB REVENUE HISTORY */}
        {activeTab === 'revenue' && (
          <RevenueHistoryModule
            purchaseBatches={purchaseBatches}
            products={products}
            sales={sales}
            mitras={mitras}
          />
        )}

        {/* TAB 2: MITRA & SETORAN */}
        {activeTab === 'mitra' && (
          <MitraModule
            mitras={mitras}
            products={products}
            sales={sales}
            onOpenCreateMitraModal={() => { setEditingMitra(null); setActiveModal('mitra'); }}
            onOpenSettlementModal={() => setActiveModal('settlement')}
            onNavigateToMaster={() => setActiveTab('master')}
            onShareSaleToWhatsApp={handleShareSaleToWhatsApp}
          />
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
            onOpenResetModal={() => setActiveModal('reset')}
          />
        )}
      </main>

      {/* BOTTOM NAVIGATION BAR WITH FLOATING ACTION BUTTON (+ BELANJA) */}
      <BottomNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPurchaseModal={() => setActiveModal('belanja_batch')}
      />

      {/* FORM MODAL DIALOGS CONTAINER */}
      <ModalsContainer
        activeModal={activeModal}
        onClose={() => setActiveModal(null)}
        onOpenModal={(m) => setActiveModal(m)}
        operatingCapital={operatingCapital}
        purchaseBatches={purchaseBatches}
        products={products}
        mitras={mitras}
        stocks={stocks}
        capitalLogs={capitalLogs}
        editingProduct={editingProduct}
        editingMitra={editingMitra}
        pengolahanInitialBatchId={pengolahanInitialBatchId}
        setEditingProduct={setEditingProduct}
        setEditingMitra={setEditingMitra}
        setPengolahanInitialBatchId={setPengolahanInitialBatchId}
        onBelanjaBatch={handleBelanjaBatch}
        onPengolahan={handlePengolahan}
        onAmbilMitra={handleAmbilMitra}
        onMitraSettlement={handleMitraSettlement}
        onHomeSalesDeposit={handleHomeSalesDeposit}
        onCapital={handleCapital}
        onDeleteCapitalLog={handleDeleteCapitalLog}
        onCreateOrUpdateProduct={handleCreateOrUpdateProduct}
        onCreateOrUpdateMitra={handleCreateOrUpdateMitra}
        onFactoryReset={handleFactoryResetAllData}
      />
    </div>
  );
}
