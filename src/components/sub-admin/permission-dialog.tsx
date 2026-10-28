'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
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
  const [selected, setSelected] = useState(currentPermissions);
  const [search, setSearch] = useState('');

  const subAdminPermissions = useMemo(
    () => allPermissions.roleList['SUB_ADMIN'] ?? [],
    [allPermissions.roleList],
  );

  const filteredPermissions = useMemo(
    () => {
      const term = search.toLowerCase().trim();
      return subAdminPermissions.filter((p) => p.toLowerCase().includes(term));
    },
    [search, subAdminPermissions],
  );

  const togglePermission = (permission: string) => {
    setSelected((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={subAdmins.updateTitle}
      description={subAdmins.updateDescription}
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
            {subAdmins.updated}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={subAdmins.rolesPlaceholder}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
          {filteredPermissions.map((permission) => {
            const isSelected = selected.includes(permission);
            const label = permission.replace(/:/g, ' : ');
            return (
              <label key={permission} className="flex items-center gap-2 text-sm cursor-pointer select-none">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => togglePermission(permission)}
                />
                <span className="text-fg">{label}</span>
              </label>
            );
          })}
        </div>
        <p className="text-fg-muted text-xs">
          {selected.length} of {subAdminPermissions.length} permissions selected
        </p>
      </div>
    </Dialog>
  );
}
