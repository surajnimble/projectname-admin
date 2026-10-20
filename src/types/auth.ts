import type { AuthData, EmptyData, UserData } from '@/lib/api/contract';
import { emptyData } from '@/lib/api/contract';

// Response shapes live in lib/api-contract (base-response); this module only fills
// their defaults so UI data never holds `null`.

export type { SessionUser } from '@/lib/api/contract';

export const toEmptyData = (): EmptyData => emptyData();

type RawUser = Partial<UserData> & { rolesList?: unknown; roles?: unknown; role?: unknown };
type RawAuth = RawUser & Partial<Omit<AuthData, 'userData' | 'rolesList'>> & { userData?: RawUser };

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
  };
};