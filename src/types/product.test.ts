import { describe, expect, it } from 'vitest';
import { toProductDetail, toProductList, toProductSummary } from './product';

describe('toProductSummary', () => {
  it('maps a product with its category', () => {
    const product = toProductSummary({
      productId: 'p1',
      name: 'Demo Product',
      sku: 'SKU-1',
      price: 999,
      mrpPrice: 1299,
      stock: 12,
      isActive: true,
      isFeatured: true,
      rating: 4.2,
      soldCount: 30,
      imageList: ['https://cdn.test/a.jpg'],
      categoryData: { categoryId: 'c1', name: 'Mobiles' },
    });

    expect(product.productId).toBe('p1');
    expect(product.price).toBe(999);
    expect(product.stock).toBe(12);
    expect(product.isActive).toBe(true);
    expect(product.isFeatured).toBe(true);
    expect(product.imageList).toEqual(['https://cdn.test/a.jpg']);
    expect(product.categoryData.name).toBe('Mobiles');
  });

  it('fills missing fields with safe defaults', () => {
    expect(toProductSummary()).toMatchObject({
      productId: '',
      name: '',
      price: 0,
      stock: 0,
      isActive: false,
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

describe('toProductDetail', () => {
  it('maps the detail with variants, attributes and tags', () => {
    const detail = toProductDetail({
      productId: 'p1',
      name: 'Demo Product',
      description: 'A demo',
      price: 999,
      taxPercent: 18,
      stock: 4,
      lowStockThreshold: 2,
      status: 'ACTIVE',
      isActive: true,
      isOutOfStock: false,
      soldCount: 10,
      viewCount: 100,
      rating: 4.5,
      ratingCount: 12,
      imageList: ['https://cdn.test/a.jpg'],
      categoryData: { categoryId: 'c1', name: 'Mobiles', slug: 'mobiles' },
      brandData: { brandId: 'b1', name: 'Acme', slug: 'acme' },
      variantList: [{ variantId: 'v1', title: 'Blue', sku: 'SKU-B', stock: 2 }],
      attributeList: [{ attributeId: 'a1', name: 'Color', value: 'Blue' }],
      tagList: [{ tagId: 't1', name: 'sale', slug: 'sale' }],
    });

    expect(detail.description).toBe('A demo');
    expect(detail.taxPercent).toBe(18);
    expect(detail.categoryData.name).toBe('Mobiles');
    expect(detail.brandData.name).toBe('Acme');
    expect(detail.variantList[0]?.title).toBe('Blue');
    expect(detail.attributeList[0]?.value).toBe('Blue');
    expect(detail.tagList[0]?.name).toBe('sale');
  });

  it('fills missing fields with safe defaults', () => {
    expect(toProductDetail()).toMatchObject({
      productId: '',
      name: '',
      price: 0,
      stock: 0,
      variantList: [],
      attributeList: [],
      tagList: [],
      imageList: [],
    });
  });
});
