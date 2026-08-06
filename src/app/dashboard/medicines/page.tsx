// صفحة الأدوية - عرض وبحث وفلترة
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDb, schema } from '@/lib/db';
import { hasPermission } from '@/lib/permissions';
import { desc, asc } from 'drizzle-orm';
import { MedicinesView } from '@/components/medicines/MedicinesView';

export default async function MedicinesPage() {
  const session = await getSession();
  if (!session) redirect('/login');

  if (!hasPermission(session.user.role, 'medicine:view')) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-6 text-center">
        <p className="font-bold">لا تملك الصلاحية لعرض الأدوية</p>
      </div>
    );
  }

  const db = await getDb();
  const [medicinesRaw, categories, manufacturers] = await Promise.all([
    db.select().from(schema.medicines).orderBy(desc(schema.medicines.createdAt)),
    db.select().from(schema.categories).orderBy(asc(schema.categories.name)),
    db.select().from(schema.manufacturers).orderBy(asc(schema.manufacturers.name)),
  ]);

  // إثراء الأدوية بالعلاقات
  const catMap = new Map(categories.map((c: any) => [c.id, c]));
  const manMap = new Map(manufacturers.map((m: any) => [m.id, m]));
  const userIds = [...new Set(medicinesRaw.map((m: any) => m.createdById))];
  const usersRaw = userIds.length
    ? await db.select({ id: schema.users.id, fullName: schema.users.fullName }).from(schema.users)
    : [];
  const userMap = new Map(usersRaw.map((u: any) => [u.id, u]));

  const medicines = medicinesRaw.map((m: any) => {
    const u = userMap.get(m.createdById) as any;
    return {
      ...m,
      category: m.categoryId ? catMap.get(m.categoryId) || null : null,
      manufacturer: m.manufacturerId ? manMap.get(m.manufacturerId) || null : null,
      createdBy: u ? { fullName: u.fullName } : null,
    };
  });

  const canCreate = hasPermission(session.user.role, 'medicine:create');
  const canEdit = hasPermission(session.user.role, 'medicine:update');
  const canDelete = hasPermission(session.user.role, 'medicine:delete');
  const canPrint = hasPermission(session.user.role, 'medicine:print');

  return (
    <MedicinesView
      medicines={medicines as any}
      categories={categories}
      manufacturers={manufacturers}
      permissions={{ canCreate, canEdit, canDelete, canPrint }}
      currentUserId={session.user.id}
    />
  );
}
