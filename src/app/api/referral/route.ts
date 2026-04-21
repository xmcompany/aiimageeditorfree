import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { getReferralCode, getReferralsByReferrer } from '@/shared/models/referral';
import { getAllConfigs } from '@/shared/models/config';
import { envConfigs } from '@/config';

// GET: 获取推荐码和推荐记录
export async function GET(req: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const code = getReferralCode(userId);
  const appUrl = envConfigs.app_url || '';
  const referralUrl = `${appUrl}/?ref=${code}`;

  const [referrals, configs] = await Promise.all([
    getReferralsByReferrer(userId),
    getAllConfigs(),
  ]);

  return NextResponse.json({
    code: 0,
    data: {
      referralCode: code,
      referralUrl,
      referrals: referrals.map(r => ({
        id: r.id,
        status: r.status,
        rewardCredits: r.rewardCredits,
        rewardedAt: r.rewardedAt,
        createdAt: r.createdAt,
        referee: r.referee
          ? {
              name: r.referee.name,
              email: r.referee.email
                ? r.referee.email.replace(/(.{2}).+(@.+)/, '$1***$2') // mask email
                : null,
            }
          : null,
      })),
      config: {
        rewardRate: parseFloat(configs.referral_reward_rate as string) || 0.2,
        maxCredits: parseInt(configs.referral_max_credits as string) || 2000,
        rewardDays: parseInt(configs.referral_reward_days as string) || 30,
      },
    },
  });
}
