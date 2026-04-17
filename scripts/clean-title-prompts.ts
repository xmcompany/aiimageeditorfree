/**
 * 清理数据库中 title 格式的无效 prompt
 * 如 "Seedance — AI Generated Video #1"、"Veo 3.1 — AI Generated Video #1" 等
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { ilike, or } from 'drizzle-orm';

async function run() {
  const result = await db().update(showcase)
    .set({ prompt: null })
    .where(
      or(
        ilike(showcase.prompt, '%— AI Generated Video%'),
        ilike(showcase.prompt, '%AI Generated Video #%'),
        ilike(showcase.prompt, '%AI Video Example%'),
      )
    )
    .returning({ id: showcase.id, tags: showcase.tags, prompt: showcase.prompt });

  console.log(`清理了 ${result.length} 条无效 prompt`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
