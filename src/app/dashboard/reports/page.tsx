import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { BarChart3 } from 'lucide-react';

export default async function ReportsPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'report:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض التقارير</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
          <BarChart3 className="w-7 h-7 text-medical-500" />
          التقارير
        </h1>
        <p className="text-slate-500 mt-1">تقارير المبيعات والمشتريات والمخزون</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <BarChart3 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-medical-900 mb-2">صفحة التقارير</h2>
        <p className="text-slate-500">سيتم تطوير واجهة التقارير الكاملة قريباً - البنية الأساسية جاهزة</p>
      </div>
    </div>
  );
}
