import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getMetadata } from '@/shared/lib/seo';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';

export const revalidate = 600; // Revalidate every 10 minutes

export const generateMetadata = getMetadata({
  metadataKey: 'pages.showcases.image_metadata',
  canonicalUrl: '/ai-image-showcases',
});

export default async function AIImageShowcasesPage({
  params,
}: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('pages.showcases');
  return (
    <ShowcasesFlowDynamic
      title={t('image_metadata.title')}
      description={t('image_metadata.description')}
      containerClassName="py-14"
      usePrompts={false}
      type="image"
    />
  );
}
