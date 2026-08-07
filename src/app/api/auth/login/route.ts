// API: تسجيل الدخول
import { NextRequest, NextResponse } from 'next/server';
import { login, createSession } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, 'البريد أو اسم المستخدم مطلوب'),
  password: z.string().min(1, 'كلمة المرور مطلوبة'),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'بيانات غير صحيحة' },
        { status: 400 }
      );
    }

    const { emailOrUsername, password } = parsed.data;
    const user = await login(emailOrUsername, password);

    if (!user) {
      return NextResponse.json(
        { error: 'البريد أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    await createSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في الخادم' },
      { status: 500 }
    );
  }
}
