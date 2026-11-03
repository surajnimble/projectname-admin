import { useCallback, useEffect, useMemo, useState } from 'react';
import { SHIPPING_ZONE_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ShippingZoneListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toShippingZoneList } from '@/types/shipping';

interface ShippingZonesQuery {
  page: number;
  search: string;
}

interface ShippingZonesCacheEntry {
  data: ShippingZoneListData;
  query: ShippingZonesQuery;
}

let cache: ShippingZonesCacheEntry | null = null;

export const resetShippingZonesCache = () => {
  cache = null;
};

const isSameQuery = (a: ShippingZonesQuery, b: ShippingZonesQuery) =>
  a.page === b.page && a.search === b.search;

export function useShippingZones() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [data, setData] = useState<ShippingZoneListData>(initial?.data ?? toShippingZoneList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const query: ShippingZonesQuery = useMemo(() => ({ page, search: debouncedSearch }), [
    debouncedSearch,
    page,
  ]);

  const apply = useCallback(
    (response: BaseResponse<ShippingZoneListData>, next: ShippingZonesQuery) => {
      setError(response.status ? '' : response.message);
      if (response.status) {
        setData(response.data);
        cache = { data: response.data, query: next };
      }
      setIsLoading(false);
    },
    [],
  );

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getShippingZones({
      page: query.page,
      limit: SHIPPING_ZONE_PAGE_SIZE,
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
      if (scope === ROUTES.coupons) cache = null;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getShippingZones({
      page: query.page,
      limit: SHIPPING_ZONE_PAGE_SIZE,
      ...(query.search ? { search: query.search } : {}),
    }), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const createShippingZone = useCallback(
    async (body: { name: string; description?: string; countries?: string[]; states?: string[]; cities?: string[]; pincodes?: string[] }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.createShippingZone(body);
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

  const updateShippingZone = useCallback(
    async (id: string, body: Partial<{ name: string; description?: string; countries?: string[]; states?: string[]; cities?: string[]; pincodes?: string[] }>) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateShippingZone(id, body);
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

  const deleteShippingZone = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.deleteShippingZone(id);
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

  const toggleShippingZoneStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.toggleShippingZone(id, { isActive: (!isActive).toString() as 'true' | 'false' });
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
    setPage: changePage,
    setSearch,
    refresh,
    createShippingZone,
    updateShippingZone,
    deleteShippingZone,
    toggleShippingZoneStatus,
    clearActionError: () => setActionError(''),
  };
}
