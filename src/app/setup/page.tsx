'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, Loader2, Database, Key, RefreshCw } from 'lucide-react';

export default function SetupPage() {
  const [step, setStep] = useState<'check' | 'seed' | 'reset' | 'done'>('check');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ step: string; success: boolean; message: string }[]>([]);
  const [autoRun, setAutoRun] = useState(true);

  useEffect(() => {
    // تشغيل تلقائي عند فتح الصفحة
    if (autoRun) {
      runSetup();
      setAutoRun(false);
    }
  }, []);

  async function runSetup() {
    setLoading(true);
    const newResults: typeof results = [];

    // الخطوة 1: محاولة Seed
    setStep('seed');
    try {
      const res = await fetch('/api/admin/seed', { method: 'GET' });
      const data = await res.json();
      newResults.push({
        step: 'إنشاء البيانات',
        success: data.success,
        message: data.message || data.error || 'تم',
      });
    } catch (e: any) {
      newResults.push({
        step: 'إنشاء البيانات',
        success: false,
        message: e?.message || 'فشل الاتصال',
      });
    }
    setResults([...newResults]);

    // الخطوة 2: إضافة رحلات للسائق
    try {
      const res = await fetch('/api/admin/add-trips', { method: 'GET' });
      const data = await res.json();
      newResults.push({
        step: 'إضافة رحلات للسائق',
        success: data.success !== false,
        message: data.message || data.error || 'تم',
      });
    } catch (e: any) {
      newResults.push({
        step: 'إضافة رحلات للسائق',
        success: false,
        message: e?.message || 'فشل الاتصال',
      });
    }
    setResults([...newResults]);

    // الخطوة 3: تحديث كلمات المرور
    setStep('reset');
    try {
      const res = await fetch('/api/admin/reset-passwords', { method: 'GET' });
      const data = await res.json();
      newResults.push({
        step: 'تحديث كلمات المرور',
        success: data.success !== false,
        message: data.message || data.error || 'تم',
      });
    } catch (e: any) {
      newResults.push({
        step: 'تحديث كلمات المرور',
        success: false,
        message: e?.message || 'فشل الاتصال',
      });
    }
    setResults([...newResults]);

    setStep('done');
    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-medical-50 to-pharma-50">
      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl p-8 sm:p-10 border border-medical-100">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Database className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-medical-900 mb-2">إعداد قاعدة البيانات</h1>
          <p className="text-slate-600">
            منصة الفيض الدوائي العلمي - Alfaidh Scientific Bureau
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 mb-6">
          {[
            { key: 'check', label: 'فحص قاعدة البيانات', icon: Database },
            { key: 'seed', label: 'إنشاء البيانات الأولية', icon: Database },
            { key: 'reset', label: 'تحديث كلمات المرور والرحلات', icon: Key },
            { key: 'done', label: 'اكتمل الإعداد', icon: CheckCircle2 },
          ].map((s) => {
            const isActive = step === s.key;
            const isDone = ['seed', 'reset', 'done'].indexOf(step) > ['seed', 'reset', 'done'].indexOf(s.key as any);
            const Icon = s.icon;
            return (
              <div
                key={s.key}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isActive
                    ? 'bg-medical-50 border-medical-300'
                    : isDone
                    ? 'bg-emerald-50 border-emerald-200'
                    : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive
                      ? 'bg-medical-500 text-white'
                      : isDone
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-300 text-white'
                  }`}
                >
                  {isActive ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isDone ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : (
                    <Icon className="w-5 h-5" />
                  )}
                </div>
                <span className={`font-medium ${isActive || isDone ? 'text-medical-900' : 'text-slate-500'}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-2 mb-6">
            {results.map((r, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 p-3 rounded-lg text-sm ${
                  r.success
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }`}
              >
                {r.success ? (
                  <CheckCircle2 className="w-4 h-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-bold">{r.step}</p>
                  <p className="text-xs mt-1">{r.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        {step === 'done' && (
          <div className="space-y-3">
            <div className="bg-gradient-to-l from-emerald-500 to-pharma-500 rounded-xl p-5 text-white text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-2" />
              <h3 className="font-bold text-lg mb-1">الإعداد مكتمل!</h3>
              <p className="text-sm opacity-90 mb-3">
                يمكنك الآن تسجيل الدخول بأي حساب من الحسابات التجريبية
              </p>
              <div className="bg-white/20 rounded-lg p-3 text-sm">
                <p className="font-bold mb-1">كلمة المرور الموحدة:</p>
                <p className="font-mono text-lg">admin123</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="/login"
                className="block p-3 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-lg text-center font-bold hover:shadow-lg transition"
              >
                الذهاب لتسجيل الدخول
              </a>
              <a
                href="/"
                className="block p-3 bg-slate-100 text-slate-700 rounded-lg text-center font-medium hover:bg-slate-200 transition"
              >
                الصفحة الرئيسية
              </a>
            </div>

            <button
              onClick={runSetup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 transition text-sm font-medium"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              إعادة المحاولة
            </button>
          </div>
        )}

        {loading && step !== 'done' && (
          <div className="text-center text-sm text-slate-500">
            <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2" />
            جاري الإعداد... انتظر قليلاً
          </div>
        )}

        {/* Account list */}
        <details className="mt-6 border border-slate-200 rounded-xl">
          <summary className="p-4 cursor-pointer text-sm font-medium text-medical-800 hover:bg-slate-50">
            📋 الحسابات المتاحة (9 حسابات)
          </summary>
          <div className="p-4 pt-0 space-y-1 text-xs">
            {[
              { name: 'المدير العام', email: 'admin@alfaidh.com' },
              { name: 'المحاسب', email: 'accountant@alfaidh.com' },
              { name: 'مدير المبيعات', email: 'sales@alfaidh.com' },
              { name: 'مساعد الصيدلية', email: 'assistant@alfaidh.com' },
              { name: 'المخزّن', email: 'storekeeper@alfaidh.com' },
              { name: 'المراجع العلمي', email: 'reviewer@alfaidh.com' },
              { name: 'السائق', email: 'driver@alfaidh.com' },
              { name: 'مسؤول الرحلات', email: 'coordinator@alfaidh.com' },
              { name: 'المتصفح', email: 'viewer@alfaidh.com' },
            ].map((a) => (
              <div key={a.email} className="flex justify-between p-2 hover:bg-slate-50 rounded">
                <span className="text-slate-700">{a.name}</span>
                <span className="font-mono text-medical-600" dir="ltr">{a.email}</span>
              </div>
            ))}
          </div>
        </details>
      </div>
    </div>
  );
}
