'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Trash2, CheckSquare, Square } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';

interface BulkDeleteTableProps {
  items: { id: string; [key: string]: any }[];
  columns: { key: string; label: string; truncate?: boolean }[];
  deleteApiUrl: string;
  onDeleted?: () => void;
  confirmText?: string;
}

export function BulkDeleteTable({
  items,
  columns,
  deleteApiUrl,
  onDeleted,
  confirmText = 'Delete selected items?',
}: BulkDeleteTableProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);

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
      const data = await res.json();
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
      {/* Toolbar */}
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
        )}
      </div>

      {/* Table */}
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
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr
                key={item.id}
                className={`border-t cursor-pointer hover:bg-muted/30 transition-colors ${selected.has(item.id) ? 'bg-primary/5' : ''}`}
                onClick={() => toggle(item.id)}
              >
                <td className="px-3 py-2">
                  {selected.has(item.id)
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4 text-muted-foreground" />}
                </td>
                {columns.map(col => (
                  <td key={col.key} className="px-3 py-2">
                    <span className={col.truncate ? 'line-clamp-1 text-muted-foreground' : ''}>
                      {item[col.key] ?? '-'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
