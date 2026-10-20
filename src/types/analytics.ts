import type {
  ProductPerformanceData,
  ProductPerformanceListData,
} from '@/lib/api/contract';

export type ProductPerformanceSort = 'revenue' | 'qty';

type RawProductPerformance = Partial<Record<keyof ProductPerformanceData, unknown>>;
type RawProductPerformanceList = Partial<
  Record<keyof Omit<ProductPerformanceListData, 'itemList'>, unknown>
> & {
  productList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toProductPerformance = (
  raw: RawProductPerformance = {},
): ProductPerformanceData => ({
  productId: toString(raw.productId),
  name: toString(raw.name),
  qty: toNumber(raw.qty),
  revenue: toNumber(raw.revenue),
  views: toNumber(raw.views),
  rating: toNumber(raw.rating),
});

export const toProductPerformanceList = (
  raw: RawProductPerformanceList = {},
): ProductPerformanceListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.productList)
    ? raw.productList.filter(isObject).map((item) => toProductPerformance(item))
    : [],
});
