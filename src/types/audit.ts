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
    ? raw.auditLogList.filter(isObject).map((item) => {
        const actorData = isObject(item.actorData)
          ? item.actorData
          : isObject(item.userData)
            ? item.userData
            : {};
        const impersonatedByData = isObject(item.impersonatedByData)
          ? item.impersonatedByData
          : {};

        return {
          auditLogId: toString(item.auditLogId),
          actorId: toString(item.actorId ?? item.userId),
          actorRole: toString(item.actorRole),
          impersonatedById: toString(item.impersonatedById),
          action: toString(item.action),
          entity: toString(item.entity),
          entityId: toString(item.entityId),
          description: toString(item.description),
          changes: isObject(item.changes) ? item.changes : {},
          meta: isObject(item.meta) ? item.meta : {},
          ip: toString(item.ip),
          userAgent: toString(item.userAgent),
          createdAt: toString(item.createdAt),
          actorData: {
            userId: toString(actorData.userId),
            name: toString(actorData.name),
            email: toString(actorData.email),
          },
          impersonatedByData: {
            userId: toString(impersonatedByData.userId),
            name: toString(impersonatedByData.name),
            email: toString(impersonatedByData.email),
          },
        };
      })
    : [],
});
