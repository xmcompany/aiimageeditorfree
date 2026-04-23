import { notFound } from 'next/navigation';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Script from 'next/script';

import { getThemePage } from '@/core/theme';
import { envConfigs } from '@/config';
import { getLocalPage } from '@/shared/models/post';
import { getLatestShowcases } from '@/shared/models/showcase';

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

  // dynamic page slug
  const MODEL_SLUGS_META = ['seedance','veo','hailuo','happyhorse','kling','runway','nano-banana','gpt-image-2'];
  const rawMetaSlug = typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';
  const dynamicPageSlug = MODEL_SLUGS_META.includes(rawMetaSlug)
    ? `models.${rawMetaSlug}`
    : rawMetaSlug;

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

  // dynamic page slug
  const MODEL_SLUGS = ['seedance','veo','hailuo','happyhorse','kling','runway','nano-banana','gpt-image-2'];
  const rawDynamicSlug = typeof slug === 'string' ? slug : (slug as string[]).join('.') || '';
  // Support /seedance → pages.models.seedance (model pages without /models/ prefix)
  const dynamicPageSlug = MODEL_SLUGS.includes(rawDynamicSlug)
    ? `models.${rawDynamicSlug}`
    : rawDynamicSlug;

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
      const isComparePage = dynamicPageSlug === 'compare';

      if (isModelPage) {
        const modelSlug = dynamicPageSlug.replace('models.', '');

        // 从数据库按 tag 查询该模型的视频，注入到 videos section
        if (pageData.sections?.videos) {
          try {
            const dbShowcases = await getLatestShowcases({
              tags: modelSlug,
              type: 'video',
              limit: 12,
              sortOrder: 'desc',
            });

            if (dbShowcases.length > 0) {
              // 数据库有数据，覆盖静态 json 里的视频列表
              pageData.sections.videos.videos = dbShowcases
                .filter(s => s.videoUrl || s.image)
                .map(s => ({
                  src: s.videoUrl || s.image,
                  poster: s.videoUrl ? s.image : undefined,
                  prompt: s.prompt || undefined,
                  label: s.title || undefined,
                }));
            }
            // 注入模型 tag，供 model-videos 组件构建生成链接
            pageData.sections.videos.tag = modelSlug;
          } catch {
            // 查询失败时保留静态兜底
          }
        }

        const modelPageUrl = `${appUrl}/models/${modelSlug}`;
        const pageTitle = pageData.sections?.hero?.title || pageData.title || '';
        const pageDesc = pageData.sections?.hero?.description || pageData.description || '';
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
      } else if (isComparePage) {
        const comparePageUrl = `${appUrl}/compare`;
        const pageTitle = pageData.sections?.hero?.title || pageData.title || '';
        const pageDesc = pageData.sections?.hero?.description || pageData.description || '';
        const modelSlugs = ['seedance', 'veo', 'hailuo', 'happyhorse'];

        structuredData = {
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@type': 'ItemList',
              name: pageTitle,
              description: pageDesc,
              url: comparePageUrl,
              numberOfItems: modelSlugs.length,
              itemListElement: modelSlugs.map((slug, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: `${appUrl}/models/${slug}`,
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