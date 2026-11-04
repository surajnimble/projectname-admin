import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import CustomerDetailPage from '@/components/customer/customer-detail-page';

export const metadata: Metadata = { title: MESSAGES.customers.detail.title };

export default function CustomerDetailPageShell({ params }: { params: { userId: string } | Promise<{ userId: string }> }) {
  return (
    <PermissionGuard permission={PERMISSIONS.userView}>
      <CustomerDetailPage params={params} />
    </PermissionGuard>
  );
}
