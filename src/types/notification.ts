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

type RawNotificationTemplateList = {
  itemCount?: unknown;
  templateList?: unknown;
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
): NotificationTemplateListData => {
  const itemList = Array.isArray(raw.templateList)
    ? raw.templateList.filter(isObject).map((item) => toNotificationTemplate(item))
    : [];
  const totalRecord = toNumber(raw.itemCount) || itemList.length;

  // The backend's template endpoint intentionally returns one complete list,
  // not a paginated envelope. Keep PageData compatible for the existing table.
  return {
    totalRecord,
    totalPage: itemList.length > 0 ? 1 : 0,
    currentPage: 1,
    limit: Math.max(1, itemList.length),
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList,
  };
};

export const toNotificationUnreadCount = (
  raw: Record<string, unknown> = {},
): NotificationUnreadCountData => ({
  // The API returns `total`; accept the older `unreadCount` alias as well.
  unreadCount: toNumber(raw.total ?? raw.unreadCount),
});