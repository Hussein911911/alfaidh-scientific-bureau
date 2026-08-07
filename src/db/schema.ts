// مخطط قاعدة البيانات - Drizzle ORM
// Alfaidh Scientific Bureau - Database Schema
// PostgreSQL (via PGlite)

import {
  pgTable, text, varchar, integer, decimal, timestamp, boolean,
  pgEnum, uuid, jsonb,
} from 'drizzle-orm/pg-core';
import { relations, sql } from 'drizzle-orm';

// ====================================
// 👥 المستخدمون والرتب
// ====================================

export const userRoleEnum = pgEnum('user_role', [
  'ADMIN',
  'ACCOUNTANT',
  'SALES_MANAGER',
  'ASSISTANT',
  'STOREKEEPER',
  'SCIENTIFIC_REVIEWER',
  'DRIVER',
  'TRIP_COORDINATOR',
  'VIEWER',
]);

export const userStatusEnum = pgEnum('user_status', [
  'ACTIVE', 'INACTIVE', 'SUSPENDED',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  username: varchar('username', { length: 100 }).notNull().unique(),
  password: text('password').notNull(),
  fullName: varchar('full_name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  role: userRoleEnum('role').notNull().default('VIEWER'),
  status: userStatusEnum('status').notNull().default('ACTIVE'),
  avatar: text('avatar'),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: varchar('action', { length: 100 }).notNull(),
  details: text('details'),
  ipAddress: varchar('ip_address', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ====================================
// 💊 الأدوية
// ====================================

export const medicineFormEnum = pgEnum('medicine_form', [
  'TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT',
  'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION',
  'SPRAY', 'PATCH', 'OTHER',
]);

export const medicineStatusEnum = pgEnum('medicine_status', [
  'ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'EXPIRED', 'PENDING_REVIEW',
]);

export const categories = pgTable('categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  nameEn: varchar('name_en', { length: 200 }),
  description: text('description'),
  parentId: uuid('parent_id'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const manufacturers = pgTable('manufacturers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  country: varchar('country', { length: 100 }),
  contactInfo: text('contact_info'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const medicines = pgTable('medicines', {
  id: uuid('id').primaryKey().defaultRandom(),
  tradeName: varchar('trade_name', { length: 200 }).notNull(),
  scientificName: varchar('scientific_name', { length: 200 }).notNull(),
  barcode: varchar('barcode', { length: 100 }).unique(),
  form: medicineFormEnum('form').notNull(),
  strength: varchar('strength', { length: 100 }).notNull(),
  packSize: varchar('pack_size', { length: 100 }),

  categoryId: uuid('category_id').references(() => categories.id),
  manufacturerId: uuid('manufacturer_id').references(() => manufacturers.id),

  costPrice: decimal('cost_price', { precision: 10, scale: 2 }).notNull(),
  sellPrice: decimal('sell_price', { precision: 10, scale: 2 }).notNull(),

  description: text('description'),
  dosage: text('dosage'),
  indications: text('indications'),
  contraindications: text('contraindications'),
  sideEffects: text('side_effects'),
  drugInteractions: text('drug_interactions'),
  storage: text('storage'),
  pregnancyCategory: varchar('pregnancy_category', { length: 10 }),

  currentStock: integer('current_stock').notNull().default(0),
  minStock: integer('min_stock').notNull().default(10),
  expiryDate: timestamp('expiry_date'),
  batchNumber: varchar('batch_number', { length: 100 }),

  status: medicineStatusEnum('status').notNull().default('ACTIVE'),
  isScientificallyReviewed: boolean('is_scientifically_reviewed').notNull().default(false),

  createdById: uuid('created_by_id').notNull().references(() => users.id),
  updatedById: uuid('updated_by_id').references(() => users.id),
  reviewedById: uuid('reviewed_by_id').references(() => users.id),
  reviewedAt: timestamp('reviewed_at'),

  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ====================================
// 📦 المخزون
// ====================================

export const stockMovementTypeEnum = pgEnum('stock_movement_type', [
  'PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'EXPIRED', 'DAMAGED',
]);

export const stockMovements = pgTable('stock_movements', {
  id: uuid('id').primaryKey().defaultRandom(),
  medicineId: uuid('medicine_id').notNull().references(() => medicines.id, { onDelete: 'cascade' }),
  type: stockMovementTypeEnum('type').notNull(),
  quantity: integer('quantity').notNull(),
  notes: text('notes'),
  referenceId: varchar('reference_id', { length: 100 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ====================================
// 💰 المبيعات
// ====================================

export const saleStatusEnum = pgEnum('sale_status', [
  'PENDING', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID',
]);

export const paymentMethodEnum = pgEnum('payment_method', [
  'CASH', 'CREDIT', 'BANK_TRANSFER', 'CHECK',
]);

export const customers = pgTable('customers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull(),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 200 }),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const sales = pgTable('sales', {
  id: uuid('id').primaryKey().defaultRandom(),
  invoiceNumber: varchar('invoice_number', { length: 100 }).notNull().unique(),
  customerId: uuid('customer_id').references(() => customers.id),
  customerName: varchar('customer_name', { length: 200 }),
  status: saleStatusEnum('status').notNull().default('PENDING'),
  paymentMethod: paymentMethodEnum('payment_method').notNull().default('CASH'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  tax: decimal('tax', { precision: 10, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const saleItems = pgTable('sale_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').notNull().references(() => sales.id, { onDelete: 'cascade' }),
  medicineId: uuid('medicine_id').notNull().references(() => medicines.id),
  quantity: integer('quantity').notNull(),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  discount: decimal('discount', { precision: 10, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
});

// ====================================
// 🛒 المشتريات
// ====================================

export const purchaseStatusEnum = pgEnum('purchase_status', [
  'PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED',
]);

export const suppliers = pgTable('suppliers', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: varchar('name', { length: 200 }).notNull().unique(),
  contactName: varchar('contact_name', { length: 200 }),
  phone: varchar('phone', { length: 50 }),
  email: varchar('email', { length: 200 }),
  address: text('address'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const purchases = pgTable('purchases', {
  id: uuid('id').primaryKey().defaultRandom(),
  orderNumber: varchar('order_number', { length: 100 }).notNull().unique(),
  supplierId: uuid('supplier_id').notNull().references(() => suppliers.id),
  status: purchaseStatusEnum('status').notNull().default('PENDING'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  notes: text('notes'),
  expectedDate: timestamp('expected_date'),
  receivedDate: timestamp('received_date'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const purchaseItems = pgTable('purchase_items', {
  id: uuid('id').primaryKey().defaultRandom(),
  purchaseId: uuid('purchase_id').notNull().references(() => purchases.id, { onDelete: 'cascade' }),
  medicineId: uuid('medicine_id').notNull().references(() => medicines.id),
  quantity: integer('quantity').notNull(),
  unitCost: decimal('unit_cost', { precision: 10, scale: 2 }).notNull(),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
});

// ====================================
// 💸 المدفوعات والديون
// ====================================

export const payments = pgTable('payments', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').references(() => sales.id),
  purchaseId: uuid('purchase_id').references(() => purchases.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  method: paymentMethodEnum('method').notNull(),
  reference: varchar('reference', { length: 200 }),
  notes: text('notes'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const debtStatusEnum = pgEnum('debt_status', [
  'PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED',
]);

export const debts = pgTable('debts', {
  id: uuid('id').primaryKey().defaultRandom(),
  saleId: uuid('sale_id').unique().references(() => sales.id),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  paidAmount: decimal('paid_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  dueDate: timestamp('due_date'),
  status: debtStatusEnum('status').notNull().default('PENDING'),
  notes: text('notes'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// ====================================
// 🚚 الرحلات
// ====================================

export const tripStatusEnum = pgEnum('trip_status', [
  'PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED',
]);

export const trips = pgTable('trips', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripNumber: varchar('trip_number', { length: 100 }).notNull().unique(),
  driverId: uuid('driver_id').references(() => users.id),
  customerId: uuid('customer_id').references(() => customers.id),
  status: tripStatusEnum('status').notNull().default('PLANNED'),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date'),
  startLocation: varchar('start_location', { length: 200 }),
  endLocation: varchar('end_location', { length: 200 }),
  customerPhone: varchar('customer_phone', { length: 50 }),
  amountToCollect: decimal('amount_to_collect', { precision: 12, scale: 2 }).default('0'),
  estimatedDuration: integer('estimated_duration'),
  notes: text('notes'),
  createdById: uuid('created_by_id').notNull().references(() => users.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// تتبع GPS المباشر للسائقين
export const driverLocations = pgTable('driver_locations', {
  id: uuid('id').primaryKey().defaultRandom(),
  driverId: uuid('driver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tripId: uuid('trip_id').references(() => trips.id, { onDelete: 'cascade' }),
  latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
  longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
  accuracy: decimal('accuracy', { precision: 10, scale: 2 }),
  speed: decimal('speed', { precision: 10, scale: 2 }),
  heading: decimal('heading', { precision: 10, scale: 2 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// المحادثات بين السائق والزبون
export const messages = pgTable('messages', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id').notNull().references(() => users.id),
  senderType: varchar('sender_type', { length: 20 }).notNull(), // 'driver' or 'customer'
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// التنبيهات
export const notifications = pgTable('notifications', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  message: text('message').notNull(),
  link: varchar('link', { length: 500 }),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// تقييمات السائق
export const ratings = pgTable('ratings', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  driverId: uuid('driver_id').notNull().references(() => users.id),
  customerName: varchar('customer_name', { length: 200 }),
  rating: integer('rating').notNull(),
  comment: text('comment'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// العمولات
export const commissions = pgTable('commissions', {
  id: uuid('id').primaryKey().defaultRandom(),
  driverId: uuid('driver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  baseAmount: decimal('base_amount', { precision: 12, scale: 2 }).notNull().default('0'),
  distanceBonus: decimal('distance_bonus', { precision: 12, scale: 2 }).notNull().default('0'),
  ratingBonus: decimal('rating_bonus', { precision: 12, scale: 2 }).notNull().default('0'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  isPaid: boolean('is_paid').notNull().default(false),
  paidAt: timestamp('paid_at'),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// مصاريف الرحلة
export const tripExpenses = pgTable('trip_expenses', {
  id: uuid('id').primaryKey().defaultRandom(),
  tripId: uuid('trip_id').notNull().references(() => trips.id, { onDelete: 'cascade' }),
  driverId: uuid('driver_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  description: text('description'),
  receiptUrl: text('receipt_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// ====================================
// الأنواع المستخرجة (TypeScript types)
// ====================================

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Medicine = typeof medicines.$inferSelect;
export type NewMedicine = typeof medicines.$inferInsert;
export type Category = typeof categories.$inferSelect;
export type Manufacturer = typeof manufacturers.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Supplier = typeof suppliers.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Purchase = typeof purchases.$inferSelect;
export type Debt = typeof debts.$inferSelect;
export type Trip = typeof trips.$inferSelect;
export type ActivityLog = typeof activityLogs.$inferSelect;
