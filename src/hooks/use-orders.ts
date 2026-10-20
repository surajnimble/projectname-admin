import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORDER_PAGE_SIZE, ORDER_STATUSES, ROUTES, type OrderStatusFilter } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, OrderListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toOrderList } from '@/types/order';

interface OrdersQuery {
  page: number;
  search: string;
  status: OrderStatusFilter;
}

interface OrdersCacheEntry {
  data: OrderListData;
  query: OrdersQuery;
}

let cache: OrdersCacheEntry | null = null;

export const resetOrdersCache = () => {
  cache = null;
};

const isSameQuery = (a: OrdersQuery, b: OrdersQuery) =>
  a.page === b.page && a.search === b.search && a.status === b.status;

const toRequest = (query: OrdersQuery) => ({
  page: query.page,
  limit: ORDER_PAGE_SIZE,
  ...(query.search ? { search: query.search } : {}),
  ...(query.status !== ORDER_STATUSES.all ? { status: query.status } : {}),
});

export function useOrders() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<OrderListData>(initial?.data ?? toOrderList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [status, setStatusState] = useState<OrderStatusFilter>(initial?.query.status ?? ORDER_STATUSES.all);
  const debouncedSearch = useDebouncedValue(search);

  const query: OrdersQuery = useMemo(
    () => ({ page, search: debouncedSearch, status }),
    [page, debouncedSearch, status],
  );

  const apply = useCallback((response: BaseResponse<OrderListData>, next: OrdersQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getOrders(toRequest(query)).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.orders) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getOrders(toRequest(query)), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: OrderStatusFilter) => {
    setStatusState(value);
    setPage(1);
  }, []);

  const updateStatus = useCallback(
    async (orderId: string, values: { status: string; remark?: string; location?: string }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateOrderStatus(orderId, {
        status: values.status,
        ...(values.remark ? { remark: values.remark } : {}),
        ...(values.location ? { location: values.location } : {}),
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

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    setPage,
    setSearch,
    setStatus,
    refresh,
    updateStatus,
    clearActionError: () => setActionError(''),
  };
}
