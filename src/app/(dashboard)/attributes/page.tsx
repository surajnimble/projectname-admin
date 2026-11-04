import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { AttributeList } from '@/components/attributes/attribute-list';

export const metadata: Metadata = { title: MESSAGES.sections.attributes };

export default function AttributesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.attributeManage}>
      <AttributeList />
    </PermissionGuard>
  );
}
