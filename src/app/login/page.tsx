'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pill, Eye, EyeOff, Loader2, Shield, Sparkles, ArrowLeft } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailOrUsername, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'فشل تسجيل الدخول');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError('حدث خطأ، حاول مرة أخرى');
    } finally {
      setLoading(false);
    }
  }

  // ملء بيانات الدخول التجريبية
  function fillDemo(role: string) {
    setEmailOrUsername(role);
    setPassword('admin123');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* الجانب الأيسر - معلومات */}
        <div className="hidden lg:block space-y-6 animate-fade-in">
          <Link href="/" className="inline-flex items-center gap-2 text-medical-600 hover:text-medical-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            العودة للرئيسية
          </Link>
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-medical-100 rounded-full text-medical-700 text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              <span>منصة علمية احترافية</span>
            </div>
            <h1 className="text-4xl xl:text-5xl font-bold text-medical-900 leading-tight">
              مرحباً بك في
              <span className="block bg-gradient-to-l from-medical-600 to-pharma-600 bg-clip-text text-transparent mt-2">
                الفيض الدوائي العلمي
              </span>
            </h1>
            <p className="text-lg text-slate-600 leading-relaxed">
              نظام متكامل لإدارة الأدوية والمخزون والمبيعات والمشتريات والمحاسبة
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { num: '9', label: 'رتب' },
              { num: '∞', label: 'دواء' },
              { num: '24/7', label: 'متاح' },
            ].map((s, i) => (
              <div key={i} className="text-center p-4 bg-white/60 rounded-xl border border-medical-100">
                <div className="text-3xl font-bold text-medical-600">{s.num}</div>
                <div className="text-sm text-slate-600 mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm text-slate-500 pt-4">
            <Shield className="w-4 h-4 text-pharma-600" />
            <span>بياناتك محمية بتشفير عالي المستوى</span>
          </div>
        </div>

        {/* الجانب الأيمن - نموذج تسجيل الدخول */}
        <div className="bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-medical-100 animate-fade-in">
          <div className="flex items-center justify-center mb-8 lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2 text-medical-600 hover:text-medical-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              العودة
            </Link>
          </div>

          <div className="flex items-center justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Pill className="w-9 h-9 text-white" />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-medical-900 mb-1">تسجيل الدخول</h2>
            <p className="text-slate-600 text-sm">أدخل بياناتك للوصول إلى المنصة</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm text-center">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-medical-800 mb-2">
                البريد الإلكتروني أو اسم المستخدم
              </label>
              <input
                type="text"
                required
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition"
                placeholder="admin@alfaidh.com"
                dir="ltr"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-medical-800 mb-2">
                كلمة المرور
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-medical-400 focus:border-transparent transition pl-12"
                  placeholder="••••••••"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-medical-600 transition"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-xl font-bold hover:shadow-lg hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الدخول...
                </>
              ) : (
                'تسجيل الدخول'
              )}
            </button>
          </form>

          {/* حسابات تجريبية */}
          <div className="mt-6 pt-6 border-t border-slate-200">
            <p className="text-xs text-slate-500 mb-3 text-center">حسابات تجريبية - انقر للتعبئة</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'المدير', user: 'admin' },
                { name: 'المحاسب', user: 'accountant' },
                { name: 'المبيعات', user: 'sales_manager' },
                { name: 'مساعد', user: 'assistant' },
                { name: 'مخزّن', user: 'storekeeper' },
                { name: 'مراجع', user: 'reviewer' },
                { name: 'سائق', user: 'driver' },
                { name: 'متصفح', user: 'viewer' },
              ].map((r) => (
                <button
                  key={r.user}
                  type="button"
                  onClick={() => fillDemo(r.user)}
                  className="text-xs px-3 py-2 bg-medical-50 hover:bg-medical-100 text-medical-700 rounded-lg transition font-medium"
                >
                  {r.name}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 text-center mt-3">كلمة المرور: admin123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
