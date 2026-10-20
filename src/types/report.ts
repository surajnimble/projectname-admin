import type { LowStockListData, LowStockProductData } from '@/lib/api/contract';

type RawLowStockProduct = Partial<Record<keyof LowStockProductData, unknown>>;
type RawInventoryReport = {
  rowList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toLowStockProduct = (raw: RawLowStockProduct = {}): LowStockProductData => ({
  name: toString(raw.name),
  sku: toString(raw.sku),
  shop: toString(raw.shop),
  stock: toNumber(raw.stock),
  threshold: toNumber(raw.threshold),
  status: toString(raw.status),
  isLow: raw.isLow === true,
});

export const toLowStockList = (raw: RawInventoryReport = {}): LowStockListData => {
  const itemList = Array.isArray(raw.rowList)
    ? raw.rowList
        .filter(isObject)
        .map((item) => toLowStockProduct(item))
        .filter((item) => item.isLow)
    : [];

  return { totalRecord: itemList.length, itemList };
};
