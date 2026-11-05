'use client';

import { useState } from 'react';
import { DataTable, type DataTableColumn } from '@/components/common/data-table';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { PERMISSIONS } from '@/constants';
import { useFlashSales } from '@/hooks/use-flash-sales';
import { usePermission } from '@/hooks/use-permission';
import { showSuccess } from '@/lib/utils/toast';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';
import { FlashSaleDialog } from './flash-sale-dialog';
import type { FlashSaleData, ApiRequest } from '@/lib/api/contract';

const { flashSales } = MESSAGES;

const flashSaleColumns: DataTableColumn<FlashSaleData>[] = [
  {
    key: 'name',
    header: flashSales.columns.name,
    width: 'w-48',
    cell: (item) => <div className="font-medium text-fg">{item.name}</div>,
  },
  {
    key: 'slug',
    header: flashSales.columns.slug,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (item) => <span className="text-fg-muted text-sm">{item.slug}</span>,
  },
  {
    key: 'discount',
    header: flashSales.columns.discount,
    width: 'w-32',
    cell: (item) => (
      <span className="text-fg">
        {item.discountType === 'PERCENT' ? `${item.discountValue}%` : item.discountValue}
      </span>
    ),
  },
  {
    key: 'status',
    header: flashSales.columns.status,
    width: 'w-40',
    cell: (item) => (
      <Badge intent={item.isLive ? 'success' : item.isUpcoming ? 'warning' : 'default'}>
        {item.isLive ? flashSales.statuses.live : item.isUpcoming ? flashSales.statuses.upcoming : flashSales.statuses.inactive}
      </Badge>
    ),
  },
  {
    key: 'startsAt',
    header: flashSales.columns.startsAt,
    hideBelow: 'lg',
    width: 'w-48',
    cell: (item) => <span className="text-fg-muted text-sm">{formatRelativeTime(item.startsAt)}</span>,
  },
  {
    key: 'endsAt',
    header: flashSales.columns.endsAt,
    hideBelow: 'lg',
    width: 'w-48',
    cell: (item) => <span className="text-fg-muted text-sm">{formatRelativeTime(item.endsAt)}</span>,
  },
];

export function FlashSaleList() {
  const { can } = usePermission();
  const [editing, setEditing] = useState<FlashSaleData | undefined>(undefined);
  const [open, setOpen] = useState(false);
  const {
    data,
    isLoading,
    error,
    isActioning,
    createFlashSale,
    updateFlashSale,
  } = useFlashSales();

  const handleCreate = () => {
    setEditing(undefined);
    setOpen(true);
  };

  const handleSubmit = async (values: ApiRequest) => {
    if (editing) {
      const done = await updateFlashSale(editing.flashSaleId, values);
      if (done) showSuccess(flashSales.updated);
    } else {
      const done = await createFlashSale(values);
      if (done) showSuccess(flashSales.created);
    }
    setOpen(false);
    setEditing(undefined);
  };

  return (
    <div className="p-6">
      <Card className="overflow-hidden mb-4">
        <div className="flex items-center justify-between p-4 bg-surface-muted/50">
          <div>
            <h2 className="text-fg font-semibold">{flashSales.title}</h2>
            <p className="text-fg-muted text-sm">{flashSales.subtitle}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={handleCreate}
            disabled={!can(PERMISSIONS.flashSaleManage)}
          >
            {flashSales.createButton}
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <DataTable
          columns={flashSaleColumns}
          rows={data.itemList}
          rowKey={(item) => item.flashSaleId}
          toolbar={{
            search: {
              value: '',
              placeholder: flashSales.searchPlaceholder,
              onChange: () => {},
            },
          }}
          isLoading={isLoading}
          error={error}
          emptyTitle={error ? flashSales.error : flashSales.empty}
        />
      </Card>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        title={editing ? flashSales.editTitle : flashSales.createTitle}
      >
        <FlashSaleDialog
          open={open}
          flashSale={editing}
          isSubmitting={isActioning}
          error={error}
          onClose={() => setOpen(false)}
          onSubmit={handleSubmit}
        />
      </Dialog>
    </div>
  );
}
