import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { ReturnList } from '@/components/return/return-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.returns };

export default function ReturnsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.returns}
        description={MESSAGES.returns.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.returnList}>
        <ReturnList />
      </PermissionGuard>
    </div>
  );
}
