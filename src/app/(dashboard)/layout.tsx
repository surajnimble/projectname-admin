import type { ReactNode } from 'react';
import { EmptyState } from '@/components/common/empty-state';
import { AuthGuard, RoleGuard } from '@/components/auth/guards';
import { DashboardShell } from '@/components/layout/dashboard-shell';
import { MESSAGES } from '@/messages';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <DashboardShell>
        <RoleGuard fallback={<EmptyState title={MESSAGES.auth.notStaff} />}>
          {children}
        </RoleGuard>
      </DashboardShell>
    </AuthGuard>
  );
}
