import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientSystemPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.systemHealth.title };

export default function SystemHealthPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.systemHealthView}>
      <ClientSystemPage />
    </PermissionGuard>
  );
}
