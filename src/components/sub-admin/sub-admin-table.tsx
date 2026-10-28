'use client';

import { Ban, Check, Edit, Key, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { OptionsMenu, type OptionsMenuItem } from '@/components/ui/options-menu';
import { Thumbnail } from '@/components/ui/thumbnail';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SubAdminData } from '@/lib/api/contract';
import { formatRelativeTime } from '@/lib/utils/datetime';
import { MESSAGES } from '@/messages';

const { subAdmins } = MESSAGES;

interface SubAdminRowActionsProps {
  subAdmin: SubAdminData;
  onEdit: (subAdmin: SubAdminData) => void;
  onToggle: (subAdmin: SubAdminData) => void;
  onDelete: (subAdmin: SubAdminData) => void;
  onEditPermissions: (subAdmin: SubAdminData) => void;
}

function SubAdminRowActions({
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
      label: 'Edit permissions',
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

interface SubAdminTableProps {
  subAdmins: SubAdminData[];
  onEdit: (subAdmin: SubAdminData) => void;
  onToggle: (subAdmin: SubAdminData) => void;
  onDelete: (subAdmin: SubAdminData) => void;
  onEditPermissions: (subAdmin: SubAdminData) => void;
}

export function SubAdminTable({
  subAdmins: items,
  onEdit,
  onToggle,
  onDelete,
  onEditPermissions,
}: SubAdminTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{subAdmins.columns.name}</TableHead>
          <TableHead>{subAdmins.columns.email}</TableHead>
          <TableHead className="hidden sm:table-cell">{subAdmins.columns.phone}</TableHead>
          <TableHead className="hidden md:table-cell">{subAdmins.columns.role}</TableHead>
          <TableHead className="hidden lg:table-cell">{subAdmins.columns.permissions}</TableHead>
          <TableHead className="hidden xl:table-cell">{subAdmins.columns.status}</TableHead>
          <TableHead className="hidden xl:table-cell">{subAdmins.columns.created}</TableHead>
          <TableHead className="text-right">{subAdmins.columns.actions}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((subAdmin) => (
          <TableRow key={subAdmin.userId} className="transition-colors" data-ripple="">
            <TableCell>
              <div className="flex items-center gap-3">
                <Thumbnail src={undefined} alt={subAdmin.name} className="size-8" />
                <div className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-fg text-sm font-medium truncate">
                    {subAdmin.name || subAdmins.columns.name}
                  </span>
                  <span className="text-fg-muted text-xs truncate">
                    {subAdmin.userId}
                  </span>
                </div>
              </div>
            </TableCell>
            <TableCell>
              <span className="text-fg text-sm truncate">
                {subAdmin.email || subAdmins.columns.email}
              </span>
            </TableCell>
            <TableCell className="hidden sm:table-cell">
              <span className="text-fg-muted text-sm">{subAdmin.phone || subAdmins.columns.phone}</span>
            </TableCell>
            <TableCell className="hidden md:table-cell">
              <Badge intent="neutral" variant="outline" className="text-xs">
                {subAdmin.role === 'SUPER_ADMIN' ? subAdmins.roleSuperAdmin : subAdmins.roleSubAdmin}
              </Badge>
            </TableCell>
            <TableCell className="hidden lg:table-cell">
              <span className="text-fg text-xs truncate" title={subAdmin.permissions.join(', ')}>
                {subAdmin.permissions.length > 0
                  ? `${subAdmin.permissions.length} permission${subAdmin.permissions.length > 1 ? 's' : ''}`
                  : subAdmins.dash}
              </span>
            </TableCell>
            <TableCell className="hidden xl:table-cell">
              <Badge intent={subAdmin.isActive ? 'success' : 'neutral'}>
                {subAdmin.isActive ? subAdmins.active : subAdmins.inactive}
              </Badge>
            </TableCell>
            <TableCell className="text-fg-muted hidden whitespace-nowrap xl:table-cell">
              {formatRelativeTime(subAdmin.createdAt)}
            </TableCell>
            <TableCell className="relative z-10" onClick={(event) => event.stopPropagation()}>
              <SubAdminRowActions
                subAdmin={subAdmin}
                onEdit={onEdit}
                onToggle={onToggle}
                onDelete={onDelete}
                onEditPermissions={onEditPermissions}
              />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
