import { nanoid } from 'nanoid';

import {
  getVideoById,
  getVideoCountByUserId,
  getVideosByUserId,
  insertVideo,
  updateVideo,
} from '@/shared/models/video';
import { getStorageService } from '@/shared/services/storage';
import { AIMediaType, AITaskStatus } from '@/extensions/ai';
import { createAITask, updateAITaskById } from '@/shared/models/ai_task';

export enum VideoStatus {
  PENDING = 'pending', // Waiting to start generation
  Generating = 'generating',
  Completed = 'completed',
  Failed = 'failed',
  Uploading = 'uploading', // When uploading to R2
}

export interface VideoGenerationParams {
  prompt?: string;
  model?: string;
  duration?: string;
  resolution?: string;
  batchSize?: number;
  [key: string]: any; // Allow additional parameters
}

export interface CreateVideoData {
  userId: string;
  prompt: string;
  model: string;
  parameters: VideoGenerationParams | string;
  status?: VideoStatus;
  creditsUsed?: number;
  replicatePredictionId?: string;
}

export interface UpdateVideoData {
  status?: VideoStatus;
  originalVideoUrl?: string;
  videoUrl?: string;
  startImageUrl?: string;
  firstFrameImageUrl?: string;
  fileSize?: number;
  generationTime?: number;
  completedAt?: Date;
  replicatePredictionId?: string;
}

/**
 * Create a new video record in database
 */
