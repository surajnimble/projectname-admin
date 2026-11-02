import type { Metadata } from 'next';
import ClientActivityLogsPage from './ClientPage';

export const metadata: Metadata = { title: 'Activity Logs' };

export default function ActivityLogsPage() {
  return <ClientActivityLogsPage />;
}
