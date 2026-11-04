import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
import { SettingsPage } from '@/components/settings/settings-page';

export const metadata: Metadata = { title: MESSAGES.sections.settings };

export default function SettingsPageShell() {
  return (
    <PermissionGuard permission={PERMISSIONS.settingsView}>
      <SettingsPage />
    </PermissionGuard>
  );
}
