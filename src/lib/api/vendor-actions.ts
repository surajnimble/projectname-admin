import { apiService } from './api.service';

export type VendorAction = 'approve' | 'reject' | 'suspend' | 'reactivate' | 'commission';

export interface VendorActionValues {
  reason?: string;
  commissionRate?: number;
  remark?: string;
}

export const runVendorAction = async (
  action: VendorAction,
  vendorId: string,
  values: VendorActionValues = {},
) => {
  switch (action) {
    case 'approve':
      return apiService.approveVendor(vendorId, {
        commissionRate: values.commissionRate,
        remark: values.remark,
      });
    case 'reactivate':
      return apiService.approveVendor(vendorId, { commissionRate: values.commissionRate });
    case 'commission':
      return apiService.updateVendorCommission(vendorId, {
        commissionRate: values.commissionRate ?? 0,
      });
    case 'reject':
      return apiService.rejectVendor(vendorId, { reason: values.reason ?? '' });
    case 'suspend':
      return apiService.suspendVendor(vendorId, { reason: values.reason ?? '' });
  }
};
