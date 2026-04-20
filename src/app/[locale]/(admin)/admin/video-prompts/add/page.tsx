import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { getUuid } from '@/shared/lib/hash';
import { addPrompt, NewPrompt, PromptStatus } from '@/shared/models/prompt';
import { getUserInfo } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function VideoPromptAddPage({
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

  const t = await getTranslations('admin.video-prompts');

  const crumbs: Crumb[] = [
    { title: t('add.crumbs.admin'), url: '/admin' },
    { title: t('add.crumbs.prompts'), url: '/admin/video-prompts' },
    { title: t('add.crumbs.add'), is_active: true },
  ];

  const form: Form = {
    fields: [
      /* {
        name: 'title',
        type: 'text',
        title: 'Title',
        validation: { required: true },
      },
      {
        name: 'description',
        type: 'textarea',
        title: 'Description',
      }, */
      {
        name: 'image',
        type: 'upload_image',
        title: t('fields.image'),
        tip: t('fields.image_tip'),
        validation: { required: true },
      },
      {
        name: 'model',
        type: 'select',
        title: 'Model',
        options: [
          { title: 'Veo 3.1 Lite', value: 'veo_3_1_lite' },
          { title: 'Veo 3.1 Fast', value: 'veo_3_1_fast' },
          { title: 'Veo 3.1 Quality', value: 'veo_3_1_quality' },
          { title: 'Seedance 2.0 Fast', value: 'seedance' },
          { title: 'Seedance 2.0 Standard', value: 'seedance_standard' },
          { title: 'Hailuo 2.3', value: 'hailuo' },
          { title: 'Hailuo 02', value: 'hailuo_02' },
          { title: 'HappyHorse 1.0', value: 'happyhorse' },
        ],
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
    passby: {},
    data: {},
    submit: {
      button: {
        title: t('add.buttons.submit'),
      },
      handler: async (data, passby) => {
        'use server';

        const tAction = await getTranslations('admin.video-prompts');
        const user = await getUserInfo();
        if (!user) {
          throw new Error('no auth');
        }

        const promptTitle = data.get('promptTitle') as string;
        const promptDescription = data.get('promptDescription') as string;
        const image = data.get('image') as string;
        const model = data.get('model') as string;
        const title = promptTitle;
        const description = promptDescription;

        if (!promptTitle?.trim() || !promptDescription?.trim() || !image?.trim()) {
          throw new Error(tAction('add.messages.validation_error'));
        }

        const newPrompt: NewPrompt = {
          id: getUuid(),
          userId: user.id,
          title: title.trim(),
          description: description?.trim() || '',
          image: image?.trim() || '',
          promptTitle: promptTitle.trim(),
          promptDescription: promptDescription?.trim() || '',
          status: PromptStatus.PUBLISHED,
          type: 'video',
          model: model?.trim() || '',
        };

        const result = await addPrompt(newPrompt);

        if (!result) {
          throw new Error(tAction('add.messages.error'));
        }

        return {
          status: 'success',
          message: tAction('add.messages.success'),
          redirect_url: '/admin/video-prompts',
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={t('add.title')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
