'use client';

import { LogOut, Settings, ChevronDown, ChevronRight } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { ClickableText } from '@/components/ui/clickable-text';
import { NAV_ITEMS, ROUTES, SITE } from '@/constants';
import { MESSAGES } from '@/messages';
import { usePermission } from '@/hooks/use-permission';
import { useAuth } from '@/providers/auth-provider';
import { Logo } from './logo';

interface SidebarProps {
  onNavigate?: () => void;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const GROUP_ORDER: readonly string[] = [
  'overview',
  'vendors',
  'orders',
  'reviews',
  'shipping',
  'finance',
  'customers',
  'catalog',
  'content',
  'subadmins',
  'analytics',
  'support',
  'system',
  'promotions',
  'engagement',
  'components',
];

export function Sidebar({ onNavigate }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const { can } = usePermission();
  const roles = user?.roles ?? [];
  const [openGroups, setOpenGroups] = useState<Set<string>>(new Set());

  const items = NAV_ITEMS.filter(
    (item) =>
      (!item.roles || roles.length === 0 || item.roles.some((role) => roles.includes(role))) &&
      can(item.permission),
  );

  const itemsByGroup = items.reduce<Record<string, typeof items>>((acc, item) => {
    const group = item.group ?? 'ungrouped';
    if (!acc[group]) acc[group] = [];
    acc[group].push(item);
    return acc;
  }, {});

  const toggleGroup = (group: string) => {
    setOpenGroups((prev: Set<string>) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const isGroupOpen = (group: string) => openGroups.has(group);

  return (
    <div className="flex h-full flex-col p-4">
      <div className="flex items-center gap-2.5 px-2 pt-1">
        <Logo className="text-primary size-7" />
        <span className="font-semibold tracking-tight">{SITE.shortName}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <nav aria-label="Main" className="mt-4 flex flex-col gap-1">
          {GROUP_ORDER.map((group) => {
            const groupItems = itemsByGroup[group];
            if (!groupItems || groupItems.length === 0) return null;
            const isOpen = isGroupOpen(group);
            const groupLabel =
              MESSAGES.navGroups[group as keyof typeof MESSAGES.navGroups] ?? group;
            return (
              <div key={group} className="flex flex-col gap-1">
                <button
                  onClick={() => toggleGroup(group)}
                  className="flex items-center justify-between w-full px-2 py-1.5 text-sm font-medium text-fg-muted hover:text-fg hover:bg-surface-muted rounded-md transition-colors focus:outline-none"
                >
                  <span className="flex items-center gap-2">
                    {isOpen ? <ChevronDown className="size-4" /> : <ChevronRight className="size-4" />}
                    {groupLabel}
                  </span>
                </button>
                {isOpen && (
                  <div className="ml-3 flex flex-col gap-0.5">
                    {groupItems.map((item) => {
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
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </div>

      <div className="border-border flex flex-col gap-2 border-t pt-2">
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

        <ClickableText variant="danger" className="w-full" onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden="true" />
          {MESSAGES.common.signOut}
        </ClickableText>
      </div>
    </div>
  );
}
