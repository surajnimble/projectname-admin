import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DASHBOARD_WIDGET_LIMIT, ORDER_PLACED_ACTION } from '@/constants';
import { toActivityLogList } from '@/types/activity';
import { useRecentOrders } from './use-recent-orders';

const getActivityLogs = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: { getActivityLogs: (query: unknown) => getActivityLogs(query) },
}));

const list = toActivityLogList({
  totalRecord: 1,
  currentPage: 1,
  limit: DASHBOARD_WIDGET_LIMIT,
  itemList: [
    {
      activityLogId: 'a1',
      action: ORDER_PLACED_ACTION,
      entity: 'Order',
      createdAt: '2026-10-21T10:00:00.000Z',
      userData: { userId: 'u1', name: 'Rahul' },
    },
  ],
});

describe('useRecentOrders', () => {
  beforeEach(() => getActivityLogs.mockReset());

  it('loads the latest order placements', async () => {
    getActivityLogs.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useRecentOrders());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getActivityLogs).toHaveBeenCalledWith({
      page: 1,
      limit: DASHBOARD_WIDGET_LIMIT,
      action: ORDER_PLACED_ACTION,
    });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('shows the API message when the call fails', async () => {
    getActivityLogs.mockResolvedValue({
      status: false,
      message: 'Forbidden.',
      data: toActivityLogList(),
    });
    const { result } = renderHook(() => useRecentOrders());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Forbidden.');
  });
});
