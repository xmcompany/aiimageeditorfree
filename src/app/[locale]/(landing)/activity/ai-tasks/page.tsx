import { getTranslations } from 'next-intl/server';

import { Empty, Pagination } from '@/shared/blocks/common';
import { Tabs } from '@/shared/blocks/common/tabs';
import { getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { getUserInfo } from '@/shared/models/user';
import { Tab } from '@/shared/types/blocks/common';

import { UserAITasksGrid } from './ai-tasks-grid';

export default async function AiTasksPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: number; pageSize?: number; type?: string }>;
}) {
  const { page: pageNum, pageSize, type } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const user = await getUserInfo();
  if (!user) {
    return <Empty message="no auth" />;
  }

  const t = await getTranslations('activity.ai-tasks');

  const [aiTasks, total] = await Promise.all([
    getAITasks({ userId: user.id, mediaType: type, page, limit }),
    getAITasksCount({ userId: user.id, mediaType: type }),
  ]);

  const tabs: Tab[] = [
    { name: 'all',   title: t('list.tabs.all'),   url: '/activity/ai-tasks',              is_active: !type || type === 'all' },
    { name: 'music', title: t('list.tabs.music'),  url: '/activity/ai-tasks?type=music',   is_active: type === 'music' },
    { name: 'image', title: t('list.tabs.image'),  url: '/activity/ai-tasks?type=image',   is_active: type === 'image' },
    { name: 'video', title: t('list.tabs.video'),  url: '/activity/ai-tasks?type=video',   is_active: type === 'video' },
    { name: 'audio', title: t('list.tabs.audio'),  url: '/activity/ai-tasks?type=audio',   is_active: type === 'audio' },
    { name: 'text',  title: t('list.tabs.text'),   url: '/activity/ai-tasks?type=text',    is_active: type === 'text' },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">{t('list.title')}</h2>
      <Tabs tabs={tabs} />
      <UserAITasksGrid tasks={aiTasks} emptyMessage={t('list.empty_message')} />
      <Pagination total={total} page={page} limit={limit} />
    </div>
  );
}
