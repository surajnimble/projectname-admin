import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { CollectionList } from '@/components/collections/collection-list';

export const metadata: Metadata = { title: MESSAGES.sections.collections };

export default function CollectionsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.collectionManage}>
      <CollectionList />
    </PermissionGuard>
  );
}
