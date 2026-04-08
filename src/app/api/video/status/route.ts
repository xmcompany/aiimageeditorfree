import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { getVideo } from '@/shared/services/video';

export async function POST(request: NextRequest) {
  try {
    const { videoId } = await request.json();

    if (!videoId) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const result = await getVideo(videoId);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (result.data.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: result.data.id,
        status: result.data.status,
        videoUrl: result.data.videoUrl,
        originalVideoUrl: result.data.originalVideoUrl,
        thumbnailUrl: result.data.firstFrameImageUrl,
        startImageUrl: result.data.startImageUrl,
        prompt: result.data.prompt,
        model: result.data.model,
        parameters: result.data.parameters,
        createdAt: result.data.createdAt,
        completedAt: result.data.completedAt,
        generationTime: result.data.generationTime,
        replicatePredictionId: result.data.replicatePredictionId,
      },
    });
  } catch (error) {
    console.error('Video status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
