import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 下载视频到本地
 */
export async function downloadVideo(
  videoName: string,
  videoUrl: string,
  extension: string = 'mp4'
): Promise<void> {
  try {
    const response = await fetch(videoUrl);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${videoName}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Failed to download video:', error);
    throw new Error(`Failed to download video: ${videoName}`);
  }
}

/**
 * 分享视频
 */
export async function shareVideo(
  title: string,
  text: string,
  videoUrl: string
): Promise<void> {
  try {
    if (navigator.share) {
      await navigator.share({
        title,
        text,
        url: videoUrl,
      });
    } else {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(videoUrl);
        alert('Video URL copied to clipboard!');
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = videoUrl;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          alert('Video URL copied to clipboard!');
        } catch (err) {
          console.error('Failed to copy URL:', err);
          throw new Error('Failed to share video');
        } finally {
          document.body.removeChild(textArea);
        }
      }
    }
  } catch (error) {
    console.error('Failed to share video:', error);
    throw new Error(`Failed to share video: ${title}`);
  }
}

/**
 * 处理提示词点击事件，将提示词填充到hero-input中并滚动到该位置
 * @param prompt 要填充的提示词
 * @param onPromptClick 可选的回调函数
 */
export function handlePromptClick(
  prompt: string,
  onPromptClick?: (prompt: string) => void
): void {
  if (!prompt) return;

  if (onPromptClick) {
    onPromptClick(prompt);
  } else {
    // Fallback: directly manipulate DOM
    const heroInput = document.getElementById('hero-input');
    const textarea = heroInput?.querySelector('textarea');

    if (textarea) {
      // Set the value
      textarea.value = prompt;

      // Trigger input event to update React state
      const event = new Event('input', { bubbles: true });
      textarea.dispatchEvent(event);

      // Trigger change event as well
      const changeEvent = new Event('change', { bubbles: true });
      textarea.dispatchEvent(changeEvent);
    }
  }

  // Scroll to hero-input
  const heroInputElement = document.getElementById('hero-input');
  if (heroInputElement) {
    heroInputElement.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
    });
  }
}
