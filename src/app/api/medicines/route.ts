// API: جلب وإنشاء الأدوية - Drizzle ORM
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';

const medicineSchema = z.object({
  tradeName: z.string().min(1, 'الاسم التجاري مطلوب'),
  scientificName: z.string().min(1, 'الاسم العلمي مطلوب'),
  barcode: z.string().optional().nullable(),
  form: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SPRAY', 'PATCH', 'OTHER']),
  strength: z.string().min(1, 'التركيز مطلوب'),
  packSize: z.string().optional().nullable(),
  costPrice: z.union([z.string(), z.number()]).transform(v => String(v)),
  sellPrice: z.union([z.string(), z.number()]).transform(v => String(v)),
  currentStock: z.union([z.string(), z.number()]).optional().transform(v => String(v || 0)),
  minStock: z.union([z.string(), z.number()]).optional().transform(v => String(v || 10)),
  expiryDate: z.string().optional().nullable(),
  status: z.enum(['ACTIVE', 'DISCONTINUED', 'OUT_OF_STOCK', 'EXPIRED', 'PENDING_REVIEW']).optional(),
  description: z.string().optional().nullable(),
  dosage: z.string().optional().nullable(),
  indications: z.string().optional().nullable(),
  contraindications: z.string().optional().nullable(),
  sideEffects: z.string().optional().nullable(),
  drugInteractions: z.string().optional().nullable(),
  storage: z.string().optional().nullable(),
  pregnancyCategory: z.string().optional().nullable(),
  categoryId: z.string().optional().nullable(),
  manufacturerId: z.string().optional().nullable(),
  createdById: z.string(),
});

export async function GET() {
  const session = await getSession();
  if (!session || !hasPermission(session.user.role, 'medicine:view')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const medicines = await db
      .select()
      .from(schema.medicines)
      .orderBy(desc(schema.medicines.createdAt));

    // جلب التصنيفات والشركات
    const categories = await db.select().from(schema.categories);
    const manufacturers = await db.select().from(schema.manufacturers);
    const users = await db.select({
      id: schema.users.id,
      fullName: schema.users.fullName,
    }).from(schema.users);

    const catMap = new Map(categories.map((c: any) => [c.id, c]));
    const manMap = new Map(manufacturers.map((m: any) => [m.id, m]));
    const userMap = new Map(users.map((u: any) => [u.id, u]));

    const enriched = medicines.map((m: any) => {
      const u = userMap.get(m.createdById) as any;
      return {
        ...m,
        category: m.categoryId ? catMap.get(m.categoryId) : null,
        manufacturer: m.manufacturerId ? manMap.get(m.manufacturerId) : null,
        createdBy: u ? { fullName: u.fullName } : null,
      };
    });

    return NextResponse.json({ medicines: enriched });
  } catch (e) {
    console.error('Get medicines error:', e);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || !hasPermission(session.user.role, 'medicine:create')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = medicineSchema.safeParse(body);

    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return NextResponse.json({ error: firstError?.message || 'بيانات غير صحيحة' }, { status: 400 });
    }

    const data = parsed.data;
    const db = await getDb();

    // التحقق من الباركود
    if (data.barcode) {
      const existing = await db.select().from(schema.medicines).where(eq(schema.medicines.barcode, data.barcode)).limit(1);
      if (existing.length > 0) {
        return NextResponse.json({ error: 'الباركود مستخدم بالفعل' }, { status: 400 });
      }
    }

    const [medicine] = await db.insert(schema.medicines).values({
      tradeName: data.tradeName,
      scientificName: data.scientificName,
      barcode: data.barcode || null,
      form: data.form,
      strength: data.strength,
      packSize: data.packSize || null,
      costPrice: data.costPrice,
      sellPrice: data.sellPrice,
      currentStock: parseInt(data.currentStock || '0'),
      minStock: parseInt(data.minStock || '10'),
      expiryDate: data.expiryDate ? new Date(data.expiryDate) : null,
      status: data.status || 'ACTIVE',
      description: data.description || null,
      dosage: data.dosage || null,
      indications: data.indications || null,
      contraindications: data.contraindications || null,
      sideEffects: data.sideEffects || null,
      drugInteractions: data.drugInteractions || null,
      storage: data.storage || null,
      pregnancyCategory: data.pregnancyCategory || null,
      categoryId: data.categoryId || null,
      manufacturerId: data.manufacturerId || null,
      createdById: data.createdById,
    }).returning();

    // تسجيل في سجل النشاط
    await db.insert(schema.activityLogs).values({
      userId: session.user.id,
      action: 'CREATE_MEDICINE',
      details: `إضافة دواء: ${medicine.tradeName}`,
    });

    // جلب البيانات المرتبطة
    let category = null, manufacturer = null;
    if (medicine.categoryId) {
      const cats = await db.select().from(schema.categories).where(eq(schema.categories.id, medicine.categoryId)).limit(1);
      category = cats[0] || null;
    }
    if (medicine.manufacturerId) {
      const mans = await db.select().from(schema.manufacturers).where(eq(schema.manufacturers.id, medicine.manufacturerId)).limit(1);
      manufacturer = mans[0] || null;
    }
    const userInfo = await db.select({ fullName: schema.users.fullName }).from(schema.users).where(eq(schema.users.id, medicine.createdById)).limit(1);

    return NextResponse.json({
      medicine: {
        ...medicine,
        category,
        manufacturer,
        createdBy: userInfo[0] ? { fullName: userInfo[0].fullName } : null,
      },
    });
  } catch (e) {
    console.error('Create medicine error:', e);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
