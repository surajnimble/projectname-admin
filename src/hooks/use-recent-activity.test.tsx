import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RECENT_ACTIVITY_LIMIT } from '@/constants';
import { toActivityLogList } from '@/types/activity';
import { useRecentActivity } from './use-recent-activity';

const getActivityLogs = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: { getActivityLogs: (query: unknown) => getActivityLogs(query) },
}));

const list = toActivityLogList({
  totalRecord: 1,
  totalPage: 1,
  currentPage: 1,
  limit: RECENT_ACTIVITY_LIMIT,
  itemList: [
    {
      activityLogId: 'a1',
      action: 'LOGIN',
      entity: 'Session',
      createdAt: '2026-10-21T10:00:00.000Z',
      userData: { userId: 'u1', name: 'Admin', email: 'admin@example.com' },
    },
  ],
});

describe('useRecentActivity', () => {
  beforeEach(() => getActivityLogs.mockReset());

  it('loads the latest activity when the overview mounts', async () => {
    getActivityLogs.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useRecentActivity());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getActivityLogs).toHaveBeenCalledWith({ page: 1, limit: RECENT_ACTIVITY_LIMIT });
    expect(result.current.data.itemList).toHaveLength(1);
    expect(result.current.error).toBe('');
  });

  it('shows the API message when the call fails', async () => {
    getActivityLogs.mockResolvedValue({
      status: false,
      message: 'Forbidden.',
      data: toActivityLogList(),
    });
    const { result } = renderHook(() => useRecentActivity());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Forbidden.');
  });

  it('fetches again when refreshed', async () => {
    getActivityLogs.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useRecentActivity());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(getActivityLogs).toHaveBeenCalledTimes(2);
  });
});
