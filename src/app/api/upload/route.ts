import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { getStorageService } from '@/shared/services/storage';
import { moderateContent } from '@/shared/lib/content-moderation';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: 'File too large' }, { status: 400 });
    }

    const storageService = await getStorageService();

    const now = new Date();
    const dateFolder = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const key = `${dateFolder}/${timestamp}-${randomStr}.${ext}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const result = await storageService.uploadFile({
      body: buffer,
      key,
      contentType: file.type,
      disposition: 'inline',
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Upload failed' },
        { status: 500 }
      );
    }

    // content moderation: check uploaded image via OpenAI
    if (result.url && file.type.startsWith('image/')) {
      const moderationResult = await moderateContent({ imageUrl: result.url });
      if (moderationResult.flagged) {
        return NextResponse.json(
          { error: 'Content violation detected' },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      url: result.url,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
}
