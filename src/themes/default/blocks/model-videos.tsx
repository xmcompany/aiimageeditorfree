'use client';

import { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Play, X, Volume2, VolumeX, Wand2 } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { buildGenerateUrl } from '@/shared/lib/generate-url';
import { Section } from '@/shared/types/blocks/landing';

// 单个视频卡片
function VideoCard({
  video,
  idx,
  onClick,
}: {
  video: { src: string; poster?: string; prompt?: string; label?: string };
  idx: number;
  onClick: (src: string, prompt?: string) => void;
}) {
  const hasPoster = video.poster && !video.poster.match(/\.(mp4|webm|mov)$/i);
  // 去掉已有的 #t= fragment，统一由 onLoadedMetadata 来 seek
  const cleanSrc = video.src.split('#')[0];

  return (
    <motion.div
      className="group relative cursor-pointer overflow-hidden rounded-xl border bg-muted/30"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.4, delay: idx * 0.05, ease: [0.22, 1, 0.36, 1] }}
      onClick={() => onClick(cleanSrc, video.prompt)}
    >
      <div className="relative aspect-video overflow-hidden bg-muted">
        <video
          src={cleanSrc}
          poster={hasPoster ? video.poster : undefined}
          muted
          loop
          playsInline
          preload="metadata"
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            v.currentTime = 0.5;
          }}
          onMouseEnter={(e) => (e.currentTarget as HTMLVideoElement).play()}
          onMouseLeave={(e) => {
            const v = e.currentTarget as HTMLVideoElement;
            v.pause();
            v.currentTime = 0.5;
          }}
        />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100 bg-black/20">
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
          <p className="text-muted-foreground line-clamp-2 text-sm">{video.prompt}</p>
        </div>
      )}
    </motion.div>
  );
}

export function ModelVideos({
  section,
  className,
}: {
  section: Section;
  className?: string;
}) {
  const videos: { src: string; poster?: string; prompt?: string; label?: string }[] =
    section.videos || [];
  const [activeVideo, setActiveVideo] = useState<{ src: string; prompt?: string } | null>(null);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // 从 section tag 推断模型 id，用于生成链接带模型参数
  const modelId = (section as any).tag || (section as any).model || null;

  if (!videos.length) return null;

  const generateUrl = buildGenerateUrl({
    type: 'video',
    prompt: activeVideo?.prompt,
    model: modelId,
  });

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
              <VideoCard
                key={idx}
                video={video}
                idx={idx}
                onClick={(src, prompt) => setActiveVideo({ src, prompt })}
              />
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
              src={activeVideo.src}
              autoPlay
              controls
              muted={muted}
              className="max-h-[90vh] w-full"
            />
            {/* 关闭 */}
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-3 right-3 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <X className="h-5 w-5" />
            </button>
            {/* 静音切换 */}
            <button
              onClick={() => {
                setMuted(!muted);
                if (videoRef.current) videoRef.current.muted = !muted;
              }}
              className="absolute top-3 right-14 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
            {/* 生成同款 */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <a
                href={generateUrl}
                onClick={() => setActiveVideo(null)}
                className="flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
              >
                <Wand2 className="h-4 w-4" />
                {activeVideo?.prompt ? 'Create Similar Video' : 'Generate AI Video'}
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
