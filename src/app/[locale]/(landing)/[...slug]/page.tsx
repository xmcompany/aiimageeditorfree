import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Script from 'next/script';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { getLocalPage } from '@/shared/models/post';
import { getLatestShowcases } from '@/shared/models/showcase';

/** Legacy AI video model marketing pages — hidden (404). */
const LEGACY_VIDEO_MODEL_SLUGS = new Set([
  'seedance',
  'wan',
  'veo',
  'hailuo',
  'happyhorse',
  'kling',
  'runway',
  'grok-imagine',
]);

/** Image model marketing pages: /{slug} → pages.models.{slug} */
const IMAGE_MODEL_SLUGS: string[] = [
  'gpt-4o-image',
  'seedream-5-lite',
  'flux-kontext',
  'nano-banana',
  'nano-banana-edit',
  'nano-banana-2',
  'google-pro-image-to-image',
];

function toDynamicPageSlug(raw: string): string {
  if (IMAGE_MODEL_SLUGS.includes(raw)) {
    return `models.${raw}`;
  }
  return raw;
}

// dynamic page metadata
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  // metadata values
  let title = '';
  let description = '';
  let canonicalUrl = '';

  // 1. try to get static page metadata from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // build canonical url
  canonicalUrl =
    locale !== envConfigs.locale
      ? `${envConfigs.app_url}/${locale}/${staticPageSlug}`
      : `${envConfigs.app_url}/${staticPageSlug}`;

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page metadata
  if (staticPage) {
    title = staticPage.title || '';
    description = staticPage.description || '';

    return {
      title,
      description,
      alternates: {
        canonical: canonicalUrl,
      },
    };
  }

  // 2. static page not found, try to get dynamic page metadata from
  // src/config/locale/messages/{locale}/pages/**/*.json

  const rawMetaSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  if (LEGACY_VIDEO_MODEL_SLUGS.has(rawMetaSlug)) {
    notFound();
  }

  const dynamicPageSlug = toDynamicPageSlug(rawMetaSlug);
  const messageKey = `pages.${dynamicPageSlug}`;

  try {
    const t = await getTranslations({ locale, namespace: messageKey });

    // return dynamic page metadata
    if (t.has('metadata')) {
      title = t.raw('metadata.title');
      description = t.raw('metadata.description');

      return {
        title,
        description,
        alternates: {
          canonical: canonicalUrl,
        },
      };
    }
  } catch (error) {
    // Translation not found, continue to common metadata
  }

  // 3. return common metadata
  const tc = await getTranslations('common.metadata');

  title = tc('title');
  description = tc('description');

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

