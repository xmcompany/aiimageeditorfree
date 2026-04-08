import { and, count, desc, eq, sql } from 'drizzle-orm';

import { db } from '@/core/db';
import { aiTask, credit, showcase } from '@/config/db/schema';
import { AITaskStatus } from '@/extensions/ai';
import { appendUserToResult, User } from '@/shared/models/user';

import { consumeCredits, CreditStatus } from './credit';

export type AITask = typeof aiTask.$inferSelect & {
  user?: User;
  isInShowcase?: boolean;
};
export type NewAITask = typeof aiTask.$inferInsert;
export type UpdateAITask = Partial<Omit<NewAITask, 'id' | 'createdAt'>>;

export async function createAITask(newAITask: NewAITask) {
  const result = await db().transaction(async (tx: any) => {
    // 1. create task record
    const [taskResult] = await tx.insert(aiTask).values(newAITask).returning();

    if (newAITask.costCredits && newAITask.costCredits > 0) {
      // 2. consume credits
      const consumedCredit = await consumeCredits({
        userId: newAITask.userId,
        credits: newAITask.costCredits,
        scene: newAITask.scene,
        description: `generate ${newAITask.mediaType}`,
        metadata: JSON.stringify({
          type: 'ai-task',
          mediaType: taskResult.mediaType,
          taskId: taskResult.id,
        }),
        tx,
      });

      // 3. update task record with consumed credit id
      if (consumedCredit && consumedCredit.id) {
        taskResult.creditId = consumedCredit.id;
        await tx
          .update(aiTask)
          .set({ creditId: consumedCredit.id })
          .where(eq(aiTask.id, taskResult.id));
      }
    }

    return taskResult;
  });

  return result;
}

export async function findAITaskById(id: string) {
  const [result] = await db().select().from(aiTask).where(eq(aiTask.id, id));
  return result;
}

export async function updateAITaskById(id: string, updateAITask: UpdateAITask) {
  const result = await db().transaction(async (tx: any) => {
    // task failed, Revoke credit consumption record
    let creditId = updateAITask.creditId;
    if (updateAITask.status === AITaskStatus.FAILED && !creditId) {
      const [existingTask] = await tx
        .select()
        .from(aiTask)
        .where(eq(aiTask.id, id));
      creditId = existingTask?.creditId;
    }

    if (updateAITask.status === AITaskStatus.FAILED && creditId) {
      // get consumed credit record
      const [consumedCredit] = await tx
        .select()
        .from(credit)
        .where(eq(credit.id, creditId as string));
      if (consumedCredit && consumedCredit.status === CreditStatus.ACTIVE) {
        const consumedItems = JSON.parse(consumedCredit.consumedDetail || '[]');

        // console.log('consumedItems', consumedItems);

        // add back consumed credits
        await Promise.all(
          consumedItems.map((item: any) => {
            if (item && item.creditId && item.creditsConsumed > 0) {
              return tx
                .update(credit)
                .set({
                  remainingCredits: sql`${credit.remainingCredits} + ${item.creditsConsumed}`,
                })
                .where(eq(credit.id, item.creditId));
            }
          })
        );

        // delete consumed credit record
        await tx
          .update(credit)
          .set({
            status: CreditStatus.DELETED,
          })
          .where(eq(credit.id, creditId as string));
      }
    }

    // update task
    const [result] = await tx
      .update(aiTask)
      .set(updateAITask)
      .where(eq(aiTask.id, id))
      .returning();

    return result;
  });

  return result;
}

export async function getAITasksCount({
  userId,
  status,
  mediaType,
  provider,
}: {
  userId?: string;
  status?: string;
  mediaType?: string;
  provider?: string;
}): Promise<number> {
  const [result] = await db()
    .select({ count: count() })
    .from(aiTask)
    .where(
      and(
        userId ? eq(aiTask.userId, userId) : undefined,
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        provider ? eq(aiTask.provider, provider) : undefined,
        status ? eq(aiTask.status, status) : undefined
      )
    );

  return result?.count || 0;
}

export async function getAITasks({
  userId,
  status,
  mediaType,
  provider,
  page = 1,
  limit = 30,
  getUser = false,
}: {
  userId?: string;
  status?: string;
  mediaType?: string;
  provider?: string;
  page?: number;
  limit?: number;
  getUser?: boolean;
}): Promise<AITask[]> {
  // We need to join with showcase to check existence.
  // Since we can't join on JSON taskResult for image URL, we use prompt and type as proxy.
  // This is a heuristic.
  
  const query = db()
    .select({
       ...aiTask as any, // Select all columns from aiTask. 'as any' to avoid spreading issues if needed, but ideally explicit.
       // Actually Drizzle select() without args selects all from FROM table. 
       // But when joining we need to differ.
       // Let's use the explicit selection if we can, or just select all from aiTask and checks.
    })
    //.from(aiTask) -> this is standard. 
    // To mix columns, we need to specify.
    // Let's rely on map.
    ;

   // Let's construct the query differently to handle the join.
   const data = await db()
     .select({
        id: aiTask.id,
        userId: aiTask.userId,
        mediaType: aiTask.mediaType,
        scene: aiTask.scene,
        prompt: aiTask.prompt,
        options: aiTask.options,
        status: aiTask.status,
        provider: aiTask.provider,
        model: aiTask.model,
        costCredits: aiTask.costCredits,
        creditId: aiTask.creditId,
        taskId: aiTask.taskId,
        taskInfo: aiTask.taskInfo,
        taskResult: aiTask.taskResult,
        createdAt: aiTask.createdAt,
        updatedAt: aiTask.updatedAt,
        showcaseId: sql`min(${showcase.id})`,
     })
     .from(aiTask)
     .leftJoin(showcase, and(
        eq(aiTask.prompt, showcase.prompt),
        eq(showcase.type, aiTask.mediaType)
     ))
    .where(
      and(
        userId ? eq(aiTask.userId, userId) : undefined,
        mediaType ? eq(aiTask.mediaType, mediaType) : undefined,
        provider ? eq(aiTask.provider, provider) : undefined,
        status ? eq(aiTask.status, status) : undefined
      )
    )
    .groupBy(aiTask.id)
    .orderBy(desc(aiTask.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  let result: AITask[] = data.map((item: any) => ({
    ...item,
    // Construct AITask object. 
    // Drizzle usually returns proper object if we select * from table.
    // Here we selected individual fields.
    // Let's assemble it.
    isInShowcase: !!item.showcaseId
  }));

  if (getUser) {
    return appendUserToResult(result);
  }

  return result;
}
