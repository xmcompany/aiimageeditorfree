import { getLatestShowcases } from '@/shared/models/showcase';

const models = ['seedance','wan','kling','sora','veo','hailuo','grok-imagine','runway','happyhorse'];

async function run() {
  for (const tag of models) {
    const items = await getLatestShowcases({ tags: tag, type: 'video', limit: 20 });
    console.log(`\n${tag}: ${items.length} videos`);
    items.forEach(i => console.log(`  videoUrl: ${i.videoUrl || '(none)'}  image: ${i.image}`));
  }
}

run().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
