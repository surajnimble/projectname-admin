import { describe, expect, it } from 'vitest';
import { toLowStockList } from './report';

describe('toLowStockList', () => {
  it('keeps only products at or below their threshold', () => {
    const list = toLowStockList({
      rowList: [
        { name: 'Low', sku: 'LOW-1', stock: 2, threshold: 5, isLow: true },
        { name: 'Healthy', sku: 'OK-1', stock: 20, threshold: 5, isLow: false },
        { name: 'Out', sku: 'OUT-1', stock: 0, threshold: 1, isLow: true },
      ],
    });

    expect(list.totalRecord).toBe(2);
    expect(list.itemList.map((item) => item.sku)).toEqual(['LOW-1', 'OUT-1']);
  });

  it('returns an empty list when rowList is missing', () => {
    expect(toLowStockList()).toEqual({ totalRecord: 0, itemList: [] });
  });
});
