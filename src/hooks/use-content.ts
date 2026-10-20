'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest, BaseResponse } from '@/lib/api/contract';
import { toPageList, toBlogList, toFaqList, toBannerList } from '@/types/content';

type ListData = ReturnType<
  | typeof toPageList
  | typeof toBlogList
  | typeof toFaqList
  | typeof toBannerList
>;

interface ContentListOptions {
  kind: 'pages' | 'blogs' | 'faqs' | 'banners';
  pageSize?: number;
  initialFilters?: Record<string, string>;
}

export function useContent({ kind, pageSize = 10, initialFilters }: ContentListOptions) {
  const [data, setData] = useState<ListData>(toPageList());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(1);
  const [search, setSearchState] = useState('');
  const [filters, setFiltersState] = useState<Record<string, string>>(initialFilters ?? {});
  const debouncedSearch = useDebouncedValue(search);

  const query = useMemo(
    () => ({ page, search: debouncedSearch, filters }),
    [page, debouncedSearch, filters],
  );

  const fetchList = useCallback(async (): Promise<{ data: ListData; error: string }> => {
    let res: BaseResponse<ListData>;
    switch (kind) {
      case 'pages':
        res = await apiService.getPages({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isPublished ? { isPublished: query.filters.isPublished as 'true' | 'false' } : {}),
        });
        break;
      case 'blogs':
        res = await apiService.getBlogs({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isPublished ? { isPublished: query.filters.isPublished as 'true' | 'false' } : {}),
          ...(query.filters.tag ? { tag: query.filters.tag } : {}),
        });
        break;
      case 'faqs':
        res = await apiService.getFaqs({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.category ? { category: query.filters.category } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive as 'true' | 'false' } : {}),
        });
        break;
      case 'banners':
        res = await apiService.getBanners({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.type ? { type: query.filters.type } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive as 'true' | 'false' } : {}),
        });
        break;
    }
    if (res.status) return { data: res.data, error: '' };
    return { data: toPageList(), error: res.message };
  }, [kind, query, pageSize]);

  useEffect(() => {
    let active = true;
    void (async () => {
      const result = await fetchList();
      if (active) {
        setData(result.data);
        setError(result.error);
        setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [fetchList]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setFilters = useCallback((values: Record<string, string>) => {
    setFiltersState(values);
    setPage(1);
  }, []);

  const changePage = useCallback((next: number) => setPage(next), []);

  const activeRef = useRef(false);

  const refresh = useCallback(async () => {
    activeRef.current = true;
    setIsLoading(true);
    const result = await fetchList();
    if (activeRef.current) {
      setData(result.data);
      setError(result.error);
      setIsLoading(false);
    }
  }, [fetchList]);

  const deleteItem = useCallback(
    async (id: string) => {
      setIsActioning(true);
      setActionError('');
      try {
        let res: BaseResponse<unknown>;
        switch (kind) {
          case 'pages':
            res = await apiService.deletePage(id);
            break;
          case 'blogs':
            res = await apiService.deleteBlog(id);
            break;
          case 'faqs':
            res = await apiService.deleteFaq(id);
            break;
          case 'banners':
            res = await apiService.deleteBanner(id);
            break;
        }
        setIsActioning(false);
        if (!res.status) {
          setActionError(res.message);
          return false;
        }
        await refresh();
        return true;
      } catch {
        setIsActioning(false);
        setActionError('Delete failed');
        return false;
      }
    },
    [kind, refresh],
  );

  const createItem = useCallback(
    async (values: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        let res: BaseResponse<unknown>;
        switch (kind) {
          case 'pages':
            res = await apiService.createPage(values);
            break;
          case 'blogs':
            res = await apiService.createBlog(values);
            break;
          case 'faqs':
            res = await apiService.createFaq(values);
            break;
          case 'banners':
            res = await apiService.createBanner(values);
            break;
        }
        setIsActioning(false);
        if (!res.status) {
          setActionError(res.message);
          return false;
        }
        await refresh();
        return true;
      } catch {
        setIsActioning(false);
        setActionError('Create failed');
        return false;
      }
    },
    [kind, refresh],
  );

  const updateItem = useCallback(
    async (id: string, values: ApiRequest) => {
      setIsActioning(true);
      setActionError('');
      try {
        let res: BaseResponse<unknown>;
        switch (kind) {
          case 'pages':
            res = await apiService.updatePage(id, values);
            break;
          case 'blogs':
            res = await apiService.updateBlog(id, values);
            break;
          case 'faqs':
            res = await apiService.updateFaq(id, values);
            break;
          case 'banners':
            res = await apiService.updateBanner(id, values);
            break;
        }
        setIsActioning(false);
        if (!res.status) {
          setActionError(res.message);
          return false;
        }
        await refresh();
        return true;
      } catch {
        setIsActioning(false);
        setActionError('Update failed');
        return false;
      }
    },
    [kind, refresh],
  );

  return {
    data,
    isLoading,
    error,
    actionError,
    isActioning,
    page,
    search,
    filters,
    setPage: changePage,
    setSearch,
    setFilters,
    refresh,
    deleteItem,
    createItem,
    updateItem,
    clearActionError: () => setActionError(''),
  };
}
