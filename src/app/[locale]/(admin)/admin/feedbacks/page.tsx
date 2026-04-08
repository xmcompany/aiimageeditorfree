
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { getFeedbacks, getFeedbacksTotal } from '@/shared/models/feedback';
import { Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function FeedbacksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: number;
    pageSize?: number;
  }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations('admin.feedbacks');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.feedbacks'), is_active: true },
  ];

  const total = await getFeedbacksTotal();
  const feedbacks = await getFeedbacks({ page, limit });

  const table: Table = {
    columns: [
      { name: 'user', title: t('fields.user'), type: 'user' },
      { name: 'content', title: t('fields.content') },
      { name: 'rating', title: t('fields.rating'), type: 'label' },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
    ],
    data: feedbacks,
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
        <MainHeader title={t('list.title')} />
        <TableCard table={table} />
      </Main>
    </>
  );
}
