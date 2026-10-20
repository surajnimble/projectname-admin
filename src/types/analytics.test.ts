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
