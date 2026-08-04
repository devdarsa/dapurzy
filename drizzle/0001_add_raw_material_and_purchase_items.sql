-- Tabel raw_material_history untuk menyimpan riwayat bahan baku yang pernah dibeli
-- Digunakan sebagai auto-suggest pada Form Belanja Bahan Baku
CREATE TABLE IF NOT EXISTS `raw_material_history` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`unit` text NOT NULL DEFAULT 'kg',
	`last_price` real DEFAULT 0 NOT NULL,
	`buy_count` integer DEFAULT 1 NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `raw_material_history_name_unique` ON `raw_material_history` (`name`);

-- Tabel purchase_items untuk menyimpan rincian item per batch belanja
CREATE TABLE IF NOT EXISTS `purchase_items` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`name` text NOT NULL,
	`qty` real NOT NULL,
	`unit` text NOT NULL DEFAULT 'kg',
	`price_per_unit` real NOT NULL DEFAULT 0,
	`total` real NOT NULL DEFAULT 0,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`batch_id`) REFERENCES `purchase_batches`(`batch_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `purchase_items_batch_idx` ON `purchase_items` (`batch_id`);
