'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { ApiRequest, BaseResponse } from '@/lib/api/contract';
import {
  toCategoryList,
  toBrandList,
  toTagList,
  toAttributeList,
  toCollectionList,
} from '@/types/catalog';

type ListData = ReturnType<
  | typeof toCategoryList
  | typeof toBrandList
  | typeof toTagList
  | typeof toAttributeList
  | typeof toCollectionList
>;

interface CatalogListOptions {
  kind: 'categories' | 'brands' | 'tags' | 'attributes' | 'collections';
  pageSize?: number;
  initialFilters?: Record<string, string>;
}

export function useCatalog({ kind, pageSize = 10, initialFilters }: CatalogListOptions) {
  const [data, setData] = useState<ListData>(toCategoryList());
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
      case 'categories':
        res = await apiService.getCategories({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive as 'true' | 'false' } : {}),
        });
        break;
      case 'brands':
        res = await apiService.getBrands({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive as 'true' | 'false' } : {}),
        });
        break;
      case 'tags':
        res = await apiService.getTags({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
        });
        break;
      case 'attributes':
        res = await apiService.getAttributes({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive } : {}),
          ...(query.filters.isVariant ? { isVariant: query.filters.isVariant as 'true' | 'false' } : {}),
          ...(query.filters.isFilterable ? { isFilterable: query.filters.isFilterable as 'true' | 'false' } : {}),
        });
        break;
      case 'collections':
        res = await apiService.getCollections({
          page: query.page,
          limit: pageSize,
          ...(query.search ? { search: query.search } : {}),
          ...(query.filters.isActive ? { isActive: query.filters.isActive } : {}),
        });
        break;
    }
    if (res.status) return { data: res.data, error: '' };
    return { data: toCategoryList(), error: res.message };
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
          case 'categories':
            res = await apiService.deleteCategory(id);
            break;
          case 'brands':
            res = await apiService.deleteBrand(id);
            break;
          case 'tags':
            res = await apiService.deleteTag(id);
            break;
          case 'attributes':
            res = await apiService.deleteAttribute(id);
            break;
          case 'collections':
            res = await apiService.deleteCollection(id);
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
          case 'categories':
            res = await apiService.createCategory(values);
            break;
          case 'brands':
            res = await apiService.createBrand(values);
            break;
          case 'tags':
            res = await apiService.createTag(values);
            break;
          case 'attributes':
            res = await apiService.createAttribute(values);
            break;
          case 'collections':
            res = await apiService.createCollection(values);
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
          case 'categories':
            res = await apiService.updateCategory(id, values);
            break;
          case 'brands':
            res = await apiService.updateBrand(id, values);
            break;
          case 'tags':
            res = await apiService.updateTag(id, values);
            break;
          case 'attributes':
            res = await apiService.updateAttribute(id, values);
            break;
          case 'collections':
            res = await apiService.updateCollection(id, values);
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
