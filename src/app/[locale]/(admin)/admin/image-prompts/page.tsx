import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { TableCard } from '@/shared/blocks/table';
import { BulkDeleteTable } from '@/shared/blocks/table/bulk-delete-table';
import { PromptActions } from '@/shared/blocks/table/actions/prompt-actions';
import { getPrompts, getPromptsCount, type Prompt } from '@/shared/models/prompt';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { type Table } from '@/shared/types/blocks/table';

export default async function PromptsPage({
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

  const t = await getTranslations('admin.image-prompts');

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 15;

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.prompts'), is_active: true },
  ];

  const total = await getPromptsCount({ type: 'image' });
  const data = await getPrompts({ page, limit, type: 'image' });

  const table: Table = {
    columns: [
      {
        name: 'image',
        title: t('fields.image'),
        type: 'image',
        metadata: {
          width: 50,
          height: 50,
        },
      },
      /* { name: 'title', title: t('fields.title') },
      { 
        name: 'description', 
        title: t('fields.description'),
        callback: (item: Prompt) => {
          const text = item.description || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      }, */
      { 
        name: 'promptTitle', 
        title: t('fields.prompt_title'),
        callback: (item: Prompt) => {
          const text = item.promptTitle || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      { 
        name: 'promptDescription', 
        title: t('fields.prompt_description'),
        type: 'copy',
        callback: (item: Prompt) => {
          const text = item.promptDescription || '';
          return text.length > 50 ? text.substring(0, 50) + '...' : text;
        },
      },
      {
        name: 'status',
        title: t('fields.status'),
        type: 'label',
        metadata: { variant: 'outline' },
      },
      { name: 'createdAt', title: t('fields.created_at'), type: 'time' },
      { name: 'updatedAt', title: t('fields.updated_at'), type: 'time' },
      {
        name: 'action',
        title: '',
        callback: (item: Prompt) => (
          <PromptActions 
            id={item.id}
            editUrl={`/admin/image-prompts/${item.id}/edit`}
            editLabel={t('list.buttons.edit')}
            deleteLabel={t('list.buttons.delete')}
            confirmText={t('list.buttons.delete_confirm')}
            deletingText={t('list.buttons.deleting')}
            successText={t('list.buttons.delete_success')}
            errorText={t('list.buttons.delete_error')}
          />
        ),
      },
    ],
    actions: [
      {
        id: 'edit',
        title: t('list.buttons.edit'),
        icon: 'RiEditLine',
        url: '/admin/image-prompts/[id]/edit',
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
      title: t('list.buttons.add'),
      icon: 'RiAddLine',
      url: '/admin/image-prompts/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <BulkDeleteTable
          items={data}
          deleteApiUrl="/api/admin/prompts/bulk-delete"
          confirmText="Delete selected image prompts?"
          columns={[
            { key: 'title', label: 'Title' },
            { key: 'promptTitle', label: 'Prompt' },
          ]}
        />
        <div className="mt-6">
          <TableCard table={table} />
        </div>
      </Main>
    </>
  );
}
