import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { AnalyticsPage } from '@/components/analytics/analytics-page';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.analytics.title };

export default function AnalyticsPageShell() {
  return (
    <PermissionGuard permission={PERMISSIONS.analyticsView}>
      <AnalyticsPage />
    </PermissionGuard>
  );
}
