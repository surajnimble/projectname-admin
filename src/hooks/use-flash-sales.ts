import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type { FlashSaleListData } from '@/lib/api/contract';
import type { ApiRequest } from '@/lib/api/contract/api-request';
import { toFlashSaleList } from '@/types/review';

export function useFlashSales() {
  const [data, setData] = useState<FlashSaleListData>({
    totalRecord: 0,
    totalPage: 0,
    currentPage: 1,
    limit: 20,
    hasNext: false,
    hasPrevious: false,
    nextPage: 0,
    previousPage: 0,
    itemList: [],
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [actionError, setActionError] = useState('');

  const page = 1;

  const load = useCallback(async () => {
    const response = await apiService.getFlashSales({ page, limit: 20 });
    if (!response.status) {
      setError(response.message);
      return response;
    }
    setData(toFlashSaleList(response.data));
    return response;
  }, [page]);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let active = true;
    void load().then((response) => {
      if (!active) return;
      setIsLoading(false);
      if (!response.status) setError(response.message);
    });
    return () => {
      active = false;
    };
  }, [load]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const createFlashSale = useCallback(
    async (body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.createFlashSale(body);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load],
  );

  const updateFlashSale = useCallback(
    async (id: string, body: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.updateFlashSale(id, body);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load],
  );

  const deleteFlashSale = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.deleteFlashSale(id);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await load();
      return true;
    },
    [load],
  );

  const retry = useCallback(() => {
    setIsLoading(true);
    void load();
  }, [load]);

  return {
    data,
    isLoading,
    error,
    isActioning,
    actionError,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
    retry,
  };
}
