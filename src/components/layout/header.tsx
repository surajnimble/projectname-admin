'use client';

import { LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useState } from 'react';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { IconButton } from '@/components/ui/icon-button';
import { Button } from '@/components/ui/button';
import { MESSAGES } from '@/messages';
import { useAuth } from '@/providers/auth-provider';
import { MobileNav } from './mobile-nav';

const initials = (name: string, email: string) =>
  (name || email || '?')
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

interface HeaderProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Header({ sidebarOpen, onToggleSidebar }: HeaderProps) {
  const { user, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="border-border bg-surface sticky top-0 z-(--z-sticky) flex h-16 items-center justify-between border-b px-4 lg:px-6">
      <div className="flex items-center">
        <IconButton
          icon={<PanelLeftOpen className="size-5" aria-hidden="true" />}
          label={MESSAGES.common.openSidebar}
          variant="subtle"
          className="lg:hidden"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        />
        <MobileNav open={menuOpen} onClose={() => setMenuOpen(false)} />

        <IconButton
          icon={
            sidebarOpen
              ? <PanelLeftClose className="size-5" aria-hidden="true" />
              : <PanelLeftOpen className="size-5" aria-hidden="true" />
          }
          label={sidebarOpen ? MESSAGES.common.closeSidebar : MESSAGES.common.openSidebar}
          variant="subtle"
          className="hidden lg:inline-flex"
          aria-controls="app-sidebar"
          aria-expanded={sidebarOpen}
          onClick={onToggleSidebar}
        />
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        {user && (
          <div className="mx-1 flex items-center gap-3">
            <span
              aria-hidden="true"
              className="bg-soft text-soft-fg flex size-9 items-center justify-center rounded-full text-sm font-semibold"
            >
              {initials(user.name, user.email)}
            </span>
            <div className="hidden flex-col leading-tight sm:flex">
              <span className="text-sm font-medium">{user.name || user.email}</span>
              {user.name && (
                <span className="text-muted-foreground text-xs">{user.email}</span>
              )}
            </div>
          </div>
        )}
        <Button variant="outline" size="sm" onClick={() => void signOut()}>
          <LogOut className="size-4" aria-hidden="true" />
          {MESSAGES.common.signOut}
        </Button>
      </div>
    </header>
  );
}
