import { describe, expect, it } from 'vitest';
import { describeActivity } from '@/lib/utils/activity';
import { toActivityLog } from '@/types/activity';

type ActivityInput = Parameters<typeof toActivityLog>[0];

const make = (overrides: ActivityInput) =>
  toActivityLog({
    activityLogId: 'a1',
    action: 'LOGIN',
    entity: 'User',
    createdAt: '2026-10-21T10:00:00.000Z',
    ...overrides,
  });

describe('describeActivity', () => {
  it('describes a new user registration', () => {
    const result = describeActivity(
      make({
        action: 'REGISTER',
        meta: { type: 'CUSTOMER' },
        userData: { name: 'Priya Raman' },
      }),
    );

    expect(result.title).toBe('New user registered');
    expect(result.facts).toEqual(['Priya Raman', 'Customer']);
  });

  it('highlights a sign-in from a new device', () => {
    const result = describeActivity(
      make({
        action: 'LOGIN',
        meta: { isNewDevice: true },
        ip: '103.59.75.30',
        userData: { name: 'Super Admin' },
      }),
    );

    expect(result.title).toBe('Sign-in from a new device');
    expect(result.facts).toEqual(['Super Admin', '103.59.75.30']);
  });

  it('falls back to a user label for a logout without profile data', () => {
    const result = describeActivity(
      make({
        action: 'LOGOUT',
        userData: {},
      }),
    );

    expect(result.title).toBe('Signed out');
    expect(result.facts).toEqual(['A user']);
  });

  it('includes the order number, total and vendor count', () => {
    const result = describeActivity(
      make({
        action: 'ORDER_PLACED',
        entity: 'Order',
        meta: { orderNumber: 'ORD-1', total: 2480, vendors: ['v1', 'v2'] },
      }),
    );

    expect(result.title).toBe('Order #ORD-1 placed');
    expect(result.facts.join(' ')).toContain('2,480');
    expect(result.facts).toContain('2 vendors');
  });

  it('puts the payment amount in the title', () => {
    const result = describeActivity(
      make({
        action: 'PAYMENT_CONFIRMED',
        entity: 'Payment',
        meta: { amount: 2480 },
        userData: { name: 'Admin' },
      }),
    );

    expect(result.title).toContain('Payment of');
    expect(result.title).toContain('2,480');
    expect(result.facts).toEqual(['Admin']);
  });

  it('humanizes an action without a dedicated format', () => {
    const result = describeActivity(
      make({
        action: 'ORDER_NOTE_ADDED',
        entity: 'Order',
        meta: { orderNumber: 'ORD-9' },
        userData: { name: 'Rahul' },
      }),
    );

    expect(result.title).toBe('Order note added');
    expect(result.facts).toEqual(['Rahul', '#ORD-9']);
  });

  it('uses the entity for generic actions', () => {
    const result = describeActivity(
      make({
        action: 'UPDATE',
        entity: 'VendorProfile',
        userData: { name: 'Admin' },
      }),
    );

    expect(result.title).toBe('Vendor profile updated');
    expect(result.facts).toEqual(['Admin']);
  });
});
