/**
 * 修复 showcase title：
 * 1. 有 prompt 的 → 用 prompt 前60字符作为 title
 * 2. 没有 prompt 的 → 按 tags 分组，每组第1条改为 "AI Video Generator Free — [Model]"，其余改为 "[Model] — Cinematic AI Video"
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/fix-showcase-titles.ts
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { like, eq, desc } from 'drizzle-orm';

// 模型名称映射
const MODEL_NAMES: Record<string, string> = {
  'seedance': 'Seedance 2.0',
  'wan': 'Wan 2.7',
  'kling': 'Kling 3.0',
  'sora': 'Sora 2 Pro',
  'veo': 'Veo 3.1',
  'hailuo': 'Hailuo 2.3',
  'grok': 'Grok Imagine',
  'grok-imagine': 'Grok Imagine',
  'runway': 'Runway Gen-4',
  'happyhorse': 'HappyHorse 1.0',
};

async function run() {
  console.log('\n=== Fix Showcase Titles ===\n');

  // 获取所有 "AI Generated Video" 格式的 showcase
  const results = await db()
    .select({
      id: showcase.id,
      title: showcase.title,
      prompt: showcase.prompt,
      tags: showcase.tags,
    })
    .from(showcase)
    .orderBy(desc(showcase.createdAt));

  const toFix = results.filter(r => r.title?.includes('AI Generated Video'));
  console.log(`Found ${toFix.length} showcases to fix\n`);

  // 按 tags 分组，记录每组第一条（用于放 "AI Video Generator Free" 关键词）
  const tagFirstSeen = new Set<string>();
  let keywordCount = 0;
  let updated = 0;

  for (const item of toFix) {
    const tag = item.tags?.split(',')[0]?.trim() || 'video';
    const modelName = MODEL_NAMES[tag] || tag;
    let newTitle: string;

    if (item.prompt?.trim() && !item.prompt.includes('prompt:string')) {
      // 有有效 prompt → 用 prompt 截断作为 title
      const cleanPrompt = item.prompt.trim().replace(/\n/g, ' ');
      newTitle = cleanPrompt.length > 70
        ? cleanPrompt.slice(0, 67) + '...'
        : cleanPrompt;
    } else if (!tagFirstSeen.has(tag) && keywordCount < 5) {
      // 每个 tag 的第一条 + 总数不超过5条 → 用关键词
      newTitle = `AI Video Generator Free — ${modelName}`;
      tagFirstSeen.add(tag);
      keywordCount++;
    } else {
      // 其余 → "[Model] — Cinematic AI Video"
      newTitle = `${modelName} — Cinematic AI Video`;
    }

    await db()
      .update(showcase)
      .set({ title: newTitle })
      .where(eq(showcase.id, item.id));

    console.log(`✅ [${item.id.slice(0, 8)}] "${item.title?.slice(0, 40)}" → "${newTitle}"`);
    updated++;
  }

  console.log(`\n🎉 Done! Updated ${updated} showcases. Keyword titles used: ${keywordCount}/5\n`);
  process.exit(0);
}

run().catch(e => { console.error(e); process.exit(1); });
