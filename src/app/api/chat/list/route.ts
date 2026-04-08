import { getTranslations } from 'next-intl/server';
import { respData, respErr } from '@/shared/lib/resp';
import { ChatStatus, getChats, getChatsCount } from '@/shared/models/chat';
import { getUserInfo } from '@/shared/models/user';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const locale = body?.locale || 'en';
  const t = await getTranslations({ locale, namespace: 'common' });

  try {
    let { page, limit } = body;
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

    const chats = await getChats({
      userId: user.id,
      status: ChatStatus.CREATED,
      page,
      limit,
    });
    const total = await getChatsCount({
      userId: user.id,
      status: ChatStatus.CREATED,
    });

    return respData({
      list: chats,
      total,
      page,
      limit,
      hasMore: page * limit < total,
    });
  } catch (e: any) {
    console.log('get chat list failed:', e);
    return respErr(t('messages.failed'));
  }
}
