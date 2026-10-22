import { renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { toProductList } from '@/types/product';
import { resetSeedStore } from '@/lib/api/seed-store';
import { useVendorProducts } from './use-vendor-products';

const getProducts = vi.fn();
const toggleProductStatus = vi.fn();
const updateProductStock = vi.fn();
const deleteProduct = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getProducts: (query: unknown) => getProducts(query),
    toggleProductStatus: (id: string, body: unknown) => toggleProductStatus(id, body),
    updateProductStock: (id: string, body: unknown) => updateProductStock(id, body),
    deleteProduct: (id: string) => deleteProduct(id),
  },
}));

const list = toProductList({
  totalRecord: 1,
  currentPage: 1,
  limit: 10,
  productList: [{ productId: 'p1', name: 'Demo Product', status: 'ACTIVE' }],
});

describe('useVendorProducts', () => {
  beforeEach(() => {
    resetSeedStore();
    getProducts.mockReset();
    toggleProductStatus.mockReset();
    updateProductStock.mockReset();
    deleteProduct.mockReset();
    getProducts.mockResolvedValue({ status: true, message: 'ok', data: list });
    toggleProductStatus.mockResolvedValue({ status: true, message: 'ok', data: {} });
    updateProductStock.mockResolvedValue({ status: true, message: 'ok', data: {} });
    deleteProduct.mockResolvedValue({ status: true, message: 'ok', data: {} });
  });

  it('loads the products of the vendor', async () => {
    const { result } = renderHook(() => useVendorProducts('v1'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(getProducts).toHaveBeenCalledWith({ page: 1, limit: 10, vendorId: 'v1' });
    expect(result.current.data.itemList).toHaveLength(1);
  });

  it('sends the status and stock filters', async () => {
    const { result } = renderHook(() => useVendorProducts('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    result.current.setStatus('ACTIVE');
    result.current.setInStock(true);

    await waitFor(() =>
      expect(getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        vendorId: 'v1',
        status: 'ACTIVE',
        inStock: true,
      }),
    );
  });

  it('changes the product status', async () => {
    const { result } = renderHook(() => useVendorProducts('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('status', 'p1', { status: 'INACTIVE' });

    expect(done).toBe(true);
    expect(toggleProductStatus).toHaveBeenCalledWith('p1', { status: 'INACTIVE' });
  });

  it('updates the stock', async () => {
    const { result } = renderHook(() => useVendorProducts('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('stock', 'p1', { stock: 12 });

    expect(done).toBe(true);
    expect(updateProductStock).toHaveBeenCalledWith('p1', { stock: 12 });
  });

  it('reports a failed action', async () => {
    deleteProduct.mockResolvedValue({ status: false, message: 'Not allowed.', data: {} });
    const { result } = renderHook(() => useVendorProducts('v1'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const done = await result.current.runAction('delete', 'p1', {});

    expect(done).toBe(false);
    await waitFor(() => expect(result.current.actionError).toBe('Not allowed.'));
  });
});
