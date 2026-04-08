import { getTranslations } from 'next-intl/server';

import { AITask, getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { Empty } from '@/shared/blocks/common/empty';
import { AIMediaType } from '@/extensions/ai';
import ImageGallery from '@/shared/components/image/image-gallery';

export default async function ActivityImagesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 24;

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.images');

  const aiTasks = await getAITasks({
    userId: user.id,
    mediaType: AIMediaType.IMAGE,
    page,
    limit,
  });

  const total = await getAITasksCount({
    userId: user.id,
    mediaType: AIMediaType.IMAGE,
  });

  const images = aiTasks
    .map((task: AITask) => {
      let urls: string[] = [];
      const taskInfo = task.taskInfo ? JSON.parse(task.taskInfo) : null;
      const taskResult = task.taskResult ? JSON.parse(task.taskResult) : null;

      // 1. Try taskInfo.images (Standard layout)
      if (taskInfo?.images && Array.isArray(taskInfo.images)) {
        urls = taskInfo.images
          .map((img: any) => (typeof img === 'string' ? img : img.imageUrl))
          .filter(Boolean);
      }

      // 2. Try taskResult.output (Raw Replicate/Fal output)
      if (urls.length === 0 && taskResult) {
        const output = taskResult.output ?? taskResult.images ?? taskResult.data;
        if (typeof output === 'string') {
          urls = [output];
        } else if (Array.isArray(output)) {
          urls = output
            .map((item: any) => {
              if (typeof item === 'string') return item;
              if (typeof item === 'object')
                return item.url ?? item.uri ?? item.image ?? item.imageUrl;
              return null;
            })
            .filter(Boolean);
        }
      }

      return urls.map((url, index) => {
        // Sanitize URL: ensure protocol and fix double slashes (except protocol)
        let sanitizedUrl = url;
        if (sanitizedUrl && !sanitizedUrl.startsWith('http') && !sanitizedUrl.startsWith('//')) {
          // If it starts with a domain-like string (e.g. "cdn.example.com"), add https://
          if (/^[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+/.test(sanitizedUrl)) {
            sanitizedUrl = `https://${sanitizedUrl}`;
          }
        }
        
        // Fix potential double slashes from domain/path concatenation
        if (sanitizedUrl && sanitizedUrl.startsWith('http')) {
          const parts = sanitizedUrl.split('://');
          sanitizedUrl = `${parts[0]}://${parts[1].replace(/\/+/g, '/')}`;
        }

        return {
          id: `${task.id}-${index}`,
          url: sanitizedUrl,
          prompt: task.prompt,
          createdAt: task.createdAt.toLocaleDateString('en-US'),
        };
      });
    })
    .flat();

  const hasNextPage = page * limit < total;

  return (
    <div className="space-y-8">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        {images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <div className="text-center space-y-3">
              <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-muted-foreground"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {t('empty_title')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-sm">
                {t('empty_subtitle')}
              </p>
            </div>
          </div>
        ) : (
          <ImageGallery
            images={images}
            total={total}
            limit={limit}
            hasNextPage={hasNextPage}
            page={page}
          />
        )}
      </div>
    </div>
  );
}
