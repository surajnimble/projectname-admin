import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { FlashSalesList } from '@/components/flash-sales/flash-sales-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.flashSales };

export default function FlashSalesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.flashSaleManage}>
      <FlashSalesList />
    </PermissionGuard>
  );
}
