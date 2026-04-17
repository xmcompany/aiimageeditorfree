import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const revalidate = 600; // Revalidate every 10 minutes

export const generateMetadata = getMetadata({
  metadataKey: 'pages.showcases.video_metadata',
  canonicalUrl: '/ai-video-showcases',
});

export default async function AIVideoShowcasesPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.showcases');
  return (
    <ShowcasesFlowDynamic
      title={t('video_metadata.title')}
      description={t('video_metadata.description')}
      containerClassName="py-14"
      usePrompts={false}
      type="video"
    />
  );
}
