import type {
  NotificationData,
  NotificationListData,
  NotificationTemplateData,
  NotificationTemplateListData,
  NotificationUnreadCountData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

type RawNotificationList = Partial<
  Record<keyof Omit<NotificationListData, 'itemList'>, unknown>
> & {
  notificationList?: unknown;
};

type RawNotificationTemplateList = Partial<
  Record<keyof Omit<NotificationTemplateListData, 'itemList'>, unknown>
> & {
  notificationTemplateList?: unknown;
};

export const toNotification = (raw: Record<string, unknown> = {}): NotificationData => ({
  notificationId: toString(raw.notificationId),
  userId: toString(raw.userId),
  userName: toString(raw.userName),
  type: toString(raw.type),
  channel: toString(raw.channel),
  title: toString(raw.title),
  body: toString(raw.body),
  data: isObject(raw.data) ? (raw.data as Record<string, unknown>) : {},
  isRead: toBoolean(raw.isRead),
  readAt: toString(raw.readAt),
  createdAt: toString(raw.createdAt),
});

export const toNotificationList = (raw: RawNotificationList = {}): NotificationListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.notificationList)
    ? raw.notificationList.filter(isObject).map((item) => toNotification(item))
    : [],
});

export const toNotificationTemplate = (
  raw: Record<string, unknown> = {},
): NotificationTemplateData => ({
  templateId: toString(raw.templateId),
  key: toString(raw.key),
  name: toString(raw.name),
  channel: toString(raw.channel),
  title: toString(raw.title),
  body: toString(raw.body),
  variables: Array.isArray(raw.variables)
    ? raw.variables.filter((v): v is string => typeof v === 'string')
    : [],
  isActive: toBoolean(raw.isActive),
  createdAt: toString(raw.createdAt),
  updatedAt: toString(raw.updatedAt),
});

export const toNotificationTemplateList = (
  raw: RawNotificationTemplateList = {},
): NotificationTemplateListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.notificationTemplateList)
    ? raw.notificationTemplateList.filter(isObject).map((item) => toNotificationTemplate(item))
    : [],
});

export const toNotificationUnreadCount = (
  raw: Record<string, unknown> = {},
): NotificationUnreadCountData => ({
  unreadCount: toNumber(raw.unreadCount),
});