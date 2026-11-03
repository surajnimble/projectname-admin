import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import ClientSettingsPage from './ClientPage';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';

export const metadata: Metadata = { title: MESSAGES.settings.title };

export default function SettingsPage() {
  return (
    <PermissionGuard permission={PERMISSIONS.settingsView}>
      <ClientSettingsPage />
    </PermissionGuard>
  );
}
