import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type { OrderDetailData } from '@/lib/api/contract';
import { toOrderDetail } from '@/types/order';

export function useOrderDetail(orderId: string) {
  const [order, setOrder] = useState<OrderDetailData>(toOrderDetail());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const load = useCallback(async () => {
    const response = await apiService.getOrderDetails(orderId);
    setError(response.status ? '' : response.message);
    if (response.status) setOrder(response.data);
    setIsLoading(false);
  }, [orderId]);

  useEffect(() => {
    let active = true;
    void apiService.getOrderDetails(orderId).then((response) => {
      if (!active) return;
      setError(response.status ? '' : response.message);
      if (response.status) setOrder(response.data);
      setIsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [orderId]);

  const updateStatus = useCallback(
    async (values: { status: string; remark?: string; location?: string }) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateOrderStatus(orderId, {
        status: values.status,
        ...(values.remark ? { remark: values.remark } : {}),
        ...(values.location ? { location: values.location } : {}),
      });
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load, orderId],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return { order, isLoading, error, actionError, isActioning, updateStatus, retry };
}
