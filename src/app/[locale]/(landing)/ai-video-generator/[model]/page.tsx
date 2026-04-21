import { getTranslations, setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';

import { getAuth } from '@/core/auth';
import { getThemePage } from '@/core/theme';
import { getVideo } from '@/shared/services/video';
import { GeneratedVideo } from '@/shared/components/video/video-card';
import VideoGenerator from '@/shared/components/video/video-generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const generateMetadata = async ({
  params,
}: {
  params: Promise<{ locale: string; model: string }>;
}) => {
  const { locale, model } = await params;
  const base = getMetadata({
    metadataKey: 'ai.video.metadata',
    canonicalUrl: `/ai-video-generator/${model}`,
  });
  return base({ params: Promise.resolve({ locale }) });
};

interface PageProps {
  params: Promise<{ locale: string; model: string }>;
  searchParams: Promise<{
    id?: string;
    type?: string;
    prompt?: string;
    showcase?: string;
  }>;
}

export default async function TextToVideoModelPage({ params, searchParams }: PageProps) {
  const { locale, model } = await params;
  setRequestLocale(locale);

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });

  const { id, type, prompt, showcase: showcaseId } = await searchParams;
  let initialVideo: GeneratedVideo | null = null;
  const isNewGeneration = type === 'new';

  // Load showcase data if showcase id provided
  let showcaseVideo: { videoUrl: string; prompt: string; image?: string; model?: string; parameters?: Record<string, any> } | null = null;
  let showcasePrompt: string | undefined = prompt;
  if (showcaseId) {
    try {
      const { getShowcase } = await import('@/shared/models/showcase');
      const sc = await getShowcase(showcaseId);
      if (sc) {
        if (sc.videoUrl) {
          showcaseVideo = {
            videoUrl: sc.videoUrl,
            prompt: sc.prompt || '',
            image: sc.image || undefined,
            model: sc.model || undefined,
            parameters: sc.parameters ? JSON.parse(sc.parameters) : undefined,
          };
        }
        if (sc.prompt && !showcasePrompt) {
          showcasePrompt = sc.prompt;
        }
      }
    } catch { /* ignore */ }
  }

  if (id && session?.user?.id) {
    try {
      const result = await getVideo(id);
      if (result.success && result.data && result.data.userId === session.user.id) {
        initialVideo = {
          id: result.data.id,
          prompt: result.data.prompt,
          model: result.data.model,
          parameters: result.data.parameters || {},
          videoUrl: result.data.videoUrl || result.data.originalVideoUrl || undefined,
          thumbnailUrl: result.data.firstFrameImageUrl || undefined,
          startImageUrl: result.data.startImageUrl || undefined,
          status: result.data.status as any,
          createdAt: result.data.createdAt ? new Date(result.data.createdAt) : new Date(),
        };
      }
    } catch (error) {
      console.error('Error loading video details:', error);
    }
  }

  const t = await getTranslations('ai.video');

  const page: DynamicPage = {
    sections: {
      features: {
        block: 'custom-features',
        h1_title: t.raw('page.title'),
        title: t.raw('page.title'),
        description: t.raw('page.description'),
      },
      generator: {
        component: (
          <VideoGenerator
            initialVideo={initialVideo}
            isNewGeneration={isNewGeneration}
            prompt={showcasePrompt}
            defaultModel={model}
            showcaseVideo={showcaseVideo}
          />
        ),
      },
    },
  };

  const Page = await getThemePage('dynamic-page');
  return <Page locale={locale} page={page} />;
}
