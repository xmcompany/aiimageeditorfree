'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';

import { Button } from '@/shared/components/ui/button';
import { Pagination } from '@/shared/blocks/common';

import VideoCard, { GeneratedVideo } from './video-card';

interface VideoGalleryProps {
  onVideoSelect?: (video: GeneratedVideo) => void;
  hidePagination?: boolean;
}

export default function VideoGallery({ 
  onVideoSelect,
  hidePagination = false 
}: VideoGalleryProps) {
  const t = useTranslations('video.gallery');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const [videos, setVideos] = useState<GeneratedVideo[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  
  const page = Number(searchParams.get('page')) || 1;
  const limit = 12;

  const fetchVideos = async (pageToFetch: number) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/video/my-videos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: pageToFetch, limit }),
      });

      const result = await response.json();
      if (result.success && result.data) {
        setVideos(result.data.videos);
        setTotalCount(result.data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos(page);
  }, [page]);

  const handleVideoDeleted = (videoId: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== videoId));
    setTotalCount((prev) => prev - 1);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-64 bg-muted/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <svg
              className="w-8 h-8 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-foreground">
            {t('empty_title')}
          </h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            {t('empty_subtitle')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-foreground">{t('title')}</h2>
        <p className="text-sm text-muted-foreground">
          {t('total_count', { count: totalCount || videos.length })}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {videos.map((video) => (
          <VideoCard
            key={video.id}
            video={video}
            onVideoSelect={onVideoSelect}
            onVideoDeleted={handleVideoDeleted}
          />
        ))}
      </div>

      {!hidePagination && (
        <div className="flex justify-center pt-8 border-t border-border/50">
          <Pagination
            total={totalCount}
            limit={limit}
            page={page}
            className="mx-auto"
          />
        </div>
      )}
    </div>
  );
}
