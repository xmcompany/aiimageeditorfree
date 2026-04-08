import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import {
  getVideoByIdIncludeDeleted,
  updateVideo,
} from '@/shared/models/video';

export async function POST(request: NextRequest) {
  try {
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Video ID is required' }, { status: 400 });
    }

    const video = await getVideoByIdIncludeDeleted(id);
    if (!video) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (video.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    if (video.isDeleted === 1) {
      return NextResponse.json({ error: 'Video is already deleted' }, { status: 400 });
    }

    const result = await updateVideo(id, {
      isDeleted: 1,
      updatedAt: new Date(),
    });

    if (!result) {
      return NextResponse.json({ error: 'Failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: { id, message: 'Deleted' } });
  } catch (error) {
    console.error('Delete video error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
