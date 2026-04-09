import { getTranslations, setRequestLocale } from 'next-intl/server';
import Script from 'next/script';

import { getThemePage } from '@/core/theme';
import { DynamicPage, Section } from '@/shared/types/blocks/landing';
import { ShowcasesFlowDynamic } from '@/themes/default/blocks/showcases-flow-dynamic';
import { getLatestShowcases } from '@/shared/models/showcase';
import { getMetadata } from '@/shared/lib/seo';
import { getConfigs } from '@/shared/models/config';
import { envConfigs } from '@/config';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const generateMetadata = getMetadata({
  metadataKey: 'common.metadata',
  canonicalUrl: '/',
});

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('landing');

  // Fetch initial credits amount for structured data and hero tip
  let initialCreditsAmount = 0;
  try {
    const configs = await getConfigs();
    if (configs.initial_credits_enabled === 'true') {
      initialCreditsAmount = parseInt(configs.initial_credits_amount as string) || 0;
    }
  } catch (e) {
    // silently ignore
  }

  // Fetch showcases data server-side for faster initial render
  const rawShowcases = await getLatestShowcases({
    excludeTags: 'hairstyles',
    sortOrder: 'desc',
    limit: 20,
    type: 'image',
  });

  const initialShowcases = rawShowcases
    .filter((item) => item.image)
    .map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

  const showSections = [
    'hero',
    'showcases-flow',
    'logos',
    'showcase',
    'introduce',
    'benefits',
    'usage',
    'features',
    'stats',
    'testimonials',
    'subscribe',
    'faq',
    'cta',
  ];

  // build page sections
  const page: DynamicPage = {
    sections: showSections.reduce<Record<string, Section>>((acc, section) => {
      if (section === 'showcases-flow') {
        const sectionData = t.raw(section) as Section;
        acc[section] = {
          ...sectionData,
          component: (
            <ShowcasesFlowDynamic
              key="showcases-flow"
              id={sectionData.id}
              title={sectionData.title}
              description={sectionData.description}
              excludeTags="hairstyles"
              sortOrder="desc"
              hideCreateButton={true}
              initialItems={initialShowcases}
              type="image"
            />
          ),
        };
      } else {
        const sectionData = t.raw(section) as Section;
        // Inject dynamic initial credits amount into hero tip
        if (section === 'hero' && sectionData && initialCreditsAmount > 0) {
          (sectionData as any).tip = `🎁 New users get ${initialCreditsAmount} free credits instantly upon sign-up. Start generating AI videos for free now.`;
        }
        // Skip sections that are explicitly hidden, null, or undefined
        if (
          sectionData &&
          typeof sectionData === 'object' &&
          sectionData.hidden !== true
        ) {
          acc[section] = sectionData;
        }
      }
      return acc;
    }, {}),
  };

  // Structured data (application/ld+json)
  const appUrl = envConfigs.app_url || 'https://nanobanana-joyflix.ai';
  const appName = envConfigs.app_name || 'Nanobanana Joyflix';
  const freeOfferDescription = initialCreditsAmount > 0
    ? `Sign up free and get ${initialCreditsAmount} bonus credits to generate AI videos instantly. No credit card required.`
    : 'Sign up free and get bonus credits to generate AI videos instantly. No credit card required.';

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${appUrl}/#website`,
        url: appUrl,
        name: appName,
        description: 'Free AI video generator — create cinematic videos from text or images online.',
        potentialAction: {
          '@type': 'SearchAction',
          target: {
            '@type': 'EntryPoint',
            urlTemplate: `${appUrl}/prompts?q={search_term_string}`,
          },
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'WebApplication',
        '@id': `${appUrl}/#webapp`,
        name: `${appName} — Free AI Video Generator`,
        url: appUrl,
        applicationCategory: 'MultimediaApplication',
        operatingSystem: 'Web',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
          description: freeOfferDescription,
        },
        featureList: [
          'Free AI video generation from text prompts',
          'Free image to video AI conversion',
          'AI image generation and editing',
          'Character consistency across AI videos',
          'HD watermark-free export',
        ],
        screenshot: `${appUrl}/preview.png`,
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'Is this AI video generator really free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: freeOfferDescription,
            },
          },
          {
            '@type': 'Question',
            name: 'How do I generate AI videos from text for free?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sign up for a free account, go to the AI Video Generator, type your text prompt describing the scene, select a model, and click generate. Your free credits cover the generation instantly.',
            },
          },
          {
            '@type': 'Question',
            name: 'Can I convert an image to a video for free using AI?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Yes. Upload any photo to the Image to Video tool and our free AI video generator animates it with cinematic motion. Supported formats include JPG, PNG, and HEIC.',
            },
          },
        ],
      },
    ],
  };

  // load page component
  const Page = await getThemePage('dynamic-page');

  return (
    <>
      <Script
        id="structured-data"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <Page locale={locale} page={page} />
    </>
  );
}
