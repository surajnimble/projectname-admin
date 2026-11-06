import { useCallback, useEffect, useMemo, useState } from 'react';
import { CONTENT_PAGE_SIZE, ROUTES } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, FlashSaleListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toFlashSaleList } from '@/types/flash-sale';

export type FlashSaleScope = 'all' | 'live' | 'upcoming' | 'ended';
interface FlashSalesQuery { page: number; scope: FlashSaleScope; isActive: string; }
interface FlashSalesCache { data: FlashSaleListData; query: FlashSalesQuery; }

let cache: FlashSalesCache | null = null;
export const resetFlashSalesCache = () => { cache = null; };
const sameQuery = (a: FlashSalesQuery, b: FlashSalesQuery) =>
  a.page === b.page && a.scope === b.scope && a.isActive === b.isActive;

export function useFlashSales() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [scope, setScope] = useState<FlashSaleScope>(initial?.query.scope ?? 'all');
  const [isActive, setIsActive] = useState(initial?.query.isActive ?? '');
  const [data, setData] = useState<FlashSaleListData>(initial?.data ?? toFlashSaleList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [isActioning, setIsActioning] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const query = useMemo(() => ({ page, scope, isActive }), [page, scope, isActive]);
  const apply = useCallback((response: BaseResponse<FlashSaleListData>, next: FlashSalesQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);
  const request = useCallback((next: FlashSalesQuery) => apiService.getFlashSales({
    page: next.page,
    limit: CONTENT_PAGE_SIZE,
    scope: next.scope,
    ...(next.isActive ? { isActive: next.isActive as 'true' | 'false' } : {}),
  }), []);

  useEffect(() => {
    if (cache && sameQuery(cache.query, query)) return;
    let active = true;
    void request(query).then((response) => { if (active) apply(response, query); });
    return () => { active = false; };
  }, [apply, query, request]);

  useEffect(() => onScopeDropped((dropped) => {
    if (dropped === ROUTES.flashSales) cache = null;
  }), []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await request(query), query);
  }, [apply, query, request]);

  const runMutation = useCallback(async <T,>(action: () => Promise<BaseResponse<T>>) => {
    setIsActioning(true);
    setActionError('');
    const response = await action();
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const createFlashSale = useCallback((body: Record<string, unknown>) =>
    runMutation(() => apiService.createFlashSale(body)), [runMutation]);
  const updateFlashSale = useCallback((id: string, body: Record<string, unknown>) =>
    runMutation(() => apiService.updateFlashSale(id, body)), [runMutation]);
  const deleteFlashSale = useCallback((id: string) =>
    runMutation(() => apiService.deleteFlashSale(id)), [runMutation]);
  const changePage = useCallback((value: number) => setPage(value), []);
  const changeScope = useCallback((value: FlashSaleScope) => { setScope(value); setPage(1); }, []);
  const changeActive = useCallback((value: string) => { setIsActive(value); setPage(1); }, []);

  return {
    data, isLoading, isActioning, error, actionError, page, scope, isActive,
    setPage: changePage, setScope: changeScope, setIsActive: changeActive,
    refresh, createFlashSale, updateFlashSale, deleteFlashSale,
  };
}
