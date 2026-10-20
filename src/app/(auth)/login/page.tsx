import type { Metadata } from 'next';
import { Suspense } from 'react';
import { GuestGuard } from '@/components/auth/guards';
import { LoginForm } from '@/components/auth/login-form';

export const metadata: Metadata = { title: 'Sign in' };

export default function LoginPage() {
  return (
    <Suspense>
      <GuestGuard>
        <LoginForm />
      </GuestGuard>
    </Suspense>
  );
}
