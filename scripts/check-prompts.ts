import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';

async function run() {
  const rows = await db().select().from(prompt).limit(20);
  console.log(`Total: ${rows.length}`);
  rows.forEach(r => console.log(`  [${r.type}] model=${(r as any).model || 'NULL'} | title=${r.title} | slug=${r.title?.toLowerCase().replace(/[^a-z0-9]+/g,'-')}`));
}
run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
