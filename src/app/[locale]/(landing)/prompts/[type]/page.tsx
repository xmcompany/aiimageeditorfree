import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  params: Promise<{ locale: string; type: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { type } = await params;
  const isVideo = type === 'video';
  const isImage = type === 'image';

  let metadataKey = 'pages.prompts.metadata';
  if (isVideo) metadataKey = 'pages.prompts.video_metadata';
  if (isImage) metadataKey = 'pages.prompts.image_metadata';

  return getMetadata({
    metadataKey,
    canonicalUrl: `/prompts/${type}`,
  });
}

export default async function PromptsTypePage({
  params,
}: PageProps) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const isVideo = type === 'video';
  const isImage = type === 'image';

  const t = await getTranslations('pages.prompts');

  let title = t('metadata.title');
  let description = t('metadata.description');

  if (isVideo) {
    title = t('video_metadata.title');
    description = t('video_metadata.description');
  } else if (isImage) {
    title = t('image_metadata.title');
    description = t('image_metadata.description');
  }

  return (
    <ShowcasesFlowDynamic
      title={title}
      description={description}
      containerClassName="py-14"
      usePrompts={true}
      type={type}
    />
  );
}
