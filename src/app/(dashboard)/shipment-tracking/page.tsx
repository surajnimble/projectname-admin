import type { Metadata } from 'next';
import { PermissionGuard } from '@/components/auth/guards';
import { ShipmentTrackingLookup } from '@/components/platform-operations/shipment-tracking-lookup';
import { PERMISSIONS } from '@/constants';
import { MESSAGES } from '@/messages';
export const metadata: Metadata = { title: MESSAGES.shipmentTracking.title };
export default function ShipmentTrackingPage() {
  return <PermissionGuard permission={PERMISSIONS.trackingView}><ShipmentTrackingLookup /></PermissionGuard>;
}
