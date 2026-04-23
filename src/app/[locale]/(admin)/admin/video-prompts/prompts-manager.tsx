'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Image as ImageIcon, Loader2, Sparkles, Trash2, CheckSquare, Square, Edit } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { cn } from '@/shared/lib/utils';
import { Link } from '@/core/i18n/navigation';
import { getVideoModelAdminOptions } from '@/config/model-config';

interface PromptItem {
  id: string;
  title: string;
  description: string | null;
  image: string | null;
  promptTitle: string;
  promptDescription: string | null;
  status: string;
  model: string | null;
  createdAt: string;
}

interface GenerateTask {
  taskId: string;
  status: 'pending';
  model: string;
  provider: string;
  submittedAt: string; // ISO string for display
}

// localStorage key prefix for persisting submitted tasks per prompt
const TASKS_STORAGE_KEY = 'admin_video_prompt_tasks';

function loadStoredTasks(promptId: string): GenerateTask[] {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    if (!raw) return [];
    const all: Record<string, GenerateTask[]> = JSON.parse(raw);
    return all[promptId] || [];
  } catch {
    return [];
  }
}

function saveStoredTasks(promptId: string, tasks: GenerateTask[]) {
  try {
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);
    const all: Record<string, GenerateTask[]> = raw ? JSON.parse(raw) : {};
    // Keep only the latest 10 tasks per prompt to avoid unbounded growth
    all[promptId] = tasks.slice(0, 10);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
}

const VIDEO_MODELS = getVideoModelAdminOptions();

