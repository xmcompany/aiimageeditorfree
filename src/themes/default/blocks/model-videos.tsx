'use client';

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Play, X, Volume2, VolumeX } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Section } from '@/shared/types/blocks/landing';

export function ModelVideos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const videos: { src: string; poster?: string; prompt?: string; label?: string }[] =
    section.videos || [];
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  if (!videos.length) return null;

  return (
    <>
      <section
        id={section.id || 'model-videos'}
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
            {videos.map((video, idx) => (
              <motion.div
                key={idx}
                className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted/30"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.4,
                  delay: idx * 0.05,
                  ease: [0.22, 1, 0.36, 1],
                }}
                onClick={() => setActiveVideo(video.src)}
              >
                <div className="relative aspect-video overflow-hidden">
                  <video
                    src={video.src}
                    poster={video.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    onMouseEnter={(e) => (e.target as HTMLVideoElement).play()}
                    onMouseLeave={(e) => {
                      const v = e.target as HTMLVideoElement;
                      v.pause();
                      v.currentTime = 0;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                    <Play className="h-12 w-12 text-white drop-shadow-lg" />
                  </div>
                  {video.label && (
                    <span className="absolute top-2 left-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
                      {video.label}
                    </span>
                  )}
                </div>
                {video.prompt && (
                  <div className="p-3">
                    <p className="text-muted-foreground line-clamp-2 text-sm">
                      {video.prompt}
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {activeVideo && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setActiveVideo(null)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <video
              ref={videoRef}
              src={activeVideo}
              autoPlay
              controls
              muted={muted}
              className="max-h-[90vh] w-full"
            />
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            <button
              onClick={() => {
                setMuted(!muted);
                if (videoRef.current) videoRef.current.muted = !muted;
              }}
              className="absolute top-3 right-14 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              {muted ? (
                <VolumeX className="h-5 w-5" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
