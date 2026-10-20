import type { AuthData, EmptyData, PermissionData, SubAdminData, SubAdminListData, UserData } from '@/lib/api/contract';
import { emptyData } from '@/lib/api/contract';

// Response shapes live in lib/api-contract (base-response); this module only fills
// their defaults so UI data never holds `null`.

export type { SessionUser } from '@/lib/api/contract';

export const toEmptyData = (): EmptyData => emptyData();

type RawUser = Partial<UserData> & { rolesList?: unknown; roles?: unknown; role?: unknown };
type RawAuth = RawUser & Partial<Omit<AuthData, 'userData' | 'rolesList'>> & { userData?: RawUser; permissionList?: unknown };

export const toUserData = (raw: Partial<UserData> = {}): UserData => ({
  userId: raw.userId ?? '',
  name: raw.name ?? '',
  email: raw.email ?? '',
  phone: raw.phone ?? '',
  isActive: raw.isActive ?? false,
  isEmailVerified: raw.isEmailVerified ?? false,
  isPhoneVerified: raw.isPhoneVerified ?? false,
});

const asStrings = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((v): v is string => typeof v === 'string') : [];

// Roles can arrive at result level or inside userData, as a list or as a single role.
const pickRoles = (raw: RawAuth): string[] => {
  const candidates = [
    raw.rolesList,
    raw.userData?.rolesList,
    raw.roles,
    raw.userData?.roles,
    typeof raw.role === 'string' ? [raw.role] : undefined,
    typeof raw.userData?.role === 'string' ? [raw.userData.role] : undefined,
  ];
  return candidates.map(asStrings).find((roles) => roles.length > 0) ?? [];
};

export const toAuthData = (raw: RawAuth = {}): AuthData => {
  const hasNestedUser = !!raw.userData && Object.keys(raw.userData).length > 0;
  return {
    accessToken: raw.accessToken ?? '',
    expiresIn: raw.expiresIn ?? 0,
    twoFactorRequired: raw.twoFactorRequired ?? false,
    userData: toUserData(hasNestedUser ? raw.userData : raw),
    rolesList: pickRoles(raw),
  permissionList: asStrings(raw.permissionList),
  };
};

type RawSubAdmin = Partial<Record<keyof SubAdminData, unknown>> & { role?: string };

export const toSubAdmin = (raw: RawSubAdmin = {}): SubAdminData => ({
  userId: typeof raw.userId === 'string' ? raw.userId : '',
  name: typeof raw.name === 'string' ? raw.name : '',
  email: typeof raw.email === 'string' ? raw.email : '',
  phone: typeof raw.phone === 'string' ? raw.phone : '',
  role: typeof raw.role === 'string' ? raw.role : 'SUB_ADMIN',
  permissions: Array.isArray(raw.permissions) ? raw.permissions.filter((p): p is string => typeof p === 'string') : [],
  isActive: raw.isActive === true,
  createdAt: typeof raw.createdAt === 'string' ? raw.createdAt : '',
  updatedAt: typeof raw.updatedAt === 'string' ? raw.updatedAt : '',
});

export const toPermissionData = (raw: Partial<Record<keyof PermissionData, unknown>> = {}): PermissionData => ({
  roleList: typeof raw.roleList === 'object' && raw.roleList !== null ? raw.roleList as Record<string, string[]> : {},
});

export const toSubAdminList = (
  raw: Partial<Record<keyof Omit<SubAdminListData, 'itemList'>, unknown>> & {
    itemList?: unknown;
  } = {},
): SubAdminListData => ({
  totalRecord: typeof raw.totalRecord === 'number' ? raw.totalRecord : 0,
  totalPage: typeof raw.totalPage === 'number' ? raw.totalPage : 0,
  currentPage: typeof raw.currentPage === 'number' ? raw.currentPage : 0,
  limit: typeof raw.limit === 'number' ? raw.limit : 0,
  hasNext: raw.hasNext === true,
  hasPrevious: raw.hasPrevious === true,
  nextPage: typeof raw.nextPage === 'number' ? raw.nextPage : 0,
  previousPage: typeof raw.previousPage === 'number' ? raw.previousPage : 0,
  itemList: Array.isArray(raw.itemList)
    ? raw.itemList.filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null).map((item) => toSubAdmin(item))
    : [],
});