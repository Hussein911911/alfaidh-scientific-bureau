// API: الرسائل بين السائق والزبون
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { z } from 'zod';
import { eq, asc, and } from 'drizzle-orm';

const messageSchema = z.object({
  tripId: z.string(),
  message: z.string().min(1),
});

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const parsed = messageSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'بيانات غير صحيحة' }, { status: 400 });
    }

    const db = await getDb();
    const [msg] = await db.insert(schema.messages).values({
      tripId: parsed.data.tripId,
      senderId: session.user.id,
      senderType: 'driver',
      message: parsed.data.message,
    }).returning();

    return NextResponse.json({ success: true, message: msg });
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
  if (!tripId) {
    return NextResponse.json({ error: 'tripId مطلوب' }, { status: 400 });
  }

  const db = await getDb();
  const messages = await db.select()
    .from(schema.messages)
    .where(eq(schema.messages.tripId, tripId))
    .orderBy(asc(schema.messages.createdAt));

  // تعليم كمقروء
  await db.update(schema.messages)
    .set({ isRead: true })
    .where(and(
      eq(schema.messages.tripId, tripId),
      eq(schema.messages.isRead, false)
    ));

  return NextResponse.json({ messages });
}
