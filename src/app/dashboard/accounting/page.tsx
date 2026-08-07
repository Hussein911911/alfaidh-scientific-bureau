import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { Wallet } from 'lucide-react';

export default async function AccountingPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'accounting:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض المحاسبة</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
          <Wallet className="w-7 h-7 text-medical-500" />
          المحاسبة
        </h1>
        <p className="text-slate-500 mt-1">إدارة المدفوعات والتقارير المالية</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <Wallet className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-medical-900 mb-2">صفحة المحاسبة</h2>
        <p className="text-slate-500">سيتم تطوير واجهة المحاسبة الكاملة قريباً - البنية الأساسية جاهزة</p>
      </div>
    </div>
  );
}
