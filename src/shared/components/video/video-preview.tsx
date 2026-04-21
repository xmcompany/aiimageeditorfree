'use client';

import { Download, ExternalLink, Play, Sparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';

import { cn, downloadVideo } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';

import { GeneratedVideo } from './video-card';
import DemoVideo from './demo-video';

interface VideoPreviewProps {
  video: GeneratedVideo | null;
  isGenerating: boolean;
  generationProgress?: string;
  onPromptSelect?: (prompt: string) => void;
}

export default function VideoPreview({
  video,
  isGenerating,
  generationProgress,
  onPromptSelect,
}: VideoPreviewProps) {
  const t = useTranslations('video.generator.preview');
  const handleDownload = async () => {
    if (video?.videoUrl) {
      try {
        const timestamp = new Date(video.createdAt).toISOString().slice(0, 10);
        const videoName = `${video.model}-${timestamp}-${video.id.slice(0, 8)}`;
        await downloadVideo(videoName, video.videoUrl);
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleOpenDirect = () => {
    if (video?.videoUrl) {
      window.open(video.videoUrl, '_blank');
    }
  };

  return (
    <div className={cn(
      "h-full space-y-6 overflow-x-hidden overflow-y-auto scrollbar-hide backdrop-blur-3xl bg-card border border-border/10 rounded-3xl p-8 shadow-2xl relative",
      "dark:bg-zinc-900/40 dark:border-zinc-800/50"
    )}>
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
      
      {video || isGenerating ? (
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif font-extrabold text-2xl text-foreground tracking-tight flex items-center gap-3">
              <div className="bg-muted p-2 rounded-xl shadow-inner text-primary">
                <Play className="w-4 h-4 fill-current" />
              </div>
              {t('title')}
            </h3>
            {video?.status === 'completed' && (
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-xl border-primary/20 hover:bg-primary/5 font-bold h-10 px-4"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" />
                  {t('download')}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-xl hover:bg-muted font-bold h-10 px-4"
                  onClick={handleOpenDirect}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  {t('open_direct')}
                </Button>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="aspect-video bg-black/40 rounded-3xl overflow-hidden relative flex items-center justify-center border border-border/10 shadow-inner group/video">
              {video?.status === 'failed' ? (
                <div className="text-center p-8 animate-in fade-in zoom-in-95">
                  <div className="w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6 text-destructive shadow-[0_0_30px_rgba(239,68,68,0.2)]">
                    <span className="text-3xl font-bold">!</span>
                  </div>
                  <p className="text-foreground text-xl font-bold mb-2">{t('failed_title')}</p>
                  <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                    {video.failReason || t('failed_subtitle')}
                  </p>
                </div>
              ) : isGenerating || video?.status === 'generating' ? (
                <div className="text-center p-8 animate-in fade-in zoom-in-95">
                  <div className="relative w-24 h-24 mx-auto mb-8">
                    <div className="absolute inset-0 border-4 border-primary/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]" />
                    <div className="absolute inset-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary animate-pulse" />
                    </div>
                  </div>
                  <p className="text-foreground text-xl font-bold mb-2 animate-pulse">{t('generating_title')}</p>
                  <p className="text-muted-foreground text-sm font-medium italic tracking-tight">{generationProgress || t('generating_subtitle')}</p>
                </div>
              ) : video?.status === 'completed' && video.videoUrl ? (
                <video
                  key={video.videoUrl}
                  className="w-full h-full object-contain transition-transform duration-700 group-hover/video:scale-105"
                  controls
                  poster={video.thumbnailUrl}
                  playsInline
                >
                  <source src={video.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              ) : (
                <div className="text-center opacity-40">
                    <p className="text-muted-foreground font-serif italic text-lg">{t('placeholder')}</p>
                </div>
              )}
            </div>

            {video && (
              <div className="mt-8 space-y-4 animate-in slide-in-from-bottom-4 duration-500">
                <div className="bg-muted/30 p-5 rounded-2xl border border-border/5">
                  <p className="text-foreground leading-relaxed italic line-clamp-3">"{video.prompt}"</p>
                </div>
                <div className="flex items-center gap-4 text-muted-foreground text-xs font-bold uppercase tracking-widest pl-2">
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full border border-primary/10">Model: {video.model}</span>
                  <span className="opacity-50">ID: {video.id.slice(0, 8)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="relative z-10">
          <DemoVideo onPromptSelect={onPromptSelect || (() => {})} />
        </div>
      )}
    </div>
  );
}
