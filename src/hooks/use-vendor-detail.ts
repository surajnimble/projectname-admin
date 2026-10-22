import { useCallback, useEffect, useState } from 'react';
import { apiService } from '@/lib/api/api.service';
import type { BaseResponse, VendorData, VendorRatingSummaryData } from '@/lib/api/contract';
import {
  rememberVendorDetail,
  rememberVendorRatings,
  vendorDetailSeed,
  vendorRatingsSeed,
  vendorSeed,
} from '@/lib/api/seed-store';
import { runVendorAction, type VendorAction, type VendorActionValues } from '@/lib/api/vendor-actions';
import { toVendor, toVendorRatings } from '@/types/vendor';

export function useVendorDetail(vendorId: string) {
  const [cachedDetail] = useState(() => vendorDetailSeed(vendorId));
  const [cachedRatings] = useState(() => vendorRatingsSeed(vendorId));
  const [seed] = useState(() => cachedDetail ?? vendorSeed(vendorId));
  const [vendor, setVendor] = useState<VendorData>(seed ?? toVendor());
  const [ratings, setRatings] = useState<VendorRatingSummaryData>(
    cachedRatings ?? toVendorRatings(),
  );
  const [isPending, setIsPending] = useState(!cachedDetail);
  const [isLoading, setIsLoading] = useState(!seed);
  const [isRatingsLoading, setIsRatingsLoading] = useState(!cachedRatings);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const apply = useCallback((response: BaseResponse<VendorData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) {
      setVendor(response.data);
      rememberVendorDetail(response.data);
    }
    setIsLoading(false);
    setIsPending(false);
  }, []);

  useEffect(() => {
    if (vendorDetailSeed(vendorId)) return;
    let active = true;
    void apiService.getVendorById(vendorId).then((response) => {
      if (active) apply(response);
    });
    return () => {
      active = false;
    };
  }, [apply, vendorId]);

  useEffect(() => {
    if (vendorRatingsSeed(vendorId)) return;
    let active = true;
    void apiService.getVendorRatings(vendorId).then((response) => {
      if (!active) return;
      if (response.status) {
        setRatings(response.data);
        rememberVendorRatings(vendorId, response.data);
      }
      setIsRatingsLoading(false);
    });
    return () => {
      active = false;
    };
  }, [vendorId]);

  const refresh = useCallback(async () => {
    setIsPending(true);
    apply(await apiService.getVendorById(vendorId));
  }, [apply, vendorId]);

  const runAction = useCallback(
    async (action: VendorAction, values: VendorActionValues = {}) => {
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
    [refresh, vendorId],
  );

  const verifyDocument = useCallback(
    async (documentId: string, isVerified: boolean, remark?: string) => {
      setIsActioning(true);
      setActionError('');
      const response = await apiService.verifyVendorDocument(documentId, { isVerified, remark });
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
    vendor,
    ratings,
    isLoading,
    isPending,
    isRatingsLoading,
    error,
    actionError,
    isActioning,
    refresh,
    runAction,
    verifyDocument,
  };
}
