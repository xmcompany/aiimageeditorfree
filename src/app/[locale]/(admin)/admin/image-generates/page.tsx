
import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { getAITasks, getAITasksCount } from '@/shared/models/ai_task';
import { Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';
import { SetAsShowcase } from '@/shared/blocks/table/actions/set-as-showcase';

export default async function AdminImagesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.AITASKS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.image-generates');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 15;

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.images'), is_active: true },
  ];

  const total = await getAITasksCount({ mediaType: 'image' });
  const data = await getAITasks({ page, limit, mediaType: 'image', getUser: true });

  const table: Table = {
    columns: [
      {
        name: 'image',
        title: t('form.image'),
        type: 'image',
        callback: (item: any) => {
          try {
            if (item.taskResult) {
              if (typeof item.taskResult === 'string' && item.taskResult.startsWith('http')) {
                return item.taskResult;
              }
              const result = typeof item.taskResult === 'string' ? JSON.parse(item.taskResult) : item.taskResult;
              const url = result.url || (result.images && result.images[0]) || result.output || (Array.isArray(result) ? result[0] : null);
              if (url && typeof url === 'string') return url;
            }

            if (item.taskInfo) {
              const info = typeof item.taskInfo === 'string' ? JSON.parse(item.taskInfo) : item.taskInfo;
              if (info.images && info.images[0]?.imageUrl) return info.images[0].imageUrl;
              if (info.output) return info.output;
              if (Array.isArray(info.images) && typeof info.images[0] === 'string') return info.images[0];
            }

            if (item.options) {
              const opts = typeof item.options === 'string' ? JSON.parse(item.options) : item.options;
              if (opts.image_url) return opts.image_url;
              if (opts.image) return opts.image;
            }
          } catch (e) {
            if (typeof item.taskResult === 'string' && item.taskResult?.startsWith('http')) return item.taskResult;
          }
          return '';
        },
        metadata: {
          width: 80,
          height: 80,
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
      { name: 'costCredits', title: t('form.credits'), type: 'label' },
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
            type="image"
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
