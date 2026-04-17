'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, Play, Wand, X } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { LazyImage } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { cn } from '@/shared/lib/utils';
import { buildGenerateUrl } from '@/shared/lib/generate-url';

function VideoThumbnail({ src, className }: { src: string; className?: string }) {
  const thumbSrc = src.includes('#') ? src : `${src}#t=0.5`;
  return (
    <div className="relative overflow-hidden" data-video-thumb>
      <video
        src={thumbSrc}
        className={`${className} pointer-events-none`}
        muted
        playsInline
        preload="auto"
      />
    </div>
  );
}

export type ShowcaseItem = {
  description?: string | null;
  id: string;
  title: string;
  slug?: string;
  prompt?: string | null;
  image: string;
  videoUrl?: string | null;
  type?: string;
  model?: string | null;
  createdAt: string | Date;
};

export function ShowcasesFlowDynamic({
  id,
  title,
  description,
  className,
  containerClassName,
  tags,
  excludeTags,
  searchTerm,
  hideCreateButton = false,
  showDescription = false,
  enableLimit = false,
  sortOrder = 'desc',
  initialItems,
  usePrompts = false,
  type,
}: {
  id?: string;
  title?: string;
  description?: string;
  className?: string;
  containerClassName?: string;
  tags?: string;
  excludeTags?: string;
  searchTerm?: string;
  hideCreateButton?: boolean;
  showDescription?: boolean;
  enableLimit?: boolean;
  sortOrder?: 'asc' | 'desc';
  initialItems?: ShowcaseItem[];
  usePrompts?: boolean;
  type?: string;
}) {
  const [items, setItems] = useState<ShowcaseItem[]>(initialItems || []);
  const t = useTranslations(usePrompts ? 'pages.prompts.ui' : 'pages.showcases.ui');
  const tCommon = useTranslations('common');
  const [loading, setLoading] = useState(!initialItems);
  const [showLoading, setShowLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Track if this is the initial mount to possibly skip fetching
  const isInitialMount = useState(true);

  useEffect(() => {
    // If initialItems are provided, skip the first fetch
    if (initialItems && isInitialMount[0]) {
      isInitialMount[1](false);
      return;
    }
    
    console.log('ShowcasesFlowDynamic mounted (or updated) with props:', { tags, excludeTags, searchTerm, type });
    
    // Set loading state when tags/searchTerm changes
    setLoading(true);
    setShowLoading(false);
    setError(null);
    
    // Only show loading indicator after 300ms delay
    const loadingTimer = setTimeout(() => {
      // If we are still loading, show the indicator
      // We check the loading state inside the effect's closure, 
      // but since we just set it true above, we need to be careful.
      // Actually, relying on state update cycle, better to just set it true here
      // but guard against fast completion.
      setShowLoading(true);
    }, 300);
    
    const params = new URLSearchParams();
    if (enableLimit) {
      params.append('limit', '20');
    }
    params.append('sortOrder', sortOrder);
    if (tags) params.append('tags', tags);
    if (excludeTags) params.append('excludeTags', excludeTags);
    if (searchTerm) params.append('searchTerm', searchTerm);
    if (usePrompts) params.append('usePrompts', 'true');
    if (type) params.append('type', type);

    const url = `/api/showcases/latest?${params.toString()}`;
    // console.log('Fetching URL:', url);
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('Showcases API response:', data);
        if (data.code === 0 && data.data) {
          setItems(data.data);
        } else {
          console.error('Showcases API did not return success:', data);
          setError(data.message || 'API Error');
        }
      })
      .catch((error) => {
        console.error('Failed to fetch showcases:', error);
        setError(error.message);
      })
      .finally(() => {
        clearTimeout(loadingTimer);
        setLoading(false);
        setShowLoading(false);
      });
    
    return () => clearTimeout(loadingTimer);
  }, [tags, excludeTags, searchTerm, enableLimit, sortOrder, initialItems, usePrompts, type]);

  const handlePrevious = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === 0 ? items.length - 1 : prev - 1) : null
    );
  }, [items.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) =>
      prev !== null ? (prev === items.length - 1 ? 0 : prev + 1) : null
    );
  }, [items.length]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedIndex === null) return;
      if (e.key === 'Escape') setSelectedIndex(null);
      if (e.key === 'ArrowLeft') handlePrevious();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedIndex, handlePrevious, handleNext]);

  return (
    <section id={id} className={cn('pb-16 md:pb-18', className)}>
      {(title || description) && (
        <motion.div
          className="container mb-12 text-center pt-12 md:pt-36"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            ease: [0.22, 1, 0.36, 1] as const,
          }}
        >
          {title && (
            <h2 className="mx-auto mb-6 max-w-full text-4xl font-serif font-extrabold tracking-tight text-pretty md:max-w-5xl lg:text-6xl">
              {title}
            </h2>
          )}
          {description && (
            <p className="text-muted-foreground text-md mx-auto mb-4 line-clamp-3 max-w-full md:max-w-5xl">
              {description}
            </p>
          )}
        </motion.div>
      )}
      {loading || showLoading ? (
        showLoading && (
          <div className={cn("container text-center my-30", containerClassName)}>
            <p className="text-muted-foreground">{t('loading')}</p>
          </div>
        )
      ) : error ? (
        <div className={cn("container text-center text-red-500", containerClassName)}>
           <p>Error loading: {error}</p>
        </div>
      ) : items.length > 0 ? (
        <div className={cn("container mx-auto columns-1 gap-4 space-y-4 sm:columns-2 lg:columns-3 xl:columns-4", containerClassName)}>
          {items.map((item, index) => (
            <motion.div
              key={item.id}
              className="group relative cursor-zoom-in break-inside-avoid overflow-hidden rounded-xl"
              onClick={() => setSelectedIndex(index)}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.22, 1, 0.36, 1] as const,
              }}
              whileHover={{ scale: 1.02 }}
            >
              {item.image ? (
                item.image.match(/\.(mp4|webm|mov|m4v)(\?|#|$)/i) ? (
                  <VideoThumbnail
                    src={item.image}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  <LazyImage
                    src={item.image}
                    alt={item.title}
                    className="h-auto w-full transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                  />
                )
              ) : (
                <div className="relative flex aspect-video w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden group-hover:scale-105 transition-transform duration-300">
                  <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                  <div className="relative flex flex-col items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/5 backdrop-blur-sm border border-white/20">
                      {item.type === 'video' || type === 'video' ? (
                        <Play className="h-6 w-6 text-slate-500 fill-slate-400 ml-1" />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-slate-500" />
                      )}
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-[2px]">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">{tCommon('showcase.no_preview')}</span>
                  </div>
                </div>
              )}
              {/* {item.videoUrl && (
                <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm rounded-full p-1.5 z-10">
                  <Play className="size-4 text-white fill-white" />
                </div>
              )} */}
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <h3 className="mb-3 translate-y-4 text-base font-semibold text-white transition-transform duration-300 group-hover:translate-y-0">
                  {item.title || item.prompt}
                </h3>
                {!hideCreateButton && (
                  <div
                    className="translate-y-4 transition-transform delay-75 duration-300 group-hover:translate-y-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Button
                      asChild
                      variant="default"
                      size="sm"
                      className="inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg:not([class*='size-'])]:size-4 shrink-0 [&_svg]:shrink-0 outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive rounded-md gap-1.5 has-[>svg]:px-2.5 bg-primary hover:bg-primary/90 text-primary-foreground h-8 w-full border-0 px-1 py-1.5 text-sm font-medium"
                    >
                      <Link 
                        href={buildGenerateUrl(
                          usePrompts
                            ? {
                                type: item.type === 'video' || type === 'video' ? 'video' : 'image',
                                model: item.model,
                                promptSlug: item.slug,
                                promptTitle: item.title,
                              }
                            : {
                                type: item.type === 'video' || type === 'video' ? 'video' : 'image',
                                model: item.model || (item.tags as any),
                                showcaseId: item.id,
                              }
                        )}
                        target="_self"
                      >
                        <Wand className="mr-2 size-4" />
                        {t('create_similar')}
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <motion.div
          className={cn("text-muted-foreground container text-center mt-20", containerClassName)}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4 }}
        >
          {t('no_showcases')}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedIndex !== null && items.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm md:p-8"
            onClick={() => setSelectedIndex(null)}
          >
            <button
              className="absolute top-4 right-4 z-50 text-white/70 transition-colors hover:text-white"
              onClick={() => setSelectedIndex(null)}
            >
              <X className="size-8" />
            </button>

            <button
              className="absolute top-1/2 left-4 z-50 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 transition-colors hover:bg-black/40 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handlePrevious();
              }}
            >
              <ChevronLeft className="size-8 md:size-12" />
            </button>

            <button
              className="absolute top-1/2 right-4 z-50 -translate-y-1/2 rounded-full bg-black/20 p-2 text-white/70 transition-colors hover:bg-black/40 hover:text-white"
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
            >
              <ChevronRight className="size-8 md:size-12" />
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative flex h-full w-full items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative max-h-full max-w-full overflow-hidden rounded-lg">
                {(items[selectedIndex].videoUrl && (items[selectedIndex].type === 'video' || type === 'video')) ? (
                  <video
                    src={items[selectedIndex].videoUrl as string}
                    controls
                    autoPlay
                    className="h-auto max-h-[90vh] w-auto max-w-full object-contain"
                    poster={items[selectedIndex].image}
                  />
                ) : (
                  <LazyImage
                    src={items[selectedIndex].image}
                    alt={items[selectedIndex].title}
                    className="h-auto max-h-[90vh] w-auto max-w-full object-contain"
                  />
                )}
                <div className="absolute right-0 bottom-0 left-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent p-6 text-white">
                  <h3 className="mb-2 text-2xl font-bold">
                    {items[selectedIndex].title || items[selectedIndex].prompt}
                  </h3>
                  {showDescription && items[selectedIndex].description && (
                    <p className="mb-2 line-clamp-3 text-base text-white/90">
                      {items[selectedIndex].description}
                    </p>
                  )}
                  {items[selectedIndex].prompt && (
                    <p className="line-clamp-3 text-base text-white/90">
                      {items[selectedIndex].prompt}
                    </p>
                  )}
                  <div className="mt-4">
                    <a
                      href={buildGenerateUrl(
                        usePrompts
                          ? {
                              type: items[selectedIndex].type === 'video' || type === 'video' ? 'video' : 'image',
                              model: items[selectedIndex].model,
                              promptSlug: items[selectedIndex].slug,
                              promptTitle: items[selectedIndex].title,
                            }
                          : {
                              type: items[selectedIndex].type === 'video' || type === 'video' ? 'video' : 'image',
                              model: items[selectedIndex].model || (items[selectedIndex] as any).tags,
                              showcaseId: items[selectedIndex].id,
                            }
                      )}
                      onClick={() => setSelectedIndex(null)}
                      className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
                    >
                      <Wand className="h-4 w-4" />
                      {items[selectedIndex].prompt ? 'Create Similar Video' : 'Generate AI Video'}
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
