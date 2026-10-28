'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { EmptyState } from '@/components/common/empty-state';
import { ErrorState } from '@/components/common/error-state';
import { Pagination } from '@/components/common/pagination';
import { TableSkeleton } from '@/components/common/table-skeleton';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SubAdminDialog } from '@/components/sub-admin/sub-admin-dialog';
import { SubAdminTable } from '@/components/sub-admin/sub-admin-table';
import { PermissionDialog } from '@/components/sub-admin/permission-dialog';
import { SUB_ADMIN_PAGE_SIZE } from '@/constants';
import { useSubAdmins } from '@/hooks/use-sub-admins';
import type { PermissionData, SubAdminData } from '@/lib/api/contract';
import { showSuccess } from '@/lib/utils/toast';
import { MESSAGES } from '@/messages';
import { ConfirmDialog } from '@/components/common/confirm-dialog';

const { subAdmins } = MESSAGES;

const SUCCESS_MESSAGES = {
  create: subAdmins.created,
  update: subAdmins.updated,
  delete: subAdmins.deleted,
  toggle: subAdmins.toggled,
};

export function SubAdminList() {
  const {
    data,
    isLoading,
    isFetching,
    error,
    isActioning,
    page,
    search,
    isActive,
    setPage: changePage,
    setSearch,
    setIsActive,
    refresh,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    toggleSubAdminStatus,
    getPermissions,
    updatePermissions,
  } = useSubAdmins();
  const [target, setTarget] = useState<SubAdminData | null>(null);
  const [mode, setMode] = useState<'create' | 'update'>('create');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false);
  const [permissionTarget, setPermissionTarget] = useState<SubAdminData | null>(null);
  const [allPermissions, setAllPermissions] = useState<PermissionData>({ roleList: {} });

  useEffect(() => {
    void getPermissions().then((permissions) => {
      setAllPermissions(permissions);
    });
  }, [getPermissions]);

  const handleSubmit = async (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    permissions?: string[];
  }) => {
    if (mode === 'create') {
      const done = await createSubAdmin(values);
      if (!done) return;
      showSuccess(SUCCESS_MESSAGES.create);
    } else {
      if (!target) return;
      const done = await updateSubAdmin(target.userId, {
        name: values.name,
        phone: values.phone,
        email: values.email,
      });
      if (!done) return;
      showSuccess(SUCCESS_MESSAGES.update);
    }
    setDialogOpen(false);
    setTarget(null);
    setMode('create');
  };

  const handleDelete = async () => {
    if (!target) return;
    const done = await deleteSubAdmin(target.userId);
    if (done) showSuccess(SUCCESS_MESSAGES.delete);
    setDeletingId(null);
    setTarget(null);
  };

  const handleToggle = async (subAdmin: SubAdminData) => {
    const done = await toggleSubAdminStatus(subAdmin.userId, subAdmin.isActive);
    if (done) showSuccess(SUCCESS_MESSAGES.toggle);
  };

  const handleEditPermissions = async (subAdmin: SubAdminData) => {
    setPermissionTarget(subAdmin);
    setPermissionDialogOpen(true);
  };

  const handleSavePermissions = async (permissions: string[]) => {
    if (!permissionTarget) return;
    const done = await updatePermissions(permissionTarget.userId, permissions);
    if (done) {
      showSuccess(SUCCESS_MESSAGES.update);
      setPermissionDialogOpen(false);
      setPermissionTarget(null);
      await refresh();
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={subAdmins.title} description={subAdmins.subtitle} />

      <Card className="overflow-hidden">
        <div className="border-border border-b p-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
            <Input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={subAdmins.searchPlaceholder}
              className="max-w-sm shrink-0"
            />
            <Select
              value={isActive}
              onValueChange={(value) => void setIsActive(value ?? '')}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={MESSAGES.common.viewAll} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">{subAdmins.active}</SelectItem>
                <SelectItem value="false">{subAdmins.inactive}</SelectItem>
              </SelectContent>
            </Select>
            <Button
                variant="outline"
                size="sm"
                loading={isLoading || isFetching}
                onClick={() => void refresh()}
                className="shrink-0"
              >
                <RefreshCw className="size-4" aria-hidden="true" />
                {MESSAGES.dashboard.refresh}
              </Button>
              <Button variant="primary" size="sm" onClick={() => {
                setMode('create');
                setTarget(null);
                setDialogOpen(true);
              }}>
                {subAdmins.createTitle}
              </Button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <TableSkeleton rows={5} />
        ) : error ? (
          <div className="p-4">
            <ErrorState message={error} onRetry={() => void refresh()} />
          </div>
        ) : data.itemList.length === 0 ? (
          <div className="p-4">
            <EmptyState title={subAdmins.emptyTitle} description={subAdmins.emptyBody} />
          </div>
        ) : (
          <SubAdminTable
            subAdmins={data.itemList}
            onEdit={(subAdmin) => {
              setMode('update');
              setTarget(subAdmin);
              setDialogOpen(true);
            }}
            onToggle={handleToggle}
            onDelete={(subAdmin) => {
              setTarget(subAdmin);
              setDeletingId(subAdmin.userId);
            }}
            onEditPermissions={handleEditPermissions}
          />
        )}

        <Pagination
          currentPage={data.currentPage || page}
          totalPage={data.totalPage}
          totalRecord={data.totalRecord}
          limit={data.limit || SUB_ADMIN_PAGE_SIZE}
          onPageChange={changePage}
        />
      </Card>

      <SubAdminDialog
        open={dialogOpen}
        mode={mode}
        subAdmin={target ?? undefined}
        allPermissions={allPermissions}
        isSubmitting={isActioning}
        error={MESSAGES.errors.unknown}
        onClose={() => {
          setDialogOpen(false);
          setTarget(null);
          setMode('create');
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title={subAdmins.confirmDelete}
        description={subAdmins.confirmDeleteDescription}
        confirmLabel={subAdmins.delete}
        isSubmitting={isActioning}
        onConfirm={handleDelete}
        onClose={() => {
          setDeletingId(null);
          setTarget(null);
        }}
      />

      <PermissionDialog
        open={permissionDialogOpen}
        currentPermissions={permissionTarget?.permissions ?? []}
        allPermissions={allPermissions}
        isSubmitting={isActioning}
        onClose={() => {
          setPermissionDialogOpen(false);
          setPermissionTarget(null);
        }}
        onSubmit={handleSavePermissions}
      />
    </div>
  );
}
