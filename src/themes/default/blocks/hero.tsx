'use client';

import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
// import { useTranslations } from 'next-intl';

import { Link } from '@/core/i18n/navigation';
import { LazyImage, SmartIcon } from '@/shared/blocks/common';
import { AnimatedGridPattern } from '@/shared/components/ui/animated-grid-pattern';
// import { AnimatedGradientText } from '@/shared/components/ui/animated-gradient-text';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
// import { Highlighter } from '@/shared/components/ui/highlighter';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import HeroInput from '@/shared/components/video/hero-input';
import HeroBg from './hero-bg';

import { SocialAvatars } from './social-avatars';

const createFadeInVariant = (delay: number) => ({
  initial: {
    opacity: 0,
    y: 20,
    filter: 'blur(6px)',
  },
  animate: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
  },
  transition: {
    duration: 0.6,
    delay,
    ease: [0.22, 1, 0.36, 1] as const,
  },
});

export function Hero({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const highlightText = section.highlight_text ?? '';
  let texts: string[] = ['', ''];
  if (section.title) {
    if (highlightText && section.title.includes(highlightText)) {
      texts = section.title.split(highlightText, 2);
    } else {
      texts = [section.title, ''];
    }
  }

  return (
    <>
      <section
        id={section.id}
        className={cn(
          `relative pt-16 pb-8 md:pt-48 md:pb-12 overflow-hidden`,
          section.show_bg_spline && 'dark bg-black',
          section.className,
          className
        )}
      >
        {section.show_bg_spline && <HeroBg />}

        <div className="container relative z-10 mx-auto max-w-6xl px-4 text-center">
          {section.announcement && (
            <motion.div {...createFadeInVariant(0)}>
              <Link
                href={section.announcement.url || ''}
                target={section.announcement.target || '_self'}
                className="hover:bg-background dark:hover:border-t-border bg-muted group mx-auto mb-8 flex w-fit items-center gap-4 rounded-full border p-1 pl-4 shadow-md shadow-zinc-950/5 transition-colors duration-300 dark:border-t-white/5 dark:shadow-zinc-950"
              >
                {section.announcement.badge && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {section.announcement.badge}
                  </Badge>
                )}
                <span className="text-foreground text-sm font-medium">
                  {section.announcement.title}
                </span>
                <div className="bg-background group-hover:bg-muted ml-1 flex size-6 overflow-hidden rounded-full duration-500">
                   <ArrowRight className="m-auto size-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            </motion.div>
          )}

          <motion.div {...createFadeInVariant(0.15)}>
            <h1 className="text-foreground font-serif font-extrabold leading-[1.15] tracking-tight text-balance mb-6 md:mb-0">
              <span className="block bg-gradient-to-r from-primary via-indigo-400 to-primary bg-clip-text text-transparent drop-shadow-sm text-3xl sm:text-5xl lg:text-6xl">
                {texts[0]}{highlightText || ''}
              </span>
              {texts[1] && (
                <span className="block text-foreground text-3xl sm:text-5xl lg:text-6xl">
                  {' '}{texts[1].replace(/^\s*[—–-]+\s*/, '')}
                </span>
              )}
            </h1>
          </motion.div>

          <motion.p
            {...createFadeInVariant(0.3)}
            className="text-muted-foreground mx-auto mt-8 mb-14 max-w-2xl text-lg text-balance md:text-xl lg:text-2xl opacity-90 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: section.description ?? '' }}
          />

          {!section.show_hero_input && section.buttons && (
            <motion.div
              {...createFadeInVariant(0.45)}
              className="flex flex-wrap items-center justify-center gap-4"
            >
              {section.buttons.map((button, idx) => (
                <Button
                  asChild
                  size="lg"
                  variant={button.variant || (idx === 0 ? 'default' : 'outline')}
                  className="rounded-[var(--radius)] h-14 px-12 text-lg shadow-xl transition-all hover:scale-105 active:scale-95"
                  key={idx}
                >
                  <Link
                    href={button.url ?? ''}
                    target={button.target ?? '_self'}
                  >
                    {button.icon && <SmartIcon name={button.icon as string} className="mr-2" />}
                    <span>{button.title}</span>
                  </Link>
                </Button>
              ))}
            </motion.div>
          )}

          {section.show_hero_input && (
            <motion.div {...createFadeInVariant(0.45)} className="mx-auto max-w-3xl mt-10">
              <HeroInput />
            </motion.div>
          )}

          {section.tip && (
            <motion.div
              {...createFadeInVariant(0.6)}
              className="mt-12 flex justify-center"
            >
              <a
                href="#credits-ways"
                className="inline-flex w-fit items-center gap-2.5 rounded-full border border-primary/20 bg-primary/10 px-6 py-3 text-base font-semibold text-primary transition-all hover:bg-primary/20 hover:scale-105"
              >
                <span>🎁</span>
                <span>How to Generate AI Videos for Free?</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </motion.div>
          )}

          {section.show_avatars && (
            <motion.div {...createFadeInVariant(0.75)} className="mt-10">
              <SocialAvatars tip={section.avatars_tip || ''} />
            </motion.div>
          )}
        </div>

        {section.image && (
          <motion.div
            className="relative z-10 mx-auto mt-16 max-w-6xl px-4"
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{
              delay: 0.9,
              duration: 0.8,
              ease: [0.22, 1, 0.36, 1] as const,
            }}
          >
             <div className="bg-muted/50 relative overflow-hidden rounded-2xl border shadow-2xl">
                <div className="from-background/10 absolute inset-0 bg-gradient-to-tr via-transparent to-transparent" />
                <LazyImage
                  className="w-full object-cover dark:opacity-90"
                  src={section.image?.src || ''}
                  alt={section.image?.alt || ''}
                />
             </div>
          </motion.div>
        )}

        {!section.show_bg_spline && (
          section.background_image ? (
            <div className="absolute inset-0 -z-10 h-full w-full overflow-hidden">
              <div className="from-background via-background/60 to-background absolute inset-0 z-10 bg-gradient-to-b" />
              <LazyImage
                src={section.background_image?.src || ''}
                alt={section.background_image?.alt || ''}
                className="h-full w-full object-cover opacity-40"
              />
            </div>
          ) : section.show_bg !== false ? (
            <AnimatedGridPattern
              numSquares={30}
              maxOpacity={0.1}
              duration={3}
              repeatDelay={1}
              className={cn(
                '[mask-image:radial-gradient(600px_circle_at_center,white,transparent)]',
                'inset-x-0 inset-y-[-30%] h-[200%] skew-y-12'
              )}
            />
          ) : null
        )}
      </section>
    </>
  );
}
