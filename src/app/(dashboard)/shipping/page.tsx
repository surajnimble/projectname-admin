import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientShippingZonesPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.shipping.title };

export default function ShippingZonesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.shippingManage}>
      <ClientShippingZonesPage />
    </PermissionGuard>
  );
}
