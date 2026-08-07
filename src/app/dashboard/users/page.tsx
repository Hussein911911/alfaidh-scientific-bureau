import { getSession } from '@/lib/auth';
import { hasPermission, ROLE_NAMES_AR } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/lib/db';
import { desc } from 'drizzle-orm';
import { Users } from 'lucide-react';

export default async function UsersPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'user:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض المستخدمين</p>
      </div>
    );
  }

  const db = await getDb();
  const users = await db.select({
    id: schema.users.id,
    email: schema.users.email,
    username: schema.users.username,
    fullName: schema.users.fullName,
    phone: schema.users.phone,
    role: schema.users.role,
    status: schema.users.status,
    lastLoginAt: schema.users.lastLoginAt,
    createdAt: schema.users.createdAt,
  }).from(schema.users).orderBy(desc(schema.users.createdAt));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
          <Users className="w-7 h-7 text-medical-500" />
          المستخدمون
        </h1>
        <p className="text-slate-500 mt-1">إدارة مستخدمي المنصة ({users.length} مستخدم)</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">الاسم</th>
                <th className="px-4 py-3 text-right font-semibold">اسم المستخدم</th>
                <th className="px-4 py-3 text-right font-semibold">البريد</th>
                <th className="px-4 py-3 text-right font-semibold">الدور</th>
                <th className="px-4 py-3 text-right font-semibold">الحالة</th>
                <th className="px-4 py-3 text-right font-semibold">آخر دخول</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u: any) => (
                <tr key={u.id} className="border-t border-slate-100 hover:bg-slate-50">
                  <td className="px-4 py-3 font-bold text-medical-900">{u.fullName}</td>
                  <td className="px-4 py-3 text-slate-600 font-mono text-xs">{u.username}</td>
                  <td className="px-4 py-3 text-slate-600 text-xs">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-1 bg-medical-100 text-medical-700 rounded-full text-xs font-bold">
                      {ROLE_NAMES_AR[u.role as keyof typeof ROLE_NAMES_AR] || u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' :
                      u.status === 'INACTIVE' ? 'bg-slate-100 text-slate-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {u.status === 'ACTIVE' ? 'نشط' : u.status === 'INACTIVE' ? 'غير نشط' : 'موقوف'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500 text-xs">
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString('ar-IQ') : 'لم يدخل'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
