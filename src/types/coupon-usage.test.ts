import { describe, expect, it } from 'vitest';
import { toCouponUsageList } from './coupon-usage';

describe('toCouponUsageList', () => {
  it('maps the backend couponUsageList envelope and nested user/coupon data', () => {
    const result = toCouponUsageList({
      totalRecord: 1,
      totalPage: 1,
      currentPage: 1,
      limit: 10,
      hasNext: false,
      hasPrevious: false,
      nextPage: 0,
      previousPage: 0,
      couponUsageList: [{
        usageId: 'usage-1',
        couponId: 'coupon-1',
        userId: 'user-1',
        orderId: 'order-1',
        amount: 125,
        createdAt: '2026-11-05T08:00:00.000Z',
        couponData: { couponId: 'coupon-1', code: 'SAVE10', title: 'Save 10', type: 'PERCENTAGE' },
        userData: { userId: 'user-1', name: 'Asha', email: 'asha@example.test' },
      }],
    });

    expect(result.itemList).toHaveLength(1);
    expect(result.itemList[0]).toMatchObject({
      usageId: 'usage-1',
      amount: 125,
      couponData: { code: 'SAVE10' },
      userData: { name: 'Asha' },
    });
  });

  it('returns an empty list for an absent or invalid usage collection', () => {
    expect(toCouponUsageList().itemList).toEqual([]);
    expect(toCouponUsageList({ couponUsageList: null }).itemList).toEqual([]);
  });
});
