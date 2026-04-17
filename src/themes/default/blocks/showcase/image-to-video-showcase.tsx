'use client'
// Replaced IconArrowNarrowRight with ArrowRight
import { ArrowRight, Check, History, Info, Play, Sparkles, Video } from 'lucide-react';
import { useState, useRef, useId, useEffect } from 'react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { Button } from '@/shared/components/ui/button'
import { ResizablePanelGroup, ResizablePanel } from '@/shared/components/ui/resizable'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from '@/shared/components/ui/carousel'
import { cn, handlePromptClick } from '@/shared/lib/utils'
import Image from 'next/image'
import { Link } from '@/core/i18n/navigation'
import { SmartIcon } from '@/shared/blocks/common';
import { useTranslations } from 'next-intl';

interface ImageToVideoSlideData {
  prompt: string
  originalImage: string
  videoSrc: string
  url?: string
  target?: string
}

interface ImageToVideoShowcaseProps {
  slides: ImageToVideoSlideData[]
  section: any
}

export function ImageToVideoShowcase({
  slides,
  section,
}: ImageToVideoShowcaseProps) {
  const t = useTranslations('common');
  const [api, setApi] = useState<CarouselApi>()
  const [current, setCurrent] = useState(0)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])

  // Handle carousel API and current slide tracking
  useEffect(() => {
    if (!api) return

    setCurrent(api.selectedScrollSnap())

    api.on('select', () => {
      setCurrent(api.selectedScrollSnap())
    })
  }, [api])

  // Handle video autoplay when slide changes
  useEffect(() => {
    const currentVideo = videoRefs.current[current]
    if (currentVideo) {
      currentVideo.play().catch(() => {
        // Autoplay failed, which is expected in some browsers
      })
    }
  }, [current])

  const [copied, setCopied] = useState(false)
  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const id = useId()

  if (!slides.length) return null

  return (
    <div
      className="relative w-full max-w-7xl mx-auto px-4"
      aria-labelledby={`image-to-video-showcase-heading-${id}`}
    >
      <Carousel
        setApi={setApi}
        className="w-full"
        opts={{
          align: 'start',
          loop: true,
        }}
      >
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={index} className="basis-full">
              <div className="flex flex-col lg:flex-row gap-4 h-auto lg:h-[500px]">
                {/* 1. Original Image Section */}
                <div className="flex-[3] bg-secondary/30 rounded-2xl p-6 flex flex-col border border-border/50 min-h-[300px] lg:min-h-0 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                      {t('showcase.original_image')}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 relative group/img">
                    {slide.originalImage ? (
                      <Image
                        src={slide.originalImage}
                        alt={slide.prompt}
                        fill
                        unoptimized
                        className="object-contain rounded-xl transition-transform duration-500 group-hover/img:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground font-medium text-sm">
                        {t('showcase.no_image')}
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Prompt Section */}
                <div className="flex-[1] bg-secondary/30 rounded-2xl p-6 flex flex-col border border-border/50 min-w-0 h-full">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <div className="w-3 h-3 bg-muted-foreground/50 rounded-full"></div>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                      {t('showcase.prompt')}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">
                    <Tooltip open={copied ? true : undefined}>
                      <TooltipTrigger asChild>
                        <p
                          className="text-foreground/80 text-sm leading-relaxed cursor-pointer hover:text-foreground transition-colors break-words selection:bg-primary/30"
                          onClick={() => handleCopy(slide.prompt)}
                        >
                          {slide.prompt}
                        </p>
                      </TooltipTrigger>
                      <TooltipContent className={cn(copied && "bg-primary text-primary-foreground border-none")}>
                        <div className="flex items-center gap-1.5 font-medium">
                          {copied ? (
                            <>
                              <Check className="size-3.5 stroke-[3]" />
                              <span>{t('showcase.prompt_copied')}</span>
                            </>
                          ) : (
                            <span>{t('showcase.click_to_use_prompt')}</span>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>

                {/* 3. Video Section */}
                <div className="flex-[6] bg-secondary/30 rounded-2xl p-6 flex flex-col border border-border/50 min-h-[300px] lg:min-h-0 min-w-0 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 shrink-0">
                    <div className="w-3 h-3 bg-primary rounded-full animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
                    <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                      {t('showcase.video')}
                    </span>
                  </div>
                  <div className="flex-1 min-h-0 relative group/vid">
                    <VideoWithSkeleton 
                      src={slide.videoSrc} 
                      poster={slide.videoSrc.replace('.mp4', '.jpg')} // Simple heuristic for posters if available
                      ref={(el) => {
                        videoRefs.current[index] = el
                      }}
                    />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <div className="flex items-center justify-center gap-4 mt-8">
        <Button
          className="rotate-180 rounded-full"
          title={t('showcase.go_to_previous_example')}
          onClick={() => api?.scrollPrev()}
          variant="outline"
          size="icon"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>

        <div className="flex items-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                'w-2 h-2 rounded-full transition-all duration-200',
                index === current
                  ? 'bg-primary w-6'
                  : 'bg-muted-foreground hover:bg-foreground'
              )}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>

        <Button
          title={t('showcase.go_to_next_example')}
          className="rounded-full"
          onClick={() => api?.scrollNext()}
          variant="outline"
          size="icon"
        >
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      {showCTA && section.imageToVideo?.buttons && (
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          {section.imageToVideo.buttons.map((item: any, idx: number) => (
            <Button key={idx} variant={item.variant || 'default'} size="lg" className="rounded-full" asChild>
              <Link
                href={item.url || ''}
                target={item.target}
                className="flex items-center justify-center gap-1"
              >
                <span className="flex items-center justify-center gap-1">
                  {item.title}
                  {item.icon && (
                    <SmartIcon name={item.icon as string} className="size-6" />
                  )}
                </span>
              </Link>
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

import { Skeleton } from '@/shared/components/ui/skeleton'
import { AnimatePresence, motion } from 'motion/react'
import * as React from 'react'

const VideoWithSkeleton = React.forwardRef<HTMLVideoElement, { src: string; poster?: string }>(({ src, poster }, ref) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    // Safety timer
    const timer = setTimeout(() => setIsLoading(false), 2000)
    
    // Flicker prevention
    let skeletonTimer: NodeJS.Timeout | null = null
    if (isLoading) {
      skeletonTimer = setTimeout(() => setShowSkeleton(true), 200)
    } else {
      setShowSkeleton(false)
    }

    return () => {
      clearTimeout(timer)
      if (skeletonTimer) clearTimeout(skeletonTimer)
    }
  }, [src, isLoading])

  return (
    <div className="w-full h-full relative bg-black rounded-xl overflow-hidden">
      <AnimatePresence mode="wait">
        {isLoading && showSkeleton && (
          <motion.div
            key="skeleton"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 flex flex-col items-center justify-center gap-4 z-20"
          >
            <Skeleton className="absolute inset-0 w-full h-full rounded-none" />
            <div className="relative z-30 flex flex-col items-center gap-4 animate-in fade-in zoom-in duration-700">
              <div className="p-4 rounded-full bg-background/80 dark:bg-white/5 backdrop-blur-xl border border-border/50 dark:border-white/10 shadow-2xl">
                <Video className="size-8 text-primary/60 dark:text-primary/40 animate-pulse" />
              </div>
              <div className="flex flex-col items-center gap-2">
                <div className="h-1.5 w-28 bg-primary/10 dark:bg-primary/5 rounded-full overflow-hidden">
                  <div className="h-full bg-primary/40 dark:bg-primary/30 animate-[shimmer_2s_infinite] w-1/3 rounded-full" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {poster && (
        <img
          src={poster}
          alt=""
          aria-hidden="true"
          role="presentation"
          className="hidden"
          onLoad={() => setIsLoading(false)}
          onError={() => setIsLoading(false)}
        />
      )}

      <video
        ref={(el) => {
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
          videoRef.current = el
        }}
        className={cn(
          "w-full h-full object-cover rounded-xl transition-opacity duration-700",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        src={src}
        poster={poster}
        onLoadedData={() => setIsLoading(false)}
        onLoadedMetadata={() => setIsLoading(false)}
        onCanPlay={() => setIsLoading(false)}
        muted
        loop
        playsInline
        preload="auto"
      />
    </div>
  )
})
VideoWithSkeleton.displayName = 'VideoWithSkeleton'
const showCTA = true
