// API: إحصائيات السائق
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const db = await getDb();
  const driverId = session.user.id;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);
  const monthAgo = new Date(today);
  monthAgo.setMonth(monthAgo.getMonth() - 1);

  // رحلات اليوم
  const todaysTrips = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      gte(schema.trips.startDate, today)
    ));

  // رحلات الأسبوع
  const weekTrips = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      gte(schema.trips.startDate, weekAgo)
    ));

  // رحلات الشهر
  const monthTrips = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      gte(schema.trips.startDate, monthAgo)
    ));

  // رحلات مكتملة
  const completed = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      eq(schema.trips.status, 'COMPLETED'),
      gte(schema.trips.startDate, weekAgo)
    ));

  // ملغاة
  const cancelled = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      eq(schema.trips.status, 'CANCELLED'),
      gte(schema.trips.startDate, weekAgo)
    ));

  // إجمالي العمولات
  const commissions = await db.select({ total: sql<string>`COALESCE(SUM(${schema.commissions.total}), 0)::text` })
    .from(schema.commissions)
    .where(eq(schema.commissions.driverId, driverId));

  // العمولات غير المدفوعة
  const unpaid = await db.select({ total: sql<string>`COALESCE(SUM(${schema.commissions.total}), 0)::text` })
    .from(schema.commissions)
    .where(and(
      eq(schema.commissions.driverId, driverId),
      eq(schema.commissions.isPaid, false)
    ));

  // متوسط التقييم
  const ratings = await db.select({ avg: sql<string>`COALESCE(AVG(${schema.ratings.rating}), 0)::text` })
    .from(schema.ratings)
    .where(eq(schema.ratings.driverId, driverId));

  const total = (weekTrips[0]?.c || 0);
  const successRate = total > 0 ? Math.round(((completed[0]?.c || 0) / total) * 100) : 100;

  return NextResponse.json({
    stats: {
      todaysTrips: todaysTrips[0]?.c || 0,
      weekTrips: weekTrips[0]?.c || 0,
      monthTrips: monthTrips[0]?.c || 0,
      completedThisWeek: completed[0]?.c || 0,
      cancelledThisWeek: cancelled[0]?.c || 0,
      successRate,
      totalCommissions: Number(commissions[0]?.total || 0),
      unpaidCommissions: Number(unpaid[0]?.total || 0),
      averageRating: parseFloat(ratings[0]?.avg || '0'),
    },
  });
}
