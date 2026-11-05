'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { useLoyalty } from '@/hooks/use-engagement';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import type { LoyaltyPointsData } from '@/lib/api/contract';

const { loyalty } = MESSAGES;

const loyaltyColumns: DataTableColumn<LoyaltyPointsData['tierList'][number]>[] = [
  {
    key: 'tier',
    header: loyalty.columns.tier,
    cell: (row) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'minPoints',
    header: loyalty.columns.minPoints,
    align: 'right',
    cell: (row) => <span className="text-sm">{row.minPoints}</span>,
  },
  {
    key: 'multiplier',
    header: loyalty.columns.multiplier,
    align: 'right',
    cell: (row) => <span className="text-sm">{row.multiplier}x</span>,
  },
];

export function LoyaltyPage() {
  const { can } = usePermission();
  const {
    points,
    tiers,
    history,
    isLoading,
    error,
    isActioning,
    adjustPoints,
    refresh,
  } = useLoyalty();
  const [adjustUserId, setAdjustUserId] = useState('');
  const [adjustPointsValue, setAdjustPointsValue] = useState('');

  return (
    <div className="p-6">
      <Card className="overflow-hidden mb-4">
        <div className="p-6 bg-surface-muted/50">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h2 className="text-fg font-semibold">{loyalty.title}</h2>
              <p className="text-fg-muted text-sm">{loyalty.subtitle}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{loyalty.fields.balance}</p>
                <h3 className="text-2xl font-bold">{points.balance}</h3>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{loyalty.fields.tier}</p>
                <h3 className="text-2xl font-bold">{points.tier}</h3>
              </div>
              <div className="p-3 bg-background rounded-lg">
                <p className="text-fg-muted text-xs uppercase">{loyalty.fields.totalEarned}</p>
                <h3 className="text-2xl font-bold">{points.totalEarned}</h3>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold">{loyalty.sections.tiers}</h3>
            <DataTable
              columns={loyaltyColumns}
              rows={tiers.loyaltyTierList}
              rowKey={(row) => row.tierId}
              isLoading={isLoading}
              emptyTitle={loyalty.empty}
            />
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="p-4">
            <h3 className="text-lg font-semibold">{loyalty.sections.history}</h3>
            <DataTable
              columns={[
                {
                  key: 'type',
                  header: loyalty.columns.type,
                  cell: (row) => <span className="font-medium capitalize">{row.type}</span>,
                },
                {
                  key: 'points',
                  header: loyalty.columns.points,
                  align: 'right',
                  cell: (row) => <span className="text-sm">{row.points}</span>,
                },
                {
                  key: 'description',
                  header: loyalty.columns.description,
                  cell: (row) => <span className="text-sm text-fg-muted">{row.description}</span>,
                },
                {
                  key: 'createdAt',
                  header: loyalty.columns.createdAt,
                  cell: (row) => <span className="text-sm text-fg-muted">{row.createdAt}</span>,
                },
              ]}
              rows={history.itemList}
              rowKey={(row) => row.transactionId}
              isLoading={isLoading}
              error={error}
              onRetry={() => void refresh()}
              emptyTitle={loyalty.empty}
            />
          </div>
        </Card>

        {can(PERMISSIONS.loyaltyManage) && (
          <Card className="overflow-hidden">
            <div className="p-4">
              <h3 className="text-lg font-semibold">{loyalty.sections.adjustPoints}</h3>
              <p className="text-fg-muted text-sm mb-4">{loyalty.descriptions.adjustPoints}</p>
              <div className="flex flex-col gap-3">
                <Input
                  value={adjustUserId}
                  onChange={(e) => setAdjustUserId(e.target.value)}
                  placeholder={loyalty.fields.userId}
                  disabled={isActioning}
                />
                <Input
                  type="number"
                  value={adjustPointsValue}
                  onChange={(e) => setAdjustPointsValue(e.target.value)}
                  placeholder={loyalty.fields.points}
                  disabled={isActioning}
                />
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    if (!adjustUserId || !adjustPointsValue) return;
                    void adjustPoints(adjustUserId, { points: Number(adjustPointsValue) }).then((done) => {
                      if (done) {
                        setAdjustUserId('');
                        setAdjustPointsValue('');
                        showSuccess(loyalty.messages.pointsAdjusted);
                      }
                    });
                  }}
                  disabled={isActioning || !adjustUserId || !adjustPointsValue}
                  className="w-full"
                >
                  {loyalty.actions.adjust}
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
