import type { CouponUsageListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawCouponUsageList = Partial<
  Record<keyof Omit<CouponUsageListData, 'itemList'>, unknown>
> & {
  couponUsageList?: unknown;
};

export const toCouponUsageList = (raw: RawCouponUsageList = {}): CouponUsageListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.couponUsageList)
    ? raw.couponUsageList.filter(isObject).map((item) => ({
        usageId: toString(item.usageId),
        couponId: toString(item.couponId),
        userId: toString(item.userId),
        orderId: toString(item.orderId),
        amount: toNumber(item.amount),
        createdAt: toString(item.createdAt),
        couponData: {
          couponId: toString(isObject(item.couponData) ? item.couponData.couponId : ''),
          code: toString(isObject(item.couponData) ? item.couponData.code : ''),
          title: toString(isObject(item.couponData) ? item.couponData.title : ''),
          type: toString(isObject(item.couponData) ? item.couponData.type : ''),
        },
        userData: {
          userId: toString(isObject(item.userData) ? item.userData.userId : ''),
          name: toString(isObject(item.userData) ? item.userData.name : ''),
          email: toString(isObject(item.userData) ? item.userData.email : ''),
        },
      }))
    : [],
});
