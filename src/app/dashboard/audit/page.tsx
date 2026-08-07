import { getSession } from '@/lib/auth';
import { hasPermission } from '@/lib/permissions';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/lib/db';
import { desc, eq } from 'drizzle-orm';
import { ClipboardCheck } from 'lucide-react';

export default async function AuditPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'settings:manage')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض سجل النشاط</p>
      </div>
    );
  }

  const db = await getDb();
  const logsRaw = await db.select().from(schema.activityLogs).orderBy(desc(schema.activityLogs.createdAt)).limit(100);
  const userIds = [...new Set(logsRaw.map((l: any) => l.userId))];
  const usersRaw = userIds.length > 0
    ? await db.select({ id: schema.users.id, fullName: schema.users.fullName, role: schema.users.role }).from(schema.users)
    : [];
  const userMap = new Map(usersRaw.map((u: any) => [u.id, u]));
  const logs = logsRaw.map((l: any) => ({ ...l, user: userMap.get(l.userId) || { fullName: 'غير معروف', role: 'VIEWER' as const } }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-medical-900 flex items-center gap-2">
          <ClipboardCheck className="w-7 h-7 text-medical-500" />
          سجل النشاط
        </h1>
        <p className="text-slate-500 mt-1">آخر 100 نشاط في النظام</p>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase">
              <tr>
                <th className="px-4 py-3 text-right font-semibold">المستخدم</th>
                <th className="px-4 py-3 text-right font-semibold">الإجراء</th>
                <th className="px-4 py-3 text-right font-semibold">التفاصيل</th>
                <th className="px-4 py-3 text-right font-semibold">التاريخ</th>
              </tr>
            </thead>
            <tbody>
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-12 text-center text-slate-400">
                    لا توجد أنشطة مسجلة
                  </td>
                </tr>
              ) : (
                logs.map((log: any) => (
                  <tr key={log.id} className="border-t border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-bold text-medical-900">{log.user.fullName}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-medical-100 text-medical-700 rounded text-xs font-mono">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{log.details || '-'}</td>
                    <td className="px-4 py-3 text-slate-500 text-xs">
                      {new Date(log.createdAt).toLocaleString('ar-IQ')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
