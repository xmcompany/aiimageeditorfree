import { readFileSync, writeFileSync } from 'fs';

const file = 'src/config/locale/messages/en/landing.json';
let content = readFileSync(file, 'utf8');

// Replace /models/xxx with /xxx
const models = ['happyhorse','seedance','veo','wan','kling','sora','hailuo','grok-imagine','runway'];
for (const m of models) {
  content = content.replaceAll(`"/models/${m}"`, `"/${m}"`);
}

// Replace showcases/prompts paths
content = content.replaceAll('"/showcases/video"', '"/ai-video-showcases"');
content = content.replaceAll('"/showcases/image"', '"/ai-image-showcases"');
content = content.replaceAll('"/prompts/video"', '"/ai-video-prompts"');
content = content.replaceAll('"/prompts/image"', '"/ai-image-prompts"');

writeFileSync(file, content, 'utf8');
console.log('Done');
