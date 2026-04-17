export function isValidPrompt(prompt?: string | null): boolean {
  if (!prompt) return false;
  const p = prompt.trim();
  return p.length >= 20 && !/^[\w\-–—\s#]+$/.test(p);
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function buildGenerateUrl({
  type = 'video',
  prompt,
  model,
  showcaseId,
  promptTitle,
}: {
  type?: 'video' | 'image';
  prompt?: string | null;
  model?: string | null;
  showcaseId?: string | null;
  promptSlug?: string | null;
  promptTitle?: string | null;
}): string {
  const cleanModel = model?.trim() || null;

  if (type === 'image') {
    const base = cleanModel ? `/ai-image-generator/${cleanModel}` : '/ai-image-generator';
    const params = new URLSearchParams();
    if (showcaseId) {
      params.set('showcase', showcaseId);
    } else if (promptTitle) {
      params.set('prompt', slugify(promptTitle));
    } else if (isValidPrompt(prompt)) {
      params.set('prompt', prompt!.trim());
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  const base = cleanModel ? `/ai-video-generator/${cleanModel}` : '/ai-video-generator';
  const params = new URLSearchParams();
  if (showcaseId) {
    params.set('showcase', showcaseId);
  } else if (promptTitle) {
    params.set('prompt', slugify(promptTitle));
  } else if (isValidPrompt(prompt)) {
    params.set('prompt', prompt!.trim());
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
