import { headers } from 'next/headers';
import { getTranslations } from 'next-intl/server';
import { md5 } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { getAuth } from '@/core/auth';
import { getStorageService } from '@/shared/services/storage';

const extFromMime = (mimeType: string) => {
  const map: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/svg+xml': 'svg',
    'image/avif': 'avif',
    'image/heic': 'heic',
    'image/heif': 'heif',
  };
  return map[mimeType] || '';
};

export async function POST(req: Request) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return respErr('Unauthorized');
    }

    const formData = await req.formData();
    const locale = (formData.get('locale') as string) || 'en';
    const t = await getTranslations({ locale, namespace: 'common' });

    const files = formData.getAll('files') as File[];

    console.log('[API] Received files:', files.length);

    if (!files || files.length === 0) {
      return respErr(t('messages.invalid_params'));
    }

    const storageService = await getStorageService();
    const uploadResults = [];

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    for (const file of files) {
      if (file.size > MAX_FILE_SIZE) {
        return respErr('File too large, max 10MB');
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        return respErr(t('messages.invalid_params'));
      }

      // Convert file to buffer
      const arrayBuffer = await file.arrayBuffer();
      const body = new Uint8Array(arrayBuffer);

      const digest = md5(body);
      const ext = extFromMime(file.type) || file.name.split('.').pop() || 'bin';
      const key = `${digest}.${ext}`;

      // If the same image already exists, reuse its URL to save storage space.
      const exists = await storageService.exists({ key });
      if (exists) {
        const publicUrl = storageService.getPublicUrl({ key });
        if (publicUrl) {
          uploadResults.push({
            url: publicUrl,
            key,
            filename: file.name,
            deduped: true,
          });
          continue;
        }
      }

      // Upload to storage
      const result = await storageService.uploadFile({
        body,
        key: key,
        contentType: file.type,
        disposition: 'inline',
      });

      if (!result.success) {
        console.error('[API] Upload failed:', result.error);
        return respErr(t('messages.failed'));
      }

      uploadResults.push({
        url: result.url,
        key: result.key,
        filename: file.name,
        deduped: false,
      });
    }

    return respData({
      urls: uploadResults.map((r) => r.url),
      results: uploadResults,
    });
  } catch (e) {
    console.error('upload image failed:', e);
    // Use default 'en' if we can't get t here
    return respErr('Upload failed');
  }
}
