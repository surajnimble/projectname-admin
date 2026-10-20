import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROUTES } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, PaymentListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toPaymentList } from '@/types/payment';

interface PaymentsQuery {
  page: number;
  search: string;
}

interface PaymentsCacheEntry {
  data: PaymentListData;
  query: PaymentsQuery;
}

// The payment list is kept between visits so returning to the page does not refetch it.
const cache = new Map<string, PaymentsCacheEntry>();

export const resetPaymentsCache = () => cache.clear();

const isSameQuery = (a: PaymentsQuery, b: PaymentsQuery) =>
  a.page === b.page && a.search === b.search;

export function usePayments() {
  const [initial] = useState(() => cache.get('payments'));
  const [data, setData] = useState<PaymentListData>(initial?.data ?? toPaymentList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearch] = useState(initial?.query.search ?? '');

  const query: PaymentsQuery = useMemo(() => ({ page, search }), [page, search]);

  const apply = useCallback((response: BaseResponse<PaymentListData>, next: PaymentsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
    cache.set('payments', { data: response.status ? response.data : toPaymentList(), query: next });
  }, []);

  useEffect(() => {
    const entry = cache.get('payments');
    if (entry && isSameQuery(entry.query, query)) return;
    let active = true;
    void apiService.getPayments({ page: query.page, limit: 10 }).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.payments) cache.delete('payments');
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getPayments({ page: query.page, limit: 10 }), query);
  }, [apply, query]);

  const runAction = useCallback(
    async (
      action: 'confirm' | 'refund',
      paymentId: string,
      values: { orderId?: string; amount?: number; reason?: string; mode?: string } = {},
    ) => {
      setIsActioning(true);
      setActionError('');
      const response =
        action === 'confirm'
          ? await apiService.confirmPayment(paymentId)
          : await apiService.refundPayment(paymentId, {
              orderId: values.orderId ?? '',
              amount: values.amount,
              reason: values.reason ?? '',
              mode: values.mode,
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
    setPage,
    setSearch,
    refresh,
    runAction,
  };
}
