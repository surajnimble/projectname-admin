'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { ORDER_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, OrderReviewListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toOrderReviewList } from '@/types/order';

interface ReviewQuery {
  page: number;
  search: string;
  from: string;
  to: string;
}

interface ReviewCacheEntry {
  data: OrderReviewListData;
  query: ReviewQuery;
}

let cache: ReviewCacheEntry | null = null;

export const resetOrderReviewsCache = () => {
  cache = null;
};

const isSameQuery = (a: ReviewQuery, b: ReviewQuery) =>
  a.page === b.page && a.search === b.search && a.from === b.from && a.to === b.to;

const toRequest = (query: ReviewQuery) => ({
  page: query.page,
  limit: ORDER_PAGE_SIZE,
  ...(query.search ? { search: query.search } : {}),
  ...(query.from ? { from: query.from } : {}),
  ...(query.to ? { to: query.to } : {}),
});

export function useOrderReviews() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<OrderReviewListData>(initial?.data ?? toOrderReviewList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [from, setFromState] = useState(initial?.query.from ?? '');
  const [to, setToState] = useState(initial?.query.to ?? '');
  const debouncedSearch = useDebouncedValue(search);

  const query: ReviewQuery = useMemo(
    () => ({ page, search: debouncedSearch, from, to }),
    [page, debouncedSearch, from, to],
  );

  const apply = useCallback((response: BaseResponse<OrderReviewListData>, next: ReviewQuery) => {
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
    void apiService.getPendingAdminReview(toRequest(query)).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.orderReviews) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getPendingAdminReview(toRequest(query)), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setDateRange = useCallback((fromValue: string, toValue: string) => {
    setFromState(fromValue);
    setToState(toValue);
    setPage(1);
  }, []);

  const confirmForVendor = useCallback(
    async (subOrderId: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.confirmForVendor(subOrderId, {});
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

  const rejectByAdmin = useCallback(
    async (subOrderId: string, reason: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.rejectByAdmin(subOrderId, { reason });
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

  const setPageFrom = useCallback((value: number) => setPage(value), []);

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    from,
    to,
    setPage: setPageFrom,
    setSearch,
    setDateRange,
    refresh,
    confirmForVendor,
    rejectByAdmin,
    clearActionError: () => setActionError(''),
  };
}
