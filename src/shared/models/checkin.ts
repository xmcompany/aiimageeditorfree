import { and, desc, eq, inArray } from 'drizzle-orm';
import { db } from '@/core/db';
import { checkin, user as userTable } from '@/config/db/schema';
import { config as configTable } from '@/config/db/schema';
import { grantCreditsForUser } from './credit';
import { User } from './user';

export type Checkin = typeof checkin.$inferSelect;

// 直接从数据库读取签到配置，绕过 unstable_cache
async function getCheckinConfigs(): Promise<Record<string, string>> {
  const rows = await db().select().from(configTable);
  const map: Record<string, string> = {};
  for (const row of rows) {
    if (row.value) map[row.name] = row.value;
  }
  return map;
}
export function getTodayDate(): string {
  // Use US Pacific Time (America/Los_Angeles) as the canonical check-in timezone.
  // Check-in resets daily at midnight PT.
  return new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

// 获取昨天的日期字符串
export function getYesterdayDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
}

// 获取用户最近一次签到记录
export async function getLastCheckin(userId: string): Promise<Checkin | null> {
  const result = await db()
    .select()
    .from(checkin)
    .where(eq(checkin.userId, userId))
    .orderBy(desc(checkin.createdAt))
    .limit(1);
  return result[0] || null;
}

// 获取用户今天是否已签到
export async function getTodayCheckin(userId: string): Promise<Checkin | null> {
  const today = getTodayDate();
  const result = await db()
    .select()
    .from(checkin)
    .where(and(eq(checkin.userId, userId), eq(checkin.checkinDate, today)))
    .limit(1);
  return result[0] || null;
}

// 获取用户签到历史（最近30天）
export async function getCheckinHistory(userId: string, limit = 30): Promise<Checkin[]> {
  return db()
    .select()
    .from(checkin)
    .where(eq(checkin.userId, userId))
    .orderBy(desc(checkin.createdAt))
    .limit(limit);
}

// 计算签到积分：第1-7天1分，第8-14天2分，第15-21天3分，之后封顶
export function calcCheckinCredits(streak: number, configs: Record<string, any>): number {
  const week1 = parseInt(configs.checkin_week1_credits as string) || 1;
  const week2 = parseInt(configs.checkin_week2_credits as string) || 2;
  const week3 = parseInt(configs.checkin_week3_credits as string) || 3;

  if (streak <= 7) return week1;
  if (streak <= 14) return week2;
  return week3;
}

// 执行签到
export async function doCheckin(user: User, ip?: string): Promise<{
  success: boolean;
  alreadyCheckedIn?: boolean;
  credits?: number;
  streak?: number;
  message?: string;
}> {
  const today = getTodayDate();

  // 检查今天是否已签到
  const todayRecord = await getTodayCheckin(user.id);
  if (todayRecord) {
    return { success: false, alreadyCheckedIn: true, message: 'Already checked in today' };
  }

  const configs = await getCheckinConfigs();

  // 检查是否启用签到
  if (configs.checkin_enabled !== 'true') {
    return { success: false, message: 'Check-in is not enabled' };
  }

  // Anti-abuse: account must be at least 24 hours old (prevent mass account creation for farming)
  const accountAge = Date.now() - new Date(user.createdAt).getTime();
  if (accountAge < 24 * 60 * 60 * 1000) {
    return { success: false, message: 'Account must be at least 24 hours old to check in' };
  }

  // Anti-abuse: flag if the same IP checks in from multiple accounts
  if (ip) {
    try {
      // Find other users with the same IP who also checked in today
      const sameIpUsers = await db()
        .select({ id: userTable.id })
        .from(userTable)
        .where(eq(userTable.ip, ip))
        .limit(10);
      const sameIpUserIds = sameIpUsers.map((u: { id: string }) => u.id).filter((id: string) => id !== user.id);
      if (sameIpUserIds.length > 0) {
        const sameIpCheckins = await db()
          .select({ userId: checkin.userId })
          .from(checkin)
          .where(
            and(
              eq(checkin.checkinDate, today),
              inArray(checkin.userId, sameIpUserIds)
            )
          )
          .limit(10);
        if (sameIpCheckins.length > 0) {
          console.warn(
            `[Check-in Anti-Abuse] IP ${ip} checked in from ${sameIpCheckins.length + 1} accounts today. ` +
            `User ${user.id} may be farming credits.`
          );
        }
      }
    } catch {
      // Best-effort flagging, don't block check-in
    }
  }

  const maxCredits = parseInt(configs.checkin_max_credits as string) || 200;

  // 计算连续签到天数
  const lastCheckin = await getLastCheckin(user.id);
  const yesterday = getYesterdayDate();
  let streak = 1;

  if (lastCheckin && lastCheckin.checkinDate === yesterday) {
    // 昨天签到了，连续天数+1
    streak = (lastCheckin.streak || 0) + 1;
  }
  // 否则重置为1（断签）

  const creditsToGrant = calcCheckinCredits(streak, configs);

  // 插入签到记录 (use try/catch to handle concurrent duplicate inserts)
  try {
    await db().insert(checkin).values({
      id: crypto.randomUUID(),
      userId: user.id,
      checkinDate: today,
      streak,
      creditsGranted: creditsToGrant,
    });
  } catch (e: any) {
    // If a concurrent request already inserted a record for today, treat as already checked in
    if (e?.message?.includes('unique') || e?.message?.includes('duplicate') || e?.code === '23505') {
      return { success: false, alreadyCheckedIn: true, message: 'Already checked in today' };
    }
    throw e;
  }

  // 发放积分
  await grantCreditsForUser({
    user,
    credits: creditsToGrant,
    validDays: parseInt(configs.checkin_credits_valid_days as string) || 0,
    description: `Daily check-in (day ${streak})`,
  });

  return { success: true, credits: creditsToGrant, streak };
}
