import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { DeviceList } from '@/components/platform-operations/device-list';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
export const metadata: Metadata = { title: MESSAGES.platformOperations.devices.title };
export default function DevicesPage() {
  return <PermissionGuard permission={PERMISSIONS.deviceView}><DeviceList /></PermissionGuard>;
}
