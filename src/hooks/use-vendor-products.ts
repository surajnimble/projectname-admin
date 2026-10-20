import { useCallback, useEffect, useState } from 'react';
import { VENDOR_PAGE_SIZE } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ProductListData } from '@/lib/api/contract';
import { toProductList } from '@/types/product';

export function useVendorProducts(vendorId: string, enabled = true) {
  const [data, setData] = useState<ProductListData>(toProductList());
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);

  const apply = useCallback((response: BaseResponse<ProductListData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setData(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let active = true;
    void apiService
      .getVendorProducts(vendorId, { page, limit: VENDOR_PAGE_SIZE })
      .then((response) => {
        if (active) apply(response);
      });
    return () => {
      active = false;
    };
  }, [apply, enabled, page, vendorId]);

  return { data, isLoading, error, page, setPage };
}
