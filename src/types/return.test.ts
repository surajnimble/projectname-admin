import { describe, expect, it } from 'vitest';
import { toReturn, toReturnList } from './return';

describe('toReturn', () => {
  it('maps a return request with its vendor and items', () => {
    const item = toReturn({
      returnId: 'r1',
      returnNumber: 'RET-1',
      orderId: 'o1',
      vendorId: 'v1',
      status: 'REQUESTED',
      refundAmount: 1500,
      requestedAt: '2026-10-21T10:00:00.000Z',
      vendorData: { vendorId: 'v1', shopName: 'Demo Shop', slug: 'demo-shop' },
      itemList: [{ returnItemId: 'ri1', qty: 2, refundAmount: 1500, isApproved: false }],
    });

    expect(item.returnId).toBe('r1');
    expect(item.refundAmount).toBe(1500);
    expect(item.vendorData.shopName).toBe('Demo Shop');
    expect(item.itemList[0]?.qty).toBe(2);
  });

  it('fills missing fields with safe defaults', () => {
    expect(toReturn()).toMatchObject({ returnId: '', refundAmount: 0, images: [], itemList: [] });
  });
});

describe('toReturnList', () => {
  it('maps the pagination and the rows', () => {
    const list = toReturnList({
      totalRecord: 1,
      currentPage: 1,
      limit: 5,
      itemList: [{ returnId: 'r1' }, null],
    });

    expect(list.totalRecord).toBe(1);
    expect(list.itemList).toHaveLength(1);
    expect(list.itemList[0]?.returnId).toBe('r1');
  });

  it('returns an empty list when itemList is missing', () => {
    expect(toReturnList({ totalRecord: 2 }).itemList).toEqual([]);
  });
});
