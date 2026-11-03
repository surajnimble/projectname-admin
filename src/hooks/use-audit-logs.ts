import { useCallback, useEffect, useMemo, useState } from 'react';
import { AUDIT_LOG_PAGE_SIZE, ROUTES } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, AuditLogListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { toAuditLogList } from '@/types/audit';

interface AuditLogsQuery {
  page: number;
  search: string;
}

interface AuditLogsCacheEntry {
  data: AuditLogListData;
  query: AuditLogsQuery;
}

let cache: AuditLogsCacheEntry | null = null;

export const resetAuditLogsCache = () => {
  cache = null;
};

const isSameQuery = (a: AuditLogsQuery, b: AuditLogsQuery) =>
  a.page === b.page && a.search === b.search;

export function useAuditLogs() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [data, setData] = useState<AuditLogListData>(initial?.data ?? toAuditLogList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const query: AuditLogsQuery = useMemo(
    () => ({ page, search: debouncedSearch }),
    [debouncedSearch, page],
  );

  const apply = useCallback((response: BaseResponse<AuditLogListData>, next: AuditLogsQuery) => {
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
    void apiService.getAuditLogs({
      page: query.page,
      limit: AUDIT_LOG_PAGE_SIZE,
      ...(query.search ? { search: query.search } : {}),
    }).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, query]);

  useEffect(() => {
    return onScopeDropped((scope) => {
      if (scope === ROUTES.auditLogs) cache = null;
    });
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await apiService.getAuditLogs({
      page: query.page,
      limit: AUDIT_LOG_PAGE_SIZE,
      ...(query.search ? { search: query.search } : {}),
    }), query);
  }, [apply, query]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => {
    setPage(next);
  }, []);

  return {
    data,
    isLoading,
    error,
    page,
    search,
    setPage: changePage,
    setSearch,
    refresh,
  };
}
