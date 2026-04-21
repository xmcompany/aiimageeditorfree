import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { getAuth } from '@/core/auth';
import CheckinClient from './checkin-client';
import { getCheckinHistory, getTodayCheckin, getLastCheckin } from '@/shared/models/checkin';
import { getAllConfigs } from '@/shared/models/config';
import { getReferralCode, getReferralsByReferrer } from '@/shared/models/referral';
import { envConfigs } from '@/config';

export default async function CheckinPage() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect('/sign-in');
  }

  const userId = session.user.id;
  const [todayRecord, lastRecord, history, configs, referrals] = await Promise.all([
    getTodayCheckin(userId),
    getLastCheckin(userId),
    getCheckinHistory(userId, 35),
    getAllConfigs(),
    getReferralsByReferrer(userId),
  ]);

  const referralCode = getReferralCode(userId);
  const appUrl = envConfigs.app_url || '';

  return (
    <CheckinClient
      checkedInToday={!!todayRecord}
      streak={lastRecord?.streak || 0}
      history={history.map(h => ({ date: h.checkinDate, credits: h.creditsGranted, streak: h.streak }))}
      config={{
        week1Credits: parseInt(configs.checkin_week1_credits as string) || 1,
        week2Credits: parseInt(configs.checkin_week2_credits as string) || 2,
        week3Credits: parseInt(configs.checkin_week3_credits as string) || 3,
        maxCredits: parseInt(configs.checkin_max_credits as string) || 200,
        referralRewardRate: parseFloat(configs.referral_reward_rate as string) || 0.2,
        referralMaxCredits: parseInt(configs.referral_max_credits as string) || 2000,
        referralRewardDays: parseInt(configs.referral_reward_days as string) || 30,
      }}
      referralCode={referralCode}
      referralUrl={`${appUrl}/?ref=${referralCode}`}
      referrals={referrals.map(r => ({
        id: r.id,
        status: r.status,
        rewardCredits: r.rewardCredits ?? 0,
        rewardedAt: r.rewardedAt ? r.rewardedAt.toISOString() : null,
        createdAt: r.createdAt.toISOString(),
        referee: r.referee
          ? {
              name: r.referee.name ?? null,
              // mask email: ab***@gmail.com
              email: r.referee.email
                ? r.referee.email.replace(/(.{2}).+(@.+)/, '$1***$2')
                : null,
            }
          : null,
      }))}
    />
  );
}
