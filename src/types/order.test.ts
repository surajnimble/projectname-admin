import { describe, expect, it } from 'vitest';
import { toOrderDetail, toOrderList } from './order';

describe('toOrderList', () => {
  it('defaults every field when the payload is empty', () => {
    const list = toOrderList({});
    expect(list.itemList).toEqual([]);
    expect(list.totalRecord).toBe(0);
    expect(list.hasNext).toBe(false);
  });

  it('maps order rows with the customer and vendors', () => {
    const list = toOrderList({
      totalRecord: 1,
      itemList: [
        {
          orderId: 'o1',
          orderNumber: 'ORD-1',
          status: 'CONFIRMED',
          total: 250,
          userData: { name: 'Asha' },
          vendorList: [{ shopName: 'Shop' }, null],
        },
      ],
    });
    expect(list.itemList[0]?.orderNumber).toBe('ORD-1');
    expect(list.itemList[0]?.userData.name).toBe('Asha');
    expect(list.itemList[0]?.userData.email).toBe('');
    expect(list.itemList[0]?.vendorList).toHaveLength(1);
  });
});

describe('toOrderDetail', () => {
  it('keeps items and timeline and defaults the address', () => {
    const detail = toOrderDetail({
      orderId: 'o1',
      itemList: [{ orderItemId: 'i1', name: 'Shirt', qty: 2, price: 10, total: 20 }],
      timelineList: [{ timelineId: 't1', status: 'SHIPPED' }],
    });
    expect(detail.itemList[0]?.qty).toBe(2);
    expect(detail.timelineList[0]?.status).toBe('SHIPPED');
    expect(detail.addressData.city).toBe('');
  });
});
