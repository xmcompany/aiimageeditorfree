import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/core/auth';
import { getAllConfigs } from '@/shared/models/config';
import { getModelConfig } from '@/config/model-config';
import {
  completeVideoGeneration,
  getVideo,
  updateVideoRecord,
  VideoStatus,
} from '@/shared/services/video';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as { videoId?: string };
    const { videoId } = body;

    if (!videoId) {
      return NextResponse.json({ error: 'Missing video ID' }, { status: 400 });
    }

    const auth = await getAuth();
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const result = await getVideo(videoId);

    if (!result.success || !result.data) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 });
    }

    if (result.data.userId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    let videoData = result.data;
    let failReason: string | undefined;

    // If video is still generating and has a kie task ID, actively query kie for status
    if (
      (videoData.status === VideoStatus.Generating || videoData.status === VideoStatus.PENDING) &&
      videoData.replicatePredictionId
    ) {
      const modelConfig = getModelConfig(videoData.model);
      const isKieModel = modelConfig?.provider === 'kie';

      if (isKieModel) {
        try {
          const configs = await getAllConfigs();
          const kieApiKey = configs.kie_api_key;

          if (kieApiKey) {
            const kieBaseUrl = 'https://api.kie.ai/api/v1';
            const kieHeaders = {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${kieApiKey}`,
            };

            const taskId = videoData.replicatePredictionId;
            const isVeoModel = videoData.model?.includes('veo');
            const isVeo = taskId.startsWith('veo-') || isVeoModel;
            const actualTaskId = taskId.startsWith('veo-') ? taskId.replace('veo-', '') : taskId;

            if (isVeo) {
              // Query Veo task status
              const resp = await fetch(
                `${kieBaseUrl}/veo/record-info?taskId=${actualTaskId}`,
                { headers: kieHeaders }
              );

              if (resp.ok) {
                const veoPollResult: any = await resp.json();

                if (veoPollResult.code === 200 && veoPollResult.data) {
                  const successFlag = veoPollResult.data.successFlag;

                  if (successFlag === 1 && veoPollResult.data.videoUrl) {
                    // Success — get best quality URL
                    let videoUrl = veoPollResult.data.videoUrl;
                    const requestedResolution =
                      typeof videoData.parameters === 'string'
                        ? JSON.parse(videoData.parameters)?.resolution
                        : (videoData.parameters as any)?.resolution;

                    try {
                      if (requestedResolution === '1080p' || requestedResolution === '4K') {
                        const hdResp = await fetch(
                          `${kieBaseUrl}/veo/get-1080p-video?taskId=${actualTaskId}`,
                          { headers: kieHeaders }
                        );
                        if (hdResp.ok) {
                          const hdResult: any = await hdResp.json();
                          if (hdResult.code === 200 && hdResult.data?.videoUrl) {
                            videoUrl = hdResult.data.videoUrl;
                          }
                        }
                      }
                      if (requestedResolution === '4K') {
                        const uhdResp = await fetch(
                          `${kieBaseUrl}/veo/get-4k-video?taskId=${actualTaskId}`,
                          { headers: kieHeaders }
                        );
                        if (uhdResp.ok) {
                          const uhdResult: any = await uhdResp.json();
                          if (uhdResult.code === 200 && uhdResult.data?.videoUrl) {
                            videoUrl = uhdResult.data.videoUrl;
                          }
                        }
                      }
                    } catch {
                      // Fall back to standard quality
                    }

                    // Complete the video generation (upload to R2, extract thumbnail)
                    const storageDomain = configs.r2_domain;
                    const completionResult = await completeVideoGeneration(
                      videoId,
                      videoUrl,
                      undefined,
                      storageDomain
                    );

                    // Refresh video data
                    const refreshed = await getVideo(videoId);
                    if (refreshed.success && refreshed.data) {
                      videoData = refreshed.data;
                    }
                  } else if (successFlag === 2 || successFlag === 3) {
                    // Failed — capture error reason from kie
                    const kieFailMsg = veoPollResult.data?.failMsg || veoPollResult.data?.errorMsg || veoPollResult.data?.message;
                    failReason = kieFailMsg || 'Generation failed';
                    await updateVideoRecord(videoId, { status: VideoStatus.Failed });
                    videoData = { ...videoData, status: VideoStatus.Failed };
                  }
                  // successFlag === 0 means still processing, keep as generating
                }
              }
            } else {
              // Query Market API task status
              const resp = await fetch(
                `${kieBaseUrl}/jobs/recordInfo?taskId=${actualTaskId}`,
                { headers: kieHeaders }
              );

              if (resp.ok) {
                const kiePollResult: any = await resp.json();

                if (kiePollResult.code === 200 && kiePollResult.data) {
                  const state = kiePollResult.data.state;

                  if (state === 'success' && kiePollResult.data.resultJson) {
                    const resultJson = JSON.parse(kiePollResult.data.resultJson);
                    const videoUrl = resultJson.resultUrls?.[0];

                    if (videoUrl) {
                      const storageDomain = configs.r2_domain;
                      await completeVideoGeneration(
                        videoId,
                        videoUrl,
                        undefined,
                        storageDomain
                      );

                      const refreshed = await getVideo(videoId);
                      if (refreshed.success && refreshed.data) {
                        videoData = refreshed.data;
                      }
                    }
                  } else if (state === 'fail') {
                    const kieFailMsg = kiePollResult.data?.failMsg || kiePollResult.data?.errorMsg || kiePollResult.data?.message;
                    failReason = kieFailMsg || 'Generation failed';
                    await updateVideoRecord(videoId, { status: VideoStatus.Failed });
                    videoData = { ...videoData, status: VideoStatus.Failed };
                  }
                  // Other states (processing, pending) keep as generating
                }
              }
            }
          }
        } catch (kieError) {
          // Don't fail the status check if kie query fails — just return current DB status
          console.error('[Video Status] Kie query error:', kieError);
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: videoData.id,
        status: videoData.status,
        videoUrl: videoData.videoUrl,
        originalVideoUrl: videoData.originalVideoUrl,
        thumbnailUrl: videoData.firstFrameImageUrl,
        startImageUrl: videoData.startImageUrl,
        prompt: videoData.prompt,
        model: videoData.model,
        parameters: videoData.parameters,
        createdAt: videoData.createdAt,
        completedAt: videoData.completedAt,
        generationTime: videoData.generationTime,
        replicatePredictionId: videoData.replicatePredictionId,
        ...(failReason && { failReason }),
      },
    });
  } catch (error) {
    console.error('Video status API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