export async function createVideo(data: CreateVideoData) {
  const id = nanoid();
  const now = new Date();

  // Handle parameters - if it's already a string, use it; otherwise stringify it
  const parametersString =
    typeof data.parameters === 'string'
      ? data.parameters
      : JSON.stringify(data.parameters);

  // Parse parameters to get duration and resolution if they exist
  const parsedParams =
    typeof data.parameters === 'string'
      ? JSON.parse(data.parameters)
      : data.parameters;

  const videoData = {
    id,
    userId: data.userId,
    prompt: data.prompt,
    model: data.model,
    parameters: parametersString,
    status: data.status || VideoStatus.Generating,
    creditsUsed: data.creditsUsed || 0,
    duration: parsedParams.duration?.toString() || '',
    resolution: parsedParams.resolution || '',
    replicatePredictionId: data.replicatePredictionId || '',
    createdAt: now,
    updatedAt: now,
  };

  try {
    const result = await insertVideo(videoData);
    console.log('Video record created:', id);

    // Sync with ai_task table for history visibility in AI Tasks page
    await createAITask({
      id: id,
      userId: data.userId,
      mediaType: AIMediaType.VIDEO,
      provider: 'kie',
      model: data.model,
      prompt: data.prompt,
      scene: parsedParams?.startImageUrl ? 'image-to-video' : 'text-to-video',
      options: parametersString,
      status: AITaskStatus.PROCESSING,
      costCredits: data.creditsUsed || 0,
      taskId: data.replicatePredictionId || id,
    }).catch((err) => console.error('Failed to sync with ai_task:', err));

    return { success: true, id, data: result };
  } catch (error) {
    console.error('Failed to create video record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Update video record
 */
export async function updateVideoRecord(id: string, data: UpdateVideoData) {
  const updateData = {
    ...data,
    updatedAt: new Date(),
  };

  try {
    const result = await updateVideo(id, updateData);
    console.log('Video record updated:', id);

    // Sync with ai_task table
    const aiTaskData: any = {};
    if (data.status) {
      if (data.status === VideoStatus.Completed)
        aiTaskData.status = AITaskStatus.SUCCESS;
      else if (data.status === VideoStatus.Failed)
        aiTaskData.status = AITaskStatus.FAILED;
      else aiTaskData.status = AITaskStatus.PROCESSING;
    }

    if (data.videoUrl || data.firstFrameImageUrl) {
      const videoRecord = await getVideoById(id);
      if (videoRecord) {
        aiTaskData.taskInfo = JSON.stringify({
          videos: [
            {
              videoUrl: data.videoUrl || videoRecord.videoUrl || videoRecord.originalVideoUrl,
              thumbnailUrl:
                data.firstFrameImageUrl || videoRecord.firstFrameImageUrl,
            },
          ],
        });
      }
    }

    if (Object.keys(aiTaskData).length > 0) {
      await updateAITaskById(id, aiTaskData).catch((err) =>
        console.error('Failed to sync ai_task update:', err)
      );
    }

    return { success: true, data: result };
  } catch (error) {
    console.error('Failed to update video record:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Upload video to R2 storage
 */
// 重试函数
async function retryFetch(
  url: string,
  maxRetries: number = 3,
  delay: number = 2000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(
        `Attempting to download video (attempt ${attempt}/${maxRetries}):`,
        url
      );

      // 使用AbortController实现超时
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30秒超时

      try {
        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; VideoDownloader/1.0)',
          },
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return response;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          throw new Error('Download timeout after 30 seconds');
        }
        throw fetchError;
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Download attempt ${attempt} failed:`, lastError.message);

      if (attempt < maxRetries) {
        console.log(`Waiting ${delay}ms before retry...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay *= 1.5; // 指数退避
      }
    }
  }

  throw lastError || new Error('All download attempts failed');
}

/**
 * Calculate thumbnail dimensions based on common video aspect ratios
 */
function calculateThumbnailDimensions(targetSize: number = 240): {
  width: number;
  height: number;
} {
  // For now, use square dimensions as default
  // In the future, you could determine video aspect ratio and calculate accordingly
  // Common ratios: 16:9 (1.78), 4:3 (1.33), 1:1 (1.0), 9:16 (0.56)
  return {
    width: targetSize,
    height: targetSize,
  };
}

/**
 * Extract first frame from video and upload to R2
 * Uses CDN media processing to generate thumbnail from video
 */
export async function extractFirstFrameAndUpload(
  videoUrl: string,
  videoId: string,
  storageDomain?: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  fileSize?: number;
}> {
  try {
    console.log('Starting first frame extraction from video:', videoUrl);

    if (!storageDomain) {
      throw new Error('STORAGE_DOMAIN is not configured');
    }

    // Calculate thumbnail dimensions
    const { width, height } = calculateThumbnailDimensions(240);

    // Generate thumbnail URL using CDN media processing
    // Format: ${STORAGE_DOMAIN}/cdn-cgi/media/mode=frame,time=0s,width=240,height=240/${videoUrl}
    const thumbnailUrl = `${storageDomain}/cdn-cgi/media/mode=frame,time=0s,width=${width},height=${height}/${videoUrl}`;

    console.log('Generated thumbnail URL:', thumbnailUrl);
    console.log('Thumbnail dimensions:', { width, height });

    // Download the generated thumbnail
    const response = await retryFetch(thumbnailUrl, 3, 2000);

    if (!response.ok) {
      console.error('Thumbnail fetch failed:', {
        status: response.status,
        statusText: response.statusText,
        url: thumbnailUrl,
      });
      throw new Error(
        `Failed to fetch thumbnail: ${response.status} ${response.statusText}`
      );
    }

    console.log(
      'Thumbnail fetched successfully, size:',
      response.headers.get('content-length') || 'unknown'
    );

    const imageBlob = await response.blob();
    const imageBuffer = await imageBlob.arrayBuffer();

    // Generate filename for the thumbnail
    const timestamp = new Date().getTime();
    const filename = `first_frame_${videoId}_${timestamp}.jpg`;
    const key = `images/${filename}`;
    const body = Buffer.from(imageBuffer);

    // Upload thumbnail to R2
    const storage = await getStorageService();
    const uploadResult = await storage.uploadFile({
      body,
      key,
      contentType: 'image/jpeg',
    });

    if (uploadResult && uploadResult.url) {
      console.log(
        'First frame extracted and uploaded successfully to R2:',
        uploadResult.url
      );
      return {
        success: true,
        url: uploadResult.url,
        fileSize: imageBlob.size,
      };
    } else {
      throw new Error('Upload result is empty');
    }
  } catch (error) {
    console.error('Failed to extract first frame from video:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function uploadImageToR2(
  imageFile: File,
  videoId: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  fileSize?: number;
}> {
  try {
    console.log('Starting image upload to R2:', imageFile.name);

    // Validate image file
    if (!imageFile.type.startsWith('image/')) {
      throw new Error('File must be an image');
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (imageFile.size > maxSize) {
      throw new Error('Image file size must be less than 10MB');
    }

    // Convert file to buffer
    const imageBuffer = await imageFile.arrayBuffer();

    // Generate filename
    const timestamp = new Date().getTime();
    const fileExtension = imageFile.name.split('.').pop() || 'jpg';
    const filename = `start_image_${videoId}_${timestamp}.${fileExtension}`;
    const key = `images/${filename}`;
    const body = Buffer.from(imageBuffer);

    // Upload to R2
    const storage = await getStorageService();
    const uploadResult = await storage.uploadFile({
      body,
      key,
      contentType: imageFile.type,
    });

    if (uploadResult && uploadResult.url) {
      console.log('Image uploaded successfully to R2:', uploadResult.url);
      return {
        success: true,
        url: uploadResult.url,
        fileSize: imageFile.size,
      };
    } else {
      throw new Error('Upload result is empty');
    }
  } catch (error) {
    console.error('Failed to upload image to R2:', error);

    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      errorMessage = error.message;
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

export async function uploadVideoToR2(
  videoUrl: string,
  videoId: string
): Promise<{
  success: boolean;
  url?: string;
  error?: string;
  fileSize?: number;
}> {
  try {
    console.log('Starting video upload to R2:', videoUrl);

    // Download video from original URL with retry mechanism
    const response = await retryFetch(videoUrl, 3, 2000);

    const videoBuffer = await response.arrayBuffer();

    // Generate filename
    const timestamp = new Date().getTime();
    const filename = `video_${videoId}_${timestamp}.mp4`;
    const key = `videos/${filename}`;
    const body = Buffer.from(videoBuffer);

    // Upload to R2
    const storage = await getStorageService();
    const uploadResult = await storage.uploadFile({
      body,
      key,
      contentType: 'video/mp4',
    });

    if (uploadResult && uploadResult.success && uploadResult.url) {
      console.log('Video uploaded successfully to R2:', uploadResult.url);
      return {
        success: true,
        url: uploadResult.url,
        fileSize: videoBuffer.byteLength,
      };
    } else {
      console.error('Video upload failed. Result:', JSON.stringify(uploadResult));
      throw new Error(uploadResult?.error || 'Upload result is empty (check logs)');
    }
  } catch (error) {
    console.error('Failed to upload video to R2:', error);

    // 分类错误类型，提供更有用的错误信息
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (
        error.message.includes('ECONNRESET') ||
        error.message.includes('network')
      ) {
        errorMessage =
          'Network connection failed. The video service may be temporarily unavailable.';
      } else if (error.message.includes('timeout')) {
        errorMessage =
          'Download timeout. The video file may be too large or the connection is slow.';
      } else if (error.message.includes('HTTP 4')) {
        errorMessage = 'Video not found or access denied from the source.';
      } else if (error.message.includes('HTTP 5')) {
        errorMessage =
          'Video service is temporarily unavailable. Please try again later.';
      } else {
        errorMessage = error.message;
      }
    }

    return {
      success: false,
      error: errorMessage,
    };
  }
}

/**
 * Get video by ID
 */
export async function getVideo(id: string) {
  try {
    const videoRecord = await getVideoById(id);
    if (videoRecord) {
      // Parse parameters JSON
      const parsedVideo = {
        ...videoRecord,
        parameters: videoRecord.parameters
          ? JSON.parse(videoRecord.parameters)
          : {},
      };
      return { success: true, data: parsedVideo };
    } else {
      return { success: false, error: 'Video not found' };
    }
  } catch (error) {
    console.error('Failed to get video:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's videos
 */
export async function getUserVideos(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const videos = await getVideosByUserId(userId, limit, offset);

    // Parse parameters JSON for each video
    const parsedVideos = videos.map((v) => ({
      ...v,
      parameters: v.parameters ? JSON.parse(v.parameters) : {},
    }));

    return { success: true, data: parsedVideos };
  } catch (error) {
    console.error('Failed to get user videos:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Get user's videos with total count
 */
export async function getUserVideosWithCount(
  userId: string,
  limit: number = 20,
  offset: number = 0
) {
  try {
    const [videos, totalCount] = await Promise.all([
      getVideosByUserId(userId, limit, offset),
      getVideoCountByUserId(userId),
    ]);

    // Parse parameters JSON for each video
    const parsedVideos = videos.map((v) => ({
      ...v,
      parameters: v.parameters ? JSON.parse(v.parameters) : {},
    }));

    return {
      success: true,
      data: parsedVideos,
      totalCount,
    };
  } catch (error) {
    console.error('Failed to get user videos with count:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Complete video generation process
 * This function handles the full workflow: update status, upload to R2, update URLs
 */
export async function completeVideoGeneration(
  id: string,
  originalVideoUrl: string,
  generationTime?: number,
  storageDomain?: string
) {
  try {
    // First, update status to uploading
    await updateVideoRecord(id, {
      status: VideoStatus.Uploading,
      originalVideoUrl: originalVideoUrl,
      generationTime: generationTime,
    });

    // Upload video to R2 if storage is configured
    const storage = await getStorageService();
    const hasStorage = storage.getProviderNames().length > 0;

    let uploadResult: {
      success: boolean;
      url?: string;
      fileSize?: number;
      error?: string;
    } = { success: false };

    if (hasStorage) {
      uploadResult = await uploadVideoToR2(originalVideoUrl, id);
    } else {
      console.warn('Storage not configured, skipping R2 upload');
      uploadResult = {
        success: true,
        url: originalVideoUrl,
        fileSize: 0,
      };
    }

    if (uploadResult.success && uploadResult.url) {
      console.log('Video ready, now processing first frame...');

      // Check if we already have a first_frame_image_url (from uploaded start image)
      const videoRecord = await getVideo(id);
      let firstFrameImageUrl: string | undefined = undefined;

      if (videoRecord.success && videoRecord.data?.firstFrameImageUrl) {
        // Already have first frame image from uploaded start image
        firstFrameImageUrl = videoRecord.data.firstFrameImageUrl;
        console.log('Using existing first frame image:', firstFrameImageUrl);
      } else if (hasStorage) {
        // No start image was uploaded, extract first frame from video (only if storage is available)
        console.log(
          'No start image found, extracting first frame from video...'
        );
        const frameExtractionResult = await extractFirstFrameAndUpload(
          uploadResult.url,
          id,
          storageDomain
        );

        if (frameExtractionResult.success && frameExtractionResult.url) {
          firstFrameImageUrl = frameExtractionResult.url;
          console.log('First frame extracted and uploaded:', firstFrameImageUrl);
        } else {
          console.warn(
            'Failed to extract first frame:',
            frameExtractionResult.error
          );
          // Don't fail the entire process if frame extraction fails
        }
      }

      // Update with final URLs and completed status
      const updateData: Partial<UpdateVideoData> = {
        status: VideoStatus.Completed,
        videoUrl: uploadResult.url,
        fileSize: uploadResult.fileSize,
        completedAt: new Date(),
      };

      // Only update first_frame_image_url if we have a new one
      if (
        firstFrameImageUrl &&
        (!videoRecord.success || !videoRecord.data?.firstFrameImageUrl)
      ) {
        updateData.firstFrameImageUrl = firstFrameImageUrl;
      }

      await updateVideoRecord(id, updateData);

      console.log('Video generation completed successfully:', id);
      return { success: true, videoUrl: uploadResult.url, firstFrameImageUrl };
    } else {
      // Upload failed, mark as failed
      await updateVideoRecord(id, {
        status: VideoStatus.Failed,
      });

      return { success: false, error: uploadResult.error || 'Upload failed' };
    }
  } catch (error) {
    console.error('Failed to complete video generation:', error);

    // Mark as failed
    await updateVideoRecord(id, {
      status: VideoStatus.Failed,
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
