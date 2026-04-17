import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { BulkDeleteTable, BulkAction } from '@/shared/blocks/table/bulk-delete-table';
import { getShowcases, getShowcasesCount } from '@/shared/models/showcase';
import { Button, Crumb } from '@/shared/types/blocks/common';

export default async function VideoShowcasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.VIDEOS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.video-showcases');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 15;

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.video-showcases'), is_active: true },
  ];

  const total = await getShowcasesCount({ type: 'video' });
  const data = await getShowcases({ page, limit, type: 'video' });

  const actions: Button[] = [
    {
      id: 'add',
      title: t('add'),
      icon: 'RiAddLine',
      url: '/admin/video-showcases/add',
    },
  ];

  const bulkActions: BulkAction[] = [
    {
      label: t('bulk_show'),
      variant: 'default',
      apiUrl: '/api/admin/showcases/bulk-toggle',
      payload: (ids: string[]) => ({ ids, show: true }),
    },
    {
      label: t('bulk_hide'),
      variant: 'outline',
      apiUrl: '/api/admin/showcases/bulk-toggle',
      payload: (ids: string[]) => ({ ids, show: false }),
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('title')} actions={actions} />
        <BulkDeleteTable
          items={data}
          deleteApiUrl="/api/admin/showcases/bulk-delete"
          confirmText="Delete selected video showcases?"
          bulkActions={bulkActions}
          columns={[
            { key: 'videoUrl', label: t('form.video'), type: 'video', metadata: { width: 60, height: 40, poster: 'image' } },
            { key: 'title', label: t('form.title'), truncate: true },
            { key: 'prompt', label: t('form.prompt'), type: 'copy', truncate: true },
            { key: 'tags', label: t('form.tags') },
            {
              key: 'showInGallery',
              label: t('form.show_in_gallery'),
              render: (item: any) => (
                <span className={item.showInGallery ? 'text-green-600 font-medium' : 'text-muted-foreground'}>
                  {item.showInGallery ? t('visible') : t('hidden')}
                </span>
              ),
            },
            { key: 'createdAt', label: t('form.createdAt'), type: 'time' },
          ]}
          rowActions={{
            editUrlTemplate: '/admin/video-showcases/[id]/edit',
            editLabel: t('edit'),
            deleteLabel: t('delete'),
            deleteApiUrl: '/api/admin/showcases/delete',
            confirmText: t('delete_confirm'),
            deletingText: t('deleting'),
            successText: t('delete_success'),
            errorText: t('delete_error'),
          }}
        />
      </Main>
    </>
  );
}
