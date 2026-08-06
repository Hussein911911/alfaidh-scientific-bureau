import { getSession } from '@/lib/auth';
import { hasPermission, ROLE_NAMES_AR } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Settings, Shield, Database, Users, BarChart3 } from 'lucide-react';

export default async function SettingsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'settings:manage')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية للإعدادات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
          <Settings className="w-7 h-7 text-medical-500" />
          الإعدادات
        </h1>
        <p className="text-slate-500 mt-1">إعدادات النظام والرتب</p>
      </div>

      {/* معلومات النظام */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-medical-500 to-pharma-500 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-medical-900">معلومات المنصة</h2>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">الاسم:</span> <span className="font-bold">الفيض الدوائي العلمي</span></div>
            <div className="flex justify-between"><span className="text-slate-500">الإصدار:</span> <span className="font-mono">1.0.0</span></div>
            <div className="flex justify-between"><span className="text-slate-500">قاعدة البيانات:</span> <span className="font-mono">PostgreSQL</span></div>
            <div className="flex justify-between"><span className="text-slate-500">إطار العمل:</span> <span className="font-mono">Next.js 14</span></div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="font-bold text-medical-900">الرتب والصلاحيات</h2>
          </div>
          <div className="space-y-1.5 text-xs max-h-64 overflow-y-auto">
            {Object.entries(ROLE_NAMES_AR).map(([k, v]) => (
              <div key={k} className="flex justify-between items-center p-2 bg-slate-50 rounded">
                <span className="font-bold text-medical-800">{v}</span>
                <span className="font-mono text-slate-500">{k}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
        <h2 className="font-bold text-amber-900 mb-2">⚙️ ملاحظة</h2>
        <p className="text-sm text-amber-800">
          البنية الأساسية للمنصة جاهزة. الأقسام التالية قيد التطوير وستتم إضافتها قريباً:
          واجهة المبيعات الكاملة، الموردين والعملاء، الفواتير المطبوعة، إدارة المخزون المتقدمة، التقارير البيانية.
        </p>
      </div>
    </div>
  );
}
