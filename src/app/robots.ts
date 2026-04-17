import { MetadataRoute } from 'next';

import { envConfigs } from '@/config';

export default function robots(): MetadataRoute.Robots {
  const appUrl = envConfigs.app_url;

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/*?*q=',
        '/sign-in',
        '/sign-up',
        '/verify-email',
        '/no-permission',
        '/auth-callback',
        '/auth-popup',
        '/chat',
        '/privacy-policy',
        '/terms-of-service',
        '/settings/*',
        '/activity/*',
        '/admin/*',
        '/api/*',
      ],
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}

