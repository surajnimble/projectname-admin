import { describe, expect, it } from 'vitest';
import { toProductPerformance, toProductPerformanceList } from './analytics';

describe('toProductPerformance', () => {
  it('maps product totals and defaults missing numbers', () => {
    expect(
      toProductPerformance({
        productId: 'p1',
        name: 'Demo',
        qty: 12,
        revenue: 2480,
        views: 40,
        rating: 4.5,
      }),
    ).toEqual({
      productId: 'p1',
      name: 'Demo',
      qty: 12,
      revenue: 2480,
      views: 40,
      rating: 4.5,
    });

    expect(toProductPerformance()).toEqual({
      productId: '',
      name: '',
      qty: 0,
      revenue: 0,
      views: 0,
      rating: 0,
    });
  });
});

describe('toProductPerformanceList', () => {
  it('maps the backend productList into itemList', () => {
    const list = toProductPerformanceList({
      totalRecord: 2,
      currentPage: 1,
      limit: 5,
      productList: [{ productId: 'p1', qty: 2 }, { productId: 'p2', qty: 1 }],
    });

    expect(list.totalRecord).toBe(2);
    expect(list.itemList.map((item) => item.productId)).toEqual(['p1', 'p2']);
  });

  it('returns an empty list when productList is missing', () => {
    expect(toProductPerformanceList({ totalRecord: 3 }).itemList).toEqual([]);
  });
});

describe('extended analytics response mappers', () => {
  it('maps vendor performance pagination and rows from vendorList', async () => {
    const { toVendorPerformanceList } = await import('./analytics');
    const result = toVendorPerformanceList({
      totalRecord: 1,
      totalPage: 1,
      currentPage: 1,
      limit: 10,
      vendorList: [{
        vendorId: 'vendor-1', shopName: 'Demo shop', slug: 'demo-shop', status: 'APPROVED',
        commissionRate: 10, subOrderCount: 4, revenue: 1200, commission: 120, earnings: 1080,
        fulfilmentRate: 75,
      }],
    });

    expect(result.itemList).toHaveLength(1);
    expect(result.itemList[0]).toMatchObject({ vendorId: 'vendor-1', fulfilmentRate: 75 });
    expect(result.totalRecord).toBe(1);
  });

  it('maps abandoned carts from the paginated cartList contract', async () => {
    const { toAbandonedCartList } = await import('./analytics');
    const result = toAbandonedCartList({
      totalRecord: 1,
      currentPage: 1,
      limit: 10,
      totalValue: 499,
      cartList: [{
        cartId: 'cart-1', itemCount: 1, value: 499, abandonedForHours: 30,
        userData: { userId: 'user-1', name: 'A User', email: 'a@example.test' },
        itemList: [{ productId: 'product-1', name: 'Item', qty: 1, price: 499, image: '/item.png' }],
      }],
    });

    expect(result.totalValue).toBe(499);
    expect(result.itemList[0]?.userData.email).toBe('a@example.test');
    expect(result.itemList[0]?.itemList[0]?.productId).toBe('product-1');
  });

  it('maps device platform and device share from app-version analytics', async () => {
    const { toAppVersionList } = await import('./analytics');
    const result = toAppVersionList({
      totalDevices: 4,
      versionList: [{ platform: 'ANDROID', appVersion: '2.1.0', deviceCount: 3, percentage: 75 }],
    });

    expect(result.itemList[0]).toMatchObject({
      platform: 'ANDROID', version: '2.1.0', users: 3, deviceShare: 75,
    });
  });

  it('maps search and crash records using backend serializer field names', async () => {
    const { toSearchTermList, toCrashList } = await import('./analytics');
    const searches = toSearchTermList({
      totalRecord: 1,
      termList: [{ searchLogId: 'search-1', term: 'shoes', resultCount: 0, hasResults: false, createdAt: '2026-11-05T10:00:00.000Z' }],
    });
    const crashes = toCrashList({
      totalRecord: 1,
      crashList: [{ crashId: 'crash-1', deviceId: 'device-1', platform: 'ANDROID', appVersion: '2.1.0', errorMessage: 'Unexpected error', createdAt: '2026-11-05T10:00:00.000Z' }],
    });

    expect(searches.itemList[0]?.hasResults).toBe(false);
    expect(crashes.itemList[0]).toMatchObject({ os: 'ANDROID', device: 'device-1', error: 'Unexpected error' });
  });
});
