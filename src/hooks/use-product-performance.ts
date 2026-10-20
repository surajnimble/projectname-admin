import { useCallback, useEffect, useState } from 'react';
import { DASHBOARD_WIDGET_LIMIT, PRODUCT_PERFORMANCE_DAYS } from '@/constants';
import type { BaseResponse, ProductPerformanceListData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toProductPerformanceList, type ProductPerformanceSort } from '@/types/analytics';

export function useProductPerformance(sort: ProductPerformanceSort) {
  const [data, setData] = useState<ProductPerformanceListData>(toProductPerformanceList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((response: BaseResponse<ProductPerformanceListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  const fetchPerformance = useCallback(
    () =>
      apiService.getProductPerformance({
        page: 1,
        limit: DASHBOARD_WIDGET_LIMIT,
        sort,
        days: PRODUCT_PERFORMANCE_DAYS,
      }),
    [sort],
  );

  useEffect(() => {
    let active = true;
    void fetchPerformance().then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply, fetchPerformance]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await fetchPerformance());
  }, [apply, fetchPerformance]);

  return { data, isLoading, error, refresh };
}
