CREATE TABLE "ledger_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"yaml" text NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ledger_documents_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
ALTER TABLE "projects" ADD COLUMN "ledger_file_path" text;--> statement-breakpoint
ALTER TABLE "ledger_documents" ADD CONSTRAINT "ledger_documents_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_storage_check" CHECK ("projects"."storage" in ('git', 'file', 'db'));