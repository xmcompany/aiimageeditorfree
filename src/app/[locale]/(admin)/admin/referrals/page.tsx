import { setRequestLocale } from 'next-intl/server';

import { PERMISSIONS, requirePermission } from '@/core/rbac';
import { Header, Main, MainHeader } from '@/shared/blocks/dashboard';
import { Pagination } from '@/shared/blocks/common';
import { Badge } from '@/shared/components/ui/badge';
import { getAllReferrals, getReferralsCount } from '@/shared/models/referral';
import { Crumb } from '@/shared/types/blocks/common';
import { Coins } from 'lucide-react';

export default async function ReferralsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: number; pageSize?: number }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  await requirePermission({
    code: PERMISSIONS.PAYMENTS_READ,
    redirectUrl: '/admin/no-permission',
    locale,
  });

  const { page: pageNum, pageSize } = await searchParams;
  const page = pageNum || 1;
  const limit = pageSize || 30;

  const crumbs: Crumb[] = [
    { title: 'Admin', url: '/admin' },
    { title: 'Referrals', is_active: true },
  ];

  const [referrals, total] = await Promise.all([
    getAllReferrals({ page, limit }),
    getReferralsCount(),
  ]);

  const totalRewardedCredits = referrals
    .filter(r => r.status === 'rewarded')
    .reduce((sum, r) => sum + (r.rewardCredits ?? 0), 0);

  const totalRewarded = referrals.filter(r => r.status === 'rewarded').length;
  const totalPending = referrals.filter(r => r.status === 'pending').length;

  return (
    <>
      <Header crumbs={crumbs} />
      <Main>
        <MainHeader title="Referrals" />
        <div className="space-y-4 p-4">

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Total Referrals', value: total },
              { label: 'Converted (Paid)', value: totalRewarded },
              { label: 'Pending', value: totalPending },
              { label: 'Credits Rewarded', value: totalRewardedCredits, icon: true },
            ].map(stat => (
              <div key={stat.label} className="bg-card rounded-lg border p-4">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="text-2xl font-bold mt-1 flex items-center gap-1">
                  {stat.icon && <Coins className="h-5 w-5 text-primary" />}
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Table */}
          <div className="bg-card rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Referrer</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Referee (Invited)</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Reward</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Order</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Joined</th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Rewarded At</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-muted-foreground">
                      No referral records found
                    </td>
                  </tr>
                ) : (
                  referrals.map(r => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.referrerName || '-'}</div>
                        <div className="text-xs text-muted-foreground">{r.referrerEmail || r.referrerId.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{r.referee?.name || '-'}</div>
                        <div className="text-xs text-muted-foreground">{r.referee?.email || r.refereeId.slice(0, 8)}</div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={r.status === 'rewarded' ? 'default' : 'secondary'} className="text-xs">
                          {r.status === 'rewarded' ? 'Paid & Rewarded' : 'Pending'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {r.status === 'rewarded' ? (
                          <span className="flex items-center gap-1 text-primary font-medium">
                            <Coins className="h-3.5 w-3.5" />
                            +{r.rewardCredits}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs text-muted-foreground">
                          {r.orderNo ? r.orderNo.slice(0, 16) + '…' : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">
                        {r.rewardedAt ? new Date(r.rewardedAt).toLocaleDateString() : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <Pagination total={total} page={page} limit={limit} />
        </div>
      </Main>
    </>
  );
}
