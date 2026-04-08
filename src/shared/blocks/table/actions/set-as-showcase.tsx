
'use client';

import { Star } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/shared/components/ui/button';
import { setAsShowcaseAction } from '@/app/actions/showcase';
import { toast } from 'sonner';

export function SetAsShowcase({ 
  id, 
  type,
  label = 'Set Layout',
  showcasedLabel = 'Showcased',
  isShowcased = false
}: { 
  id: string; 
  type: 'video' | 'image';
  label?: string;
  showcasedLabel?: string;
  isShowcased?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (isShowcased || isSuccess) {
     return (
        <Button 
          variant="ghost" 
          size="sm" 
          disabled
          className="flex items-center gap-1 text-muted-foreground"
        >
          <Star className="h-4 w-4 fill-current" />
          {showcasedLabel}
        </Button>
     );
  }

  const handleSet = async () => {
    setLoading(true);
    try {
      const res = await setAsShowcaseAction(id, type);
      if (res.success) {
        toast.success(res.message);
        setIsSuccess(true);
      } else {
        toast.error(res.message);
      }
    } catch (e) {
      toast.error('Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSet} 
      disabled={loading}
      className="flex items-center gap-1"
      type="button"
    >
      <Star className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      {label}
    </Button>
  );
}
