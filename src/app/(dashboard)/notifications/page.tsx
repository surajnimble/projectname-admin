import type { Metadata } from 'next';
import { NotificationList } from '@/components/notifications/notification-list';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.notifications };

export default function NotificationsPage() {
  return <NotificationList />;
}
