import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { enforceMinIntervalRateLimit } from '@/shared/lib/rate-limit';
import { isEmailVerified } from '@/shared/models/user';

export async function POST(req: Request) {
  // Rate limit: 1 request per 3 seconds per IP to prevent email enumeration
  const limited = enforceMinIntervalRateLimit(req, {
    intervalMs: 3000,
    keyPrefix: 'user-email-check',
  });
  if (limited) return limited;

  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    const email = String(body?.email || '')
      .trim()
      .toLowerCase();
    if (!email) {
      return respErr(t('messages.invalid_params'));
    }

    const emailVerified = await isEmailVerified(email);

    return respData({ emailVerified });
  } catch (e) {
    console.log('check email verified failed:', e);
    return respErr(t('messages.failed'));
  }
}
