import { describe, expect, it } from 'vitest';
import { parseResponse } from './api';
import { toAuthData } from './auth';

describe('parseResponse', () => {
  it('parses success and maps result with defaults', () => {
    const json = JSON.stringify({
      status: true,
      message: 'Logged in successfully.',
      result: {
        accessToken: 'abc',
        userData: { userId: 'u1', email: 'a@b.com' },
        rolesList: ['SUPER_ADMIN'],
      },
    });
    const response = parseResponse(json, toAuthData);
    expect(response.status).toBe(true);
    expect(response.data.accessToken).toBe('abc');
    expect(response.data.userData.name).toBe('');
    expect(response.data.rolesList).toEqual(['SUPER_ADMIN']);
    expect(response.data.twoFactorRequired).toBe(false);
  });

  it('keeps the raw message, code suffix included', () => {
    const json = JSON.stringify({
      status: false,
      message: 'Invalid email or password. Error Code (INVALID_CREDENTIALS)',
      result: {},
    });
    const response = parseResponse(json, toAuthData);
    expect(response.status).toBe(false);
    expect(response.message).toBe('Invalid email or password. Error Code (INVALID_CREDENTIALS)');
  });

  it('passes the maintenance 503 through verbatim', () => {
    const json = JSON.stringify({
      status: false,
      message: "We'll be back soon. Error Code (MAINTENANCE)",
      result: {},
    });
    const response = parseResponse(json, toAuthData);
    expect(response.message).toBe("We'll be back soon. Error Code (MAINTENANCE)");
    expect(response.data).toMatchObject({ accessToken: '' });
  });

  it('returns a failed response with default data for invalid JSON', () => {
    const response = parseResponse('<html>', toAuthData);
    expect(response.status).toBe(false);
    expect(response.data.accessToken).toBe('');
  });
});

describe('toAuthData', () => {
  it('reads roles from userData or a single role field', () => {
    expect(toAuthData({ userData: { rolesList: ['SUB_ADMIN'] } }).rolesList).toEqual(['SUB_ADMIN']);
    expect(toAuthData({ role: 'SUB_ADMIN' }).rolesList).toEqual(['SUB_ADMIN']);
    expect(toAuthData({}).rolesList).toEqual([]);
  });

  it('reads the staff permission list and defaults it to empty', () => {
    expect(toAuthData({ permissionList: ['order:list', 7] as unknown as string[] }).permissionList).toEqual(['order:list']);
    expect(toAuthData({}).permissionList).toEqual([]);
  });

  it('maps a flat getMe payload to userData', () => {
    expect(toAuthData({ userId: 'u2', email: 'a@b.com' }).userData).toMatchObject({
      userId: 'u2',
      email: 'a@b.com',
    });
  });
});
