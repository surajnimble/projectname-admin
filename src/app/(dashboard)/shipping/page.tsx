import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ShippingList } from '@/components/shipping/shipping-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.shipping };

export default function ShippingPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.shippingManage}>
      <ShippingList />
    </PermissionGuard>
  );
}
