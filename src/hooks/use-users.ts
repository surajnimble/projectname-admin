import { useCallback, useEffect, useMemo, useState } from 'react';
import { CUSTOMER_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, UserListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toUserList } from '@/types/user';

interface UsersQuery {
  page: number;
  search: string;
  role: string;
  status: string;
}

interface UsersCacheEntry {
  data: UserListData;
  query: UsersQuery;
}

let cache: UsersCacheEntry | null = null;

export const resetUsersCache = () => {
  cache = null;
};

const isSameQuery = (a: UsersQuery, b: UsersQuery) =>
  a.page === b.page && a.search === b.search && a.role === b.role && a.status === b.status;

export function useUsers() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<UserListData>(initial?.data ?? toUserList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [role, setRoleState] = useState(initial?.query.role ?? '');
  const [status, setStatusState] = useState(initial?.query.status ?? '');
  const debouncedSearch = useDebouncedValue(search);

  const query: UsersQuery = useMemo(
    () => ({ page, search: debouncedSearch, role, status }),
    [page, debouncedSearch, role, status],
  );

  const apply = useCallback((response: BaseResponse<UserListData>, next: UsersQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);

  const toRequest = (next: UsersQuery) => ({
    page: next.page,
    limit: CUSTOMER_PAGE_SIZE,
    ...(next.search ? { search: next.search } : {}),
    ...(next.role ? { role: next.role } : {}),
    ...(next.status ? { status: next.status } : {}),
  });

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getUsers(toRequest(query)).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.customers) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getUsers(toRequest(query)), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setRole = useCallback((value: string) => {
    setRoleState(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: string) => {
    setStatusState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const toggleStatus = useCallback(
    async (userId: string, isActive: boolean, reason?: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.toggleUserStatus(userId, {
        isActive,
        ...(reason ? { reason } : {}),
      });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  const ban = useCallback(
    async (userId: string, reason: string, durationDays?: number) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.banCustomer(userId, {
        reason,
        ...(durationDays ? { durationDays } : {}),
      });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  const unban = useCallback(async (userId: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.unbanCustomer(userId);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    role,
    status,
    setPage: changePage,
    setSearch,
    setRole,
    setStatus,
    refresh,
    toggleStatus,
    ban,
    unban,
    clearActionError: () => setActionError(''),
  };
}
