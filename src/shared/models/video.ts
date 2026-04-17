import { and, count, desc, eq, sql } from 'drizzle-orm';

import { video, user, showcase } from '@/config/db/schema';
import { db } from '@/core/db';
import { getUuid } from '@/shared/lib/hash';
import { addShowcase, deleteShowcase, findShowcaseByVideoUrl } from '@/shared/models/showcase';

/**
 * Insert a new video record
 */
export async function insertVideo(
  data: typeof video.$inferInsert
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db().insert(video).values(data).returning();
  return result;
}

/**
 * Update video record by ID
 */
export async function updateVideo(
  id: string,
  data: Partial<typeof video.$inferInsert>
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .update(video)
    .set(data)
    .where(eq(video.id, id))
    .returning();
  return result;
}

/**
 * Get video by ID (only active videos)
 */
export async function getVideoById(
  id: string
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .select()
    .from(video)
    .where(and(eq(video.id, id), eq(video.isDeleted, 0)))
    .limit(1);
  return result;
}

/**
 * Get video by ID (including deleted videos)
 */
export async function getVideoByIdIncludeDeleted(
  id: string
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .select()
    .from(video)
    .where(eq(video.id, id))
    .limit(1);
  return result;
}

/**
 * Get videos by user ID with pagination
 */
export async function getVideosByUserId(
  userId: string,
  limit: number = 20,
  offset: number = 0
): Promise<(typeof video.$inferSelect)[]> {
  const data = await db()
    .select()
    .from(video)
    .where(and(eq(video.userId, userId), eq(video.isDeleted, 0)))
    .orderBy(desc(video.createdAt))
    .limit(limit)
    .offset(offset);
  return data;
}

/**
 * Get total count of videos by user ID
 */
export async function getVideoCountByUserId(userId: string): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(video)
    .where(and(eq(video.userId, userId), eq(video.isDeleted, 0)));
  return result.count;
}

/**
 * Get video by Replicate prediction ID
 */
export async function getVideoByPredictionId(
  predictionId: string
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .select()
    .from(video)
    .where(eq(video.replicatePredictionId, predictionId))
    .limit(1);
  return result;
}

/**
 * Get videos by status
 */
export async function getVideosByStatus(
  status: string,
  limit: number = 100
): Promise<(typeof video.$inferSelect)[]> {
  const data = await db()
    .select()
    .from(video)
    .where(and(eq(video.status, status), eq(video.isDeleted, 0)))
    .orderBy(desc(video.createdAt))
    .limit(limit);
  return data;
}

/**
 * Soft delete video by ID
 */
export async function softDeleteVideo(
  id: string
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .update(video)
    .set({ isDeleted: 1, updatedAt: new Date() })
    .where(eq(video.id, id))
    .returning();
  return result;
}

/**
 * Hard delete video by ID
 */
export async function deleteVideo(
  id: string
): Promise<typeof video.$inferSelect | undefined> {
  const [result] = await db()
    .delete(video)
    .where(eq(video.id, id))
    .returning();
  return result;
}

/**
 * Get total count of videos for a user
 */
export async function getUserVideosCount(userId: string): Promise<number> {
  const total = await db().$count(
    video,
    and(eq(video.userId, userId), eq(video.isDeleted, 0))
  );
  return total;
}

/**
 * Get total count of videos by status
 */
export async function getVideosByStatusCount(status: string): Promise<number> {
  const total = await db().$count(
    video,
    and(eq(video.status, status), eq(video.isDeleted, 0))
  );
  return total;
}

/**
 * Get all videos with pagination (for admin)
 */
export async function getVideos({
  page = 1,
  limit = 20,
  status,
}: {
  page?: number;
  limit?: number;
  status?: string;
} = {}): Promise<(typeof video.$inferSelect & { user?: any; isInShowcase?: boolean })[]> {
  const offset = (page - 1) * limit;
  const conditions = [eq(video.isDeleted, 0)];
  if (status) {
    conditions.push(eq(video.status, status));
  }

  // Join video with user table and check showcase table
  const data = await db()
    .select({
      id: video.id,
      userId: video.userId,
      prompt: video.prompt,
      model: video.model,
      status: video.status,
      creditsUsed: video.creditsUsed,
      videoUrl: video.videoUrl,
      startImageUrl: video.startImageUrl,
      firstFrameImageUrl: video.firstFrameImageUrl,
      createdAt: video.createdAt,
      updatedAt: video.updatedAt,
      isDeleted: video.isDeleted,
      showInGallery: video.showInGallery,
      user: user, // Select all user fields
      showcaseId: sql`min(${showcase.id})`, // Use min to avoid duplicates
    })
    .from(video)
    .leftJoin(user, eq(video.userId, user.id))
    .leftJoin(showcase, eq(video.videoUrl, showcase.videoUrl))
    .where(and(...conditions))
    .groupBy(video.id, user.id) // Group by AI Task ID and User ID
    .orderBy(desc(video.createdAt))
    .limit(limit)
    .offset(offset);

  // Map result to match expected format
  return data.map((item: any) => ({
    ...item,
    isInShowcase: !!item.showcaseId, // Convert to boolean
    // The query returns a flattened object mixed with user object.
    // 'user' is already selected as a nested object by Drizzle because we selected 'user: user_schema'.
    // If Drizzle returns it as 'user', then:
    user: item.user, 
  }));
}

/**
 * Get total count of all videos (for admin)
 */
export async function getVideosCount({
  status,
}: {
  status?: string;
} = {}): Promise<number> {
  const conditions = [eq(video.isDeleted, 0)];
  if (status) {
    conditions.push(eq(video.status, status));
  }

  const [result] = await db()
    .select({ count: count() })
    .from(video)
    .where(and(...conditions));
  return result.count;
}

export async function toggleVideoShowInGallery(id: string, show: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const videoRecord = await getVideoByIdIncludeDeleted(id);
    if (!videoRecord) return { success: false, message: 'Video not found' };

    // Update the flag
    await db()
      .update(video)
      .set({ showInGallery: show ? 1 : 0 })
      .where(eq(video.id, id));

    if (show) {
      // Check if showcase already exists
      const videoUrl = videoRecord.videoUrl;
      if (!videoUrl) return { success: false, message: 'No video URL' };

      const existing = await findShowcaseByVideoUrl(videoUrl);
      if (existing) return { success: true, message: 'Already in gallery' };

      await addShowcase({
        id: getUuid(),
        userId: videoRecord.userId,
        title: videoRecord.prompt.substring(0, 100),
        prompt: videoRecord.prompt,
        image: videoRecord.firstFrameImageUrl || videoRecord.startImageUrl || '',
        videoUrl: videoUrl,
        type: 'video',
      });
    } else {
      // Remove from showcase
      const videoUrl = videoRecord.videoUrl;
      if (videoUrl) {
        const existing = await findShowcaseByVideoUrl(videoUrl);
        if (existing) {
          await deleteShowcase(existing.id);
        }
      }
    }

    return { success: true, message: show ? 'Shown in gallery' : 'Hidden from gallery' };
  } catch (error: any) {
    console.error('toggleVideoShowInGallery error:', error);
    return { success: false, message: error.message || 'Error occurred' };
  }
}
