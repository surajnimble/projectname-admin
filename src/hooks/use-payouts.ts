import { useCallback, useEffect, useMemo, useState } from 'react';
import { PAYOUTS_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, PayoutListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toPayoutList } from '@/types/payout';

interface PayoutsQuery {
  page: number;
  search: string;
  status: string;
  vendorId: string;
  from: string;
  to: string;
}

interface PayoutsCacheEntry {
  data: PayoutListData;
  query: PayoutsQuery;
}

let cache: PayoutsCacheEntry | null = null;

export const resetPayoutsCache = () => {
  cache = null;
};

const isSameQuery = (a: PayoutsQuery, b: PayoutsQuery) =>
  a.page === b.page &&
  a.search === b.search &&
  a.status === b.status &&
  a.vendorId === b.vendorId &&
  a.from === b.from &&
  a.to === b.to;

export function usePayouts() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<PayoutListData>(initial?.data ?? toPayoutList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [status, setStatusState] = useState(initial?.query.status ?? '');
  const [vendorId, setVendorIdState] = useState(initial?.query.vendorId ?? '');
  const [from, setFromState] = useState(initial?.query.from ?? '');
  const [to, setToState] = useState(initial?.query.to ?? '');
  const debouncedSearch = useDebouncedValue(search);

  const query: PayoutsQuery = useMemo(
    () => ({ page, search: debouncedSearch, status, vendorId, from, to }),
    [page, debouncedSearch, status, vendorId, from, to],
  );

  const apply = useCallback((response: BaseResponse<PayoutListData>, next: PayoutsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);

  const toRequest = (next: PayoutsQuery) => ({
    page: next.page,
    limit: PAYOUTS_PAGE_SIZE,
    ...(next.search ? { search: next.search } : {}),
    ...(next.status ? { status: next.status } : {}),
    ...(next.vendorId ? { vendorId: next.vendorId } : {}),
    ...(next.from ? { from: next.from } : {}),
    ...(next.to ? { to: next.to } : {}),
  });

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getPayouts(toRequest(query)).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.payouts) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getPayouts(toRequest(query)), query);
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

  const setFrom = useCallback((value: string) => {
    setFromState(value);
    setPage(1);
  }, []);

  const setTo = useCallback((value: string) => {
    setToState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  const approve = useCallback(async (payoutId: string, reference?: string, notes?: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.approvePayout(payoutId, {
      ...(reference ? { reference } : {}),
      ...(notes ? { notes } : {}),
    });
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const reject = useCallback(
    async (payoutId: string, rejectReason: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.rejectPayout(payoutId, { rejectReason });
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

  const bulkApprove = useCallback(async (payoutIds: string[]) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.bulkApprovePayouts({ payoutIds });
    setIsActioning(false);
    if (!response.status) setActionError(response.message);
    else await refresh();
    return response;
  }, [refresh]);

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
    from,
    to,
    setPage: changePage,
    setSearch,
    setStatus,
    setVendorId,
    setFrom,
    setTo,
    refresh,
    approve,
    reject,
    bulkApprove,
    clearActionError: () => setActionError(''),
  };
}
