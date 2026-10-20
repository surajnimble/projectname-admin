import type { ProductStatus } from '@/constants';
import { apiService } from './api.service';

export type ProductAction = 'status' | 'stock' | 'delete' | 'approve' | 'reject' | 'submit';

export interface ProductActionValues {
  status?: ProductStatus;
  stock?: number;
  lowStockThreshold?: number;
  reason?: string;
}

export const runProductAction = async (
  action: ProductAction,
  productId: string,
  values: ProductActionValues = {},
) => {
  if (action === 'status') {
    return apiService.toggleProductStatus(productId, { status: values.status ?? 'ACTIVE' });
  }

  if (action === 'stock') {
    return apiService.updateProductStock(productId, {
      stock: values.stock ?? 0,
      ...(values.lowStockThreshold === undefined
        ? {}
        : { lowStockThreshold: values.lowStockThreshold }),
    });
  }

  if (action === 'approve') {
    return apiService.approveProduct(productId);
  }

  if (action === 'reject') {
    return apiService.rejectProduct(productId, { reason: values.reason ?? '' });
  }

  if (action === 'submit') {
    return apiService.submitProductForApproval(productId);
  }

  return apiService.deleteProduct(productId);
};
