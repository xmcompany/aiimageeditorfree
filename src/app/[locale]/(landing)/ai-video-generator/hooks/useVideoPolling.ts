import { useState, useRef, useCallback } from 'react';
import { toast } from 'sonner';

export function useVideoPolling({
  onCompleted,
  onFailed,
  onProgressUpdate,
  pollingInterval = 3000,
}: {
  onCompleted?: (video: any) => void;
  onFailed?: (error?: string) => void;
  onProgressUpdate?: (message: string) => void;
  pollingInterval?: number;
} = {}) {
  const [isPolling, setIsPolling] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  const startPolling = useCallback(
    (videoId: string) => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      setIsPolling(true);
      onProgressUpdate?.('Checking generation status...');

      pollingIntervalRef.current = setInterval(async () => {
        try {
          const response = await fetch('/api/video/status', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ videoId }),
          });

          const result = await response.json() as { success?: boolean; data?: any };

          if (result.success && result.data) {
            const status = result.data.status as string;

            if (status === 'completed') {
              const completedVideo = {
                ...result.data,
                parameters:
                  typeof result.data.parameters === 'string'
                    ? JSON.parse(result.data.parameters)
                    : result.data.parameters || {},
                createdAt: result.data.createdAt ? new Date(result.data.createdAt) : new Date(),
              };

              stopPolling();
              onCompleted?.(completedVideo);
            } else if (status === 'failed') {
              const reason = result.data.failReason as string | undefined;
              stopPolling();
              onFailed?.(reason || 'Video generation failed');
              toast.error(reason || 'Video generation failed');
            } else if (status === 'uploading') {
              onProgressUpdate?.('Uploading video...');
            } else if (status === 'generating' || status === 'pending') {
              onProgressUpdate?.('Video is being generated...');
            }
          }
        } catch (error) {
          console.error('Polling error:', error);
        }
      }, pollingInterval);
    },
    [onCompleted, onFailed, onProgressUpdate, pollingInterval, stopPolling]
  );

  return {
    isPolling,
    startPolling,
    stopPolling,
  };
}
