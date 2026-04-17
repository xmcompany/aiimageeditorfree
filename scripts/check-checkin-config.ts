import { db } from '@/core/db';
import { config } from '@/config/db/schema';
import { like } from 'drizzle-orm';

async function run() {
  const rows = await db().select().from(config).where(like(config.name, 'checkin%'));
  console.log('checkin configs:', rows);
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
