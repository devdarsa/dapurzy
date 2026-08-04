import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// 1. USER ACCOUNTS (Single Owner Account with PIN Security)
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  pin: text('pin').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. MASTER PRODUK
export const products = sqliteTable('products', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  price: real('price').notNull(),
  avgHpp: real('avg_hpp').default(0).notNull(),
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3. MASTER MITRA KONSINYASI (with custom prices per product as JSON)
export const mitras = sqliteTable('mitras', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  type: text('type').notNull(), // Warung, Kantin, Toko, Reseller
  whatsapp: text('whatsapp'),
  address: text('address'),
  customPrices: text('custom_prices'), // JSON string: { [productId]: customPrice }
  status: text('status', { enum: ['active', 'inactive'] }).default('active'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 4. BATCH BELANJA & PRODUKSI
export const purchaseBatches = sqliteTable('purchase_batches', {
  id: text('id').primaryKey(),
  batchId: text('batch_id').notNull().unique(), // e.g. BATCH-2026-001
  itemsDescription: text('items_description').notNull(),
  totalCost: real('total_cost').notNull(),
  supplier: text('supplier'),
  // BUG #2 FIX: Sederhanakan enum status ke hanya 2 nilai operasional.
  // Status 'pending_production', 'produced', 'completed' adalah legacy dan tidak digunakan.
  // Normalisasi ke 'tersedia'/'habis' dilakukan di sync route dan mapBatch().
  status: text('status', { enum: ['tersedia', 'habis'] }).default('tersedia').notNull(),
  productId: text('product_id').references(() => products.id),
  producedQty: integer('produced_qty').default(0).notNull(),
  calculatedHpp: real('calculated_hpp').default(0).notNull(),
  allocations: text('allocations'), // JSON string: [{ mitraId: string | null, quantity: number, pricePerUnit: number }]
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 5. STOK PRODUK (LEGACY SUPPORT / MINIMAL LEDGER)
export const productStocks = sqliteTable('product_stocks', {
  id: text('id').primaryKey(),
  productId: text('productId').references(() => products.id).notNull(),
  locationType: text('location_type', { enum: ['gudang', 'mitra'] }).notNull(),
  mitraId: text('mitra_id').references(() => mitras.id),
  quantity: integer('quantity').default(0).notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// 6. PERGERAKAN STOK / KONSINYASI (LEGACY AUDIT)
export const stockMovements = sqliteTable('stock_movements', {
  id: text('id').primaryKey(),
  trxNumber: text('trx_number').notNull().unique(),
  productId: text('product_id').references(() => products.id).notNull(),
  type: text('type', { 
    enum: ['GUDANG_TO_MITRA', 'MITRA_TO_GUDANG', 'RETUR', 'RUSAK', 'HILANG'] 
  }).notNull(),
  mitraId: text('mitra_id').references(() => mitras.id),
  quantity: integer('quantity').notNull(),
  note: text('note'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 7. REKAP SETORAN MITRA & PENJUALAN
export const sales = sqliteTable('sales', {
  id: text('id').primaryKey(),
  trxNumber: text('trx_number').notNull().unique(),
  saleType: text('sale_type', { enum: ['DIRECT', 'MITRA'] }).notNull(),
  mitraId: text('mitra_id').references(() => mitras.id),
  productId: text('product_id').references(() => products.id).notNull(),
  batchId: text('batch_id'),
  titipQty: integer('titip_qty').default(0).notNull(),
  returnedQty: integer('returned_qty').default(0).notNull(),
  quantity: integer('quantity').notNull(), // soldQty
  pricePerUnit: real('price_per_unit').notNull(),
  totalAmount: real('total_amount').notNull(),
  hppPerUnit: real('hpp_per_unit').notNull(),
  recoveredCost: real('recovered_cost').default(0).notNull(), // HPP x soldQty -> back to Capital
  profit: real('profit').notNull(),
  paymentMethod: text('payment_method').default('CASH').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 8. LOG MODAL & AUDIT TRAIL
export const capitalLogs = sqliteTable('capital_logs', {
  id: text('id').primaryKey(),
  trxNumber: text('trx_number').notNull().unique(),
  // BUG #7 FIX: 'PROFIT_WITHDRAWAL' adalah nama kanonik (bukan 'WITHDRAWAL').
  // Backend capital/route.ts menormalisasi alias 'WITHDRAWAL' → 'PROFIT_WITHDRAWAL'.
  type: text('type', { enum: ['INJECTION', 'HPP_RECOVERY', 'BELANJA_EXPENSE', 'PROFIT_WITHDRAWAL', 'ADJUSTMENT'] }).default('INJECTION').notNull(),
  amount: real('amount').notNull(),
  note: text('note'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const auditLogs = sqliteTable('audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  trxNumber: text('trx_number'),
  details: text('details').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

