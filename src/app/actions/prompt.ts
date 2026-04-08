
'use server';

import { deletePrompt } from '@/shared/models/prompt';
import { getSignUser } from '@/shared/models/user';
import { revalidatePath } from 'next/cache';

export async function deletePromptAction(id: string) {
  try {
    const user = await getSignUser();
    if (!user) throw new Error('Not authenticated');

    const result = await deletePrompt(id);
    if (result) {
      revalidatePath('/admin/image-prompts');
      revalidatePath('/admin/video-prompts');
      revalidatePath('/prompts');
      return { success: true, message: 'Deleted prompt' };
    }

    return { success: false, message: 'Failed to delete' };
  } catch (error: any) {
    console.error('deletePromptAction error:', error);
    return { success: false, message: error.message || 'Error occurred' };
  }
}
