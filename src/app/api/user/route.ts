import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { isEmailVerified } from '@/shared/models/user';

export async function POST(req: Request) {
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
