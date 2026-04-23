import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { getAuth } from '@/core/auth';
import { doCheckin, getTodayCheckin, getCheckinHistory, getLastCheckin } from '@/shared/models/checkin';
import { getAllConfigs } from '@/shared/models/config';
import { findUserById } from '@/shared/models/user';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';

// GET: 获取签到状态
export async function GET(req: NextRequest) {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const [todayRecord, lastRecord, history, configs] = await Promise.all([
    getTodayCheckin(userId),
    getLastCheckin(userId),
    getCheckinHistory(userId, 35),
    getAllConfigs(),
  ]);

  return NextResponse.json({
    code: 0,
    data: {
      checkedInToday: !!todayRecord,
      streak: lastRecord?.streak || 0,
      history: history.map(h => ({ date: h.checkinDate, credits: h.creditsGranted, streak: h.streak })),
      config: {
        week1Credits: parseInt(configs.checkin_week1_credits as string) || 1,
        week2Credits: parseInt(configs.checkin_week2_credits as string) || 2,
        week3Credits: parseInt(configs.checkin_week3_credits as string) || 3,
        maxCredits: parseInt(configs.checkin_max_credits as string) || 200,
      },
    },
  });
}

// POST: 执行签到
export async function POST(req: NextRequest) {
  // Rate limit: 1 check-in request per 5 seconds per IP
  const limited = enforceMinIntervalRateLimit(req, {
    intervalMs: 5000,
    keyPrefix: 'checkin-post',
  });
  if (limited) return limited;

  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ code: 401, message: 'Unauthorized' }, { status: 401 });
  }

  const user = await findUserById(session.user.id);
  if (!user) {
    return NextResponse.json({ code: 404, message: 'User not found' }, { status: 404 });
  }

  // Forward client IP for anti-abuse flagging
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '';
  const result = await doCheckin(user, ip);

  if (!result.success) {
    return NextResponse.json({ code: 400, message: result.message, data: { alreadyCheckedIn: result.alreadyCheckedIn } });
  }

  return NextResponse.json({
    code: 0,
    message: `Check-in successful! +${result.credits} credits`,
    data: { credits: result.credits, streak: result.streak },
  });
}
