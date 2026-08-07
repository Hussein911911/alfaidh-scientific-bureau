// API: إضافة رحلات تجريبية للسائق الموجود
import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    const db = await getDb();

    const drivers = await db.select().from(schema.users).where(eq(schema.users.username, 'driver'));
    if (drivers.length === 0) {
      return NextResponse.json({ success: false, message: 'السائق غير موجود' });
    }
    const driver = drivers[0];

    const admins = await db.select().from(schema.users).where(eq(schema.users.username, 'admin'));
    const admin = admins[0] || driver;

    // حذف الرحلات القديمة
    await db.delete(schema.trips).where(eq(schema.trips.driverId, driver.id));

    const now = new Date();
    const tripsData = [
      {
        tripNumber: 'TR-2026-001',
        driverId: driver.id,
        status: 'PLANNED' as const,
        startDate: new Date(now.getTime() + 30 * 60 * 1000),
        endDate: null,
        startLocation: 'الصيدلية - الكرادة',
        endLocation: 'شارع 62، حي الجامعة، بغداد',
        customerPhone: '07901234567',
        amountToCollect: '12500.00',
        estimatedDuration: 45,
        notes: 'الزبون يفضل الاتصال قبل الوصول بـ 10 دقائق',
        createdById: admin.id,
      },
      {
        tripNumber: 'TR-2026-002',
        driverId: driver.id,
        status: 'IN_PROGRESS' as const,
        startDate: new Date(now.getTime() - 15 * 60 * 1000),
        endDate: null,
        startLocation: 'الصيدلية - الكرادة',
        endLocation: 'حي المنصور، م 601، زقاق 12، دار 35',
        customerPhone: '07712345678',
        amountToCollect: '15000.00',
        estimatedDuration: 30,
        notes: 'تسليم 3 أدوية',
        createdById: admin.id,
      },
      {
        tripNumber: 'TR-2026-003',
        driverId: driver.id,
        status: 'PLANNED' as const,
        startDate: new Date(now.getTime() + 2 * 60 * 60 * 1000),
        endDate: null,
        startLocation: 'الصيدلية - الكرادة',
        endLocation: 'البصرة - حي العباسية',
        customerPhone: '07823456789',
        amountToCollect: '25000.00',
        estimatedDuration: 240,
        notes: 'رحلة طويلة - التزود بالوقود',
        createdById: admin.id,
      },
      {
        tripNumber: 'TR-2026-000',
        driverId: driver.id,
        status: 'COMPLETED' as const,
        startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 23 * 60 * 60 * 1000),
        startLocation: 'الصيدلية - الكرادة',
        endLocation: 'بغداد - حي الكاظمية',
        customerPhone: '07908765432',
        amountToCollect: '8000.00',
        estimatedDuration: 40,
        notes: JSON.stringify({
          proof: { signature: 'أحمد محمد', location: { lat: 33.3152, lng: 44.3661 }, notes: 'تم التسليم بنجاح' },
        }),
        createdById: admin.id,
      },
      {
        tripNumber: 'TR-2026-004',
        driverId: driver.id,
        status: 'COMPLETED' as const,
        startDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000 + 30 * 60 * 1000),
        startLocation: 'الصيدلية - الكرادة',
        endLocation: 'بغداد - حي الأعظمية',
        customerPhone: '07812345678',
        amountToCollect: '12000.00',
        estimatedDuration: 35,
        notes: JSON.stringify({
          proof: { signature: 'فاطمة علي', location: { lat: 33.3872, lng: 44.3984 }, notes: 'تم التسليم' },
        }),
        createdById: admin.id,
      },
    ];

    for (const trip of tripsData) {
      await db.insert(schema.trips).values(trip);
    }

    return NextResponse.json({
      success: true,
      message: `تم إضافة ${tripsData.length} رحلات تجريبية للسائق ${driver.fullName}`,
    });
  } catch (e: any) {
    console.error('Add trips error:', e);
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST() {
  return GET();
}
