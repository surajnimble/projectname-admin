import type { InventoryListData, LowStockListData, LowStockProductData, StockMovementData, StockMovementListData } from '@/lib/api/contract';

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
  productId: toString(raw.productId),
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
        .filter((item) => item.isLow || item.stock <= item.threshold)
    : [];

  return { totalRecord: itemList.length, itemList };
};


type RawStockMovement = Partial<Record<keyof StockMovementData, unknown>>;
type RawStockMovementList = Partial<Record<keyof Omit<StockMovementListData, 'itemList'>, unknown>> & {
  itemList?: unknown;
};

export const toStockMovementList = (raw: RawStockMovementList = {}): StockMovementListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => {
        const movement = item as RawStockMovement;
        return {
          movementId: toString(movement.movementId),
          productId: toString(movement.productId),
          productName: toString(movement.productName),
          sku: toString(movement.sku),
          variantId: toString(movement.variantId),
          adjustment: toNumber(movement.adjustment),
          previousStock: toNumber(movement.previousStock),
          stock: toNumber(movement.stock),
          reason: toString(movement.reason),
          action: toString(movement.action),
          actorName: toString(movement.actorName),
          createdAt: toString(movement.createdAt),
        };
      })
    : [],
});


type RawInventoryList = Partial<Record<keyof Omit<InventoryListData, 'itemList' | 'summary'>, unknown>> & {
  itemList?: unknown;
  summary?: unknown;
};

export const toInventoryList = (raw: RawInventoryList = {}): InventoryListData => {
  const summary = isObject(raw.summary) ? raw.summary : {};
  const itemList = Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => ({
        ...toLowStockProduct(item),
        variantId: toString(item.variantId),
        variantTitle: toString(item.variantTitle),
        isVariant: item.isVariant === true,
        hasVariants: item.hasVariants === true,
      }))
    : [];

  return {
    totalRecord: toNumber(raw.totalRecord),
    totalPage: toNumber(raw.totalPage),
    currentPage: toNumber(raw.currentPage),
    limit: toNumber(raw.limit),
    hasNext: raw.hasNext === true,
    hasPrevious: raw.hasPrevious === true,
    nextPage: toNumber(raw.nextPage),
    previousPage: toNumber(raw.previousPage),
    itemList,
    summary: {
      products: toNumber(summary.products),
      units: toNumber(summary.units),
      low: toNumber(summary.low),
      out: toNumber(summary.out),
    },
  };
};
