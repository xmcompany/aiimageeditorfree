/**
 * 将 json 里已迁移到 R2 的视频同步到数据库 showcase 表
 * - 数据库已有的旧 URL → 更新为 R2 URL
 * - 数据库没有的视频 → 插入新记录
 *
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/sync-model-videos-to-db.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { randomUUID } from 'crypto';
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { eq, and, or, ilike } from 'drizzle-orm';
import { getLatestShowcases } from '@/shared/models/showcase';

const MODELS_DIR = path.join(process.cwd(), 'src/config/locale/messages/en/pages/models');
const SYSTEM_USER_ID = '81961172-f752-46da-ab93-5712cf1ac879';

// 模型 slug → 数据库 tag 映射（保持一致）
const MODEL_TAGS: Record<string, string> = {
  seedance: 'seedance',
  wan: 'wan',
  kling: 'kling',
  sora: 'sora',
  veo: 'veo',
  hailuo: 'hailuo',
  'grok-imagine': 'grok-imagine',
  runway: 'runway',
  happyhorse: 'happyhorse',
};

async function run() {
  console.log('\n=== Sync Model Videos to DB ===\n');

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.json'));

  for (const file of files) {
    const modelSlug = file.replace('.json', '');
    const tag = MODEL_TAGS[modelSlug];
    if (!tag) continue;

    const json = JSON.parse(fs.readFileSync(path.join(MODELS_DIR, file), 'utf-8'));
    const jsonVideos: { src: string; prompt?: string }[] = json?.page?.sections?.videos?.videos || [];

    if (!jsonVideos.length) {
      console.log(`⏭  ${modelSlug}: 无 videos section，跳过`);
      continue;
    }

    console.log(`\n📦 处理 ${modelSlug} (json 有 ${jsonVideos.length} 个视频)`);

    // 查数据库现有记录
    const dbItems = await getLatestShowcases({ tags: tag, type: 'video', limit: 50 });
    console.log(`   数据库现有: ${dbItems.length} 条`);

    // 建立旧URL→新URL映射（json 里 R2 地址按顺序对应数据库旧地址）
    // 策略：json 视频数 >= 数据库视频数时，按顺序更新；多余的插入
    let updated = 0;
    let inserted = 0;

    for (let i = 0; i < jsonVideos.length; i++) {
      const r2Url = jsonVideos[i].src;
      const prompt = jsonVideos[i].prompt || `${modelSlug} AI Video Example ${i + 1}`;
      const title = `${modelSlug.charAt(0).toUpperCase() + modelSlug.slice(1)} — AI Generated Video #${i + 1}`;

      if (i < dbItems.length) {
        // 更新现有记录
        const dbItem = dbItems[i];
        if (dbItem.videoUrl !== r2Url || dbItem.image !== r2Url) {
          await db().update(showcase)
            .set({ videoUrl: r2Url, image: r2Url, prompt, title })
            .where(eq(showcase.id, dbItem.id));
          console.log(`  ✅ 更新 [${i + 1}]: ${r2Url.slice(-40)}`);
          updated++;
        } else {
          console.log(`  ⏭  跳过 [${i + 1}]: 已是最新`);
        }
      } else {
        // 插入新记录
        await db().insert(showcase).values({
          id: randomUUID(),
          userId: SYSTEM_USER_ID,
          title,
          prompt,
          image: r2Url,
          videoUrl: r2Url,
          tags: tag,
          type: 'video',
        });
        console.log(`  ➕ 插入 [${i + 1}]: ${r2Url.slice(-40)}`);
        inserted++;
      }
    }

    console.log(`   完成: 更新 ${updated}，插入 ${inserted}`);
  }

  console.log('\n=== 同步完成 ===\n');
}

run().catch(e => { console.error(e); process.exit(1); });
