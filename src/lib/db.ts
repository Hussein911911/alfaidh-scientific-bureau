// Database Client - Drizzle ORM
// يدعم بيئة محلية (PGlite) وبيئة سحابية (PostgreSQL عبر Vercel/Neon)

import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import { PGlite } from '@electric-sql/pglite';
import postgres from 'postgres';
import * as schema from '@/db/schema';
import path from 'path';
import fs from 'fs';

// الكشف عن بيئة التشغيل
const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = DATABASE_URL && DATABASE_URL.startsWith('postgres');

const DATA_DIR = path.join(process.cwd(), '.alfaidh-data');

// تأكد من وجود المجلد (لـ PGlite)
if (!USE_POSTGRES && !fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

declare global {
  // eslint-disable-next-line no-var
  var __pglite: PGlite | undefined;
  // eslint-disable-next-line no-var
  var __sqlClient: ReturnType<typeof postgres> | undefined;
  // eslint-disable-next-line no-var
  var __drizzle: any;
  // eslint-disable-next-line no-var
  var __dbReady: Promise<void> | undefined;
  // eslint-disable-next-line no-var
  var __dbType: 'postgres' | 'pglite' | undefined;
}

// PostgreSQL Schema (للإنتاج - Vercel/Neon)
const POSTGRES_SCHEMA_SQL = `
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'ADMIN', 'ACCOUNTANT', 'SALES_MANAGER', 'ASSISTANT',
    'STOREKEEPER', 'SCIENTIFIC_REVIEWER', 'DRIVER', 'TRIP_COORDINATOR', 'VIEWER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE medicine_form AS ENUM (
    'TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT',
    'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SPRAY', 'PATCH', 'OTHER'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE medicine_status AS ENUM ('ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'EXPIRED', 'PENDING_REVIEW');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'EXPIRED', 'DAMAGED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE sale_status AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'PARTIALLY_PAID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('CASH', 'CREDIT', 'BANK_TRANSFER', 'CHECK');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE purchase_status AS ENUM ('PENDING', 'ORDERED', 'RECEIVED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE debt_status AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE trip_status AS ENUM ('PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) NOT NULL UNIQUE,
  username VARCHAR(100) NOT NULL UNIQUE,
  password TEXT NOT NULL,
  full_name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  role user_role NOT NULL DEFAULT 'VIEWER',
  status user_status NOT NULL DEFAULT 'ACTIVE',
  avatar TEXT,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(50),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,
  name_en VARCHAR(200),
  description TEXT,
  parent_id UUID REFERENCES categories(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS manufacturers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,
  country VARCHAR(100),
  contact_info TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_name VARCHAR(200) NOT NULL,
  scientific_name VARCHAR(200) NOT NULL,
  barcode VARCHAR(100) UNIQUE,
  form medicine_form NOT NULL,
  strength VARCHAR(100) NOT NULL,
  pack_size VARCHAR(100),
  category_id UUID REFERENCES categories(id),
  manufacturer_id UUID REFERENCES manufacturers(id),
  cost_price DECIMAL(10, 2) NOT NULL,
  sell_price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  dosage TEXT,
  indications TEXT,
  contraindications TEXT,
  side_effects TEXT,
  drug_interactions TEXT,
  storage TEXT,
  pregnancy_category VARCHAR(10),
  current_stock INTEGER NOT NULL DEFAULT 0,
  min_stock INTEGER NOT NULL DEFAULT 10,
  expiry_date TIMESTAMP,
  batch_number VARCHAR(100),
  status medicine_status NOT NULL DEFAULT 'ACTIVE',
  is_scientifically_reviewed BOOLEAN NOT NULL DEFAULT FALSE,
  created_by_id UUID NOT NULL REFERENCES users(id),
  updated_by_id UUID REFERENCES users(id),
  reviewed_by_id UUID REFERENCES users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medicines_trade ON medicines(trade_name);
CREATE INDEX IF NOT EXISTS idx_medicines_scientific ON medicines(scientific_name);

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
  type stock_movement_type NOT NULL,
  quantity INTEGER NOT NULL,
  notes TEXT,
  reference_id VARCHAR(100),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(50),
  email VARCHAR(200),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(100) NOT NULL UNIQUE,
  customer_id UUID REFERENCES customers(id),
  customer_name VARCHAR(200),
  status sale_status NOT NULL DEFAULT 'PENDING',
  payment_method payment_method NOT NULL DEFAULT 'CASH',
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  tax DECIMAL(10, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount DECIMAL(10, 2) NOT NULL DEFAULT 0,
  total DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL UNIQUE,
  contact_name VARCHAR(200),
  phone VARCHAR(50),
  email VARCHAR(200),
  address TEXT,
  notes TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) NOT NULL UNIQUE,
  supplier_id UUID NOT NULL REFERENCES suppliers(id),
  status purchase_status NOT NULL DEFAULT 'PENDING',
  total_amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  notes TEXT,
  expected_date TIMESTAMP,
  received_date TIMESTAMP,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS purchase_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id UUID NOT NULL REFERENCES purchases(id) ON DELETE CASCADE,
  medicine_id UUID NOT NULL REFERENCES medicines(id),
  quantity INTEGER NOT NULL,
  unit_cost DECIMAL(10, 2) NOT NULL,
  total DECIMAL(12, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES sales(id),
  purchase_id UUID REFERENCES purchases(id),
  amount DECIMAL(12, 2) NOT NULL,
  method payment_method NOT NULL,
  reference VARCHAR(200),
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS debts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID UNIQUE REFERENCES sales(id),
  customer_id UUID NOT NULL REFERENCES customers(id),
  amount DECIMAL(12, 2) NOT NULL,
  paid_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
  due_date TIMESTAMP,
  status debt_status NOT NULL DEFAULT 'PENDING',
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_number VARCHAR(100) NOT NULL UNIQUE,
  driver_id UUID REFERENCES users(id),
  status trip_status NOT NULL DEFAULT 'PLANNED',
  start_date TIMESTAMP NOT NULL,
  end_date TIMESTAMP,
  start_location VARCHAR(200),
  end_location VARCHAR(200),
  notes TEXT,
  created_by_id UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
`;

// نفس الـ schema لـ PGlite (للتطوير المحلي)
const PGLITE_SCHEMA_SQL = POSTGRES_SCHEMA_SQL;

function getDrizzle() {
  if (!global.__drizzle) {
    if (USE_POSTGRES) {
      // PostgreSQL (Vercel/Neon/Supabase)
      const client = postgres(DATABASE_URL!, {
        max: 1,
        ssl: 'require',
        idle_timeout: 20,
        connect_timeout: 10,
      });
      global.__sqlClient = client;
      global.__dbType = 'postgres';
      global.__drizzle = drizzlePostgres(client, { schema });
    } else {
      // PGlite (محلي)
      const client = new PGlite(DATA_DIR);
      global.__pglite = client;
      global.__dbType = 'pglite';
      global.__drizzle = drizzlePglite(client, { schema });
    }
  }
  return global.__drizzle;
}

async function initializeDatabase() {
  try {
    const db = getDrizzle();
    const client = USE_POSTGRES ? global.__sqlClient : global.__pglite!;

    let exists = false;
    if (USE_POSTGRES) {
      const result = await (client as any)`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        ) as exists
      `;
      exists = (result as any)[0]?.exists === true;
    } else {
      await (client as PGlite).waitReady;
      const result = await (client as PGlite).query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public' AND table_name = 'users'
        ) as exists
      `) as any;
      exists = result.rows?.[0]?.exists === true;
    }

    if (!exists) {
      console.log('📦 [DB] Initializing schema...');
      if (USE_POSTGRES) {
        await (client as any).unsafe(POSTGRES_SCHEMA_SQL);
      } else {
        await (client as PGlite).exec(PGLITE_SCHEMA_SQL);
      }
      console.log('✅ [DB] Schema initialized');
    } else {
      console.log('✅ [DB] Schema ready');
    }
  } catch (e: any) {
    console.error('❌ [DB] Init error:', e?.message || e);
    // حاول مرة ثانية بصمت
    try {
      const client = USE_POSTGRES ? global.__sqlClient : global.__pglite!;
      if (USE_POSTGRES) {
        await (client as any).unsafe(POSTGRES_SCHEMA_SQL);
      } else if (client) {
        await (client as PGlite).exec(PGLITE_SCHEMA_SQL);
      }
    } catch {}
  }
}

export async function getDb() {
  if (!global.__dbReady) {
    global.__dbReady = initializeDatabase();
  }
  await global.__dbReady;
  return getDrizzle();
}

export { schema };
export const dbType = USE_POSTGRES ? 'postgres' : 'pglite';
