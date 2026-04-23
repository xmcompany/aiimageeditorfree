import { getTranslations } from 'next-intl/server';
import { envConfigs } from '@/config';
import { calculateImageCredits } from '@/config/model-config';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { getUuid } from '@/shared/lib/hash';
import { respData, respErr } from '@/shared/lib/resp';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';
import { createAITask, NewAITask } from '@/shared/models/ai_task';
import { getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';
import { getAIService } from '@/shared/services/ai';
import { getStorageService } from '@/shared/services/storage';
import { moderateContent } from '@/shared/lib/content-moderation';

export async function POST(request: Request) {
  // Rate limit: 1 generation request per 3 seconds per IP
  const limited = enforceMinIntervalRateLimit(request, {
    intervalMs: 3000,
    keyPrefix: 'ai-generate',
  });
  if (limited) {
    return Response.json(
      { code: 429, message: 'Too many requests, please try again later.' },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    let { provider, mediaType, model, prompt, options, scene } = body;

    const url = new URL(request.url);
    const debugMock = 
      process.env.NODE_ENV === 'development' && (
        (request.headers.get('x-debug-mock') === 'true') || 
        (url.searchParams.get('mock') === '1') ||
        (request.headers.get('referer')?.includes('mock=1'))
      );

    if (!provider || !mediaType || !model) {
      return respErr(t('messages.invalid_params'));
    }

    if (!prompt && !options) {
      return respErr(t('messages.invalid_params'));
    }

    const aiService = await getAIService();

    // check generate type
    if (!aiService.getMediaTypes().includes(mediaType)) {
      return respErr(t('messages.invalid_params'));
    }

    // check ai provider
    const aiProvider = aiService.getProvider(provider);
    if (!aiProvider) {
      return respErr(t('messages.invalid_params'));
    }

    // get current user
    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    // check if user is banned
    if ((user as any).banned) {
      return respErr(t('messages.user_banned'));
    }

    // todo: get cost credits from settings
    let costCredits = 4;

    if (mediaType === AIMediaType.IMAGE) {
      // Image pricing from model-config, based on resolution
      const resolution = options?.resolution || '1K';
      costCredits = calculateImageCredits(model, resolution);
    } else if (mediaType === AIMediaType.VIDEO) {
      // generate video
      if (scene === 'text-to-video') {
        costCredits = 6;
      } else if (scene === 'image-to-video') {
        costCredits = 8;
      } else if (scene === 'video-to-video') {
        costCredits = 10;
      } else {
        return respErr(t('messages.invalid_params'));
      }
    } else if (mediaType === AIMediaType.MUSIC) {
      // generate music
      costCredits = 10;
      scene = 'text-to-music';
    } else {
      return respErr(t('messages.invalid_params'));
    }

    // content moderation: keyword filter + OpenAI (before deducting credits)
    const imageUrl = options?.init_image || options?.image_url || options?.imageUrl;
    const moderationResult = await moderateContent({ text: prompt, imageUrl });
    if (moderationResult.flagged) {
      return respErr(t('messages.content_violation'));
    }

    // check credits
    const remainingCredits = await getRemainingCredits(user.id);
    if (remainingCredits < costCredits) {
      return respErr(t('messages.failed', { defaultValue: 'insufficient credits' }));
    }

    // generate content
    let result: any;
    if (debugMock) {
      console.log('Using mock generation for mediaType:', mediaType);
      const mockUrl = mediaType === AIMediaType.VIDEO 
        ? envConfigs.mock_video_url
        : envConfigs.mock_image_url;
      
      let finalUrl = mockUrl;
      try {
        console.log('[Mock] Starting R2 upload flow for mock content:', mockUrl);
        const storageService = await getStorageService();
        const timestamp = Date.now();
        const ext = mediaType === AIMediaType.VIDEO ? 'mp4' : 'jpg';
        // Use a more standard key format similar to api/upload
        const dateFolder = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`;
        const key = `uploads/${dateFolder}/mock_${getUuid().substring(0, 8)}_${timestamp}.${ext}`;
        
        console.log('[Mock] Target R2 key:', key);

        const uploadResult = await storageService.downloadAndUpload({
          url: mockUrl,
          key,
          contentType: mediaType === AIMediaType.VIDEO ? 'video/mp4' : 'image/jpeg',
          disposition: 'inline',
        });

        if (uploadResult.success && uploadResult.url) {
          finalUrl = uploadResult.url;
          console.log('[Mock] Successfully uploaded to R2:', finalUrl);
        } else {
          console.error('[Mock] R2 Upload failed:', uploadResult.error);
        }
      } catch (uploadErr) {
        console.error('[Mock] Fatal error during R2 upload:', uploadErr);
      }

      result = {
        taskId: `mock-${getUuid()}`,
        taskStatus: AITaskStatus.SUCCESS,
        taskInfo: { output: finalUrl }
      };
    } else {
      const callbackUrl = `${envConfigs.app_url}/api/ai/notify/${provider}`;

      const params: any = {
        mediaType,
        model,
        prompt,
        callbackUrl,
        options,
      };

      result = await aiProvider.generate({ params });
    }

    if (!result?.taskId) {
      return respErr(t('messages.failed'));
    }

    // create ai task
    const newAITask: NewAITask = {
      id: getUuid(),
      userId: user.id,
      mediaType,
      provider,
      model,
      prompt,
      scene,
      options: options ? JSON.stringify(options) : null,
      status: result.taskStatus,
      costCredits,
      taskId: result.taskId,
      taskInfo: result.taskInfo ? JSON.stringify(result.taskInfo) : null,
      taskResult: result.taskResult ? JSON.stringify(result.taskResult) : null,
    };
    await createAITask(newAITask);

    return respData(newAITask);
  } catch (e: any) {
    console.log('generate failed', e);
    return respErr(t('messages.failed'));
  }
}
