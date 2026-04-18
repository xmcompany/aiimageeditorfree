import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { BulkDeleteTable, BulkAction } from '@/shared/blocks/table/bulk-delete-table';
import { getShowcases, getShowcasesCount } from '@/shared/models/showcase';
import { Button, Crumb } from '@/shared/types/blocks/common';

export default async function ShowcasesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.IMAGES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.image-showcases');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 15;

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.showcases'), is_active: true },
  ];

  const total = await getShowcasesCount({ type: 'image' });
  const data = await getShowcases({ page, limit, type: 'image' });

  const actions: Button[] = [
    {
      id: 'add',
      title: t('add'),
      icon: 'RiAddLine',
      url: '/admin/image-showcases/add',
    },
  ];

  const bulkActions: BulkAction[] = [
    {
      label: t('bulk_show'),
      variant: 'default',
      apiUrl: '/api/admin/showcases/bulk-toggle',
      payload: { show: true },
    },
    {
      label: t('bulk_hide'),
      variant: 'outline',
      apiUrl: '/api/admin/showcases/bulk-toggle',
      payload: { show: false },
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
          confirmText="Delete selected image showcases?"
          bulkActions={bulkActions}
          columns={[
            { key: 'image', label: t('form.image'), type: 'image', metadata: { width: 50, height: 50 } },
            { key: 'title', label: t('form.title'), truncate: true },
            { key: 'prompt', label: t('form.prompt'), type: 'copy', truncate: true },
            { key: 'tags', label: t('form.tags') },
            {
              key: 'showInGallery',
              label: t('form.show_in_gallery'),
              type: 'boolean',
              metadata: { trueLabel: t('visible'), falseLabel: t('hidden') },
            },
            { key: 'createdAt', label: t('form.createdAt'), type: 'time' },
          ]}
          rowActions={{
            editUrlTemplate: '/admin/image-showcases/[id]/edit',
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
