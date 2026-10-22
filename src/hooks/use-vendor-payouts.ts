import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { PayoutListData, PayoutStatementData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toPayoutList, toPayoutStatement } from '@/types/payout';

interface PayoutsQuery {
  vendorId: string;
  page: number;
}

interface PayoutsCacheEntry {
  data: PayoutListData;
  statement: PayoutStatementData;
  query: PayoutsQuery;
}

// Payouts of a vendor are kept between visits so the details page does not refetch them.
const cache = new Map<string, PayoutsCacheEntry>();

export const resetVendorPayoutsCache = () => cache.clear();

const isSameQuery = (a: PayoutsQuery, b: PayoutsQuery) =>
  a.vendorId === b.vendorId && a.page === b.page;

export function useVendorPayouts(vendorId: string) {
  const [initial] = useState(() => cache.get(vendorId));
  const [data, setData] = useState<PayoutListData>(initial?.data ?? toPayoutList());
  const [statement, setStatement] = useState<PayoutStatementData>(
    initial?.statement ?? toPayoutStatement(),
  );
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);

  const query: PayoutsQuery = useMemo(() => ({ vendorId, page }), [page, vendorId]);

  const load = useCallback(
    async (next: PayoutsQuery, showLoading: boolean) => {
      if (showLoading) setIsLoading(true);
      const [listResponse, statementResponse] = await Promise.all([
        apiService.getPayouts({ page: next.page, limit: 5, vendorId: next.vendorId }),
        apiService.getPayoutStatement(next.vendorId),
      ]);

      setError(listResponse.status ? '' : listResponse.message);
      if (listResponse.status) setData(listResponse.data);
      if (statementResponse.status) setStatement(statementResponse.data);
      setIsLoading(false);

      cache.set(next.vendorId, {
        data: listResponse.status ? listResponse.data : toPayoutList(),
        statement: statementResponse.status ? statementResponse.data : toPayoutStatement(),
        query: next,
      });
    },
    [],
  );

  useEffect(() => {
    const entry = cache.get(vendorId);
    if (entry && isSameQuery(entry.query, query)) return;
    let active = true;
    void Promise.all([
      apiService.getPayouts({ page: query.page, limit: 5, vendorId: query.vendorId }),
      apiService.getPayoutStatement(query.vendorId),
    ]).then(([listResponse, statementResponse]) => {
      if (!active) return;
      setError(listResponse.status ? '' : listResponse.message);
      if (listResponse.status) setData(listResponse.data);
      if (statementResponse.status) setStatement(statementResponse.data);
      setIsLoading(false);
      cache.set(query.vendorId, {
        data: listResponse.status ? listResponse.data : toPayoutList(),
        statement: statementResponse.status ? statementResponse.data : toPayoutStatement(),
        query,
      });
    });
    return () => {
      active = false;
    };
  }, [query, vendorId]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.vendorDetails(vendorId)) cache.delete(vendorId);
      }),
    [vendorId],
  );

  const refresh = useCallback(async () => {
    await load(query, true);
  }, [load, query]);

  const runAction = useCallback(
    async (action: 'approve' | 'reject', payoutId: string, rejectReason?: string) => {
      setIsActioning(true);
      setActionError('');
      const response =
        action === 'approve'
          ? await apiService.approvePayout(payoutId, {})
          : await apiService.rejectPayout(payoutId, { rejectReason: rejectReason ?? '' });
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
    statement,
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
