CREATE TABLE `audit_logs` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned NOT NULL,
	`store_id` int unsigned NOT NULL,
	`action` varchar(80) NOT NULL,
	`entity` varchar(80) NOT NULL,
	`entity_id` int unsigned NOT NULL,
	`before_data` json,
	`after_data` json,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `audit_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cables` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`code` varchar(50) NOT NULL,
	`internal_code` int unsigned NOT NULL,
	`name` varchar(255) NOT NULL,
	`brand` varchar(120) NOT NULL,
	`color` varchar(80) NOT NULL,
	`mm` decimal(8,2) NOT NULL,
	`type` varchar(120) NOT NULL,
	`price_per_meter` decimal(10,2) NOT NULL,
	`store_id` int unsigned,
	`image_url` varchar(500),
	`is_active` boolean NOT NULL DEFAULT true,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cables_id` PRIMARY KEY(`id`),
	CONSTRAINT `cables_internal_code_unique` UNIQUE(`internal_code`),
	CONSTRAINT `cables_brand_color_mm_store_unique` UNIQUE(`brand`,`color`,`mm`,`store_id`),
	CONSTRAINT `cables_internal_code_range_check` CHECK(`cables`.`internal_code` between 0 and 999999),
	CONSTRAINT `cables_mm_positive_check` CHECK(`cables`.`mm` > 0),
	CONSTRAINT `cables_price_per_meter_positive_check` CHECK(`cables`.`price_per_meter` >= 0)
);
--> statement-breakpoint
CREATE TABLE `labels` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`cable_id` int unsigned NOT NULL,
	`cable_name_snapshot` varchar(255) NOT NULL,
	`internal_code_snapshot` int unsigned NOT NULL,
	`price_per_meter_snapshot` decimal(10,2) NOT NULL,
	`meters` decimal(10,2) NOT NULL,
	`total_price` decimal(12,2) NOT NULL,
	`barcode` varchar(120) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`user_id` int unsigned NOT NULL,
	`store_id` int unsigned NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `labels_id` PRIMARY KEY(`id`),
	CONSTRAINT `labels_barcode_unique` UNIQUE(`barcode`),
	CONSTRAINT `labels_meters_positive_check` CHECK(`labels`.`meters` > 0),
	CONSTRAINT `labels_total_price_positive_check` CHECK(`labels`.`total_price` >= 0)
);
--> statement-breakpoint
CREATE TABLE `refresh_tokens` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`user_id` int unsigned NOT NULL,
	`token` varchar(512) NOT NULL,
	`expires_at` timestamp NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `refresh_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `refresh_tokens_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `stores` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`address` varchar(255) NOT NULL,
	`neighborhood` varchar(120) NOT NULL,
	`number` varchar(30) NOT NULL,
	`city` varchar(120) NOT NULL,
	`state` varchar(2) NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `stores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` int unsigned AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(255) NOT NULL,
	`password_hash` varchar(255) NOT NULL,
	`role` enum('ADMIN','SELLER') NOT NULL,
	`store_id` int unsigned NOT NULL,
	`is_active` boolean NOT NULL DEFAULT true,
	`deleted_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `cables` ADD CONSTRAINT `cables_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `labels` ADD CONSTRAINT `labels_cable_id_cables_id_fk` FOREIGN KEY (`cable_id`) REFERENCES `cables`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `labels` ADD CONSTRAINT `labels_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `labels` ADD CONSTRAINT `labels_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_store_id_stores_id_fk` FOREIGN KEY (`store_id`) REFERENCES `stores`(`id`) ON DELETE restrict ON UPDATE cascade;--> statement-breakpoint
CREATE INDEX `audit_logs_user_id_idx` ON `audit_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_store_id_idx` ON `audit_logs` (`store_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_entity_idx` ON `audit_logs` (`entity`,`entity_id`);--> statement-breakpoint
CREATE INDEX `audit_logs_created_at_idx` ON `audit_logs` (`created_at`);--> statement-breakpoint
CREATE INDEX `cables_code_idx` ON `cables` (`code`);--> statement-breakpoint
CREATE INDEX `cables_store_id_idx` ON `cables` (`store_id`);--> statement-breakpoint
CREATE INDEX `cables_is_active_idx` ON `cables` (`is_active`);--> statement-breakpoint
CREATE INDEX `cables_deleted_at_idx` ON `cables` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `labels_cable_id_idx` ON `labels` (`cable_id`);--> statement-breakpoint
CREATE INDEX `labels_user_id_idx` ON `labels` (`user_id`);--> statement-breakpoint
CREATE INDEX `labels_store_id_idx` ON `labels` (`store_id`);--> statement-breakpoint
CREATE INDEX `labels_expires_at_idx` ON `labels` (`expires_at`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_user_id_idx` ON `refresh_tokens` (`user_id`);--> statement-breakpoint
CREATE INDEX `refresh_tokens_expires_at_idx` ON `refresh_tokens` (`expires_at`);--> statement-breakpoint
CREATE INDEX `stores_is_active_idx` ON `stores` (`is_active`);--> statement-breakpoint
CREATE INDEX `stores_deleted_at_idx` ON `stores` (`deleted_at`);--> statement-breakpoint
CREATE INDEX `users_store_id_idx` ON `users` (`store_id`);--> statement-breakpoint
CREATE INDEX `users_role_idx` ON `users` (`role`);--> statement-breakpoint
CREATE INDEX `users_is_active_idx` ON `users` (`is_active`);--> statement-breakpoint
CREATE INDEX `users_deleted_at_idx` ON `users` (`deleted_at`);