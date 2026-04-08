import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import { addShowcase, NewShowcase } from '@/shared/models/showcase';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function VideoShowcaseAddPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.CATEGORIES_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const t = await getTranslations('admin.video-showcases');

  const crumbs: Crumb[] = [
    { title: t('crumbs.admin'), url: '/admin' },
    { title: t('crumbs.video-showcases'), url: '/admin/video-showcases' },
    { title: t('add'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'title',
        type: 'text',
        title: t('form.title'),
        validation: { required: true },
      },
      {
        name: 'prompt',
        type: 'textarea',
        title: t('form.prompt'),
        validation: { required: true },
      },
      {
        name: 'image',
        type: 'upload_image',
        title: t('form.image'),
        validation: { required: true },
        tip: t('form.image_tip'),
      },
      {
        name: 'videoUrl',
        type: 'text',
        title: t('form.videoUrl'),
        validation: { required: true },
      },
      {
        name: 'tags',
        type: 'text',
        title: t('form.tags'),
        placeholder: t('form.tags_placeholder'),
        tip: t('form.tags_tip'),
      },
    ],
    passby: {},
    data: {},
    submit: {
      button: {
        title: t('buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const tAction = await getTranslations('admin.video-showcases');
        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const title = data.get('title') as string;
        const prompt = data.get('prompt') as string;
        const image = data.get('image') as string;
        const videoUrl = data.get('videoUrl') as string;
        const tags = data.get('tags') as string;
        const description = prompt;

        if (!title?.trim() || !prompt?.trim() || !image?.trim() || !videoUrl?.trim()) {
          throw new Error(tAction('messages.validation_error'));
        }

        const newShowcase: NewShowcase = {
          id: getUuid(),
          userId: user.id,
          title: title.trim(),
          description: description?.trim() || null,
          prompt: prompt?.trim() || null,
          image: image.trim(),
          videoUrl: videoUrl.trim(),
          tags: tags?.trim() || null,
          type: 'video',
        };

        const result = await addShowcase(newShowcase);

        if (!result) {
          throw new Error(tAction('messages.error_add'));
        }

        return {
          status: 'success',
          message: tAction('messages.success_add'),
          redirect_url: '/admin/video-showcases',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
