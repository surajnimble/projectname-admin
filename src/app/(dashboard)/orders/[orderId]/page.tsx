import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { OrderDetails } from '@/components/order/order-details';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.orders.title };

export default async function OrderDetailsPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  return (
    <PermissionGuard permission={PERMISSIONS.orderView}>
      <OrderDetails orderId={orderId} />
    </PermissionGuard>
  );
}
