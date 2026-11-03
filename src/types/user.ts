import type {
  AddressData,
  OrderListData,
  SocialProviderData,
  UserData,
  UserDetailData,
  UserStatsData,
  UserListData,
} from '@/lib/api/contract';
import { toOrderList } from '@/types/order';

type RawUser = Partial<Record<keyof Omit<UserData, never>, unknown>>;

const toNumber = (value: unknown): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : 0;

const toString = (value: unknown): string => (typeof value === 'string' ? value : '');

const toBoolean = (value: unknown): boolean => value === true;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

export const toUser = (raw: RawUser = {}): UserData => ({
  userId: toString(raw.userId),
  name: toString(raw.name),
  email: toString(raw.email),
  phone: toString(raw.phone),
  avatarUrl: toString(raw.avatarUrl),
  role: toString(raw.role),
  isActive: toBoolean(raw.isActive),
  isEmailVerified: toBoolean(raw.isEmailVerified),
  isPhoneVerified: toBoolean(raw.isPhoneVerified),
  isTwoFactorEnabled: toBoolean(raw.isTwoFactorEnabled),
  loyaltyTier: toString(raw.loyaltyTier),
  lastLoginAt: toString(raw.lastLoginAt),
  createdAt: toString(raw.createdAt),
  updatedAt: toString(raw.updatedAt),
});

type RawUserList = Partial<Record<keyof Omit<UserListData, 'itemList'>, unknown>> & {
  userList?: unknown;
};

export const toUserList = (raw: RawUserList = {}): UserListData => ({
  totalRecord: toNumber(raw.totalRecord),
  totalPage: toNumber(raw.totalPage),
  currentPage: toNumber(raw.currentPage),
  limit: toNumber(raw.limit),
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: toNumber(raw.nextPage),
  previousPage: toNumber(raw.previousPage),
  itemList: Array.isArray(raw.userList)
    ? raw.userList.filter(isObject).map((item) => toUser(item as Record<string, unknown>))
    : [],
});

type RawUserDetail = Record<string, unknown> & {
  userData?: unknown;
  vendorData?: unknown;
  addressList?: unknown;
  socialProviderList?: unknown;
  statsData?: unknown;
};

export const toUserDetail = (raw: RawUserDetail = {}): UserDetailData => ({
  role: toString(raw.role),
  userData: toUser(isObject(raw.userData) ? raw.userData : {}),
  vendorData: isObject(raw.vendorData) ? raw.vendorData : {},
  addressList: Array.isArray(raw.addressList)
    ? raw.addressList.filter(isObject).map((item) => ({
        addressId: toString(item.addressId),
        fullName: toString(item.fullName),
        phone: toString(item.phone),
        line1: toString(item.line1),
        line2: toString(item.line2),
        landmark: toString(item.landmark),
        city: toString(item.city),
        state: toString(item.state),
        country: toString(item.country),
        pincode: toString(item.pincode),
        isDefault: toBoolean(item.isDefault),
      }))
    : [],
  socialProviderList: Array.isArray(raw.socialProviderList)
    ? raw.socialProviderList.filter(isObject).map((item) => ({
        provider: toString(item.provider),
        providerId: toString(item.providerId),
      }))
    : [],
  statsData: {
    orderCount: toNumber(isObject(raw.statsData) ? raw.statsData.orderCount : 0),
    reviewCount: toNumber(isObject(raw.statsData) ? raw.statsData.reviewCount : 0),
    addressCount: toNumber(isObject(raw.statsData) ? raw.statsData.addressCount : 0),
  },
});

export const toUserOrderList = (raw: Partial<OrderListData> = {}): OrderListData =>
  toOrderList(raw);
