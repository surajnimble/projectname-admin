'use client';

import { useCallback, useId, useMemo, useState, type FormEvent } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import type { PermissionData } from '@/lib/api/contract';
import { validateSubAdmin } from '@/lib/utils/validations';
import { MESSAGES } from '@/messages';

const { subAdmins } = MESSAGES;

interface SubAdminDialogProps {
  open: boolean;
  mode: 'create' | 'update';
  subAdmin?: { name: string; email: string; phone: string };
  allPermissions?: PermissionData;
  isSubmitting: boolean;
  error: string;
  onClose: () => void;
  onSubmit: (values: {
    name: string;
    email: string;
    phone: string;
    password: string;
    permissions?: string[];
  }) => void;
}

export function SubAdminDialog({
  open,
  mode,
  subAdmin,
  allPermissions,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: SubAdminDialogProps) {
  const formId = useId();
  const [name, setName] = useState(subAdmin?.name ?? '');
  const [email, setEmail] = useState(subAdmin?.email ?? '');
  const [phone, setPhone] = useState(subAdmin?.phone ?? '');
  const [password, setPassword] = useState(mode === 'create' ? '' : '');
  const [permissions, setPermissions] = useState<string[]>([]);
  const [permSearch, setPermSearch] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subAdminPermissions = useMemo(
    () => allPermissions?.roleList['SUB_ADMIN'] ?? [],
    [allPermissions],
  );

  const filteredPermissions = useMemo(
    () => {
      const term = permSearch.toLowerCase().trim();
      return subAdminPermissions.filter((p) => p.toLowerCase().includes(term));
    },
    [permSearch, subAdminPermissions],
  );

  const togglePermission = (permission: string) => {
    setPermissions((prev) =>
      prev.includes(permission)
        ? prev.filter((p) => p !== permission)
        : [...prev, permission],
    );
  };

  const setFieldError = useCallback((field: string, message: string) => {
    setErrors((prev) => ({ ...prev, [field]: message }));
  }, []);

  const clearFieldError = useCallback((field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const result = validateSubAdmin({ name, email, phone, password, mode });
    if (!result.isValid) {
      setFieldError(result.field, result.message);
      return;
    }
    setErrors({});

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      ...(mode === 'create' ? { permissions } : {}),
    });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={mode === 'create' ? subAdmins.createTitle : subAdmins.updateTitle}
      description={
        mode === 'create' ? subAdmins.createDescription : subAdmins.updateDescription
      }
      closeLabel={MESSAGES.common.cancel}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button
            type="submit"
            form={formId}
            variant="primary"
            loading={isSubmitting}
          >
            {mode === 'create' ? subAdmins.created : subAdmins.updated}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <FormError message={error} />}

        <FormField label={subAdmins.nameLabel} error={errors.name}>
          <Input
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              clearFieldError('name');
            }}
            placeholder={subAdmins.namePlaceholder}
            autoFocus
          />
        </FormField>

        <FormField label={subAdmins.emailLabel} error={errors.email}>
          <Input
            type="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              clearFieldError('email');
            }}
            placeholder={subAdmins.emailPlaceholder}
          />
        </FormField>

        <FormField label={subAdmins.phoneLabel} error={errors.phone}>
          <Input
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              clearFieldError('phone');
            }}
            placeholder={subAdmins.phonePlaceholder}
          />
        </FormField>

        {mode === 'create' && (
          <FormField label={subAdmins.passwordLabel} error={errors.password}>
            <Input
              type="password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                clearFieldError('password');
              }}
              placeholder={subAdmins.passwordPlaceholder}
            />
          </FormField>
        )}

        {mode === 'create' && allPermissions && (
          <FormField label={subAdmins.rolesLabel} error={errors.permissions}>
            <div>
              <Input
                type="text"
                value={permSearch}
                onChange={(event) => setPermSearch(event.target.value)}
                placeholder={subAdmins.rolesPlaceholder}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-2">
                {filteredPermissions.map((permission) => {
                  const isSelected = permissions.includes(permission);
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
                {permissions.length} of {subAdminPermissions.length} permissions selected
              </p>
            </div>
          </FormField>
        )}
      </form>
    </Dialog>
  );
}
