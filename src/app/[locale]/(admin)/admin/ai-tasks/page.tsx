import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Pagination } from '@/shared/blocks/common';
import { Tabs } from '@/shared/blocks/common/tabs';
import { getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { Crumb, Tab } from '@/shared/types/blocks/common';
import { AdminAITasksGrid } from './ai-tasks-grid';

export default async function AiTasksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number; type?: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.AITASKS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.ai-tasks');

  const { page: pageNum, pageSize, type } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.ai-tasks'), is_active: true },
  ];

  const total = await getAITasksCount({ mediaType: type });
  const aiTasks = await getAITasks({
    getUser: true,
    page,
    limit,
    mediaType: type,
  });

  const tabs: Tab[] = [
    {
      name: 'all',
      title: t('list.tabs.all'),
      url: '/admin/ai-tasks',
      is_active: !type || type === 'all',
    },
    {
      name: 'image',
      title: t('list.tabs.image'),
      url: '/admin/ai-tasks?type=image',
      is_active: type === 'image',
    },
    {
      name: 'video',
      title: t('list.tabs.video'),
      url: '/admin/ai-tasks?type=video',
      is_active: type === 'video',
    },
    {
      name: 'music',
      title: t('list.tabs.music'),
      url: '/admin/ai-tasks?type=music',
      is_active: type === 'music',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} />
        <div className="space-y-4 p-4">
          <Tabs tabs={tabs} />
          <AdminAITasksGrid tasks={aiTasks} />
          <Pagination total={total} page={page} limit={limit} />
        </div>
      </Main>
    </>
  );
}
