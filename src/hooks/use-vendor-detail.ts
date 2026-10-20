import { useCallback, useEffect, useState } from 'react';
import { runVendorAction, type VendorAction, type VendorActionValues } from '@/lib/api/vendor-actions';
import type { BaseResponse, VendorData, VendorRatingSummaryData } from '@/lib/api/contract';
import { apiService } from '@/lib/api/api.service';
import { toVendor, toVendorRatings } from '@/types/vendor';

export function useVendorDetail(vendorId: string) {
  const [vendor, setVendor] = useState<VendorData>(toVendor());
  const [ratings, setRatings] = useState<VendorRatingSummaryData>(toVendorRatings());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [isActioning, setIsActioning] = useState(false);

  const apply = useCallback((response: BaseResponse<VendorData>) => {
    setError(response.status ? '' : response.message);
    if (response.status) setVendor(response.data);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    let active = true;
    void apiService.getVendorById(vendorId).then((response) => {
      if (active) apply(response);
    });
    void apiService.getVendorRatings(vendorId).then((response) => {
      if (active && response.status) setRatings(response.data);
    });
    return () => {
      active = false;
    };
  }, [apply, vendorId]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
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
      setVendor(response.data);
      return true;
    },
    [vendorId],
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
    error,
    actionError,
    isActioning,
    refresh,
    runAction,
    verifyDocument,
  };
}
