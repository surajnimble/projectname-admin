import { useCallback, useEffect, useState } from 'react';
import type { BaseResponse, DashboardStatsData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toDashboardStats } from '@/types/dashboard';

export function useDashboardStats() {
  const [data, setData] = useState<DashboardStatsData>(toDashboardStats());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((response: BaseResponse<DashboardStatsData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getDashboardStats().then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getDashboardStats());
  }, [apply]);

  return { data, isLoading, error, refresh };
}
