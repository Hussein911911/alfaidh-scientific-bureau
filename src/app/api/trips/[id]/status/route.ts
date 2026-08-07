// API: تحديث حالة الرحلة (للسائقين والمديرين)
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { eq, and } from 'drizzle-orm';
import { z } from 'zod';

const updateSchema = z.object({
  status: z.enum(['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
  notes: z.string().optional().nullable(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  // السائق يمكنه تحديث رحلاته فقط
  // المدير يمكنه تحديث أي رحلة
  const db = await getDb();
  const trip = await db.select().from(schema.trips).where(eq(schema.trips.id, params.id)).limit(1);
  if (trip.length === 0) {
    return NextResponse.json({ error: 'الرحلة غير موجودة' }, { status: 404 });
  }

  const isAdmin = hasPermission(session.user.role, 'settings:manage');
  const isAssignedDriver = trip[0].driverId === session.user.id;

  if (!isAdmin && !isAssignedDriver) {
    return NextResponse.json({ error: 'غير مصرح بتحديث هذه الرحلة' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const updateData: any = {
      status: parsed.data.status,
      updatedAt: new Date(),
    };

    if (parsed.data.notes) {
      updateData.notes = parsed.data.notes;
    }

    // تعيين تاريخ الانتهاء عند الإكمال
    if (parsed.data.status === 'COMPLETED' || parsed.data.status === 'CANCELLED') {
      updateData.endDate = new Date();
    }

    const [updated] = await db.update(schema.trips)
      .set(updateData)
      .where(eq(schema.trips.id, params.id))
      .returning();

    // تسجيل في سجل النشاط
    await db.insert(schema.activityLogs).values({
      userId: session.user.id,
      action: `TRIP_${parsed.data.status}`,
      details: `تحديث رحلة ${updated.tripNumber} إلى: ${parsed.data.status}`,
    });

    return NextResponse.json({ trip: updated });
  } catch (e: any) {
    console.error('Update trip error:', e);
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}
