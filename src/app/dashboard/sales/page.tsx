import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { ShoppingCart, Plus } from 'lucide-react';

export default async function SalesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'sale:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض المبيعات</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-medical-500" />
            المبيعات
          </h1>
          <p className="text-slate-500 mt-1">إدارة الفواتير والمبيعات</p>
        </div>
        {hasPermission(session.user.role, 'sale:create') && (
          <button className="px-4 py-2 bg-gradient-to-l from-medical-500 to-medical-600 text-white rounded-lg font-bold flex items-center gap-2">
            <Plus className="w-4 h-4" /> فاتورة جديدة
          </button>
        )}
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-slate-300 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-medical-900 mb-2">صفحة المبيعات</h2>
        <p className="text-slate-500">سيتم تطوير واجهة المبيعات الكاملة قريباً - البنية الأساسية جاهزة</p>
      </div>
    </div>
  );
}
