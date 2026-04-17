import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { ilike, or } from 'drizzle-orm';

async function run() {
  const result = await db().select({
    id: showcase.id,
    tags: showcase.tags,
    title: showcase.title,
    prompt: showcase.prompt,
    videoUrl: showcase.videoUrl,
  }).from(showcase)
    .where(
      or(
        ilike(showcase.prompt, '%AI Video Example%'),
        ilike(showcase.title, '%AI Generated Video%'),
      )
    );

  console.log(`找到 ${result.length} 条占位记录:\n`);
  result.forEach(r => {
    console.log(`[${r.tags}] ${r.title}`);
    console.log(`  prompt: ${r.prompt}`);
    console.log(`  url: ${r.videoUrl?.slice(-50)}\n`);
  });
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
