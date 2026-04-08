import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { getUserVideosWithCount } from '@/shared/services/video';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to view your videos' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();
    const page = body.page || 1;
    const limit = body.limit || 8;
    const offset = (page - 1) * limit;

    const result = await getUserVideosWithCount(userId, limit, offset);

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to load videos' }, { status: 500 });
    }

    const videos = (result.data || []).map((video) => ({
      id: video.id,
      prompt: video.prompt,
      model: video.model,
      parameters: video.parameters,
      videoUrl: video.videoUrl || video.originalVideoUrl || undefined,
      thumbnailUrl: video.firstFrameImageUrl || undefined,
      status: video.status,
      createdAt: video.createdAt,
    }));

    const totalCount = result.totalCount || 0;
    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true, // Use success: true to match frontend expected result.success
      code: 0,
      message: 'success',
      data: {
        videos,
        totalCount,
        currentPage: page,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    console.error('Error in /api/video/my-videos:', error);
    return NextResponse.json({ success: false, code: 1, message: 'Internal server error', error: 'Internal server error' }, { status: 500 });
  }
}
