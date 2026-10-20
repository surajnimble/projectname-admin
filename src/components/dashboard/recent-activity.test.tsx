import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { toActivityLogList } from '@/types/activity';
import { RecentActivity } from './recent-activity';

const createdAt = '2026-10-21T10:00:00.000Z';

const renderItems = (itemList: unknown[]) => {
  const { container } = render(
    <RecentActivity
      items={toActivityLogList({ itemList }).itemList}
      isLoading={false}
      error=""
      hasMore={false}
      onRetry={vi.fn()}
      onViewAll={vi.fn()}
    />,
  );
  return container.textContent ?? '';
};

describe('RecentActivity', () => {
  it('renders a sign-in as a title with metadata', () => {
    const text = renderItems([
      {
        activityLogId: 'a1',
        action: 'LOGIN',
        entity: 'User',
        ip: '103.59.75.30',
        meta: { isNewDevice: true },
        createdAt,
        userData: { name: 'Super Admin' },
      },
    ]);

    expect(text).toContain('Sign-in from a new device');
    expect(text).toContain('Super Admin');
    expect(text).toContain('103.59.75.30');
    expect(text).not.toContain('signed in User');
  });

  it('names a user without profile data instead of the system', () => {
    const text = renderItems([
      {
        activityLogId: 'a2',
        action: 'LOGOUT',
        entity: 'User',
        entityId: 'u1',
        createdAt,
        userData: {},
      },
    ]);

    expect(text).toContain('Signed out');
    expect(text).toContain('A user');
    expect(text).not.toContain('System');
  });

  it('renders an order with its number and detail', () => {
    const text = renderItems([
      {
        activityLogId: 'a3',
        action: 'ORDER_PLACED',
        entity: 'Order',
        meta: { orderNumber: 'ORD-1', total: 2480, vendors: ['v1', 'v2'] },
        createdAt,
        userData: { name: 'Rahul' },
      },
    ]);

    expect(text).toContain('Order #ORD-1 placed');
    expect(text).toContain('2 vendors');
    expect(text).toContain('2,480');
  });

  it('humanizes actions without a dedicated format', () => {
    const text = renderItems([
      {
        activityLogId: 'a4',
        action: 'ORDER_NOTE_ADDED',
        entity: 'Order',
        createdAt,
        userData: { name: 'Rahul' },
      },
    ]);

    expect(text).toContain('Order note added');
    expect(text).toContain('Rahul');
    expect(text).not.toContain('_');
  });
});
