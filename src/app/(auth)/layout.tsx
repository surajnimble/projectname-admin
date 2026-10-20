import type { ReactNode } from 'react';
import { AuthGlobe } from '@/components/auth/auth-globe';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { ApiStatus } from '@/components/layout/api-status';
import { Logo } from '@/components/layout/logo';
import { SITE } from '@/constants';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <main className="flex min-h-dvh flex-col md:flex-row md:p-4">
      <section className="bg-primary-soft border-border/40 @container relative hidden overflow-hidden rounded-xl border md:flex md:w-1/2">
        <AuthGlobe className="absolute top-(--auth-globe-top) left-1/2 w-(--auth-globe-width) -translate-x-1/2 opacity-80 dark:opacity-30" />

        <div className="absolute top-(--auth-brand-top) left-1/2 z-10 flex max-w-md -translate-x-1/2 -translate-y-1/2 items-center justify-center gap-3 px-6">
          <Logo className="text-fg size-10 shrink-0" />
          <span className="text-fg text-2xl font-black tracking-tight whitespace-nowrap">
            {SITE.name}
          </span>
        </div>
      </section>

      <section className="flex w-full flex-col p-4 md:w-1/2 md:p-6">
        <div className="flex items-center justify-between py-2 md:justify-end">
          <div className="flex items-center gap-2 md:hidden">
            <Logo className="text-primary size-7" />
            <span className="font-semibold tracking-tight">{SITE.shortName}</span>
          </div>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-6">
          <div className="w-full max-w-md px-4">{children}</div>
        </div>
        <ApiStatus className="text-fg-muted justify-center pb-2 md:justify-end" />
      </section>
    </main>
  );
}
