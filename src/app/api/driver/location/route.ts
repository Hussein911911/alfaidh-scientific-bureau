// API: تحديث موقع السائق (GPS)
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { desc, eq } from 'drizzle-orm';

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  accuracy: z.number().optional(),
  speed: z.number().optional(),
  heading: z.number().optional(),
  tripId: z.string().optional().nullable(),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = locationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const db = await getDb();
    const [location] = await db.insert(schema.driverLocations).values({
      driverId: session.user.id,
      tripId: parsed.data.tripId || null,
      latitude: parsed.data.latitude.toString(),
      longitude: parsed.data.longitude.toString(),
      accuracy: parsed.data.accuracy?.toString(),
      speed: parsed.data.speed?.toString(),
      heading: parsed.data.heading?.toString(),
    }).returning();

    return NextResponse.json({ success: true, location });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const tripId = req.nextUrl.searchParams.get('tripId');
  const db = await getDb();

  let locations;
  if (tripId) {
    locations = await db.select()
      .from(schema.driverLocations)
      .where(eq(schema.driverLocations.tripId, tripId))
      .orderBy(desc(schema.driverLocations.createdAt))
      .limit(50);
  } else {
    locations = await db.select()
      .from(schema.driverLocations)
      .where(eq(schema.driverLocations.driverId, session.user.id))
      .orderBy(desc(schema.driverLocations.createdAt))
      .limit(20);
  }

  return NextResponse.json({ locations });
}
