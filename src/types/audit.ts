import type { AuditLogData, AuditLogListData } from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawAuditLogList = Partial<
  Record<keyof Omit<AuditLogListData, 'itemList'>, unknown>
> & {
  auditLogList?: unknown;
};

export const toAuditLogList = (raw: RawAuditLogList = {}): AuditLogListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.auditLogList)
    ? raw.auditLogList.filter(isObject).map((item) => ({
        auditLogId: toString(item.auditLogId),
        userId: toString(item.userId),
        action: toString(item.action),
        entity: toString(item.entity),
        entityId: toString(item.entityId),
        meta: isObject(item.meta) ? item.meta : {},
        ip: toString(item.ip),
        deviceId: toString(item.deviceId),
        createdAt: toString(item.createdAt),
        userData: isObject(item.userData)
          ? {
              userId: toString(item.userData.userId),
              name: toString(item.userData.name),
              email: toString(item.userData.email),
            }
          : { userId: '', name: '', email: '' },
      }))
    : [],
});
