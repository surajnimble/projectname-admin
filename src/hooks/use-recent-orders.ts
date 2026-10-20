import { useCallback, useEffect, useState } from 'react';
import { DASHBOARD_WIDGET_LIMIT, ORDER_PLACED_ACTION } from '@/constants';
import type { ActivityLogListData, BaseResponse } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toActivityLogList } from '@/types/activity';

const QUERY = {
  page: 1,
  limit: DASHBOARD_WIDGET_LIMIT,
  action: ORDER_PLACED_ACTION,
} as const;

export function useRecentOrders() {
  const [data, setData] = useState<ActivityLogListData>(toActivityLogList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const apply = useCallback((response: BaseResponse<ActivityLogListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getActivityLogs(QUERY).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getActivityLogs(QUERY));
  }, [apply]);

  return { data, isLoading, error, refresh };
}
