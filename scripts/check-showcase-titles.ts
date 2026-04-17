/**
 * 查看 showcase 的 title 和 prompt 字段
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/check-showcase-titles.ts
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { desc } from 'drizzle-orm';

async function run() {
  const results = await db()
    .select({
      id: showcase.id,
      title: showcase.title,
      prompt: showcase.prompt,
      type: showcase.type,
      tags: showcase.tags,
    })
    .from(showcase)
    .orderBy(desc(showcase.createdAt))
    .limit(50);

  console.log(`Total fetched: ${results.length}\n`);

  let emptyPrompt = 0;
  let aiGeneratedTitle = 0;

  results.forEach(r => {
    const hasPrompt = !!r.prompt?.trim();
    const isGenerated = r.title?.includes('AI Generated Video');
    if (!hasPrompt) emptyPrompt++;
    if (isGenerated) aiGeneratedTitle++;
    console.log(`[${r.id.slice(0, 8)}] title="${r.title?.slice(0, 55)}" | prompt="${r.prompt?.slice(0, 50) || 'EMPTY'}" | tags=${r.tags?.slice(0, 20)}`);
  });

  console.log(`\nSummary: empty prompt=${emptyPrompt}, "AI Generated Video" title=${aiGeneratedTitle}`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
