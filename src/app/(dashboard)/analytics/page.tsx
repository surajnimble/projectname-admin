import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { AnalyticsPage } from '@/components/analytics/analytics-page';

export const metadata: Metadata = { title: MESSAGES.sections.analytics };

export default function AnalyticsPageShell() {
  return (
    <PermissionGuard permission={PERMISSIONS.analyticsView}>
      <AnalyticsPage />
    </PermissionGuard>
  );
}
