import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientCouponsPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.coupons.title };

export default function CouponsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.couponManage}>
      <ClientCouponsPage />
    </PermissionGuard>
  );
}
