import type {
  TicketData,
  TicketListData,
  TicketCategoryData,
  TicketCategoryListData,
  TicketMessageData,
  TicketNoteData,
} from '@/lib/api/contract';

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toTicket = (raw: unknown = {}): TicketData => {
  const r = raw as Record<string, unknown>;
  return {
    ticketId: toString(r.ticketId),
    ticketNumber: toString(r.ticketNumber),
    userId: toString(r.userId),
    userName: toString(r.userName),
    userEmail: toString(r.userEmail),
    userPhone: toString(r.userPhone),
    categoryId: toString(r.categoryId),
    categoryName: toString(r.categoryName),
    subject: toString(r.subject),
    description: toString(r.description),
    priority: toString(r.priority),
    status: toString(r.status),
    assignedToId: toString(r.assignedToId),
    assignedToName: toString(r.assignedToName),
    createdAt: toString(r.createdAt),
    updatedAt: toString(r.updatedAt),
    resolvedAt: toString(r.resolvedAt),
    closedAt: toString(r.closedAt),
  };
};

type RawTicketList = Partial<TicketListData> & {
  ticketList?: unknown;
};

export const toTicketList = (raw: RawTicketList = {}): TicketListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.ticketList)
    ? raw.ticketList.filter(isObject).map((item) => toTicket(item))
    : [],
});

export const toTicketCategory = (raw: unknown = {}): TicketCategoryData => {
  const r = raw as Record<string, unknown>;
  return {
    categoryId: toString(r.categoryId),
    name: toString(r.name),
    slug: toString(r.slug),
    isActive: toBoolean(r.isActive),
    sortOrder: toNumber(r.sortOrder),
    createdAt: toString(r.createdAt),
    updatedAt: toString(r.updatedAt),
  };
};

type RawTicketCategoryList = Partial<TicketCategoryListData> & {
  ticketCategoryList?: unknown;
};

export const toTicketCategoryList = (
  raw: RawTicketCategoryList = {},
): TicketCategoryListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.ticketCategoryList)
    ? raw.ticketCategoryList.filter(isObject).map((item) => toTicketCategory(item))
    : [],
});

export const toTicketMessage = (raw: unknown = {}): TicketMessageData => {
  const r = raw as Record<string, unknown>;
  return {
    messageId: toString(r.messageId),
    ticketId: toString(r.ticketId),
    userId: toString(r.userId),
    userName: toString(r.userName),
    message: toString(r.message),
    isInternal: toBoolean(r.isInternal),
    createdAt: toString(r.createdAt),
  };
};

export const toTicketNote = (raw: unknown = {}): TicketNoteData => {
  const r = raw as Record<string, unknown>;
  return {
    noteId: toString(r.noteId),
    ticketId: toString(r.ticketId),
    userId: toString(r.userId),
    userName: toString(r.userName),
    note: toString(r.note),
    createdAt: toString(r.createdAt),
  };
};
