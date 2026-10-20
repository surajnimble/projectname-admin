import { describe, expect, it } from 'vitest';
import { toProductList, toProductSummary } from './product';

describe('toProductSummary', () => {
  it('maps a product with its category', () => {
    const product = toProductSummary({
      productId: 'p1',
      vendorId: 'v1',
      name: 'Demo Product',
      sku: 'SKU-1',
      price: 999,
      mrpPrice: 1299,
      stock: 12,
      condition: 'NEW',
      isActive: true,
      rating: 4.2,
      soldCount: 30,
      categoryData: { categoryId: 'c1', name: 'Mobiles' },
    });

    expect(product.productId).toBe('p1');
    expect(product.name).toBe('Demo Product');
    expect(product.price).toBe(999);
    expect(product.stock).toBe(12);
    expect(product.isActive).toBe(true);
    expect(product.soldCount).toBe(30);
    expect(product.categoryData.name).toBe('Mobiles');
  });

  it('keeps only the image urls', () => {
    expect(
      toProductSummary({ imageList: ['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg'] })
        .imageList,
    ).toEqual(['https://cdn.test/a.jpg', 'https://cdn.test/b.jpg']);
  });

  it('fills missing fields with safe defaults', () => {
    expect(toProductSummary()).toEqual({
      productId: '',
      vendorId: '',
      name: '',
      slug: '',
      sku: '',
      price: 0,
      mrpPrice: 0,
      stock: 0,
      condition: '',
      warrantyMonths: 0,
      isNonReturnable: false,
      isActive: false,
      isFeatured: false,
      rating: 0,
      soldCount: 0,
      createdAt: '',
      imageList: [],
      categoryData: { categoryId: '', name: '' },
    });
  });
});

describe('toProductList', () => {
  it('maps the pagination and the product list', () => {
    const list = toProductList({
      totalRecord: 1,
      currentPage: 1,
      limit: 10,
      productList: [{ productId: 'p1' }, null],
    });

    expect(list.totalRecord).toBe(1);
    expect(list.itemList).toHaveLength(1);
    expect(list.itemList[0]?.productId).toBe('p1');
  });

  it('returns an empty list when productList is missing', () => {
    expect(toProductList({ totalRecord: 2 }).itemList).toEqual([]);
  });
});
