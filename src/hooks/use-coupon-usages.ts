'use client';

import { useCallback, useEffect, useState } from 'react';
import { COUPON_PAGE_SIZE } from '@/constants';
import { apiService } from '@/lib/api/api.service';
import type { CouponUsageListData } from '@/lib/api/contract';
import { toCouponUsageList } from '@/types/coupon-usage';

const emptyPage = (): CouponUsageListData => toCouponUsageList();

export function useCouponUsages(couponId: string | null, open: boolean) {
  const [data, setData] = useState<CouponUsageListData>(emptyPage);
  const [page, setPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchUsages = useCallback(async () => {
    if (!couponId || !open) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await apiService.getCouponUsages(couponId, {
        page,
        limit: COUPON_PAGE_SIZE,
      });
      if (response.status) setData(response.data);
      else setError(response.message);
    } catch {
      setError('Failed to load coupon usage history.');
    } finally {
      setIsLoading(false);
    }
  }, [couponId, open, page]);

  useEffect(() => {
    if (!open) {
      setPage(1);
      setData(emptyPage());
      setError('');
      return;
    }
    void fetchUsages();
  }, [open, couponId, fetchUsages]);

  const changePage = useCallback((nextPage: number) => setPage(nextPage), []);

  return { data, page, isLoading, error, refresh: fetchUsages, setPage: changePage };
}
