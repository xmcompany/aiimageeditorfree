'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, CheckSquare, Square, MoreHorizontal, Edit } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { LazyImage } from '@/shared/blocks/common';
import { Copy } from './copy';
import { cn } from '@/shared/lib/utils';
import moment from 'moment';
import { Link } from '@/core/i18n/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';

type ColumnType = 'text' | 'image' | 'video' | 'copy' | 'label' | 'time' | 'action' | 'boolean';

interface BulkColumn {
  key: string;
  label: string;
  type?: ColumnType;
  truncate?: boolean;
  metadata?: Record<string, any>;
}

export interface RowActions {
  editUrlTemplate: string; // e.g. "/admin/image-prompts/[id]/edit"
  editLabel: string;
  deleteLabel: string;
  deleteApiUrl: string;
  confirmText: string;
  deletingText: string;
  successText: string;
  errorText: string;
}

export interface BulkAction {
  label: string;
  icon?: ReactNode;
  variant?: 'default' | 'outline' | 'destructive';
  apiUrl: string;
  payload?: Record<string, any>;
}

interface BulkDeleteTableProps {
  items: { id: string; [key: string]: any }[];
  columns: BulkColumn[];
  deleteApiUrl: string;
  onDeleted?: () => void;
  confirmText?: string;
  rowActions?: RowActions;
  bulkActions?: BulkAction[];
}

