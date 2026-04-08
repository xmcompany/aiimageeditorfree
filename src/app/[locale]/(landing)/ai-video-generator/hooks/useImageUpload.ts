import { useCallback, useEffect, useRef, useState } from 'react';

interface UseImageUploadProps {
  onUpload?: (file: File) => void;
  onRemove?: () => void;
  initialImageUrl?: string;
}

export function useImageUpload({
  onUpload,
  onRemove,
  initialImageUrl,
}: UseImageUploadProps = {}) {
  const previewRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isManuallyRemoved, setIsManuallyRemoved] = useState(false);

  useEffect(() => {
    if (initialImageUrl && !previewUrl && !isManuallyRemoved) {
      setPreviewUrl(initialImageUrl);
    }
  }, [initialImageUrl, previewUrl, isManuallyRemoved]);

  const handleThumbnailClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        if (!file.type.match(/^image\/(jpeg|jpg|png)$/)) {
          alert('Please select a JPG or PNG image file');
          return;
        }

        const maxSize = 10 * 1024 * 1024;
        if (file.size > maxSize) {
          alert('Image file size must be less than 10MB');
          return;
        }

        setIsManuallyRemoved(false);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        previewRef.current = url;
        onUpload?.(file);
      }
    },
    [onUpload]
  );

  const handleRemove = useCallback(() => {
    if (previewRef.current) {
      URL.revokeObjectURL(previewRef.current);
    }
    setPreviewUrl(null);
    setIsManuallyRemoved(true);
    previewRef.current = null;
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onRemove?.();
  }, [onRemove]);

  useEffect(() => {
    return () => {
      if (previewRef.current) {
        URL.revokeObjectURL(previewRef.current);
      }
    };
  }, []);

  return {
    previewUrl,
    fileInputRef,
    handleThumbnailClick,
    handleFileChange,
    handleRemove,
  };
}
