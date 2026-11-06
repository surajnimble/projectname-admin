import { describe, expect, it } from 'vitest';
import { toOrderDetail } from './order';

describe('order detail mapper', () => {
  it('maps serialized subOrderList rows into vendorList with shipment tracking data', () => {
    const result = toOrderDetail({
      orderId: 'order-1',
      subOrderList: [{
        subOrderId: 'sub-1',
        vendorId: 'vendor-1',
        status: 'SHIPPED',
        vendorData: { vendorId: 'vendor-1', shopName: 'Shop One' },
        trackingNumber: 'AWB-123',
        shipmentData: { shipmentId: 'shipment-1', awb: 'AWB-123', status: 'IN_TRANSIT', trackingUrl: 'https://carrier.example/track/AWB-123' },
      }],
    });

    expect(result.vendorList).toHaveLength(1);
    expect(result.vendorList[0]?.shopName).toBe('Shop One');
    expect(result.vendorList[0]?.shipmentData.awb).toBe('AWB-123');
  });
});
