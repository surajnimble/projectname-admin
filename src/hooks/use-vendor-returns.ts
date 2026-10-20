import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ReturnListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toReturnList } from '@/types/return';

interface ReturnsQuery {
  vendorId: string;
  page: number;
}

interface ReturnsCacheEntry {
  data: ReturnListData;
  query: ReturnsQuery;
}

// Returns of a vendor are kept between visits so the details page does not refetch them.
const cache = new Map<string, ReturnsCacheEntry>();

export const resetVendorReturnsCache = () => cache.clear();

const isSameQuery = (a: ReturnsQuery, b: ReturnsQuery) =>
  a.vendorId === b.vendorId && a.page === b.page;

export function useVendorReturns(vendorId: string) {
  const [initial] = useState(() => cache.get(vendorId));
  const [data, setData] = useState<ReturnListData>(initial?.data ?? toReturnList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);

  const query: ReturnsQuery = useMemo(() => ({ vendorId, page }), [page, vendorId]);

  const apply = useCallback((response: BaseResponse<ReturnListData>, next: ReturnsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
    cache.set(next.vendorId, {
      data: response.status ? response.data : toReturnList(),
      query: next,
    });
  }, []);

  useEffect(() => {
    const entry = cache.get(vendorId);
    if (entry && isSameQuery(entry.query, query)) return;
    let active = true;
    void apiService.getReturns({ page: query.page, limit: 5, vendorId: query.vendorId }).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query, vendorId]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.vendorDetails(vendorId)) cache.delete(vendorId);
      }),
    [vendorId],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getReturns({ page: query.page, limit: 5, vendorId: query.vendorId }), query);
  }, [apply, query]);

  const runAction = useCallback(
    async (action: 'approve' | 'reject', returnId: string, reason?: string) => {
      setIsActioning(true);
      setActionError('');
      const response =
        action === 'approve'
          ? await apiService.approveReturn(returnId)
          : await apiService.rejectReturn(returnId, { reason: reason ?? '' });
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
    setPage,
    refresh,
    runAction,
  };
}
