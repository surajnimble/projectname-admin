import type { Metadata } from 'next';
import ClientTicketsPage from './ClientPage';

export const metadata: Metadata = { title: 'Support Tickets' };

export default function TicketsPage() {
  return <ClientTicketsPage />;
}
