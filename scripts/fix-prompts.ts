/**
 * 1. 删除 video prompts 里 title 格式为 "ModelName — AI Generated Video #N" 的无效记录
 * 2. 为 image prompts 填充 model 字段（目前都是 NULL，image 类型暂时不需要 model）
 */
import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';
import { and, eq, ilike, or } from 'drizzle-orm';

async function run() {
  // 1. 删除无效 video prompts
  const deleted = await db().delete(prompt)
    .where(
      and(
        eq(prompt.type, 'video'),
        or(
          ilike(prompt.title, '%— AI Generated Video%'),
          ilike(prompt.title, '%AI Generated Video #%'),
          ilike(prompt.promptTitle, '%— AI Generated Video%'),
        )
      )
    )
    .returning({ id: prompt.id, title: prompt.title });

  console.log(`删除了 ${deleted.length} 条无效 video prompts:`);
  deleted.forEach(r => console.log(`  ${r.title}`));

  // 2. 查看剩余 video prompts
  const remaining = await db().select().from(prompt).where(eq(prompt.type, 'video'));
  console.log(`\n剩余 video prompts: ${remaining.length}`);
  remaining.forEach(r => console.log(`  ${r.title} | model=${(r as any).model || 'NULL'}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
