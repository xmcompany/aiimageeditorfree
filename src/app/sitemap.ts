import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { getPrompts, PromptStatus } from '@/shared/models/prompt';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = envConfigs.app_url;

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${appUrl}/ai-video-generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/ai-image-generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/seedance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/wan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/kling`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/veo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/hailuo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/happyhorse`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/runway`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/ai-music-generator`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-video-showcases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-showcases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-video-prompts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-prompts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/prompts/video`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/prompts/image`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/showcases/video`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/showcases/image`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${appUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/hairstyles`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${appUrl}/updates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];

  try {
    const videoPrompts = await getPrompts({ page: 1, limit: 200, type: 'video', status: PromptStatus.PUBLISHED });
    const imagePrompts = await getPrompts({ page: 1, limit: 200, type: 'image', status: PromptStatus.PUBLISHED });

    const promptPages: MetadataRoute.Sitemap = [];

    for (const p of videoPrompts) {
      if (p.promptTitle && p.promptDescription) {
        promptPages.push({
          url: `${appUrl}/ai-video-generator?prompt=${encodeURIComponent(p.promptTitle)}`,
          lastModified: p.updatedAt || p.createdAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    for (const p of imagePrompts) {
      if (p.promptTitle && p.promptDescription) {
        promptPages.push({
          url: `${appUrl}/ai-image-generator?prompt=${encodeURIComponent(p.promptTitle)}`,
          lastModified: p.updatedAt || p.createdAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
    }

    return [...staticPages, ...promptPages];
  } catch {
    return staticPages;
  }
}
