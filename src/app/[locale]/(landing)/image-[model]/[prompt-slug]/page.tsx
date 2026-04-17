import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getThemePage } from '@/core/theme';
import { ImageGenerator } from '@/shared/blocks/generator';
import { DynamicPage } from '@/shared/types/blocks/landing';
import { envConfigs } from '@/config';

interface PageProps {
  params: Promise<{ locale: string; model: string; 'prompt-slug': string }>;
  searchParams: Promise<{ prompt?: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { locale, model, 'prompt-slug': promptSlug } = await params;
  const title = promptSlug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const appUrl = envConfigs.app_url || '';

  return {
    title: `${title} — ${model} AI Image Generator`,
    description: `Generate AI image with ${model}: "${title}". Try free on AI Video Generator Free.`,
    alternates: {
      canonical: `${appUrl}/${locale !== envConfigs.locale ? `${locale}/` : ''}image-${model}/${promptSlug}`,
    },
  };
}

export default async function ImagePromptPage({ params, searchParams }: PageProps) {
  const { locale, model, 'prompt-slug': promptSlug } = await params;
  setRequestLocale(locale);

  const { prompt: queryPrompt } = await searchParams;
  const initialPrompt = queryPrompt || promptSlug.replace(/-/g, ' ');

  const t = await getTranslations('pages.image-generator');

  const page: DynamicPage = {
    sections: {
      features: {
        block: 'custom-features',
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
