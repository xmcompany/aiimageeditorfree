'use client'

import { ArrowRight, Check, History, Info, Play, Sparkles, Video } from 'lucide-react';
import { useState, useRef, useId, useEffect } from 'react'
import { AnimatePresence, motion } from 'motion/react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/components/ui/tooltip'
import { Button } from '@/shared/components/ui/button'
import { cn, handlePromptClick } from '@/shared/lib/utils'
import { Link } from '@/core/i18n/navigation'
import { useTranslations } from 'next-intl';
import { SmartIcon } from '@/shared/blocks/common';

import { Skeleton } from '@/shared/components/ui/skeleton'

interface VideoSlideData {
  prompt: string
  src?: string
  videoSrc?: string
  poster?: string
  url?: string
  target?: string
}

interface VideoSlideProps {
  slide: VideoSlideData
  index: number
  current: number
  handleSlideClick: (index: number) => void
}

const VideoSlide = ({
  slide,
  index,
  current,
  handleSlideClick,
}: VideoSlideProps) => {
  const [isLoading, setIsLoading] = useState(true)
  const [showSkeleton, setShowSkeleton] = useState(false)
  const slideRef = useRef<HTMLLIElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  const activeSrc = slide.videoSrc || slide.src
  const poster = slide.poster

  // Robust loading control
  useEffect(() => {
    // If no source at all, don't show skeleton
    if (!activeSrc && !poster) {
      setIsLoading(false)
      setShowSkeleton(false)
      return
    }

    // 1. Safety timeout: Force hide after 1.5s (posters are usually fast)
    const timer = setTimeout(() => setIsLoading(false), 1500)

    // 2. Immediate checks for cached or already ready media
    if (videoRef.current && videoRef.current.readyState >= 3) { // Have future data
      setIsLoading(false)
    }

    // 3. Prevent flickering: Only show skeleton if loading takes more than 200ms
    let skeletonTimer: NodeJS.Timeout | null = null;
    if (isLoading) {
      skeletonTimer = setTimeout(() => setShowSkeleton(true), 200)
    } else {
      setShowSkeleton(false)
    }

    return () => {
      clearTimeout(timer)
      if (skeletonTimer) clearTimeout(skeletonTimer)
    }
  }, [activeSrc, poster, isLoading])

  // Animation and interaction
  const frameRef = useRef<number | null>(null)
  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current
    if (!el || current !== index) return
    if (frameRef.current) return
    const rect = el.getBoundingClientRect()
    const x = event.clientX - (rect.left + Math.floor(rect.width / 2))
    const y = event.clientY - (rect.top + Math.floor(rect.height / 2))
    frameRef.current = requestAnimationFrame(() => {
      if (el) {
        el.style.setProperty('--x', `${x}px`)
        el.style.setProperty('--y', `${y}px`)
      }
      frameRef.current = null
    })
  }

  const handleMouseLeave = () => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current)
    frameRef.current = null
    requestAnimationFrame(() => {
      if (slideRef.current) {
        slideRef.current.style.setProperty('--x', '0px')
        slideRef.current.style.setProperty('--y', '0px')
      }
    })
  }

  // AutoPlay logic
  useEffect(() => {
    const video = videoRef.current
    if (!video || !activeSrc) return

    if (current === index) {
      video.play().catch(() => {})
    } else {
      video.pause()
    }
  }, [current, index, activeSrc])

  return (
    <div className="[perspective:1200px] [transform-style:preserve-3d]">
      <li
        ref={slideRef}
        className="flex flex-1 flex-col items-center justify-center relative text-center text-white opacity-100 transition-all duration-300 ease-in-out w-[50vmin] h-[50vmin] mx-[4vmin] z-10 cursor-pointer"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? 'scale(0.95) rotateX(10deg)'
              : 'scale(1) rotateX(0deg)',
          transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformOrigin: 'bottom',
          '--x': '0px',
          '--y': '0px'
        } as any}
      >
        <div
          className={cn(
            "absolute top-0 left-0 w-full h-full rounded-[1%] overflow-hidden transition-all duration-500 ease-out bg-black",
            isLoading && "bg-secondary/40 dark:bg-secondary/20"
          )}
          style={{
            transform:
              current === index
                ? 'translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)'
                : 'none',
          }}
        >
          <AnimatePresence mode="wait">
            {isLoading && showSkeleton && (
              <motion.div
                key="skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
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

          {/* Detect poster load to dismiss skeleton immediately */}
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
            ref={videoRef}
            className={cn(
              "absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ease-in-out",
              current === index ? "opacity-100" : "opacity-35"
            )}
            src={activeSrc}
            poster={poster}
            onLoadedData={() => setIsLoading(false)}
            onLoadedMetadata={() => setIsLoading(false)}
            onCanPlay={() => setIsLoading(false)}
            muted
            loop
            playsInline
            preload="auto"
            suppressHydrationWarning
          />
        </div>
      </li>
    </div>
  )
}

