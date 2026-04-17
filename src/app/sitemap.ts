import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const appUrl = envConfigs.app_url;

  return [
    { url: appUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
    { url: `${appUrl}/ai-video-generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/ai-image-generator`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${appUrl}/ai-video-showcases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-showcases`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-video-prompts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/ai-image-prompts`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${appUrl}/compare`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/seedance`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/wan`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/veo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/hailuo`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/happyhorse`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/runway`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${appUrl}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${appUrl}/updates`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
  ];
}
