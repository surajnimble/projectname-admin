import type { UserListData, UserData } from '@/lib/api/contract';

type RawUser = Partial<Record<keyof Omit<UserData, never>, unknown>>;

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

export const toUser = (raw: RawUser = {}): UserData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  email: toString(raw.email),
  phone: toString(raw.phone),
  isActive: toBoolean(raw.isActive),
  isEmailVerified: toBoolean(raw.isEmailVerified),
  isPhoneVerified: toBoolean(raw.isPhoneVerified),
});

export const toUserList = (raw: Partial<UserListData> = {}): UserListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.itemList) ? raw.itemList.filter(Boolean).map(toUser) : [],
});
