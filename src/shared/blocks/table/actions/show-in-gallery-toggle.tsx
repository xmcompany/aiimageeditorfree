'use client';

import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface ShowInGalleryToggleProps {
  id: string;
  type: 'image' | 'video';
  showInGallery: boolean;
  labelOn?: string;
  labelOff?: string;
  size?: 'sm' | 'default';
  onToggle?: (show: boolean) => void;
}

export function ShowInGalleryToggle({
  id,
  type,
  showInGallery: initialShow,
  labelOn = 'Shown',
  labelOff = 'Show in Gallery',
  size = 'sm',
  onToggle,
}: ShowInGalleryToggleProps) {
  const [show, setShow] = useState(initialShow);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/showcases/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, type, show: !show }),
      });
      const data: any = await res.json();
      if (data.code === 0) {
        const newShow = !show;
        setShow(newShow);
        toast.success(data.message);
        onToggle?.(newShow);
      } else {
        toast.error(data.message || 'Operation failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const isSm = size === 'sm';

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
        show
          ? 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
          : 'border-border bg-background text-muted-foreground hover:bg-muted'
      } ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      type="button"
    >
      {loading ? (
        <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
      ) : show ? (
        <Eye className="h-3 w-3" />
      ) : (
        <EyeOff className="h-3 w-3" />
      )}
      {show ? labelOn : labelOff}
    </button>
  );
}
