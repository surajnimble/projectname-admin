import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientCustomerDetailPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.customers.detail.title };

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId } = await params;
  return (
    <PermissionGuard permission={PERMISSIONS.userView}>
      <ClientCustomerDetailPage userId={userId} />
    </PermissionGuard>
  );
}
