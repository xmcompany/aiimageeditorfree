import { NextRequest, NextResponse } from 'next/server';

import { getSignUser } from '@/shared/models/user';
import { toggleAITaskShowInGallery } from '@/shared/models/ai_task';
import { toggleVideoShowInGallery } from '@/shared/models/video';

export async function POST(req: NextRequest) {
  try {
    const user = await getSignUser();
    if (!user) {
      return NextResponse.json({ code: 401, message: 'Not authenticated' }, { status: 401 });
    }

    const { id, type, show }: { id: string; type: string; show: boolean } = await req.json();
    if (!id || !type) {
      return NextResponse.json({ code: 400, message: 'Missing id or type' }, { status: 400 });
    }

    let result;
    if (type === 'image') {
      result = await toggleAITaskShowInGallery(id, !!show);
    } else if (type === 'video') {
      result = await toggleVideoShowInGallery(id, !!show);
    } else {
      return NextResponse.json({ code: 400, message: 'Invalid type' }, { status: 400 });
    }

    if (result.success) {
      return NextResponse.json({ code: 0, message: result.message });
    } else {
      return NextResponse.json({ code: 1, message: result.message }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Showcase toggle error:', error);
    return NextResponse.json(
      { code: 500, message: error.message || 'Internal error' },
      { status: 500 }
    );
  }
}
