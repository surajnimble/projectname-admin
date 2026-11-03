import type { CouponListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawCouponList = Partial<
  Record<keyof Omit<CouponListData, 'itemList'>, unknown>
> & {
  couponList?: unknown;
};

export const toCouponList = (raw: RawCouponList = {}): CouponListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.couponList)
    ? raw.couponList.filter(isObject).map((item) => ({
        couponId: toString(item.couponId),
        code: toString(item.code),
        title: toString(item.title),
        description: toString(item.description),
        type: toString(item.type),
        value: toNumber(item.value),
        minOrderValue: toNumber(item.minOrderValue),
        maxDiscount: toNumber(item.maxDiscount),
        usageLimit: toNumber(item.usageLimit),
        usedCount: toNumber(item.usedCount),
        startsAt: toString(item.startsAt),
        expiresAt: toString(item.expiresAt),
        isActive: toBoolean(item.isActive),
        applicableTo: toString(item.applicableTo),
        applicableVendors: Array.isArray(item.applicableVendors)
          ? item.applicableVendors.filter((v): v is string => typeof v === 'string')
          : [],
        createdBy: toString(item.createdBy),
        createdAt: toString(item.createdAt),
        updatedAt: toString(item.updatedAt),
      }))
    : [],
});
