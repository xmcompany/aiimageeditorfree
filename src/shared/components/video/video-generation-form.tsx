'use client';

import { CoinsIcon, Sparkles, User, Loader2, CreditCard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import {
  calculateModelCredits,
  getModelDefaults,
  getModelPricingDescription,
  validateRequiredParams,
} from '@/config/model-config';
import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';
import { useAppContext } from '@/shared/contexts/app';

import CreditsDisplay from './credits-display';
import ModelSelect from './model-select';
import ParametersSelect from './parameters-select';
import UploadImage from './upload-image';

interface VideoGenerationFormProps {
  onGenerate: (formData: {
    prompt: string;
    model: string;
    parameters: Record<string, any>;
    startImage?: File;
  }) => void;
  isGenerating: boolean;
  showInGallery?: boolean;
  onShowInGalleryChange?: (value: boolean) => void;
  initialData?: {
    prompt?: string;
    model?: string;
    parameters?: Record<string, any>;
    startImageUrl?: string;
  };
  onGenerationSuccess?: () => void;
}

export default function VideoGenerationForm({
  onGenerate,
  isGenerating,
  showInGallery = false,
  onShowInGalleryChange,
  initialData,
  onGenerationSuccess,
}: VideoGenerationFormProps) {
  const t = useTranslations('video.hero_input');
  const tForm = useTranslations('video.generator.form');
  const tVideo = useTranslations('video');
  const { user, isCheckSign, setIsShowSignModal } = useAppContext();
  const [prompt, setPrompt] = useState(initialData?.prompt || '');
  const [selectedModel, setSelectedModel] = useState(
    initialData?.model || 'veo_3_1_lite'
  );
  const [parameters, setParameters] = useState<Record<string, any>>(() => {
    if (initialData?.parameters) {
      return initialData.parameters;
    }
    return getModelDefaults(initialData?.model || 'veo_3_1_lite');
  });
  const [startImage, setStartImage] = useState<File | null>(null);
  const [creditsRefreshTrigger, setCreditsRefreshTrigger] = useState(0);
  const [userCredits, setUserCredits] = useState<{ remainingCredits: number } | null>(null);
  const prevIsGeneratingRef = useRef(isGenerating);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const calculateCredits = () => {
    try {
      return calculateModelCredits(selectedModel, parameters);
    } catch (error) {
      console.error('Error calculating credits:', error);
      return 0;
    }
  };

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId);
    if (!initialData) {
      setParameters(getModelDefaults(modelId));
    }
  };

  const handleParameterChange = (paramId: string, value: any) => {
    setParameters((prev) => ({
      ...prev,
      [paramId]: value,
    }));
  };

  useEffect(() => {
    if (initialData) {
      if (initialData.prompt !== undefined) setPrompt(initialData.prompt);
      if (initialData.model !== undefined) setSelectedModel(initialData.model);
      if (initialData.parameters !== undefined) {
        setParameters(initialData.parameters);
      }
    }
  }, [initialData]);

  useEffect(() => {
    if (prevIsGeneratingRef.current && !isGenerating) {
      setCreditsRefreshTrigger((prev) => prev + 1);
      onGenerationSuccess?.();
    }
    prevIsGeneratingRef.current = isGenerating;
  }, [isGenerating, onGenerationSuccess]);

  const handleSubmit = () => {
    if (!prompt.trim() || isGenerating) return;

    const requiredCredits = calculateCredits();
    if (user && userCredits && userCredits.remainingCredits < requiredCredits) {
      toast.error(t('insufficient_credits') || 'Insufficient credits');
      return;
    }

    const validation = validateRequiredParams(selectedModel, {
      prompt,
      startImageUrl: startImage,
      ...parameters,
    });

    if (!validation.isValid) {
      toast.error(`Missing required parameters: ${validation.missingParams.join(', ')}`);
      return;
    }

    onGenerate({
      prompt: prompt.trim(),
      model: selectedModel,
      parameters,
      startImage: startImage || undefined,
    });
  };

  return (
    <div className="h-full space-y-6">
      <div
        className={cn(
          'h-full flex flex-col justify-between relative overflow-hidden',
          'backdrop-blur-2xl bg-card border border-primary/10 rounded-3xl p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] dark:bg-zinc-900/50 dark:border-zinc-800/50 dark:shadow-2xl group'
        )}
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-primary/5 via-transparent to-transparent pointer-events-none" />
        
        <div className="relative z-10">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-5">
              <div className="flex items-center font-serif font-extrabold text-2xl text-foreground tracking-tight">
                <div className="bg-primary/20 p-2 rounded-xl mr-3 shadow-inner">
                  <Sparkles className="w-5 h-5 text-primary" />
                </div>
                {tForm('prompt_label')}
              </div>

              <ModelSelect
                selectedModel={selectedModel}
                onModelChange={handleModelChange}
                variant="transparent"
                className="bg-muted/50 rounded-xl px-4 h-10 border border-border/10 font-bold text-xs uppercase tracking-widest text-primary"
              />
            </div>

            <div className="relative group/prompt">
              <Textarea
                value={prompt}
                placeholder={t('placeholder')}
                className={cn(
                  'bg-muted/30 dark:bg-black/40 w-full rounded-2xl px-6 py-5 border border-border/10 dark:border-zinc-800 text-foreground placeholder:text-muted-foreground/50 resize-none focus-visible:ring-1 focus-visible:ring-primary shadow-inner',
                  'min-h-[160px] text-base leading-relaxed transition-all duration-300 group-hover/prompt:border-primary/30 group-hover/prompt:bg-muted/40'
                )}
                onChange={(e) => setPrompt(e.target.value)}
              />
              <div className="absolute bottom-4 right-5 text-[10px] font-bold tracking-widest text-muted-foreground/40 bg-background/50 px-2 py-1 rounded-md backdrop-blur-sm">
                {prompt.length} / 2500
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <Label className="text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">
                {tVideo('upload_image.title')}
              </Label>
              <UploadImage
                onImageSelect={setStartImage}
                initialImageUrl={initialData?.startImageUrl}
                showHeader={false}
              />
            </div>

            <div className="pt-2">
              <Label className="mb-3 block text-foreground/80 text-sm font-bold ml-1 uppercase tracking-widest">
                {tForm('parameters_label')}
              </Label>
              <ParametersSelect
                selectedModel={selectedModel}
                parameters={parameters}
                onParameterChange={handleParameterChange}
                className="w-full bg-muted/30 dark:bg-black/40 border-border/10 dark:border-zinc-800 rounded-2xl h-12 shadow-inner px-4"
              />
            </div>

            {user && (
              <div className="pt-2 animate-in fade-in duration-500">
                <CreditsDisplay
                  requiredCredits={calculateCredits()}
                  refreshTrigger={creditsRefreshTrigger}
                  pricingDescription={getModelPricingDescription(
                    selectedModel,
                    parameters
                  )}
                  onCreditsChange={(credits) => setUserCredits(credits)}
                  className="rounded-2xl border-primary/20 bg-primary/5 p-4"
                />
              </div>
            )}
          </div>
        </div>

        <div className="relative z-10 mt-10">
          <div className="flex items-center justify-between mb-3">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <button
                type="button"
                role="switch"
                aria-checked={showInGallery}
                onClick={() => onShowInGalleryChange?.(!showInGallery)}
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
          {!isMounted ? (
            <Button className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl" disabled size="lg">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {tForm('loading')}
            </Button>
          ) : isCheckSign ? (
            <Button className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl" disabled size="lg">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {tForm('checking_account')}
            </Button>
          ) : user ? (
            <Button
              size="lg"
              className={cn(
                "w-full rounded-2xl h-14 text-lg font-bold transition-all duration-300 shadow-xl relative overflow-hidden group/btn",
                isGenerating ? "opacity-90" : "hover:scale-[1.02] active:scale-[0.98] hover:shadow-primary/25"
              )}
              onClick={handleSubmit}
              disabled={(!prompt.trim() && !startImage) || isGenerating || (!!userCredits && userCredits.remainingCredits < calculateCredits())}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-indigo-400 to-primary bg-[length:200%_auto] animate-[gradient_3s_linear_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
              <div className="relative z-10 flex items-center justify-center">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    {t('generating_button')}
                  </>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 transition-transform group-hover/btn:rotate-12" />
                    {t('generate_button')}
                    <span className="flex items-center gap-1.5 bg-background/20 px-2 py-0.5 rounded-lg text-sm">
                      <CreditCard className="w-3.5 h-3.5" />
                      {calculateCredits()}
                    </span>
                  </span>
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
              {tVideo('generator.sign_in_to_generate')}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
