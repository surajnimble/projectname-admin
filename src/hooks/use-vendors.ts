import { useCallback, useEffect, useState } from 'react';
import { VENDOR_PAGE_SIZE, VENDOR_STATUSES, type VendorStatusFilter } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, VendorListData } from '@/lib/api/contract';
import { runVendorAction, type VendorAction, type VendorActionValues } from '@/lib/api/vendor-actions';
import { toVendorList } from '@/types/vendor';

export function useVendors() {
  const [page, setPage] = useState(1);
  const [status, setStatusState] = useState<VendorStatusFilter>(VENDOR_STATUSES.all);
  const [search, setSearchState] = useState('');
  const [hasDocuments, setHasDocumentsState] = useState(false);
  const [data, setData] = useState<VendorListData>(toVendorList());
  const [isLoading, setIsLoading] = useState(true);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const apply = useCallback((response: BaseResponse<VendorListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
    setIsFetching(false);
  }, []);

  const load = useCallback(
    (
      nextPage: number,
      nextStatus: VendorStatusFilter,
      nextSearch: string,
      nextHasDocuments: boolean,
    ) =>
      apiService.getVendors({
        page: nextPage,
        limit: VENDOR_PAGE_SIZE,
        ...(nextStatus !== VENDOR_STATUSES.all ? { status: nextStatus } : {}),
        ...(nextSearch ? { search: nextSearch } : {}),
        ...(nextHasDocuments ? { hasDocuments: true } : {}),
      }),
    [],
  );

  useEffect(() => {
    let active = true;
    void load(page, status, debouncedSearch, hasDocuments).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply, debouncedSearch, hasDocuments, load, page, status]);

  const refresh = useCallback(async () => {
    setIsFetching(true);
    apply(await load(page, status, debouncedSearch, hasDocuments));
  }, [apply, debouncedSearch, hasDocuments, load, page, status]);

  const changePage = useCallback((next: number) => {
    setIsFetching(true);
    setPage(next);
  }, []);

  const setStatus = useCallback((next: VendorStatusFilter) => {
    setIsFetching(true);
    setStatusState(next);
    setPage(1);
  }, []);

  const setSearch = useCallback((next: string) => {
    setIsFetching(true);
    setSearchState(next);
    setPage(1);
  }, []);

  const setHasDocuments = useCallback((next: boolean) => {
    setIsFetching(true);
    setHasDocumentsState(next);
    setPage(1);
  }, []);

  const runAction = useCallback(
    async (action: VendorAction, vendorId: string, values: VendorActionValues = {}) => {
      setIsActioning(true);
      setActionError('');
      const response = await runVendorAction(action, vendorId, values);
      setIsActioning(false);
      if (!response.status) {
        setActionError(response.message);
        return false;
      }
      await refresh();
      return true;
    },
    [refresh],
  );

  return {
    data,
    isLoading,
    isFetching,
    error,
    actionError,
    isActioning,
    page,
    status,
    search,
    hasDocuments,
    setPage: changePage,
    setStatus,
    setSearch,
    setHasDocuments,
    refresh,
    runAction,
  };
}
