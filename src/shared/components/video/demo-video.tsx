'use client';

import { Clapperboard } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { TextToVideoShowcase } from '@/themes/default/blocks/showcase/text-to-video-showcase';

interface ShowcaseVideoItem {
  prompt: string;
  videoSrc: string;
}

interface DemoVideoProps {
  onPromptSelect: (prompt: string) => void;
}

export default function DemoVideo({ onPromptSelect }: DemoVideoProps) {
  const t = useTranslations('video.generator.preview');
  const [slides, setSlides] = useState<any[]>([]);

  useEffect(() => {
    try {
      const translatedSlides = t.raw('demo_slides');
      setSlides(Array.isArray(translatedSlides) ? translatedSlides : []);
    } catch (e) {
      setSlides([]);
    }
  }, [t]);

  // Create a minimal section object for TextToVideoShowcase
  const section = {
    textToVideo: {
      buttons: [], // No buttons needed for demo carousel
    },
  };

  return (
    <div className="space-y-6 pt-4">
      {/* Header */}
      <div className="flex justify-between items-center px-2">
        <div className="flex items-center font-bold text-foreground">
          <Clapperboard className="w-5 inline mr-2 text-primary" />
          {t('demo_video')}
        </div>
      </div>

      {/* Use TextToVideoShowcase with custom props */}
      <div className="flex items-center justify-center pt-8 pb-20">
        {slides.length > 0 ? (
          <TextToVideoShowcase
            slides={slides}
            section={section}
            showCTA={false}
            onPromptClick={onPromptSelect}
          />
        ) : (
          <div className="text-muted-foreground text-sm">
            {t('no_videos_generated')} 
          </div>
        )}
      </div>
    </div>
  );
}
