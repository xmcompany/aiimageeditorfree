import { db } from '@/core/db';
import { user } from '@/config/db/schema';

async function run() {
  const result = await db().select().from(user).limit(5);
  result.forEach(u => console.log(`id: ${u.id}  email: ${u.email}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
