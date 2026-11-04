import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { ActivityLogList } from '@/components/activity-logs/activity-log-list';

export const metadata: Metadata = { title: MESSAGES.activityLogs.title };

export default function ActivityLogsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.activityLogView}>
      <ActivityLogList />
    </PermissionGuard>
  );
}
