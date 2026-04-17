import { and, eq, sum } from 'drizzle-orm';
import { db } from '@/core/db';
import { referral, user } from '@/config/db/schema';
import { getAllConfigs } from './config';
import { grantCreditsForUser } from './credit';
import { User, findUserById } from './user';

export type Referral = typeof referral.$inferSelect;

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
  // 查找 id 以该 code 开头的用户（去掉横线后前8位）
  const allUsers = await db()
    .select()
    .from(user)
    .limit(1000); // 实际项目可以加专属 referral_code 字段优化

  const found = allUsers.find(u =>
    u.id.replace(/-/g, '').slice(0, 8).toLowerCase() === code.toLowerCase()
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

// 获取用户的推荐列表
export async function getReferralsByReferrer(referrerId: string): Promise<Referral[]> {
  return db()
    .select()
    .from(referral)
    .where(eq(referral.referrerId, referrerId));
}
