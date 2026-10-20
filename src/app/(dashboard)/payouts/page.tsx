import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { PayoutList } from '@/components/payout/payout-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.payouts };

export default function PayoutsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.payouts}
        description={MESSAGES.payouts.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.payoutList}>
        <PayoutList />
      </PermissionGuard>
    </div>
  );
}
