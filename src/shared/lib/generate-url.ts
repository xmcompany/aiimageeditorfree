/**
 * 构建 AI 生成页面的跳转链接
 *
 * Showcases: /ai-video-generator/[model]?showcase=[id]
 * Prompts:   /[model]/[prompt-slug]
 * 仅模型:    /ai-video-generator/[model]
 * 无模型:    /ai-video-generator
 */

// prompt 是否有效（至少20字符，不是纯 slug/title 格式）
export function isValidPrompt(prompt?: string | null): boolean {
  if (!prompt) return false;
  const p = prompt.trim();
  return p.length >= 20 && !/^[\w\-–—\s#]+$/.test(p);
}

export function buildGenerateUrl({
  type = 'video',
  prompt,
  model,
  showcaseId,
  promptSlug,
}: {
  type?: 'video' | 'image';
  prompt?: string | null;
  model?: string | null;
  showcaseId?: string | null;   // Showcase 模式：带 showcase id
  promptSlug?: string | null;   // Prompt 模式：带 prompt slug → /[model]/[slug]
}): string {
  const cleanModel = model?.trim() || null;

  // Prompt 模式：/[model]/[prompt-slug]
  if (promptSlug && cleanModel) {
    return `/${cleanModel}/${promptSlug}`;
  }

  // Image generator
  if (type === 'image') {
    // Prompt 模式：/image-[model]/[prompt-slug]
    if (promptSlug && cleanModel) {
      return `/image-${cleanModel}/${promptSlug}`;
    }
    const base = cleanModel ? `/ai-image-generator/${cleanModel}` : '/ai-image-generator';
    const params = new URLSearchParams();
    if (showcaseId) {
      params.set('showcase', showcaseId);
    } else if (isValidPrompt(prompt)) {
      params.set('prompt', prompt!.trim());
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  }

  // Video generator
  const base = cleanModel ? `/ai-video-generator/${cleanModel}` : '/ai-video-generator';
  const params = new URLSearchParams();

  if (showcaseId) {
    params.set('showcase', showcaseId);
  } else if (isValidPrompt(prompt)) {
    params.set('prompt', prompt!.trim());
  }

  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}
