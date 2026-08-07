// API: تحديث وحذف دواء
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { z } from 'zod';
import { eq, and, ne } from 'drizzle-orm';

const updateSchema = z.object({
  tradeName: z.string().min(1),
  scientificName: z.string().min(1),
  barcode: z.string().optional().nullable(),
  form: z.enum(['TABLET', 'CAPSULE', 'SYRUP', 'INJECTION', 'CREAM', 'OINTMENT', 'DROPS', 'INHALER', 'SUPPOSITORY', 'POWDER', 'SOLUTION', 'SPRAY', 'PATCH', 'OTHER']),
  strength: z.string().min(1),
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
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || !hasPermission(session.user.role, 'medicine:update')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const data = parsed.data;
    const db = await getDb();

    // التحقق من وجود الدواء
    const existing = await db.select().from(schema.medicines).where(eq(schema.medicines.id, params.id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'الدواء غير موجود' }, { status: 404 });
    }

    // التحقق من الباركود
    if (data.barcode && data.barcode !== existing[0].barcode) {
      const dup = await db.select().from(schema.medicines)
        .where(and(eq(schema.medicines.barcode, data.barcode), ne(schema.medicines.id, params.id)))
        .limit(1);
      if (dup.length > 0) {
        return NextResponse.json({ error: 'الباركود مستخدم بالفعل' }, { status: 400 });
      }
    }

    const [medicine] = await db.update(schema.medicines).set({
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
      updatedById: session.user.id,
      updatedAt: new Date(),
    }).where(eq(schema.medicines.id, params.id)).returning();

    await db.insert(schema.activityLogs).values({
      userId: session.user.id,
      action: 'UPDATE_MEDICINE',
      details: `تعديل دواء: ${medicine.tradeName}`,
    });

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
    console.error('Update medicine error:', e);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || !hasPermission(session.user.role, 'medicine:delete')) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 403 });
  }

  try {
    const db = await getDb();
    const existing = await db.select().from(schema.medicines).where(eq(schema.medicines.id, params.id)).limit(1);
    if (existing.length === 0) {
      return NextResponse.json({ error: 'الدواء غير موجود' }, { status: 404 });
    }

    await db.delete(schema.medicines).where(eq(schema.medicines.id, params.id));

    await db.insert(schema.activityLogs).values({
      userId: session.user.id,
      action: 'DELETE_MEDICINE',
      details: `حذف دواء: ${existing[0].tradeName}`,
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Delete medicine error:', e);
    return NextResponse.json({ error: 'حدث خطأ في الخادم' }, { status: 500 });
  }
}
