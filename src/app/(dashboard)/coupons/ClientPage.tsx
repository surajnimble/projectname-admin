'use client';

import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COUPON_PAGE_SIZE } from '@/constants';
import { useCoupons } from '@/hooks/use-coupons';
import type { CouponData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { coupons } = MESSAGES;
const df = coupons;

const columns = [
  {
    key: 'code',
    header: df.columns.code,
    cell: (row: CouponData) => <span className="font-medium text-fg-muted">{row.code}</span>,
  },
  {
    key: 'title',
    header: df.columns.title,
    cell: (row: CouponData) => <span className="font-medium">{row.title}</span>,
  },
  {
    key: 'type',
    header: df.columns.type,
    hideBelow: 'lg',
    width: 'w-32',
    cell: (row: CouponData) => <span className="text-sm capitalize">{row.type}</span>,
  },
  {
    key: 'value',
    header: df.columns.value,
    align: 'right',
    hideBelow: 'xl',
    width: 'w-32',
    numeric: true,
    cell: (row: CouponData) => (
      <span className="text-sm">{row.type === 'PERCENT' ? `${row.value}%` : `${row.value}`}</span>
    ),
  },
  {
    key: 'usage',
    header: df.columns.usedCount,
    align: 'center',
    hideBelow: 'xl',
    width: 'w-32',
    cell: (row: CouponData) => (
      <span className="text-sm">{row.usedCount} / {row.usageLimit}</span>
    ),
  },
  {
    key: 'expires',
    header: df.columns.expiresAt,
    hideBelow: '2xl',
    width: 'w-40',
    cell: (row: CouponData) => <span className="text-sm">{row.expiresAt}</span>,
  },
  {
    key: 'status',
    header: df.columns.isActive,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: CouponData) => (
      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs ${row.isActive ? 'border-success/20 text-success bg-success/10' : 'border-muted/30 text-muted'}`}>
        {row.isActive ? df.statusActive : df.statusInactive}
      </span>
    ),
  },
  {
    key: 'actions',
    header: df.columns.actions,
    align: 'center',
    width: 'w-32',
    cell: () => null,
  },
] as const;

export default function ClientCouponsPage() {
  const {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    setPage,
    setSearch,
    refresh,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
  } = useCoupons();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formValues, setFormValues] = useState<{
    code: string;
    title: string;
    description: string;
    type: string;
    value: string;
    minOrderValue: string;
    maxDiscount: string;
    usageLimit: string;
    startsAt: string;
    expiresAt: string;
  }>({
    code: '',
    title: '',
    description: '',
    type: 'PERCENT',
    value: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    startsAt: '',
    expiresAt: '',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleCreate = async () => {
    const done = await createCoupon({
      code: formValues.code.trim(),
      title: formValues.title.trim(),
      description: formValues.description.trim() || undefined,
      type: formValues.type,
      value: Number(formValues.value) || 0,
      minOrderValue: Number(formValues.minOrderValue) || 0,
      maxDiscount: Number(formValues.maxDiscount) || undefined,
      usageLimit: Number(formValues.usageLimit) || undefined,
      startsAt: formValues.startsAt || undefined,
      expiresAt: formValues.expiresAt || undefined,
    });
    if (done) {
      setCreateOpen(false);
      setFormValues({
        code: '',
        title: '',
        description: '',
        type: 'PERCENT',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        startsAt: '',
        expiresAt: '',
      });
      showSuccess(df.created);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const done = await updateCoupon(editingId, {
      code: formValues.code.trim() || undefined,
      title: formValues.title.trim() || undefined,
      description: formValues.description.trim() || undefined,
      type: formValues.type || undefined,
      value: Number(formValues.value) || undefined,
      minOrderValue: Number(formValues.minOrderValue) || undefined,
      maxDiscount: Number(formValues.maxDiscount) || undefined,
      usageLimit: Number(formValues.usageLimit) || undefined,
      startsAt: formValues.startsAt || undefined,
      expiresAt: formValues.expiresAt || undefined,
    });
    if (done) {
      setEditOpen(false);
      setEditingId('');
      setFormValues({
        code: '',
        title: '',
        description: '',
        type: 'PERCENT',
        value: '',
        minOrderValue: '',
        maxDiscount: '',
        usageLimit: '',
        startsAt: '',
        expiresAt: '',
      });
      showSuccess(df.updated);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const done = await deleteCoupon(confirmDeleteId);
    if (done) {
      setConfirmDeleteOpen(false);
      setConfirmDeleteId('');
      showSuccess(df.deleted);
    }
  };

  const handleToggle = async (id: string, currentIsActive: boolean) => {
    const done = await toggleCouponStatus(id, !currentIsActive);
    if (done) {
      showSuccess(df.toggled);
    }
  };

  const handleEditClick = (row: CouponData) => {
    setEditingId(row.couponId);
    setFormValues({
      code: row.code,
      title: row.title,
      description: row.description,
      type: row.type,
      value: String(row.value),
      minOrderValue: String(row.minOrderValue),
      maxDiscount: String(row.maxDiscount),
      usageLimit: String(row.usageLimit),
      startsAt: row.startsAt,
      expiresAt: row.expiresAt,
    });
    setEditOpen(true);
  };

  const hasFilters = search !== '';

  return (
    <div className="flex min-h-0 flex-col">
      <div className="flex flex-col gap-2 shrink-0">
        <h1 className="text-fg text-2xl font-semibold tracking-tight">{df.title}</h1>
        <p className="text-fg-muted text-sm">{df.subtitle}</p>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <div className="flex flex-col gap-4 md:flex-row md:items-center justify-between p-4 border-b border-border bg-background/50">
            <div className="relative w-full sm:w-auto max-w-md">
              <Input
                placeholder={df.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
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
              <Button variant="primary" size="sm" onClick={() => setCreateOpen(true)} disabled={isActioning}>
                {df.create}
              </Button>
            </div>
          </div>

          <DataTable
            columns={columns}
            rows={data.itemList}
            rowKey={(row: CouponData) => row.couponId}
            toolbar={{
              filters: {
                label: MESSAGES.common.filters,
                count: hasFilters ? 1 : 0,
                onOpen: () => {},
              },
            }}
            actions={{
              header: df.columns.actions,
              render: (row: CouponData) => {
                const isActive = row.isActive;
                return (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(row)} disabled={isActioning}>
                      {df.update}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void handleToggle(row.couponId, isActive)} disabled={isActioning}>
                      {isActive ? df.deactivate : df.activate}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setConfirmDeleteId(row.couponId); setConfirmDeleteOpen(true); }} disabled={isActioning}>
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
                limit={COUPON_PAGE_SIZE}
                onPageChange={setPage}
              />
            }
          />
        </div>
      </Card>

      {actionError && <div className="p-4 text-destructive text-sm">{actionError}</div>}

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
            <Button type="button" variant="primary" onClick={handleCreate} disabled={isActioning || !formValues.code || !formValues.title}>
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleCreate(); }} className="grid gap-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.codeLabel}</Label>
              <Input value={formValues.code} onChange={(e) => setFormValues({ ...formValues, code: e.target.value })} placeholder={df.codePlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.titleLabel}</Label>
              <Input value={formValues.title} onChange={(e) => setFormValues({ ...formValues, title: e.target.value })} placeholder={df.titlePlaceholder} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-fg block mb-1">{df.descriptionLabel}</Label>
              <Input value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} placeholder={df.descriptionPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.typeLabel}</Label>
              <Input value={formValues.type} onChange={(e) => setFormValues({ ...formValues, type: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.valueLabel}</Label>
              <Input type="number" value={formValues.value} onChange={(e) => setFormValues({ ...formValues, value: e.target.value })} placeholder={df.valuePlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.minOrderValueLabel}</Label>
              <Input type="number" value={formValues.minOrderValue} onChange={(e) => setFormValues({ ...formValues, minOrderValue: e.target.value })} placeholder={df.minOrderValuePlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.maxDiscountLabel}</Label>
              <Input type="number" value={formValues.maxDiscount} onChange={(e) => setFormValues({ ...formValues, maxDiscount: e.target.value })} placeholder={df.maxDiscountPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.usageLimitLabel}</Label>
              <Input type="number" value={formValues.usageLimit} onChange={(e) => setFormValues({ ...formValues, usageLimit: e.target.value })} placeholder={df.usageLimitPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.startsAtLabel}</Label>
              <Input type="datetime-local" value={formValues.startsAt} onChange={(e) => setFormValues({ ...formValues, startsAt: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.expiresAtLabel}</Label>
              <Input type="datetime-local" value={formValues.expiresAt} onChange={(e) => setFormValues({ ...formValues, expiresAt: e.target.value })} className="w-full" />
            </div>
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
            <Button type="button" variant="primary" onClick={handleUpdate} disabled={isActioning || !editingId || !formValues.code || !formValues.title}>
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleUpdate(); }} className="grid gap-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.codeLabel}</Label>
              <Input value={formValues.code} onChange={(e) => setFormValues({ ...formValues, code: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.titleLabel}</Label>
              <Input value={formValues.title} onChange={(e) => setFormValues({ ...formValues, title: e.target.value })} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-fg block mb-1">{df.descriptionLabel}</Label>
              <Input value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.typeLabel}</Label>
              <Input value={formValues.type} onChange={(e) => setFormValues({ ...formValues, type: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.valueLabel}</Label>
              <Input type="number" value={formValues.value} onChange={(e) => setFormValues({ ...formValues, value: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.minOrderValueLabel}</Label>
              <Input type="number" value={formValues.minOrderValue} onChange={(e) => setFormValues({ ...formValues, minOrderValue: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.maxDiscountLabel}</Label>
              <Input type="number" value={formValues.maxDiscount} onChange={(e) => setFormValues({ ...formValues, maxDiscount: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.usageLimitLabel}</Label>
              <Input type="number" value={formValues.usageLimit} onChange={(e) => setFormValues({ ...formValues, usageLimit: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.startsAtLabel}</Label>
              <Input type="datetime-local" value={formValues.startsAt} onChange={(e) => setFormValues({ ...formValues, startsAt: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.expiresAtLabel}</Label>
              <Input type="datetime-local" value={formValues.expiresAt} onChange={(e) => setFormValues({ ...formValues, expiresAt: e.target.value })} className="w-full" />
            </div>
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
            <Button type="button" variant="destructive" onClick={handleDelete} disabled={isActioning || !confirmDeleteId}>
              {df.delete}
            </Button>
          </>
        }
      >
        <p className="p-6 text-sm text-fg-muted">
          This action cannot be undone. All associated usages will be affected.
        </p>
      </Dialog>
    </div>
  );
}
