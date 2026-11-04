import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { InventoryReportPage } from '@/components/inventory-report/inventory-report';

export const metadata: Metadata = { title: MESSAGES.sections.inventory };

export default function InventoryReportPageShell() {
  return (
    <PermissionGuard permission={PERMISSIONS.reportView}>
      <InventoryReportPage />
    </PermissionGuard>
  );
}
