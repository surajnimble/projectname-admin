import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { DeliveryBoyPage } from '@/components/delivery-boy/delivery-boy-page';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.deliveryBoys.title };

export default function DeliveryBoysPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.deliveryBoyManage}>
      <DeliveryBoyPage />
    </PermissionGuard>
  );
}
