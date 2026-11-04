import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { AuditLogList } from '@/components/audit-logs/audit-log-list';

export const metadata: Metadata = { title: MESSAGES.auditLogs.title };

export default function AuditLogsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.auditLogView}>
      <AuditLogList />
    </PermissionGuard>
  );
}
