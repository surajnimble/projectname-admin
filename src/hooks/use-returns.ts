import { useCallback, useEffect, useMemo, useState } from 'react';
import { RETURNS_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ReturnListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toReturnList } from '@/types/return';

interface ReturnsQuery {
  page: number;
  search: string;
  status: string;
  vendorId: string;
  orderId: string;
}

interface ReturnsCacheEntry {
  data: ReturnListData;
  query: ReturnsQuery;
}

let cache: ReturnsCacheEntry | null = null;

export const resetReturnsCache = () => {
  cache = null;
};

const isSameQuery = (a: ReturnsQuery, b: ReturnsQuery) =>
  a.page === b.page &&
  a.search === b.search &&
  a.status === b.status &&
  a.vendorId === b.vendorId &&
  a.orderId === b.orderId;

export function useReturns() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<ReturnListData>(initial?.data ?? toReturnList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [status, setStatusState] = useState(initial?.query.status ?? '');
  const [vendorId, setVendorIdState] = useState(initial?.query.vendorId ?? '');
  const [orderId, setOrderIdState] = useState(initial?.query.orderId ?? '');
  const debouncedSearch = useDebouncedValue(search);

  const query: ReturnsQuery = useMemo(
    () => ({ page, search: debouncedSearch, status, vendorId, orderId }),
    [page, debouncedSearch, status, vendorId, orderId],
  );

  const apply = useCallback((response: BaseResponse<ReturnListData>, next: ReturnsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);

  const toRequest = (next: ReturnsQuery) => ({
    page: next.page,
    limit: RETURNS_PAGE_SIZE,
    ...(next.search ? { search: next.search } : {}),
    ...(next.status ? { status: next.status } : {}),
    ...(next.vendorId ? { vendorId: next.vendorId } : {}),
    ...(next.orderId ? { orderId: next.orderId } : {}),
  });

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getReturns(toRequest(query)).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.returns) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getReturns(toRequest(query)), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: string) => {
    setStatusState(value);
    setPage(1);
  }, []);

  const setVendorId = useCallback((value: string) => {
    setVendorIdState(value);
    setPage(1);
  }, []);

  const setOrderId = useCallback((value: string) => {
    setOrderIdState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const approve = useCallback(async (returnId: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.approveReturn(returnId);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const reject = useCallback(
    async (returnId: string, reason: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.rejectReturn(returnId, { reason });
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

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    vendorId,
    orderId,
    setPage: changePage,
    setSearch,
    setStatus,
    setVendorId,
    setOrderId,
    refresh,
    approve,
    reject,
    clearActionError: () => setActionError(''),
  };
}
