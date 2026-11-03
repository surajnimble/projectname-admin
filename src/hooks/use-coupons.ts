import { useCallback, useEffect, useMemo, useState } from 'react';
import { COUPON_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, CouponListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toCouponList } from '@/types/coupon';

interface CouponsQuery {
  page: number;
  search: string;
}

interface CouponsCacheEntry {
  data: CouponListData;
  query: CouponsQuery;
}

let cache: CouponsCacheEntry | null = null;

export const resetCouponsCache = () => {
  cache = null;
};

const isSameQuery = (a: CouponsQuery, b: CouponsQuery) =>
  a.page === b.page && a.search === b.search;

export function useCoupons() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [data, setData] = useState<CouponListData>(initial?.data ?? toCouponList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const query: CouponsQuery = useMemo(() => ({ page, search: debouncedSearch }), [
    debouncedSearch,
    page,
  ]);

  const apply = useCallback(
    (response: BaseResponse<CouponListData>, next: CouponsQuery) => {
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
    void apiService.getCoupons({
      page: query.page,
      limit: COUPON_PAGE_SIZE,
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
    apply(await apiService.getCoupons({
      page: query.page,
      limit: COUPON_PAGE_SIZE,
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

  const createCoupon = useCallback(
    async (body: { code: string; title: string; description?: string; type?: string; value?: number; minOrderValue?: number; maxDiscount?: number; usageLimit?: number; startsAt?: string; expiresAt?: string }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.createCoupon(body);
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

  const updateCoupon = useCallback(
    async (id: string, body: Partial<{ code: string; title: string; description?: string; type?: string; value?: number; minOrderValue?: number; maxDiscount?: number; usageLimit?: number; startsAt?: string; expiresAt?: string }>) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateCoupon(id, body);
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

  const deleteCoupon = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.deleteCoupon(id);
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

  const toggleCouponStatus = useCallback(
    async (id: string, isActive: boolean) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.toggleCoupon(id, {
        isActive: (!isActive).toString() as 'true' | 'false',
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
    setPage: changePage,
    setSearch,
    refresh,
    createCoupon,
    updateCoupon,
    deleteCoupon,
    toggleCouponStatus,
    clearActionError: () => setActionError(''),
  };
}
