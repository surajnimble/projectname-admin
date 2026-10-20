import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { VENDOR_PAGE_SIZE, VENDOR_STATUSES } from '@/constants';
import { toVendorList } from '@/types/vendor';
import { useVendors } from './use-vendors';

const getVendors = vi.fn();
const approveVendor = vi.fn();
const rejectVendor = vi.fn();
const suspendVendor = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendors: (query: unknown) => getVendors(query),
    approveVendor: (id: string, body: unknown) => approveVendor(id, body),
    rejectVendor: (id: string, body: unknown) => rejectVendor(id, body),
    suspendVendor: (id: string, body: unknown) => suspendVendor(id, body),
  },
}));

const list = toVendorList({
  totalRecord: 1,
  totalPage: 1,
  currentPage: 1,
  limit: VENDOR_PAGE_SIZE,
  vendorList: [{ vendorId: 'v1', shopName: 'Demo Shop', status: 'PENDING' }],
});

describe('useVendors', () => {
  beforeEach(() => {
    getVendors.mockReset();
    approveVendor.mockReset();
    rejectVendor.mockReset();
    suspendVendor.mockReset();
  });

  it('loads every vendor without a status filter', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useVendors());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getVendors).toHaveBeenCalledWith({ page: 1, limit: VENDOR_PAGE_SIZE });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('sends the status filter and resets to the first page', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    const { result } = renderHook(() => useVendors());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.setStatus(VENDOR_STATUSES.pending);

    await waitFor(() =>
      expect(getVendors).toHaveBeenCalledWith({
        page: 1,
        limit: VENDOR_PAGE_SIZE,
        status: 'PENDING',
      }),
    );
  });

  it('shows the API message when the list call fails', async () => {
    getVendors.mockResolvedValue({
      status: false,
      message: 'Forbidden.',
      data: toVendorList(),
    });
    const { result } = renderHook(() => useVendors());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Forbidden.');
  });

  it('reports a failed action and keeps the panel open', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    rejectVendor.mockResolvedValue({ status: false, message: 'Not allowed.', data: {} });
    const { result } = renderHook(() => useVendors());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('reject', 'v1', { reason: 'nope' });

    expect(done).toBe(false);
    await waitFor(() => expect(result.current.actionError).toBe('Not allowed.'));
  });

  it('refreshes the list after a successful action', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    approveVendor.mockResolvedValue({ status: true, message: 'ok', data: {} });
    const { result } = renderHook(() => useVendors());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('approve', 'v1', { commissionRate: 10 });

    expect(done).toBe(true);
    expect(approveVendor).toHaveBeenCalledWith('v1', { commissionRate: 10, remark: undefined });
    expect(getVendors).toHaveBeenCalledTimes(2);
  });

  it('reactivates a suspended vendor and keeps its commission', async () => {
    getVendors.mockResolvedValue({ status: true, message: 'ok', data: list });
    approveVendor.mockResolvedValue({ status: true, message: 'ok', data: {} });
    const { result } = renderHook(() => useVendors());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('reactivate', 'v1', { commissionRate: 12 });

    expect(done).toBe(true);
    expect(approveVendor).toHaveBeenCalledWith('v1', { commissionRate: 12 });
  });
});
