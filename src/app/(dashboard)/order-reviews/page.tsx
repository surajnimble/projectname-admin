import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { OrderReviewList } from '@/components/order/order-review-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.orderReviews };

export default function OrderReviewsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.orderReviews}
        description={MESSAGES.orderReviews.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.orderConfirm}>
        <OrderReviewList />
      </PermissionGuard>
    </div>
  );
}
