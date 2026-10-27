'use client';

import { usePathname } from 'next/navigation';

import { ClickableText } from '@/components/ui/clickable-text';
import { NAV_ITEMS, SITE } from '@/constants';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { user } = useAuth();
  const roles = user?.roles ?? [];

  const items = NAV_ITEMS.filter(
    (item) =>
      !item.roles || roles.length === 0 || item.roles.some((role) => roles.includes(role)),
  );

  return (
    <div className="flex h-full flex-col gap-6 p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <Logo className="text-primary size-7" />
        <span className="font-semibold tracking-tight">{SITE.shortName}</span>
      </div>

      <nav aria-label="Main" className="flex flex-col gap-1">
        {items.map((item) => {
          const active =
            item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <ClickableText
              key={item.href}
              href={item.href}
              variant="nav"
              active={active}
              aria-current={active ? 'page' : undefined}
              onClick={onNavigate}
              data-hover-color
            >
              <item.icon className="size-4" aria-hidden="true" />
              {item.label}
            </ClickableText>
          );
        })}
      </nav>
    </div>
  );
}
