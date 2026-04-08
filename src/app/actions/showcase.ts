
'use server';

import { getUuid } from '@/shared/lib/hash';
import { addShowcase, deleteShowcase, NewShowcase } from '@/shared/models/showcase';
import { getVideoByIdIncludeDeleted } from '@/shared/models/video';
import { findAITaskById } from '@/shared/models/ai_task';
import { getSignUser } from '@/shared/models/user';
import { revalidatePath } from 'next/cache';

export async function setAsShowcaseAction(id: string, type: 'video' | 'image') {
  try {
    const user = await getSignUser();
    if (!user) throw new Error('Not authenticated');

    let newShowcase: NewShowcase | null = null;

    if (type === 'video') {
      const video = await getVideoByIdIncludeDeleted(id);
      if (!video) throw new Error('Video not found');

      newShowcase = {
        id: getUuid(),
        userId: user.id,
        title: video.prompt,
        prompt: video.prompt,
        image: video.firstFrameImageUrl || video.startImageUrl || '',
        videoUrl: video.videoUrl,
        type: 'video',
      };
    } else {
      const task = await findAITaskById(id);
      if (!task) throw new Error('Task not found');

      // Parse taskResult to get image URL
      let imageUrl = '';
      try {
        const result = JSON.parse(task.taskResult || '{}');
        imageUrl = result.url || (result.images && result.images[0]) || '';
      } catch (e) {
        console.error('Failed to parse taskResult', e);
      }

      newShowcase = {
        id: getUuid(),
        userId: user.id,
        title: task.prompt,
        prompt: task.prompt,
        image: imageUrl,
        type: 'image',
      };
    }

    if (newShowcase) {
      const result = await addShowcase(newShowcase);
      if (result) {
        revalidatePath('/admin/video-showcases');
        revalidatePath('/admin/image-showcases');
        revalidatePath('/showcases');
        return { success: true, message: 'Added to showcases' };
      }
    }

    return { success: false, message: 'Failed to add to showcases' };
  } catch (error: any) {
    console.error('setAsShowcaseAction error:', error);
    return { success: false, message: error.message || 'Error occurred' };
  }
}

export async function deleteShowcaseAction(id: string) {
  try {
    const user = await getSignUser();
    if (!user) throw new Error('Not authenticated');

    const result = await deleteShowcase(id);
    if (result) {
      revalidatePath('/admin/image-showcases');
      revalidatePath('/admin/video-showcases');
      revalidatePath('/showcases');
      return { success: true, message: 'Deleted showcase' };
    }

    return { success: false, message: 'Failed to delete' };
  } catch (error: any) {
    console.error('deleteShowcaseAction error:', error);
    return { success: false, message: error.message || 'Error occurred' };
  }
}
