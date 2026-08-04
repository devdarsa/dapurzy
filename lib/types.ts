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
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface PurchaseBatch {
  id: string;
  batchId: string;
  itemsDescription: string;
  totalCost: number;
  supplier?: string | null;
  status: 'pending_production' | 'produced';
  productId?: string | null;
  producedQty: number;
  calculatedHpp: number;
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
  saleType: 'DIRECT' | 'MITRA';
  mitraId?: string | null;
  productId: string;
  quantity: number;
  pricePerUnit: number;
  totalAmount: number;
  hppPerUnit: number;
  profit: number;
  paymentMethod: 'CASH' | 'QRIS' | string;
  createdAt?: string;
}

export interface CapitalLog {
  id: string;
  trxNumber: string;
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

export interface DashboardStats {
  cashBalance: number;
  activeCapital: number;
  stockValuation: number;
  todayOmzet: number;
  todayNetProfit: number;
  todayProcurementCost: number;
  pendingBatchesCount: number;
}
