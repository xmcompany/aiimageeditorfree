/**
 * 清理数据库 image 字段中的 #t=0.5 fragment
 * VideoThumbnail 组件会自动加，不需要存在数据库里
 */
import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { like } from 'drizzle-orm';

async function run() {
  const rows = await db().select({ id: showcase.id, image: showcase.image })
    .from(showcase)
    .where(like(showcase.image, '%#t=%'));

  console.log(`找到 ${rows.length} 条需要清理的记录`);

  for (const row of rows) {
    const cleanImage = row.image.split('#')[0];
    await db().update(showcase).set({ image: cleanImage })
      .where(like(showcase.image, '%#t=%'));
    break; // 用 like 批量更新
  }

  // 批量更新
  if (rows.length > 0) {
    for (const row of rows) {
      const cleanImage = row.image.split('#')[0];
      await db().update(showcase)
        .set({ image: cleanImage })
        .where(like(showcase.id, row.id));
    }
    console.log('✅ 清理完成');
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
