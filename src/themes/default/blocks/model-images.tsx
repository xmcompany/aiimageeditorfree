'use client';

import { useState } from 'react';
import { motion } from 'motion/react';
import { Image as ImageIcon, Wand2, X } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { buildGenerateUrl } from '@/shared/lib/generate-url';
import { LazyImage } from '@/shared/blocks/common';
import { Section } from '@/shared/types/blocks/landing';

function ImageCard({
  image,
  idx,
  onClick,
}: {
  image: { src: string; prompt?: string; label?: string };
  idx: number;
  onClick: (src: string, prompt?: string) => void;
}) {
  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted/30"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(image.src, image.prompt)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <LazyImage
          src={image.src}
          alt={image.label || image.prompt || 'Example'}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-opacity group-hover:bg-black/20 group-hover:opacity-100">
          <ImageIcon className="h-10 w-10 text-white drop-shadow-lg" />
        </div>
        {image.label && (
          <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
            {image.label}
          </span>
        )}
      </div>
      {image.prompt && (
        <div className="p-3">
          <p className="text-muted-foreground line-clamp-2 text-sm">{image.prompt}</p>
        </div>
      )}
    </motion.div>
  );
}

export function ModelImages({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const images: { src: string; prompt?: string; label?: string }[] =
    (section as any).images || [];
  const [active, setActive] = useState<{ src: string; prompt?: string } | null>(null);

  const rawTag = (section as any).tag as string | undefined;
  const safeModel =
    rawTag && !rawTag.includes('/') && rawTag.trim() ? rawTag.trim() : null;

  if (!images.length) return null;

  const generateUrl = safeModel
    ? buildGenerateUrl({
        type: 'image',
        prompt: active?.prompt,
        model: safeModel,
      })
    : '/ai-image-generator';

  return (
    <>
      <section
        id={section.id || 'model-images'}
        className={cn('py-16 md:py-24', section.className, className)}
      >
        <div className="container px-4">
          {(section.title || section.description) && (
            <motion.div
              className="mb-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {section.title && (
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {section.title}
                </h2>
              )}
              {section.description && (
                <p className="text-muted-foreground mx-auto mt-4 max-w-2xl text-lg">
                  {section.description}
                </p>
              )}
            </motion.div>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {images.map((img, idx) => (
              <ImageCard
                key={idx}
                image={img}
                idx={idx}
                onClick={(src, prompt) => setActive({ src, prompt })}
              />
            ))}
          </div>
        </div>
      </section>

      {active && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActive(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={active.src}
              alt=""
              className="max-h-[90vh] w-full object-contain"
            />
            <button
              type="button"
              onClick={() => setActive(null)}
              className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <a
                href={generateUrl}
                onClick={() => setActive(null)}
                className="flex items-center gap-2 whitespace-nowrap rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg transition-colors hover:bg-primary/90"
              >
                <Wand2 className="h-4 w-4" />
                {active?.prompt ? 'Create Similar Image' : 'Open AI Image Generator'}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
