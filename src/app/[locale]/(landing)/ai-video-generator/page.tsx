import { getTranslations, setRequestLocale } from 'next-intl/server';
import { headers } from 'next/headers';

import { getAuth } from '@/core/auth';
import { getThemePage } from '@/core/theme';
import { getVideo } from '@/shared/services/video';
import { GeneratedVideo } from '@/shared/components/video/video-card';
// import VideoGallery from '@/shared/components/video/video-gallery';
import VideoGenerator from '@/shared/components/video/video-generator';
import { getMetadata } from '@/shared/lib/seo';
import { DynamicPage } from '@/shared/types/blocks/landing';

export const revalidate = 3600; // Revalidate every hour

export const generateMetadata = getMetadata({
  metadataKey: 'ai.video.metadata',
  canonicalUrl: '/ai-video-generator',
});

interface PageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    id?: string;
    type?: string;
    prompt?: string;
    model?: string;
  }>;
}

export default async function TextToVideoPage({ params, searchParams }: PageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const auth = await getAuth();
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  const { id, type, prompt, model } = await searchParams;
  let initialVideo: GeneratedVideo | null = null;
  const isNewGeneration = type === 'new';

  // Only load video if user is logged in and has an ID
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
        powered_by: t.raw('page.powered_by'),
      },
      generator: {
        component: (
          <VideoGenerator
            initialVideo={initialVideo}
            isNewGeneration={isNewGeneration}
            prompt={prompt}
            defaultModel={model}
          />
        ),
      },
      // gallery: {
      //   title: t.raw('gallery.title'),
      //   component: (
      //     <div className="container mx-auto max-w-6xl">
      //       <VideoGallery />
      //     </div>
      //   )
      // }
    },
  };

  const Page = await getThemePage('dynamic-page');
  return <Page locale={locale} page={page} />;
}

