import type { Metadata } from 'next';
import { RoleGuard } from '@/components/auth/guards';
import { ROLES } from '@/constants';
import { SubAdminList } from '@/components/sub-admin/sub-admin-list';

export const metadata: Metadata = { title: 'Sub Admins' };

export default function SubAdminsPage() {
  return (
    <RoleGuard roles={[ROLES.superAdmin]}>
      <SubAdminList />
    </RoleGuard>
  );
}
