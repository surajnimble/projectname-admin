import type { ActivityLogData, ActivityLogListData, ActivityLogUserData } from '@/lib/api/contract';

type RawActivityLogUser = Partial<Record<keyof ActivityLogUserData, unknown>>;
type RawActivityLog = Partial<Record<keyof Omit<ActivityLogData, 'userData'>, unknown>> & {
  userData?: RawActivityLogUser;
};
type RawActivityLogList = Partial<Record<keyof Omit<ActivityLogListData, 'itemList'>, unknown>> & {
  itemList?: unknown;
};

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toRecord = (value: unknown): Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toActivityLogUserData = (raw: RawActivityLogUser = {}): ActivityLogUserData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  email: toString(raw.email),
});

export const toActivityLog = (raw: RawActivityLog = {}): ActivityLogData => ({
  activityLogId: toString(raw.activityLogId),
  userId: toString(raw.userId),
  action: toString(raw.action),
  entity: toString(raw.entity),
  entityId: toString(raw.entityId),
  meta: toRecord(raw.meta),
  ip: toString(raw.ip),
  deviceId: toString(raw.deviceId),
  createdAt: toString(raw.createdAt),
  userData: toActivityLogUserData(raw.userData),
});

export const toActivityLogList = (raw: RawActivityLogList = {}): ActivityLogListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toActivityLog(item))
    : [],
});
