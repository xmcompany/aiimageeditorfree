'use client';

import { useTranslations } from 'next-intl';
import { LazyImage } from '@/shared/blocks/common/lazy-image';
import { Pagination } from '@/shared/blocks/common/pagination';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import { cn } from '@/shared/lib/utils';

interface ImageGalleryProps {
  images: Array<{
    id: string;
    url: string;
    prompt: string;
    createdAt: string;
  }>;
  total: number;
  limit: number;
  hasNextPage: boolean;
  page: number;
}

export default function ImageGallery({
  images,
  total,
  limit,
  hasNextPage,
  page,
}: ImageGalleryProps) {
  const t = useTranslations('activity.images');

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
          <div className="flex items-center gap-4">
            <p className="text-sm text-muted-foreground">
              {t('total', { count: total })}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {images.map((image) => (
            <div
              key={image.id}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20"
            >
              {/* Image Container with Aspect Ratio */}
              <div className="relative aspect-square w-full overflow-hidden bg-muted/20">
                <LazyImage
                  src={image.url}
                  alt={image.prompt || 'Generated image'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                
                {/* Hover Overlay with Glassmorphism */}
                <div className="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-black/40 opacity-0 backdrop-blur-[2px] transition-all duration-300 group-hover:opacity-100">
                  <a
                    href={image.url}
                    download
                    className="flex h-10 w-10 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm transition-colors hover:bg-background hover:text-primary"
                    title="Download"
                  >
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                      />
                    </svg>
                  </a>
                </div>
              </div>

              {/* Content Panel */}
              <div className="flex flex-col p-4 relative z-10 bg-card/50 backdrop-blur-sm">
                <TooltipPrimitive.Root>
                  <TooltipPrimitive.Trigger className="w-full text-left font-medium text-foreground text-sm truncate mb-1.5 bg-transparent border-0 p-0 cursor-help hover:text-primary transition-colors">
                    {image.prompt || 'Untitled'}
                  </TooltipPrimitive.Trigger>
                  <TooltipPrimitive.Portal>
                    <TooltipPrimitive.Content
                      side="top"
                      sideOffset={5}
                      className={cn(
                        "bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 z-50 max-w-[300px] rounded-lg border border-border px-3 py-2 text-xs break-words leading-relaxed",
                      )}
                    >
                      {image.prompt || 'Untitled'}
                      <TooltipPrimitive.Arrow className="fill-popover stroke-border" />
                    </TooltipPrimitive.Content>
                  </TooltipPrimitive.Portal>
                </TooltipPrimitive.Root>
                
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
                    {image.createdAt}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8 border-t border-border/50">
          <Pagination
            total={total}
            limit={limit}
            page={page}
            className="mx-auto"
          />
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
}
