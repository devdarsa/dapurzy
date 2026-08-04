'use client';

import React, { useState, useMemo, useEffect } from 'react';
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

// Import Types & Helpers
import { Product, Mitra, PurchaseBatch, ProductStock, AuditLog } from '@/lib/types';
import { formatRupiah, calculatePrecisionHpp, calculateTransactionProfit } from '@/lib/utils';

export default function DAPURZYApp() {
  // --- STATE KEAMANAN PIN LIVE PRODUCTION ---
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);

  useEffect(() => {
    const savedUnlocked = sessionStorage.getItem('dapurzy_unlocked');
    if (savedUnlocked === 'true') {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlockSuccess = (pin: string) => {
    setIsUnlocked(true);
    sessionStorage.setItem('dapurzy_unlocked', 'true');
    showToast('Sistem DAPURZY Live Berhasil Dibuka!', 'success');
  };

  const handleLockApp = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('dapurzy_unlocked');
    showToast('Aplikasi Terkunci!', 'error');
  };

  // --- STATE NAVIGATION & UI ---
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [activeModal, setActiveModal] = useState<
    'sale' | 'movement' | 'production' | 'purchase' | 'capital' | 'product' | 'mitra' | 'settlement' | 'reset' | null
  >(null);

  // States for CRUD editing
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingMitra, setEditingMitra] = useState<Mitra | null>(null);

  // --- STATE LIVE PRODUCTION (BERSIH TOTAL 0 DATA UJI COBA) ---
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [activeCapital, setActiveCapital] = useState<number>(0);

  // Master Produk (Bersih)
  const [products, setProducts] = useState<Product[]>([]);

  // Master Mitra (Bersih)
  const [mitras, setMitras] = useState<Mitra[]>([]);

  // Batch Belanja Bahan Baku (Bersih)
  const [purchaseBatches, setPurchaseBatches] = useState<PurchaseBatch[]>([]);

  // Stok Per Lokasi (Bersih)
  const [stocks, setStocks] = useState<ProductStock[]>([]);

  // Riwayat Transaksi Aktivitas (Bersih)
  const [transactions, setTransactions] = useState<any[]>([]);

  // Log Audit Trail Live
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    {
      id: 'AUD-LIVE-01',
      action: 'LIVE_PRODUCTION_INITIALIZED',
      trxNumber: 'SYS-LIVE-INIT',
      details: 'DAPURZY Live System Engine Active. Clean zero state.',
      createdAt: new Date().toISOString(),
    },
  ]);

  // SHOW TOAST MESSAGE
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Log Audit Entry
  const addAuditLog = (action: string, trxNumber: string, details: string) => {
    setAuditLogs((prev) => [
      {
        id: `AUD-${Date.now().toString().slice(-4)}`,
        action,
        trxNumber,
        details,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
  };

  // --- STATISTIK RINGKASAN HARI INI & SUMMARY ---
  const todayStats = useMemo(() => {
    const today = new Date().toDateString();
    let omzet = 0;
    let laba = 0;
    let pengeluaran = 0;

    transactions.forEach((trx) => {
      const trxDate = new Date(trx.date).toDateString();
      if (trxDate === today) {
        if (trx.type === 'PENJUALAN') {
          omzet += trx.amount;
          laba += trx.profit || 0;
        } else if (trx.type === 'BELANJA') {
          pengeluaran += trx.amount;
        }
      }
    });

    return { omzet, laba, pengeluaran };
  }, [transactions]);

  // Total valuation of Inventory in Warehouse & Mitra
  const stockValuation = useMemo(() => {
    let totalValuation = 0;
    stocks.forEach((s) => {
      const product = products.find((p) => p.id === s.productId);
      if (product) {
        totalValuation += s.quantity * product.avgHpp;
      }
    });
    return totalValuation;
  }, [stocks, products]);

  // Helper Ringkasan Stok
  const getProductStockSummary = (productId: string) => {
    const gudang = stocks.find((s) => s.productId === productId && s.locationType === 'gudang')?.quantity || 0;
    const mitraTotal = stocks
      .filter((s) => s.productId === productId && s.locationType === 'mitra')
      .reduce((sum, s) => sum + s.quantity, 0);

    return { gudang, mitraTotal, total: gudang + mitraTotal };
  };

  // --- HANDLER BUSINESS LOGIC ---

  // 1. Tambah Belanja Bahan Baku
  const handleCreatePurchaseBatch = (data: { itemsDescription: string; totalCost: number; supplier: string }) => {
    const { itemsDescription, totalCost, supplier } = data;

    if (!itemsDescription || totalCost <= 0) {
      showToast('Deskripsi dan total biaya belanja harus diisi dengan benar!', 'error');
      return;
    }

    if (cashBalance < totalCost) {
      showToast('Saldo Kas Operasional tidak mencukupi untuk belanja ini!', 'error');
      return;
    }

    const batchSeq = String(purchaseBatches.length + 1).padStart(3, '0');
    const batchId = `BATCH-${new Date().getFullYear()}-${batchSeq}`;
    const trxNumber = `TRX-BELANJA-${Date.now().toString().slice(-4)}`;

    const newBatch: PurchaseBatch = {
      id: `PB-${Date.now()}`,
      batchId,
      date: new Date().toISOString(),
      itemsDescription,
      totalCost,
      supplier: supplier || 'Supplier Umum',
      status: 'pending_production',
      productId: null,
      producedQty: 0,
      calculatedHpp: 0,
    };

    setCashBalance((prev) => prev - totalCost);
    setPurchaseBatches((prev) => [newBatch, ...prev]);

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      trxNumber,
      date: new Date().toISOString(),
      type: 'BELANJA',
      title: `Belanja Modal Bahan (${batchId})`,
      detail: `${itemsDescription} | Supplier: ${supplier || 'Umum'}`,
      amount: totalCost,
      profit: 0,
      category: 'out',
    };

    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog('PURCHASE_BATCH_CREATED', trxNumber, `Created batch ${batchId} cost ${formatRupiah(totalCost)}`);
    showToast(`Batch Belanja ${batchId} berhasil dicatat!`);
    setActiveModal(null);
  };

  // 2. Tarik Batch Belanja Menjadi Produksi (Auto-HPP, Strictly 1x Only)
  const handleProduceFromBatch = (data: { batchId: string; productId: string; producedQty: number; note?: string }) => {
    const { batchId, productId, producedQty } = data;

    const batch = purchaseBatches.find((b) => b.batchId === batchId);
    const product = products.find((p) => p.id === productId);

    if (!batch || !product) {
      showToast('Batch belanja atau produk tidak valid!', 'error');
      return;
    }

    if (producedQty <= 0) {
      showToast('Jumlah produksi harus lebih besar dari 0!', 'error');
      return;
    }

    if (batch.status === 'produced') {
      showToast('Batch ini sudah ditarik ke produksi sebelumnya! Setiap batch hanya bisa ditarik 1 kali.', 'error');
      return;
    }

    const calculatedHpp = calculatePrecisionHpp(batch.totalCost, producedQty);
    const trxNumber = `TRX-PROD-${Date.now().toString().slice(-4)}`;

    setPurchaseBatches((prev) =>
      prev.map((b) =>
        b.batchId === batchId
          ? {
              ...b,
              status: 'produced',
              productId,
              producedQty,
              calculatedHpp,
            }
          : b
      )
    );

    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, avgHpp: calculatedHpp } : p))
    );

    setStocks((prev) => {
      const existing = prev.find((s) => s.productId === productId && s.locationType === 'gudang');
      if (existing) {
        return prev.map((s) => (s.id === existing.id ? { ...s, quantity: s.quantity + producedQty } : s));
      } else {
        return [
          ...prev,
          {
            id: `S-${Date.now()}`,
            productId,
            locationType: 'gudang',
            mitraId: null,
            quantity: producedQty,
          },
        ];
      }
    });

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      trxNumber,
      date: new Date().toISOString(),
      type: 'PRODUKSI',
      title: `Produksi dari ${batchId}`,
      detail: `${producedQty} pcs ${product.name} ➔ HPP Auto: ${formatRupiah(calculatedHpp)}/pcs (Terkunci)`,
      amount: 0,
      profit: 0,
      category: 'neutral',
    };

    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog(
      'PRODUCTION_COMPLETED',
      trxNumber,
      `Produced ${producedQty} pcs of ${product.name} from ${batchId}. HPP=${calculatedHpp}`
    );
    showToast(`Produksi Selesai! HPP presisi terhitung: ${formatRupiah(calculatedHpp)}/pcs (Batch Terkunci)`);
    setActiveModal(null);
  };

  // 3. Tambah Penjualan Direct & Mitra
  const handleCreateSale = (data: {
    productId: string;
    quantity: number;
    locationType: 'gudang' | 'mitra';
    mitraId?: string | null;
    paymentMethod?: string;
  }) => {
    const { productId, quantity, locationType, mitraId, paymentMethod = 'CASH' } = data;
    const product = products.find((p) => p.id === productId);
    if (!product) {
      showToast('Produk tidak ditemukan!', 'error');
      return;
    }

    if (quantity <= 0) {
      showToast('Kuantitas penjualan harus lebih dari 0!', 'error');
      return;
    }

    const stockItem = stocks.find((s) =>
      locationType === 'gudang'
        ? s.productId === productId && s.locationType === 'gudang'
        : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
    );

    const availableQty = stockItem ? stockItem.quantity : 0;

    if (availableQty < quantity) {
      showToast(`Stok tidak mencukupi! Tersedia hanya: ${availableQty} pcs`, 'error');
      return;
    }

    const totalAmount = quantity * product.price;
    const profit = calculateTransactionProfit(quantity, product.price, product.avgHpp);
    const trxNumber = `TRX-SALE-${Date.now().toString().slice(-4)}`;

    setStocks((prev) =>
      prev.map((s) => (s.id === stockItem!.id ? { ...s, quantity: s.quantity - quantity } : s))
    );

    setCashBalance((prev) => prev + totalAmount);

    const mitraObj = mitras.find((m) => m.id === mitraId);
    const locationName = locationType === 'gudang' ? 'Gudang Utama' : mitraObj?.name || 'Mitra Konsinyasi';

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      trxNumber,
      date: new Date().toISOString(),
      type: 'PENJUALAN',
      title: `Penjualan ${locationType === 'gudang' ? 'Direct Gudang' : 'Mitra ' + locationName}`,
      detail: `${quantity}x ${product.name} @ ${formatRupiah(product.price)} (HPP ${formatRupiah(
        product.avgHpp
      )}) [${paymentMethod}]`,
      amount: totalAmount,
      profit: profit,
      category: 'in',
    };

    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog(
      'SALE_RECORDED',
      trxNumber,
      `Sold ${quantity} pcs ${product.name} from ${locationName}. Omzet=${totalAmount}, Profit=${profit}`
    );
    showToast(`Penjualan ${product.name} (${quantity} pcs) berhasil dicatat!`);
    setActiveModal(null);
  };

  // 4. Settlement & Retur Konsinyasi Mitra (1-Tap Automatic Engine)
  const handleMitraSettlement = (data: {
    mitraId: string;
    productId: string;
    returnedQty: number;
    paymentMethod: string;
  }) => {
    const { mitraId, productId, returnedQty, paymentMethod } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);

    if (!product || !mitraObj) {
      showToast('Produk atau mitra tidak valid!', 'error');
      return;
    }

    const mitraStockItem = stocks.find(
      (s) => s.locationType === 'mitra' && s.mitraId === mitraId && s.productId === productId
    );

    const initialMitraStock = mitraStockItem ? mitraStockItem.quantity : 0;

    if (initialMitraStock <= 0) {
      showToast(`Belum ada stok ${product.name} di ${mitraObj.name}!`, 'error');
      return;
    }

    if (returnedQty > initialMitraStock) {
      showToast(`Jumlah retur (${returnedQty}) melebihi stok di mitra (${initialMitraStock})!`, 'error');
      return;
    }

    const soldQty = initialMitraStock - returnedQty;
    const totalAmount = soldQty * product.price;
    const profit = calculateTransactionProfit(soldQty, product.price, product.avgHpp);
    const trxNumberSale = `TRX-SETTLE-${Date.now().toString().slice(-4)}`;
    const trxNumberRetur = `TRX-RETUR-${Date.now().toString().slice(-4)}`;

    setStocks((prev) => {
      let updated = prev.map((s) => {
        if (s.id === mitraStockItem!.id) {
          return { ...s, quantity: 0 };
        }
        return s;
      });

      if (returnedQty > 0) {
        const gudangStock = updated.find((s) => s.productId === productId && s.locationType === 'gudang');
        if (gudangStock) {
          updated = updated.map((s) => (s.id === gudangStock.id ? { ...s, quantity: s.quantity + returnedQty } : s));
        } else {
          updated.push({
            id: `S-${Date.now()}`,
            productId,
            locationType: 'gudang',
            mitraId: null,
            quantity: returnedQty,
          });
        }
      }
      return updated;
    });

    if (soldQty > 0) {
      setCashBalance((prev) => prev + totalAmount);

      const saleTrx = {
        id: `TRX-${Date.now().toString().slice(-4)}`,
        trxNumber: trxNumberSale,
        date: new Date().toISOString(),
        type: 'PENJUALAN',
        title: `Penjualan Konsinyasi ${mitraObj.name}`,
        detail: `${soldQty}x ${product.name} @ ${formatRupiah(product.price)} (HPP ${formatRupiah(
          product.avgHpp
        )}) [${paymentMethod}]`,
        amount: totalAmount,
        profit: profit,
        category: 'in',
      };
      setTransactions((prev) => [saleTrx, ...prev]);
    }

    if (returnedQty > 0) {
      const returTrx = {
        id: `TRX-${Date.now().toString().slice(-4)}1`,
        trxNumber: trxNumberRetur,
        date: new Date().toISOString(),
        type: 'PERGERAKAN',
        title: `Retur Sisa Barang dari ${mitraObj.name}`,
        detail: `${returnedQty}x ${product.name} ditarik kembali ke Gudang Utama`,
        amount: 0,
        profit: 0,
        category: 'neutral',
      };
      setTransactions((prev) => [returTrx, ...prev]);
    }

    addAuditLog(
      'MITRA_SETTLEMENT',
      trxNumberSale,
      `Settlement with ${mitraObj.name} for ${product.name}: Sold=${soldQty} pcs (${formatRupiah(
        totalAmount
      )}), Returned=${returnedQty} pcs to Gudang.`
    );

    showToast(`Settlement ${mitraObj.name} berhasil! ${soldQty} pcs laku & ${returnedQty} pcs kembali ke Gudang.`);
    setActiveModal(null);
  };

  // 5. Pergerakan Stok Biasa
  const handleStockMovement = (data: {
    productId: string;
    type: 'GUDANG_TO_MITRA' | 'MITRA_TO_GUDANG' | 'RETUR' | 'RUSAK' | 'HILANG';
    mitraId: string;
    quantity: number;
    note?: string;
  }) => {
    const { productId, type, mitraId, quantity, note } = data;
    const product = products.find((p) => p.id === productId);
    const mitraObj = mitras.find((m) => m.id === mitraId);

    if (!product || !mitraObj) {
      showToast('Produk atau mitra tidak valid!', 'error');
      return;
    }

    if (quantity <= 0) {
      showToast('Kuantitas pergerakan harus lebih besar dari 0!', 'error');
      return;
    }

    let sourceLoc: 'gudang' | 'mitra' = 'gudang';
    let targetLoc: 'gudang' | 'mitra' = 'mitra';

    if (type === 'MITRA_TO_GUDANG' || type === 'RETUR') {
      sourceLoc = 'mitra';
      targetLoc = 'gudang';
    } else if (type === 'RUSAK' || type === 'HILANG') {
      sourceLoc = 'gudang';
    }

    const sourceStock = stocks.find((s) =>
      sourceLoc === 'gudang'
        ? s.productId === productId && s.locationType === 'gudang'
        : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
    );

    if (!sourceStock || sourceStock.quantity < quantity) {
      showToast(`Stok asal (${sourceLoc}) tidak mencukupi! Tersedia: ${sourceStock?.quantity || 0} pcs`, 'error');
      return;
    }

    const trxNumber = `TRX-MOV-${Date.now().toString().slice(-4)}`;

    setStocks((prev) =>
      prev.map((s) => (s.id === sourceStock.id ? { ...s, quantity: s.quantity - quantity } : s))
    );

    if (type === 'GUDANG_TO_MITRA' || type === 'MITRA_TO_GUDANG' || type === 'RETUR') {
      setStocks((prev) => {
        const targetStock = prev.find((s) =>
          targetLoc === 'gudang'
            ? s.productId === productId && s.locationType === 'gudang'
            : s.productId === productId && s.locationType === 'mitra' && s.mitraId === mitraId
        );

        if (targetStock) {
          return prev.map((s) => (s.id === targetStock.id ? { ...s, quantity: s.quantity + quantity } : s));
        } else {
          return [...prev, { id: `S-${Date.now()}`, productId, locationType: targetLoc, mitraId, quantity }];
        }
      });
    }

    const typeTitleMap = {
      GUDANG_TO_MITRA: `Titip Stok ke ${mitraObj.name}`,
      MITRA_TO_GUDANG: `Tarik Stok dari ${mitraObj.name}`,
      RETUR: `Retur dari ${mitraObj.name}`,
      RUSAK: `Stok Rusak (${product.name})`,
      HILANG: `Stok Hilang (${product.name})`,
    };

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      trxNumber,
      date: new Date().toISOString(),
      type: 'PERGERAKAN',
      title: typeTitleMap[type],
      detail: `${quantity}x ${product.name} ${note ? '(' + note + ')' : ''}`,
      amount: 0,
      profit: 0,
      category: 'neutral',
    };

    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog('STOCK_MOVEMENT', trxNumber, `${type}: ${quantity} pcs ${product.name} with ${mitraObj.name}`);
    showToast(`Pergerakan stok ${type.replace(/_/g, ' ')} berhasil!`);
    setActiveModal(null);
  };

  // 6. Injeksi Modal
  const handleCapital = (data: { amount: number; note: string }) => {
    const { amount, note } = data;
    if (amount <= 0) {
      showToast('Nominal modal harus lebih besar dari 0!', 'error');
      return;
    }

    const trxNumber = `TRX-CAP-${Date.now().toString().slice(-4)}`;
    setCashBalance((prev) => prev + amount);
    setActiveCapital((prev) => prev + amount);

    const newTrx = {
      id: `TRX-${Date.now().toString().slice(-4)}`,
      trxNumber,
      date: new Date().toISOString(),
      type: 'MODAL',
      title: 'Injeksi Modal Operasional',
      detail: note || 'Penambahan Modal Kas Usaha',
      amount: amount,
      profit: 0,
      category: 'in',
    };

    setTransactions((prev) => [newTrx, ...prev]);
    addAuditLog('CAPITAL_INJECTED', trxNumber, `Injected capital ${formatRupiah(amount)}. Note: ${note}`);
    showToast(`Injeksi modal ${formatRupiah(amount)} berhasil!`);
    setActiveModal(null);
  };

  // 7a. Save Product (Create or Update)
  const handleSaveProduct = (data: { id?: string; name: string; category: string; price: number }) => {
    if (!data.name || data.price <= 0) {
      showToast('Nama produk dan harga jual harus valid!', 'error');
      return;
    }

    if (data.id) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === data.id
            ? { ...p, name: data.name, category: data.category || 'Umum', price: data.price }
            : p
        )
      );
      addAuditLog('PRODUCT_UPDATED', data.id, `Updated product ${data.name} price to ${formatRupiah(data.price)}`);
      showToast(`Master produk "${data.name}" berhasil diperbarui!`);
    } else {
      const newProduct: Product = {
        id: `P-0${products.length + 1}`,
        name: data.name,
        category: data.category || 'Umum',
        price: data.price,
        avgHpp: 0,
        status: 'active',
      };
      setProducts((prev) => [...prev, newProduct]);
      addAuditLog('PRODUCT_CREATED', newProduct.id, `Created new product ${data.name}`);
      showToast(`Produk master "${data.name}" berhasil ditambahkan!`);
    }

    setEditingProduct(null);
    setActiveModal(null);
  };

  // 7b. Delete Product
  const handleDeleteProduct = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const summary = getProductStockSummary(productId);
    if (summary.total > 0) {
      showToast(`Tidak bisa menghapus "${product.name}" karena masih ada sisa stok (${summary.total} pcs)!`, 'error');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus master produk "${product.name}"?`)) {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      addAuditLog('PRODUCT_DELETED', productId, `Deleted product ${product.name}`);
      showToast(`Master produk "${product.name}" telah dihapus!`);
    }
  };

  // 8a. Save Mitra (Create or Update)
  const handleSaveMitra = (data: {
    id?: string;
    name: string;
    type: string;
    whatsapp: string;
    address: string;
  }) => {
    if (!data.name) {
      showToast('Nama mitra harus diisi!', 'error');
      return;
    }

    if (data.id) {
      setMitras((prev) =>
        prev.map((m) =>
          m.id === data.id
            ? {
                ...m,
                name: data.name,
                type: data.type || 'Warung',
                whatsapp: data.whatsapp || '',
                address: data.address || '',
              }
            : m
        )
      );
      addAuditLog('MITRA_UPDATED', data.id, `Updated mitra ${data.name}`);
      showToast(`Data mitra "${data.name}" berhasil diperbarui!`);
    } else {
      const newMitra: Mitra = {
        id: `M-0${mitras.length + 1}`,
        name: data.name,
        type: data.type || 'Warung',
        whatsapp: data.whatsapp || '',
        address: data.address || '',
        status: 'active',
      };
      setMitras((prev) => [...prev, newMitra]);
      addAuditLog('MITRA_CREATED', newMitra.id, `Created new mitra ${data.name}`);
      showToast(`Mitra "${data.name}" berhasil ditambahkan!`);
    }

    setEditingMitra(null);
    setActiveModal(null);
  };

  // 8b. Delete Mitra
  const handleDeleteMitra = (mitraId: string) => {
    const mitra = mitras.find((m) => m.id === mitraId);
    if (!mitra) return;

    const activeMitraStock = stocks.filter((s) => s.locationType === 'mitra' && s.mitraId === mitraId && s.quantity > 0);
    if (activeMitraStock.length > 0) {
      showToast(`Tidak bisa menghapus "${mitra.name}" karena masih ada stok titipan aktif!`, 'error');
      return;
    }

    if (confirm(`Apakah Anda yakin ingin menghapus master mitra "${mitra.name}"?`)) {
      setMitras((prev) => prev.filter((m) => m.id !== mitraId));
      addAuditLog('MITRA_DELETED', mitraId, `Deleted mitra ${mitra.name}`);
      showToast(`Mitra "${mitra.name}" telah dihapus!`);
    }
  };

  // 9. Factory Hard Reset (100% Data Purge)
  const handleFactoryResetAllData = () => {
    setCashBalance(0);
    setActiveCapital(0);
    setProducts([]);
    setMitras([]);
    setPurchaseBatches([]);
    setStocks([]);
    setTransactions([]);
    setAuditLogs([
      {
        id: `AUD-RESET-${Date.now().toString().slice(-4)}`,
        action: 'FACTORY_RESET_ALL_DATA',
        trxNumber: 'SYS-RESET-100',
        details: '100% Data Hard Reset Completed. System wiped completely clean.',
        createdAt: new Date().toISOString(),
      },
    ]);
    showToast('Seluruh data aplikasi berhasil dihapus 100%! Sistem telah bersih total.', 'success');
    setActiveModal(null);
  };

  // IF PIN IS LOCKED, DISPLAY PIN LOCK SCREEN OVERLAY
  if (!isUnlocked) {
    return <PinLockScreen onUnlockSuccess={handleUnlockSuccess} />;
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 font-sans pb-20 sm:pb-24 select-none relative border-x border-slate-200">
      {/* TOAST NOTIFICATION */}
      <Toast notification={notification} />

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

      {/* MAIN CONTENT AREA WITH HIGH DENSITY RESPONSIVE CONTAINER */}
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
            onOpenCreateProductModal={() => {
              setEditingProduct(null);
              setActiveModal('product');
            }}
            onOpenEditProductModal={(product) => {
              setEditingProduct(product);
              setActiveModal('product');
            }}
            onDeleteProduct={handleDeleteProduct}
            onOpenCreateMitraModal={() => {
              setEditingMitra(null);
              setActiveModal('mitra');
            }}
            onOpenEditMitraModal={(mitra) => {
              setEditingMitra(mitra);
              setActiveModal('mitra');
            }}
            onDeleteMitra={handleDeleteMitra}
          />
        )}
      </main>

      {/* FORM MODAL DIALOGS */}
      <PurchaseModal
        isOpen={activeModal === 'purchase'}
        onClose={() => setActiveModal(null)}
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
        onClose={() => {
          setActiveModal(null);
          setEditingProduct(null);
        }}
        initialData={editingProduct}
        onSubmit={handleSaveProduct}
      />

      <MitraModal
        isOpen={activeModal === 'mitra'}
        onClose={() => {
          setActiveModal(null);
          setEditingMitra(null);
        }}
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
