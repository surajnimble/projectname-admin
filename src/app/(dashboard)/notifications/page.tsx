import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { NotificationList } from '@/components/notifications/notification-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.notifications };

export default function NotificationsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.notificationSend}>
      <NotificationList />
    </PermissionGuard>
  );
}
