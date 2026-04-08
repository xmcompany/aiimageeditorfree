
'use client';

import { useState } from 'react';
import { MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { SmartIcon } from '@/shared/blocks/common/smart-icon';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { deleteShowcaseAction } from '@/app/actions/showcase';
import { toast } from 'sonner';
import { Link } from '@/core/i18n/navigation';

export function ShowcaseActions({ 
  id, 
  editUrl,
  editLabel,
  deleteLabel,
  confirmText,
  deletingText,
  successText,
  errorText 
}: { 
  id: string;
  editUrl: string;
  editLabel: string;
  deleteLabel: string;
  confirmText: string;
  deletingText: string;
  successText: string;
  errorText: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!window.confirm(confirmText)) return;
    
    setLoading(true);
    const toastId = toast.loading(deletingText);
    
    try {
      const res = await deleteShowcaseAction(id);
      if (res.success) {
        toast.success(successText, { id: toastId });
      } else {
        toast.error(res.message, { id: toastId });
      }
    } catch (e) {
      toast.error(errorText, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          disabled={loading}
          className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
        >
          <MoreHorizontal className={loading ? 'animate-spin' : ''} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={editUrl} className="flex w-full items-center gap-2">
            <Edit className="h-4 w-4" />
            {editLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleDelete}
          className="text-destructive focus:text-destructive flex w-full items-center gap-2 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          {deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
