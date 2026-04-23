'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Download,
  Loader2,
  Sparkles,
  User,
  Video,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import { ImageUploader, ImageUploaderValue } from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
// import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';

interface VideoGeneratorProps {
  maxSizeMB?: number;
  srOnlyTitle?: string;
}

interface GeneratedVideo {
  id: string;
  url: string;
  provider?: string;
  model?: string;
  prompt?: string;
}

interface BackendTask {
  id: string;
  status: string;
  provider: string;
  model: string;
  prompt: string | null;
  taskInfo: string | null;
  taskResult: string | null;
}

type VideoGeneratorTab = 'text-to-video' | 'image-to-video' | 'video-to-video';

const POLL_INTERVAL = 15000;
const GENERATION_TIMEOUT = 600000; // 10 minutes for video
const MAX_PROMPT_LENGTH = 2000;

const textToVideoCredits = 6;
const imageToVideoCredits = 8;
const videoToVideoCredits = 10;

const MODEL_OPTIONS = [
  // Replicate models
  {
    value: 'google/veo-3.1',
    label: 'Veo 3.1',
    provider: 'replicate',
    scenes: ['text-to-video', 'image-to-video'],
  },
  {
    value: 'google/veo-3.1-fast',
    label: 'Veo 3.1 Fast',
    provider: 'replicate',
    scenes: ['text-to-video', 'image-to-video'],
  },
  // Fal models
  {
    value: 'fal-ai/veo3',
    label: 'Veo 3',
    provider: 'fal',
    scenes: ['text-to-video'],
  },
  {
    value: 'fal-ai/wan-pro/image-to-video',
    label: 'Wan Pro',
    provider: 'fal',
    scenes: ['image-to-video'],
  },
  {
    value: 'fal-ai/kling-video/o1/video-to-video/edit',
    label: 'Kling Video O1',
    provider: 'fal',
    scenes: ['video-to-video'],
  },
];

const PROVIDER_OPTIONS = [
  {
    value: 'replicate',
    label: 'Replicate',
  },
  {
    value: 'fal',
    label: 'Fal',
  },
  {
    value: 'kie',
    label: 'Kie',
  },
];

function parseTaskResult(taskResult: string | null): any {
  if (!taskResult) {
    return null;
  }

  try {
    return JSON.parse(taskResult);
  } catch (error) {
    console.warn('Failed to parse taskResult:', error);
    return null;
  }
}

function extractVideoUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  // check videos array first
  const videos = result.videos;
  if (videos && Array.isArray(videos)) {
    return videos
      .map((item: any) => {
        if (!item) return null;
        if (typeof item === 'string') return item;
        if (typeof item === 'object') {
          return (
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl
          );
        }
        return null;
      })
      .filter(Boolean);
  }

  // check output
  const output = result.output ?? result.video ?? result.data;

  if (!output) {
    return [];
  }

  if (typeof output === 'string') {
    return [output];
  }

  if (Array.isArray(output)) {
    return output
      .flatMap((item) => {
        if (!item) return [];
        if (typeof item === 'string') return [item];
        if (typeof item === 'object') {
          const candidate =
            item.url ?? item.uri ?? item.video ?? item.src ?? item.videoUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.video ?? output.src ?? output.videoUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function VideoGenerator({
  maxSizeMB = 50,
  srOnlyTitle,
}: VideoGeneratorProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('ai.video.generator');

  const [activeTab, setActiveTab] =
    useState<VideoGeneratorTab>('text-to-video');

  const [costCredits, setCostCredits] = useState<number>(textToVideoCredits);
  const [provider, setProvider] = useState(PROVIDER_OPTIONS[0]?.value ?? '');
  const [model, setModel] = useState(MODEL_OPTIONS[0]?.value ?? '');
  const [prompt, setPrompt] = useState('');
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [referenceVideoUrl, setReferenceVideoUrl] = useState<string>('');
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingVideoId, setDownloadingVideoId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const hasLoadedCreditsRef = useRef(false);
  const [showShortPromptDialog, setShowShortPromptDialog] = useState(false);
  const pendingGenerateRef = useRef(false);
  const [violationMessage, setViolationMessage] = useState<string | null>(null);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Track user ID to reset credits loading flag when user changes
  const userIdRef = useRef<string | null>(null);

  useEffect(() => {
    // Reset flag when user changes
    if (user?.id !== userIdRef.current) {
      userIdRef.current = user?.id || null;
      hasLoadedCreditsRef.current = false;
    }

    // Only fetch credits once per user session
    if (user && !user.credits && !hasLoadedCreditsRef.current) {
      hasLoadedCreditsRef.current = true;
      setIsLoadingCredits(true);
      fetchUserCredits().finally(() => {
        setIsLoadingCredits(false);
      });
    }
  }, [user?.id, user?.credits, fetchUserCredits]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToVideoMode = activeTab === 'text-to-video';
  const isImageToVideoMode = activeTab === 'image-to-video';
  const isVideoToVideoMode = activeTab === 'video-to-video';

  const handleTabChange = (value: string) => {
    const tab = value as VideoGeneratorTab;
    setActiveTab(tab);

    const availableModels = MODEL_OPTIONS.filter(
      (option) => option.scenes.includes(tab) && option.provider === provider
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].value);
    } else {
      setModel('');
    }

    if (tab === 'text-to-video') {
      setCostCredits(textToVideoCredits);
    } else if (tab === 'image-to-video') {
      setCostCredits(imageToVideoCredits);
    } else if (tab === 'video-to-video') {
      setCostCredits(videoToVideoCredits);
    }
  };

  const handleProviderChange = (value: string) => {
    setProvider(value);

    const availableModels = MODEL_OPTIONS.filter(
      (option) => option.scenes.includes(activeTab) && option.provider === value
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].value);
    } else {
      setModel('');
    }
  };

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your video...';
      case AITaskStatus.SUCCESS:
        return 'Video generation completed';
      case AITaskStatus.FAILED:
        return 'Generation failed';
      default:
        return '';
    }
  }, [taskStatus]);

  const handleReferenceImagesChange = useCallback(
    (items: ImageUploaderValue[]) => {
      setReferenceImageItems(items);
      const uploadedUrls = items
        .filter((item) => item.status === 'uploaded' && item.url)
        .map((item) => item.url as string);
      setReferenceImageUrls(uploadedUrls);
    },
    []
  );

  const isReferenceUploading = useMemo(
    () => referenceImageItems.some((item) => item.status === 'uploading'),
    [referenceImageItems]
  );

  const hasReferenceUploadError = useMemo(
    () => referenceImageItems.some((item) => item.status === 'error'),
    [referenceImageItems]
  );

  const resetTaskState = useCallback(() => {
    setIsGenerating(false);
    setProgress(0);
    setTaskId(null);
    setGenerationStartTime(null);
    setTaskStatus(null);
  }, []);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Video generation timed out. Please try again.');
          return true;
        }

        const resp = await fetch('/api/ai/query', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ taskId: id }),
        });

        if (!resp.ok) {
          throw new Error(`request failed with status: ${resp.status}`);
        }

        const { code, message, data } = await resp.json();
        if (code !== 0) {
          throw new Error(message || 'Query task failed');
        }

        const task = data as BackendTask;
        const currentStatus = task.status as AITaskStatus;
        setTaskStatus(currentStatus);

        const parsedResult = parseTaskResult(task.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (videoUrls.length > 0) {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 5, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (videoUrls.length === 0) {
            toast.error('The provider returned no videos. Please retry.');
          } else {
            setGeneratedVideos(
              videoUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            toast.success('Video generated successfully');
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate video failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 3, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling video task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [generationStartTime, resetTaskState]
  );

  useEffect(() => {
    if (!taskId || !isGenerating) {
      return;
    }

    let cancelled = false;

    const tick = async () => {
      if (!taskId) {
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        cancelled = true;
      }
    };

    tick();

    const interval = setInterval(async () => {
      if (cancelled || !taskId) {
        clearInterval(interval);
        return;
      }
      const completed = await pollTaskStatus(taskId);
      if (completed) {
        clearInterval(interval);
      }
    }, POLL_INTERVAL);

    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [taskId, isGenerating, pollTaskStatus]);

  const handleGenerate = async () => {
    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt && isTextToVideoMode) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (trimmedPrompt.length < 10 && isTextToVideoMode && !pendingGenerateRef.current) {
      setShowShortPromptDialog(true);
      return;
    }
    pendingGenerateRef.current = false;

    if (!provider || !model) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (isImageToVideoMode && referenceImageUrls.length === 0) {
      toast.error('Please upload a reference image before generating.');
      return;
    }

    if (isVideoToVideoMode && !referenceVideoUrl) {
      toast.error('Please provide a reference video URL before generating.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedVideos([]);
    setGenerationStartTime(Date.now());

    try {
      const options: any = {};

      if (isImageToVideoMode) {
        options.image_input = referenceImageUrls;
      }

      if (isVideoToVideoMode) {
        options.video_input = [referenceVideoUrl];
      }

      const isDebugMock = 
        (typeof window !== 'undefined' && window.localStorage.getItem('debug_mock') === '1') || 
        (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === '1');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (isDebugMock) {
        headers['x-debug-mock'] = 'true';
      }

      const resp = await fetch('/api/ai/generate', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mediaType: AIMediaType.VIDEO,
          scene: activeTab,
          provider,
          model,
          prompt: trimmedPrompt,
          options,
        }),
      });

      if (!resp.ok) {
        throw new Error(`request failed with status: ${resp.status}`);
      }

      const { code, message, data } = await resp.json();
      if (code !== 0) {
        throw new Error(message || 'Failed to create a video task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const videoUrls = extractVideoUrls(parsedResult);

        if (videoUrls.length > 0) {
          setGeneratedVideos(
            videoUrls.map((url, index) => ({
              id: `${newTaskId}-${index}`,
              url,
              provider,
              model,
              prompt: trimmedPrompt,
            }))
          );
          toast.success('Video generated successfully');
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate video:', error);
      if (error.message?.includes('Content violates') || error.message?.includes('content_violation') || error.message?.includes('suspended')) {
        setViolationMessage(error.message);
      } else {
        toast.error(`Failed to generate video: ${error.message}`);
      }
      resetTaskState();
    }
  };

  const handleDownloadVideo = async (video: GeneratedVideo) => {
    if (!video.url) {
      return;
    }

    try {
      setDownloadingVideoId(video.id);
      // fetch video via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(video.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch video');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${video.id}.mp4`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Video downloaded');
    } catch (error) {
      console.error('Failed to download video:', error);
      toast.error('Failed to download video');
    } finally {
      setDownloadingVideoId(null);
    }
  };

  return (
    <>
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-6xl px-4 md:px-0">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr] items-stretch">
            {/* Control Panel */}
            <div className="h-full space-y-6 backdrop-blur-2xl bg-card bg-gradient-to-tr from-primary/5 via-transparent to-transparent border border-primary/10 rounded-3xl p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-zinc-900/50 dark:border-zinc-800/50 dark:shadow-2xl relative group">
              <div className="relative z-10 text-pretty">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center font-serif font-extrabold text-2xl text-foreground tracking-tight">
                    <Video className="mr-3 h-8 w-8 text-primary group-hover:rotate-12 transition-transform duration-500" />
                    {t('title')}
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="space-y-4">
                    <div className="flex items-center ml-1">
                      <Sparkles className="h-4 w-4 text-primary/60 mr-2" />
                      <Label className="text-foreground/80 text-sm font-bold uppercase tracking-widest">{t('tabs.title') || 'Mode'}</Label>
                    </div>
                    <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                      <TabsList className="bg-muted/50 dark:bg-black/40 p-1.5 rounded-2xl border border-border/10 w-full h-auto grid grid-cols-3 gap-1">
                        <TabsTrigger value="text-to-video" className="rounded-xl py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                          {t('tabs.text-to-video')}
                        </TabsTrigger>
                        <TabsTrigger value="image-to-video" className="rounded-xl py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                          {t('tabs.image-to-video')}
                        </TabsTrigger>
                        <TabsTrigger value="video-to-video" className="rounded-xl py-3 px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-lg transition-all duration-300">
                          {t('tabs.video-to-video')}
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 group/select">
                      <Label className="text-foreground/80 text-xs font-bold ml-1 uppercase tracking-widest">{t('form.provider')}</Label>
                      <Select
                        value={provider}
                        onValueChange={handleProviderChange}
                      >
                        <SelectTrigger className="w-full bg-muted/30 dark:bg-black/40 rounded-xl border-border/10 hover:border-primary/30 transition-all py-6">
                          <SelectValue placeholder={t('form.select_provider')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/10 shadow-2xl backdrop-blur-xl">
                          {PROVIDER_OPTIONS.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-primary/10">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 group/select">
                      <Label className="text-foreground/80 text-xs font-bold ml-1 uppercase tracking-widest">{t('form.model')}</Label>
                      <Select value={model} onValueChange={setModel}>
                        <SelectTrigger className="w-full bg-muted/30 dark:bg-black/40 rounded-xl border-border/10 hover:border-primary/30 transition-all py-6">
                          <SelectValue placeholder={t('form.select_model')} />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border/10 shadow-2xl backdrop-blur-xl">
                          {MODEL_OPTIONS.filter(
                            (option) =>
                              option.scenes.includes(activeTab) &&
                              option.provider === provider
                          ).map((option) => (
                            <SelectItem key={option.value} value={option.value} className="rounded-lg focus:bg-primary/10">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {isImageToVideoMode && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center ml-1">
                        <Label className="text-foreground/80 text-sm font-bold uppercase tracking-widest">{t('form.reference_image')}</Label>
                      </div>
                      <ImageUploader
                        allowMultiple={true}
                        maxImages={3}
                        maxSizeMB={maxSizeMB}
                        onChange={handleReferenceImagesChange}
                        emptyHint={t('form.reference_image_placeholder')}
                        locale={locale}
                        className="transition-all"
                      />

                      {hasReferenceUploadError && (
                        <p className="text-destructive text-[10px] font-bold ml-1 uppercase">
                          {t('form.some_images_failed_to_upload')}
                        </p>
                      )}
                    </div>
                  )}

                  {isVideoToVideoMode && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      <Label htmlFor="video-url" className="text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">
                        {t('form.reference_video')}
                      </Label>
                      <Textarea
                        id="video-url"
                        value={referenceVideoUrl}
                        onChange={(e) => setReferenceVideoUrl(e.target.value)}
                        placeholder={t('form.reference_video_placeholder')}
                        className="bg-muted/30 dark:bg-black/40 rounded-2xl border-border/10 hover:border-primary/30 min-h-20 focus-visible:ring-1 focus-visible:ring-primary shadow-inner transition-all"
                      />
                    </div>
                  )}

                  <div className="space-y-3 group">
                    <Label htmlFor="video-prompt" className="text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">{t('form.prompt')}</Label>
                    <div className="relative">
                      <Textarea
                        id="video-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('form.prompt_placeholder')}
                        className="bg-muted/30 dark:bg-black/40 w-full rounded-2xl px-6 py-5 border border-border/10 dark:border-zinc-800 text-foreground placeholder:text-muted-foreground/50 resize-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner min-h-[160px] text-base leading-relaxed transition-all duration-300 group-hover:border-primary/30 group-hover:bg-muted/40"
                      />
                      <div className="absolute bottom-4 right-5 text-[10px] font-bold tracking-widest text-muted-foreground/40 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                        {promptLength} / {MAX_PROMPT_LENGTH}
                      </div>
                    </div>
                    {isPromptTooLong && (
                      <p className="text-destructive text-[10px] font-bold ml-1 uppercase">
                        {t('form.prompt_too_long')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="pt-8">
                  <div className="pt-2">
                    {!isMounted ? (
                      <Button className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl" disabled size="lg">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('loading')}
                      </Button>
                    ) : isCheckSign ? (
                      <Button className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl" disabled size="lg">
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        {t('checking_account')}
                      </Button>
                    ) : user ? (
                      <Button
                        size="lg"
                        className={cn(
                          "w-full rounded-2xl h-14 text-lg font-bold transition-all duration-300 shadow-xl relative overflow-hidden group/btn",
                          isGenerating ? "opacity-90" : "hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/25"
                        )}
                        onClick={handleGenerate}
                        disabled={
                          isGenerating ||
                          isLoadingCredits ||
                          (isTextToVideoMode && !prompt.trim()) ||
                          isPromptTooLong ||
                          isReferenceUploading ||
                          hasReferenceUploadError ||
                          (isImageToVideoMode && referenceImageUrls.length === 0) ||
                          (isVideoToVideoMode && !referenceVideoUrl) ||
                          (!isLoadingCredits && remainingCredits < costCredits)
                        }
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-400 to-primary bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative z-10 flex items-center justify-center">
                          {isGenerating ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              {t('generating')}
                            </>
                          ) : (
                            <>
                              <Sparkles className="mr-2 h-5 w-5 transition-transform group-hover/btn:rotate-12" />
                              {t('generate')}
                            </>
                          )}
                        </div>
                      </Button>
                    ) : (
                      <Button
                        size="lg"
                        className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl hover:scale-[1.02] transition-transform"
                        onClick={() => setIsShowSignModal(true)}
                      >
                        <User className="mr-2 h-5 w-5" />
                        {t('sign_in_to_generate')}
                      </Button>
                    )}
                  </div>

                  <div className="mt-6">
                    {!isMounted || isLoadingCredits || (user && user.credits === undefined) ? (
                      <div className="flex items-center justify-between text-sm px-1 leading-none">
                        <span className="text-primary font-bold">
                          {t('credits_cost', { credits: costCredits })}
                        </span>
                        <span className="flex items-center gap-2 text-muted-foreground/60 italic font-medium">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {t('loading')}
                        </span>
                      </div>
                    ) : user ? (
                      <div className="flex items-center justify-between text-sm px-1 leading-none font-medium">
                        <span className="text-primary font-bold">
                          {t('credits_cost', { credits: costCredits })}
                        </span>
                        <div className="flex items-center gap-2">
                           <span className={cn(
                            "transition-colors duration-300",
                            remainingCredits < costCredits ? "text-destructive font-bold" : "text-muted-foreground"
                          )}>
                            {t('credits_remaining', { credits: remainingCredits })}
                          </span>
                          {remainingCredits < costCredits && (
                            <Link href="/settings/credits" className="text-primary hover:underline font-bold animate-pulse">
                              {t('buy_credits')}
                            </Link>
                          )}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                {isGenerating && (
                  <div className="mt-8 space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center justify-between text-sm font-bold tracking-widest uppercase text-primary/60">
                      <span>{t('progress')}</span>
                      <span className="bg-primary/10 px-2 py-0.5 rounded-full">{progress}%</span>
                    </div>
                    <div className="h-3 bg-muted/50 rounded-full overflow-hidden border border-border/10 p-0.5">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(var(--primary),0.5)]" 
                        style={{ width: `${progress}%` }} 
                      />
                    </div>
                    {taskStatusLabel && (
                      <p className="text-muted-foreground text-center text-[10px] font-bold uppercase tracking-tighter animate-pulse">
                        {taskStatusLabel}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Result Panel */}
            <div className="h-full space-y-6 backdrop-blur-2xl bg-card/30 border border-primary/10 rounded-3xl p-8 shadow-2xl relative flex flex-col min-h-[600px] group transition-all duration-500 overflow-hidden">
               {/* Animated subtle background for result panel */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-30 pointer-events-none" />
              
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center font-serif font-extrabold text-2xl text-foreground tracking-tight">
                    <div className="bg-primary/10 p-2 rounded-xl mr-3">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    {t('generated_videos')}
                  </div>
                </div>

                <div className="flex-1 flex flex-col">
                  {generatedVideos.length > 0 ? (
                    <div className="space-y-8">
                      {generatedVideos.map((video) => (
                        <div key={video.id} className="space-y-4 group/video relative">
                          <div className="relative overflow-hidden rounded-2xl border-2 border-border/10 shadow-2xl transition-all duration-500 hover:scale-[1.01] bg-black">
                            <video
                              src={video.url}
                              controls
                              className="h-auto w-full max-h-[500px] object-contain shadow-2xl"
                              preload="metadata"
                            />

                            <div className="absolute top-4 right-4 z-20">
                              <Button
                                size="lg"
                                variant="default"
                                className="backdrop-blur-md bg-white/90 text-black hover:bg-white rounded-xl font-bold shadow-2xl transition-all hover:scale-105"
                                onClick={() => handleDownloadVideo(video)}
                                disabled={downloadingVideoId === video.id}
                              >
                                {downloadingVideoId === video.id ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {t('loading')}
                                  </>
                                ) : (
                                  <>
                                    <Download className="mr-2 h-4 w-4" />
                                    {t('download')}
                                  </>
                                )}
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[450px] p-10 text-center border-2 border-dashed border-primary/20 rounded-3xl bg-muted/20 dark:bg-zinc-900/30 gap-8">
                      <div className="bg-primary/10 p-6 rounded-full relative">
                        <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                        <Video className="h-10 w-10 text-primary relative z-10 opacity-70" />
                      </div>
                      <div className="space-y-3">
                        <p className="text-foreground text-xl font-serif font-bold tracking-tight italic">
                          {isGenerating ? t('ready_for_generating') : t('no_videos_generated')}
                        </p>
                        <p className="text-muted-foreground text-sm max-w-[200px] mx-auto opacity-70">
                          {isGenerating ? 'AI is processing your request...' : 'Your creations will appear here.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <Dialog open={showShortPromptDialog} onOpenChange={setShowShortPromptDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Prompt is very short</DialogTitle>
          <DialogDescription>
            Your prompt is less than 10 characters. A short prompt may result in unexpected output. Do you want to continue?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setShowShortPromptDialog(false)}>Cancel</Button>
          <Button onClick={() => { pendingGenerateRef.current = true; setShowShortPromptDialog(false); handleGenerate(); }}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

    <Dialog open={!!violationMessage} onOpenChange={() => setViolationMessage(null)}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Content Policy Violation</DialogTitle>
          <DialogDescription>
            {violationMessage}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button onClick={() => setViolationMessage(null)}>OK</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
}
