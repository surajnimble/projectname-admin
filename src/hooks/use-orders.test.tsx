import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ORDER_PAGE_SIZE, ORDER_STATUSES } from '@/constants';
import { toOrderList } from '@/types/order';
import { resetOrdersCache, useOrders } from './use-orders';

const getOrders = vi.fn();
const updateOrderStatus = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getOrders: (query: unknown) => getOrders(query),
    updateOrderStatus: (id: string, body: unknown) => updateOrderStatus(id, body),
  },
}));

const list = toOrderList({
  totalRecord: 1,
  totalPage: 1,
  currentPage: 1,
  limit: ORDER_PAGE_SIZE,
  itemList: [{ orderId: 'o1', orderNumber: 'ORD-1', status: 'PENDING' }],
});

describe('useOrders', () => {
  beforeEach(() => {
    resetOrdersCache();
    getOrders.mockReset();
    updateOrderStatus.mockReset();
  });

  it('loads orders without a status filter', async () => {
    getOrders.mockResolvedValue({ status: true, message: '', data: list });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(getOrders).toHaveBeenCalledWith({ page: 1, limit: ORDER_PAGE_SIZE });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('reports the error when loading fails', async () => {
    getOrders.mockResolvedValue({ status: false, message: 'Server error', data: toOrderList() });

    const { result } = renderHook(() => useOrders());

    await waitFor(() => expect(result.current.error).toBe('Server error'));
  });

  it('refetches from page 1 when the status filter changes', async () => {
    getOrders.mockResolvedValue({ status: true, message: '', data: list });
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatus(ORDER_STATUSES.shipped));

    await waitFor(() =>
      expect(getOrders).toHaveBeenLastCalledWith({
        page: 1,
        limit: ORDER_PAGE_SIZE,
        status: ORDER_STATUSES.shipped,
      }),
    );
  });

  it('keeps the dialog error when a status update fails', async () => {
    getOrders.mockResolvedValue({ status: true, message: '', data: list });
    updateOrderStatus.mockResolvedValue({ status: false, message: 'Invalid transition', data: {} });
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    let done = true;
    await act(async () => {
      done = await result.current.updateStatus('o1', { status: 'DELIVERED' });
    });

    expect(done).toBe(false);
    expect(result.current.actionError).toBe('Invalid transition');
  });
});
