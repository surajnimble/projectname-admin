import { useCallback, useEffect, useMemo, useState } from 'react';
import { PRODUCT_PAGE_SIZE, ROUTES, type ProductStatus } from '@/constants';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ProductListData } from '@/lib/api/contract';
import { onScopeDropped } from '@/lib/api/navigation-cache';
import {
  runProductAction,
  type ProductAction,
  type ProductActionValues,
} from '@/lib/api/product-actions';
import { forgetProduct, rememberProduct } from '@/lib/api/seed-store';
import { toProductList } from '@/types/product';

export type ProductStatusFilter = ProductStatus | '';

interface ProductsQuery {
  page: number;
  search: string;
  status: ProductStatusFilter;
  inStock: boolean;
  isFeatured: boolean;
}

interface ProductsCacheEntry {
  data: ProductListData;
  query: ProductsQuery;
}

// The list is kept between visits so returning from a product page does not refetch it.
const cache = new Map<string, ProductsCacheEntry>();

export const resetVendorProductsCache = () => cache.clear();

const isSameQuery = (a: ProductsQuery, b: ProductsQuery) =>
  a.page === b.page &&
  a.search === b.search &&
  a.status === b.status &&
  a.inStock === b.inStock &&
  a.isFeatured === b.isFeatured;

export function useVendorProducts(vendorId: string) {
  const [initial] = useState(() => cache.get(vendorId));
  const [data, setData] = useState<ProductListData>(initial?.data ?? toProductList());
  const [isLoading, setIsLoading] = useState(!initial);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);
  const [page, setPage] = useState(initial?.query.page ?? 1);
  const [search, setSearch] = useState(initial?.query.search ?? '');
  const [status, setStatus] = useState<ProductStatusFilter>(initial?.query.status ?? '');
  const [inStock, setInStock] = useState(initial?.query.inStock ?? false);
  const [isFeatured, setIsFeatured] = useState(initial?.query.isFeatured ?? false);
  const debouncedSearch = useDebouncedValue(search);

  const query: ProductsQuery = useMemo(
    () => ({
      page,
      search: debouncedSearch,
      status,
      inStock,
      isFeatured,
    }),
    [debouncedSearch, inStock, isFeatured, page, status],
  );

  const load = useCallback(
    (next: ProductsQuery) =>
      apiService.getProducts({
        page: next.page,
        limit: PRODUCT_PAGE_SIZE,
        vendorId,
        ...(next.search ? { search: next.search } : {}),
        ...(next.status ? { status: next.status } : {}),
        ...(next.inStock ? { inStock: true } : {}),
        ...(next.isFeatured ? { isFeatured: true } : {}),
      }),
    [vendorId],
  );

  const apply = useCallback(
    (response: BaseResponse<ProductListData>, next: ProductsQuery) => {
      setError(response.status ? '' : response.message);
      if (response.status) {
        setData(response.data);
        response.data.itemList.forEach(rememberProduct);
        cache.set(vendorId, { data: response.data, query: next });
      }
      setIsLoading(false);
    },
    [vendorId],
  );

  useEffect(() => {
    const entry = cache.get(vendorId);
    if (entry && isSameQuery(entry.query, query)) return;
    let active = true;
    void load(query).then((response) => {
      if (active) apply(response, query);
    });
    return () => {
      active = false;
    };
  }, [apply, load, query, vendorId]);

  useEffect(
    () =>
      onScopeDropped((scope) => {
        if (scope === ROUTES.vendorDetails(vendorId)) {
          cache.delete(vendorId);
          data.itemList.forEach((product) => forgetProduct(product.productId));
        }
      }),
    [data.itemList, vendorId],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    apply(await load(query), query);
  }, [apply, load, query]);

  const updateSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const updateStatus = useCallback((value: ProductStatusFilter) => {
    setStatus(value);
    setPage(1);
  }, []);

  const updateInStock = useCallback((value: boolean) => {
    setInStock(value);
    setPage(1);
  }, []);

  const updateFeatured = useCallback((value: boolean) => {
    setIsFeatured(value);
    setPage(1);
  }, []);

  const changePage = useCallback((value: number) => setPage(value), []);

  const runAction = useCallback(
    async (
      action: ProductAction,
      productId: string,
      values: ProductActionValues = {},
    ) => {
      setIsActioning(true);
      setActionError('');
      const response = await runProductAction(action, productId, values);
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
    error,
    actionError,
    isActioning,
    page,
    search,
    status,
    inStock,
    isFeatured,
    setPage: changePage,
    setSearch: updateSearch,
    setStatus: updateStatus,
    setInStock: updateInStock,
    setIsFeatured: updateFeatured,
    refresh,
    runAction,
  };
}
