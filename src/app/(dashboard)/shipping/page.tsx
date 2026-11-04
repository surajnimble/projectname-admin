'use client';
import { useState } from 'react';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { SHIPPING_ZONE_PAGE_SIZE } from '@/constants';
import { PERMISSIONS } from '@/constants';
import { useShippingZones } from '@/hooks/use-shipping-zones';
import type { ShippingZoneData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';

const { shipping } = MESSAGES;
const df = shipping;

const columns = [
  {
    key: 'name',
    header: df.columns.name,
    cell: (row: ShippingZoneData) => <span className="font-medium">{row.name}</span>,
  },
  {
    key: 'countries',
    header: df.columns.countries,
    hideBelow: 'lg',
    width: 'w-40',
    cell: (row: ShippingZoneData) => (
      <span className="text-sm truncate">{row.countries.join(', ') || df.fallback}</span>
    ),
  },
  {
    key: 'states',
    header: df.columns.states,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (row: ShippingZoneData) => (
      <span className="text-sm truncate text-fg-muted">{row.states.join(', ') || df.fallback}</span>
    ),
  },
  {
    key: 'cities',
    header: df.columns.cities,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (row: ShippingZoneData) => (
      <span className="text-sm truncate text-fg-muted">{row.cities.join(', ') || df.fallback}</span>
    ),
  },
  {
    key: 'pincodes',
    header: df.columns.pincodes,
    hideBelow: '2xl',
    width: 'w-48',
    cell: (row: ShippingZoneData) => (
      <span className="text-sm truncate text-fg-muted">{row.pincodes.join(', ') || df.fallback}</span>
    ),
  },
  {
    key: 'status',
    header: df.columns.isActive,
    align: 'center',
    hideBelow: '2xl',
    width: 'w-32',
    cell: (row: ShippingZoneData) => (
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

export default function ShippingZonesPage() {
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
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    toggleShippingZoneStatus,
  } = useShippingZones();

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [formValues, setFormValues] = useState<{
    name: string;
    description: string;
    countries: string;
    states: string;
    cities: string;
    pincodes: string;
  }>({
    name: '',
    description: '',
    countries: '',
    states: '',
    cities: '',
    pincodes: '',
  });
  const [confirmDeleteId, setConfirmDeleteId] = useState('');
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const handleCreate = async () => {
    const done = await createShippingZone({
      name: formValues.name.trim(),
      description: formValues.description.trim() || undefined,
      countries: formValues.countries.split(',').map((c) => c.trim()).filter(Boolean),
      states: formValues.states.split(',').map((c) => c.trim()).filter(Boolean),
      cities: formValues.cities.split(',').map((c) => c.trim()).filter(Boolean),
      pincodes: formValues.pincodes.split(',').map((c) => c.trim()).filter(Boolean),
    });
    if (done) {
      setCreateOpen(false);
      setFormValues({ name: '', description: '', countries: '', states: '', cities: '', pincodes: '' });
      showSuccess(df.created);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    const done = await updateShippingZone(editingId, {
      name: formValues.name.trim() || undefined,
      description: formValues.description.trim() || undefined,
      countries: formValues.countries.split(',').map((c) => c.trim()).filter(Boolean),
      states: formValues.states.split(',').map((c) => c.trim()).filter(Boolean),
      cities: formValues.cities.split(',').map((c) => c.trim()).filter(Boolean),
      pincodes: formValues.pincodes.split(',').map((c) => c.trim()).filter(Boolean),
    });
    if (done) {
      setEditOpen(false);
      setEditingId('');
      setFormValues({ name: '', description: '', countries: '', states: '', cities: '', pincodes: '' });
      showSuccess(df.updated);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteId) return;
    const done = await deleteShippingZone(confirmDeleteId);
    if (done) {
      setConfirmDeleteOpen(false);
      setConfirmDeleteId('');
      showSuccess(df.deleted);
    }
  };

  const handleToggle = async (id: string, currentIsActive: boolean) => {
    const done = await toggleShippingZoneStatus(id, currentIsActive);
    if (done) {
      showSuccess(df.toggled);
    }
  };

  const handleEditClick = (row: ShippingZoneData) => {
    setEditingId(row.zoneId);
    setFormValues({
      name: row.name,
      description: row.description,
      countries: row.countries.join(', '),
      states: row.states.join(', '),
      cities: row.cities.join(', '),
      pincodes: row.pincodes.join(', '),
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
            rowKey={(row: ShippingZoneData) => row.zoneId}
            toolbar={{
              filters: {
                label: MESSAGES.common.filters,
                count: hasFilters ? 1 : 0,
                onOpen: () => {},
              },
            }}
            actions={{
              header: df.columns.actions,
              render: (row: ShippingZoneData) => {
                const isActive = row.isActive;
                return (
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(row)} disabled={isActioning}>
                      {df.update}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => void handleToggle(row.zoneId, isActive)} disabled={isActioning}>
                      {isActive ? df.deactivate : df.activate}
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => { setConfirmDeleteId(row.zoneId); setConfirmDeleteOpen(true); }} disabled={isActioning}>
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
                limit={SHIPPING_ZONE_PAGE_SIZE}
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
            <Button type="button" variant="primary" onClick={handleCreate} disabled={isActioning || !formValues.name}>
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleCreate(); }} className="grid gap-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.nameLabel}</Label>
              <Input value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} placeholder={df.namePlaceholder} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-fg block mb-1">{df.descriptionLabel}</Label>
              <Input value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} placeholder={df.descriptionPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.countriesLabel}</Label>
              <Input value={formValues.countries} onChange={(e) => setFormValues({ ...formValues, countries: e.target.value })} placeholder={df.countriesPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.statesLabel}</Label>
              <Input value={formValues.states} onChange={(e) => setFormValues({ ...formValues, states: e.target.value })} placeholder={df.statesPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.citiesLabel}</Label>
              <Input value={formValues.cities} onChange={(e) => setFormValues({ ...formValues, cities: e.target.value })} placeholder={df.citiesPlaceholder} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.pincodesLabel}</Label>
              <Input value={formValues.pincodes} onChange={(e) => setFormValues({ ...formValues, pincodes: e.target.value })} placeholder={df.pincodesPlaceholder} className="w-full" />
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
            <Button type="button" variant="primary" onClick={handleUpdate} disabled={isActioning || !editingId || !formValues.name}>
              {df.save}
            </Button>
          </>
        }
      >
        <form onSubmit={(e) => { e.preventDefault(); void handleUpdate(); }} className="grid gap-4 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.nameLabel}</Label>
              <Input value={formValues.name} onChange={(e) => setFormValues({ ...formValues, name: e.target.value })} className="w-full" />
            </div>
            <div className="md:col-span-2">
              <Label className="text-sm font-medium text-fg block mb-1">{df.descriptionLabel}</Label>
              <Input value={formValues.description} onChange={(e) => setFormValues({ ...formValues, description: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.countriesLabel}</Label>
              <Input value={formValues.countries} onChange={(e) => setFormValues({ ...formValues, countries: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.statesLabel}</Label>
              <Input value={formValues.states} onChange={(e) => setFormValues({ ...formValues, states: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.citiesLabel}</Label>
              <Input value={formValues.cities} onChange={(e) => setFormValues({ ...formValues, cities: e.target.value })} className="w-full" />
            </div>
            <div>
              <Label className="text-sm font-medium text-fg block mb-1">{df.pincodesLabel}</Label>
              <Input value={formValues.pincodes} onChange={(e) => setFormValues({ ...formValues, pincodes: e.target.value })} placeholder={df.pincodesPlaceholder} className="w-full" />
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
          This action cannot be undone. All associated shipping rules will be affected.
        </p>
      </Dialog>
    </div>
  );
}
