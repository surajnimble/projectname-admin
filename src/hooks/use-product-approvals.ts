import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRODUCT_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ProductApprovalListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toProductApprovalList } from '@/types/product';

interface ApprovalsQuery {
  page: number;
  search: string;
  vendorId: string;
}

interface ApprovalsCacheEntry {
  data: ProductApprovalListData;
  query: ApprovalsQuery;
}

let cache: ApprovalsCacheEntry | null = null;

export const resetProductApprovalsCache = () => {
  cache = null;
};

const isSameQuery = (a: ApprovalsQuery, b: ApprovalsQuery) =>
  a.page === b.page && a.search === b.search && a.vendorId === b.vendorId;

export function useProductApprovals() {
  const [initial] = useState(() => cache);
  const [data, setData] = useState<ProductApprovalListData>(initial?.data ?? toProductApprovalList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [vendorId, setVendorIdState] = useState(initial?.query.vendorId ?? '');
  const debouncedSearch = useDebouncedValue(search);

  const query: ApprovalsQuery = useMemo(
    () => ({ page, search: debouncedSearch, vendorId }),
    [page, debouncedSearch, vendorId],
  );

  const apply = useCallback((response: BaseResponse<ProductApprovalListData>, next: ApprovalsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void apiService.getPendingProductApprovals({
      page: query.page,
      limit: PRODUCT_PAGE_SIZE,
      ...(query.search ? { search: query.search } : {}),
      ...(query.vendorId ? { vendorId: query.vendorId } : {}),
    }).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.productApprovals) cache = null;
      }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getPendingProductApprovals({
      page: query.page,
      limit: PRODUCT_PAGE_SIZE,
      ...(query.search ? { search: query.search } : {}),
      ...(query.vendorId ? { vendorId: query.vendorId } : {}),
    }), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setVendorId = useCallback((value: string) => {
    setVendorIdState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((value: number) => setPage(value), []);

  const approve = useCallback(async (productId: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.approveProduct(productId);
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  const reject = useCallback(async (productId: string, reason: string) => {
    setIsActioning(true);
    setActionError('');
    const response = await apiService.rejectProduct(productId, { reason });
    setIsActioning(false);
    if (!response.status) {
      setActionError(response.message);
      return false;
    }
    await refresh();
    return true;
  }, [refresh]);

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    vendorId,
    setPage: changePage,
    setSearch,
    setVendorId,
    refresh,
    approve,
    reject,
  };
}
