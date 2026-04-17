'use client';

// import { WandSparkles } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { cn } from '@/shared/lib/utils';

import { useUrlParams } from '@/app/[locale]/(landing)/ai-video-generator/hooks/useUrlParams';
import { useVideoPolling } from '@/app/[locale]/(landing)/ai-video-generator/hooks/useVideoPolling';

import { GeneratedVideo } from './video-card';
import VideoGenerationForm from './video-generation-form';
import VideoPreview from './video-preview';

interface VideoGeneratorProps {
  initialVideo?: GeneratedVideo | null;
  isNewGeneration?: boolean;
  className?: string;
  prompt?: string;
  defaultModel?: string;
}

export default function VideoGenerator({
  initialVideo,
  isNewGeneration = false,
  className,
  prompt,
  defaultModel,
}: VideoGeneratorProps) {
  const [currentVideo, setCurrentVideo] = useState<GeneratedVideo | null>(
    initialVideo || null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState('');
  const [formPrompt, setFormPrompt] = useState('');
  const [showInGallery, setShowInGallery] = useState(false);
  const hasAutoTriggered = useRef(false);
  const t = useTranslations('video.generator');

  useEffect(() => {
    if (prompt) {
      const isSlug = !prompt.includes(' ') && prompt.length < 100;
      if (isSlug) {
        fetch(`/api/prompts/by-title?title=${encodeURIComponent(prompt)}`)
          .then((res) => res.json())
          .then((data) => {
            if (data.success && data.data?.promptDescription) {
              setFormPrompt(data.data.promptDescription);
            } else {
              setFormPrompt(prompt);
            }
          })
          .catch(() => setFormPrompt(prompt));
      } else {
        setFormPrompt(prompt);
      }
    }
  }, [prompt]);

  const { removeParam } = useUrlParams();

  const { startPolling, stopPolling } = useVideoPolling({
    onCompleted: (completedVideo) => {
      setCurrentVideo(completedVideo);
      setIsGenerating(false);
      setGenerationProgress('');
      toast.success('Video generation completed!');

      // Auto-save to showcase
      if (completedVideo.videoUrl) {
        fetch('/api/showcases/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: completedVideo.prompt?.substring(0, 100) || '',
            prompt: completedVideo.prompt || '',
            image: completedVideo.thumbnailUrl || completedVideo.startImageUrl || '',
            videoUrl: completedVideo.videoUrl,
            type: 'video',
            showInGallery: showInGallery ? 1 : 0,
          }),
        }).catch((e) => console.error('Failed to save showcase:', e));
      }
    },
    onFailed: () => {
      setCurrentVideo((prev) => (prev ? { ...prev, status: 'failed' } : null));
      setIsGenerating(false);
      setGenerationProgress('');
    },
    onProgressUpdate: (message) => {
      setGenerationProgress(message);
    },
  });

  useEffect(() => {
    if (initialVideo) {
      setCurrentVideo(initialVideo);
    }
  }, [initialVideo]);

  // Clear formPrompt after it's been used
  useEffect(() => {
    if (formPrompt) {
      const timer = setTimeout(() => {
        setFormPrompt('');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [formPrompt]);

  useEffect(() => {
    if (initialVideo && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;

      if (isNewGeneration) {
        removeParam('type');
      }

      if (initialVideo.status === 'generating') {
        setIsGenerating(true);
        startPolling(initialVideo.id);
      } else if (initialVideo.status === 'pending' && isNewGeneration) {
        handleVideoGeneration({
          prompt: initialVideo.prompt,
          model: initialVideo.model,
          parameters: initialVideo.parameters,
        }, initialVideo.id);
      }
    }
  }, [initialVideo, isNewGeneration]);

  const handleVideoGeneration = async (
    formData: {
      prompt: string;
      model: string;
      parameters: Record<string, any>;
      startImage?: File;
    },
    existingVideoId?: string
  ) => {
    setIsGenerating(true);

    const newVideo: GeneratedVideo = {
      id: existingVideoId || Date.now().toString(),
      prompt: formData.prompt,
      model: formData.model,
      parameters: formData.parameters,
      status: 'generating',
      createdAt: new Date(),
    };

    setCurrentVideo(newVideo);

    try {
      let response: Response;

      const isDebugMock = 
        (typeof window !== 'undefined' && window.localStorage.getItem('debug_mock') === '1') || 
        (typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('mock') === '1');

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (isDebugMock) {
        headers['x-debug-mock'] = 'true';
      }

      if (formData.startImage) {
        const apiFormData = new FormData();
        apiFormData.append('prompt', formData.prompt);
        apiFormData.append('model', formData.model);
        apiFormData.append('parameters', JSON.stringify(formData.parameters));
        apiFormData.append('startImage', formData.startImage);
        if (existingVideoId) apiFormData.append('videoId', existingVideoId);

        response = await fetch('/api/video/ai', {
          method: 'POST',
          headers: isDebugMock ? { 'x-debug-mock': 'true' } : {},
          body: apiFormData,
        });
      } else {
        response = await fetch('/api/video/ai', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            prompt: formData.prompt,
            model: formData.model,
            parameters: formData.parameters,
            ...(existingVideoId && { videoId: existingVideoId }),
          }),
        });
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to generate video');
      }

      const status = result.data.status;
      if (status === 'generating' || status === 'succeeded' || status === 'completed') {
        startPolling(result.data.id || existingVideoId);
      }
    } catch (error) {
      console.error('Video generation error:', error);
      setCurrentVideo((prev) => prev ? { ...prev, status: 'failed' } : null);
      toast.error(error instanceof Error ? error.message : 'Generation failed');
      setIsGenerating(false);
    }
  };

  const handlePromptSelect = (prompt: string) => {
    setFormPrompt(prompt);
  };

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return (
    <section className={cn('pt-4 md:pt-6 pb-16 md:pb-24', className)}>
      <div className="container">
        <div className="mx-auto max-w-6xl space-y-10">
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[500px]">
            <VideoGenerationForm
              onGenerate={handleVideoGeneration}
              isGenerating={isGenerating}
              showInGallery={showInGallery}
              onShowInGalleryChange={setShowInGallery}
              initialData={
                currentVideo
                  ? {
                      prompt: currentVideo.prompt,
                      model: currentVideo.model,
                      parameters: currentVideo.parameters,
                      startImageUrl: currentVideo.startImageUrl,
                    }
                  : {
                      prompt: formPrompt || undefined,
                      model: defaultModel || undefined,
                    }
              }
            />

            <VideoPreview
              video={currentVideo}
              isGenerating={isGenerating}
              generationProgress={generationProgress}
              onPromptSelect={handlePromptSelect}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
