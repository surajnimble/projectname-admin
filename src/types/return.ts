import type { ReturnListData, ReturnRequestData } from '@/lib/api/contract';

type RawReturn = Partial<Record<keyof Omit<ReturnRequestData, 'itemList' | 'vendorData'>, unknown>> & {
  vendorData?: { vendorId?: unknown; shopName?: unknown; slug?: unknown };
  itemList?: unknown;
};
type RawReturnList = Partial<Record<keyof Omit<ReturnListData, 'itemList'>, unknown>> & {
  itemList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toReturn = (raw: RawReturn = {}): ReturnRequestData => ({
  returnId: toString(raw.returnId),
  returnNumber: toString(raw.returnNumber),
  orderId: toString(raw.orderId),
  subOrderId: toString(raw.subOrderId),
  vendorId: toString(raw.vendorId),
  userId: toString(raw.userId),
  status: toString(raw.status),
  reasonText: toString(raw.reasonText),
  comment: toString(raw.comment),
  images: Array.isArray(raw.images)
    ? raw.images.filter((item): item is string => typeof item === 'string')
    : [],
  refundAmount: toNumber(raw.refundAmount),
  refundMode: toString(raw.refundMode),
  rejectReason: toString(raw.rejectReason),
  requestedAt: toString(raw.requestedAt),
  pickedUpAt: toString(raw.pickedUpAt),
  receivedAt: toString(raw.receivedAt),
  settlementDays: toNumber(raw.settlementDays),
  expectedSettlementAt: toString(raw.expectedSettlementAt),
  vendorData: {
    vendorId: toString(raw.vendorData?.vendorId),
    shopName: toString(raw.vendorData?.shopName),
    slug: toString(raw.vendorData?.slug),
  },
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => ({
        returnItemId: toString(item.returnItemId),
        orderItemId: toString(item.orderItemId),
        qty: toNumber(item.qty),
        refundAmount: toNumber(item.refundAmount),
        isApproved: item.isApproved === true,
      }))
    : [],
});

export const toReturnList = (raw: RawReturnList = {}): ReturnListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toReturn(item))
    : [],
});
