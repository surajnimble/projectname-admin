'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { Spinner } from '@/components/ui/spinner';
import { QUERY_PARAMS, ROUTES, STAFF_ROLES, type Role } from '@/constants';
import { useAuth } from '@/providers/auth-provider';

const safeNext = (value: string | null) => value && value.startsWith('/') && !value.startsWith('//') ? value : ROUTES.home;

export function AuthGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status !== 'unauthenticated') return;
    const next = pathname && pathname !== ROUTES.home
      ? `?${QUERY_PARAMS.next}=${encodeURIComponent(pathname)}`
      : '';
    router.replace(`${ROUTES.login}${next}`);
  }, [status, pathname, router]);

  if (status === 'authenticated') return <>{children}</>;
  return (
    <div className="bg-background flex min-h-dvh items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

export function GuestGuard({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    if (status === 'authenticated') router.replace(safeNext(params.get(QUERY_PARAMS.next)));
  }, [status, params, router]);

  if (status === 'unauthenticated') return <>{children}</>;
  return (
    <div className="flex min-h-40 items-center justify-center">
      <Spinner className="size-6" />
    </div>
  );
}

interface RoleGuardProps {
  roles?: readonly Role[];
  fallback?: ReactNode;
  children: ReactNode;
}

export function RoleGuard({ roles = STAFF_ROLES, fallback = null, children }: RoleGuardProps) {
  const { user } = useAuth();
  const userRoles = user?.roles ?? [];
  const allowed = userRoles.length === 0 || roles.some((role) => userRoles.includes(role));
  return <>{allowed ? children : fallback}</>;
}
