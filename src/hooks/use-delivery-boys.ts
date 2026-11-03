import { useCallback, useEffect, useMemo, useState } from 'react';
import { DELIVERY_BOY_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, DeliveryBoyListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toDeliveryBoyList } from '@/types/delivery-boy';

interface DeliveryBoysQuery {
  page: number;
  status: string;
  search: string;
}

interface DeliveryBoysCacheEntry {
  data: DeliveryBoyListData;
  query: DeliveryBoysQuery;
}

let cache: DeliveryBoysCacheEntry | null = null;

export const resetDeliveryBoysCache = () => {
  cache = null;
};

const isSameQuery = (a: DeliveryBoysQuery, b: DeliveryBoysQuery) =>
  a.page === b.page && a.status === b.status && a.search === b.search;

export function useDeliveryBoys() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [status, setStatusState] = useState(initial?.query.status ?? 'all');
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [data, setData] = useState<DeliveryBoyListData>(initial?.data ?? toDeliveryBoyList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const query: DeliveryBoysQuery = useMemo(
    () => ({ page, status, search: debouncedSearch }),
    [debouncedSearch, page, status],
  );

  const apply = useCallback((response: BaseResponse<DeliveryBoyListData>, next: DeliveryBoysQuery) => {
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
    void apiService.getDeliveryBoys({
      page: query.page,
      limit: DELIVERY_BOY_PAGE_SIZE,
      ...(query.status !== 'all' ? { status: query.status } : {}),
      ...(query.search ? { search: query.search } : {}),
    }).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(() => {
    return onScopeDropped((scope) => {
      if (scope === ROUTES.deliveryBoys) cache = null;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getDeliveryBoys({
      page: query.page,
      limit: DELIVERY_BOY_PAGE_SIZE,
      ...(query.status !== 'all' ? { status: query.status } : {}),
      ...(query.search ? { search: query.search } : {}),
    }), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setStatus = useCallback((value: string) => {
    setStatusState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const createDeliveryBoy = useCallback(
    async (body: { name: string; phone: string; email?: string; maxOrders?: number }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.createDeliveryBoy(body);
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

  const updateDeliveryBoy = useCallback(
    async (id: string, body: { name?: string; phone?: string; email?: string; maxOrders?: number }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateDeliveryBoy(id, body);
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

  const deleteDeliveryBoy = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.deleteDeliveryBoy(id);
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

  const toggleDeliveryBoyStatus = useCallback(
    async (id: string, currentIsActive: boolean) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.toggleDeliveryBoyStatus(id, {
        isActive: (!currentIsActive).toString() as 'true' | 'false',
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
    setPage: changePage,
    setSearch,
    setStatus,
    refresh,
    createDeliveryBoy,
    updateDeliveryBoy,
    deleteDeliveryBoy,
    toggleDeliveryBoyStatus,
    clearActionError: () => setActionError(''),
  };
}
