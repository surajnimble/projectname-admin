import type { Metadata } from 'next';
import ClientNotificationsPage from './ClientPage';

export const metadata: Metadata = { title: 'Notifications' };

export default function NotificationsPage() {
  return <ClientNotificationsPage />;
}
