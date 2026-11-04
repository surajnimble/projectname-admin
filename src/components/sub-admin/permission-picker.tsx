'use client';

import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { PERMISSION_GROUP_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import { MESSAGES } from '@/messages';

const { subAdmins } = MESSAGES;

interface PermissionPickerProps {
  available: readonly string[];
  selected: readonly string[];
  onChange: (permissions: string[]) => void;
  className?: string;
  id?: string;
  'aria-describedby'?: string;
  'aria-invalid'?: boolean;
}

const groupOf = (permission: string) => permission.split(':')[0] ?? permission;
const actionOf = (permission: string) => permission.split(':').slice(1).join(':');

const groupLabel = (group: string) =>
  PERMISSION_GROUP_LABELS[group] ??
  group.replace(/[-_]/g, ' ').replace(/^./, (char) => char.toUpperCase());

interface PermissionGroup {
  key: string;
  label: string;
  permissions: string[];
}

export function PermissionPicker({
  available,
  selected,
  onChange,
  className,
  id,
  'aria-describedby': ariaDescribedBy,
  'aria-invalid': ariaInvalid,
}: PermissionPickerProps) {
  const [search, setSearch] = useState('');

  const groups = useMemo<PermissionGroup[]>(() => {
    const term = search.trim().toLowerCase();
    const matching = available.filter((permission) =>
      permission.toLowerCase().includes(term),
    );

    const byGroup = new Map<string, string[]>();
    for (const permission of matching) {
      const key = groupOf(permission);
      byGroup.set(key, [...(byGroup.get(key) ?? []), permission]);
    }

    return [...byGroup.entries()].map(([key, permissions]) => ({
      key,
      label: groupLabel(key),
      permissions,
    }));
  }, [available, search]);

  const visiblePermissions = groups.flatMap((group) => group.permissions);

  const toggle = (permission: string) => {
    onChange(
      selected.includes(permission)
        ? selected.filter((item) => item !== permission)
        : [...selected, permission],
    );
  };

  const toggleGroup = (permissions: readonly string[]) => {
    const allGranted = permissions.every((permission) => selected.includes(permission));
    onChange(
      allGranted
        ? selected.filter((permission) => !permissions.includes(permission))
        : [...new Set([...selected, ...permissions])],
    );
  };

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative">
        <Search
          className="text-fg-muted pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2"
          aria-hidden="true"
        />
        <Input
          type="search"
          id={id}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={subAdmins.permissionsPlaceholder}
          aria-label={subAdmins.permissionsSearchLabel}
          className="pl-9"
        />
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-fg-muted text-xs">
          {subAdmins.permissionsCount(selected.length, available.length)}
        </span>
        <div className="ml-auto flex items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={visiblePermissions.length === 0}
            onClick={() => toggleGroup(visiblePermissions)}
          >
            {subAdmins.permissionsSelectAll}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={selected.length === 0}
            onClick={() => onChange([])}
          >
            {subAdmins.permissionsClear}
          </Button>
        </div>
      </div>

      <div className="border-border max-h-80 overflow-y-auto rounded-lg border">
        {groups.length === 0 ? (
          <p className="text-fg-muted px-4 py-8 text-center text-sm">
            {available.length === 0
              ? subAdmins.permissionsNone
              : subAdmins.permissionsEmpty}
          </p>
        ) : (
          groups.map((group) => {
            const granted = group.permissions.filter((permission) =>
              selected.includes(permission),
            ).length;

            return (
              <div key={group.key} className="border-border border-b last:border-b-0">
                <div className="bg-surface-muted flex items-center gap-2 px-4 py-2">
                  <span className="text-fg text-xs font-semibold tracking-wide uppercase">
                    {group.label}
                  </span>
                  <span className="text-fg-muted text-xs">
                    {granted}/{group.permissions.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1 p-2 sm:grid-cols-2">
                  {group.permissions.map((permission) => (
                    <div
                      key={permission}
                      role="presentation"
                      onClick={() => toggle(permission)}
                      className="data-hover-color flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 transition-colors select-none"
                    >
                      <Checkbox
                        checked={selected.includes(permission)}
                        onCheckedChange={() => toggle(permission)}
                        onClick={(event) => event.stopPropagation()}
                        aria-label={permission}
                        className="size-4"
                      />
                      <span className="text-fg-muted truncate text-xs">{group.key}:</span>
                      <span className="text-fg truncate text-xs">{actionOf(permission)}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
