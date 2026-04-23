import { envConfigs } from '..';

export const localeNames: Record<string, string> = {
  en: 'English'
};

export const locales = ['en'];

export const defaultLocale = envConfigs.locale;

export const localePrefix = 'as-needed';

export const localeDetection = false;

export const localeMessagesRootPath = '@/config/locale/messages';

export const localeMessagesPaths = [
  'common',
  'landing',
  'settings/sidebar',
  'settings/profile',
  'settings/security',
  'settings/billing',
  'settings/payments',
  'settings/credits',
  'settings/apikeys',
  'admin/sidebar',
  'admin/users',
  'admin/roles',
  'admin/permissions',
  'admin/categories',
  'admin/posts',
  'admin/payments',
  'admin/subscriptions',
  'admin/credits',
  'admin/settings',
  'admin/apikeys',
  'admin/ai-tasks',
  'admin/chats',
  'admin/dashboard',
  'admin/feedbacks',
  'ai/music',
  'ai/chat',
  'ai/image',
  'ai/video',
  'activity/sidebar',
  'activity/ai-tasks',
  'activity/chats',
  'activity/images',
  'activity/videos',
  'pages/index',
  'pages/pricing',
  'pages/showcases',
  'pages/prompts',
  'pages/blog',
  'pages/updates',
  'pages/image-generator',
  'pages/hairstyles',
  'pages/models/gpt-4o-image',
  'pages/models/seedream-5-lite',
  'pages/models/flux-kontext',
  'pages/models/nano-banana',
  'pages/models/nano-banana-edit',
  'pages/models/nano-banana-2',
  'pages/models/google-pro-image-to-image',
  'pages/models/gpt-image-2',
  'pages/compare',
  'pages/compare-image-models',
  'admin/image-prompts',
  'admin/image-showcases',
  'admin/video-prompts',
  'admin/video-showcases',
  'admin/image-generates',
  'admin/video-generates',
  'video',
];
