import { eq } from 'drizzle-orm';
import { getTranslations } from 'next-intl/server';
import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { respData, respErr } from '@/shared/lib/resp';
import {
  findAITaskById,
  UpdateAITask,
  updateAITaskById,
} from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    const { taskId } = body;
    if (!taskId) {
      return respErr(t('messages.invalid_params'));
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    const task = await findAITaskById(taskId);
    if (!task || !task.taskId) {
      return respErr(t('messages.not_found'));
    }

    if (task.userId !== user.id) {
      return respErr(t('messages.no_permission'));
    }

    const aiService = await getAIService();
    // 'nanobanana-joyflix-video' was a legacy incorrect provider name, map it to 'kie'
    const providerName = task.provider === 'nanobanana-joyflix-video' ? 'kie' : task.provider;
    const aiProvider = aiService.getProvider(providerName);
    if (!aiProvider) {
      return respErr(t('messages.invalid_ai_provider', { defaultValue: 'invalid ai provider' }));
    }

    const result = await aiProvider?.query?.({
      taskId: task.taskId,
      mediaType: task.mediaType,
      model: task.model,
    });

    if (!result?.taskStatus) {
      return respErr(t('messages.failed'));
    }

    // update ai task
    const updateAITask: UpdateAITask = {
      status: result.taskStatus,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
      creditId: task.creditId, // credit consumption record id
    };
    if (updateAITask.taskInfo !== task.taskInfo) {
      await updateAITaskById(task.id, updateAITask);
    }

    // ── Auto-update prompt image/video when admin generation completes ────────
    // Only run when the task just transitioned to SUCCESS (taskInfo changed)
    const justCompleted =
      result.taskStatus === AITaskStatus.SUCCESS &&
      task.status !== AITaskStatus.SUCCESS;

    if (justCompleted && task.options) {
      try {
        const opts = JSON.parse(task.options);
        if (opts.source === 'admin' && opts.promptId) {
          const taskInfo = result.taskInfo;
          let mediaUrl: string | undefined;

          if (task.mediaType === AIMediaType.IMAGE) {
            mediaUrl = taskInfo?.images?.[0]?.imageUrl;
          } else if (task.mediaType === AIMediaType.VIDEO) {
            mediaUrl = taskInfo?.videos?.[0]?.videoUrl;
          }

          if (mediaUrl) {
            await db()
              .update(prompt)
              .set({ image: mediaUrl })
              .where(eq(prompt.id, opts.promptId));
            console.log(`[admin-generate] Updated prompt ${opts.promptId} ${task.mediaType} → ${mediaUrl}`);
          }
        }
      } catch (e) {
        // Non-fatal: log but don't fail the query response
        console.error('[admin-generate] Failed to update prompt media:', e);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    task.status = updateAITask.status || '';
    task.taskInfo = updateAITask.taskInfo || null;
    task.taskResult = updateAITask.taskResult || null;

    return respData(task);
  } catch (e: any) {
    console.log('ai query failed', e);
    return respErr(t('messages.failed'));
  }
}