export default async function DynamicPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  // 1. try to get static page from
  // content/pages/**/*.mdx

  // static page slug
  const staticPageSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('/') || '';

  // get static page content
  const staticPage = await getLocalPage({ slug: staticPageSlug, locale });

  // return static page
  if (staticPage) {
    const Page = await getThemePage('static-page');

    return <Page locale={locale} post={staticPage} />;
  }

  // 2. static page not found
  // try to get dynamic page content from
  // src/config/locale/messages/{locale}/pages/**/*.json

  const rawDynamicSlug =
    typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';

  if (LEGACY_VIDEO_MODEL_SLUGS.has(rawDynamicSlug)) {
    notFound();
  }

  const dynamicPageSlug = toDynamicPageSlug(rawDynamicSlug);
  const messageKey = `pages.${dynamicPageSlug}`;

  try {
    const t = await getTranslations({ locale, namespace: messageKey });

    // return dynamic page
    if (t.has('page')) {
      const Page = await getThemePage('dynamic-page');
      const pageData = t.raw('page');
      const appUrl = envConfigs.app_url || 'https://aivideogeneratorfree.ai';

      let structuredData: Record<string, any> | null = null;

      const isModelPage = dynamicPageSlug.startsWith('models.');
      const isComparePage =
        dynamicPageSlug === 'compare' ||
        dynamicPageSlug === 'compare-image-models';

      if (isModelPage) {
        const modelSlug = dynamicPageSlug.replace('models.', '');

        if (pageData.sections?.videos) {
          try {
            const dbShowcases = await getLatestShowcases({
              tags: modelSlug,
              type: 'video',
              limit: 12,
              sortOrder: 'desc',
            });

            if (dbShowcases.length > 0) {
              pageData.sections.videos.videos = dbShowcases
                .filter((s) => s.videoUrl || s.image)
                .map((s) => ({
                  src: s.videoUrl || s.image,
                  poster: s.videoUrl ? s.image : undefined,
                  prompt: s.prompt || undefined,
                  label: s.title || undefined,
                }));
            }
            pageData.sections.videos.tag = modelSlug;
          } catch {
            // keep static fallback
          }
        }

        if (pageData.sections?.images) {
          try {
            const presetGenTag = (pageData.sections.images as { tag?: string }).tag;
            const dbShowcases = await getLatestShowcases({
              tags: modelSlug,
              type: 'image',
              limit: 12,
              sortOrder: 'desc',
            });

            if (dbShowcases.length > 0) {
              pageData.sections.images.images = dbShowcases
                .filter((s) => s.image)
                .map((s) => ({
                  src: s.image,
                  prompt: s.prompt || undefined,
                  label: s.title || undefined,
                }));
            }
            (pageData.sections.images as { tag?: string }).tag =
              presetGenTag || modelSlug;
          } catch {
            // keep static fallback
          }
        }

        const modelPageUrl = `${appUrl}/${modelSlug}`;
        const pageTitle = pageData.sections?.hero?.title || pageData.title || '';
        const pageDesc =
          pageData.sections?.hero?.description || pageData.description || '';
        const metaData = t.raw('metadata') || {};
        const graphItems: any[] = [
          {
            '@type': 'SoftwareApplication',
            name: pageTitle,
            description: metaData.description || pageDesc,
            url: modelPageUrl,
            applicationCategory: 'MultimediaApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
            },
          },
        ];

        const faqItems = pageData.sections?.faq?.items;
        if (Array.isArray(faqItems) && faqItems.length > 0) {
          graphItems.push({
            '@type': 'FAQPage',
            mainEntity: faqItems.map((item: any) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: {
                '@type': 'Answer',
                text: item.answer,
              },
            })),
          });
        }

        structuredData = {
          '@context': 'https://schema.org',
          '@graph': graphItems,
        };
      } else if (dynamicPageSlug === 'compare') {
        const comparePageUrl = `${appUrl}/compare`;
        const pageTitle = pageData.sections?.hero?.title || pageData.title || '';
        const pageDesc =
          pageData.sections?.hero?.description || pageData.description || '';
        const modelSlugs = ['seedance', 'wan', 'veo', 'hailuo', 'happyhorse'];

        structuredData = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'ItemList',
              name: pageTitle,
              description: pageDesc,
              url: comparePageUrl,
              numberOfItems: modelSlugs.length,
              itemListElement: modelSlugs.map((s, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appUrl}/${s}`,
              })),
            },
          ],
        };
      } else if (dynamicPageSlug === 'compare-image-models') {
        const comparePageUrl = `${appUrl}/compare-image-models`;
        const pageTitle = pageData.sections?.hero?.title || pageData.title || '';
        const pageDesc =
          pageData.sections?.hero?.description || pageData.description || '';
        const modelSlugs = [...IMAGE_MODEL_SLUGS];

        structuredData = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'ItemList',
              name: pageTitle,
              description: pageDesc,
              url: comparePageUrl,
              numberOfItems: modelSlugs.length,
              itemListElement: modelSlugs.map((s, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appUrl}/${s}`,
              })),
            },
          ],
        };
      }

      return (
        <>
          {structuredData && (
            <Script
              id={`structured-data-${dynamicPageSlug}`}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
          )}
          <Page locale={locale} page={pageData} />
        </>
      );
    }
  } catch (error) {
    // Translation not found, continue to 404
  }

  // 3. page not found
  return notFound();
}
