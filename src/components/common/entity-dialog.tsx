'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MESSAGES } from '@/messages';
import { FormError } from '@/components/common/form-error';

type FieldType = 'text' | 'textarea' | 'select' | 'switch' | 'number';

interface EntityField {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  options?: readonly { label: string; value: string }[];
  required?: boolean;
}

interface EntityDialogProps {
  open: boolean;
  mode: 'add' | 'edit';
  title: string;
  submitLabel: string;
  fields: EntityField[];
  defaultValues: Record<string, unknown>;
  isSubmitting: boolean;
  error?: string;
  onClose: () => void;
  onSubmit: (values: Record<string, unknown>) => void;
}

export function EntityDialog({
  open,
  mode,
  title,
  submitLabel,
  fields,
  defaultValues,
  isSubmitting,
  error,
  onClose,
  onSubmit,
}: EntityDialogProps) {
  const [values, setValues] = useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const field of fields) {
      const def = defaultValues[field.key];
      if (field.type === 'switch') initial[field.key] = def === true || def === 'true';
      else if (field.type === 'number') initial[field.key] = def !== undefined && def !== '' ? Number(def) : '';
      else initial[field.key] = def ?? '';
    }
    return initial;
  });

  const handleChange = (key: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSubmit(values);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={mode === 'add' ? MESSAGES.common.addNew : MESSAGES.common.editExisting}
      closeLabel={MESSAGES.common.cancel}
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
            {MESSAGES.common.cancel}
          </Button>
          <Button type="submit" form="entity-form" variant="primary" loading={isSubmitting} disabled={isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }
    >
      <form id="entity-form" onSubmit={handleSubmit} className="flex flex-col gap-4 p-4">
        {error && <FormError message={error} />}
        {fields.map((field) => {
          const isRequired = field.required ?? false;
          const baseClass = 'w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50';

          if (field.type === 'switch') {
            return (
              <div key={field.key} className="flex items-center gap-2">
                <Switch
                  id={field.key}
                  checked={values[field.key] === true || values[field.key] === 'true'}
                  onChange={(checked: boolean) => handleChange(field.key, checked)}
                />
                <Label htmlFor={field.key} className="text-sm text-fg">
                  {field.label}
                </Label>
              </div>
            );
          }

          if (field.type === 'select') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key} className="text-sm text-fg">
                  {field.label}{isRequired ? ' *' : ''}
                </Label>
                <Select value={String(values[field.key] ?? '')} onValueChange={(value) => handleChange(field.key, value)}>
                  <SelectTrigger className={baseClass}>
                    <SelectValue placeholder={field.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            );
          }

          if (field.type === 'textarea') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key} className="text-sm text-fg">
                  {field.label}{isRequired ? ' *' : ''}
                </Label>
                <Textarea
                  id={field.key}
                  className={baseClass}
                  placeholder={field.placeholder}
                  value={String(values[field.key] ?? '')}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  rows={3}
                />
              </div>
            );
          }

          if (field.type === 'number') {
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <Label htmlFor={field.key} className="text-sm text-fg">
                  {field.label}{isRequired ? ' *' : ''}
                </Label>
                <Input
                  id={field.key}
                  type="number"
                  className={baseClass}
                  placeholder={field.placeholder}
                  value={values[field.key] === '' ? '' : String(values[field.key])}
                  onChange={(event) => handleChange(field.key, event.target.value)}
                />
              </div>
            );
          }

          return (
            <div key={field.key} className="flex flex-col gap-1.5">
              <Label htmlFor={field.key} className="text-sm text-fg">
                {field.label}{isRequired ? ' *' : ''}
              </Label>
              <Input
                id={field.key}
                className={baseClass}
                placeholder={field.placeholder}
                value={String(values[field.key] ?? '')}
                onChange={(event) => handleChange(field.key, event.target.value)}
                required={isRequired}
              />
            </div>
          );
        })}
      </form>
    </Dialog>
  );
}
