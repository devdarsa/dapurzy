CREATE TABLE `audit_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`action` text NOT NULL,
	`trx_number` text,
	`details` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `capital_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`amount` real NOT NULL,
	`note` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `capital_logs_trx_number_unique` ON `capital_logs` (`trx_number`);--> statement-breakpoint
CREATE TABLE `mitras` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`whatsapp` text,
	`address` text,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`category` text NOT NULL,
	`price` real NOT NULL,
	`avg_hpp` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'active',
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `purchase_batches` (
	`id` text PRIMARY KEY NOT NULL,
	`batch_id` text NOT NULL,
	`items_description` text NOT NULL,
	`total_cost` real NOT NULL,
	`supplier` text,
	`status` text DEFAULT 'pending_production' NOT NULL,
	`product_id` text,
	`produced_qty` integer DEFAULT 0 NOT NULL,
	`calculated_hpp` real DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchase_batches_batch_id_unique` ON `purchase_batches` (`batch_id`);--> statement-breakpoint
CREATE TABLE `sales` (
	`id` text PRIMARY KEY NOT NULL,
	`trx_number` text NOT NULL,
	`sale_type` text NOT NULL,
	`mitra_id` text,
	`product_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`price_per_unit` real NOT NULL,
	`total_amount` real NOT NULL,
	`hpp_per_unit` real NOT NULL,
	`profit` real NOT NULL,
	`payment_method` text DEFAULT 'CASH' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY (`mitra_id`) REFERENCES `mitras`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `sales_trx_number_unique` ON `sales` (`trx_number`);--> statement-breakpoint
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
--> statement-breakpoint
CREATE UNIQUE INDEX `stock_movements_trx_number_unique` ON `stock_movements` (`trx_number`);--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`username` text NOT NULL,
	`password_hash` text NOT NULL,
	`pin` text DEFAULT '250420' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);