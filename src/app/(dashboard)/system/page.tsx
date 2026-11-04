import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { SystemHealthPage } from '@/components/system-health/system-health-page';

export const metadata: Metadata = { title: MESSAGES.sections.systemHealth };

export default function SystemHealthPageShell() {
  return (
    <PermissionGuard permission={PERMISSIONS.systemHealthView}>
      <SystemHealthPage />
    </PermissionGuard>
  );
}
