import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { findChatById } from '@/shared/models/chat';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    let { chatId } = body;
    if (!chatId) {
      return respErr(t('messages.invalid_params'));
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    const chat = await findChatById(chatId);
    if (!chat) {
      return respErr(t('messages.not_found'));
    }

    if (chat.userId !== user.id) {
      return respErr(t('messages.no_permission'));
    }

    return respData(chat);
  } catch (e: any) {
    console.log('get chat info failed:', e);
    return respErr(t('messages.failed'));
  }
}
