/**
 * 将数据库中 image 字段与 videoUrl 相同的记录，
 * 更新 image 为 videoUrl#t=0.5，让首页 VideoThumbnail 自动显示第0.5秒帧
 *
 * 用法: npx tsx scripts/with-env.ts npx tsx scripts/update-video-thumbnails.ts
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { eq, and, isNotNull } from 'drizzle-orm';

async function run() {
  console.log('\n=== Update Video Thumbnails ===\n');

  // 查出所有 type=video 且 image === videoUrl 的记录（还没设置缩略图的）
  const rows = await db()
    .select({ id: showcase.id, videoUrl: showcase.videoUrl, image: showcase.image })
    .from(showcase)
    .where(and(eq(showcase.type, 'video'), isNotNull(showcase.videoUrl)));

  const toUpdate = rows.filter(r =>
    r.videoUrl &&
    r.image === r.videoUrl &&
    !r.image.includes('#t=')
  );

  console.log(`找到 ${toUpdate.length} 条需要更新的记录\n`);

  let updated = 0;
  for (const row of toUpdate) {
    const thumbUrl = `${row.videoUrl}#t=0.5`;
    await db().update(showcase)
      .set({ image: thumbUrl })
      .where(eq(showcase.id, row.id));
    console.log(`  ✅ ${row.videoUrl!.slice(-50)}`);
    updated++;
  }

  console.log(`\n=== 完成，更新 ${updated} 条 ===\n`);
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