interface TextToVideoControlProps {
  type: string
  title: string
  handleClick: () => void
}

const TextToVideoControl = ({
  type,
  title,
  handleClick,
}: TextToVideoControlProps) => {
  return (
    <Button
      className={cn(
        type === 'previous' ? 'rotate-180' : '',
        'rounded-full border-zinc-200 dark:border-zinc-800 text-foreground hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all duration-300 w-10 h-10'
      )}
      title={title}
      onClick={handleClick}
      variant="outline"
      size="icon"
    >
      <span className="flex items-center justify-center">
        <ArrowRight className="h-4 w-4" />
      </span>
    </Button>
  )
}

interface TextToVideoShowcaseProps {
  slides: VideoSlideData[]
  section: any
  showCTA?: boolean
  onPromptClick?: (prompt: string) => void
}

export function TextToVideoShowcase({
  slides,
  section,

  showCTA = true,
  onPromptClick,
}: TextToVideoShowcaseProps) {
  const t = useTranslations('common');
  const [current, setCurrent] = useState(1)
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  const handlePreviousClick = () => {
    const previous = current - 1
    setCurrent(previous < 0 ? slides.length - 1 : previous)
  }

  const handleNextClick = () => {
    const next = current + 1
    setCurrent(next === slides.length ? 0 : next)
  }

  const handleSlideClick = (index: number) => {
    if (current !== index) {
      setCurrent(index)
    }
  }

  const id = useId()

  return (
    <div className="relative w-full">
      <div
        className="relative w-[50vmin] h-[50vmin] mx-auto"
        aria-labelledby={`text-to-video-showcase-heading-${id}`}
      >
        <ul
          className="absolute flex mx-[-4vmin] transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <VideoSlide
              key={index}
              slide={slide}
              index={index}
              current={current}
              handleSlideClick={handleSlideClick}
            />
          ))}
        </ul>
      </div>

      {/* Controls - Now outside the w-[50vmin] container */}
      <div className="mt-4 flex items-center justify-center w-full gap-4 px-4">
        <TextToVideoControl
          type="previous"
          title={t('showcase.go_to_previous_video')}
          handleClick={handlePreviousClick}
        />

        {
          <Tooltip open={copied ? true : undefined}>
            <TooltipTrigger asChild>
              <div
                className="flex-1 max-w-2xl px-6 py-3 bg-secondary/80 backdrop-blur-md rounded-full border border-border cursor-pointer hover:bg-secondary transition-all duration-300 shadow-sm group"
                onClick={() => {
                  const prompt = slides[current]?.prompt
                  if (prompt) {
                    handleCopy(prompt)
                    if (onPromptClick) {
                      onPromptClick(prompt)
                    } else {
                      handlePromptClick(prompt)
                    }
                  }
                }}
              >
                <p className="text-sm text-foreground/90 line-clamp-1 leading-relaxed text-center font-medium group-hover:text-foreground transition-colors">
                  {slides[current]?.prompt}
                </p>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className={cn(copied && "bg-primary text-primary-foreground border-none")}>
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
        }

        <TextToVideoControl
          type="next"
          title={t('showcase.go_to_next_video')}
          handleClick={handleNextClick}
        />
      </div>

      {/* CTA Button - Now outside the w-[50vmin] container */}
      {showCTA && section.textToVideo?.buttons && (
        <div className="mt-8 flex flex-wrap justify-center gap-4 px-4 sm:px-0">
          {section.textToVideo.buttons.map((item: any, idx: number) => (
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
