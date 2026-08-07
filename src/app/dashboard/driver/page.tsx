// صفحة السائق الرئيسية - لوحة التحكم المخصصة
import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/lib/db';
import { eq, and, desc, gte, sql, inArray, asc } from 'drizzle-orm';
import { DriverDashboard } from '@/components/driver/DriverDashboard';

export default async function DriverPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'trip:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض رحلات التوصيل</p>
      </div>
    );
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
    .where(and(eq(schema.trips.driverId, driverId), gte(schema.trips.startDate, today)));

  // رحلات الأسبوع
  const weekTrips = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(eq(schema.trips.driverId, driverId), gte(schema.trips.startDate, weekAgo)));

  // رحلات الشهر
  const monthTrips = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(eq(schema.trips.driverId, driverId), gte(schema.trips.startDate, monthAgo)));

  const completed = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      eq(schema.trips.status, 'COMPLETED'),
      gte(schema.trips.startDate, weekAgo)
    ));

  const cancelled = await db.select({ c: sql<number>`count(*)::int` })
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      eq(schema.trips.status, 'CANCELLED'),
      gte(schema.trips.startDate, weekAgo)
    ));

  const commissions = await db.select({ total: sql<string>`COALESCE(SUM(${schema.commissions.total}), 0)::text` })
    .from(schema.commissions)
    .where(eq(schema.commissions.driverId, driverId));

  const unpaid = await db.select({ total: sql<string>`COALESCE(SUM(${schema.commissions.total}), 0)::text` })
    .from(schema.commissions)
    .where(and(eq(schema.commissions.driverId, driverId), eq(schema.commissions.isPaid, false)));

  const ratings = await db.select({ avg: sql<string>`COALESCE(AVG(${schema.ratings.rating}), 0)::text` })
    .from(schema.ratings)
    .where(eq(schema.ratings.driverId, driverId));

  const total = weekTrips[0]?.c || 0;
  const successRate = total > 0 ? Math.round(((completed[0]?.c || 0) / total) * 100) : 100;

  const stats = {
    todaysTrips: todaysTrips[0]?.c || 0,
    weekTrips: weekTrips[0]?.c || 0,
    monthTrips: monthTrips[0]?.c || 0,
    completedThisWeek: completed[0]?.c || 0,
    cancelledThisWeek: cancelled[0]?.c || 0,
    successRate,
    totalCommissions: Number(commissions[0]?.total || 0),
    unpaidCommissions: Number(unpaid[0]?.total || 0),
    averageRating: parseFloat(ratings[0]?.avg || '0'),
  };

  const activeTripsList = await db.select()
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      inArray(schema.trips.status, ['PLANNED', 'IN_PROGRESS'])
    ))
    .orderBy(asc(schema.trips.startDate))
    .limit(10);

  const deliveryHistory = await db.select()
    .from(schema.trips)
    .where(and(
      eq(schema.trips.driverId, driverId),
      eq(schema.trips.status, 'COMPLETED')
    ))
    .orderBy(desc(schema.trips.startDate))
    .limit(20);

  return (
    <DriverDashboard
      stats={stats}
      activeTripsList={activeTripsList as any}
      deliveryHistory={deliveryHistory as any}
      driverName={session.user.fullName}
    />
  );
}
