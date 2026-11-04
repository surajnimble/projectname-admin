'use client';
import { useState } from 'react';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { StatusBadge, catalogStatusMeta } from '@/components/common/status-badge';
import { EntityDialog } from '@/components/common/entity-dialog';
import { useCatalog } from '@/hooks/use-catalog';
import type { TagData } from '@/lib/api/contract';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export default function TagsPage() {
  const {
    data,
    isLoading,
    error,
    page,
    search,
    setPage,
    setSearch,
    refresh,
    deleteItem,
    createItem,
    updateItem,
    isActioning,
  } = useCatalog({ kind: 'tags' });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmRow, setConfirmRow] = useState<TagData | null>(null);

  const tagFields = [
    { key: 'name', label: MESSAGES.tags.columns.tag, type: 'text' as const, required: true },
    { key: 'slug', label: 'Slug', type: 'text' as const, placeholder: 'auto-generated from name' },
  ];

  const handleAdd = () => {
    setDialogMode('add');
    setEditingId(null);
    setDialogOpen(true);
  };

  const handleEdit = (row: TagData) => {
    setDialogMode('edit');
    setEditingId(row.tagId);
    setDialogOpen(true);
  };

  const handleDelete = (row: TagData) => {
    setConfirmRow(row);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!confirmRow) return;
    setConfirmOpen(false);
    const id = confirmRow.tagId;
    setConfirmRow(null);
    await deleteItem(id);
  };

  const handleSubmit = async (values: Record<string, unknown>) => {
    let ok = false;
    if (dialogMode === 'add') {
      ok = await createItem(values);
    } else if (editingId) {
      ok = await updateItem(editingId, values);
    }
    if (ok) setDialogOpen(false);
  };

  const activeFilterCount = search ? 1 : 0;

  const columns = [
    {
      key: 'tag',
      header: MESSAGES.tags.columns.tag,
      cell: (row: TagData) => <span className="font-medium">{row.name}</span>,
    },
    {
      key: 'slug',
      header: MESSAGES.tags.columns.slug,
      hideBelow: 'lg',
      width: 'w-40',
      cell: (row: TagData) => <span className="text-sm truncate">{row.slug}</span>,
    },
    {
      key: 'products',
      header: 'Products',
      align: 'center',
      hideBelow: '2xl',
      width: 'w-24',
      numeric: true,
      cell: (row: TagData) => <span className="block">{row.productCount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      align: 'center',
      hideBelow: 'lg',
      width: 'w-32',
      cell: (row: TagData) => <StatusBadge meta={catalogStatusMeta(row.isActive ? 'ACTIVE' : 'INACTIVE')} />,
    },
  ] as const;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.tags}
        description={MESSAGES.tags.subtitle}
        action={
          <Button variant="primary" size="sm" onClick={handleAdd}>
            {MESSAGES.common.addNew}
          </Button>
        }
      />
      <PermissionGuard permission={PERMISSIONS.tagManage}>
        <Card className="overflow-hidden">
          <DataTable
            columns={columns}
            rows={data.itemList as TagData[]}
            rowKey={(row: TagData) => row.tagId}
            toolbar={{
              search: {
                value: search,
                placeholder: MESSAGES.common.search,
                onChange: setSearch,
              },
              filters: {
                label: MESSAGES.common.filters,
                count: activeFilterCount,
                onOpen: () => {},
              },
              actions: (
                <Button
                  variant="outline"
                  size="sm"
                  loading={isLoading}
                  onClick={() => void refresh()}
                >
                  {MESSAGES.dashboard.refresh}
                </Button>
              ),
            }}
            actions={{
              header: MESSAGES.common.actions,
              render: (row: TagData) => {
                const items: OptionsMenuItem[] = [
                  {
                    label: 'Edit',
                    onSelect: () => handleEdit(row),
                  },
                  {
                    label: MESSAGES.tags.delete,
                    intent: 'danger',
                    onSelect: () => handleDelete(row),
                  },
                ];
                return (
                  <OptionsMenu label={MESSAGES.common.actions} items={items} className="flex justify-end" />
                );
              },
            }}
            isLoading={isLoading}
            error={error}
            onRetry={() => void refresh()}
            emptyTitle={MESSAGES.tags.empty}
            emptyDescription={MESSAGES.tags.emptyFiltered}
            footer={
              <Pagination
                currentPage={page}
                totalPage={data.totalPage}
                totalRecord={data.totalRecord}
                limit={data.limit}
                onPageChange={setPage}
              />
            }
          />
        </Card>

        <EntityDialog
          open={dialogOpen}
          mode={dialogMode}
          title={dialogMode === 'add' ? MESSAGES.common.addNew : 'Edit Tag'}
          submitLabel={dialogMode === 'add' ? 'Create' : 'Save'}
          fields={tagFields}
          defaultValues={{}}
          isSubmitting={isActioning}
          onClose={() => setDialogOpen(false)}
          onSubmit={handleSubmit}
        />

        <Dialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          title={MESSAGES.tags.delete}
          description={confirmRow ? MESSAGES.tags.deleteConfirm.replace('{name}', confirmRow.name) : ''}
          closeLabel={MESSAGES.common.cancel}
          footer={
            <>
              <Button type="button" variant="outline" onClick={() => setConfirmOpen(false)}>
                {MESSAGES.common.cancel}
              </Button>
              <Button type="button" variant="destructive" onClick={confirmDelete}>
                {MESSAGES.common.delete}
              </Button>
            </>
          }
        />
      </PermissionGuard>
    </div>
  );
}
