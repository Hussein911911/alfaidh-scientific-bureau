// Prisma client compatibility layer
// يوفر نفس الواجهة البرمجية القديمة لكن باستخدام Drizzle + PGlite/Postgres
import { getDb, schema } from './db';
import { sql } from 'drizzle-orm';

export { schema, getDb };

export async function executeRaw(query: string, params: any[] = []) {
  const db = await getDb();
  return await db.execute(sql.raw(query));
}
