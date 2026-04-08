'use client'

import { LazyImage } from '@/shared/blocks/common';
import { ScrollAnimation } from '@/shared/components/ui/scroll-animation';
import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

const DEFAULT_LOGOS = [
  {
    title: 'Kling',
    src: '/imgs/logos/kling.svg',
  },
  {
    title: 'Luma',
    src: '/imgs/logos/luma.svg',
  },
  {
    title: 'Wan',
    src: '/imgs/logos/wan.svg',
  },
  {
    title: 'Runway',
    src: '/imgs/logos/runway.svg',
  },
  {
    title: 'Pika',
    src: '/imgs/logos/pika.svg',
  },
];

export function Logos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  if (section.disabled || section.hidden) {
    return null;
  }

  return (
    <section
      id={section.id || section.name}
      className={cn('py-16 bg-background text-foreground', section.className, className)}
    >
      <div className="container px-4 md:px-6">
        <ScrollAnimation>
          <p className="text-md text-center font-medium opacity-70 mb-10">{section.title}</p>
        </ScrollAnimation>
        
        <ScrollAnimation delay={0.2}>
          <div className="flex flex-wrap items-center justify-center gap-x-12 sm:gap-x-20 gap-y-10 w-full">
            {DEFAULT_LOGOS.map((item, idx) => (
              <div key={idx} className="flex items-center justify-center transition-all duration-500 hover:scale-110">
                <LazyImage
                  className="h-7 md:h-9 w-auto grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-500 blur-[0.5px] hover:blur-0"
                  src={item.src}
                  alt={item.title}
                />
              </div>
            ))}
          </div>
        </ScrollAnimation>
      </div>
    </section>
  );
}
