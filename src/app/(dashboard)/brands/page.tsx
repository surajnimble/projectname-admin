import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { BrandList } from '@/components/brands/brand-list';

export const metadata: Metadata = { title: MESSAGES.sections.brands };

export default function BrandsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.brandManage}>
      <BrandList />
    </PermissionGuard>
  );
}
