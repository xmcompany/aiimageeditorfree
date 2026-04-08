import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import {
  createVideo,
  updateVideoRecord,
  uploadImageToR2,
  VideoStatus,
} from '@/shared/services/video';

interface VideoSaveRequest {
  prompt: string;
  model: string;
  parameters: Record<string, any>;
  startImage?: File;
}

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to save video parameters' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    let prompt: string;
    let model: string;
    let parameters: Record<string, any>;
    let startImage: File | null = null;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      prompt = formData.get('prompt') as string;
      model = formData.get('model') as string;
      const parametersStr = formData.get('parameters') as string;
      parameters = parametersStr ? JSON.parse(parametersStr) : {};
      startImage = formData.get('startImage') as File | null;
    } else {
      const body: VideoSaveRequest = await request.json();
      prompt = body.prompt;
      model = body.model;
      parameters = body.parameters || {};
    }

    if (!prompt || !model) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const result = await createVideo({
      userId,
      prompt: prompt.trim(),
      model,
      parameters,
      status: VideoStatus.PENDING,
    });

    if (!result.success || !result.id) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    const videoId = result.id;
    let startImageUrl: string | null = null;

    if (startImage) {
      const uploadResult = await uploadImageToR2(startImage, videoId);
      if (uploadResult.success && uploadResult.url) {
        startImageUrl = uploadResult.url;
        await updateVideoRecord(videoId, {
          startImageUrl: startImageUrl,
          firstFrameImageUrl: startImageUrl,
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: videoId,
        startImageUrl,
      },
    });
  } catch (error) {
    console.error('Error in /api/video/save:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
