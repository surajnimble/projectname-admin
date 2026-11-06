import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { RevenueReportPage } from '@/components/reports/revenue-report';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.reports.title };

export default function ReportsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.analyticsView}>
      <RevenueReportPage />
    </PermissionGuard>
  );
}
