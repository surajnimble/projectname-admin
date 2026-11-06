import { describe, expect, it } from 'vitest';
import { toInventoryList, toLowStockList } from './report';

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


describe('toInventoryList', () => {
  it('maps server pagination, product rows and global summary', () => {
    const list = toInventoryList({
      totalRecord: 21,
      totalPage: 3,
      currentPage: 2,
      limit: 10,
      hasNext: true,
      hasPrevious: true,
      nextPage: 3,
      previousPage: 1,
      itemList: [
        { productId: 'p-1', name: 'Product', sku: 'SKU-1', shop: 'Shop', stock: 4, threshold: 5, status: 'ACTIVE', isLow: true, variantId: '', variantTitle: '', isVariant: false, hasVariants: true },
        { productId: 'p-2', name: 'Variant product', sku: 'SKU-2-M', shop: 'Shop', stock: 12, threshold: 5, status: 'ACTIVE', isLow: false, variantId: 'v-2', variantTitle: 'Medium', isVariant: true, hasVariants: true },
      ],
      summary: { products: 21, units: 128, low: 4, out: 2 },
    });

    expect(list.totalRecord).toBe(21);
    expect(list.itemList[0]?.sku).toBe('SKU-1');
    expect(list.itemList[1]?.variantTitle).toBe('Medium');
    expect(list.itemList[1]?.isVariant).toBe(true);
    expect(list.summary).toEqual({ products: 21, units: 128, low: 4, out: 2 });
  });

  it('returns safe defaults for an empty response', () => {
    expect(toInventoryList().summary).toEqual({ products: 0, units: 0, low: 0, out: 0 });
    expect(toInventoryList().itemList).toEqual([]);
  });
});
