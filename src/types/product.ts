import type { ProductListData, ProductSummaryData } from '@/lib/api/contract';

type RawProduct = Partial<Record<keyof Omit<ProductSummaryData, 'categoryData'>, unknown>> & {
  categoryData?: { categoryId?: unknown; name?: unknown };
};
type RawProductList = Partial<Record<keyof Omit<ProductListData, 'itemList'>, unknown>> & {
  productList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toProductSummary = (raw: RawProduct = {}): ProductSummaryData => ({
  productId: toString(raw.productId),
  vendorId: toString(raw.vendorId),
  name: toString(raw.name),
  slug: toString(raw.slug),
  sku: toString(raw.sku),
  price: toNumber(raw.price),
  mrpPrice: toNumber(raw.mrpPrice),
  stock: toNumber(raw.stock),
  condition: toString(raw.condition),
  warrantyMonths: toNumber(raw.warrantyMonths),
  isNonReturnable: raw.isNonReturnable === true,
  isActive: raw.isActive === true,
  isFeatured: raw.isFeatured === true,
  rating: toNumber(raw.rating),
  soldCount: toNumber(raw.soldCount),
  createdAt: toString(raw.createdAt),
  imageList: Array.isArray(raw.imageList)
    ? raw.imageList.filter((item): item is string => typeof item === 'string')
    : [],
  categoryData: {
    categoryId: toString(raw.categoryData?.categoryId),
    name: toString(raw.categoryData?.name),
  },
});

export const toProductList = (raw: RawProductList = {}): ProductListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.productList)
    ? raw.productList.filter(isObject).map((item) => toProductSummary(item))
    : [],
});
