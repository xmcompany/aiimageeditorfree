import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const revalidate = 600; // Revalidate every 10 minutes

export const generateMetadata = getMetadata({
  metadataKey: 'pages.prompts.video_metadata',
  canonicalUrl: '/ai-video-prompts',
});

export default async function AIVideoPromptsPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.prompts');
  return (
    <ShowcasesFlowDynamic
      title={t('video_metadata.title')}
      description={t('video_metadata.description')}
      containerClassName="py-14"
      usePrompts={true}
      type="video"
    />
  );
}
