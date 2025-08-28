CREATE TABLE "notes" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"screenshot_id" varchar NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "screenshots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"image_path" text NOT NULL,
	"trade_type" text,
	"bias" text,
	"setup_pattern" text,
	"entry" text,
	"study_bucket" text,
	"strategy_type" text,
	"session_timing" text,
	"currency_pair" text,
	"result" text,
	"risk_reward" text,
	"tags" text[] DEFAULT '{}',
	"metadata" jsonb,
	"uploaded_at" timestamp DEFAULT now(),
	"is_bookmarked" boolean DEFAULT false
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" text NOT NULL,
	"password" text NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "notes" ADD CONSTRAINT "notes_screenshot_id_screenshots_id_fk" FOREIGN KEY ("screenshot_id") REFERENCES "public"."screenshots"("id") ON DELETE no action ON UPDATE no action;