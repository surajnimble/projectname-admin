import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, ProductDetailData } from '@/lib/api/contract';
import { productSeed } from '@/lib/api/seed-store';
import {
  runProductAction,
  type ProductAction,
  type ProductActionValues,
} from '@/lib/api/product-actions';
import { toProductDetail } from '@/types/product';

export function useProductDetail(productId: string, enabled: boolean) {
  const [seed] = useState(() => (enabled ? productSeed(productId) : undefined));
  const [product, setProduct] = useState<ProductDetailData>(
    seed ? toProductDetail(seed) : toProductDetail(),
  );
  const [isPending, setIsPending] = useState(enabled);
  const [isLoading, setIsLoading] = useState(enabled && !seed);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const apply = useCallback((response: BaseResponse<ProductDetailData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setProduct(response.data);
    setIsLoading(false);
    setIsPending(false);
  }, []);

  useEffect(() => {
    if (!enabled || !productId) return;
    let active = true;
    void apiService.getProductById(productId).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply, enabled, productId]);

  const refresh = useCallback(async () => {
    setIsPending(true);
    apply(await apiService.getProductById(productId));
  }, [apply, productId]);

  const runAction = useCallback(
    async (action: ProductAction, values: ProductActionValues = {}) => {
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
    [productId, refresh],
  );

  return {
    product,
    isLoading: isLoading || (enabled && isPending && !seed),
    isPending,
    error,
    actionError,
    isActioning,
    refresh,
    runAction,
  };
}