export function VideoPromptsManager({ initialData }: { initialData: PromptItem[] }) {
  const [prompts, setPrompts] = useState<PromptItem[]>(initialData);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  // Detail / generate dialog
  const [selectedPrompt, setSelectedPrompt] = useState<PromptItem | null>(null);
  const [detailModel, setDetailModel] = useState(VIDEO_MODELS[0].value);
  const [detailTasks, setDetailTasks] = useState<GenerateTask[]>([]);
  const [detailGenerating, setDetailGenerating] = useState(false);

  const filtered = prompts.filter((p) =>
    statusFilter === 'all' ? true : p.status === statusFilter
  );

  // 鈹€鈹€ Selection helpers 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((p) => p.id)));
    }
  };

  const toggle = (id: string) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelected(next);
  };

  // 鈹€鈹€ Bulk delete 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} selected prompt(s)?`)) return;
    setBulkDeleting(true);
    try {
      const res = await fetch('/api/admin/prompts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: Array.from(selected) }),
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success(`Deleted ${selected.size} prompts`);
        setPrompts((prev) => prev.filter((p) => !selected.has(p.id)));
        setSelected(new Set());
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setBulkDeleting(false);
    }
  };

  // 鈹€鈹€ Single delete 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const handleSingleDelete = async (id: string) => {
    if (!confirm('Delete this prompt?')) return;
    try {
      const res = await fetch('/api/admin/prompts/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      });
      const data = await res.json();
      if (data.code === 0) {
        toast.success('Deleted');
        setPrompts((prev) => prev.filter((p) => p.id !== id));
        setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
      } else {
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    }
  };

  // 鈹€鈹€ Open detail dialog 鈥?restore persisted tasks 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const openDetail = (p: PromptItem) => {
    setSelectedPrompt(p);
    const savedModel = VIDEO_MODELS.find((m) => m.value === p.model);
    setDetailModel(savedModel ? savedModel.value : VIDEO_MODELS[0].value);
    // Restore tasks from localStorage so they survive dialog close / page reload
    setDetailTasks(loadStoredTasks(p.id));
  };

  // 鈹€鈹€ Generate 鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€鈹€
  const generateInDetail = async () => {
    if (!selectedPrompt) return;
    const modelConfig = VIDEO_MODELS.find((m) => m.value === detailModel) || VIDEO_MODELS[0];
    setDetailGenerating(true);
    try {
      const res = await fetch('/api/admin/prompts/generate-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptId: selectedPrompt.id,
          model: modelConfig.value,
          provider: modelConfig.provider,
          mediaType: 'video',
        }),
      });
      const data = await res.json();
      if (data.code === 0) {
        const newTask: GenerateTask = {
          taskId: data.data.taskId,
          status: 'pending',
          model: modelConfig.label,
          provider: modelConfig.provider,
          submittedAt: new Date().toLocaleString(),
        };
        setDetailTasks((prev) => {
          const updated = [newTask, ...prev];
          saveStoredTasks(selectedPrompt.id, updated);
          return updated;
        });
        toast.success('Video generation task created 鈥?check AI Tasks for results');
      } else {
        toast.error(data.message);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDetailGenerating(false);
    }
  };

  const allFilteredSelected = filtered.length > 0 && selected.size === filtered.length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={toggleAll}
          className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
        >
          {allFilteredSelected
            ? <CheckSquare className="h-4 w-4" />
            : <Square className="h-4 w-4" />}
          {selected.size > 0 ? `${selected.size} selected` : 'Select all'}
        </button>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="published">Published</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex-1" />

        <span className="text-muted-foreground text-sm">{filtered.length} prompts</span>

        {selected.size > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleting}
            className="gap-1.5"
          >
            <Trash2 className="h-4 w-4" />
            {bulkDeleting ? 'Deleting...' : `Delete ${selected.size}`}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-lg border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="w-10 px-3 py-2" />
              <th className="w-14 px-3 py-2">Preview</th>
              <th className="px-3 py-2 text-left">Title / Prompt</th>
              <th className="px-3 py-2 text-left">Model</th>
              <th className="w-24 px-3 py-2 text-center">Status</th>
              <th className="w-32 px-3 py-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className={cn(
                  'border-t hover:bg-muted/30 transition-colors',
                  selected.has(p.id) && 'bg-primary/5'
                )}
              >
                {/* Checkbox */}
                <td className="px-3 py-2 cursor-pointer" onClick={() => toggle(p.id)}>
                  {selected.has(p.id)
                    ? <CheckSquare className="h-4 w-4 text-primary" />
                    : <Square className="h-4 w-4 text-muted-foreground" />}
                </td>

                {/* Image */}
                <td className="px-3 py-2">
                  {p.image ? (
                    <img src={p.image} alt="" className="h-10 w-10 rounded object-cover" />
                  ) : (
                    <div className="bg-muted flex h-10 w-10 items-center justify-center rounded">
                      <ImageIcon className="text-muted-foreground h-4 w-4" />
                    </div>
                  )}
                </td>

                {/* Title */}
                <td className="px-3 py-2">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-muted-foreground mt-0.5 max-w-xs truncate text-xs">
                    {p.promptDescription?.slice(0, 80)}
                  </div>
                </td>

                {/* Model */}
                <td className="px-3 py-2">
                  <span className="bg-muted rounded px-2 py-0.5 text-xs">
                    {p.model
                      ? (VIDEO_MODELS.find((m) => m.value === p.model)?.label ?? p.model)
                      : '-'}
                  </span>
                </td>

                {/* Status */}
                <td className="px-3 py-2 text-center">
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    p.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {p.status}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center gap-1">
                    <Button size="sm" variant="ghost" asChild className="h-7 px-2">
                      <Link href={`/admin/video-prompts/${p.id}/edit`}>
                        <Edit className="h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      onClick={() => openDetail(p)}
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive hover:text-destructive h-7 px-2"
                      onClick={() => handleSingleDelete(p.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="text-muted-foreground p-8 text-center">
                  No prompts found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Generate Dialog */}
      <Dialog open={!!selectedPrompt} onOpenChange={(open) => !open && setSelectedPrompt(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base">{selectedPrompt?.title}</DialogTitle>
          </DialogHeader>

          {selectedPrompt && (
            <div className="space-y-5">
              {selectedPrompt.image && (
                <img src={selectedPrompt.image} alt="" className="max-h-48 w-auto rounded" />
              )}

              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">Prompt</div>
                <div className="bg-muted rounded p-3 text-sm break-words whitespace-pre-wrap">
                  {selectedPrompt.promptDescription || '-'}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="text-muted-foreground">Saved Model: </span>
                  <span className="font-medium">
                    {selectedPrompt.model
                      ? (VIDEO_MODELS.find((m) => m.value === selectedPrompt.model)?.label ?? selectedPrompt.model)
                      : '-'}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Status: </span>
                  <span className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    selectedPrompt.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                  )}>
                    {selectedPrompt.status}
                  </span>
                </div>
              </div>

              <div className="space-y-3 border-t pt-4">
                <div className="text-sm font-medium">Generate Video with AI</div>
                <p className="text-muted-foreground text-xs">
                  Runs in the background 鈥?check{' '}
                  <Link href="/admin/ai-tasks?type=video" className="underline">AI Tasks</Link>{' '}
                  for results.
                </p>
                <div className="flex items-center gap-3">
                  <Select value={detailModel} onValueChange={setDetailModel}>
                    <SelectTrigger className="w-56">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {VIDEO_MODELS.map((m) => (
                        <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={generateInDetail} disabled={detailGenerating} size="sm">
                    {detailGenerating
                      ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                      : <Sparkles className="mr-1.5 h-3.5 w-3.5" />}
                    Generate
                  </Button>
                </div>

                {detailTasks.length > 0 && (
                  <div className="space-y-2">
                    <div className="text-muted-foreground text-xs">Submitted tasks (persisted locally)</div>
                    {detailTasks.map((task) => (
                      <div key={task.taskId} className="flex items-center gap-3 rounded border p-2 text-sm">
                        <Badge variant="secondary">pending</Badge>
                        <span className="text-muted-foreground">{task.model}</span>
                        <span className="text-muted-foreground font-mono text-xs truncate flex-1">
                          {task.taskId.slice(0, 24)}鈥?                        </span>
                        <span className="text-muted-foreground text-xs shrink-0">{task.submittedAt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
