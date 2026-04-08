
import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { getUserInfo } from '@/shared/models/user';
import { insertFeedback } from '@/shared/models/feedback';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    const { content, rating } = body;
    if (!content) {
      return respErr(t('messages.invalid_params'));
    }

    const feedback = await insertFeedback({
      userId: user.id,
      content,
      rating,
      status: 'created',
    } as any);

    return respData(feedback);
  } catch (e) {
    console.error('add feedback failed', e);
    return respErr(t('messages.failed'));
  }
}
