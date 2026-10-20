'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Header } from './header';
import { Sidebar } from './sidebar';

export function DashboardShell({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      className={cn(
        'min-h-dvh lg:grid',
        sidebarOpen ? 'lg:grid-cols-[16rem_minmax(0,1fr)]' : 'lg:grid-cols-[minmax(0,1fr)]',
      )}
    >
      <aside
        id="app-sidebar"
        className={cn(
          'border-border bg-surface sticky top-0 hidden h-dvh border-r',
          sidebarOpen && 'lg:block',
        )}
      >
        <Sidebar />
      </aside>
      <div className="flex min-w-0 flex-col">
        <Header
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((open) => !open)}
        />
        <main className="flex-1 px-4 py-3 lg:px-8 lg:py-6">{children}</main>
      </div>
    </div>
  );
}
