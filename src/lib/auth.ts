// نظام المصادقة - Auth System
// مصادقة بسيطة باستخدام JWT مخصصة لبيئة بدون خدمات خارجية

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getDb, schema } from './db';
import { eq, or } from 'drizzle-orm';
import bcrypt from 'bcryptjs';

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'alfaidh-scientific-bureau-secret-key-change-in-production-2026'
);

const COOKIE_NAME = 'alfaidh_session';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // أسبوع

export type UserRole =
  | 'ADMIN' | 'ACCOUNTANT' | 'SALES_MANAGER' | 'ASSISTANT'
  | 'STOREKEEPER' | 'SCIENTIFIC_REVIEWER' | 'DRIVER'
  | 'TRIP_COORDINATOR' | 'VIEWER';

export interface SessionUser {
  id: string;
  email: string;
  username: string;
  fullName: string;
  role: UserRole;
}

export interface Session {
  user: SessionUser;
  expiresAt: number;
}

// إنشاء JWT token
export async function createToken(payload: SessionUser): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

// التحقق من JWT token
export async function verifyToken(token: string): Promise<SessionUser | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as unknown as SessionUser;
  } catch {
    return null;
  }
}

// تسجيل الدخول
export async function login(emailOrUsername: string, password: string): Promise<SessionUser | null> {
  const db = await getDb();
  const users = await db.select().from(schema.users).where(
    or(eq(schema.users.email, emailOrUsername), eq(schema.users.username, emailOrUsername))
  ).limit(1);

  const user = users[0];
  if (!user || user.status !== 'ACTIVE') {
    return null;
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    return null;
  }

  // تحديث وقت آخر دخول
  await db.update(schema.users).set({ lastLoginAt: new Date() }).where(eq(schema.users.id, user.id));

  // تسجيل في سجل النشاط
  await db.insert(schema.activityLogs).values({
    userId: user.id,
    action: 'LOGIN',
    details: 'تسجيل دخول ناجح',
  });

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    fullName: user.fullName,
    role: user.role as UserRole,
  };
}

// إنشاء جلسة وحفظها في الكوكيز
export async function createSession(user: SessionUser): Promise<void> {
  const token = await createToken(user);
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

// الحصول على الجلسة الحالية
export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE_NAME)?.value;
  if (!token) return null;

  const user = await verifyToken(token);
  if (!user) return null;

  return {
    user,
    expiresAt: Date.now() + COOKIE_MAX_AGE * 1000,
  };
}

// حذف الجلسة (تسجيل الخروج)
export async function destroySession(): Promise<void> {
  cookies().delete(COOKIE_NAME);
}

