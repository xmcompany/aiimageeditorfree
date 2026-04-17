#!/usr/bin/env node
/**
 * 下载 models 页面的第三方视频，上传到 Cloudflare R2，并更新 json 配置
 *
 * 用法:
 *   npx tsx scripts/with-env.ts npx tsx scripts/migrate-model-videos-to-r2.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { db } from '@/core/db';
import { config as configTable } from '@/config/db/schema';
import { R2Provider } from '@/extensions/storage/r2';

const MODELS_DIR = path.join(process.cwd(), 'src/config/locale/messages/en/pages/models');

async function getR2Configs() {
  const rows = await db().select().from(configTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.value) map[row.name] = row.value;
  }
  return map;
}

async function run() {
  console.log('\n=== Migrate Model Videos to R2 ===\n');

  const configs = await getR2Configs();

  if (!configs.r2_access_key || !configs.r2_secret_key || !configs.r2_bucket_name) {
    console.error('❌ R2 未配置，请在后台 Settings > Storage 设置 r2_access_key / r2_secret_key / r2_bucket_name');
    process.exit(1);
  }

  console.log(`✅ R2 配置已加载，bucket: ${configs.r2_bucket_name}`);
  console.log(`   domain: ${configs.r2_domain || '(未设置 r2_domain，将使用 endpoint)'}`);

  const r2 = new R2Provider({
    accountId: configs.r2_account_id || '',
    accessKeyId: configs.r2_access_key,
    secretAccessKey: configs.r2_secret_key,
    bucket: configs.r2_bucket_name,
    uploadPath: configs.r2_upload_path || 'uploads',
    region: 'auto',
    endpoint: configs.r2_endpoint,
    publicDomain: configs.r2_domain,
  });

  const files = fs.readdirSync(MODELS_DIR).filter(f => f.endsWith('.json'));

  let totalSuccess = 0;
  let totalFail = 0;
  let totalSkip = 0;

  for (const file of files) {
    const filePath = path.join(MODELS_DIR, file);
    const modelSlug = file.replace('.json', '');
    const json = JSON.parse(fs.readFileSync(filePath, 'utf-8'));

    const videos: { src: string; poster?: string; prompt?: string; label?: string }[] =
      json?.page?.sections?.videos?.videos || [];

    if (!videos.length) {
      console.log(`⏭  ${modelSlug}: 无 videos section，跳过`);
      continue;
    }

    console.log(`\n📦 处理 ${modelSlug} (${videos.length} 个视频)`);

    let changed = false;

    for (let i = 0; i < videos.length; i++) {
      const video = videos[i];
      const originalUrl = video.src;

      // 已经是自己域名的跳过
      if (configs.r2_domain && originalUrl.startsWith(configs.r2_domain)) {
        console.log(`  ✅ [${i + 1}] 已是自有地址，跳过`);
        totalSkip++;
        continue;
      }

      // 生成唯一 key
      const ts = Date.now();
      const rand = Math.random().toString(36).slice(2, 8);
      const key = `model-videos/${modelSlug}/${ts}_${rand}.mp4`;

      console.log(`  ⬇️  [${i + 1}] 下载上传: ${originalUrl.slice(0, 80)}`);

      try {
        const result = await r2.downloadAndUpload({
          url: originalUrl,
          key,
          contentType: 'video/mp4',
          disposition: 'inline',
        });

        if (result.success && result.url) {
          console.log(`  ✅ [${i + 1}] 成功: ${result.url}`);
          videos[i] = { ...video, src: result.url };
          changed = true;
          totalSuccess++;
        } else {
          console.error(`  ❌ [${i + 1}] 失败: ${result.error}`);
          totalFail++;
        }
      } catch (err) {
        console.error(`  ❌ [${i + 1}] 异常: ${err}`);
        totalFail++;
      }
    }

    if (changed) {
      json.page.sections.videos.videos = videos;
      fs.writeFileSync(filePath, JSON.stringify(json, null, 2) + '\n', 'utf-8');
      console.log(`  💾 已更新 ${file}`);
    }
  }

  console.log(`\n=== 完成 ===`);
  console.log(`✅ 成功: ${totalSuccess}  ⏭ 跳过: ${totalSkip}  ❌ 失败: ${totalFail}\n`);
}

run().catch(err => {
  console.error('脚本异常:', err);
  process.exit(1);
});
