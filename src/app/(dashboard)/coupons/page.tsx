import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { CouponList } from '@/components/coupons/coupon-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.coupons };

export default function CouponsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.couponManage}>
      <CouponList />
    </PermissionGuard>
  );
}
