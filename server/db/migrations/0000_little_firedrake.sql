CREATE TABLE IF NOT EXISTS "business_expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"payment_method" varchar(50) NOT NULL,
	"vendor" varchar(255),
	"receipt_notes" text,
	"expense_date" timestamp DEFAULT now() NOT NULL,
	"added_by" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "customers" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"phone" varchar(20) NOT NULL,
	"email" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "customers_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "daily_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"date" timestamp NOT NULL,
	"total_revenue" numeric(10, 2) DEFAULT '0',
	"total_expenses" numeric(10, 2) DEFAULT '0',
	"orders_count" integer DEFAULT 0,
	"payments_count" integer DEFAULT 0,
	"cash_total" numeric(10, 2) DEFAULT '0',
	"card_total" numeric(10, 2) DEFAULT '0',
	"mobile_total" numeric(10, 2) DEFAULT '0',
	"check_total" numeric(10, 2) DEFAULT '0',
	"closed_by" varchar(100),
	"closed_at" timestamp,
	"is_manual_close" boolean DEFAULT false,
	"notes" text,
	CONSTRAINT "daily_summaries_date_unique" UNIQUE("date")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employees" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"role" varchar(100) NOT NULL,
	"phone" varchar(20),
	"email" varchar(255),
	"is_active" boolean DEFAULT true,
	"hire_date" timestamp DEFAULT now(),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "financial_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"report_type" varchar(50) NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"total_revenue" numeric(10, 2) DEFAULT '0',
	"total_expenses" numeric(10, 2) DEFAULT '0',
	"net_profit" numeric(10, 2) DEFAULT '0',
	"orders_count" integer DEFAULT 0,
	"average_order_value" numeric(10, 2) DEFAULT '0',
	"payment_breakdown" json,
	"expense_breakdown" json,
	"generated_at" timestamp DEFAULT now() NOT NULL,
	"generated_by" varchar(100)
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "inventory" (
	"id" serial PRIMARY KEY NOT NULL,
	"brand" varchar(100) NOT NULL,
	"product_line" varchar(100) NOT NULL,
	"model" varchar(255) NOT NULL,
	"part_type" varchar(100) NOT NULL,
	"quantity" integer DEFAULT 0,
	"unit_cost" numeric(10, 2),
	"selling_price" numeric(10, 2),
	"low_stock_threshold" integer DEFAULT 5,
	"supplier" varchar(255),
	"sku" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payments" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"method" varchar(50) NOT NULL,
	"transaction_id" varchar(255),
	"processor_fee" numeric(10, 2) DEFAULT '0',
	"notes" text,
	"processed_by" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "pos_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" varchar(20) NOT NULL,
	"customer_id" integer NOT NULL,
	"repair_request_id" integer,
	"device_brand" varchar(100) NOT NULL,
	"device_model" varchar(255) NOT NULL,
	"issue_description" text NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"case_price" numeric(10, 2) DEFAULT '0',
	"screen_protector_price" numeric(10, 2) DEFAULT '0',
	"credit_card_fee" numeric(10, 2) DEFAULT '0',
	"tax_amount" numeric(10, 2) DEFAULT '0',
	"total_amount" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0',
	"current_stage" varchar(50) DEFAULT 'received',
	"assigned_technician" varchar(100),
	"estimated_completion" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pos_orders_order_id_unique" UNIQUE("order_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "repair_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"customer_id" integer NOT NULL,
	"device_brand" varchar(100) NOT NULL,
	"device_model" varchar(255) NOT NULL,
	"issue_description" text NOT NULL,
	"quoted_price" numeric(10, 2) NOT NULL,
	"has_google_review" boolean DEFAULT false,
	"want_case" boolean DEFAULT false,
	"want_screen_protector" boolean DEFAULT false,
	"terms_accepted" boolean DEFAULT false,
	"status" varchar(50) DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "sessions" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"user_id" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"data" json
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "workflow_stages" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"stage" varchar(50) NOT NULL,
	"assigned_employee" varchar(100),
	"notes" text,
	"estimated_completion" timestamp,
	"sms_notification_sent" boolean DEFAULT false,
	"email_notification_sent" boolean DEFAULT false,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"duration_minutes" integer
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payments" ADD CONSTRAINT "payments_order_id_pos_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "pos_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pos_orders" ADD CONSTRAINT "pos_orders_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "pos_orders" ADD CONSTRAINT "pos_orders_repair_request_id_repair_requests_id_fk" FOREIGN KEY ("repair_request_id") REFERENCES "repair_requests"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "repair_requests" ADD CONSTRAINT "repair_requests_customer_id_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "workflow_stages" ADD CONSTRAINT "workflow_stages_order_id_pos_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "pos_orders"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
