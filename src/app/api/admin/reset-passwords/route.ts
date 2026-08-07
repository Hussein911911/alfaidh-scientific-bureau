// API: إعادة تعيين كلمات المرور - يدعم GET و POST
// يفتح في المتصفح مباشرة

import { NextResponse } from 'next/server';
import { getDb, schema } from '@/lib/db';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

async function resetPasswords() {
  const db = await getDb();
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const result = await db.execute(sql`
    UPDATE users SET password = ${hashedPassword}
    WHERE email IN (
      'admin@alfaidh.com', 'accountant@alfaidh.com', 'sales@alfaidh.com',
      'assistant@alfaidh.com', 'storekeeper@alfaidh.com', 'reviewer@alfaidh.com',
      'driver@alfaidh.com', 'coordinator@alfaidh.com', 'viewer@alfaidh.com'
    )
  `);

  // عد المستخدمين
  const count = await db.select({ c: sql<number>`count(*)::int` }).from(schema.users);

  return {
    success: true,
    message: `تم تحديث كلمات المرور لـ ${count[0]?.c || 0} مستخدمين. كلمة المرور الجديدة: admin123`,
  };
}

export async function GET() {
  try {
    const result = await resetPasswords();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}

export async function POST() {
  try {
    const result = await resetPasswords();
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'حدث خطأ' }, { status: 500 });
  }
}
