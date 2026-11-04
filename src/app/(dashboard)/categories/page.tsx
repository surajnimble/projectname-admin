import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { CategoryList } from '@/components/categories/category-list';

export const metadata: Metadata = { title: MESSAGES.sections.categories };

export default function CategoriesPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.categoryManage}>
      <CategoryList />
    </PermissionGuard>
  );
}
