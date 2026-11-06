import type { ShipmentTrackingData } from '@/lib/api/contract';

export const toShipmentTracking = (value: unknown = {}): ShipmentTrackingData => {
  const raw = typeof value === 'object' && value !== null ? (value as Record<string, unknown>) : {};
  const text = (key: string) => (typeof raw[key] === 'string' ? (raw[key] as string) : '');
  const estimatedDays = Number(raw.estimatedDays);
  return {
    awb: text('awb'), orderNumber: text('orderNumber'), status: text('status'),
    trackingUrl: text('trackingUrl'), estimatedDays: Number.isFinite(estimatedDays) ? estimatedDays : 0,
    shippedAt: text('shippedAt'), deliveredAt: text('deliveredAt'), remarks: text('remarks'),
  };
};
