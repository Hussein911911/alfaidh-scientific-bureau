// Dashboard الرئيسية
import { getSession } from '@/lib/auth';
import { getDb, schema } from '@/lib/db';
import { hasPermission, ROLE_NAMES_AR } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import {
  Database, ShoppingCart, Truck, Wallet, AlertTriangle, Package,
  TrendingUp, Users as UsersIcon, FileText, Pill,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { sql } from 'drizzle-orm';

export default async function DashboardPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  const role = session.user.role;
  const can = (p: any) => hasPermission(role, p);

  // جلب الإحصائيات (بعضها يعتمد على الصلاحيات)
  const db = await getDb();

  const safe = async <T,>(p: boolean, fn: () => Promise<T>, def: T): Promise<T> => {
    if (!p) return def;
    try { return await fn(); } catch { return def; }
  };

  const totalMedicines = await safe(can('medicine:view'), async () => (await db.select({ c: sql<number>`count(*)::int` }).from(schema.medicines))[0]?.c || 0, 0);
  const totalSales = await safe(can('sale:view'), async () => (await db.select({ c: sql<number>`count(*)::int` }).from(schema.sales))[0]?.c || 0, 0);
  const totalPurchases = await safe(can('purchase:view'), async () => (await db.select({ c: sql<number>`count(*)::int` }).from(schema.purchases))[0]?.c || 0, 0);
  const totalDebts = await safe(can('debt:manage'), async () => (await db.select({ c: sql<number>`count(*)::int` }).from(schema.debts))[0]?.c || 0, 0);
  const lowStock = await safe(can('stock:view'), async () => (await db.select({ c: sql<number>`count(*)::int` }).from(schema.medicines).where(sql`${schema.medicines.currentStock} <= 10`))[0]?.c || 0, 0);

  let expiringSoon = 0;
  if (can('medicine:view')) {
    try {
      expiringSoon = (await db.select({ c: sql<number>`count(*)::int` }).from(schema.medicines)
        .where(sql`${schema.medicines.expiryDate} IS NOT NULL AND ${schema.medicines.expiryDate} <= ${new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)}`))[0]?.c || 0;
    } catch { expiringSoon = 0; }
  }

  let recentSales: any[] = [];
  if (can('sale:view')) {
    try {
      const salesRaw = await db.select().from(schema.sales).orderBy(sql`${schema.sales.createdAt} DESC`).limit(5);
      const customerIds = salesRaw.map((s: any) => s.customerId).filter(Boolean) as string[];
      const userIds = salesRaw.map((s: any) => s.createdById);
      const customersRaw = customerIds.length ? await db.select().from(schema.customers) : [];
      const usersRaw = userIds.length ? await db.select({ id: schema.users.id, fullName: schema.users.fullName }).from(schema.users) : [];
      const custMap = new Map(customersRaw.map((c: any) => [c.id, c]));
      const userMap = new Map(usersRaw.map((u: any) => [u.id, u]));
      recentSales = salesRaw.map((s: any) => ({
        ...s,
        customer: s.customerId ? custMap.get(s.customerId) : null,
        createdBy: userMap.get(s.createdById) || { fullName: 'غير معروف' },
      }));
    } catch { recentSales = []; }
  }

  let salesSum = { _sum: { totalAmount: '0' as any, paidAmount: '0' as any } };
  if (can('sale:view')) {
    try {
      const r = await db.select({
        total: sql<string>`COALESCE(SUM(${schema.sales.totalAmount}), 0)::text`,
        paid: sql<string>`COALESCE(SUM(${schema.sales.paidAmount}), 0)::text`,
      }).from(schema.sales).where(sql`${schema.sales.status} = 'COMPLETED'`);
      salesSum = { _sum: { totalAmount: r[0]?.total || '0', paidAmount: r[0]?.paid || '0' } } as any;
    } catch {}
  }

  let purchasesSum = { _sum: { totalAmount: '0' as any } };
  if (can('purchase:view')) {
    try {
      const r = await db.select({ total: sql<string>`COALESCE(SUM(${schema.purchases.totalAmount}), 0)::text` }).from(schema.purchases);
      purchasesSum = { _sum: { totalAmount: r[0]?.total || '0' } } as any;
    } catch {}
  }

  let debtsSum = { _sum: { amount: '0' as any, paidAmount: '0' as any } };
  if (can('debt:manage')) {
    try {
      const r = await db.select({
        amount: sql<string>`COALESCE(SUM(${schema.debts.amount}), 0)::text`,
        paid: sql<string>`COALESCE(SUM(${schema.debts.paidAmount}), 0)::text`,
      }).from(schema.debts);
      debtsSum = { _sum: { amount: r[0]?.amount || '0', paidAmount: r[0]?.paid || '0' } } as any;
    } catch {}
  }

  const stats = [
    {
      title: 'إجمالي الأدوية',
      value: totalMedicines.toLocaleString('ar-IQ'),
      icon: Database,
      color: 'from-blue-500 to-cyan-500',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      show: can('medicine:view'),
    },
    {
      title: 'إجمالي المبيعات',
      value: formatCurrency(Number(salesSum._sum.totalAmount) || 0),
      subValue: `${totalSales} فاتورة`,
      icon: ShoppingCart,
      color: 'from-emerald-500 to-teal-500',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      show: can('sale:view'),
    },
    {
      title: 'إجمالي المشتريات',
      value: formatCurrency(Number(purchasesSum._sum.totalAmount) || 0),
      subValue: `${totalPurchases} طلب`,
      icon: Truck,
      color: 'from-amber-500 to-orange-500',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      show: can('purchase:view'),
    },
    {
      title: 'الديون المستحقة',
      value: formatCurrency(Number(debtsSum._sum.amount) - Number(debtsSum._sum.paidAmount) || 0),
      subValue: `${totalDebts} دين`,
      icon: Wallet,
      color: 'from-red-500 to-pink-500',
      bg: 'bg-red-50',
      text: 'text-red-700',
      show: can('debt:manage'),
    },
    {
      title: 'مخزون منخفض',
      value: lowStock.toString(),
      subValue: 'يحتاج إعادة طلب',
      icon: AlertTriangle,
      color: 'from-orange-500 to-red-500',
      bg: 'bg-orange-50',
      text: 'text-orange-700',
      show: can('stock:view') && lowStock > 0,
    },
    {
      title: 'قارب على الانتهاء',
      value: expiringSoon.toString(),
      subValue: 'خلال 90 يوم',
      icon: Package,
      color: 'from-purple-500 to-indigo-500',
      bg: 'bg-purple-50',
      text: 'text-purple-700',
      show: can('medicine:view') && expiringSoon > 0,
    },
  ].filter((s) => s.show);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-l from-medical-500 via-medical-600 to-pharma-600 rounded-2xl p-6 sm:p-8 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Pill className="w-5 h-5" />
          <span className="text-sm opacity-90">لوحة التحكم</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          مرحباً، {session.user.fullName}
        </h1>
        <p className="opacity-90">
          {ROLE_NAMES_AR[role]} - {new Date().toLocaleDateString('ar-IQ', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center shadow-md`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-slate-500 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              {stat.subValue && <p className="text-xs text-slate-400 mt-1">{stat.subValue}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Recent sales */}
      {can('sale:view') && recentSales.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-medical-900">آخر المبيعات</h2>
              <p className="text-sm text-slate-500">آخر 5 فواتير</p>
            </div>
            <TrendingUp className="w-5 h-5 text-medical-500" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 text-right font-medium">رقم الفاتورة</th>
                  <th className="px-4 py-3 text-right font-medium">الزبون</th>
                  <th className="px-4 py-3 text-right font-medium">المبلغ</th>
                  <th className="px-4 py-3 text-right font-medium">الحالة</th>
                  <th className="px-4 py-3 text-right font-medium">التاريخ</th>
                </tr>
              </thead>
              <tbody>
                {recentSales.map((sale: any) => (
                  <tr key={sale.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs">{sale.invoiceNumber}</td>
                    <td className="px-4 py-3">{sale.customer?.name || sale.customerName || 'بدون اسم'}</td>
                    <td className="px-4 py-3 font-bold text-medical-700">{formatCurrency(Number(sale.totalAmount) || 0)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        sale.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-700' :
                        sale.status === 'PENDING' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {sale.status === 'COMPLETED' ? 'مكتملة' :
                         sale.status === 'PENDING' ? 'معلقة' :
                         sale.status === 'CANCELLED' ? 'ملغاة' : 'جزئية'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(sale.createdAt).toLocaleDateString('ar-IQ')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: '/dashboard/medicines', label: 'الأدوية', icon: Database, color: 'bg-blue-50 text-blue-700' },
          { href: '/dashboard/sales', label: 'مبيعة جديدة', icon: ShoppingCart, color: 'bg-emerald-50 text-emerald-700', show: can('sale:create') },
          { href: '/dashboard/purchases', label: 'طلب شراء', icon: Truck, color: 'bg-amber-50 text-amber-700', show: can('purchase:create') },
          { href: '/dashboard/reports', label: 'التقارير', icon: FileText, color: 'bg-purple-50 text-purple-700', show: can('report:view') },
        ].filter(a => a.show !== false).map((action, i) => (
          <a
            key={i}
            href={action.href}
            className={`${action.color} rounded-xl p-4 hover:scale-105 transition-transform text-center`}
          >
            <action.icon className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-medium">{action.label}</p>
          </a>
        ))}
      </div>
    </div>
  );
}
