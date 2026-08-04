export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  avgHpp: number;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface Mitra {
  id: string;
  name: string;
  type: string; // Warung, Kantin, Toko, Reseller
  whatsapp?: string | null;
  address?: string | null;
  customPrices?: Record<string, number> | string | null; // { [productId]: price }
  status: 'active' | 'inactive';
  createdAt?: string;
  lifetimeOmzet?: number;
  monthlyOmzet?: number;
  todayOmzet?: number;
  totalSoldQty?: number;
}

export interface BatchAllocation {
  mitraId: string | null; // null for Jual di Rumah
  quantity: number;
  pricePerUnit: number;
}

export interface PurchaseBatch {
  id: string;
  batchId: string;
  itemsDescription: string;
  totalCost: number;
  supplier?: string | null;
  status: 'tersedia' | 'habis' | 'pending_production' | 'produced' | 'completed';
  productId?: string | null;
  producedQty: number;
  calculatedHpp: number;
  allocations?: BatchAllocation[] | string | null;
  date?: string;
  createdAt?: string;
}

export interface ProductStock {
  id: string;
  productId: string;
  locationType: 'gudang' | 'mitra';
  mitraId?: string | null;
  quantity: number;
  updatedAt?: string;
}

export interface StockMovement {
  id: string;
  trxNumber: string;
  productId: string;
  type: 'GUDANG_TO_MITRA' | 'MITRA_TO_GUDANG' | 'RETUR' | 'RUSAK' | 'HILANG';
  mitraId?: string | null;
  quantity: number;
  note?: string | null;
  createdAt?: string;
}

export interface Sale {
  id: string;
  trxNumber: string;
  saleType: 'DIRECT' | 'MITRA' | 'CONSIGNMENT';
  transactionType?: 'KONSINYASI' | 'BELI_PUTUS';
  mitraId?: string | null;
  productId: string;
  batchId?: string | null;
  titipQty?: number;
  returnedQty?: number;
  quantity: number; // soldQty
  pricePerUnit: number;
  totalAmount: number;
  hppPerUnit: number;
  recoveredCost?: number; // Cost returned to capital pool
  profit: number;
  paymentMethod: 'CASH' | 'QRIS' | string;
  createdAt?: string;
}

export interface CapitalLog {
  id: string;
  trxNumber: string;
  type?: 'INJECTION' | 'HPP_RECOVERY' | 'BELANJA_EXPENSE' | 'PROFIT_WITHDRAWAL' | 'ADJUSTMENT';
  amount: number;
  note?: string | null;
  createdAt?: string;
}

export interface AuditLog {
  id: string;
  action: string;
  trxNumber?: string | null;
  details: string;
  createdAt?: string;
}

export type PeriodFilter = 'today' | 'month' | 'all';

export interface DashboardStats {
  operatingCapital: number;   // Kas Modal Operasional (Berputar & Terisi Kembali)
  netProfitPool: number;      // Kantong Profit Bersih (Siap Ditarik / Gaji)
  totalGrossOmzet: number;    // Total Omset Kotor
  totalBatchesCount: number;
  totalMitraCount: number;
}


