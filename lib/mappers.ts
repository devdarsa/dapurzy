import { Product, Mitra, PurchaseBatch, Sale } from '@/lib/types';

export function mapProduct(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category || 'Umum',
    price: Number(r.price) || 0,
    avgHpp: Number(r.avg_hpp ?? r.avgHpp ?? 0),
    status: r.status ?? 'active',
  };
}

export function mapMitra(r: any): Mitra {
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

export function mapBatch(r: any): PurchaseBatch {
  let allocations = [];
  if (r.allocations) {
    try {
      allocations = typeof r.allocations === 'string' ? JSON.parse(r.allocations) : r.allocations;
    } catch (e) {
      allocations = [];
    }
  }
  let status: 'tersedia' | 'habis' = r.status === 'produced' || r.status === 'completed' || r.status === 'habis' ? 'habis' : 'tersedia';

  return {
    id: r.id,
    batchId: r.batch_id ?? r.batchId,
    date: r.created_at ?? r.date ?? new Date().toISOString(),
    itemsDescription: r.items_description ?? r.itemsDescription ?? '',
    totalCost: Number(r.total_cost ?? r.totalCost ?? 0),
    supplier: r.supplier ?? 'Supplier Umum',
    status,
    productId: r.product_id ?? r.productId ?? null,
    producedQty: Number(r.produced_qty ?? r.producedQty ?? 0),
    calculatedHpp: Number(r.calculated_hpp ?? r.calculatedHpp ?? 0),
    allocations,
  };
}

export function mapSale(r: any): Sale {
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
