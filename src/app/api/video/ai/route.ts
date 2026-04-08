import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import {
  calculateModelCredits,
  getModelConfig,
} from '@/config/model-config';
import { envConfigs } from '@/config';
import { getAuth } from '@/core/auth';
import {
  consumeCredits,
  getRemainingCredits,
} from '@/shared/models/credit';
import { getAllConfigs } from '@/shared/models/config';
import {
  completeVideoGeneration,
  createVideo,
  getVideo,
  updateVideoRecord,
  uploadImageToR2,
  VideoStatus,
} from '@/shared/services/video';

interface VideoGenerationRequest {
  prompt: string;
  model: string;
  parameters: Record<string, any>;
  videoId?: string; // Optional existing video ID for regeneration
  startImage?: File;
}

interface ReplicateResponse {
  id: string;
  status: string;
  output?: any;
  error?: string;
  completed_at?: string;
  created_at: string;
  started_at?: string;
  logs?: string;
  metrics?: {
    predict_time: number;
    total_time: number;
  };
  urls: {
    get: string;
    cancel: string;
    stream?: string;
  };
}

// Sleep function for polling
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function POST(request: NextRequest) {
  try {
    // Authenticate user with Better-Auth
    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized: Please sign in to generate videos' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Parse request data
    let prompt: string;
    let model: string;
    let parameters: Record<string, any>;
    let videoId: string | undefined;
    let startImage: File | null = null;

    const contentType = request.headers.get('content-type');

    if (contentType?.includes('multipart/form-data')) {
      const formData = await request.formData();
      prompt = formData.get('prompt') as string;
      model = formData.get('model') as string;
      const parametersStr = formData.get('parameters') as string;
      parameters = parametersStr ? JSON.parse(parametersStr) : {};
      videoId = formData.get('videoId') as string | undefined;
      startImage = formData.get('startImage') as File | null;
    } else {
      const body: VideoGenerationRequest = await request.json();
      prompt = body.prompt;
      model = body.model;
      parameters = body.parameters || {};
      videoId = body.videoId;
    }

    if (!prompt || !model) {
      return NextResponse.json(
        { error: 'Missing required parameters: prompt and model' },
        { status: 400 }
      );
    }

    const modelConfig = getModelConfig(model);
    if (!modelConfig) {
      return NextResponse.json(
        { error: `Unsupported model: ${model}` },
        { status: 400 }
      );
    }

    if (!modelConfig.modelName) {
      return NextResponse.json(
        { error: `Model ${model} is not configured for API requests` },
        { status: 400 }
      );
    }

    // Get configs from DB/Env
    const configs = await getAllConfigs();
    const apiToken = configs.replicate_api_token;
    if (!apiToken) {
      return NextResponse.json(
        { error: 'replicate_api_token is not configured' },
        { status: 500 }
      );
    }

    // Detect mock mode
    const headerMock = request.headers.get('x-debug-mock');
    const queryMock = request.nextUrl.searchParams.get('mock');
    const referer = request.headers.get('referer');
    
    const debugMock = 
      (headerMock === 'true') || 
      (queryMock === '1') ||
      (referer?.includes('mock=1') || false);

    console.log('[Video API] Mock detection:', {
      debugMock,
      header: headerMock,
      query: queryMock,
      referer,
    });

    // Calculate required credits
    let requiredCredits = calculateModelCredits(model, parameters);
    
    // Check if user has enough credits
    const remainingCredits = await getRemainingCredits(userId);
    if (remainingCredits < requiredCredits) {
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          details: `You need ${requiredCredits} credits but only have ${remainingCredits} credits available`,
          required_credits: requiredCredits,
          available_credits: remainingCredits,
        },
        { status: 402 }
      );
    }

    // 1. Get or Create Video Record
    let videoDbId: string;

    if (videoId) {
      const existingVideo = await getVideo(videoId);
      if (existingVideo.success && existingVideo.data) {
        const currentStatus = existingVideo.data.status;

        if (currentStatus === 'generating' || currentStatus === 'uploading') {
          return NextResponse.json({
            success: true,
            data: {
              id: videoId,
              status: currentStatus,
              message: 'Video generation is already in progress',
              replicate_prediction_id: existingVideo.data.replicatePredictionId,
            },
          });
        }

        if (currentStatus === 'completed') {
          return NextResponse.json({
            success: true,
            data: {
              id: videoId,
              status: 'succeeded',
              videoUrl: existingVideo.data.videoUrl,
              originalVideoUrl: existingVideo.data.originalVideoUrl,
              completedAt: existingVideo.data.completedAt,
              generationTime: existingVideo.data.generationTime,
            },
          });
        }

        if (existingVideo.data.userId !== userId) {
          return NextResponse.json(
            { error: 'Access denied: You can only regenerate your own videos' },
            { status: 403 }
          );
        }
      }

      videoDbId = videoId;
      await updateVideoRecord(videoId, {
        status: VideoStatus.Generating,
      });
    } else {
      const videoResult = await createVideo({
        userId,
        prompt,
        model,
        parameters: {
          prompt,
          model,
          ...parameters,
        },
        creditsUsed: requiredCredits,
      });

      if (!videoResult.success || !videoResult.id) {
        return NextResponse.json(
          { error: 'Failed to create video record', details: videoResult.error },
          { status: 500 }
        );
      }
      videoDbId = videoResult.id;
    }

    // Handle Start Image Upload
    let startImageUrl: string | null = null;
    if (startImage) {
      const uploadResult = await uploadImageToR2(startImage, videoDbId);
      if (uploadResult.success && uploadResult.url) {
        startImageUrl = uploadResult.url;
        await updateVideoRecord(videoDbId, {
          startImageUrl: startImageUrl,
          firstFrameImageUrl: startImageUrl,
        });
      } else {
        return NextResponse.json(
          { error: 'Failed to upload start image: ' + uploadResult.error },
          { status: 500 }
        );
      }
    }

    // Prepare Replicate Request
    let inputData: any = {
      prompt,
      ...parameters,
      ...(startImageUrl && { startImageUrl }),
    };

    if (modelConfig.parseParams) {
      inputData = modelConfig.parseParams(inputData);
    }

    const requestData = {
      input: inputData,
    };

    const apiUrl = `https://api.replicate.com/v1/models/${modelConfig.modelName}/predictions`;

    let prediction: ReplicateResponse;

    if (debugMock) {
      console.time(`[Mock Video] ${videoDbId}`);
      console.log('Using mock video generation...');
      // Using a smaller sample video (approx 1MB) to speed up localhost testing
      const mockVideoUrl = envConfigs.mock_video_url;
      
      prediction = {
        id: `mock-${Date.now()}`,
        status: 'succeeded',
        output: mockVideoUrl,
        created_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
        metrics: {
          predict_time: 5,
          total_time: 5,
        },
        urls: {
          get: '',
          cancel: '',
        }
      };
    } else {
      // Start Prediction
      const startResponse = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      });

      if (!startResponse.ok) {
        const errorText = await startResponse.text();
        await updateVideoRecord(videoDbId, {
          status: VideoStatus.Failed,
        });
        return NextResponse.json(
          { error: 'Failed to start video generation', details: errorText },
          { status: startResponse.status }
        );
      }

      prediction = await startResponse.json();
    }

    await updateVideoRecord(videoDbId, {
      replicatePredictionId: prediction.id,
    });

    // 2. Polling for results
    if (!debugMock) {
      const maxPollingTime = 300000; // 5 mins
      const pollingInterval = 3000;
      const startTime = Date.now();

      while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled' &&
        Date.now() - startTime < maxPollingTime
      ) {
        await sleep(pollingInterval);
        const getResponse = await fetch(prediction.urls.get, {
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
        });

        if (!getResponse.ok) break;
        prediction = await getResponse.json();
      }

      if (Date.now() - startTime >= maxPollingTime) {
        await updateVideoRecord(videoDbId, { status: VideoStatus.Failed });
        return NextResponse.json({ error: 'Video generation timeout', id: videoDbId }, { status: 408 });
      }

      if (prediction.status === 'failed' || prediction.status === 'canceled') {
        await updateVideoRecord(videoDbId, { status: VideoStatus.Failed });
        return NextResponse.json({ error: `Video generation ${prediction.status}`, details: prediction.error, id: videoDbId }, { status: 500 });
      }
    }

    // 3. Complete Workflow
    const generationTime = prediction.metrics?.predict_time
      ? Math.round(prediction.metrics.predict_time)
      : undefined;

    // Handle array or string output from Replicate
    let videoUrl = '';
    if (Array.isArray(prediction.output)) {
      videoUrl = prediction.output[0];
    } else if (typeof prediction.output === 'string') {
      videoUrl = prediction.output;
    }

    if (!videoUrl) {
      await updateVideoRecord(videoDbId, { status: VideoStatus.Failed });
      return NextResponse.json(
        { error: 'No video URL returned from the model' },
        { status: 500 }
      );
    }

    let completionResult: any = {};

    if (debugMock) {
      // For mock, skip R2 upload and directly mark as completed
      await updateVideoRecord(videoDbId, {
        status: VideoStatus.Completed,
        videoUrl: videoUrl,
        originalVideoUrl: videoUrl,
        generationTime: generationTime,
        completedAt: new Date(),
      });
      completionResult = {
        success: true,
        videoUrl: videoUrl,
        firstFrameImageUrl: undefined, // Or could set a mock thumbnail
      };
    } else {
      const storageDomain = configs.r2_domain;
      completionResult = await completeVideoGeneration(
        videoDbId,
        videoUrl,
        generationTime,
        storageDomain
      );
    }

    // Credits are now handled by createAITask inside createVideo

    if (!completionResult.success) {
      return NextResponse.json({
        success: true,
        data: {
          id: videoDbId,
          status: 'completed',
          videoUrl: prediction.output,
          completedAt: prediction.completed_at,
          generationTime: generationTime,
          upload_error: completionResult.error,
        },
      });
    }

    if (debugMock) {
      console.timeEnd(`[Mock Video] ${videoDbId}`);
    }

    return NextResponse.json({
      success: true,
      data: {
        id: videoDbId,
        status: prediction.status,
        videoUrl: completionResult.videoUrl,
        thumbnailUrl: completionResult.firstFrameImageUrl,
        output: completionResult.videoUrl || videoUrl, // Compatibility for frontend
        originalVideoUrl: prediction.output,
        completedAt: prediction.completed_at,
        generationTime: generationTime,
      },
    });

  } catch (error) {
    console.error('Video generation API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const predictionId = searchParams.get('id');

  if (!predictionId) {
    return NextResponse.json({ error: 'Missing prediction ID' }, { status: 400 });
  }

  const configs = await getAllConfigs();
  const apiToken = configs.replicate_api_token;
  if (!apiToken) {
    return NextResponse.json({ error: 'replicate_api_token is not configured' }, { status: 500 });
  }

  try {
    const response = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      {
        headers: {
          Authorization: `Bearer ${apiToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      return NextResponse.json({ error: 'Failed to get prediction' }, { status: response.status });
    }

    const result = await response.json();
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
