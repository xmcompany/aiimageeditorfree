import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';
import { getPosts, PostStatus, PostType } from '@/shared/models/post';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = envConfigs.app_url;

  const lastModified = new Date('2026-04-15');

  const staticPages: MetadataRoute.Sitemap = [
    { url: appUrl, lastModified, changeFrequency: 'daily', priority: 1.0 },
    { url: `${appUrl}/ai-video-generator`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/ai-image-generator`, lastModified, changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/ai-video-showcases`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-showcases`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-video-prompts`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-prompts`, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/compare`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/seedance`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/veo`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/hailuo`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/happyhorse`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/runway`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/models/gpt-image-2`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/models/nano-banana`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/pricing`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${appUrl}/blog`, lastModified, changeFrequency: 'weekly', priority: 0.7 },
  ];

  let blogPages: MetadataRoute.Sitemap = [];
  try {
    const posts = await getPosts({
      type: PostType.ARTICLE,
      status: PostStatus.PUBLISHED,
      limit: 100,
    });
    blogPages = posts.map((p) => ({
      url: `${appUrl}/blog/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    }));
  } catch (e) {
    console.log('sitemap get blog posts failed:', e);
  }

  return [...staticPages, ...blogPages];
}
