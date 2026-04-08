
'use client';

import { Play } from 'lucide-react';
import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/shared/components/ui/dialog';

export function Video({
  value,
  metadata,
}: {
  value?: string;
  metadata?: any;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!value) return null;

  const width = metadata?.width || 100;
  const height = metadata?.height || 100;
  const poster = metadata?.poster;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div 
          className="group relative cursor-pointer overflow-hidden rounded-md border bg-muted"
          style={{ width, height }}
        >
          {poster ? (
            <img 
              src={poster} 
              alt="thumbnail" 
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
             <div className="relative flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
               {/* Subtle background SVG pattern */}
               <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '12px 12px' }}></div>
               <div className="relative flex flex-col items-center gap-1">
                 <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 shadow-sm dark:bg-white/10 transition-colors group-hover:bg-white dark:group-hover:bg-white/20">
                   <Play className="h-5 w-5 text-slate-600 dark:text-slate-400 fill-current" />
                 </div>
                 <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Preview</span>
               </div>
             </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:backdrop-blur-[2px]">
            <div className="flex h-12 w-12 scale-90 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-md transition-all duration-300 group-hover:scale-100 group-hover:bg-white/30">
              <Play className="ml-0.5 h-6 w-6 fill-current" />
            </div>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
        <DialogTitle className="sr-only">Video Preview</DialogTitle>
        <video
          src={value}
          controls
          autoPlay
          className="h-full w-full rounded-lg shadow-2xl"
        />
      </DialogContent>
    </Dialog>
  );
}
