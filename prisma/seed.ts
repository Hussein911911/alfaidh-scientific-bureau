// Seed Script - يدعم PGlite (محلي) و PostgreSQL (Vercel)

import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { drizzle as drizzlePostgres } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../src/db/schema';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs';

const DATABASE_URL = process.env.DATABASE_URL;
const USE_POSTGRES = DATABASE_URL && DATABASE_URL.startsWith('postgres');

const SCHEMA_SQL = `
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

DO $$ BEGIN
  CREATE TYPE stock_movement_type AS ENUM ('PURCHASE', 'SALE', 'RETURN', 'ADJUSTMENT', 'TRANSFER', 'EXPIRED', 'DAMAGED');
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
`;

async function main() {
  console.log('🌱 بدء تعبئة قاعدة البيانات...');
  console.log(`📡 الوضع: ${USE_POSTGRES ? 'PostgreSQL (Vercel/Neon)' : 'PGlite (محلي)'}\n`);

  let client: any;
  let db: any;
  let pgliteClient: PGlite | null = null;
  let sqlClient: any = null;

  if (USE_POSTGRES) {
    // PostgreSQL - للإنتاج
    sqlClient = postgres(DATABASE_URL!, { max: 1, ssl: 'require' });
    db = drizzlePostgres(sqlClient, { schema });
    await sqlClient.unsafe(SCHEMA_SQL);
  } else {
    // PGlite - للتطوير المحلي
    const DATA_DIR = path.join(process.cwd(), '.alfaidh-data');
    if (fs.existsSync(DATA_DIR)) {
      fs.rmSync(DATA_DIR, { recursive: true, force: true });
      console.log('🗑️  تم حذف قاعدة البيانات القديمة\n');
    }
    pgliteClient = new PGlite(DATA_DIR);
    await pgliteClient.waitReady;
    await pgliteClient.exec(SCHEMA_SQL);
    db = drizzlePglite(pgliteClient, { schema });
  }

  console.log('✅ تم إنشاء schema بنجاح\n');

  // كلمة المرور
  const hashedPassword = await bcrypt.hash('admin123', 10);

  // المستخدمون
  console.log('👥 إنشاء المستخدمين...');
  const usersData = [
    { email: 'admin@alfaidh.com', username: 'admin', fullName: 'مدير النظام', role: 'ADMIN' as const },
    { email: 'accountant@alfaidh.com', username: 'accountant', fullName: 'أحمد المحاسب', role: 'ACCOUNTANT' as const },
    { email: 'sales@alfaidh.com', username: 'sales_manager', fullName: 'علي مدير المبيعات', role: 'SALES_MANAGER' as const },
    { email: 'assistant@alfaidh.com', username: 'assistant', fullName: 'فاطمة مساعدة الصيدلية', role: 'ASSISTANT' as const },
    { email: 'storekeeper@alfaidh.com', username: 'storekeeper', fullName: 'حسن المخزّن', role: 'STOREKEEPER' as const },
    { email: 'reviewer@alfaidh.com', username: 'reviewer', fullName: 'د. سارة المراجعة العلمية', role: 'SCIENTIFIC_REVIEWER' as const },
    { email: 'driver@alfaidh.com', username: 'driver', fullName: 'محمد السائق', role: 'DRIVER' as const },
    { email: 'coordinator@alfaidh.com', username: 'coordinator', fullName: 'عمر مسؤول الرحلات', role: 'TRIP_COORDINATOR' as const },
    { email: 'viewer@alfaidh.com', username: 'viewer', fullName: 'مشاهد', role: 'VIEWER' as const },
  ];

  const insertedUsers: any[] = [];
  for (const u of usersData) {
    const [user] = await db.insert(schema.users).values({
      email: u.email,
      username: u.username,
      password: hashedPassword,
      fullName: u.fullName,
      role: u.role,
      status: 'ACTIVE',
    }).returning();
    insertedUsers.push(user);
  }
  console.log(`✅ ${insertedUsers.length} مستخدمين`);

  const adminUser = insertedUsers.find(u => u.username === 'admin')!;

  console.log('📂 إنشاء التصنيفات...');
  const categoriesData = [
    { name: 'المضادات الحيوية', nameEn: 'Antibiotics' },
    { name: 'مسكنات الألم', nameEn: 'Analgesics' },
    { name: 'مضادات الالتهاب', nameEn: 'Anti-inflammatory' },
    { name: 'أدوية الجهاز الهضمي', nameEn: 'Gastrointestinal' },
    { name: 'الفيتامينات والمكملات', nameEn: 'Vitamins' },
  ];

  const insertedCategories: any[] = [];
  for (const c of categoriesData) {
    const [cat] = await db.insert(schema.categories).values(c).returning();
    insertedCategories.push(cat);
  }
  console.log(`✅ ${insertedCategories.length} تصنيف`);

  console.log('🏭 إنشاء الشركات المصنعة...');
  const manufacturersData = [
    { name: 'سبيا فارما', country: 'العراق' },
    { name: 'الحكمة فارما', country: 'الأردن' },
    { name: 'فارما ميد', country: 'مصر' },
  ];

  const insertedManufacturers: any[] = [];
  for (const m of manufacturersData) {
    const [man] = await db.insert(schema.manufacturers).values(m).returning();
    insertedManufacturers.push(man);
  }
  console.log(`✅ ${insertedManufacturers.length} شركة`);

  console.log('💊 إنشاء الأدوية...');
  const findCat = (name: string) => insertedCategories.find(c => c.name === name)?.id;
  const findMan = (name: string) => insertedManufacturers.find(m => m.name === name)?.id;

  const medicinesData = [
    {
      tradeName: 'أموكسيسيلين 500',
      scientificName: 'Amoxicillin',
      form: 'CAPSULE' as const,
      strength: '500mg',
      packSize: '20 كبسولة',
      categoryId: findCat('المضادات الحيوية'),
      manufacturerId: findMan('الحكمة فارما'),
      costPrice: '1500.00', sellPrice: '2000.00',
      currentStock: 150, minStock: 30,
      description: 'مضاد حيوي واسع الطيف من مجموعة البنسلين',
      dosage: '500mg كل 8 ساعات',
      indications: 'التهابات الجهاز التنفسي، التهاب الأذن الوسطى',
      contraindications: 'الحساسية للبنسلين',
      sideEffects: 'غثيان، إسهال، طفح جلدي',
      drugInteractions: 'يقلل من فعالية حبوب منع الحمل',
      storage: 'يحفظ في درجة حرارة الغرفة بعيداً عن الرطوبة',
      pregnancyCategory: 'B',
      createdById: adminUser.id,
    },
    {
      tradeName: 'باراسيتامول 500',
      scientificName: 'Paracetamol',
      form: 'TABLET' as const,
      strength: '500mg',
      packSize: '24 قرص',
      categoryId: findCat('مسكنات الألم'),
      manufacturerId: findMan('فارما ميد'),
      costPrice: '500.00', sellPrice: '750.00',
      currentStock: 300, minStock: 50,
      description: 'مسكن للألم وخافض للحرارة',
      dosage: '1-2 قرص كل 4-6 ساعات',
      indications: 'الصداع، آلام الأسنان، الحمى',
      contraindications: 'أمراض الكبد الشديدة',
      sideEffects: 'نادراً: طفح جلدي',
      drugInteractions: 'الوارفارين، الكحول',
      storage: 'يحفظ في درجة حرارة الغرفة',
      pregnancyCategory: 'B',
      createdById: adminUser.id,
    },
    {
      tradeName: 'فيتامين د3 1000',
      scientificName: 'Cholecalciferol',
      form: 'CAPSULE' as const,
      strength: '1000 IU',
      packSize: '30 كبسولة',
      categoryId: findCat('الفيتامينات والمكملات'),
      manufacturerId: findMan('سبيا فارما'),
      costPrice: '2500.00', sellPrice: '3500.00',
      currentStock: 80, minStock: 20,
      description: 'مكمل غذائي من فيتامين د',
      dosage: 'كبسولة واحدة يومياً',
      indications: 'نقص فيتامين د، هشاشة العظام',
      contraindications: 'فرط كالسيوم الدم',
      sideEffects: 'نادراً: غثيان',
      storage: 'يحفظ بعيداً عن الضوء',
      pregnancyCategory: 'A',
      createdById: adminUser.id,
    },
    {
      tradeName: 'أوميبرازول 20',
      scientificName: 'Omeprazole',
      form: 'CAPSULE' as const,
      strength: '20mg',
      packSize: '14 كبسولة',
      categoryId: findCat('أدوية الجهاز الهضمي'),
      manufacturerId: findMan('الحكمة فارما'),
      costPrice: '2000.00', sellPrice: '2800.00',
      currentStock: 120, minStock: 25,
      description: 'مثبط مضخة البروتون لعلاج الحموضة',
      dosage: 'كبسولة واحدة قبل الإفطار',
      indications: 'الارتجاع المعدي المريئي، قرحة المعدة',
      contraindications: 'الحساسية للمادة الفعالة',
      sideEffects: 'صداع، ألم بطن، غثيان',
      drugInteractions: 'يقلل امتصاص بعض الأدوية',
      storage: 'يحفظ في درجة حرارة الغرفة',
      pregnancyCategory: 'C',
      createdById: adminUser.id,
    },
  ];

  for (const med of medicinesData) {
    await db.insert(schema.medicines).values(med);
  }
  console.log(`✅ ${medicinesData.length} أدوية`);

  console.log('\n🎉 تمت تعبئة قاعدة البيانات بنجاح!\n');
  console.log('📋 حسابات الدخول (كلمة المرور: admin123):');
  console.log('═══════════════════════════════════════════════════════');
  usersData.forEach((u) => console.log(`${u.fullName.padEnd(20)} | ${u.email}`));
  console.log('═══════════════════════════════════════════════════════');

  if (pgliteClient) await pgliteClient.close();
  if (sqlClient) await sqlClient.end();
  process.exit(0);
}

main().catch((e) => {
  console.error('❌ خطأ:', e);
  process.exit(1);
});
