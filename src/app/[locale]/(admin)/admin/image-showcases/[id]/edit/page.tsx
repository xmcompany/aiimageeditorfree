import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getShowcase, updateShowcase } from '@/shared/models/showcase';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function ShowcaseEditPage({
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

  const t = await getTranslations('admin.image-showcases');
  const showcase = await getShowcase(id);

  if (!showcase) {
    notFound();
  }

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.showcases'), url: '/admin/image-showcases' },
    { title: t('edit'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'title',
        type: 'text',
        title: t('form.title'),
        validation: { required: true },
        value: showcase.title,
      },
      {
        name: 'prompt',
        type: 'textarea',
        title: t('form.prompt'),
        validation: { required: true },
        value: showcase.prompt,
      },
      {
        name: 'image',
        type: 'upload_image',
        title: t('form.image'),
        value: showcase.image,
        tip: t('form.image_tip'),
      },
      {
        name: 'tags',
        type: 'text',
        title: t('form.tags'),
        placeholder: t('form.tags_placeholder'),
        tip: t('form.tags_tip'),
        value: showcase.tags || '',
      },
    ],
    passby: { id },
    data: {},
    submit: {
      button: {
        title: t('buttons.update'),
      },
      handler: async (data, passby) => {
        'use server';

        const tAction = await getTranslations('admin.image-showcases');
        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const title = data.get('title') as string;
        const prompt = data.get('prompt') as string;
        const image = data.get('image') as string;
        const tags = data.get('tags') as string;
        const description = prompt;

        if (!title?.trim() || !prompt?.trim()) {
          throw new Error(tAction('messages.validation_error'));
        }

        const result = await updateShowcase(passby.id, {
          title: title.trim(),
          description: description?.trim() || null,
          prompt: prompt?.trim() || null,
          image: image.trim(),
          tags: tags?.trim() || null,
          type: 'image',
        });

        if (!result) {
          throw new Error(tAction('messages.error_update'));
        }

        return {
          status: 'success',
          message: tAction('messages.success_update'),
          redirect_url: '/admin/image-showcases',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('edit')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
