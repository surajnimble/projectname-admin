import { useCallback, useEffect, useState } from 'react';
import type { BaseResponse, LowStockListData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toLowStockList } from '@/types/report';

const LOAD_ERROR = 'Inventory could not be loaded. Please try again.';

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
    void apiService.getLowStockProducts()
      .then((response) => {
        if (active) apply(response);
      })
      .catch(() => {
        if (!active) return;
        setError(LOAD_ERROR);
        setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      apply(await apiService.getLowStockProducts());
    } catch {
      setError(LOAD_ERROR);
      setIsLoading(false);
    }
  }, [apply]);

  return { data, isLoading, error, refresh };
}
