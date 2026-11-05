'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { useReferral } from '@/hooks/use-engagement';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import type { ReferralData } from '@/lib/api/contract';

const { referral } = MESSAGES;

const referralColumns: DataTableColumn<ReferralData>[] = [
  {
    key: 'referralCode',
    header: referral.columns.referralCode,
    cell: (row) => <span className="font-medium">{row.referralCode}</span>,
  },
  {
    key: 'referrerId',
    header: referral.columns.referrer,
    cell: (row) => <span className="text-sm">{row.referrerId}</span>,
  },
  {
    key: 'refereeId',
    header: referral.columns.referee,
    cell: (row) => <span className="text-sm">{row.refereeId}</span>,
  },
  {
    key: 'status',
    header: referral.columns.status,
    cell: (row) => (
      <Badge intent={row.status === 'COMPLETED' ? 'success' : 'default'}>
        {row.status}
      </Badge>
    ),
  },
  {
    key: 'rewardEarned',
    header: referral.columns.rewardEarned,
    align: 'right',
    cell: (row) => <span className="text-sm">{row.rewardEarned}</span>,
  },
];

export function ReferralPage() {
  const { can } = usePermission();
  const {
    code,
    rewards,
    leaderboard,
    adminReferrals,
    isLoading,
    error,
    isActioning,
    completeReferral,
    refresh,
  } = useReferral();

  return (
    <div className="p-6">
      <Card className="overflow-hidden mb-4">
        <div className="p-6 bg-surface-muted/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-fg font-semibold">{referral.title}</h2>
              <p className="text-fg-muted text-sm">{referral.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{referral.fields.referralCode}</p>
                <h3 className="text-2xl font-bold">{code.referralCode}</h3>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{referral.fields.referralCount}</p>
                <h3 className="text-2xl font-bold">{code.referralCount}</h3>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{referral.fields.totalEarned}</p>
                <h3 className="text-2xl font-bold">{code.totalEarned}</h3>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold">{referral.sections.rewards}</h3>
            <DataTable
              columns={referralColumns}
              rows={rewards.itemList}
              rowKey={(row) => row.referralId}
              isLoading={isLoading}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={referral.empty}
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold">{referral.sections.leaderboard}</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr>
                    <th className="pb-2 text-fg-muted font-medium">{referral.columns.rank}</th>
                    <th className="pb-2 text-fg-muted font-medium">{referral.columns.user}</th>
                    <th className="pb-2 text-fg-muted font-medium">{referral.columns.referrals}</th>
                    <th className="pb-2 text-fg-muted font-medium">{referral.columns.completed}</th>
                    <th className="pb-2 text-fg-muted font-medium">{referral.columns.earned}</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboard.referralTierList.map((entry) => (
                    <tr key={entry.userId} className="border-b border-border/50">
                      <td className="py-2">{entry.rank}</td>
                      <td className="py-2">{entry.name}</td>
                      <td className="py-2">{entry.referralCount}</td>
                      <td className="py-2">{entry.completedCount}</td>
                      <td className="py-2">{entry.totalEarned}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Card>

        {can(PERMISSIONS.referralManage) && (
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">{referral.sections.adminReferrals}</h3>
              <DataTable
                columns={[
                  ...referralColumns,
                  {
                    key: 'actions',
                    header: referral.columns.actions,
                    align: 'center',
                    cell: (row) => (
                      <div className="flex items-center gap-2">
                        {row.status !== 'COMPLETED' && can(PERMISSIONS.referralManage) && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => void completeReferral(row.referralId)}
                            disabled={isActioning}
                          >
                            {referral.actions.complete}
                          </Button>
                        )}
                      </div>
                    ),
                  },
                ]}
                rows={adminReferrals.itemList}
                rowKey={(row) => row.referralId}
                isLoading={isLoading}
                error={error}
                onRetry={() => void refresh()}
                emptyTitle={referral.empty}
              />
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
