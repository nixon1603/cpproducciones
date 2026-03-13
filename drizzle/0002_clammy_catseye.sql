ALTER TABLE `events` MODIFY COLUMN `zones` json;--> statement-breakpoint
ALTER TABLE `events` MODIFY COLUMN `days` json;--> statement-breakpoint
ALTER TABLE `purchases` MODIFY COLUMN `selectedDays` json;