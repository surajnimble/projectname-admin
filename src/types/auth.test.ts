import { describe, expect, it } from 'vitest';
import { toPermissionData } from './auth';

describe('toPermissionData', () => {
  it('keeps the assignable catalogue the backend sends', () => {
    const data = toPermissionData({
      roleList: { SUB_ADMIN: ['dashboard:view'] },
      permissionList: ['dashboard:view', 'vendor:approve'],
    });

    expect(data.permissionList).toEqual(['dashboard:view', 'vendor:approve']);
    expect(data.roleList['SUB_ADMIN']).toEqual(['dashboard:view']);
  });

  it('falls back to the granted permissions when no catalogue is sent', () => {
    const data = toPermissionData({ roleList: { SUB_ADMIN: ['dashboard:view'] } });

    expect(data.permissionList).toEqual(['dashboard:view']);
  });

  it('drops entries that are not strings', () => {
    const data = toPermissionData({
      permissionList: ['dashboard:view', 42, null, 'vendor:list'],
    });

    expect(data.permissionList).toEqual(['dashboard:view', 'vendor:list']);
  });

  it('returns an empty shape for an empty payload', () => {
    expect(toPermissionData()).toEqual({ roleList: {}, permissionList: [] });
  });
});
