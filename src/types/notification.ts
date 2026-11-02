import type {
  NotificationData,
  NotificationListData,
  NotificationTemplateData,
  NotificationTemplateListData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toNotification = (raw: unknown = {}): NotificationData => {
  const r = raw as Record<string, unknown>;
  return {
    notificationId: toString(r.notificationId),
    userId: toString(r.userId),
    userName: toString(r.userName),
    type: toString(r.type),
    channel: toString(r.channel),
    title: toString(r.title),
    body: toString(r.body),
    data: r.data as Record<string, unknown> ?? {},
    isRead: toBoolean(r.isRead),
    readAt: toString(r.readAt),
    createdAt: toString(r.createdAt),
  };
};

export const toNotificationList = (
  raw: Partial<NotificationListData> = {},
): NotificationListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toNotification(item))
    : [],
});

export const toNotificationTemplate = (
  raw: unknown = {},
): NotificationTemplateData => {
  const r = raw as Record<string, unknown>;
  return {
    templateId: toString(r.templateId),
    key: toString(r.key),
    name: toString(r.name),
    channel: toString(r.channel),
    title: toString(r.title),
    body: toString(r.body),
    variables: Array.isArray(r.variables) ? r.variables.filter(isObject).map(String) : [],
    isActive: toBoolean(r.isActive),
    createdAt: toString(r.createdAt),
    updatedAt: toString(r.updatedAt),
  };
};

export const toNotificationTemplateList = (
  raw: Partial<NotificationTemplateListData> = {},
): NotificationTemplateListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter(isObject).map((item) => toNotificationTemplate(item))
    : [],
});
