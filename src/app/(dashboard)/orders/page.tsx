import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { OrderList } from '@/components/order/order-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.orders.title };

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader title={MESSAGES.orders.title} description={MESSAGES.orders.subtitle} />
      <PermissionGuard permission={PERMISSIONS.orderList}>
        <OrderList />
      </PermissionGuard>
    </div>
  );
}
