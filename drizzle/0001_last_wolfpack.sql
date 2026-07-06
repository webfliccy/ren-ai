ALTER TABLE `field_note` ADD `hindsight` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `field_note` ADD `hindsight_added_at` integer;--> statement-breakpoint
ALTER TABLE `posts` ADD `hindsight` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `posts` ADD `hindsight_added_at` integer;