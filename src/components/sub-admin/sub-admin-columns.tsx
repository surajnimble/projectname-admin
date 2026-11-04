'use client';

import { Ban, Check, Edit, Key, Trash2 } from 'lucide-react';
import { DataTableColumn } from '@/components/common/data-table';
import { DataTableIdentity, DataTableMedia } from '@/components/common/data-table-media';
import { Badge } from '@/components/ui/badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import type { SubAdminData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const { subAdmins } = MESSAGES;

export const subAdminColumns: readonly DataTableColumn<SubAdminData>[] = [
  {
    key: 'name',
    header: subAdmins.columns.name,
    cell: (subAdmin) => (
      <div className="flex items-center gap-3">
        <DataTableMedia sources={[]} alt={subAdmin.name} />
        <DataTableIdentity title={subAdmin.name || subAdmins.dash} meta={subAdmin.userId} />
      </div>
    ),
  },
  {
    key: 'email',
    header: subAdmins.columns.email,
    hideBelow: 'lg',
    width: 'w-56',
    cell: (subAdmin) => (
      <span className="block truncate">{subAdmin.email || subAdmins.dash}</span>
    ),
  },
  {
    key: 'phone',
    header: subAdmins.columns.phone,
    hideBelow: 'xl',
    width: 'w-40',
    cell: (subAdmin) => (
      <span className="text-fg-muted block truncate tabular-nums">
        {subAdmin.phone || subAdmins.dash}
      </span>
    ),
  },
  {
    key: 'role',
    header: subAdmins.columns.role,
    hideBelow: 'xl',
    width: 'w-28',
    cell: (subAdmin) => (
      <Badge intent="neutral" variant="outline" className="text-xs">
        {subAdmin.role === 'SUPER_ADMIN' ? subAdmins.roleSuperAdmin : subAdmins.roleSubAdmin}
      </Badge>
    ),
  },
  {
    key: 'permissions',
    header: subAdmins.columns.permissions,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (subAdmin) => {
      const permissions = subAdmin.permissions ?? [];
      return (
        <span className="block truncate" title={permissions.join(', ')}>
          {permissions.length > 0
            ? subAdmins.permissionCountLabel(permissions.length)
            : subAdmins.dash}
        </span>
      );
    },
  },
  {
    key: 'status',
    header: subAdmins.columns.status,
    hideBelow: 'lg',
    width: 'w-28',
    cell: (subAdmin) => (
      <Badge intent={subAdmin.isActive ? 'success' : 'neutral'}>
        {subAdmin.isActive ? subAdmins.active : subAdmins.inactive}
      </Badge>
    ),
  },
  {
    key: 'created',
    header: subAdmins.columns.created,
    hideBelow: '2xl',
    width: 'w-32',
    cell: (subAdmin) => (
      <span className="text-fg-muted block whitespace-nowrap">
        {formatRelativeTime(subAdmin.createdAt)}
      </span>
    ),
  },
];

interface SubAdminRowActionsProps {
  subAdmin: SubAdminData;
  onEdit: (subAdmin: SubAdminData) => void;
  onToggle: (subAdmin: SubAdminData) => void;
  onDelete: (subAdmin: SubAdminData) => void;
  onEditPermissions: (subAdmin: SubAdminData) => void;
}

export function SubAdminRowActions({
  subAdmin,
  onEdit,
  onToggle,
  onDelete,
  onEditPermissions,
}: SubAdminRowActionsProps) {
  const items: OptionsMenuItem[] = [
    {
      label: subAdmins.edit,
      icon: Edit,
      onSelect: () => onEdit(subAdmin),
    },
    {
      label: subAdmins.editPermissions,
      icon: Key,
      onSelect: () => onEditPermissions(subAdmin),
    },
    {
      label: subAdmin.isActive ? subAdmins.suspend : subAdmins.reactivate,
      icon: subAdmin.isActive ? Ban : Check,
      intent: subAdmin.isActive ? 'danger' : undefined,
      onSelect: () => onToggle(subAdmin),
    },
    {
      label: subAdmins.delete,
      icon: Trash2,
      intent: 'danger',
      onSelect: () => onDelete(subAdmin),
    },
  ];

  return (
    <OptionsMenu
      label={subAdmins.actionsLabel}
      items={items}
      className="flex justify-end"
    />
  );
}
