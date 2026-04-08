'use client';

import { ImagePlus, Trash2, Upload } from 'lucide-react';
import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { useImageUpload } from '@/app/[locale]/(landing)/ai-video-generator/hooks/useImageUpload';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { cn } from '@/shared/lib/utils';

import ImageThumbnail from './image-thumbnail';

interface UploadImageProps {
  onImageSelect?: (file: File | null) => void;
  onImagesSelect?: (files: File[]) => void;
  initialImageUrl?: string;
  initialImages?: File[];
  variant?: 'default' | 'transparent';
  size?: 'compact' | 'full';
  title?: string;
  description?: string;
  showHeader?: boolean;
  enableDragDrop?: boolean;
  multiple?: boolean;
  maxItems?: number;
}

export default function UploadImage({
  onImageSelect,
  onImagesSelect,
  initialImageUrl,
  initialImages = [],
  variant = 'transparent',
  size = 'full',
  title,
  description,
  showHeader = true,
  enableDragDrop = true,
  multiple = false,
  maxItems,
}: UploadImageProps) {
  const t = useTranslations('video.upload_image');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>(initialImages);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const singleImageHook = useImageUpload({
    onUpload: (file) => onImageSelect?.(file),
    onRemove: () => onImageSelect?.(null),
    initialImageUrl,
  });

  const previewUrl = multiple ? undefined : singleImageHook.previewUrl;
  const handleThumbnailClick = multiple
    ? () => fileInputRef.current?.click()
    : singleImageHook.handleThumbnailClick;

  useEffect(() => {
    if (multiple) {
      const urls = uploadedFiles.map((file) => URL.createObjectURL(file));
      setPreviewUrls(urls);
      return () => {
        urls.forEach((url) => URL.revokeObjectURL(url));
      };
    }
  }, [uploadedFiles, multiple]);

  const handleMultipleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) =>
      file.type.match(/^image\/(jpeg|jpg|png)$/)
    );

    if (validFiles.length !== files.length) {
      alert(t('invalid_format'));
    }

    const currentCount = uploadedFiles.length;
    const maxAllowed = maxItems || 10;
    const availableSlots = maxAllowed - currentCount;
    const filesToAdd = validFiles.slice(0, availableSlots);

    const newFiles = [...uploadedFiles, ...filesToAdd];
    setUploadedFiles(newFiles);
    onImagesSelect?.(newFiles);

    if (e.target) {
      e.target.value = '';
    }
  };

  const handleRemoveImage = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    onImagesSelect?.(newFiles);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    if (!enableDragDrop) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      if (!enableDragDrop) return;
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files || []);

      if (multiple) {
        const validFiles = files.filter((file) =>
          file.type.match(/^image\/(jpeg|jpg|png)$/)
        );

        const currentCount = uploadedFiles.length;
        const maxAllowed = maxItems || 10;
        const availableSlots = maxAllowed - currentCount;
        const filesToAdd = validFiles.slice(0, availableSlots);

        const newFiles = [...uploadedFiles, ...filesToAdd];
        setUploadedFiles(newFiles);
        onImagesSelect?.(newFiles);
      } else {
        const file = files[0];
        if (file && file.type.match(/^image\/(jpeg|jpg|png)$/)) {
          const fakeEvent = {
            target: {
              files: [file],
            },
          } as unknown as React.ChangeEvent<HTMLInputElement>;
          singleImageHook.handleFileChange(fakeEvent);
        }
      }
    },
    [enableDragDrop, multiple, uploadedFiles, maxItems, onImagesSelect, singleImageHook]
  );

  const config = {
    compact: {
      containerSpacing: 'space-y-2',
      uploadHeight: 'h-20',
      previewHeight: 'h-20',
      iconSize: 'h-4 w-4',
      textSize: 'text-xs',
      buttonSize: 'h-6 w-6',
      buttonIconSize: 'h-3 w-3',
      gap: 'gap-1',
      buttonGap: 'gap-1',
    },
    full: {
      containerSpacing: 'space-y-4',
      uploadHeight: 'bg-[#000000] dark:bg-black',
      previewHeight: 'h-48',
      iconSize: 'h-6 w-6',
      textSize: 'text-sm',
      buttonSize: 'h-8 w-8',
      buttonIconSize: 'h-3 w-3',
      gap: 'gap-3',
      buttonGap: 'gap-2',
    },
  };

  const currentConfig = config[size];

  const getUploadAreaStyles = () => {
    const baseStyles = `flex cursor-pointer flex-col items-center justify-center ${currentConfig.gap} rounded-2xl border-2 border-dashed transition-all duration-300 h-48`;

    if (variant === 'transparent') {
      return cn(
        baseStyles,
        'border-zinc-200 bg-zinc-50 hover:bg-zinc-100 hover:border-primary/50',
        'dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900 dark:hover:border-primary/40',
        isDragging && 'border-primary/50 bg-primary/5'
      );
    } else {
      return cn(
        baseStyles,
        'border-zinc-200 bg-zinc-50 hover:bg-zinc-100',
        'dark:border-zinc-800 dark:bg-black dark:hover:bg-zinc-900',
        isDragging && 'border-primary/50 bg-primary/5'
      );
    }
  };

  const getTextStyles = (opacity: string) => {
    return cn(
      currentConfig.textSize,
      variant === 'transparent'
        ? opacity === '80' ? 'text-foreground' : 'text-muted-foreground'
        : opacity === '80'
        ? 'text-foreground'
        : 'text-muted-foreground'
    );
  };

  const getIconStyles = () => {
    return cn(
      currentConfig.iconSize,
      variant === 'transparent' ? 'text-primary' : 'text-muted-foreground'
    );
  };

  const getPreviewBorderStyles = () => {
    return variant === 'transparent' ? 'border-border' : 'border-border';
  };

  const defaultTitle = title || t('title');
  const defaultDescription = description || t('description');

  return (
    <div className={cn('w-full', currentConfig.containerSpacing)}>
      {showHeader && size === 'full' && (
        <div className="space-y-2">
          <h3 className={getTextStyles('80')} style={{ fontWeight: 500 }}>
            {defaultTitle}
          </h3>
          <p className={getTextStyles('60')}>{defaultDescription}</p>
        </div>
      )}

      <Input
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        className="hidden"
        ref={multiple ? fileInputRef : singleImageHook.fileInputRef}
        onChange={
          multiple ? handleMultipleFileChange : singleImageHook.handleFileChange
        }
        multiple={multiple}
      />

      {multiple ? (
        <div className="space-y-3">
          {uploadedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedFiles.map((file, index) => (
                <ImageThumbnail
                  key={`${file.name}-${index}`}
                  previewUrl={previewUrls[index]}
                  onRemove={() => handleRemoveImage(index)}
                  size="small"
                  variant={variant}
                />
              ))}
            </div>
          )}

          {(!maxItems || uploadedFiles.length < maxItems) && (
            <div
              onClick={handleThumbnailClick}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={getUploadAreaStyles()}
            >
              <ImagePlus className={getIconStyles()} />
              <div className="text-center">
                <p className={cn(getTextStyles('80'), 'font-medium')}>
                  {size === 'compact' ? t('click_upload') : t('click_select')}
                </p>
                {size === 'full' && enableDragDrop && (
                  <p className={getTextStyles('60')}>
                    {t('drag_drop_multiple')}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      ) : !previewUrl ? (
        <div
          onClick={handleThumbnailClick}
          onDragOver={handleDragOver}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={getUploadAreaStyles()}
        >
          <ImagePlus className={getIconStyles()} />
          <div className="text-center">
            <p className={cn(getTextStyles('80'), 'font-medium')}>
              {size === 'compact' ? t('click_upload') : t('click_select')}
            </p>
            {size === 'full' && enableDragDrop && (
              <p className={getTextStyles('60')}>{t('drag_drop')}</p>
            )}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div
            className={cn(
              'group relative overflow-hidden rounded-lg border',
              currentConfig.previewHeight,
              getPreviewBorderStyles()
            )}
          >
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className={cn(
                'transition-transform duration-300 group-hover:scale-105',
                size === 'compact' ? 'object-cover' : 'object-contain'
              )}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100" />
            <div
              className={cn(
                'absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100',
                currentConfig.buttonGap
              )}
            >
              <Button
                size="sm"
                variant="secondary"
                onClick={handleThumbnailClick}
                className={cn(currentConfig.buttonSize, 'p-0')}
              >
                <Upload className={currentConfig.buttonIconSize} />
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={singleImageHook.handleRemove}
                className={cn(currentConfig.buttonSize, 'p-0')}
              >
                <Trash2 className={currentConfig.buttonIconSize} />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
