// API: تعبئة قاعدة البيانات (للإنتاج فقط)
// يُستدعى مرة واحدة بعد النشر لتعبئة البيانات الأولية

import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    const db = await getDb();

    // التحقق من وجود مستخدمين
    const existing = await db.select({ c: sql<number>`count(*)::int` }).from(schema.users);
    if ((existing[0]?.c || 0) > 0) {
      return NextResponse.json({
        success: false,
        message: 'قاعدة البيانات تحتوي على بيانات بالفعل',
      });
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

    return NextResponse.json({
      success: true,
      message: `تم تعبئة ${insertedUsers.length} مستخدمين و ${insertedCategories.length} تصنيف و ${insertedManufacturers.length} شركات و ${medicinesData.length} أدوية`,
    });
  } catch (e: any) {
    console.error('Seed error:', e);
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}
