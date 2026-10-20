import { useCallback, useEffect, useState } from 'react';
import { DASHBOARD_WIDGET_LIMIT } from '@/constants';
import type { BaseResponse, PaymentListData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toPaymentList } from '@/types/payment';

const QUERY = { page: 1, limit: DASHBOARD_WIDGET_LIMIT } as const;

export function useRecentPayments() {
  const [data, setData] = useState<PaymentListData>(toPaymentList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((response: BaseResponse<PaymentListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getPayments(QUERY).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getPayments(QUERY));
  }, [apply]);

  return { data, isLoading, error, refresh };
}
