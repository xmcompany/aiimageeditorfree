import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { findPrompt, updatePrompt, UpdatePrompt, PromptStatus } from '@/shared/models/prompt';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function PromptEditPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.CATEGORIES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.image-prompts');

  const promptData = await findPrompt({ id });
  if (!promptData) {
    return <Empty message={t('edit.messages.not_found')} />;
  }

  const crumbs: Crumb[] = [
    { title: t('edit.crumbs.admin'), url: '/admin' },
    { title: t('edit.crumbs.prompts'), url: '/admin/image-prompts' },
    { title: t('edit.crumbs.edit'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'image',
        type: 'upload_image',
        title: t('fields.image'),
        tip: t('fields.image_tip'),
        validation: { required: true },
      },
      {
        name: 'promptTitle',
        type: 'text',
        title: t('fields.prompt_title'),
        validation: { required: true },
      },
      {
        name: 'promptDescription',
        type: 'textarea',
        title: t('fields.prompt_description'),
        validation: { required: true },
      },
    ],
    passby: {
      id: promptData.id,
      userId: promptData.userId,
    },
    data: promptData,
    submit: {
      button: {
        title: t('edit.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const tAction = await getTranslations('admin.image-prompts');
        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const { id, userId } = passby;
        if (!user || userId !== user.id) {
          throw new Error('access denied');
        }

        const promptTitle = data.get('promptTitle') as string;
        const promptDescription = data.get('promptDescription') as string;
        const image = data.get('image') as string;
        const title = promptTitle;
        const description = promptDescription;

        if (!promptTitle?.trim() || !promptDescription?.trim() || !image?.trim()) {
          throw new Error(tAction('edit.messages.validation_error'));
        }

        const updateData: UpdatePrompt = {
          title: title.trim(),
          description: description?.trim() || '',
          image: image?.trim() || '',
          promptTitle: promptTitle.trim(),
          promptDescription: promptDescription?.trim() || '',
          status: PromptStatus.PUBLISHED,
          type: 'image',
        };

        const result = await updatePrompt(id, updateData);

        if (!result) {
          throw new Error(tAction('edit.messages.error'));
        }

        return {
          status: 'success',
          message: tAction('edit.messages.success'),
          redirect_url: '/admin/image-prompts',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
