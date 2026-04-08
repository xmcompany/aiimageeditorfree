'use client';

import { X } from 'lucide-react';
import { useState } from 'react';

import { cn } from '@/shared/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

interface ImageThumbnailProps {
  file?: File;
  previewUrl: string;
  onRemove: () => void;
  size?: 'small' | 'medium' | 'large';
  variant?: 'default' | 'transparent';
  showPreviewDialog?: boolean;
  className?: string;
}

export default function ImageThumbnail({
  previewUrl,
  onRemove,
  size = 'medium',
  variant = 'transparent',
  showPreviewDialog = true,
  className,
}: ImageThumbnailProps) {
  const [showPreview, setShowPreview] = useState(false);

  const handleRemoveClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  const handleThumbnailClick = () => {
    if (showPreviewDialog) {
      setShowPreview(true);
    }
  };

  const sizeConfig = {
    small: {
      thumbnail: 'w-12 h-12',
      removeButton: 'w-4 h-4',
      removeIcon: 'w-2 h-2',
      removePosition: '-top-1 -right-1',
    },
    medium: {
      thumbnail: 'w-16 h-16',
      removeButton: 'w-5 h-5',
      removeIcon: 'w-3 h-3',
      removePosition: '-top-2 -right-2',
    },
    large: {
      thumbnail: 'w-20 h-20',
      removeButton: 'w-6 h-6',
      removeIcon: 'w-4 h-4',
      removePosition: '-top-2 -right-2',
    },
  };

  const config = sizeConfig[size];

  const getBorderStyles = () => {
    return variant === 'transparent' ? 'border-border' : 'border-border';
  };

  const getRemoveButtonStyles = () => {
    return variant === 'transparent'
      ? 'bg-destructive hover:bg-destructive/80 text-destructive-foreground'
      : 'bg-background hover:bg-background/80 text-foreground';
  };

  return (
    <>
      <div className={cn('relative group', className)}>
        <img
          src={previewUrl}
          alt="Image preview"
          className={cn(
            config.thumbnail,
            'object-cover rounded border transition-transform duration-200 cursor-pointer',
            getBorderStyles(),
            showPreviewDialog && 'group-hover:scale-110'
          )}
          onClick={handleThumbnailClick}
        />
        <button
          onClick={handleRemoveClick}
          className={cn(
            'absolute p-1 rounded-full transition-colors shadow-lg cursor-pointer flex items-center justify-center',
            config.removePosition,
            config.removeButton,
            getRemoveButtonStyles()
          )}
          aria-label="Remove image"
        >
          <X className={config.removeIcon} />
        </button>
      </div>

      {showPreviewDialog && (
        <Dialog open={showPreview} onOpenChange={setShowPreview}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="text-center">Image Preview</DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center p-4">
              <img
                src={previewUrl}
                alt="Image preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
