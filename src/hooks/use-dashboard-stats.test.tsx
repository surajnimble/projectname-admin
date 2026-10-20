import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { DashboardStatsData } from '@/lib/api/contract';
import { toDashboardStats } from '@/types/dashboard';
import { useDashboardStats } from './use-dashboard-stats';

const getDashboardStats = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: { getDashboardStats: () => getDashboardStats() },
}));

const stats: DashboardStatsData = {
  totalUsers: 4,
  totalVendors: 1,
  pendingVendors: 0,
  totalProducts: 4,
  totalOrders: 0,
  revenue30d: 0,
  openTickets: 0,
  pendingReturns: 0,
  pendingRefunds: 0,
};

describe('useDashboardStats', () => {
  beforeEach(() => getDashboardStats.mockReset());

  it('loads the stats when the overview mounts', async () => {
    getDashboardStats.mockResolvedValue({ status: true, message: 'ok', data: stats });
    const { result } = renderHook(() => useDashboardStats());

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getDashboardStats).toHaveBeenCalledTimes(1);
    expect(result.current.data).toEqual(stats);
    expect(result.current.error).toBe('');
  });

  it('shows the API message when the call fails', async () => {
    getDashboardStats.mockResolvedValue({
      status: false,
      message: 'Dashboard stats failed.',
      data: toDashboardStats(),
    });
    const { result } = renderHook(() => useDashboardStats());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Dashboard stats failed.');
  });

  it('fetches again when refreshed', async () => {
    getDashboardStats.mockResolvedValue({ status: true, message: 'ok', data: stats });
    const { result } = renderHook(() => useDashboardStats());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(getDashboardStats).toHaveBeenCalledTimes(2);
  });

  it('fetches again when the overview is opened again', async () => {
    getDashboardStats.mockResolvedValue({ status: true, message: 'ok', data: stats });
    const first = renderHook(() => useDashboardStats());
    await waitFor(() => expect(first.result.current.isLoading).toBe(false));
    first.unmount();

    const second = renderHook(() => useDashboardStats());
    await waitFor(() => expect(second.result.current.isLoading).toBe(false));

    expect(getDashboardStats).toHaveBeenCalledTimes(2);
  });
});