function RowActionCell({ item, rowActions }: { item: any; rowActions: RowActions }) {
  const [loading, setLoading] = useState(false);

  const editUrl = rowActions.editUrlTemplate.replace('[id]', item.id);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(rowActions.confirmText)) return;

    setLoading(true);
    const { toast: t } = await import('sonner');
    const toastId = t.loading(rowActions.deletingText);

    try {
      const res = await fetch(rowActions.deleteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [item.id] }),
      });
      const data: any = await res.json();
      if (data.code === 0) {
        t.success(rowActions.successText, { id: toastId });
        window.location.reload();
      } else {
        t.error(data.message || rowActions.errorText, { id: toastId });
      }
    } catch {
      const { toast: t2 } = await import('sonner');
      t2.error(rowActions.errorText);
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
          onClick={(e) => e.stopPropagation()}
        >
          <MoreHorizontal className={loading ? 'animate-spin' : ''} />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem asChild>
          <Link href={editUrl} className="flex w-full items-center gap-2">
            <Edit className="h-4 w-4" />
            {rowActions.editLabel}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive flex w-full items-center gap-2 cursor-pointer"
        >
          <Trash2 className="h-4 w-4" />
          {rowActions.deleteLabel}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function CellContent({
  column,
  item,
}: {
  column: BulkColumn;
  item: any;
}) {
  const value = item[column.key];

  if (column.render) {
    return column.render(item);
  }

  switch (column.type) {
    case 'image': {
      if (!value) return <span className="text-muted-foreground">-</span>;
      const w = column.metadata?.width || 50;
      const h = column.metadata?.height || 50;
      return (
        <LazyImage
          src={value}
          alt={value}
          width={w}
          height={h}
          style={{ width: `${w}px`, height: `${h}px` }}
          className="shrink-0 rounded-md object-cover overflow-hidden"
        />
      );
    }
    case 'video': {
      if (!value) return <span className="text-muted-foreground">-</span>;
      const w = column.metadata?.width || 60;
      const h = column.metadata?.height || 40;
      const poster = column.metadata?.poster ? item[column.metadata.poster] : undefined;
      return (
        <div className="relative group cursor-pointer overflow-hidden rounded-md border bg-muted" style={{ width: w, height: h }}>
          {poster ? (
            <img src={poster} alt="thumbnail" className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Video</span>
            </div>
          )}
          <video src={value} className="hidden" />
        </div>
      );
    }
    case 'copy': {
      const text = value || '';
      const display = column.truncate && text.length > 50 ? text.substring(0, 50) + '...' : text;
      return (
        <Copy value={text} metadata={{ message: 'Copied' }}>
          <span className={cn(column.truncate ? 'line-clamp-1' : '', 'text-muted-foreground')}>
            {display || '-'}
          </span>
        </Copy>
      );
    }
    case 'label': {
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <Badge variant={column.metadata?.variant ?? 'outline'}>{value.toString()}</Badge>;
    }
    case 'time': {
      if (!value) return <span className="text-muted-foreground">-</span>;
      return <span className="text-muted-foreground whitespace-nowrap">{moment(value).fromNow()}</span>;
    }
    case 'boolean': {
      const trueLabel = column.metadata?.trueLabel || 'Visible';
      const falseLabel = column.metadata?.falseLabel || 'Hidden';
      return (
        <span className={value ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
          {value ? trueLabel : falseLabel}
        </span>
      );
    }
    default: {
      const text = value || '';
      const display = column.truncate && text.length > 50 ? text.substring(0, 50) + '...' : text;
      return (
        <span className={cn(column.truncate ? 'line-clamp-1' : '')}>
          {display || '-'}
        </span>
      );
    }
  }
}

export function BulkDeleteTable({
  items,
  columns,
  deleteApiUrl,
  onDeleted,
  confirmText = 'Delete selected items?',
  rowActions,
  bulkActions,
}: BulkDeleteTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);

  const toggleAll = () => {
    if (selected.size === items.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(items.map(i => i.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  const handleDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`${confirmText} (${selected.size} items)`)) return;

    setDeleting(true);
    try {
      const res = await fetch(deleteApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data: any = await res.json();
      if (data.code === 0) {
        toast.success(data.message);
        setSelected(new Set());
        onDeleted?.();
        window.location.reload();
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={toggleAll} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            {selected.size === items.length && items.length > 0
              ? <CheckSquare className="h-4 w-4" />
              : <Square className="h-4 w-4" />}
            {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
          </button>
        </div>
        {selected.size > 0 && (
          <div className="flex items-center gap-2">
            {bulkActions?.map((ba, idx) => (
              <Button
                key={idx}
                variant={ba.variant || 'outline'}
                size="sm"
                disabled={bulkLoading}
                className="gap-1.5"
                onClick={async () => {
                  setBulkLoading(true);
                  try {
                    const ids = Array.from(selected);
                    const payload = ba.payload ? { ...ba.payload, ids } : { ids };
                    const res = await fetch(ba.apiUrl, {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify(payload),
                    });
                    const data: any = await res.json();
                    if (data.code === 0) {
                      toast.success(data.message);
                      setSelected(new Set());
                      window.location.reload();
                    } else {
                      toast.error(data.message || 'Action failed');
                    }
                  } catch (e: any) {
                    toast.error(e.message || 'Action failed');
                  } finally {
                    setBulkLoading(false);
                  }
                }}
              >
                {ba.icon}
                {ba.label}
              </Button>
            ))}
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-1.5"
            >
              <Trash2 className="h-4 w-4" />
              {deleting ? 'Deleting...' : `Delete ${selected.size}`}
            </Button>
          </div>
        )}
      </div>

      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-10 px-3 py-2"></th>
              {columns.map(col => (
                <th key={col.key} className="px-3 py-2 text-left font-medium text-muted-foreground">
                  {col.label}
                </th>
              ))}
              {rowActions && <th className="w-10 px-3 py-2"></th>}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className={cn(
                  'border-t hover:bg-muted/30 transition-colors',
                  selected.has(item.id) ? 'bg-primary/5' : ''
                )}
              >
                <td
                  className="px-3 py-2 cursor-pointer"
                  onClick={() => toggle(item.id)}
                >
                  {selected.has(item.id)
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4 text-muted-foreground" />}
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    <CellContent column={col} item={item} />
                  </td>
                ))}
                {rowActions && (
                  <td className="px-3 py-2" onClick={(e) => e.stopPropagation()}>
                    <RowActionCell item={item} rowActions={rowActions} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
