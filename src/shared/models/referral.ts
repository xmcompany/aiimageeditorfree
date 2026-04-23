import { and, count, desc, eq, inArray, sql, sum } from 'drizzle-orm';
import { db } from '@/core/db';
import { referral, user } from '@/config/db/schema';
import { getAllConfigs } from './config';
import { grantCreditsForUser } from './credit';
import { User, findUserById } from './user';

export type Referral = typeof referral.$inferSelect;

export type ReferralWithReferee = Referral & {
  referee?: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

const REFERRAL_CREDIT_CAP = 2000;

// Get total referral credits earned by a referrer
async function getTotalReferralCredits(referrerId: string): Promise<number> {
  const [result] = await db()
    .select({ total: sum(referral.rewardCredits) })
    .from(referral)
    .where(and(
      eq(referral.referrerId, referrerId),
      eq(referral.status, 'rewarded'),
    ));
  return parseInt(result?.total as string) || 0;
}

// 生成推荐码（使用用户 id 前8位）
export function getReferralCode(userId: string): string {
  return userId.replace(/-/g, '').slice(0, 8).toLowerCase();
}

// 通过推荐码找用户
export async function findUserByReferralCode(code: string): Promise<User | null> {
  if (!code || code.length !== 8) return null;

  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // Referral code is the first 8 hex chars (no dashes), which matches the UUID prefix before the first dash.
  // Use SQL LIKE to query efficiently instead of loading all users into memory.
  const prefix = code.toLowerCase();
  const results = await db()
    .select()
    .from(user)
    .where(sql`lower(${user.id}) like ${prefix + '%'}`)
    .limit(10);

  // Verify exact match (first 8 chars of id without dashes)
  const found = results.find((u: any) =>
    u.id.replace(/-/g, '').slice(0, 8).toLowerCase() === prefix
  );
  return found || null;
}

// 记录推荐关系（注册时调用）
export async function createReferral(referrerId: string, refereeId: string): Promise<void> {
  // 防止重复
  const existing = await db()
    .select()
    .from(referral)
    .where(eq(referral.refereeId, refereeId))
    .limit(1);
  if (existing.length > 0) return;

  await db().insert(referral).values({
    id: crypto.randomUUID(),
    referrerId,
    refereeId,
    status: 'pending',
  });
}

// 支付成功后，处理推荐奖励（在 handleCheckoutSuccess 后调用）
export async function handleReferralReward({
  refereeId,
  orderNo,
  paidCredits,
}: {
  refereeId: string;
  orderNo: string;
  paidCredits: number;
}): Promise<void> {
  const configs = await getAllConfigs();

  if (configs.referral_enabled !== 'true') return;

  const rewardRate = parseFloat(configs.referral_reward_rate as string) || 0.2;
  const maxReward = parseInt(configs.referral_max_credits as string) || 2000;
  const rewardDays = parseInt(configs.referral_reward_days as string) || 30;

  // 找到推荐关系
  const [ref] = await db()
    .select()
    .from(referral)
    .where(and(eq(referral.refereeId, refereeId), eq(referral.status, 'pending')))
    .limit(1);

  if (!ref) return;

  // 计算奖励积分
  const rewardCredits = Math.min(Math.floor(paidCredits * rewardRate), maxReward);
  if (rewardCredits <= 0) return;

  // 设置到期时间（支付后30天可领取）
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + rewardDays);

  // 更新推荐记录
  // We update the referral record after computing the adjusted reward below

  // 自动发放积分给推荐人
  const referrer = await findUserById(ref.referrerId);
  if (!referrer) return;

  // Check total referral rewards earned by this referrer (anti-abuse cap)
  const totalReferralCredits = await getTotalReferralCredits(ref.referrerId);
  if (totalReferralCredits >= REFERRAL_CREDIT_CAP) {
    console.log(`Referral cap reached for user ${referrer.id}: ${totalReferralCredits}/${REFERRAL_CREDIT_CAP}`);
    return;
  }

  // Adjust reward if it would exceed the cap
  const adjustedReward = Math.min(rewardCredits, REFERRAL_CREDIT_CAP - totalReferralCredits);

  // Update referral record with adjusted reward
  await db()
    .update(referral)
    .set({
      orderNo,
      rewardCredits: adjustedReward,
      status: 'rewarded',
      rewardedAt: new Date(),
      expiresAt,
    })
    .where(eq(referral.id, ref.id));

  await grantCreditsForUser({
    user: referrer,
    credits: adjustedReward,
    validDays: 0, // 永不过期
    description: `Referral reward for order ${orderNo}`,
  });
}

