import { useCallback, useEffect, useMemo, useState } from 'react';
import { ROUTES, VENDOR_PAGE_SIZE, VENDOR_STATUSES, type VendorStatusFilter } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, VendorListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { runVendorAction, type VendorAction, type VendorActionValues } from '@/lib/api/vendor-actions';
import { rememberVendor } from '@/lib/api/seed-store';
import { toVendorList } from '@/types/vendor';

interface VendorsQuery {
  page: number;
  status: VendorStatusFilter;
  search: string;
  hasDocuments: boolean;
}

interface VendorsCacheEntry {
  data: VendorListData;
  query: VendorsQuery;
}

// The list is kept between visits so coming back from a vendor page does not refetch it.
let cache: VendorsCacheEntry | null = null;

export const resetVendorsCache = () => {
  cache = null;
};

const isSameQuery = (a: VendorsQuery, b: VendorsQuery) =>
  a.page === b.page &&
  a.status === b.status &&
  a.search === b.search &&
  a.hasDocuments === b.hasDocuments;

export function useVendors() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [status, setStatusState] = useState<VendorStatusFilter>(
    initial?.query.status ?? VENDOR_STATUSES.all,
  );
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [hasDocuments, setHasDocumentsState] = useState(initial?.query.hasDocuments ?? false);
  const [data, setData] = useState<VendorListData>(initial?.data ?? toVendorList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const debouncedSearch = useDebouncedValue(search);

  const query: VendorsQuery = useMemo(
    () => ({ page, status, search: debouncedSearch, hasDocuments }),
    [debouncedSearch, hasDocuments, page, status],
  );

  const apply = useCallback((response: BaseResponse<VendorListData>, next: VendorsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      response.data.itemList.forEach(rememberVendor);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
    setIsFetching(false);
  }, []);

  const load = useCallback(
    (next: VendorsQuery) =>
      apiService.getVendors({
        page: next.page,
        limit: VENDOR_PAGE_SIZE,
        ...(next.status !== VENDOR_STATUSES.all ? { status: next.status } : {}),
        ...(next.search ? { search: next.search } : {}),
        ...(next.hasDocuments ? { hasDocuments: true } : {}),
      }),
    [],
  );

  useEffect(() => {
    if (cache && isSameQuery(cache.query, query)) return;
    let active = true;
    void load(query).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, load, query]);

  useEffect(
    () => onScopeDropped((scope) => {
      if (scope === ROUTES.vendors) cache = null;
    }),
    [],
  );

  const refresh = useCallback(async () => {
    setIsFetching(true);
    apply(await load(query), query);
  }, [apply, load, query]);


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
