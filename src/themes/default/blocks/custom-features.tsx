'use client';

import { motion } from 'framer-motion';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function CustomFeatures({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
    return (
    <section
      id={section.id || section.name}
      className={cn('pt-24 md:pt-32 pb-0 relative', section.className, className)}
    >
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1200px] bg-gradient-to-b from-primary/10 via-background/50 to-transparent pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>
      <motion.div
        className="container mb-8 text-center relative z-10"
        initial={{ opacity: 1, y: 0 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{
          duration: 0,
        }}
      >
        {section.sr_only_title && (
          <h1 className="sr-only">{section.sr_only_title}</h1>
        )}
        <h2 className="mx-auto mb-6 max-w-full text-4xl font-serif font-extrabold tracking-tight text-pretty md:max-w-5xl lg:text-6xl">
          {section.title}
        </h2>
        <p className="text-muted-foreground text-md mx-auto mb-4 max-w-2xl lg:text-xl opacity-90 leading-relaxed">
          {section.description}
        </p>
      </motion.div>
    </section>)
}