
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { ShowcaseActions } from '@/shared/blocks/table/actions/showcase-actions';
import { getShowcases, getShowcasesCount, type Showcase } from '@/shared/models/showcase';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

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
    code: PERMISSIONS.CATEGORIES_READ,
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

  const table: Table = {
    columns: [
      {
        name: 'videoUrl',
        title: t('form.video'),
        type: 'video',
        metadata: {
          width: 100,
          height: 100,
          poster: 'image'
        },
      },
      { 
        name: 'title', 
        title: t('form.title'),
        callback: (item: Showcase) => {
          const text = item.title || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      { 
        name: 'prompt', 
        title: t('form.prompt'),
        type: 'copy',
        callback: (item: Showcase) => {
          const text = item.prompt || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      /* { 
        name: 'description', 
        title: t('form.description'),
        callback: (item: Showcase) => {
          const text = item.description || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      }, */
      { name: 'tags', title: t('form.tags') },
      { name: 'createdAt', title: t('form.createdAt'), type: 'time' },
      {
        name: 'action',
        title: '',
        callback: (item: Showcase) => (
          <ShowcaseActions 
            id={item.id}
            editUrl={`/admin/video-showcases/${item.id}/edit`}
            editLabel={t('edit')}
            deleteLabel={t('delete')}
            confirmText={t('delete_confirm')}
            deletingText={t('deleting')}
            successText={t('delete_success')}
            errorText={t('delete_error')}
          />
        ),
      },
    ],
    actions: [
      {
        id: 'edit',
        title: t('edit'),
        icon: 'RiEditLine',
        url: '/admin/video-showcases/[id]/edit',
      },
    ],
    data,
    pagination: {
      total,
      page,
      limit,
    },
  };

  const actions: Button[] = [
    {
      id: 'add',
      title: t('add'),
      icon: 'RiAddLine',
      url: '/admin/video-showcases/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('title')} actions={actions} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
