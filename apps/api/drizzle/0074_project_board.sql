CREATE TABLE "project_board" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"scene" jsonb NOT NULL,
	"version" integer DEFAULT 1 NOT NULL,
	"updated_by" text,
	"created_at" timestamp DEFAULT (now() AT TIME ZONE 'utc') NOT NULL,
	"updated_at" timestamp DEFAULT (now() AT TIME ZONE 'utc') NOT NULL,
	CONSTRAINT "project_board_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_project_id_project_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."project"("id") ON DELETE cascade ON UPDATE cascade;--> statement-breakpoint
ALTER TABLE "project_board" ADD CONSTRAINT "project_board_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE cascade;