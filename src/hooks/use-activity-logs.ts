import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ActivityLogListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import { ROUTES } from '@/constants';
import { toActivityLogList } from '@/types/activity';

interface ActivityLogsQuery {
  page: number;
  search: string;
  action: string;
}

interface ActivityLogsCacheEntry {
  data: ActivityLogListData;
  query: ActivityLogsQuery;
}

let cache: ActivityLogsCacheEntry | null = null;

export const resetActivityLogsCache = () => {
  cache = null;
};

const isSameQuery = (a: ActivityLogsQuery, b: ActivityLogsQuery) =>
  a.page === b.page && a.search === b.search && a.action === b.action;

export function useActivityLogs() {
  const [initial] = useState(() => cache);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearchState] = useState(initial?.query.search ?? '');
  const [action, setActionState] = useState(initial?.query.action ?? '');
  const [data, setData] = useState<ActivityLogListData>(initial?.data ?? toActivityLogList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const query: ActivityLogsQuery = useMemo(
    () => ({ page, search: debouncedSearch, action }),
    [debouncedSearch, page, action],
  );

  const apply = useCallback((response: BaseResponse<ActivityLogListData>, next: ActivityLogsQuery) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setData(response.data);
      cache = { data: response.data, query: next };
    }
    setIsLoading(false);
    setIsFetching(false);
  }, []);

  const load = useCallback(
    (next: ActivityLogsQuery) =>
      apiService.getActivityLogs({
        page: next.page,
        limit: 10,
        ...(next.search ? { search: next.search } : {}),
        ...(next.action ? { action: next.action } : {}),
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
      if (scope === ROUTES.activityLogs) cache = null;
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

  const setSearch = useCallback((next: string) => {
    setIsFetching(true);
    setSearchState(next);
    setPage(1);
  }, []);

  const setAction = useCallback((next: string) => {
    setIsFetching(true);
    setActionState(next);
    setPage(1);
  }, []);

  return {
    data,
    isLoading,
    isFetching,
    error,
    page,
    search,
    action,
    setPage: changePage,
    setSearch,
    setAction,
    refresh,
  };
}
