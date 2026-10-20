import type { AuthData } from '@/lib/api/contract';
import { ROLES, STAFF_ROLES } from '@/constants';
import type { SessionUser } from '@/types/auth';

export const isStaff = (roles: readonly string[]) =>
  roles.some((role) => (STAFF_ROLES as readonly string[]).includes(role));

export const isSuperAdmin = (roles: readonly string[]) => roles.includes(ROLES.superAdmin);

// When the API sends no roles at all, the backend stays the gatekeeper.
export const isAllowedUser = (roles: readonly string[]) => roles.length === 0 || isStaff(roles);

export const toSessionUser = (data: AuthData): SessionUser => ({
  userId: data.userData.userId,
  name: data.userData.name,
  email: data.userData.email,
  phone: data.userData.phone,
  roles: data.rolesList,
  permissions: data.permissionList,
});

export const hasPermission = (user: SessionUser | null, permission: string) =>
  !!user && (user.roles.length === 0 || isSuperAdmin(user.roles) || user.permissions.includes(permission));