// 获取用户的推荐列表（含被推荐人信息）
export async function getReferralsByReferrer(referrerId: string): Promise<ReferralWithReferee[]> {
  const rows = await db()
    .select({
      id: referral.id,
      referrerId: referral.referrerId,
      refereeId: referral.refereeId,
      orderNo: referral.orderNo,
      rewardCredits: referral.rewardCredits,
      status: referral.status,
      rewardedAt: referral.rewardedAt,
      expiresAt: referral.expiresAt,
      createdAt: referral.createdAt,
      refereeName: user.name,
      refereeEmail: user.email,
      refereeImage: user.image,
    })
    .from(referral)
    .leftJoin(user, eq(referral.refereeId, user.id))
    .where(eq(referral.referrerId, referrerId))
    .orderBy(desc(referral.createdAt));

  return rows.map((r: any) => ({
    id: r.id,
    referrerId: r.referrerId,
    refereeId: r.refereeId,
    orderNo: r.orderNo,
    rewardCredits: r.rewardCredits,
    status: r.status,
    rewardedAt: r.rewardedAt,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
    referee: {
      id: r.refereeId,
      name: r.refereeName ?? null,
      email: r.refereeEmail ?? null,
      image: r.refereeImage ?? null,
    },
  }));
}

// 获取所有推荐记录（管理后台用），含推荐人和被推荐人信息
export async function getAllReferrals({
  page = 1,
  limit = 30,
}: { page?: number; limit?: number } = {}): Promise<(ReferralWithReferee & { referrerEmail?: string | null; referrerName?: string | null })[]> {
  const rows = await db()
    .select({
      id: referral.id,
      referrerId: referral.referrerId,
      refereeId: referral.refereeId,
      orderNo: referral.orderNo,
      rewardCredits: referral.rewardCredits,
      status: referral.status,
      rewardedAt: referral.rewardedAt,
      expiresAt: referral.expiresAt,
      createdAt: referral.createdAt,
      refereeEmail: user.email,
      refereeName: user.name,
      refereeImage: user.image,
    })
    .from(referral)
    .leftJoin(user, eq(referral.refereeId, user.id))
    .orderBy(desc(referral.createdAt))
    .limit(limit)
    .offset((page - 1) * limit);

  // Fetch referrer info separately to avoid complex alias joins
  const referrerIds = [...new Set(rows.map((r: any) => r.referrerId))] as string[];
  const referrers = referrerIds.length > 0
    ? await db().select({ id: user.id, email: user.email, name: user.name }).from(user)
        .where(inArray(user.id, referrerIds))
    : [];
  const referrerMap = Object.fromEntries(referrers.map((u: any) => [u.id, u]));

  return rows.map((r: any) => ({
    id: r.id,
    referrerId: r.referrerId,
    refereeId: r.refereeId,
    orderNo: r.orderNo,
    rewardCredits: r.rewardCredits,
    status: r.status,
    rewardedAt: r.rewardedAt,
    expiresAt: r.expiresAt,
    createdAt: r.createdAt,
    referee: {
      id: r.refereeId,
      name: r.refereeName ?? null,
      email: r.refereeEmail ?? null,
      image: r.refereeImage ?? null,
    },
    referrerEmail: referrerMap[r.referrerId]?.email ?? null,
    referrerName: referrerMap[r.referrerId]?.name ?? null,
  }));
}

export async function getReferralsCount(): Promise<number> {
  const [result] = await db().select({ count: count() }).from(referral);
  return result?.count ?? 0;
}
