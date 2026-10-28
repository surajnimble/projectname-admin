import { useCallback, useEffect, useMemo, useState } from 'react';
import { SUB_ADMIN_PAGE_SIZE } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type {
  BaseResponse,
  PermissionData,
  SubAdminListData,
} from '@/lib/api/contract';
import { toSubAdminList } from '@/types/auth';

interface SubAdminsQuery {
  page: number;
  search: string;
  isActive?: string;
}

interface SubAdminsCacheEntry {
  data: SubAdminListData;
  query: SubAdminsQuery;
}

let cache: SubAdminsCacheEntry | null = null;

export const resetSubAdminsCache = () => {
  cache = null;
};

const isSameQuery = (a: SubAdminsQuery, b: SubAdminsQuery) =>
  a.page === b.page && a.search === b.search;

export function useSubAdmins() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [isActive, setIsActiveState] = useState(initial?.query.isActive ?? '');
  const [data, setData] = useState<SubAdminListData>(initial?.data ?? toSubAdminList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const query: SubAdminsQuery = useMemo(
    () => ({ page, search: debouncedSearch, ...(isActive ? { isActive } : {}) }),
    [debouncedSearch, page, isActive],
  );

  const apply = useCallback((response: BaseResponse<SubAdminListData>, next: SubAdminsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
    setIsFetching(false);
  }, []);

  const load = useCallback(
    (next: SubAdminsQuery) =>
      apiService.getAllSubAdmins({
        page: next.page,
        limit: SUB_ADMIN_PAGE_SIZE,
        ...(next.search ? { search: next.search } : {}),
        ...(next.isActive ? { isActive: next.isActive } : {}),
      }),
    [],
  );

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void load(query).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, load, query]);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    apply(await load(query), query);
  }, [apply, load, query]);

  const changePage = useCallback((next: number) => {
    setIsFetching(true);
    setPage(next);
  }, []);

  const setSearch = useCallback((next: string) => {
    setIsFetching(true);
    setSearchState(next);
    setPage(1);
  }, []);

  const setIsActive = useCallback((next: string) => {
    setIsFetching(true);
    setIsActiveState(next);
    setPage(1);
  }, []);

  const createSubAdmin = useCallback(
    async (values: {
      name: string;
      email: string;
      phone: string;
      password: string;
      permissions?: string[];
    }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.createSubAdmin(values);
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

  const updateSubAdmin = useCallback(
    async (id: string, values: { name: string; phone: string; email: string }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateSubAdmin(id, values);
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

  const deleteSubAdmin = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.deleteSubAdmin(id);
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

  const toggleSubAdminStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.toggleSubAdminStatus(id, !isActive);
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

  const getPermissions = useCallback(async (): Promise<PermissionData> => {
    setIsFetching(true);
    const response = await apiService.getPermissions();
    setIsFetching(false);
    if (!response.status) {
      setError(response.message);
      return { roleList: {} };
    }
    return response.data;
  }, []);

  const updatePermissions = useCallback(
    async (id: string, permissions: string[]) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updatePermissions(id, { permissions });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      return true;
    },
    [],
  );

  return {
    data,
    isLoading,
    isFetching,
    error,
    actionError,
    isActioning,
    page,
    search,
    isActive,
    setPage: changePage,
    setSearch,
    setIsActive,
    refresh,
    createSubAdmin,
    updateSubAdmin,
    deleteSubAdmin,
    toggleSubAdminStatus,
    getPermissions,
    updatePermissions,
  };
}
