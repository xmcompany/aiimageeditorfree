import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { getRemainingCredits } from '@/shared/models/credit';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    const credits = await getRemainingCredits(user.id);

    return respData({ remainingCredits: credits });
  } catch (e) {
    console.log('get user credits failed:', e);
    return respErr(t('messages.failed'));
  }
}
