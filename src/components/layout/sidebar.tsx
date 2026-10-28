'use client';

import { LogOut, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ClickableText } from '@/components/ui/clickable-text';
import { NAV_ITEMS, ROUTES, SITE } from '@/constants';
import { MESSAGES } from '@/messages';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';

interface SidebarProps {
  onNavigate?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const roles = user?.roles ?? [];

  const items = NAV_ITEMS.filter(
    (item) => !item.roles || roles.length === 0 || item.roles.some((role) => roles.includes(role)),
  );

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <Logo className="text-primary size-7" />
        <span className="font-semibold tracking-tight">{SITE.shortName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Main" className="mt-4 flex flex-col gap-1">
          {items.map((item) => {
            const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
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

      <div className="border-border flex flex-col gap-2 border-t pt-2">
        <ClickableText
          variant="nav"
          className="w-full"
          onClick={() => void router.push(ROUTES.settings)}
        >
          <Settings className="size-4" aria-hidden="true" />
          {MESSAGES.common.settings}
        </ClickableText>

        <ClickableText variant="danger" className="w-full" onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden="true" />
          {MESSAGES.common.signOut}
        </ClickableText>
      </div>
    </div>
  );
}
