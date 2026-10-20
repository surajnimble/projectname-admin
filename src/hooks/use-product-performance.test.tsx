import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DASHBOARD_WIDGET_LIMIT, PRODUCT_PERFORMANCE_DAYS } from '@/constants';
import { toProductPerformanceList } from '@/types/analytics';
import { useProductPerformance } from './use-product-performance';

const getProductPerformance = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: { getProductPerformance: (query: unknown) => getProductPerformance(query) },
}));

const list = toProductPerformanceList({
  totalRecord: 1,
  currentPage: 1,
  limit: DASHBOARD_WIDGET_LIMIT,
  productList: [{ productId: 'p1', name: 'Demo', qty: 2, revenue: 100 }],
});

describe('useProductPerformance', () => {
  beforeEach(() => getProductPerformance.mockReset());

  it('loads the requested performance sort', async () => {
    getProductPerformance.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useProductPerformance('revenue'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getProductPerformance).toHaveBeenCalledWith({
      page: 1,
      limit: DASHBOARD_WIDGET_LIMIT,
      sort: 'revenue',
      days: PRODUCT_PERFORMANCE_DAYS,
    });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('refreshes the current sort', async () => {
    getProductPerformance.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useProductPerformance('qty'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.refresh();
    });

    expect(getProductPerformance).toHaveBeenCalledTimes(2);
    expect(getProductPerformance).toHaveBeenLastCalledWith({
      page: 1,
      limit: DASHBOARD_WIDGET_LIMIT,
      sort: 'qty',
      days: PRODUCT_PERFORMANCE_DAYS,
    });
  });
});
