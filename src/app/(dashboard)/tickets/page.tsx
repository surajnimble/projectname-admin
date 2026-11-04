import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { TicketList } from '@/components/tickets/ticket-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.tickets };

export default function TicketsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.ticketManage}>
      <TicketList />
    </PermissionGuard>
  );
}
