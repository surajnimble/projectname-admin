import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { TagList } from '@/components/tags/tag-list';

export const metadata: Metadata = { title: MESSAGES.sections.tags };

export default function TagsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.tagManage}>
      <TagList />
    </PermissionGuard>
  );
}
