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

  let metadataKey = 'pages.showcases.metadata';
  if (isVideo) metadataKey = 'pages.showcases.video_metadata';
  if (isImage) metadataKey = 'pages.showcases.image_metadata';

  return getMetadata({
    metadataKey,
    canonicalUrl: `/showcases/${type}`,
  });
}

export default async function ShowcasesTypePage({
  params,
}: PageProps) {
  const { locale, type } = await params;
  setRequestLocale(locale);

  const isVideo = type === 'video';
  const isImage = type === 'image';

  const t = await getTranslations('pages.showcases');
  const showcasesData = t.raw('showcases-flow');

  let title = showcasesData.title;
  let description = showcasesData.description;

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
      usePrompts={false}
      type={type}
    />
  );
}
