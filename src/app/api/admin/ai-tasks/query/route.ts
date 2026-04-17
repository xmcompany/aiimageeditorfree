import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';
import { getUserInfo } from '@/shared/models/user';
import { hasPermission } from '@/shared/services/rbac';
import { PERMISSIONS } from '@/core/rbac';
import { findAITaskById, updateAITaskById, UpdateAITask } from '@/shared/models/ai_task';
import { getAIService } from '@/shared/services/ai';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';

/**
 * Admin-only AI task query endpoint.
 * Unlike /api/ai/query, this does NOT check task.userId === user.id,
 * allowing admins to poll any task (including admin-generated ones).
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
    }

    const allowed = await hasPermission(user.id, PERMISSIONS.AITASKS_WRITE);
    if (!allowed) {
      return NextResponse.json({ code: 403, message: 'Permission denied' }, { status: 403 });
    }

    const { taskId } = await req.json();
    if (!taskId) {
      return NextResponse.json({ code: 400, message: 'taskId is required' }, { status: 400 });
    }

    const task = await findAITaskById(taskId);
    if (!task || !task.taskId) {
      return NextResponse.json({ code: 404, message: 'Task not found' }, { status: 404 });
    }

    const aiService = await getAIService();
    const aiProvider = aiService.getProvider(task.provider);
    if (!aiProvider) {
      return NextResponse.json({ code: 400, message: 'AI provider not available' }, { status: 400 });
    }

    const result = await aiProvider.query?.({
      taskId: task.taskId,
      mediaType: task.mediaType as any,
      model: task.model,
    });

    if (!result?.taskStatus) {
      return NextResponse.json({ code: 500, message: 'Query failed' }, { status: 500 });
    }

    const updateData: UpdateAITask = {
      status: result.taskStatus,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };

    // Only write if something changed
    if (updateData.taskInfo !== task.taskInfo || updateData.status !== task.status) {
      await updateAITaskById(task.id, updateData);
    }

    // ── Auto-update prompt image/video when admin generation completes ────────
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
        console.error('[admin-generate] Failed to update prompt media:', e);
      }
    }
    // ─────────────────────────────────────────────────────────────────────────

    return NextResponse.json({
      code: 0,
      data: {
        ...task,
        status: updateData.status,
        taskInfo: updateData.taskInfo,
        taskResult: updateData.taskResult,
      },
    });
  } catch (error: any) {
    console.error('Admin AI task query error:', error);
    return NextResponse.json({ code: 500, message: error.message }, { status: 500 });
  }
}
