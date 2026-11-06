import { describe, expect, it } from 'vitest';
import { toUserDetail, toUserImpersonation } from './user';

describe('user response mappers', () => {
  it('keeps suspension state separate from an active customer ban', () => {
    const result = toUserDetail({
      userData: { userId: 'u1', isActive: false },
      banData: { isActive: true, reason: 'Policy violation', expiresAt: '2026-11-06T00:00:00.000Z' },
    });

    expect(result.userData.isActive).toBe(false);
    expect(result.banData).toMatchObject({ isActive: true, reason: 'Policy violation' });
  });

  it('maps the short-lived impersonation response without dropping token metadata', () => {
    const result = toUserImpersonation({
      accessToken: 'short-lived-token', expiresIn: 1800,
      expiresAt: '2026-11-05T13:30:00.000Z', isImpersonating: true,
      userData: { userId: 'u2', name: 'Customer', email: 'customer@example.test', role: 'CUSTOMER' },
    });

    expect(result).toMatchObject({
      accessToken: 'short-lived-token', expiresIn: 1800,
      isImpersonating: true, userData: { userId: 'u2', role: 'CUSTOMER' },
    });
  });
});
