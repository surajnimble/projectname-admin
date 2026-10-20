import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { ProductApprovalsList } from '@/components/product/product-approvals-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.productApprovals };

export default function ProductApprovalsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.productApprovals}
        description={MESSAGES.products.title}
      />
      <PermissionGuard permission={PERMISSIONS.productApprove}>
        <ProductApprovalsList />
      </PermissionGuard>
    </div>
  );
}
