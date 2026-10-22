import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { resetVendorProductsCache } from '@/hooks/use-vendor-products';
import { toProductList } from '@/types/product';
import { resetSeedStore } from '@/lib/api/seed-store';
import { ProductList } from './product-list';

const getProducts = vi.fn();
const getProductById = vi.fn();
const toggleProductStatus = vi.fn();
const updateProductStock = vi.fn();
const deleteProduct = vi.fn();
const showSuccess = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getProducts: (query: unknown) => getProducts(query),
    getProductById: (id: string) => getProductById(id),
    toggleProductStatus: (id: string, body: unknown) => toggleProductStatus(id, body),
    updateProductStock: (id: string, body: unknown) => updateProductStock(id, body),
    deleteProduct: (id: string) => deleteProduct(id),
  },
}));

vi.mock('@/lib/utils/toast', () => ({
  showSuccess: (message: string) => showSuccess(message),
}));

const list = toProductList({
  totalRecord: 1,
  currentPage: 1,
  limit: 10,
  productList: [
    {
      productId: 'p1',
      name: 'Demo Product',
      sku: 'SKU-1',
      price: 999,
      mrpPrice: 1299,
      stock: 4,
      isActive: true,
      imageList: [],
      categoryData: { categoryId: 'c1', name: 'Mobiles' },
    },
  ],
});

describe('ProductList', () => {
  beforeEach(() => {
    resetSeedStore();
    resetVendorProductsCache();
    getProducts.mockReset();
    getProductById.mockReset();
    toggleProductStatus.mockReset();
    updateProductStock.mockReset();
    deleteProduct.mockReset();
    showSuccess.mockReset();
    getProducts.mockResolvedValue({ status: true, message: 'ok', data: list });
    toggleProductStatus.mockResolvedValue({ status: true, message: 'ok', data: {} });
    updateProductStock.mockResolvedValue({ status: true, message: 'ok', data: {} });
    deleteProduct.mockResolvedValue({ status: true, message: 'ok', data: {} });
  });

  afterEach(() => cleanup());

  it('lists the products of the vendor', async () => {
    render(<ProductList vendorId="v1" />);

    expect(await screen.findByText('Demo Product')).toBeInTheDocument();
    expect(getProducts).toHaveBeenCalledWith({ page: 1, limit: 10, vendorId: 'v1' });
  });

  it('opens the filter sheet and applies a status filter only on done', async () => {
    render(<ProductList vendorId="v1" />);

    fireEvent.click(await screen.findByRole('button', { name: /filters/i }));
    expect(await screen.findByRole('heading', { name: 'Filter products' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('radio', { name: 'Draft' }));
    expect(getProducts).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Done' }));

    await waitFor(() =>
      expect(getProducts).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        vendorId: 'v1',
        status: 'DRAFT',
      }),
    );
  });

  it('changes the product status from the row menu', async () => {
    render(<ProductList vendorId="v1" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Product actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Change status' }));
    fireEvent.click(await screen.findByRole('radio', { name: 'Inactive' }));
    fireEvent.click(screen.getByRole('button', { name: 'Save status' }));

    await waitFor(() =>
      expect(toggleProductStatus).toHaveBeenCalledWith('p1', { status: 'INACTIVE' }),
    );
    expect(showSuccess).toHaveBeenCalledWith('Product status updated.');
  });

  it('updates the stock from the row menu', async () => {
    render(<ProductList vendorId="v1" />);

    fireEvent.click(await screen.findByRole('button', { name: 'Product actions' }));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Update stock' }));

    fireEvent.change(await screen.findByLabelText('Stock'), { target: { value: '9' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save stock' }));

    await waitFor(() => expect(updateProductStock).toHaveBeenCalledWith('p1', { stock: 9 }));
  });
});
