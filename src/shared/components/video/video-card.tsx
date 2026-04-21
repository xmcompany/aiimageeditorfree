'use client';

import {
  Download,
  ExternalLink,
  MoreHorizontal,
  Play,
  Share,
  Trash2,
} from 'lucide-react';
import { useRouter } from '@/core/i18n/navigation';
import { toast } from 'sonner';

import { cn, downloadVideo, shareVideo } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export type GeneratedVideoStatus =
  | 'pending'
  | 'generating'
  | 'completed'
  | 'failed';

export interface GeneratedVideo {
  id: string;
  prompt: string;
  model: string;
  parameters: Record<string, any>;
  videoUrl?: string;
  thumbnailUrl?: string;
  startImageUrl?: string;
  status: GeneratedVideoStatus;
  createdAt: Date;
  failReason?: string;
}

interface VideoCardProps {
  video: GeneratedVideo;
  onVideoSelect?: (video: GeneratedVideo) => void;
  onDelete?: (video: GeneratedVideo) => void;
  enableNavigation?: boolean;
  onVideoDeleted?: (videoId: string) => void;
}

export default function VideoCard({
  video,
  onVideoSelect,
  onDelete,
  enableNavigation = true,
  onVideoDeleted,
}: VideoCardProps) {
  const router = useRouter();

  const handleCardClick = () => {
    if (enableNavigation) {
      router.push(`/ai-video-generator?id=${video.id}`);
    } else if (onVideoSelect) {
      onVideoSelect(video);
    }
  };

  const handleDownload = async () => {
    if (video.videoUrl) {
      try {
        const timestamp = new Date(video.createdAt).toISOString().slice(0, 10);
        const videoName = `${video.model}-${timestamp}-${video.id.slice(0, 8)}`;
        await downloadVideo(videoName, video.videoUrl);
      } catch (error) {
        console.error('Download failed:', error);
        toast.error('Download failed');
      }
    }
  };

  const handleShare = async () => {
    if (video.videoUrl) {
      try {
        await shareVideo('Generated Video', video.prompt, video.videoUrl);
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch('/api/video/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: video.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete video');
      }

      toast.success('Video deleted successfully');
      onVideoDeleted?.(video.id);
      onDelete?.(video);
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error('Failed to delete video');
    }
  };

  const getStatusIcon = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'completed':
        return <div className="w-2 h-2 bg-green-400 rounded-full" />;
      case 'failed':
        return <div className="w-2 h-2 bg-red-400 rounded-full" />;
      case 'generating':
        return (
          <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />
        );
      case 'pending':
        return <div className="w-2 h-2 bg-blue-400 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-gray-400 rounded-full" />;
    }
  };

  const getStatusColor = (status: GeneratedVideo['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-400';
      case 'failed':
        return 'text-red-400';
      case 'generating':
        return 'text-yellow-400';
      case 'pending':
        return 'text-blue-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <TooltipPrimitive.Provider delayDuration={300}>
      <div
        className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 cursor-pointer"
        onClick={handleCardClick}
      >
        {/* Video Thumbnail / Preview Area */}
        <div className="relative aspect-video w-full overflow-hidden bg-muted/30">
          {video.status === 'completed' ? (
            video.thumbnailUrl || video.startImageUrl ? (
              <img
                src={video.thumbnailUrl || video.startImageUrl}
                alt="Video thumbnail"
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 overflow-hidden">
                <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '16px 16px' }}></div>
                <div className="relative flex flex-col items-center gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/5 backdrop-blur-sm border border-white/20">
                    <Play className="h-6 w-6 text-slate-500 fill-slate-400 ml-1" />
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">No Preview</span>
                </div>
              </div>
            )
          ) : video.status === 'failed' ? (
            <div className="flex h-full w-full flex-col items-center justify-center bg-destructive/5 p-4 text-center">
              <div className="mb-2 rounded-full bg-destructive/10 p-3">
                <span className="text-xl">⚠️</span>
              </div>
              <span className="text-xs font-medium text-destructive">Generation Failed</span>
            </div>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-muted/30">
              <div className="animate-pulse flex flex-col items-center gap-2">
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                  <Play className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <span className="text-xs text-muted-foreground">Generating...</span>
              </div>
            </div>
          )}

          {/* Status Badge (Top Left) */}
          <div className="absolute left-3 top-3 z-20">
            <div className={cn(
              "flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-wide shadow-sm backdrop-blur-md",
              video.status === 'completed' ? "bg-green-500/90 text-white" :
              video.status === 'failed' ? "bg-destructive/90 text-white" :
              "bg-warning/90 text-warning-foreground"
            )}>
              {video.status === 'completed' || video.status === 'failed' ? null : (
                <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />
              )}
              {video.status}
            </div>
          </div>

          {/* Action Overlay (Bottom Right) */}
          <div className="absolute bottom-3 right-3 z-20 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full shadow-lg"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 rounded-xl">
                {video.status === 'completed' && (
                  <>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDownload(); }}>
                      <Download className="mr-2 h-4 w-4" /> Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleShare(); }}>
                      <Share className="mr-2 h-4 w-4" /> Share
                    </DropdownMenuItem>
                    <div className="my-1 h-px bg-border" />
                  </>
                )}
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive" 
                  onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
          {/* Centered Play Button Overlay (for completed videos) */}
          {video.status === 'completed' && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/10 backdrop-blur-[1px]">
               <div className="w-12 h-12 rounded-full bg-background/90 flex items-center justify-center shadow-lg transform scale-90 group-hover:scale-100 transition-all">
                  <Play className="w-5 h-5 text-foreground ml-0.5" />
               </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex flex-col p-4 relative z-10 bg-card/50 backdrop-blur-sm">
          <TooltipPrimitive.Root>
            <TooltipPrimitive.Trigger className="w-full text-left font-medium text-foreground text-sm truncate mb-1.5 bg-transparent border-0 p-0 cursor-help hover:text-primary transition-colors">
              {video.prompt}
            </TooltipPrimitive.Trigger>
            <TooltipPrimitive.Portal>
              <TooltipPrimitive.Content
                side="top"
                sideOffset={5}
                className="bg-popover text-popover-foreground shadow-xl animate-in fade-in-0 zoom-in-95 z-50 max-w-[300px] rounded-lg border border-border px-3 py-2 text-xs break-words leading-relaxed"
              >
                {video.prompt}
                <TooltipPrimitive.Arrow className="fill-popover stroke-border" />
              </TooltipPrimitive.Content>
            </TooltipPrimitive.Portal>
          </TooltipPrimitive.Root>
          
          <div className="flex items-center justify-between mt-1">
             <span className="inline-flex items-center rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
               {video.model}
             </span>
             <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70 font-medium">
               {new Date(video.createdAt).toLocaleDateString()}
             </span>
          </div>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
}
