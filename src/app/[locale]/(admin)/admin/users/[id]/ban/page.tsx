import { getTranslations, setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Empty } from '@/shared/blocks/common';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { FormCard } from '@/shared/blocks/form';
import { findUserById, updateUser } from '@/shared/models/user';
import { Crumb } from '@/shared/types/blocks/common';
import { Form } from '@/shared/types/blocks/form';

export default async function UserBanPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.USERS_WRITE,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const user = await findUserById(id);
  if (!user) {
    return <Empty message="User not found" />;
  }

  const t = await getTranslations('admin.users');

  const crumbs: Crumb[] = [
    { title: t('ban.crumbs.admin'), url: '/admin' },
    { title: t('ban.crumbs.users'), url: '/admin/users' },
    { title: t('ban.crumbs.ban'), is_active: true },
  ];

  const form: Form = {
    fields: [
      {
        name: 'email',
        type: 'text',
        title: t('fields.email'),
        attributes: { disabled: true },
      },
      {
        name: 'banned_reason',
        type: 'textarea',
        title: t('ban.fields.banned_reason'),
        placeholder: t('ban.fields.banned_reason_placeholder'),
        validation: { required: true },
      },
    ],
    passby: {
      id: user.id,
      email: user.email,
      currentBanned: (user as any).banned ?? false,
    },
    data: {
      ...user,
      banned_reason: (user as any).bannedReason ?? '',
    },
    submit: {
      button: {
        title: (user as any).banned ? t('ban.buttons.unban') : t('ban.buttons.ban'),
      },
      handler: async (data, passby) => {
        'use server';

        const tAction = await getTranslations('admin.users');
        const { id, email, currentBanned } = passby;

        if (!id) throw new Error('no auth');

        const newBanned = !currentBanned;
        const bannedReason = newBanned ? (data.get('banned_reason') as string) : null;

        await updateUser(id as string, {
          banned: newBanned,
          bannedReason: bannedReason ?? undefined,
        } as any);

        return {
          status: 'success',
          message: newBanned
            ? tAction('ban.messages.success_ban')
            : tAction('ban.messages.success_unban'),
          redirect_url: `/admin/users?email=${email}`,
        };
      },
    },
  };

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title={(user as any).banned ? t('ban.title_unban') : t('ban.title_ban')} />
        <FormCard form={form} className="md:max-w-xl" />
      </Main>
    </>
  );
}
