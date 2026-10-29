import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { VendorPage } from '@/components/vendor/vendor-page';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.vendors.title };

export default function VendorsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.vendorList}>
      <VendorPage />
    </PermissionGuard>
  );
}
