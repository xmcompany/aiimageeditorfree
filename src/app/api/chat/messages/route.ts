import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import {
  getChatMessages,
  getChatMessagesCount,
} from '@/shared/models/chat_message';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    let { chatId, page, limit } = body;
    if (!chatId) {
      return respErr(t('messages.invalid_params'));
    }

    if (!page) {
      page = 1;
    }
    if (!limit) {
      limit = 30;
    }

    const user = await getUserInfo();
    if (!user) {
      return respErr(t('messages.no_auth'));
    }

    const messages = await getChatMessages({
      chatId,
      page,
      limit,
    });
    const total = await getChatMessagesCount({
      chatId,
    });

    return respData({
      list: messages,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (e: any) {
    console.log('get chat messages failed:', e);
    return respErr(t('messages.failed'));
  }
}
