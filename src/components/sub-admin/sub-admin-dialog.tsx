'use client';

import { useCallback, useId, useMemo, useState, type FormEvent } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { PermissionPicker } from '@/components/sub-admin/permission-picker';
import { Button } from '@/components/ui/button';
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
  const [errors, setErrors] = useState<Record<string, string>>({});

  const grantedPermissions = useMemo(
    () => allPermissions?.roleList['SUB_ADMIN'] ?? [],
    [allPermissions],
  );
  const [picked, setPicked] = useState<string[] | null>(null);
  const permissions = picked ?? grantedPermissions;

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
            {mode === 'create' ? subAdmins.createLabel : subAdmins.updateLabel}
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

        {mode === 'create' || mode === 'update' ? (
            <FormField label={subAdmins.passwordLabel} error={errors.password} hint={mode === 'update' ? subAdmins.passwordOptionalHint : undefined}>
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
        ) : null}

        {mode === 'create' && allPermissions && (
          <FormField
            label={subAdmins.permissionsLabel}
            hint={subAdmins.permissionsHint}
            error={errors.permissions}
          >
            <PermissionPicker
              available={allPermissions.permissionList}
              selected={permissions}
              onChange={setPicked}
            />
          </FormField>
        )}
      </form>
    </Dialog>
  );
}
