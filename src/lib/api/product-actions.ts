import type { ProductStatus } from '@/constants';
import { apiService } from './api.service';

export type ProductAction = 'status' | 'stock' | 'delete';

export interface ProductActionValues {
  status?: ProductStatus;
  stock?: number;
  lowStockThreshold?: number;
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

  return apiService.deleteProduct(productId);
};
