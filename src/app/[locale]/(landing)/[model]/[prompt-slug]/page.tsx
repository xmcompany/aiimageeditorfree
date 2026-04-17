import { getTranslations, setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';

import { getAuth } from '@/core/auth';
import { getThemePage } from '@/core/theme';
import VideoGenerator from '@/shared/components/video/video-generator';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { envConfigs } from '@/config';
import { MODEL_CONFIGS } from '@/config/model-config';

interface PageProps {
  params: Promise<{ locale: string; model: string; 'prompt-slug': string }>;
  searchParams: Promise<{ prompt?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, model, 'prompt-slug': promptSlug } = await params;
  const modelConfig = MODEL_CONFIGS[model];
  const modelName = modelConfig?.name || model;
  const title = promptSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const appUrl = envConfigs.app_url || '';

  return {
    title: `${title} — ${modelName} AI Video Generator`,
    description: `Generate AI video with ${modelName}: "${title}". Try free on AI Video Generator Free.`,
    alternates: {
      canonical: `${appUrl}/${locale !== envConfigs.locale ? `${locale}/` : ''}${model}/${promptSlug}`,
    },
  };
}

export default async function PromptPage({ params, searchParams }: PageProps) {
  const { locale, model, 'prompt-slug': promptSlug } = await params;
  setRequestLocale(locale);

  // 验证 model 是否有效
  if (!MODEL_CONFIGS[model]) {
    return notFound();
  }

  const { prompt: queryPrompt } = await searchParams;

  // slug 转回 prompt 文本（作为初始 prompt）
  const promptFromSlug = promptSlug.replace(/-/g, ' ');
  const initialPrompt = queryPrompt || promptFromSlug;

  const t = await getTranslations('ai.video');

  const page: DynamicPage = {
    sections: {
      features: {
        block: 'custom-features',
        title: t.raw('page.title'),
        description: t.raw('page.description'),
      },
      generator: {
        component: (
          <VideoGenerator
            isNewGeneration={false}
            prompt={initialPrompt}
            defaultModel={model}
          />
        ),
      },
    },
  };

  const Page = await getThemePage('dynamic-page');
  return <Page locale={locale} page={page} />;
}
