import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientAuditLogsPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.auditLogs.title };

export default function AuditLogsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.auditLogView}>
      <ClientAuditLogsPage />
    </PermissionGuard>
  );
}
