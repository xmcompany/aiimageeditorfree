import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/core/db';
import { prompt } from '@/config/db/schema';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { AIMediaType } from '@/extensions/ai';
import { envConfigs } from '@/config';
import { PERMISSIONS } from '@/core/rbac';
import { hasPermission } from '@/shared/services/rbac';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getUuid } from '@/shared/lib/hash';
import { getModelConfig } from '@/config/model-config';

/**
 * Admin API: Generate image or video for a prompt using AI
 * Only accessible by admins (AITASKS_WRITE permission)
 * costCredits = 0 (admin free generation)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getUserInfo();
    if (!user) {
      return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
    }

    // Admin permission check
    const allowed = await hasPermission(user.id, PERMISSIONS.AITASKS_WRITE);
    if (!allowed) {
      return NextResponse.json({ code: 403, message: 'Permission denied' }, { status: 403 });
    }

    const { promptId, model, provider, mediaType } = await request.json();

    if (!promptId) {
      return NextResponse.json({ code: 400, message: 'promptId is required' }, { status: 400 });
    }

    if (!mediaType || !['image', 'video'].includes(mediaType)) {
      return NextResponse.json({ code: 400, message: 'mediaType must be image or video' }, { status: 400 });
    }

    // Get prompt data
    const result = await db().select().from(prompt).where(eq(prompt.id, promptId)).limit(1);
    if (!result || result.length === 0) {
      return NextResponse.json({ code: 404, message: 'Prompt not found' }, { status: 404 });
    }

    const promptData = result[0];
    if (!promptData.promptDescription) {
      return NextResponse.json({ code: 400, message: 'Prompt has no description' }, { status: 400 });
    }

    const aiService = await getAIService();

    // Determine model and provider based on mediaType
    let useModelId: string;
    let useModelName: string;
    let useProvider: string;

    if (mediaType === 'image') {
      // Image models: model param is already the API model name (e.g. 'nano-banana-2')
      useModelId = model || 'nano-banana-2';
      useModelName = useModelId;
      useProvider = provider || 'kie';
    } else {
      // Video models: model param is the config id (e.g. 'veo_3_1_lite')
      // Need to resolve to the actual API modelName
      useModelId = model || 'veo_3_1_lite';
      const modelConfig = getModelConfig(useModelId);
      if (!modelConfig) {
        return NextResponse.json({ code: 400, message: `Unknown video model: ${useModelId}` }, { status: 400 });
      }
      useModelName = modelConfig.modelName;
      useProvider = provider || modelConfig.provider;
    }

    const aiProvider = aiService.getProvider(useProvider);
    if (!aiProvider) {
      return NextResponse.json({ code: 400, message: 'AI provider not available' }, { status: 400 });
    }

    const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${useProvider}`;

    let generateOptions: Record<string, any>;
    let scene: string;

    if (mediaType === 'image') {
      generateOptions = {
        aspect_ratio: '1:1',
        resolution: '1K',
        output_format: 'png',
      };
      scene = 'text-to-image';
    } else {
      // video: use the model's actual modelName for the API call
      // For video models, we pass the model id and let the provider resolve it
      generateOptions = {
        aspect_ratio: '16:9',
        resolution: '720p',
      };
      scene = 'text-to-video';
    }

    const generateResult = await aiProvider.generate({
      params: {
        mediaType: mediaType === 'image' ? AIMediaType.IMAGE : AIMediaType.VIDEO,
        model: useModelName,
        prompt: promptData.promptDescription,
        callbackUrl,
        options: generateOptions,
      },
    });

    if (!generateResult?.taskId) {
      return NextResponse.json({ code: 500, message: 'Failed to create generation task' }, { status: 500 });
    }

    // Save to ai_task with costCredits = 0 (admin free)
    // Store the config model id (useModelId) so it's human-readable in the admin UI
    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType: mediaType === 'image' ? AIMediaType.IMAGE : AIMediaType.VIDEO,
      provider: useProvider,
      model: useModelId,
      prompt: promptData.promptDescription,
      scene,
      options: JSON.stringify({
        ...generateOptions,
        source: 'admin',
        promptId,
      }),
      status: generateResult.taskStatus,
      costCredits: 0,
      taskId: generateResult.taskId,
      taskInfo: generateResult.taskInfo ? JSON.stringify(generateResult.taskInfo) : null,
      taskResult: generateResult.taskResult ? JSON.stringify(generateResult.taskResult) : null,
    };
    await createAITask(newAITask);

    return NextResponse.json({
      code: 0,
      message: 'Generation task created',
      data: {
        taskId: generateResult.taskId,
        promptId,
        model: useModelId,
        provider: useProvider,
        mediaType,
      },
    });
  } catch (error: any) {
    console.error('Generate media for prompt error:', error);
    return NextResponse.json({ code: 500, message: error.message }, { status: 500 });
  }
}
