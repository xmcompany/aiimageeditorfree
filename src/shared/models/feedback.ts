
import { count, desc } from 'drizzle-orm';
import { db } from '@/core/db';
import { feedback } from '@/config/db/schema';
import { appendUserToResult, User } from './user';
import { getUuid } from '@/shared/lib/hash';

export type NewFeedback = typeof feedback.$inferInsert;

export async function insertFeedback(newFeedback: NewFeedback) {
  if (!newFeedback.id) {
    newFeedback.id = getUuid();
  }
  const [result] = await db().insert(feedback).values(newFeedback).returning();
  return result;
}

export type Feedback = typeof feedback.$inferSelect & {
  user?: User;
};

export async function getFeedbacks({
  page = 1,
  limit = 30,
  getUser = true,
}: {
  page?: number;
  limit?: number;
  getUser?: boolean;
} = {}): Promise<Feedback[]> {
  const result = await db()
    .select()
    .from(feedback)
    .orderBy(desc(feedback.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}

export async function getFeedbacksTotal(): Promise<number> {
  const [result] = await db().select({ count: count() }).from(feedback);
  return result?.count || 0;
}
