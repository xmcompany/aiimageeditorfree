import { getTranslations, setRequestLocale } from 'next-intl/server';

import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const revalidate = 600; // Revalidate every 10 minutes

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ type?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps) {
  const { type } = await searchParams;
  const isVideo = type === 'video';
  const isImage = type === 'image';
  
  let metadataKey = 'pages.prompts.metadata';
  if (isVideo) metadataKey = 'pages.prompts.video_metadata';
  if (isImage) metadataKey = 'pages.prompts.image_metadata';

  return getMetadata({
    metadataKey,
    canonicalUrl: '/prompts',
  });
}

export default async function PromptsPage({
  params,
  searchParams,
}: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { type } = await searchParams;
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
