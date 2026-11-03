import type { ShippingZoneListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const toStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

type RawShippingZoneList = Partial<
  Record<keyof Omit<ShippingZoneListData, 'itemList'>, unknown>
> & {
  shippingZoneList?: unknown;
};

export const toShippingZoneList = (raw: RawShippingZoneList = {}): ShippingZoneListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.shippingZoneList)
    ? raw.shippingZoneList.filter(isObject).map((item) => ({
        zoneId: toString(item.zoneId),
        name: toString(item.name),
        description: toString(item.description),
        countries: toStringArray(item.countries),
        states: toStringArray(item.states),
        cities: toStringArray(item.cities),
        pincodes: toStringArray(item.pincodes),
        isActive: toBoolean(item.isActive),
        createdAt: toString(item.createdAt),
        updatedAt: toString(item.updatedAt),
      }))
    : [],
});
