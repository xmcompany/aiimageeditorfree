
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { getVideos, getVideosCount } from '@/shared/models/video';
import { Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';
import { SetAsShowcase } from '@/shared/blocks/table/actions/set-as-showcase';

export default async function AdminVideosPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // Use AITASKS_READ for now to ensure user can access it immediately
  await requirePermission({
    code: PERMISSIONS.AITASKS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.video-generates');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 15;

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.videos'), is_active: true },
  ];

  const total = await getVideosCount();
  const data = await getVideos({ page, limit });

  const table: Table = {
    columns: [
      {
        name: 'videoUrl',
        title: t('form.video'),
        type: 'video',
        metadata: {
          width: 100,
          height: 100,
          poster: 'firstFrameImageUrl'
        },
      },
      { 
        name: 'prompt', 
        title: t('form.prompt'),
        type: 'copy',
        callback: (item: any) => {
          const text = item.prompt || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      { name: 'model', title: t('form.model') },
      { name: 'status', title: t('form.status'), type: 'label' },
      { name: 'creditsUsed', title: t('form.creditsUsed') },
      { 
        name: 'user', 
        title: t('form.userId'), 
        type: 'user',
      },
      { name: 'createdAt', title: t('form.createdAt'), type: 'time' },
      {
        name: 'actions',
        title: t('form.actions'),
        callback: (item: any) => (
          <SetAsShowcase 
            id={item.id} 
            type="video" 
            label={t('actions.set_as_showcase')} 
            showcasedLabel={t('actions.showcased')}
            isShowcased={item.isInShowcase}
          />
        )
      }
    ],
    data,
    pagination: {
      total,
      page,
      limit,
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('title')} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
