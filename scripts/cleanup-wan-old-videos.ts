import { db } from '@/core/db';
import { showcase } from '@/config/db/schema';
import { and, ilike, or, notIlike } from 'drizzle-orm';

async function run() {
  // 删除 wan tag 下还是第三方地址的记录
  const result = await db().delete(showcase)
    .where(
      and(
        or(
          ilike(showcase.tags, 'wan,%'),
          ilike(showcase.tags, '%,wan,%'),
          ilike(showcase.tags, '%,wan'),
          ilike(showcase.tags, 'wan')
        ),
        notIlike(showcase.videoUrl as any, '%cdn.aivideogeneratorfree.org%')
      )
    )
    .returning({ id: showcase.id, videoUrl: showcase.videoUrl });

  console.log(`删除 ${result.length} 条旧记录:`);
  result.forEach(r => console.log(`  ${r.videoUrl}`));
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
