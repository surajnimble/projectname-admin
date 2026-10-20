import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PageHeader } from '@/components/common/page-header';
import { CustomerList } from '@/components/customer/customer-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.sections.customers };

export default function CustomersPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={MESSAGES.sections.customers}
        description={MESSAGES.customers.subtitle}
      />
      <PermissionGuard permission={PERMISSIONS.userList}>
        <CustomerList />
      </PermissionGuard>
    </div>
  );
}
