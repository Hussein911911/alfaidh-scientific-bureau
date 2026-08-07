// API: تعبئة قاعدة البيانات - يدعم GET و POST
// يفتح في المتصفح مباشرة بدون أوامر معقدة

import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function seedDatabase() {
  const db = await getDb();

  // التحقق من وجود مستخدمين
  const existing = await db.select({ c: sql<number>`count(*)::int` }).from(schema.users);
  if ((existing[0]?.c || 0) > 0) {
    return {
      success: false,
      message: `قاعدة البيانات تحتوي على ${existing[0]?.c} مستخدمين بالفعل`,
    };
  }

  const hashedPassword = await bcrypt.hash('admin123', 10);

  // المستخدمون
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

  const adminUser = insertedUsers.find(u => u.username === 'admin')!;
  const driverUser = insertedUsers.find(u => u.username === 'driver')!;

  // التصنيفات
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

  // الشركات المصنعة
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

  // الأدوية
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
      storage: 'يحفظ في درجة حرارة الغرفة',
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
      storage: 'يحفظ في درجة حرارة الغرفة',
      pregnancyCategory: 'C',
      createdById: adminUser.id,
    },
  ];

  for (const med of medicinesData) {
    await db.insert(schema.medicines).values(med);
  }

  // رحلات تجريبية للسائق
  const now = new Date();
  const tripsData = [
    {
      tripNumber: 'TR-2026-001',
      driverId: driverUser.id,
      status: 'PLANNED' as const,
      startDate: new Date(now.getTime() + 30 * 60 * 1000), // بعد 30 دقيقة
      endDate: null,
      startLocation: 'الصيدلية - الكرادة',
      endLocation: 'شارع 62، حي الجامعة، بغداد',
      notes: 'الزبون يفضل الاتصال قبل الوصول بـ 10 دقائق',
      createdById: adminUser.id,
    },
    {
      tripNumber: 'TR-2026-002',
      driverId: driverUser.id,
      status: 'IN_PROGRESS' as const,
      startDate: new Date(now.getTime() - 15 * 60 * 1000), // قبل 15 دقيقة
      endDate: null,
      startLocation: 'الصيدلية - الكرادة',
      endLocation: 'حي المنصور، م 601، زقاق 12، دار 35',
      notes: 'تسليم 3 أدوية - المبلغ 15000 د.ع',
      createdById: adminUser.id,
    },
    {
      tripNumber: 'TR-2026-003',
      driverId: driverUser.id,
      status: 'PLANNED' as const,
      startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000), // بعد ساعتين
      endDate: null,
      startLocation: 'الصيدلية - الكرادة',
      endLocation: 'البصرة - حي العباسية',
      notes: 'رحلة طويلة - يجب التزود بالوقود',
      createdById: adminUser.id,
    },
    {
      tripNumber: 'TR-2026-000',
      driverId: driverUser.id,
      status: 'COMPLETED' as const,
      startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000), // أمس
      endDate: new Date(now.getTime() - 23 * 60 * 60 * 1000),
      startLocation: 'الصيدلية - الكرادة',
      endLocation: 'بغداد - حي الكاظمية',
      notes: JSON.stringify({
        proof: { signature: 'أحمد محمد', location: { lat: 33.3152, lng: 44.3661 }, notes: 'تم التسليم بنجاح' },
        completedAt: new Date(now.getTime() - 23 * 60 * 60 * 1000).toISOString(),
      }),
      createdById: adminUser.id,
    },
    {
      tripNumber: 'TR-2026-004',
      driverId: driverUser.id,
      status: 'COMPLETED' as const,
      startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000), // قبل 3 أيام
      endDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
      startLocation: 'الصيدلية - الكرادة',
      endLocation: 'بغداد - حي الأعظمية',
      notes: JSON.stringify({
        proof: { signature: 'فاطمة علي', location: { lat: 33.3872, lng: 44.3984 }, notes: 'تم التسليم' },
      }),
      createdById: adminUser.id,
    },
  ];

  for (const trip of tripsData) {
    await db.insert(schema.trips).values(trip);
  }

  return {
    success: true,
    message: `تم تعبئة ${insertedUsers.length} مستخدمين و ${insertedCategories.length} تصنيف و ${insertedManufacturers.length} شركات و ${medicinesData.length} أدوية و ${tripsData.length} رحلات. كلمة المرور: admin123`,
  };
}

// يدعم GET و POST
export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await seedDatabase();
    return NextResponse.json(result, { status: result.success ? 200 : 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}
