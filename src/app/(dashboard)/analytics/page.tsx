import type { Metadata } from 'next';
import ClientAnalyticsPage from './ClientPage';

export const metadata: Metadata = { title: 'Analytics' };

export default function AnalyticsPage() {
  return <ClientAnalyticsPage />;
}
