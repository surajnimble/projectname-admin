import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ReviewList } from '@/components/reviews/review-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.reviews };

export default function ReviewsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.reviewManage}>
      <ReviewList />
    </PermissionGuard>
  );
}
