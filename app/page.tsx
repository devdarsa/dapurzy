'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import BottomNav from '@/components/BottomNav';
import DrawerMenu from '@/components/DrawerMenu';
import Toast from '@/components/Toast';
import PinLockScreen from '@/components/PinLockScreen';

// Import Modular View Components
import DashboardModule from '@/components/modules/DashboardModule';
import BatchModule from '@/components/modules/BatchModule';
import ProductionModule from '@/components/modules/ProductionModule';
import MovementsModule from '@/components/modules/MovementsModule';
import SalesModule from '@/components/modules/SalesModule';
import StockModule from '@/components/modules/StockModule';
import TraceabilityModule from '@/components/modules/TraceabilityModule';
import MasterModule from '@/components/modules/MasterModule';

// Import Form Modal Dialog Components
import PurchaseModal from '@/components/modals/PurchaseModal';
import ProductionModal from '@/components/modals/ProductionModal';
import SaleModal from '@/components/modals/SaleModal';
import MovementModal from '@/components/modals/MovementModal';
import CapitalModal from '@/components/modals/CapitalModal';
import ProductModal from '@/components/modals/ProductModal';
import MitraModal from '@/components/modals/MitraModal';
import MitraSettlementModal from '@/components/modals/MitraSettlementModal';
import ResetDataModal from '@/components/modals/ResetDataModal';

// Import Types, Helpers & Notification Engine
import { Product, Mitra, PurchaseBatch, ProductStock, AuditLog } from '@/lib/types';
import { formatRupiah, calculatePrecisionHpp, calculateTransactionProfit } from '@/lib/utils';
import { registerServiceWorkerAndRequestPermission, sendLowStockNotification, getRecommendedIngredients } from '@/lib/notification';

// ── Helper: map snake_case DB rows → camelCase app types ──────────────────────
function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    price: r.price,
    avgHpp: r.avg_hpp ?? r.avgHpp ?? 0,
    status: r.status ?? 'active',
  };
}

function mapMitra(r: any): Mitra {
  return {
    id: r.id,
    name: r.name,
    type: r.type,
    whatsapp: r.whatsapp ?? '',
    address: r.address ?? '',
    status: r.status ?? 'active',
  };
}

function mapBatch(r: any): PurchaseBatch {
  return {
    id: r.id,
    batchId: r.batch_id ?? r.batchId,
    date: r.created_at ?? r.date ?? new Date().toISOString(),
    itemsDescription: r.items_description ?? r.itemsDescription,
    totalCost: r.total_cost ?? r.totalCost,
    supplier: r.supplier ?? 'Supplier Umum',
    status: r.status ?? 'pending_production',
    productId: r.product_id ?? r.productId ?? null,
    producedQty: r.produced_qty ?? r.producedQty ?? 0,
    calculatedHpp: r.calculated_hpp ?? r.calculatedHpp ?? 0,
  };
}

function mapStock(r: any): ProductStock {
  return {
    id: r.id,
    productId: r.productId ?? r.product_id,
    locationType: r.location_type ?? r.locationType,
    mitraId: r.mitra_id ?? r.mitraId ?? null,
    quantity: r.quantity ?? 0,
  };
}

function mapAuditLog(r: any): AuditLog {
  return {
    id: r.id,
    action: r.action,
    trxNumber: r.trx_number ?? r.trxNumber ?? '',
    details: r.details,
    createdAt: r.created_at ?? r.createdAt ?? new Date().toISOString(),
  };
}

