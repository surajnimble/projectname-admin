'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { useGiftCards } from '@/hooks/use-engagement';
import { usePermission } from '@/hooks/use-permission';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { showSuccess } from '@/lib/utils/toast';
import type { GiftCardData } from '@/lib/api/contract';

const { giftCard } = MESSAGES;

const giftCardColumns: DataTableColumn<GiftCardData>[] = [
  {
    key: 'code',
    header: giftCard.columns.code,
    cell: (row) => <span className="font-medium">{row.code}</span>,
  },
  {
    key: 'name',
    header: giftCard.columns.name,
    cell: (row) => <span className="text-sm">{row.name}</span>,
  },
  {
    key: 'balance',
    header: giftCard.columns.balance,
    align: 'right',
    cell: (row) => <span className="text-sm">{row.balance}</span>,
  },
  {
    key: 'status',
    header: giftCard.columns.status,
    cell: (row) => (
      <Badge intent={row.isActive ? 'success' : 'default'}>
        {row.status}
      </Badge>
    ),
  },
];

export function GiftCardPage() {
  const { can } = usePermission();
  const {
    data,
    isLoading,
    error,
    refresh,
  } = useGiftCards();

  return (
    <div className="p-6">
      <Card className="overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 bg-surface-muted/50">
          <div>
            <h2 className="text-fg font-semibold">{giftCard.title}</h2>
            <p className="text-fg-muted text-sm">{giftCard.subtitle}</p>
          </div>
          {can(PERMISSIONS.giftCardManage) && (
            <Button variant="primary" size="sm" onClick={() => showSuccess(giftCard.messages.created)}>
              {giftCard.actions.create}
            </Button>
          )}
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DataTable
          columns={giftCardColumns}
          rows={data.itemList}
          rowKey={(row) => row.giftCardId}
          toolbar={{
            search: {
              value: '',
              placeholder: giftCard.searchPlaceholder,
              onChange: () => {},
            },
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={giftCard.empty}
        />
      </Card>
    </div>
  );
}
