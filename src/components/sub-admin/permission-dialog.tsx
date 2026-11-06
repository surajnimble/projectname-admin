'use client';

import { useMemo, useState } from 'react';
import { PermissionPicker } from '@/components/sub-admin/permission-picker';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import type { PermissionData } from '@/lib/api/contract';
import { MESSAGES } from '@/messages';

const { subAdmins } = MESSAGES;

interface PermissionDialogProps {
  open: boolean;
  currentPermissions: string[];
  allPermissions: PermissionData;
  isSubmitting: boolean;
  onClose: () => void;
  onSubmit: (permissions: string[]) => void;
}

export function PermissionDialog({
  open,
  currentPermissions,
  allPermissions,
  isSubmitting,
  onClose,
  onSubmit,
}: PermissionDialogProps) {
  const initial = useMemo(
    () => [...new Set(currentPermissions)],
    [currentPermissions],
  );
  const [picked, setPicked] = useState<string[] | null>(null);
  const selected = picked ?? initial;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={subAdmins.permissionsTitle}
      description={subAdmins.permissionsDescription}
      closeLabel={MESSAGES.common.cancel}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={() => onSubmit([...selected])}
            loading={isSubmitting}
          >
            {subAdmins.permissionsSave}
          </Button>
        </>
      }
    >
      <PermissionPicker
        available={allPermissions.permissionList}
        selected={selected}
        onChange={setPicked}
      />
    </Dialog>
  );
}
