import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { getPrompts } from '@/shared/models/prompt';
import { Button, Crumb } from '@/shared/types/blocks/common';
import { VideoPromptsManager } from './prompts-manager';

export default async function VideoPromptsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.VIDEOS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.video-prompts');

  const crumbs: Crumb[] = [
    { title: t('list.crumbs.admin'), url: '/admin' },
    { title: t('list.crumbs.video-prompts'), is_active: true },
  ];

  const data = await getPrompts({ page: 1, limit: 200, type: 'video' });

  const serialized = data.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description ?? null,
    image: p.image ?? null,
    promptTitle: p.promptTitle,
    promptDescription: p.promptDescription ?? null,
    status: p.status,
    model: (p as any).model ?? null,
    createdAt: p.createdAt.toISOString(),
  }));

  const actions: Button[] = [
    {
      id: 'add',
      title: t('list.buttons.add'),
      icon: 'RiAddLine',
      url: '/admin/video-prompts/add',
    },
  ];

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('list.title')} actions={actions} />
        <div className="p-4">
          <VideoPromptsManager initialData={serialized} />
        </div>
      </Main>
    </>
  );
}
