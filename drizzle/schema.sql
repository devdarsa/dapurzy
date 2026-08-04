-- ============================================================
-- DAPURZY ULTRA-LEAN — MASTER SCHEMA SQL
-- Satu file untuk deploy ulang / reset database D1 dari awal.
-- Jalankan seluruh file ini sekali lewat Wrangler D1 console:
--   npx wrangler d1 execute <DB_NAME> --file=drizzle/schema.sql
-- ============================================================

-- ────────────────────────────────────────────────────────────
-- STEP 1: DROP SEMUA TABEL (urutan aman karena FK)
-- ────────────────────────────────────────────────────────────
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS product_stocks;
DROP TABLE IF EXISTS purchase_items;
DROP TABLE IF EXISTS purchase_batches;
DROP TABLE IF EXISTS raw_material_history;
DROP TABLE IF EXISTS capital_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS mitras;
DROP TABLE IF EXISTS users;

-- ────────────────────────────────────────────────────────────
-- STEP 2: CREATE TABEL MASTER
-- ────────────────────────────────────────────────────────────

-- 1. USERS (PIN Security)
CREATE TABLE `users` (
	`id`            text PRIMARY KEY NOT NULL,
	`username`      text NOT NULL,
	`password_hash` text NOT NULL,
	`pin`           text DEFAULT '090301' NOT NULL,
	`created_at`    text DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);

-- 2. MASTER PRODUK
CREATE TABLE `products` (
	`id`         text PRIMARY KEY NOT NULL,
	`name`       text NOT NULL,
	`category`   text NOT NULL,
	`price`      real NOT NULL,
	`avg_hpp`    real DEFAULT 0 NOT NULL,
	`status`     text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

-- 3. MASTER MITRA KONSINYASI
--    custom_prices: JSON object { [productId]: hargaKhusus }
CREATE TABLE `mitras` (
	`id`            text PRIMARY KEY NOT NULL,
	`name`          text NOT NULL,
	`type`          text NOT NULL,
	`whatsapp`      text,
	`address`       text,
	`custom_prices` text,
	`status`        text DEFAULT 'active',
	`created_at`    text DEFAULT CURRENT_TIMESTAMP
);

-- 4. BATCH BELANJA & PRODUKSI
--    status: 'tersedia' = sudah dibeli belum diolah | 'habis' = sudah diolah jadi produk jadi
--    allocations: JSON array distribusi produk ke mitra setelah produksi
CREATE TABLE `purchase_batches` (
	`id`              text PRIMARY KEY NOT NULL,
	`batch_id`        text NOT NULL,
	`items_description` text NOT NULL,
	`total_cost`      real NOT NULL,
	`supplier`        text,
	`status`          text DEFAULT 'tersedia' NOT NULL,
	`product_id`      text,
	`produced_qty`    integer DEFAULT 0 NOT NULL,
	`calculated_hpp`  real DEFAULT 0 NOT NULL,
	`allocations`     text,
	`created_at`      text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `purchase_batches_batch_id_unique` ON `purchase_batches` (`batch_id`);

-- 5. RINCIAN ITEM PER BATCH (opsional, untuk detail breakdown bahan)
CREATE TABLE IF NOT EXISTS `purchase_items` (
	`id`            text PRIMARY KEY NOT NULL,
	`batch_id`      text NOT NULL,
	`name`          text NOT NULL,
	`qty`           real NOT NULL,
	`unit`          text NOT NULL DEFAULT 'kg',
	`price_per_unit` real NOT NULL DEFAULT 0,
	`total`         real NOT NULL DEFAULT 0,
	`created_at`    text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`batch_id`) REFERENCES `purchase_batches`(`batch_id`) ON UPDATE no action ON DELETE cascade
);
CREATE INDEX IF NOT EXISTS `purchase_items_batch_idx` ON `purchase_items` (`batch_id`);

-- 6. HISTORI BAHAN BAKU (untuk auto-suggest belanja berikutnya)
CREATE TABLE IF NOT EXISTS `raw_material_history` (
	`id`         text PRIMARY KEY NOT NULL,
	`name`       text NOT NULL,
	`unit`       text NOT NULL DEFAULT 'kg',
	`last_price` real DEFAULT 0 NOT NULL,
	`buy_count`  integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS `raw_material_history_name_unique` ON `raw_material_history` (`name`);

-- 7. STOK PRODUK JADI
--    location_type: 'gudang' = stok di tempat produksi | 'mitra' = stok yang sudah dititipkan
CREATE TABLE `product_stocks` (
	`id`            text PRIMARY KEY NOT NULL,
	`productId`     text NOT NULL,
	`location_type` text NOT NULL,
	`mitra_id`      text,
	`quantity`      integer DEFAULT 0 NOT NULL,
	`updated_at`    text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action
);

-- 8. PERGERAKAN STOK (audit trail ambil mitra, retur, dll)
CREATE TABLE `stock_movements` (
	`id`         text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`product_id` text NOT NULL,
	`type`       text NOT NULL,
	`mitra_id`   text,
	`quantity`   integer NOT NULL,
	`note`       text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `stock_movements_trx_number_unique` ON `stock_movements` (`trx_number`);

-- 9. REKAP PENJUALAN & SETORAN MITRA
--    sale_type: 'CONSIGNMENT' | 'MITRA' | 'DIRECT' | 'HOME_SALES'
--    recovered_cost: HPP yang kembali ke Kas Modal dari setoran
CREATE TABLE `sales` (
	`id`             text PRIMARY KEY NOT NULL,
	`trx_number`     text NOT NULL,
	`sale_type`      text NOT NULL,
	`mitra_id`       text,
	`product_id`     text NOT NULL,
	`batch_id`       text,
	`titip_qty`      integer DEFAULT 0 NOT NULL,
	`returned_qty`   integer DEFAULT 0 NOT NULL,
	`quantity`       integer NOT NULL,
	`price_per_unit` real NOT NULL,
	`total_amount`   real NOT NULL,
	`hpp_per_unit`   real NOT NULL,
	`recovered_cost` real DEFAULT 0 NOT NULL,
	`profit`         real NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`created_at`     text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `sales_trx_number_unique` ON `sales` (`trx_number`);

-- 10. LOG MODAL USAHA
--     type: 'INJECTION' | 'PROFIT_WITHDRAWAL' | 'BELANJA_EXPENSE'
CREATE TABLE `capital_logs` (
	`id`         text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`type`       text DEFAULT 'INJECTION' NOT NULL,
	`amount`     real NOT NULL,
	`note`       text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `capital_logs_trx_number_unique` ON `capital_logs` (`trx_number`);

-- 11. AUDIT TRAIL APLIKASI
CREATE TABLE `audit_logs` (
	`id`         text PRIMARY KEY NOT NULL,
	`action`     text NOT NULL,
	`trx_number` text,
	`details`    text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

-- ────────────────────────────────────────────────────────────
-- STEP 3: SEED DATA AWAL
-- ────────────────────────────────────────────────────────────

-- User default owner (PIN default: 090301)
INSERT INTO users (id, username, password_hash, pin)
VALUES ('USR-001', 'owner', 'hash-default', '090301');

-- Audit log initial deployment
INSERT INTO audit_logs (id, action, trx_number, details)
VALUES (
	'AUD-INIT-001',
	'SCHEMA_DEPLOY',
	'SYS-INIT',
	'Database D1 deployed dari master schema — DAPURZY Ultra-Lean v1.0'
);
