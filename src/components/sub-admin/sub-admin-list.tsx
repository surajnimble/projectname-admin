'use client';

import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { PageHeader } from '@/components/common/page-header';
import { DataTable } from '@/components/common/data-table';
import { Pagination } from '@/components/common/pagination';
import { SubAdminDialog } from '@/components/sub-admin/sub-admin-dialog';
import { PermissionDialog } from '@/components/sub-admin/permission-dialog';
import { subAdminColumns, SubAdminRowActions } from '@/components/sub-admin/sub-admin-columns';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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

const STATUS_OPTIONS = [
  { value: 'true', label: subAdmins.active },
  { value: 'false', label: subAdmins.inactive },
];

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
    if (!deletingId) return;
    const done = await deleteSubAdmin(deletingId);
    if (done) showSuccess(SUCCESS_MESSAGES.delete);
    setDeletingId(null);
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
    if (!done) return;
    showSuccess(SUCCESS_MESSAGES.update);
    setPermissionDialogOpen(false);
    setPermissionTarget(null);
    await refresh();
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={subAdmins.title} description={subAdmins.subtitle} />

      <Card className="overflow-hidden">
        <DataTable
          columns={subAdminColumns}
          rows={data.itemList}
          rowKey={(subAdmin) => subAdmin.userId}
          toolbar={{
            search: {
              value: search,
              placeholder: subAdmins.searchPlaceholder,
              onChange: setSearch,
            },
            select: {
              value: isActive,
              ariaLabel: subAdmins.statusLabel,
              placeholder: MESSAGES.common.viewAll,
              options: STATUS_OPTIONS,
              onChange: (value) => setIsActive(value),
            },
            actions: (
              <>
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setMode('create');
                    setTarget(null);
                    setDialogOpen(true);
                  }}
                  className="shrink-0"
                >
                  {subAdmins.createTitle}
                </Button>
              </>
            ),
          }}
          actions={{
            header: subAdmins.columns.actions,
            render: (subAdmin) => (
              <SubAdminRowActions
                subAdmin={subAdmin}
                onEdit={(value) => {
                  setMode('update');
                  setTarget(value);
                  setDialogOpen(true);
                }}
                onToggle={(value) => void handleToggle(value)}
                onDelete={(value) => {
                  setTarget(value);
                  setDeletingId(value.userId);
                }}
                onEditPermissions={(value) => void handleEditPermissions(value)}
              />
            ),
          }}
          isLoading={isLoading}
          error={error}
          onRetry={() => void refresh()}
          emptyTitle={subAdmins.emptyTitle}
          emptyDescription={subAdmins.emptyBody}
          footer={
            <Pagination
              currentPage={data.currentPage || page}
              totalPage={data.totalPage}
              totalRecord={data.totalRecord}
              limit={data.limit || SUB_ADMIN_PAGE_SIZE}
              onPageChange={changePage}
            />
          }
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
        }}
        onSubmit={(values) => void handleSubmit(values)}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title={subAdmins.confirmDelete}
        description={subAdmins.confirmDeleteDescription}
        confirmLabel={subAdmins.delete}
        isSubmitting={isActioning}
        onConfirm={() => void handleDelete()}
        onClose={() => setDeletingId(null)}
      />

      <PermissionDialog
        open={permissionDialogOpen}
        currentPermissions={permissionTarget?.permissions ?? []}
        allPermissions={allPermissions}
        isSubmitting={isActioning}
        onClose={() => setPermissionDialogOpen(false)}
        onSubmit={(permissions) => void handleSavePermissions(permissions)}
      />
    </div>
  );
}
