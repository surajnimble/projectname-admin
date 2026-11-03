'use client';

import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DELIVERY_BOY_PAGE_SIZE } from '@/constants';
import { useDeliveryBoys } from '@/hooks/use-delivery-boys';
import type { DeliveryBoyData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { deliveryBoys } = MESSAGES;
const df = deliveryBoys;

const STATUS_FILTERS = [
  { value: 'all', label: df.columns.status },
  { value: 'active', label: df.statusActive },
  { value: 'inactive', label: df.statusInactive },
] as const;

type DeliveryBoyFormValues = {
  name: string;
  phone: string;
  email: string;
  maxOrders: string;
};

const columns = [
  {
    key: 'name',
    header: df.columns.name,
    cell: (row: DeliveryBoyData) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'phone',
    header: df.columns.phone,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (row: DeliveryBoyData) => <span className="text-sm truncate">{row.phone}</span>,
  },
  {
    key: 'email',
    header: df.columns.email,
    hideBelow: 'xl',
    width: 'w-48',
    cell: (row: DeliveryBoyData) => <span className="text-sm truncate">{row.email || df.dash}</span>,
  },
  {
    key: 'status',
    header: df.columns.status,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${row.isActive ? 'border-success/20 text-success bg-success/10' : 'border-muted/30 text-muted'}`}>
        {row.isActive ? df.statusActive : df.statusInactive}
      </span>
    ),
  },
  {
    key: 'orders',
    header: df.columns.orders,
    align: 'center',
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => <span className="text-sm">{row.currentOrderCount}</span>,
  },
  {
    key: 'maxOrders',
    header: df.columns.maxOrders,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: DeliveryBoyData) => <span className="text-sm">{row.maxOrders}</span>,
  },
  {
    key: 'actions',
    header: df.columns.actions,
    align: 'center',
    width: 'w-32',
    cell: () => null,
  },
] as const;

export function DeliveryBoyPage() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    refresh,
    createDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy,
    toggleDeliveryBoyStatus,
  } = useDeliveryBoys();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formValues, setFormValues] = useState<DeliveryBoyFormValues>({
    name: '',
    phone: '',
    email: '',
    maxOrders: '5',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleCreate = async () => {
    const done = await createDeliveryBoy({
      name: formValues.name.trim(),
      phone: formValues.phone.trim(),
      email: formValues.email.trim() || undefined,
      maxOrders: Number(formValues.maxOrders) || 5,
    });
    if (done) {
      setCreateOpen(false);
      setFormValues({ name: '', phone: '', email: '', maxOrders: '5' });
      showSuccess(df.created);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const done = await updateDeliveryBoy(editingId, {
      name: formValues.name.trim() || undefined,
      phone: formValues.phone.trim() || undefined,
      email: formValues.email.trim() || undefined,
      maxOrders: Number(formValues.maxOrders) || 5,
    });
    if (done) {
      setEditOpen(false);
      setEditingId('');
      setFormValues({ name: '', phone: '', email: '', maxOrders: '5' });
      showSuccess(df.updated);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const done = await deleteDeliveryBoy(confirmDeleteId);
    if (done) {
      setConfirmDeleteOpen(false);
      setConfirmDeleteId('');
      showSuccess(df.deleted);
    }
  };

  const handleToggle = async (id: string, currentIsActive: boolean) => {
    const done = await toggleDeliveryBoyStatus(id, !currentIsActive);
    if (done) {
      showSuccess(df.toggled);
    }
  };

  const handleEditClick = (row: DeliveryBoyData) => {
    setEditingId(row.deliveryBoyId);
    setFormValues({
      name: row.name,
      phone: row.phone,
      email: row.email,
      maxOrders: String(row.maxOrders),
    });
    setEditOpen(true);
  };

  const hasFilters = search !== '' || status !== 'all';

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{df.title}</h1>
        <p className="text-fg-muted text-sm">{df.subtitle}</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 border-b border-border bg-background/50">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <Input
                placeholder={df.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full sm:w-auto max-w-md pl-9"
              />
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="border border-input bg-background rounded-md px-2 py-1 text-sm text-fg focus:ring-2 focus:ring-ring focus:border-ring outline-none"
              >
                {STATUS_FILTERS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void refresh()}
                disabled={isLoading || isActioning}
                loading={isLoading}
              >
                {MESSAGES.dashboard.refresh}
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setCreateOpen(true)}
                disabled={isActioning}
              >
                {df.create}
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: DeliveryBoyData) => row.deliveryBoyId}
            toolbar={{
              filters: {
                label: MESSAGES.common.filters,
                count: hasFilters ? 1 : 0,
                onOpen: () => {},
              },
            }}
            actions={{
              header: df.columns.actions,
              render: (row: DeliveryBoyData) => {
                const isActive = row.isActive;
                return (
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditClick(row)}
                      disabled={isActioning}
                    >
                      {df.update}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void handleToggle(row.deliveryBoyId, isActive)}
                      disabled={isActioning}
                    >
                      {isActive ? df.deactivate : df.activate}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setConfirmDeleteId(row.deliveryBoyId);
                        setConfirmDeleteOpen(true);
                      }}
                      disabled={isActioning}
                    >
                      {df.delete}
                    </Button>
                  </div>
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={df.empty}
            emptyDescription={hasFilters ? df.emptyFiltered : undefined}
            footer={
              <Pagination
                currentPage={page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={DELIVERY_BOY_PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </div>
      </Card>

      {actionError && (
        <div className="p-4 text-destructive text-sm">{actionError}</div>
      )}

      <Dialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title={df.createTitle}
        description={df.createDescription}
        closeLabel={MESSAGES.common.cancel}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setCreateOpen(false)}>
              {MESSAGES.common.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleCreate}
              disabled={isActioning || !formValues.name || !formValues.phone}
            >
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleCreate(); }} className="grid gap-4 p-6">
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.nameLabel}</Label>
            <Input
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              placeholder={df.namePlaceholder}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.phoneLabel}</Label>
            <Input
              value={formValues.phone}
              onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              placeholder={df.phonePlaceholder}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.emailLabel}</Label>
            <Input
              value={formValues.email}
              onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              placeholder={df.emailPlaceholder}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.maxOrdersLabel}</Label>
            <Input
              type="number"
              value={formValues.maxOrders}
              onChange={(e) => setFormValues({ ...formValues, maxOrders: e.target.value })}
              placeholder={df.maxOrdersPlaceholder}
              className="w-full"
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title={df.update}
        description={editingId}
        closeLabel={MESSAGES.common.cancel}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>
              {MESSAGES.common.cancel}
            </Button>
            <Button
              type="button"
              variant="primary"
              onClick={handleUpdate}
              disabled={isActioning || !editingId || !formValues.name || !formValues.phone}
            >
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleUpdate(); }} className="grid gap-4 p-6">
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.nameLabel}</Label>
            <Input
              value={formValues.name}
              onChange={(e) => setFormValues({ ...formValues, name: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.phoneLabel}</Label>
            <Input
              value={formValues.phone}
              onChange={(e) => setFormValues({ ...formValues, phone: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.emailLabel}</Label>
            <Input
              value={formValues.email}
              onChange={(e) => setFormValues({ ...formValues, email: e.target.value })}
              className="w-full"
            />
          </div>
          <div>
            <Label className="text-sm font-medium text-fg block mb-1">{df.maxOrdersLabel}</Label>
            <Input
              type="number"
              value={formValues.maxOrders}
              onChange={(e) => setFormValues({ ...formValues, maxOrders: e.target.value })}
              className="w-full"
            />
          </div>
        </form>
      </Dialog>

      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        title={df.deleteConfirm}
        closeLabel={MESSAGES.common.cancel}
        footer={
          <>
            <Button type="button" variant="outline" onClick={() => setConfirmDeleteOpen(false)}>
              {MESSAGES.common.cancel}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleDelete}
              disabled={isActioning || !confirmDeleteId}
            >
              {df.delete}
            </Button>
          </>
        }
      >
        <p className="p-6 text-sm text-fg-muted">
          This action cannot be undone. All associated orders will be affected.
        </p>
      </Dialog>
    </div>
  );
}
