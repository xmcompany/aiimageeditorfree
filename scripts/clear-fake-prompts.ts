/**
 * 清空数据库中的占位 prompt（非真实内容）
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/clear-fake-prompts.ts
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { ilike, or } from 'drizzle-orm';

async function run() {
  const result = await db().update(showcase)
    .set({ prompt: null })
    .where(
      or(
        ilike(showcase.prompt, '%AI Video Example%'),
      )
    )
    .returning({ id: showcase.id, tags: showcase.tags });

  console.log(`已清空 ${result.length} 条占位 prompt`);
  result.forEach(r => console.log(`  [${r.tags}] ${r.id}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
