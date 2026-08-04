-- RESET SEMUA TABEL D1 & RE-CREATE SKEMA TERBARU (ULTRA-LEAN DAPURZY)

DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS product_stocks;
DROP TABLE IF EXISTS purchase_items;
DROP TABLE IF EXISTS purchase_batches;
DROP TABLE IF EXISTS capital_logs;
DROP TABLE IF EXISTS audit_logs;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS mitras;
DROP TABLE IF EXISTS users;

-- 1. USERS ACCOUNTS
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`pin` text DEFAULT '250420' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);

-- 2. MASTER PRODUK
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`avg_hpp` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

-- 3. MASTER MITRA KONSINYASI (With Custom Prices)
CREATE TABLE `mitras` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`whatsapp` text,
	`address` text,
	`custom_prices` text,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

-- 4. BATCH BELANJA & PRODUKSI
CREATE TABLE `purchase_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`items_description` text NOT NULL,
	`total_cost` real NOT NULL,
	`supplier` text,
	`status` text DEFAULT 'produced' NOT NULL,
	`product_id` text,
	`produced_qty` integer DEFAULT 0 NOT NULL,
	`calculated_hpp` real DEFAULT 0 NOT NULL,
	`allocations` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `purchase_batches_batch_id_unique` ON `purchase_batches` (`batch_id`);

-- 5. STOK PRODUK (LEGACY SUPPORT)
CREATE TABLE `product_stocks` (
	`id` text PRIMARY KEY NOT NULL,
	`productId` text NOT NULL,
	`location_type` text NOT NULL,
	`mitra_id` text,
	`quantity` integer DEFAULT 0 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action
);

-- 6. PERGERAKAN STOK (LEGACY AUDIT)
CREATE TABLE `stock_movements` (
	`id` text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`product_id` text NOT NULL,
	`type` text NOT NULL,
	`mitra_id` text,
	`quantity` integer NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `stock_movements_trx_number_unique` ON `stock_movements` (`trx_number`);

-- 7. REKAP SETORAN MITRA & PENJUALAN
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`sale_type` text NOT NULL,
	`mitra_id` text,
	`product_id` text NOT NULL,
	`batch_id` text,
	`titip_qty` integer DEFAULT 0 NOT NULL,
	`returned_qty` integer DEFAULT 0 NOT NULL,
	`quantity` integer NOT NULL,
	`price_per_unit` real NOT NULL,
	`total_amount` real NOT NULL,
	`hpp_per_unit` real NOT NULL,
	`recovered_cost` real DEFAULT 0 NOT NULL,
	`profit` real NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
CREATE UNIQUE INDEX `sales_trx_number_unique` ON `sales` (`trx_number`);

-- 8. LOG MODAL & AUDIT TRAIL
CREATE TABLE `capital_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`type` text DEFAULT 'INJECTION' NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX `capital_logs_trx_number_unique` ON `capital_logs` (`trx_number`);

CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`trx_number` text,
	`details` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

-- INITIAL SEED DATA
INSERT INTO users (id, username, password_hash, pin) VALUES ('usr-owner', 'owner', 'hash-default', '250420');
INSERT INTO audit_logs (id, action, trx_number, details) VALUES ('AUD-INIT-001', 'FULL_RESET_AND_SCHEMA_UPDATE', 'SYS-INIT', 'Database D1 di-reset dan diperbarui ke skema terbaru Ultra-Lean');
