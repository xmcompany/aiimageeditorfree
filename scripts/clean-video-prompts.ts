/**
 * 清理 prompt 表中无效的 title 格式记录
 * 如 "Veo 3.1 — AI Generated Video #1"、"veo-ai-video-example-1" 等
 */
import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';
import { ilike, or } from 'drizzle-orm';

async function run() {
  // 先查看有多少条
  const all = await db().select({ id: prompt.id, title: prompt.title, promptTitle: prompt.promptTitle }).from(prompt);
  console.log(`总记录: ${all.length}`);

  const invalid = all.filter(r => {
    const p = r.promptTitle || '';
    return (
      /— AI Generated Video/i.test(p) ||
      /AI Generated Video #/i.test(p) ||
      /AI Video Example/i.test(p) ||
      /^[\w]+-ai-video-example-\d+$/.test(r.title || '')
    );
  });

  console.log(`无效记录: ${invalid.length}`);
  invalid.forEach(r => console.log(`  title: ${r.title} | prompt: ${r.promptTitle}`));

  if (invalid.length === 0) {
    console.log('无需清理');
    return;
  }

  // 删除无效记录
  const result = await db().delete(prompt)
    .where(
      or(
        ilike(prompt.promptTitle, '%— AI Generated Video%'),
        ilike(prompt.promptTitle, '%AI Generated Video #%'),
        ilike(prompt.promptTitle, '%AI Video Example%'),
      )
    )
    .returning({ id: prompt.id });

  console.log(`\n✅ 删除了 ${result.length} 条无效记录`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
