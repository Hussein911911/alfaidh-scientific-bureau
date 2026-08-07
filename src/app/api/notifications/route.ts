// API: التنبيهات
import { NextRequest, NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { eq, desc, and } from 'drizzle-orm';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const db = await getDb();
  const notifications = await db.select()
    .from(schema.notifications)
    .where(eq(schema.notifications.userId, session.user.id))
    .orderBy(desc(schema.notifications.createdAt))
    .limit(50);

  return NextResponse.json({ notifications });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'غير مصرح' }, { status: 401 });
  }

  const { notificationId } = await req.json();
  const db = await getDb();
  await db.update(schema.notifications)
    .set({ isRead: true })
    .where(and(
      eq(schema.notifications.id, notificationId),
      eq(schema.notifications.userId, session.user.id)
    ));

  return NextResponse.json({ success: true });
}
