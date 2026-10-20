import { useCallback, useEffect, useState } from 'react';
import type { BaseResponse, LowStockListData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toLowStockList } from '@/types/report';

export function useLowStock() {
  const [data, setData] = useState<LowStockListData>(toLowStockList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((response: BaseResponse<LowStockListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getLowStockProducts().then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getLowStockProducts());
  }, [apply]);

  return { data, isLoading, error, refresh };
}
