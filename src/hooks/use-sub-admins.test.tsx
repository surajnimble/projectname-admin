import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SUB_ADMIN_PAGE_SIZE, SUB_ADMIN_STATUS } from '@/constants';
import { toSubAdminList } from '@/types/auth';
import { resetSubAdminsCache, useSubAdmins } from './use-sub-admins';

const getAllSubAdmins = vi.fn();
const getPermissions = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getAllSubAdmins: (query: unknown) => getAllSubAdmins(query),
    getPermissions: () => getPermissions(),
  },
}));

const list = toSubAdminList({
  totalRecord: 2,
  totalPage: 1,
  currentPage: 1,
  limit: SUB_ADMIN_PAGE_SIZE,
  itemList: [
    {
      userId: 'u1',
      name: 'Active Admin',
      email: 'active@demo.com',
      role: 'SUB_ADMIN',
      isActive: true,
    },
    {
      userId: 'u2',
      name: 'Inactive Admin',
      email: 'inactive@demo.com',
      role: 'SUB_ADMIN',
      isActive: false,
    },
  ],
});

describe('useSubAdmins', () => {
  beforeEach(() => {
    resetSubAdminsCache();
    getAllSubAdmins.mockReset();
    getPermissions.mockReset();
    getAllSubAdmins.mockResolvedValue({ status: true, message: 'ok', data: list });
  });

  it('loads every sub admin without a status filter by default', async () => {
    const { result } = renderHook(() => useSubAdmins());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.status).toBe(SUB_ADMIN_STATUS.all);
    expect(getAllSubAdmins).toHaveBeenCalledWith({
      page: 1,
      limit: SUB_ADMIN_PAGE_SIZE,
    });
    expect(result.current.data.itemList).toHaveLength(2);
  });

  it('refetches with the active filter instead of reusing the cached query', async () => {
    const { result } = renderHook(() => useSubAdmins());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatus(SUB_ADMIN_STATUS.active));

    await waitFor(() =>
      expect(getAllSubAdmins).toHaveBeenCalledWith({
        page: 1,
        limit: SUB_ADMIN_PAGE_SIZE,
        isActive: 'true',
      }),
    );
    expect(getAllSubAdmins).toHaveBeenCalledTimes(2);
  });

  it('refetches with the inactive filter and resets to the first page', async () => {
    const { result } = renderHook(() => useSubAdmins());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatus(SUB_ADMIN_STATUS.inactive));

    await waitFor(() =>
      expect(getAllSubAdmins).toHaveBeenCalledWith({
        page: 1,
        limit: SUB_ADMIN_PAGE_SIZE,
        isActive: 'false',
      }),
    );
  });

  it('drops the filter again when the status goes back to all', async () => {
    const { result } = renderHook(() => useSubAdmins());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    act(() => result.current.setStatus(SUB_ADMIN_STATUS.active));
    await waitFor(() => expect(getAllSubAdmins).toHaveBeenCalledTimes(2));

    act(() => result.current.setStatus(SUB_ADMIN_STATUS.all));

    await waitFor(() => expect(getAllSubAdmins).toHaveBeenCalledTimes(3));
    expect(getAllSubAdmins).toHaveBeenLastCalledWith({
      page: 1,
      limit: SUB_ADMIN_PAGE_SIZE,
    });
  });
});
