'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { useParams } from 'next/navigation';
import {
  CreditCard,
  Download,
  ImageIcon,
  Wand,
  Loader2,
  Sparkles,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

import { Link } from '@/core/i18n/navigation';
import { AIMediaType, AITaskStatus } from '@/extensions/ai/types';
import {
  ImageUploader,
  ImageUploaderValue,
  LazyImage,
} from '@/shared/blocks/common';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Progress } from '@/shared/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';
import { cn } from '@/shared/lib/utils';
import { envConfigs } from '@/config';
import { getImageModelFrontendOptions, calculateImageCredits } from '@/config/model-config';

interface ImageGeneratorProps {
  allowMultipleImages?: boolean;
  maxImages?: number;
  maxSizeMB?: number;
  srOnlyTitle?: string;
  className?: string;
  promptKey?: string;
}

interface GeneratedImage {
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

type ImageGeneratorTab = 'text-to-image' | 'image-to-image';

const POLL_INTERVAL = 5000;
const GENERATION_TIMEOUT = 180000;
const MAX_PROMPT_LENGTH = 2000;

const MODEL_OPTIONS = getImageModelFrontendOptions();

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

function extractImageUrls(result: any): string[] {
  if (!result) {
    return [];
  }

  const output = result.output ?? result.images ?? result.data;

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
            item.url ?? item.uri ?? item.image ?? item.src ?? item.imageUrl;
          return typeof candidate === 'string' ? [candidate] : [];
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof output === 'object') {
    const candidate =
      output.url ?? output.uri ?? output.image ?? output.src ?? output.imageUrl;
    if (typeof candidate === 'string') {
      return [candidate];
    }
  }

  return [];
}