export default function DAPURZYApp() {
  // --- STATE KEAMANAN PIN (Sesi 3 Hari) ---
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

  const handleUnlockSuccess = (_pin: string) => {
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
    if (typeof window !== 'undefined' && 'caches' in window) {
      try {
        const names = await caches.keys();
        await Promise.all(names.map((n) => caches.delete(n)));
      } catch (e) {
        console.log('Cache purge error:', e);
      }
    }
    showToast('Aplikasi Terkunci & Cache Dibersihkan!', 'error');
    setTimeout(() => { if (typeof window !== 'undefined') window.location.reload(); }, 300);
  };

  // --- STATE NAVIGATION & UI ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeModal, setActiveModal] = useState<
    'sale' | 'movement' | 'production' | 'purchase' | 'capital' | 'product' | 'mitra' | 'settlement' | 'reset' | null
  >(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // --- STATE APLIKASI — SUMBER KEBENARAN: CLOUDFLARE D1 ---
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [activeCapital, setActiveCapital] = useState<number>(0);
  const [products, setProducts] = useState<Product[]>([]);
  const [mitras, setMitras] = useState<Mitra[]>([]);
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([]);
  const [stocks, setStocks] = useState<ProductStock[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // SHOW TOAST MESSAGE
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // ── LOAD ALL DATA FROM D1 (Single Source of Truth) ──────────────────────────
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
        setCashBalance(d.cashBalance ?? 0);
        setActiveCapital(d.activeCapital ?? 0);
        setProducts((d.products ?? []).map(mapProduct));
        setMitras((d.mitras ?? []).map(mapMitra));
        setPurchaseBatches((d.purchaseBatches ?? []).map(mapBatch));
        setStocks((d.stocks ?? []).map(mapStock));
        setAuditLogs((d.auditLogs ?? []).map(mapAuditLog));

        // Build transactions list from sales + movements for display
        const sales = (d.sales ?? []).map((r: any) => ({
          id: r.id,
          trxNumber: r.trx_number ?? r.trxNumber,
          date: r.created_at ?? r.date ?? new Date().toISOString(),
          type: 'PENJUALAN',
          title: `Penjualan ${r.sale_type === 'DIRECT' ? 'Direct' : 'Mitra'}`,
          detail: `${r.quantity}x produk @ ${formatRupiah(r.price_per_unit)} [${r.payment_method}]`,
          amount: r.total_amount ?? 0,
          profit: r.profit ?? 0,
          category: 'in',
        }));

        const movements = (d.movements ?? []).map((r: any) => ({
          id: r.id,
          trxNumber: r.trx_number ?? r.trxNumber,
          date: r.created_at ?? r.date ?? new Date().toISOString(),
          type: 'PERGERAKAN',
          title: `Pergerakan Stok (${r.type})`,
          detail: `${r.quantity} pcs produk ${r.product_id}`,
          amount: 0,
          profit: 0,
          category: 'neutral',
        }));

        const purchases = (d.purchaseBatches ?? []).map((r: any) => ({
          id: r.id,
          trxNumber: `TRX-BELANJA-${r.batch_id ?? r.batchId}`,
          date: r.created_at ?? r.date ?? new Date().toISOString(),
          type: 'BELANJA',
          title: `Belanja Batch ${r.batch_id ?? r.batchId}`,
          detail: r.items_description ?? r.itemsDescription ?? '',
          amount: r.total_cost ?? r.totalCost ?? 0,
          profit: 0,
          category: 'out',
        }));

        const allTrx = [...sales, ...movements, ...purchases].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setTransactions(allTrx);
      } else {
        showToast('Tidak ada data di database. Silakan masukkan data pertama.', 'error');
      }
    } catch (e) {
      showToast('Koneksi ke database gagal.', 'error');
      console.error('loadFromD1 error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- HOURLY REAL-TIME LOW-STOCK CHECKER ---
  useEffect(() => {
    const checkLowStockAlerts = () => {
      products.forEach((p) => {
        const summary = getProductStockSummary(p.id);
        if (summary.total <= 10) {
          const recipe = getRecommendedIngredients(p.category, p.name);
          sendLowStockNotification(p.name, summary.total, recipe);
        }
      });
    };
    checkLowStockAlerts();
    const intervalId = setInterval(checkLowStockAlerts, 60 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [products, stocks]);

  // --- STATISTIK RINGKASAN HARI INI ---
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    let omzet = 0;
    let laba = 0;
    let pengeluaran = 0;
    transactions.forEach((trx) => {
      const trxDate = new Date(trx.date).toDateString();
      if (trxDate === today) {
        if (trx.type === 'PENJUALAN') { omzet += trx.amount; laba += trx.profit || 0; }
        else if (trx.type === 'BELANJA') { pengeluaran += trx.amount; }
      }
    });
    return { omzet, laba, pengeluaran };
  }, [transactions]);

  // Total valuation of Inventory
  const stockValuation = useMemo(() => {
    let total = 0;
    stocks.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (product) total += s.quantity * product.avgHpp;
    });
    return total;
  }, [stocks, products]);

  // Helper Ringkasan Stok
  const getProductStockSummary = (productId: string) => {
    const gudang = stocks.find((s) => s.productId === productId && s.locationType === 'gudang')?.quantity || 0;
    const mitraTotal = stocks
      .filter((s) => s.productId === productId && s.locationType === 'mitra')
      .reduce((sum, s) => sum + s.quantity, 0);
    return { gudang, mitraTotal, total: gudang + mitraTotal };
  };

  // ── HANDLER BUSINESS LOGIC — SEMUA MENYIMPAN KE D1 ──────────────────────────

  // 1. Tambah Belanja Bahan Baku
  const handleCreatePurchaseBatch = async (data: { itemsDescription: string; totalCost: number; supplier: string; items?: any[] }) => {
    const { itemsDescription, totalCost, supplier, items } = data;

    if (!itemsDescription || totalCost <= 0) {
      showToast('Deskripsi dan total biaya belanja harus diisi dengan benar!', 'error'); return;
    }
    if (cashBalance <= 0) {
      showToast('Saldo Kas Operasional Habis (Rp 0)! Harap lakukan Injeksi Modal terlebih dahulu.', 'error'); return;
    }
    if (cashBalance < totalCost) {
      showToast(`Saldo Kas (${formatRupiah(cashBalance)}) tidak mencukupi untuk belanja ${formatRupiah(totalCost)}!`, 'error'); return;
    }

    const batchSeq = String(purchaseBatches.length + 1).padStart(3, '0');
    const batchId = `BATCH-${new Date().getFullYear()}-${batchSeq}`;
    const id = `PB-${Date.now()}`;

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, batchId, itemsDescription, totalCost, supplier: supplier || 'Supplier Umum', items: items || [] }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan belanja ke database!', 'error'); return; }

      showToast(`Batch Belanja ${batchId} ${formatRupiah(totalCost)} berhasil dicatat!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menyimpan belanja.', 'error');
    }
  };


  // 2. Tarik Batch Belanja → Produksi
  const handleProduceFromBatch = async (data: { batchId: string; productId: string; producedQty: number; note?: string }) => {
    const { batchId, productId, producedQty } = data;
    const batch = purchaseBatches.find((b) => b.batchId === batchId);
    const product = products.find((p) => p.id === productId);

    if (!batch || !product) { showToast('Batch belanja atau produk tidak valid!', 'error'); return; }
    if (producedQty <= 0) { showToast('Jumlah produksi harus lebih besar dari 0!', 'error'); return; }
    if (batch.status === 'produced') { showToast('Batch ini sudah ditarik ke produksi! Setiap batch hanya bisa ditarik 1 kali.', 'error'); return; }

    const calculatedHpp = calculatePrecisionHpp(batch.totalCost, producedQty);

    try {
      const res = await fetch('/api/purchases', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ batchId, productId, producedQty, calculatedHpp }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan data produksi!', 'error'); return; }

      showToast(`Produksi Selesai! HPP presisi: ${formatRupiah(calculatedHpp)}/pcs (Batch Terkunci)`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menyimpan produksi.', 'error');
    }
  };

  // 3. Tambah Penjualan
  const handleCreateSale = async (data: {
    productId: string; quantity: number; locationType: 'gudang' | 'mitra'; mitraId?: string | null; paymentMethod?: string;
  }) => {
    const { productId, quantity, locationType, mitraId, paymentMethod = 'CASH' } = data;
    const product = products.find((p) => p.id === productId);
    if (!product) { showToast('Produk tidak ditemukan!', 'error'); return; }
    if (quantity <= 0) { showToast('Kuantitas penjualan harus lebih dari 0!', 'error'); return; }

    const stockItem = stocks.find((s) =>
      locationType === 'gudang'
        ? s.productId === productId && s.locationType === 'gudang'
        : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
    );

    const availableQty = stockItem ? stockItem.quantity : 0;
    if (availableQty < quantity) { showToast(`Stok tidak mencukupi! Tersedia: ${availableQty} pcs`, 'error'); return; }

    const totalAmount = quantity * product.price;
    const profit = calculateTransactionProfit(quantity, product.price, product.avgHpp);
    const id = `SALE-${Date.now()}`;
    const trxNumber = `TRX-SALE-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, trxNumber, productId, quantity,
          pricePerUnit: product.price, hppPerUnit: product.avgHpp,
          totalAmount, profit,
          saleType: locationType === 'gudang' ? 'DIRECT' : 'CONSIGNMENT',
          mitraId: mitraId || null,
          paymentMethod,
          stockId: stockItem?.id,
          newStockQty: (stockItem?.quantity ?? 0) - quantity,
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan penjualan!', 'error'); return; }

      showToast(`Penjualan ${product.name} (${quantity} pcs) berhasil dicatat!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menyimpan penjualan.', 'error');
    }
  };

  // 4. Settlement & Retur Konsinyasi Mitra
  const handleMitraSettlement = async (data: {
    mitraId: string; productId: string; returnedQty: number; paymentMethod: string;
  }) => {
    const { mitraId, productId, returnedQty, paymentMethod } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);

    if (!product || !mitraObj) { showToast('Produk atau mitra tidak valid!', 'error'); return; }

    const mitraStockItem = stocks.find((s) => s.locationType === 'mitra' && s.mitraId === mitraId && s.productId === productId);
    const initialMitraStock = mitraStockItem ? mitraStockItem.quantity : 0;

    if (initialMitraStock <= 0) { showToast(`Belum ada stok ${product.name} di ${mitraObj.name}!`, 'error'); return; }
    if (returnedQty > initialMitraStock) { showToast(`Jumlah retur (${returnedQty}) melebihi stok di mitra (${initialMitraStock})!`, 'error'); return; }

    const soldQty = initialMitraStock - returnedQty;
    const totalAmount = soldQty * product.price;
    const profit = calculateTransactionProfit(soldQty, product.price, product.avgHpp);
    const trxNumberSale = `TRX-SETTLE-${Date.now().toString().slice(-6)}`;

    try {
      // Record settlement sale if any sold
      if (soldQty > 0) {
        const saleRes = await fetch('/api/sales', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `SALE-SET-${Date.now()}`, trxNumber: trxNumberSale, productId, quantity: soldQty,
            pricePerUnit: product.price, hppPerUnit: product.avgHpp, totalAmount, profit,
            saleType: 'CONSIGNMENT', mitraId, paymentMethod,
            stockId: mitraStockItem?.id, newStockQty: 0,
          }),
        });
        const saleJson = await saleRes.json();
        if (!saleJson.success) { showToast(saleJson.error || 'Gagal menyimpan settlement!', 'error'); return; }
      } else {
        // Just zero the mitra stock without a sale record
        await fetch('/api/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `MOV-SET-${Date.now()}`, trxNumber: `TRX-RETUR-${Date.now().toString().slice(-6)}`,
            productId, type: 'RETUR', mitraId, quantity: returnedQty,
            note: `Retur penuh dari ${mitraObj.name}`,
            sourceStockId: mitraStockItem?.id, sourceNewQty: 0,
          }),
        });
      }

      // Return goods to gudang if any
      if (returnedQty > 0 && soldQty > 0) {
        const gudangStock = stocks.find((s) => s.productId === productId && s.locationType === 'gudang');
        await fetch('/api/movements', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: `MOV-RET-${Date.now()}`, trxNumber: `TRX-RETUR-${Date.now().toString().slice(-6)}`,
            productId, type: 'MITRA_TO_GUDANG', mitraId, quantity: returnedQty,
            note: `Retur sisa dari ${mitraObj.name}`,
            targetStockId: gudangStock?.id,
            targetNewQty: (gudangStock?.quantity ?? 0) + returnedQty,
            newTargetStock: !gudangStock ? { id: `STK-${Date.now()}`, productId, locationType: 'gudang', mitraId: null, quantity: returnedQty } : null,
          }),
        });
      }

      showToast(`Settlement ${mitraObj.name} berhasil! ${soldQty} pcs laku & ${returnedQty} pcs kembali ke Gudang.`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat settlement.', 'error');
    }
  };

  // 5. Pergerakan Stok
  const handleStockMovement = async (data: {
    productId: string; type: 'GUDANG_TO_MITRA' | 'MITRA_TO_GUDANG' | 'RETUR' | 'RUSAK' | 'HILANG';
    mitraId: string; quantity: number; note?: string;
  }) => {
    const { productId, type, mitraId, quantity, note } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);
    if (!product || !mitraObj) { showToast('Produk atau mitra tidak valid!', 'error'); return; }
    if (quantity <= 0) { showToast('Kuantitas pergerakan harus lebih besar dari 0!', 'error'); return; }

    const sourceLoc: 'gudang' | 'mitra' = (type === 'MITRA_TO_GUDANG' || type === 'RETUR') ? 'mitra' : 'gudang';
    const targetLoc: 'gudang' | 'mitra' = sourceLoc === 'gudang' ? 'mitra' : 'gudang';

    const sourceStock = stocks.find((s) =>
      sourceLoc === 'gudang'
        ? s.productId === productId && s.locationType === 'gudang'
        : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
    );

    if (!sourceStock || sourceStock.quantity < quantity) {
      showToast(`Stok asal (${sourceLoc}) tidak mencukupi! Tersedia: ${sourceStock?.quantity || 0} pcs`, 'error'); return;
    }

    let targetStock: ProductStock | undefined;
    let newTargetStock: any = null;

    if (type !== 'RUSAK' && type !== 'HILANG') {
      targetStock = stocks.find((s) =>
        targetLoc === 'gudang'
          ? s.productId === productId && s.locationType === 'gudang'
          : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
      );
      if (!targetStock) {
        newTargetStock = { id: `STK-${Date.now()}`, productId, locationType: targetLoc, mitraId: targetLoc === 'mitra' ? mitraId : null, quantity };
      }
    }

    const id = `MOV-${Date.now()}`;
    const trxNumber = `TRX-MOV-${Date.now().toString().slice(-6)}`;

    try {
      const res = await fetch('/api/movements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id, trxNumber, productId, type, mitraId, quantity, note: note || null,
          sourceStockId: sourceStock.id,
          sourceNewQty: sourceStock.quantity - quantity,
          targetStockId: targetStock?.id ?? null,
          targetNewQty: targetStock ? targetStock.quantity + quantity : null,
          newTargetStock,
        }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan pergerakan stok!', 'error'); return; }

      showToast(`Pergerakan stok ${type.replace(/_/g, ' ')} berhasil!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat pergerakan stok.', 'error');
    }
  };

  // 6. Injeksi Modal
  const handleCapital = async (data: { amount: number; note: string }) => {
    const { amount, note } = data;
    if (amount <= 0) { showToast('Nominal modal harus lebih besar dari 0!', 'error'); return; }

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

      showToast(`Injeksi modal ${formatRupiah(amount)} berhasil disimpan ke database!`);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat injeksi modal.', 'error');
    }
  };

  // 7a. Save Product
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

      showToast(`Master produk "${data.name}" berhasil ${data.id ? 'diperbarui' : 'ditambahkan'}!`);
      setEditingProduct(null);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menyimpan produk.', 'error');
    }
  };

  // 7b. Delete Product
  const handleDeleteProduct = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const summary = getProductStockSummary(productId);
    if (summary.total > 0) { showToast(`Tidak bisa menghapus "${product.name}" karena masih ada sisa stok (${summary.total} pcs)!`, 'error'); return; }

    if (!confirm(`Apakah Anda yakin ingin menghapus master produk "${product.name}"?`)) return;

    try {
      const res = await fetch(`/api/products?id=${productId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus produk!', 'error'); return; }

      showToast(`Master produk "${product.name}" telah dihapus!`);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menghapus produk.', 'error');
    }
  };

  // 8a. Save Mitra
  const handleSaveMitra = async (data: { id?: string; name: string; type: string; whatsapp: string; address: string }) => {
    if (!data.name) { showToast('Nama mitra harus diisi!', 'error'); return; }

    const id = data.id || `M-${Date.now()}`;
    try {
      const res = await fetch('/api/mitras', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name: data.name, type: data.type || 'Warung', whatsapp: data.whatsapp || '', address: data.address || '' }),
      });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menyimpan mitra!', 'error'); return; }

      showToast(`Mitra "${data.name}" berhasil ${data.id ? 'diperbarui' : 'ditambahkan'}!`);
      setEditingMitra(null);
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menyimpan mitra.', 'error');
    }
  };

  // 8b. Delete Mitra
  const handleDeleteMitra = async (mitraId: string) => {
    const mitra = mitras.find((m) => m.id === mitraId);
    if (!mitra) return;

    const activeMitraStock = stocks.filter((s) => s.locationType === 'mitra' && s.mitraId === mitraId && s.quantity > 0);
    if (activeMitraStock.length > 0) { showToast(`Tidak bisa menghapus "${mitra.name}" karena masih ada stok titipan aktif!`, 'error'); return; }

    if (!confirm(`Apakah Anda yakin ingin menghapus master mitra "${mitra.name}"?`)) return;

    try {
      const res = await fetch(`/api/mitras?id=${mitraId}`, { method: 'DELETE' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus mitra!', 'error'); return; }

      showToast(`Mitra "${mitra.name}" telah dihapus!`);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat menghapus mitra.', 'error');
    }
  };

  // 9. Factory Hard Reset — hapus semua data dari D1
  const handleFactoryResetAllData = async () => {
    try {
      const res = await fetch('/api/reset', { method: 'POST' });
      const json = await res.json();
      if (!json.success) { showToast(json.error || 'Gagal menghapus data!', 'error'); return; }

      showToast('Seluruh data aplikasi berhasil dihapus 100% dari database!', 'success');
      setActiveModal(null);
      await loadFromD1();
    } catch (e) {
      showToast('Koneksi ke database gagal saat reset data.', 'error');
    }
  };

  // IF PIN IS LOCKED, DISPLAY PIN LOCK SCREEN OVERLAY
  if (!isUnlocked) {
    return <PinLockScreen onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 sm:pb-24 select-none relative border-x border-slate-200">
      {/* TOAST NOTIFICATION */}
      <Toast notification={notification} />

      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
          <div className="bg-white rounded-2xl p-6 flex flex-col items-center gap-3 shadow-2xl">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-semibold text-slate-700">Memuat data dari database...</p>
          </div>
        </div>
      )}

      {/* HEADER UTAMA APP */}
      <Navbar
        onOpenDrawer={() => setIsDrawerOpen(true)}
        onOpenPurchaseModal={() => setActiveModal('purchase')}
      />

      {/* DRAWER NAVIGATION */}
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
      <main className="max-w-md sm:max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto p-2.5 sm:p-4 lg:p-6 space-y-3 sm:space-y-4">
        {activeTab === 'dashboard' && (
          <DashboardModule
            cashBalance={cashBalance}
            activeCapital={activeCapital}
            stockValuation={stockValuation}
            todayStats={todayStats}
            purchaseBatches={purchaseBatches}
            products={products}
            stocks={stocks}
            transactions={transactions}
            onOpenModal={(modal) => setActiveModal(modal)}
            getProductStockSummary={getProductStockSummary}
          />
        )}

        {activeTab === 'batch_laporan' && (
          <BatchModule
            purchaseBatches={purchaseBatches}
            products={products}
            onOpenPurchaseModal={() => setActiveModal('purchase')}
            onOpenProductionModal={() => setActiveModal('production')}
          />
        )}

        {activeTab === 'produksi' && (
          <ProductionModule
            purchaseBatches={purchaseBatches}
            products={products}
            onOpenProductionModal={() => setActiveModal('production')}
          />
        )}

        {activeTab === 'pergerakan' && (
          <MovementsModule
            transactions={transactions}
            onOpenMovementModal={() => setActiveModal('movement')}
            onOpenSettlementModal={() => setActiveModal('settlement')}
          />
        )}

        {activeTab === 'penjualan' && (
          <SalesModule
            transactions={transactions}
            onOpenSaleModal={() => setActiveModal('sale')}
          />
        )}

        {activeTab === 'stok' && (
          <StockModule
            products={products}
            mitras={mitras}
            stocks={stocks}
          />
        )}

        {activeTab === 'traceability' && (
          <TraceabilityModule
            cashBalance={cashBalance}
            activeCapital={activeCapital}
            stockValuation={stockValuation}
            todayStats={todayStats}
            purchaseBatches={purchaseBatches}
            products={products}
            mitras={mitras}
            auditLogs={auditLogs}
            transactions={transactions}
          />
        )}

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
      <PurchaseModal
        isOpen={activeModal === 'purchase'}
        onClose={() => setActiveModal(null)}
        cashBalance={cashBalance}
        onSubmit={handleCreatePurchaseBatch}
      />

      <ProductionModal
        isOpen={activeModal === 'production'}
        onClose={() => setActiveModal(null)}
        purchaseBatches={purchaseBatches}
        products={products}
        onSubmit={handleProduceFromBatch}
      />

      <SaleModal
        isOpen={activeModal === 'sale'}
        onClose={() => setActiveModal(null)}
        products={products}
        mitras={mitras}
        onSubmit={handleCreateSale}
      />

      <MovementModal
        isOpen={activeModal === 'movement'}
        onClose={() => setActiveModal(null)}
        products={products}
        mitras={mitras}
        onSubmit={handleStockMovement}
      />

      <MitraSettlementModal
        isOpen={activeModal === 'settlement'}
        onClose={() => setActiveModal(null)}
        products={products}
        mitras={mitras}
        stocks={stocks}
        onSubmit={handleMitraSettlement}
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
        initialData={editingMitra}
        onSubmit={handleSaveMitra}
      />

      <ResetDataModal
        isOpen={activeModal === 'reset'}
        onClose={() => setActiveModal(null)}
        onConfirmReset={handleFactoryResetAllData}
      />

      {/* MOBILE & TABLET & DESKTOP FLOATING BOTTOM NAVIGATION */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}
