'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NAV_ITEMS, SITE } from '@/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || roles.length === 0 || item.roles.some((role) => roles.includes(role)),
  );

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <Logo className="text-primary size-7" />
        <span className="font-semibold tracking-tight">{SITE.shortName}</span>
      </div>
      <nav aria-label="Main" className="flex flex-col gap-1">
        {items.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? 'page' : undefined}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                active
                  ? 'bg-nav-active text-nav-active-fg font-semibold'
                  : 'text-fg-muted hover:bg-hover hover:text-fg',
              )}
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
