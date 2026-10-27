'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';
import { FormError } from '@/components/common/form-error';
import { FormField } from '@/components/common/form-field';
import { PasswordInput } from '@/components/common/password-input';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Input } from '@/components/ui/input';
import { QUERY_PARAMS, ROUTES, TIMING } from '@/constants';
import { useLogin } from '@/hooks/use-login';
import { validateLogin, type ValidationField } from '@/lib/utils/validations';
import { MESSAGES } from '@/messages';

const safeNext = (value: string | null) => value && value.startsWith('/') && !value.startsWith('//') ? value : ROUTES.home;

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { login, isLoading, error } = useLogin();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [invalid, setInvalid] = useState<{ field: ValidationField; message: string }>({
    field: '',
    message: '',
  });
  const [slow, setSlow] = useState(false);

  useEffect(() => {
    if (!isLoading) return;
    const timer = window.setTimeout(() => setSlow(true), TIMING.slowRequestHintMs);
    return () => {
      window.clearTimeout(timer);
      setSlow(false);
    };
  }, [isLoading]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const result = validateLogin(identifier, password);
    setInvalid({ field: result.field, message: result.message });
    if (!result.isValid) return;

    if (await login(identifier, password)) {
      router.replace(safeNext(params.get(QUERY_PARAMS.next)));
    }
  };

  const { auth, common } = MESSAGES;

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{auth.loginTitle}</h1>
        <p className="text-fg-muted text-sm">{auth.loginSubtitle}</p>
      </div>

      <FormField
        label={auth.identifierLabel}
        error={invalid.field === 'identifier' ? invalid.message : ''}
      >
        <Input
          type="text"
          inputMode="email"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={auth.identifierPlaceholder}
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
        />
      </FormField>

      <FormField
        label={auth.passwordLabel}
        error={invalid.field === 'password' ? invalid.message : ''}
      >
        <PasswordInput
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </FormField>

      <FormError message={error} />

      <Button type="submit" loading={isLoading} className="w-full">
        {isLoading && <Spinner className="h-5 w-5" />}
        {isLoading ? auth.signingIn : auth.signIn}
      </Button>

      {slow && (
        <p role="status" className="text-fg-muted text-sm">
          {common.serverWaking}
        </p>
      )}
    </form>
  );
}
