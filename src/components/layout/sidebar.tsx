'use client';

import { ChevronDown, LogOut, Settings } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { ClickableText } from '@/components/ui/clickable-text';
import { NAV_GROUPS, NAV_ITEMS, PERMISSIONS, ROUTES, SITE } from '@/constants';
import { MESSAGES } from '@/messages';
import { usePermission } from '@/hooks/use-permission';
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
  const { can } = usePermission();
  const roles = user?.roles ?? [];

  const items = NAV_ITEMS.filter(
    (item) =>
      (!item.roles || roles.length === 0 || item.roles.some((role) => roles.includes(role))) &&
      can(item.permission) &&
      (!item.permissions || item.permissions.some((permission) => can(permission))),
  );

  const grouped = NAV_GROUPS.map((group) => ({
    ...group,
    items: items.filter((item) => group.routes.some((route) => route === item.href)),
  })).filter((group) => group.items.length > 0);
  const groupedHrefs = new Set(grouped.flatMap((group) => group.items.map((item) => item.href)));
  const overviewItems = items.filter((item) => item.href === ROUTES.home || item.href === ROUTES.componentsShowcase);
  const ungroupedItems = items.filter((item) => !groupedHrefs.has(item.href) && !overviewItems.some((overview) => overview.href === item.href));
  const isActive = (href: string) => href === '/' ? pathname === '/' : pathname.startsWith(href);
  const renderItem = (item: (typeof items)[number]) => {
    const active = isActive(item.href);
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
  };

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <Logo className="text-primary size-7" />
        <span className="font-semibold tracking-tight">{SITE.shortName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Main" className="mt-4 flex flex-col gap-2">
          {overviewItems.length > 0 && <div className="space-y-1">{overviewItems.map(renderItem)}</div>}
          {grouped.map((group) => {
            const activeGroup = group.items.some((item) => isActive(item.href));
            return (
              <details key={group.id} open={activeGroup} className="group rounded-md">
                <summary className="flex cursor-pointer list-none items-center justify-between rounded-md px-2.5 py-2 text-xs font-semibold uppercase tracking-wide text-fg-muted hover:bg-surface-muted/70 [&::-webkit-details-marker]:hidden">
                  {group.label}
                  <ChevronDown className="size-3.5 transition-transform group-open:rotate-180" aria-hidden="true" />
                </summary>
                <div className="mt-1 flex flex-col gap-1 pl-1">{group.items.map(renderItem)}</div>
              </details>
            );
          })}
          {ungroupedItems.length > 0 && <div className="space-y-1">{ungroupedItems.map(renderItem)}</div>}
        </nav>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-2">
        {can(PERMISSIONS.settingsView) && (
          <ClickableText
            variant="nav"
            className="w-full"
            active={pathname.startsWith(ROUTES.settings)}
            aria-current={pathname.startsWith(ROUTES.settings) ? 'page' : undefined}
            onClick={() => void router.push(ROUTES.settings)}
          >
            <Settings className="size-4" aria-hidden="true" />
            {MESSAGES.common.settings}
          </ClickableText>
        )}

        <ClickableText variant="danger" className="w-full" onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden="true" />
          {MESSAGES.common.signOut}
        </ClickableText>
      </div>
    </div>
  );
}
