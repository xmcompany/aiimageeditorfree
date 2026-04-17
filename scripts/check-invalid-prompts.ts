import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';

async function run() {
  const rows = await db().select({
    id: showcase.id,
    title: showcase.title,
    prompt: showcase.prompt,
    tags: showcase.tags,
    videoUrl: showcase.videoUrl,
  }).from(showcase).limit(200);

  // slug 格式或太短的 prompt
  const invalid = rows.filter(r => {
    if (!r.prompt) return false;
    const p = r.prompt.trim();
    return p.length < 20 || /^[\w\s\-–—#]+$/.test(p);
  });

  console.log(`总记录: ${rows.length}，无效 prompt: ${invalid.length}\n`);
  invalid.forEach(r => console.log(`[${r.tags}] "${r.prompt}" | title: ${r.title}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
