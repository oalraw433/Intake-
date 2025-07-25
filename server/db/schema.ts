import { pgTable, serial, varchar, text, timestamp, decimal, integer, boolean, json, uuid } from 'drizzle-orm/pg-core'

// Customers table
export const customers = pgTable('customers', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  phone: varchar('phone', { length: 20 }).notNull().unique(),
  email: varchar('email', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Repair requests (original intake system)
export const repairRequests = pgTable('repair_requests', {
  id: serial('id').primaryKey(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  deviceBrand: varchar('device_brand', { length: 100 }).notNull(),
  deviceModel: varchar('device_model', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  quotedPrice: decimal('quoted_price', { precision: 10, scale: 2 }).notNull(),
  hasGoogleReview: boolean('has_google_review').default(false),
  wantCase: boolean('want_case').default(false),
  wantScreenProtector: boolean('want_screen_protector').default(false),
  termsAccepted: boolean('terms_accepted').default(false),
  status: varchar('status', { length: 50 }).default('pending'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// POS Orders (main order management)
export const posOrders = pgTable('pos_orders', {
  id: serial('id').primaryKey(),
  orderId: varchar('order_id', { length: 20 }).unique().notNull(),
  customerId: integer('customer_id').references(() => customers.id).notNull(),
  repairRequestId: integer('repair_request_id').references(() => repairRequests.id),
  deviceBrand: varchar('device_brand', { length: 100 }).notNull(),
  deviceModel: varchar('device_model', { length: 255 }).notNull(),
  issueDescription: text('issue_description').notNull(),
  basePrice: decimal('base_price', { precision: 10, scale: 2 }).notNull(),
  casePrice: decimal('case_price', { precision: 10, scale: 2 }).default('0'),
  screenProtectorPrice: decimal('screen_protector_price', { precision: 10, scale: 2 }).default('0'),
  creditCardFee: decimal('credit_card_fee', { precision: 10, scale: 2 }).default('0'),
  taxAmount: decimal('tax_amount', { precision: 10, scale: 2 }).default('0'),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 10, scale: 2 }).default('0'),
  currentStage: varchar('current_stage', { length: 50 }).default('received'),
  assignedTechnician: varchar('assigned_technician', { length: 100 }),
  estimatedCompletion: timestamp('estimated_completion'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Workflow stages tracking
export const workflowStages = pgTable('workflow_stages', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => posOrders.id).notNull(),
  stage: varchar('stage', { length: 50 }).notNull(),
  assignedEmployee: varchar('assigned_employee', { length: 100 }),
  notes: text('notes'),
  estimatedCompletion: timestamp('estimated_completion'),
  smsNotificationSent: boolean('sms_notification_sent').default(false),
  emailNotificationSent: boolean('email_notification_sent').default(false),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  completedAt: timestamp('completed_at'),
  duration: integer('duration_minutes'),
})

// Payments tracking
export const payments = pgTable('payments', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').references(() => posOrders.id).notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  method: varchar('method', { length: 50 }).notNull(), // cash, card, mobile, check
  transactionId: varchar('transaction_id', { length: 255 }),
  processorFee: decimal('processor_fee', { precision: 10, scale: 2 }).default('0'),
  notes: text('notes'),
  processedBy: varchar('processed_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Inventory management
export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  brand: varchar('brand', { length: 100 }).notNull(),
  productLine: varchar('product_line', { length: 100 }).notNull(), // iPhone, iPad, etc.
  model: varchar('model', { length: 255 }).notNull(),
  partType: varchar('part_type', { length: 100 }).notNull(), // screen, battery, etc.
  quantity: integer('quantity').default(0),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }),
  sellingPrice: decimal('selling_price', { precision: 10, scale: 2 }),
  lowStockThreshold: integer('low_stock_threshold').default(5),
  supplier: varchar('supplier', { length: 255 }),
  sku: varchar('sku', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

// Employees
export const employees = pgTable('employees', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  role: varchar('role', { length: 100 }).notNull(),
  phone: varchar('phone', { length: 20 }),
  email: varchar('email', { length: 255 }),
  isActive: boolean('is_active').default(true),
  hireDate: timestamp('hire_date').defaultNow(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Daily summaries
export const dailySummaries = pgTable('daily_summaries', {
  id: serial('id').primaryKey(),
  date: timestamp('date').notNull().unique(),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  totalExpenses: decimal('total_expenses', { precision: 10, scale: 2 }).default('0'),
  ordersCount: integer('orders_count').default(0),
  paymentsCount: integer('payments_count').default(0),
  cashTotal: decimal('cash_total', { precision: 10, scale: 2 }).default('0'),
  cardTotal: decimal('card_total', { precision: 10, scale: 2 }).default('0'),
  mobileTotal: decimal('mobile_total', { precision: 10, scale: 2 }).default('0'),
  checkTotal: decimal('check_total', { precision: 10, scale: 2 }).default('0'),
  closedBy: varchar('closed_by', { length: 100 }),
  closedAt: timestamp('closed_at'),
  isManualClose: boolean('is_manual_close').default(false),
  notes: text('notes'),
})

// Business expenses
export const businessExpenses = pgTable('business_expenses', {
  id: serial('id').primaryKey(),
  category: varchar('category', { length: 100 }).notNull(), // Office Supplies, Equipment, etc.
  description: text('description').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod: varchar('payment_method', { length: 50 }).notNull(),
  vendor: varchar('vendor', { length: 255 }),
  receiptNotes: text('receipt_notes'),
  expenseDate: timestamp('expense_date').defaultNow().notNull(),
  addedBy: varchar('added_by', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Financial reports
export const financialReports = pgTable('financial_reports', {
  id: serial('id').primaryKey(),
  reportType: varchar('report_type', { length: 50 }).notNull(), // daily, weekly, monthly, yearly
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  totalRevenue: decimal('total_revenue', { precision: 10, scale: 2 }).default('0'),
  totalExpenses: decimal('total_expenses', { precision: 10, scale: 2 }).default('0'),
  netProfit: decimal('net_profit', { precision: 10, scale: 2 }).default('0'),
  ordersCount: integer('orders_count').default(0),
  averageOrderValue: decimal('average_order_value', { precision: 10, scale: 2 }).default('0'),
  paymentBreakdown: json('payment_breakdown'), // JSON object with payment method totals
  expenseBreakdown: json('expense_breakdown'), // JSON object with expense category totals
  generatedAt: timestamp('generated_at').defaultNow().notNull(),
  generatedBy: varchar('generated_by', { length: 100 }),
})

// Sessions for authentication
export const sessions = pgTable('sessions', {
  id: varchar('id', { length: 255 }).primaryKey(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  data: json('data'),
})

// Export types
export type Customer = typeof customers.$inferSelect
export type NewCustomer = typeof customers.$inferInsert
export type RepairRequest = typeof repairRequests.$inferSelect
export type NewRepairRequest = typeof repairRequests.$inferInsert
export type PosOrder = typeof posOrders.$inferSelect
export type NewPosOrder = typeof posOrders.$inferInsert
export type WorkflowStage = typeof workflowStages.$inferSelect
export type NewWorkflowStage = typeof workflowStages.$inferInsert
export type Payment = typeof payments.$inferSelect
export type NewPayment = typeof payments.$inferInsert
export type InventoryItem = typeof inventory.$inferSelect
export type NewInventoryItem = typeof inventory.$inferInsert
export type Employee = typeof employees.$inferSelect
export type NewEmployee = typeof employees.$inferInsert
export type DailySummary = typeof dailySummaries.$inferSelect
export type NewDailySummary = typeof dailySummaries.$inferInsert
export type BusinessExpense = typeof businessExpenses.$inferSelect
export type NewBusinessExpense = typeof businessExpenses.$inferInsert
export type FinancialReport = typeof financialReports.$inferSelect
export type NewFinancialReport = typeof financialReports.$inferInsert