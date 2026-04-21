'use client';

import { useState, useEffect, useRef } from 'react';
import moment from 'moment';
import { Coins, Download, Loader2, MoreHorizontal, RefreshCw } from 'lucide-react';

import { AITaskStatus } from '@/extensions/ai/types';
import { LazyImage, AudioPlayer } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { AITask } from '@/shared/models/ai_task';

function parseTaskInfo(raw: string | null | undefined) {
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function StatusBadge({ status }: { status: string }) {
  const variantMap: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    [AITaskStatus.SUCCESS]: 'default',
    [AITaskStatus.FAILED]: 'destructive',
    [AITaskStatus.PENDING]: 'secondary',
    [AITaskStatus.PROCESSING]: 'secondary',
  };
  return (
    <Badge variant={variantMap[status] ?? 'outline'} className="text-xs capitalize">
      {status}
    </Badge>
  );
}

function TaskResultPreview({ taskInfo }: { taskInfo: string | null | undefined }) {
  const info = parseTaskInfo(taskInfo);
  if (!info) return <span className="text-muted-foreground text-sm">-</span>;

  if (info.errorMessage) {
    return <div className="text-destructive text-sm">Failed: {info.errorMessage}</div>;
  }

  if (info.images && info.images.length > 0) {
    return (
      <div className="flex flex-wrap gap-3">
        {info.images.map((image: any, index: number) => (
          <div key={index} className="flex flex-col gap-1">
            <LazyImage src={image.imageUrl} alt="Generated image" className="max-h-64 w-auto rounded" />
            <a
              href={image.imageUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        ))}
      </div>
    );
  }

  if (info.videos && info.videos.length > 0) {
    return (
      <div className="flex flex-wrap gap-3">
        {info.videos.map((video: any, index: number) => (
          <div key={index} className="flex flex-col gap-1">
            <video src={video.videoUrl} poster={video.thumbnailUrl} controls className="max-h-64 w-auto rounded" />
            <a
              href={video.videoUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 inline-flex items-center justify-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium transition-colors"
              onClick={(e) => e.stopPropagation()}
            >
              <Download className="h-3.5 w-3.5" />
              Download
            </a>
          </div>
        ))}
      </div>
    );
  }

  if (info.songs && info.songs.length > 0) {
    const songs = info.songs.filter((s: any) => s.audioUrl);
    return (
      <div className="flex flex-col gap-2">
        {songs.map((song: any) => (
          <AudioPlayer key={song.id} src={song.audioUrl} title={song.title} className="w-full" />
        ))}
      </div>
    );
  }

  return <span className="text-muted-foreground text-sm">-</span>;
}

function getPreviewThumbnail(task: AITask): { type: 'image' | 'video' | null; url: string | null } {
  const info = parseTaskInfo(task.taskInfo);
  if (!info) return { type: null, url: null };
  if (info.images?.length > 0) return { type: 'image', url: info.images[0].imageUrl || null };
  if (info.videos?.length > 0) return { type: 'video', url: info.videos[0].videoUrl || null };
  return { type: null, url: null };
}

export function UserAITasksGrid({ tasks, emptyMessage }: { tasks: AITask[]; emptyMessage?: string }) {
  const [selected, setSelected] = useState<AITask | null>(null);
  const [localTasks, setLocalTasks] = useState<AITask[]>(tasks);
  const [pollingIds, setPollingIds] = useState<Set<string>>(new Set());
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLocalTasks(tasks);
  }, [tasks]);

  const pendingTasks = localTasks.filter(
    (t) => t.status === AITaskStatus.PENDING || t.status === AITaskStatus.PROCESSING
  );

  // Auto-poll every 5s when there are pending tasks
  useEffect(() => {
    if (pendingTasks.length === 0) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }

    const poll = async () => {
      for (const task of pendingTasks) {
        try {
          const res = await fetch('/api/ai/query', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: task.id }),
          });
          const data = await res.json() as any;
          if (data.code === 0 && data.data) {
            setLocalTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...data.data } : t)));
            setSelected((prev) => prev && prev.id === task.id ? { ...prev, ...data.data } : prev);
          }
        } catch { /* ignore */ }
      }
    };

    intervalRef.current = setInterval(poll, 5000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [pendingTasks.length]);

  const manualRefresh = async (task: AITask) => {
    setPollingIds((prev) => new Set(prev).add(task.id));
    try {
      const res = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json() as any;
      if (data.code === 0 && data.data) {
        setLocalTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, ...data.data } : t)));
        setSelected((prev) => prev && prev.id === task.id ? { ...prev, ...data.data } : prev);
      }
    } catch { /* ignore */ }
    finally {
      setPollingIds((prev) => { const s = new Set(prev); s.delete(task.id); return s; });
    }
  };

  if (!localTasks.length) {
    return (
      <div className="text-muted-foreground flex w-full items-center justify-center py-16">
        {emptyMessage || 'No tasks found'}
      </div>
    );
  }

  return (
    <>
      {pendingTasks.length > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 px-3 py-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
          <Loader2 className="h-4 w-4 animate-spin" />
          {pendingTasks.length} task{pendingTasks.length > 1 ? 's' : ''} in progress — auto-refreshing every 5s
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {localTasks.map((task) => {
          const thumb = getPreviewThumbnail(task);
          const isPending = task.status === AITaskStatus.PENDING || task.status === AITaskStatus.PROCESSING;

          return (
            <div
              key={task.id}
              className="bg-card hover:bg-accent/50 group relative cursor-pointer overflow-hidden rounded-lg border transition-colors"
              onClick={() => setSelected(task)}
            >
              {/* 预览区域 */}
              <div className="bg-muted relative aspect-square w-full overflow-hidden">
                {thumb.type === 'image' && thumb.url ? (
                  <LazyImage src={thumb.url} alt="" className="h-full w-full object-cover" />
                ) : thumb.type === 'video' && thumb.url ? (
                  <video src={thumb.url} className="h-full w-full object-cover" muted />
                ) : (
                  <div className="text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-1">
                    {isPending && <Loader2 className="h-5 w-5 animate-spin" />}
                    <span className="text-xs">{task.mediaType}</span>
                  </div>
                )}
                <div className="absolute top-1.5 left-1.5">
                  <StatusBadge status={task.status ?? ''} />
                </div>
                <div className="absolute top-1.5 right-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                  <div className="bg-background/80 rounded-full p-1">
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="flex items-center justify-between px-2 py-1.5">
                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Coins className="h-3 w-3" />
                  <span>{task.costCredits ?? 0}</span>
                </div>
                <span
                  className="text-muted-foreground max-w-[90px] truncate text-xs"
                  title={task.model ?? ''}
                >
                  {task.model || moment(task.createdAt).fromNow()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 详情弹窗 */}
      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selected?.mediaType} · {selected?.model}
            </DialogTitle>
          </DialogHeader>

          {selected && (
            <div className="space-y-4">
              <TaskResultPreview taskInfo={selected.taskInfo} />

              <div className="grid gap-y-2 text-sm" style={{ gridTemplateColumns: 'auto 1fr' }}>
                <div className="text-muted-foreground pr-8">Provider</div>
                <div className="break-all">{selected.provider || '-'}</div>

                <div className="text-muted-foreground pr-8">Model</div>
                <div className="break-all">{selected.model ?? '-'}</div>

                <div className="text-muted-foreground pr-8">Scene</div>
                <div>{selected.scene || '-'}</div>

                <div className="text-muted-foreground pr-8">Status</div>
                <div><StatusBadge status={selected.status ?? ''} /></div>

                <div className="text-muted-foreground pr-8">Cost Credits</div>
                <div className="flex items-center gap-1">
                  <Coins className="h-3.5 w-3.5" />
                  {selected.costCredits ?? 0}
                </div>

                <div className="text-muted-foreground pr-8">Created</div>
                <div>{selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '-'}</div>

                <div className="text-muted-foreground pr-8">Task ID</div>
                <div className="break-all font-mono text-xs">{selected.taskId ?? '-'}</div>
              </div>

              {selected.prompt && (
                <div className="space-y-1">
                  <div className="text-muted-foreground text-sm">Prompt</div>
                  <div className="bg-muted rounded p-2 text-sm break-words whitespace-pre-wrap">
                    {selected.prompt}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {(selected.status === AITaskStatus.PENDING || selected.status === AITaskStatus.PROCESSING) && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pollingIds.has(selected.id)}
                    onClick={() => manualRefresh(selected)}
                  >
                    {pollingIds.has(selected.id)
                      ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      : <RefreshCw className="mr-1.5 h-3.5 w-3.5" />}
                    Refresh Status
                  </Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