export function ImageGenerator({
  allowMultipleImages = true,
  maxImages = 9,
  maxSizeMB = 5,
  srOnlyTitle,
  className,
  promptKey,
}: ImageGeneratorProps) {
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const t = useTranslations('ai.image.generator');

  const [activeTab, setActiveTab] =
    useState<ImageGeneratorTab>('text-to-image');

  const [costCredits, setCostCredits] = useState<number>(5);
  const [provider] = useState('kie');
  const [model, setModel] = useState(MODEL_OPTIONS[0]?.value ?? '');
  // Set default values only when no promptKey is provided
  const [prompt, setPrompt] = useState(
    promptKey || envConfigs.default_image_prompt
  );
  const [previewImage, setPreviewImage] = useState<string>(
    promptKey 
      ? '' 
      : envConfigs.default_image_preview
  );
  const [referenceImageItems, setReferenceImageItems] = useState<
    ImageUploaderValue[]
  >([]);
  const [referenceImageUrls, setReferenceImageUrls] = useState<string[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [generationStartTime, setGenerationStartTime] = useState<number | null>(
    null
  );
  const [taskStatus, setTaskStatus] = useState<AITaskStatus | null>(null);
  const [downloadingImageId, setDownloadingImageId] = useState<string | null>(
    null
  );
  const [isMounted, setIsMounted] = useState(false);
  const [showInGallery, setShowInGallery] = useState(false);
  const savedTaskIdsRef = useRef<Set<string>>(new Set());
  const [isLoadingCredits, setIsLoadingCredits] = useState(false);
  const [availableProviders, setAvailableProviders] = useState<string[]>([]);
  const [isLoadingProviders, setIsLoadingProviders] = useState(true);
  const hasLoadedCreditsRef = useRef(false);
  const [isPreviewImageLoaded, setIsPreviewImageLoaded] = useState(false);
  const [showShortPromptDialog, setShowShortPromptDialog] = useState(false);
  const pendingGenerateRef = useRef(false);
  const [violationMessage, setViolationMessage] = useState<string | null>(null);

  useEffect(() => {
    setIsPreviewImageLoaded(false);
  }, [previewImage]);

  const { user, isCheckSign, setIsShowSignModal, fetchUserCredits } =
    useAppContext();

  useEffect(() => {
    setIsMounted(true);

    // Fetch available AI providers
    fetch('/api/ai/providers')
      .then((res) => res.json())
      .then((data) => {
        if (data.code === 0 && data.data?.providers !== undefined) {
          const providers = data.data.providers || [];
          console.log('Available AI providers:', providers);
          setAvailableProviders(providers);

          if (providers.includes('kie')) {
            // Set default model for text-to-image
            const defaultModel = MODEL_OPTIONS.find(
              (option) => option.scenes.includes('text-to-image')
            );
            if (defaultModel) {
              setModel(defaultModel.value);
            }
          } else {
            console.log('Kie provider not configured');
            setModel('');
          }
        }
      })
      .catch((error) => {
        console.error('Failed to fetch AI providers:', error);
        setAvailableProviders([]);
      })
      .finally(() => {
        setIsLoadingProviders(false);
      });
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

  useEffect(() => {
    if (promptKey) {
      fetch(`/api/prompts/by-title?title=${encodeURIComponent(promptKey)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data) {
            if (data.data.promptDescription) {
              setPrompt(data.data.promptDescription);
            }
            if (data.data.image) {
              setPreviewImage(data.data.image);
            }
            // When promptKey is provided, switch to image-to-image tab
            setActiveTab('image-to-image');

            // Find default model for image-to-image
            const i2iModel = MODEL_OPTIONS.find(
              (option) =>
                option.scenes.includes('image-to-image') &&
                availableProviders.includes('kie')
            );
            if (i2iModel) {
              setModel(i2iModel.value);
            }
          }
        })
        .catch((error) => {
          console.error('Failed to fetch prompt:', error);
          // If fetch fails (not found), keep promptKey as is (it might be a direct prompt text)
        });
    } else {
      // Reset to default values ONLY if promptKey is undefined (not just empty string)
      // Checks for empty string case inside the hook
    }
    
    // Original reset logic moved inside a check
    if (!promptKey) {
       // Reset to default values when no promptKey is provided
      setPrompt(envConfigs.default_image_prompt);
      setPreviewImage(envConfigs.default_image_preview);
      setActiveTab('text-to-image');

      // Reset to default model for text-to-image
      if (availableProviders.includes('kie')) {
        const defaultModel = MODEL_OPTIONS.find(
          (option) => option.scenes.includes('text-to-image')
        );
        if (defaultModel) {
          setModel(defaultModel.value);
        }
      }
    }
  }, [promptKey, availableProviders]);

  const promptLength = prompt.trim().length;
  const remainingCredits = user?.credits?.remainingCredits ?? 0;
  const isPromptTooLong = promptLength > MAX_PROMPT_LENGTH;
  const isTextToImageMode = activeTab === 'text-to-image';

  const handleTabChange = (value: string) => {
    const tab = value as ImageGeneratorTab;
    setActiveTab(tab);

    const availableModels = MODEL_OPTIONS.filter(
      (option) => option.scenes.includes(tab)
    );

    if (availableModels.length > 0) {
      setModel(availableModels[0].value);
    } else {
      setModel('');
    }
  };

  // Update credits when model changes
  useEffect(() => {
    const modelOption = MODEL_OPTIONS.find((o) => o.value === model);
    if (!modelOption) { setCostCredits(5); return; }

    const scene = activeTab === 'image-to-image' ? 'image-to-image' : 'text-to-image';
    setCostCredits(calculateImageCredits(model, scene));
  }, [model, activeTab]);

  const taskStatusLabel = useMemo(() => {
    if (!taskStatus) {
      return '';
    }

    switch (taskStatus) {
      case AITaskStatus.PENDING:
        return 'Waiting for the model to start';
      case AITaskStatus.PROCESSING:
        return 'Generating your image...';
      case AITaskStatus.SUCCESS:
        return 'Image generation completed';
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
    // Don't clear savedTaskIds here - keep it to prevent duplicates across generations
  }, []);

  const saveShowcase = useCallback(async (imageUrl: string, taskIdForTracking: string) => {
    // Prevent duplicate saves for the same task
    if (savedTaskIdsRef.current.has(taskIdForTracking)) {
      console.log('Already saved, skipping:', taskIdForTracking);
      return;
    }

    // Mark as saved immediately to prevent race conditions
    savedTaskIdsRef.current.add(taskIdForTracking);
    console.log('Saving showcase for task:', taskIdForTracking);

    try {
      const compressImageFile = async (imageUrl: string): Promise<string> => {
        console.log('Fetching image from proxy...');
        const response = await fetch(`/api/proxy/file?url=${encodeURIComponent(imageUrl)}`);
        if (!response.ok) throw new Error('Failed to fetch image');
        
        const blob = await response.blob();
        const file = new File([blob], 'showcase.jpg', { type: blob.type });

        // Use shared compressImage function
        const { compressImage } = await import('@/shared/blocks/common');
        const compressedFile = await compressImage(file);

        return new Promise((resolve, reject) => {
           const formData = new FormData();
           formData.append('file', compressedFile);

           console.log('Uploading compressed image...');
           fetch('/api/upload', {
             method: 'POST',
             body: formData,
           })
           .then(res => {
             if (!res.ok) throw new Error('Upload failed');
             return res.json();
           })
           .then(result => {
             if (!result.success || !result.url) {
               throw new Error(result.error || 'Upload failed');
             }
             console.log('Upload successful:', result.url);
             resolve(result.url);
           })
           .catch(reject);
        });
      };

      const compressedImageUrl = await compressImageFile(imageUrl);

      // Always save to showcase, with showInGallery flag
      console.log('Adding showcase to database...');
      await fetch('/api/showcases/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: prompt.trim().substring(0, 100),
          prompt: prompt.trim(),
          image: compressedImageUrl,
          tags: promptKey || null,
          showInGallery: showInGallery ? 1 : 0,
        }),
      });
      console.log('Showcase saved successfully');
    } catch (error) {
      console.error('Failed to save showcase:', error);
      // Remove from saved set if failed
      savedTaskIdsRef.current.delete(taskIdForTracking);
    }
  }, [prompt, promptKey, showInGallery]);

  const pollTaskStatus = useCallback(
    async (id: string) => {
      try {
        // Check if already saved to prevent duplicate processing
        if (savedTaskIdsRef.current.has(id)) {
          console.log('Task already processed, stopping poll:', id);
          return true;
        }

        if (
          generationStartTime &&
          Date.now() - generationStartTime > GENERATION_TIMEOUT
        ) {
          resetTaskState();
          toast.error('Image generation timed out. Please try again.');
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
        const imageUrls = extractImageUrls(parsedResult);

        if (currentStatus === AITaskStatus.PENDING) {
          setProgress((prev) => Math.max(prev, 20));
          return false;
        }

        if (currentStatus === AITaskStatus.PROCESSING) {
          if (imageUrls.length > 0) {
            setGeneratedImages(
              imageUrls.map((url, index) => ({
                id: `${task.id}-${index}`,
                url,
                provider: task.provider,
                model: task.model,
                prompt: task.prompt ?? undefined,
              }))
            );
            setProgress((prev) => Math.max(prev, 85));
          } else {
            setProgress((prev) => Math.min(prev + 10, 80));
          }
          return false;
        }

        if (currentStatus === AITaskStatus.SUCCESS) {
          if (imageUrls.length === 0) {
            toast.error('The provider returned no images. Please retry.');
          } else {
            const images = imageUrls.map((url, index) => ({
              id: `${task.id}-${index}`,
              url,
              provider: task.provider,
              model: task.model,
              prompt: task.prompt ?? undefined,
            }));
            setGeneratedImages(images);

            // Save showcase only once - check before saving
            if (images.length > 0 && !savedTaskIdsRef.current.has(task.id)) {
              await saveShowcase(images[0].url, task.id);
              toast.success('Image generated successfully');
            }
          }

          setProgress(100);
          resetTaskState();
          return true;
        }

        if (currentStatus === AITaskStatus.FAILED) {
          const errorMessage =
            parsedResult?.errorMessage || 'Generate image failed';
          toast.error(errorMessage);
          resetTaskState();

          fetchUserCredits();

          return true;
        }

        setProgress((prev) => Math.min(prev + 5, 95));
        return false;
      } catch (error: any) {
        console.error('Error polling image task:', error);
        toast.error(`Query task failed: ${error.message}`);
        resetTaskState();

        fetchUserCredits();

        return true;
      }
    },
    [generationStartTime, resetTaskState, fetchUserCredits, saveShowcase]
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
    console.log('=== Generate Debug Info ===');
    console.log('availableProviders:', availableProviders);
    console.log('current provider:', provider);
    console.log('current model:', model);
    console.log('remainingCredits:', remainingCredits);
    console.log('costCredits:', costCredits);
    
    // Check AI providers FIRST - highest priority
    if (availableProviders.length === 0) {
      console.log('No AI providers configured - showing error');
      toast.error('Please contact the administrator to configure AI models.');
      return;
    }

    // Check if current provider is in available providers
    if (!availableProviders.includes(provider)) {
      console.log('Current provider not in available providers - showing error');
      toast.error('Please contact the administrator to configure AI models.');
      return;
    }

    if (!user) {
      setIsShowSignModal(true);
      return;
    }

    if (remainingCredits < costCredits) {
      toast.error('Insufficient credits. Please top up to keep creating.');
      return;
    }

    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      toast.error('Please enter a prompt before generating.');
      return;
    }

    if (trimmedPrompt.length < 10 && !pendingGenerateRef.current) {
      setShowShortPromptDialog(true);
      return;
    }
    pendingGenerateRef.current = false;

    if (!provider || !model) {
      toast.error('Provider or model is not configured correctly.');
      return;
    }

    if (!isTextToImageMode && referenceImageUrls.length === 0) {
      toast.error('Please upload reference images before generating.');
      return;
    }

    // nano-banana-edit requires reference images
    if (model === 'google/nano-banana-edit' && referenceImageUrls.length === 0) {
      toast.error('Nano Banana Edit requires a reference image.');
      return;
    }

    setIsGenerating(true);
    setProgress(15);
    setTaskStatus(AITaskStatus.PENDING);
    setGeneratedImages([]);
    setGenerationStartTime(Date.now());

    try {
      const options: any = {};
      const modelOption = MODEL_OPTIONS.find((o) => o.value === model);

      if (modelOption?.schema === 'gpt2-t2i') {
        // GPT Image 2 text-to-image: aspect_ratio only
        options.aspect_ratio = 'auto';
      } else if (modelOption?.schema === 'gpt2-i2i') {
        // GPT Image 2 image-to-image: input_urls + aspect_ratio
        if (!isTextToImageMode) {
          options.input_urls = referenceImageUrls;
        }
        options.aspect_ratio = 'auto';
      } else if (modelOption?.schema === 'v1') {
        // nano-banana / nano-banana-edit use image_urls + image_size
        if (!isTextToImageMode) {
          options.image_urls = referenceImageUrls;
        }
        options.image_size = '1:1';
      } else {
        // nano-banana-2 / nano-banana-pro use image_input + aspect_ratio + resolution
        if (!isTextToImageMode) {
          options.image_input = referenceImageUrls;
        } else {
          options.image_input = [];
        }
        options.aspect_ratio = 'auto';
        options.resolution = '1K';
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
          mediaType: AIMediaType.IMAGE,
          scene: isTextToImageMode ? 'text-to-image' : 'image-to-image',
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
        throw new Error(message || 'Failed to create an image task');
      }

      const newTaskId = data?.id;
      if (!newTaskId) {
        throw new Error('Task id missing in response');
      }

      if (data.status === AITaskStatus.SUCCESS && data.taskInfo) {
        const parsedResult = parseTaskResult(data.taskInfo);
        const imageUrls = extractImageUrls(parsedResult);

        if (imageUrls.length > 0) {
          const images = imageUrls.map((url, index) => ({
            id: `${newTaskId}-${index}`,
            url,
            provider,
            model,
            prompt: trimmedPrompt,
          }));
          setGeneratedImages(images);
          setProgress(100);
          resetTaskState();
          await fetchUserCredits();
          
          // Save showcase - this handles immediate success case
          if (images.length > 0 && !savedTaskIdsRef.current.has(newTaskId)) {
            await saveShowcase(images[0].url, newTaskId);
            toast.success('Image generated successfully');
          }
          return;
        }
      }

      setTaskId(newTaskId);
      setProgress(25);

      await fetchUserCredits();
    } catch (error: any) {
      console.error('Failed to generate image:', error);
      if (error.message?.includes('Content violates') || error.message?.includes('content_violation') || error.message?.includes('suspended')) {
        setViolationMessage(error.message);
      } else {
        toast.error(`Failed to generate image: ${error.message}`);
      }
      resetTaskState();
    }
  };

  const handleDownloadImage = async (image: GeneratedImage) => {
    if (!image.url) {
      return;
    }

    try {
      setDownloadingImageId(image.id);
      // fetch image via proxy
      const resp = await fetch(
        `/api/proxy/file?url=${encodeURIComponent(image.url)}`
      );
      if (!resp.ok) {
        throw new Error('Failed to fetch image');
      }

      const blob = await resp.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${image.id}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(blobUrl), 200);
      toast.success('Image downloaded');
    } catch (error) {
      console.error('Failed to download image:', error);
      toast.error('Failed to download image');
    } finally {
      setDownloadingImageId(null);
    }
  };

  return (
    <>
    <section className={cn('pt-4 md:pt-6 pb-16 md:pb-24 relative overflow-hidden', className)}>
      {/* Premium Background Elements */}
      <div className="absolute inset-0 pointer-events-none -z-10 h-full w-full">
        <div className="absolute inset-x-0 top-0 h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent" />
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] opacity-50" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <div className="container relative z-10">
        <div className="mx-auto max-w-6xl">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[420px_1fr]">
            {/* Control Panel */}
            <div className="h-full space-y-6 backdrop-blur-2xl bg-card bg-gradient-to-tr from-primary/5 via-transparent to-transparent border border-primary/10 rounded-3xl p-7 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-zinc-900/50 dark:border-zinc-800/50 dark:shadow-2xl relative group">
              <div className="relative z-10 text-pretty">
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center font-serif font-extrabold text-2xl text-foreground tracking-tight">
                    <div className="bg-primary/20 p-2 rounded-xl mr-3 shadow-inner">
                      <Sparkles className="w-5 h-5 text-primary" />
                    </div>
                    {t('title')}
                  </div>
                </div>

                <div className="space-y-8">
                  <Tabs value={activeTab} onValueChange={handleTabChange}>
                    <TabsList className="bg-muted/50 grid w-full grid-cols-2 rounded-2xl h-12 p-1.5 border border-border/10">
                      <TabsTrigger 
                        value="text-to-image" 
                        className="rounded-xl text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg"
                      >
                        {t('tabs.text-to-image')}
                      </TabsTrigger>
                      <TabsTrigger 
                        value="image-to-image" 
                        className="rounded-xl text-sm font-medium transition-all data-[state=active]:bg-background data-[state=active]:text-primary data-[state=active]:shadow-lg"
                      >
                        {t('tabs.image-to-image')}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {/* Model Selection */}
                  <div className="space-y-3">
                    <Label className="text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">
                      {t('form.model')}
                    </Label>
                    <Select value={model} onValueChange={setModel}>
                      <SelectTrigger className="bg-muted/30 dark:bg-black/40 w-full rounded-2xl h-12 border border-border/10 dark:border-zinc-800 text-foreground">
                        <SelectValue placeholder={t('form.select_model')} />
                      </SelectTrigger>
                      <SelectContent>
                        {MODEL_OPTIONS.filter((o) => o.scenes.includes(activeTab)).map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {!isTextToImageMode && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between ml-1">
                        <Label className="text-foreground/80 text-sm font-bold uppercase tracking-widest">
                          {t('form.reference_image')}
                        </Label>
                        <span className="text-primary text-[10px] font-bold bg-primary/10 px-2 py-0.5 rounded-full">
                          {referenceImageUrls.length} / {maxImages}
                        </span>
                      </div>
                      <ImageUploader
                        allowMultiple={allowMultipleImages}
                        maxImages={allowMultipleImages ? maxImages : 1}
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

                  <div className="space-y-3 group">
                    <Label htmlFor="image-prompt" className="text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">{t('form.prompt')}</Label>
                    <div className="relative">
                      <Textarea
                        id="image-prompt"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder={t('form.prompt_placeholder')}
                        className={cn(
                          'bg-muted/30 dark:bg-black/40 w-full rounded-2xl px-6 py-5 border border-border/10 dark:border-zinc-800 text-foreground placeholder:text-muted-foreground/50 resize-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner',
                          'min-h-[160px] text-base leading-relaxed transition-all duration-300 group-hover:border-primary/30 group-hover:bg-muted/40'
                        )}
                      />
                      <div className="absolute bottom-4 right-5 text-[10px] font-bold tracking-widest text-muted-foreground/40 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                        {promptLength} / {MAX_PROMPT_LENGTH}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between px-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <button
                        type="button"
                        role="switch"
                        aria-checked={showInGallery}
                        onClick={() => setShowInGallery(!showInGallery)}
                        className={cn(
                          'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                          showInGallery ? 'bg-primary' : 'bg-muted-foreground/30'
                        )}
                      >
                        <span
                          className={cn(
                            'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out',
                            showInGallery ? 'translate-x-4' : 'translate-x-0'
                          )}
                        />
                      </button>
                      <span className="text-xs font-medium text-muted-foreground">{t('show_in_gallery')}</span>
                    </label>
                  </div>

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
                        isLoadingProviders ||
                        !prompt.trim() ||
                        isPromptTooLong ||
                        isReferenceUploading ||
                        hasReferenceUploadError ||
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
                        ) : isLoadingProviders ? (
                          <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            {t('loading')}
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

                  <div className="space-y-4">
                  {!isMounted || isLoadingCredits || isLoadingProviders || (user && user.credits === undefined) ? (
                    <div className="flex items-center justify-between text-sm px-1">
                      <span className="text-primary font-bold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                      <span className="flex items-center gap-2 text-muted-foreground italic">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        {t('loading')}
                      </span>
                    </div>
                  ) : user ? (
                    <div className="flex items-center justify-between text-sm px-1">
                      <span className="text-primary font-bold flex items-center gap-2">
                        <CreditCard className="w-4 h-4" />
                        {t('credits_cost', { credits: costCredits })}
                      </span>
                      <div className="bg-muted px-3 py-1 rounded-full text-muted-foreground font-medium">
                        {t('credits_remaining', { credits: remainingCredits })}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm px-1">
                        <span className="text-primary font-bold flex items-center gap-2">
                          <CreditCard className="w-4 h-4" />
                          {t('credits_cost', { credits: costCredits })}
                        </span>
                        <div className="bg-muted px-3 py-1 rounded-full text-muted-foreground font-medium">
                          {t('credits_remaining', { credits: remainingCredits })}
                        </div>
                      </div>
                      <Link href="/pricing" className="block w-full">
                        <Button variant="outline" className="w-full rounded-2xl border-primary/20 hover:bg-primary/5 h-12" size="lg">
                          <CreditCard className="mr-2 h-4 w-4 text-primary fill-primary opacity-20" />
                          {t('buy_credits')}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {isGenerating && (
                    <div className="space-y-4 rounded-2xl border border-primary/20 p-5 bg-primary/5 animate-in zoom-in-95 duration-500">
                      <div className="flex items-center justify-between text-sm font-bold text-primary">
                        <span>{t('progress')}</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2 bg-primary/20" />
                      {taskStatusLabel && (
                        <p className="text-primary/70 text-center text-xs font-medium tracking-tight">
                          {taskStatusLabel}
                        </p>
                      )}
                    </div>
                  )}
                  </div>
                </div>
              </div>
            </div>

            {/* Preview Panel */}
            <div className="h-full space-y-6 backdrop-blur-3xl bg-card border border-border/10 rounded-3xl p-7 shadow-2xl dark:bg-zinc-900/40 dark:border-zinc-800/50 flex flex-col relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
              <div className="relative z-10 flex flex-col h-full">
                <div className="flex items-center font-serif font-extrabold text-2xl text-foreground mb-8">
                  <div className="bg-muted p-2 rounded-xl mr-3 shadow-inner">
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  </div>
                  {t('generated_images')}
                </div>
                
                <div className="flex-1 flex flex-col">
                  {generatedImages.length > 0 ? (
                    <div
                      className={cn(
                        'grid gap-8',
                        generatedImages.length === 1 ? 'grid-cols-1' : 'sm:grid-cols-2'
                      )}
                    >
                      {generatedImages.map((image) => (
                        <div key={image.id} className="space-y-4 group/img">
                          <div
                            className={cn(
                              'relative overflow-hidden rounded-3xl border border-border/10 shadow-2xl transition-all duration-500 hover:scale-[1.02] group-hover/img:shadow-primary/20',
                              generatedImages.length === 1 ? 'aspect-auto' : 'aspect-square'
                            )}
                          >
                            <LazyImage
                              src={image.url}
                              alt={image.prompt || 'Generated image'}
                              className="h-full w-full object-cover transition-transform duration-700 group-hover/img:scale-110"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-end p-6">
                              <Button
                                size="lg"
                                variant="default"
                                className="w-full backdrop-blur-md bg-white text-black hover:bg-white/90 rounded-xl font-bold shadow-xl"
                                onClick={() => handleDownloadImage(image)}
                                disabled={downloadingImageId === image.id}
                              >
                                {downloadingImageId === image.id ? (
                                  <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="h-5 w-5 mr-2" />
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
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-6 text-center border-2 border-dashed border-primary/20 rounded-3xl bg-muted/20 dark:bg-zinc-900/30 gap-6">
                      {isGenerating ? (
                        <div className="w-full max-w-[400px] aspect-square">
                          <Skeleton className="w-full h-full rounded-2xl shadow-2xl border-4 border-white dark:border-zinc-800" />
                        </div>
                      ) : previewImage ? (
                        <div className="relative group/preview w-full flex items-center justify-center">
                          <LazyImage 
                            src={previewImage} 
                            alt="Preview image"
                            className="rounded-2xl shadow-2xl border-4 border-white dark:border-zinc-800 max-w-full max-h-[400px] w-auto object-contain transition-transform duration-500 group-hover/preview:scale-[1.03]"
                          />
                          <div className="absolute -inset-4 bg-primary/10 blur-2xl rounded-full -z-10 opacity-0 group-hover/preview:opacity-100 transition-opacity duration-500" />
                        </div>
                      ) : (
                        <div className="bg-primary/10 p-6 rounded-full">
                          <ImageIcon className="h-10 w-10 text-primary opacity-50" />
                        </div>
                      )}
                      <div className="space-y-2">
                        <p className="text-foreground text-xl font-serif font-bold tracking-tight italic">
                          {isGenerating ? t('ready_to_generate') : t('no_images_generated')}
                        </p>
                        <p className="text-muted-foreground max-w-sm mx-auto text-sm leading-relaxed">
                          {isGenerating ? t('ready_to_generate_description') : t('form.prompt_placeholder')}
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
