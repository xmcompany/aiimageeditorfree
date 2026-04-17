import { getTranslations, setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';

import { getThemePage } from '@/core/theme';
import { ImageGenerator } from '@/shared/blocks/generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { envConfigs } from '@/config';

interface PageProps {
  params: Promise<{ locale: string; model: string }>;
  searchParams: Promise<{ prompt?: string; showcase?: string }>;
}

export const generateMetadata = async ({ params }: PageProps) => {
  const { locale, model } = await params;
  const base = getMetadata({
    metadataKey: 'pages.image-generator.metadata',
    canonicalUrl: `/ai-image-generator/${model}`,
  });
  return base({ params: Promise.resolve({ locale }) });
};

export default async function ImageGeneratorModelPage({ params, searchParams }: PageProps) {
  const { locale, model } = await params;
  setRequestLocale(locale);

  const { prompt, showcase } = await searchParams;

  // Load showcase prompt if showcase id provided
  let initialPrompt = prompt;
  if (!initialPrompt && showcase) {
    try {
      const { getShowcase } = await import('@/shared/models/showcase');
      const sc = await getShowcase(showcase);
      if (sc?.prompt) initialPrompt = sc.prompt;
    } catch { /* ignore */ }
  }

  const t = await getTranslations('pages.image-generator');

  const page: DynamicPage = {
    sections: {
      features: {
        block: 'custom-features',
        h1_title: t.raw('page.title'),
        title: t.raw('page.title'),
        description: t.raw('page.description'),
      },
      generator: {
        component: <ImageGenerator srOnlyTitle={t.raw('generator.title')} promptKey={initialPrompt} />,
      },
    },
  };

  const Page = await getThemePage('dynamic-page');
  return <Page locale={locale} page={page} />;
}
