'use client';

import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';
import Link from 'next/link';

interface VideoModel {
  name: string;
  provider: string;
  slug: string;
  description: string;
  capabilities: string[];
  resolution: string;
  duration: string;
  icon: string;
  versions: string[];
  featured?: boolean;
}

const videoModels: VideoModel[] = [
  {
    name: 'Seedance 2.0',
    provider: 'ByteDance',
    slug: 'seedance',
    description: 'ByteDance Seedance 2.0 delivers multimodal AI video with native audio, lip sync, multi-shot storytelling, and reference-driven generation.',
    capabilities: ['Text to Video', 'Image to Video', 'Lip Sync', 'Multi-Shot'],
    resolution: '720p',
    duration: '4-15s',
    icon: 'Clapperboard',
    versions: ['2.0', '1.5 Pro', '1.0 Pro Fast', 'V1'],
    featured: true,
  },
  {
    name: 'Wan 2.7',
    provider: 'Alibaba',
    slug: 'wan',
    description: 'Alibaba Wan 2.7 offers four generation modes — T2V, I2V, R2V, and Video Edit — with full-modality input up to 1080p.',
    capabilities: ['Text to Video', 'Image to Video', 'Video to Video', 'Video Editing'],
    resolution: '720p-1080p',
    duration: '5-10s',
    icon: 'Video',
    versions: ['2.7', '2.6', '2.5', 'Animate', 'V2.2'],
    featured: true,
  },
  {
    name: 'Kling 3.0',
    provider: 'Kuaishou',
    slug: 'kling',
    description: 'Kuaishou Kling 3.0 generates cinematic AI videos with native audio in 5 languages, multi-shot storytelling, and up to 15s duration.',
    capabilities: ['Text to Video', 'Image to Video', 'Native Audio', 'Motion Control'],
    resolution: '720p-1080p',
    duration: '3-15s',
    icon: 'Film',
    versions: ['3.0', '2.6', '2.5', 'V2.1'],
    featured: true,
  },
  {
    name: 'Sora 2 Pro',
    provider: 'OpenAI',
    slug: 'sora',
    description: 'OpenAI Sora 2 Pro excels at complex scene composition, multi-character interactions, storyboard control, and professional editing tools.',
    capabilities: ['Text to Video', 'Image to Video', 'Storyboard', 'Video Editing'],
    resolution: '720p-1080p',
    duration: '5-20s',
    icon: 'Sparkles',
    versions: ['2 Pro Storyboard', '2 Pro', '2'],
    featured: true,
  },
  {
    name: 'Veo 3.1',
    provider: 'Google',
    slug: 'veo',
    description: 'Google DeepMind Veo 3.1 produces cinema-grade AI video with photorealistic rendering, advanced composition, and professional visual quality.',
    capabilities: ['Text to Video', 'Image to Video', 'Cinematic Quality'],
    resolution: '720p-1080p',
    duration: '5-10s',
    icon: 'Clapperboard',
    versions: ['3.1'],
  },
  {
    name: 'Hailuo 2.3',
    provider: 'MiniMax',
    slug: 'hailuo',
    description: 'MiniMax Hailuo 2.3 delivers stylized AI video generation with efficient processing and reliable output quality for creative workflows.',
    capabilities: ['Text to Video', 'Image to Video', 'Stylized Output'],
    resolution: '720p',
    duration: '5-10s',
    icon: 'Zap',
    versions: ['2.3', '02'],
  },
  {
    name: 'Grok Imagine',
    provider: 'xAI',
    slug: 'grok-imagine',
    description: 'xAI Grok Imagine combines advanced language understanding with creative video generation for nuanced prompt interpretation.',
    capabilities: ['Text to Video', 'Image to Video', 'Prompt Understanding'],
    resolution: '720p',
    duration: '5-10s',
    icon: 'Brain',
    versions: ['Imagine'],
  },
  {
    name: 'Runway Gen-4',
    provider: 'Runway',
    slug: 'runway',
    description: 'Runway Gen-4 Turbo provides professional AI video generation with cinematic quality and advanced creative tools.',
    capabilities: ['Text to Video', 'Image to Video', 'Creative Tools'],
    resolution: '720p-1080p',
    duration: '5-10s',
    icon: 'Scissors',
    versions: ['Gen-4 Turbo', 'Aleph'],
  },
  {
    name: 'HappyHorse 1.0',
    provider: 'Open Source',
    slug: 'happyhorse',
    description: '#1 ranked open-source AI video model on Artificial Analysis. 15B parameters, native 1080p, audio sync, and multi-shot generation.',
    capabilities: ['Text to Video', 'Image to Video', 'Audio Sync', 'Multi-Shot'],
    resolution: '1080p',
    duration: '5-15s',
    icon: 'Award',
    versions: ['1.0'],
    featured: true,
  },
];

export function VideoModels({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  return (
    <section
      id={section.id}
      className={cn('py-16 md:py-24', section.className, className)}
    >
      <div className="container space-y-8 md:space-y-16">
        <ScrollAnimation>
          <div className="mx-auto max-w-4xl text-center text-balance">
            <h2 className="text-foreground mb-6 text-4xl font-serif font-extrabold tracking-tight text-pretty md:max-w-5xl lg:text-5xl">
              {section.title}
            </h2>
            <p className="text-muted-foreground mx-auto mb-4 max-w-2xl lg:text-xl opacity-90 leading-relaxed">
              {section.description}
            </p>
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.2}>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {videoModels.map((model) => (
              <Link
                key={model.slug}
                href={`/models/${model.slug}`}
                className={cn(
                  "group relative flex flex-col rounded-xl border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50",
                  model.featured && "border-primary/30 shadow-sm"
                )}
              >
                {model.featured && (
                  <div className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-xs font-medium text-primary-foreground">
                    Featured
                  </div>
                )}
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <SmartIcon name={model.icon} size={20} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-base leading-tight">
                      {model.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      by {model.provider}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4 line-clamp-3 flex-1">
                  {model.description}
                </p>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-1.5">
                    {model.capabilities.map((cap) => (
                      <span
                        key={cap}
                        className="inline-flex items-center rounded-full bg-primary/5 px-2.5 py-0.5 text-xs font-medium text-primary"
                      >
                        {cap}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <span>Resolution: {model.resolution}</span>
                    <span>Duration: {model.duration}</span>
                  </div>

                  {model.versions.length > 1 && (
                    <div className="text-xs text-muted-foreground">
                      Versions: {model.versions.join(', ')}
                    </div>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Powered by {model.name}</span>
                  <span className="text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View Details →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </ScrollAnimation>

        <ScrollAnimation delay={0.3}>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Powered by world-leading AI video generation models via{' '}
              <a
                href="https://kie.ai/market"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline"
              >
                Kie.ai
              </a>
            </p>
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
