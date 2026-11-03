import type { DeliveryBoyListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawDeliveryBoyList = Partial<
  Record<keyof Omit<DeliveryBoyListData, 'itemList'>, unknown>
> & {
  deliveryBoyList?: unknown;
};

export const toDeliveryBoyList = (raw: RawDeliveryBoyList = {}): DeliveryBoyListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.deliveryBoyList)
    ? raw.deliveryBoyList.filter(isObject).map((item) => ({
        deliveryBoyId: toString(item.deliveryBoyId),
        name: toString(item.name),
        phone: toString(item.phone),
        email: toString(item.email),
        status: toString(item.status),
        isActive: toBoolean(item.isActive),
        currentOrderCount: toNumber(item.currentOrderCount),
        maxOrders: toNumber(item.maxOrders),
        createdAt: toString(item.createdAt),
        updatedAt: toString(item.updatedAt),
      }))
    : [],
});
