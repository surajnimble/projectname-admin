import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { toVendor } from '@/types/vendor';
import { resetSeedStore } from '@/lib/api/seed-store';
import { VendorDetails } from './vendor-details';

const getVendorById = vi.fn();
const getVendorRatings = vi.fn();
const getVendorProducts = vi.fn();
const getProducts = vi.fn();
const getProductById = vi.fn();
const verifyVendorDocument = vi.fn();
const approveVendor = vi.fn();
const updateVendorCommission = vi.fn();
const rejectVendor = vi.fn();
const suspendVendor = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendorById: (id: string) => getVendorById(id),
    getVendorRatings: (id: string) => getVendorRatings(id),
    getVendorProducts: (id: string, query: unknown) => getVendorProducts(id, query),
    getProducts: (query: unknown) => getProducts(query),
    getProductById: (id: string) => getProductById(id),
    verifyVendorDocument: (id: string, body: unknown) => verifyVendorDocument(id, body),
    approveVendor: (id: string, body: unknown) => approveVendor(id, body),
    updateVendorCommission: (id: string, body: unknown) => updateVendorCommission(id, body),
    rejectVendor: (id: string, body: unknown) => rejectVendor(id, body),
    suspendVendor: (id: string, body: unknown) => suspendVendor(id, body),
  },
}));

const vendor = toVendor({
  vendorId: 'v1',
  shopName: 'Demo Shop',
  slug: 'demo-shop',
  status: 'APPROVED',
  commissionRate: 10,
  rating: 4.5,
  pendingAmount: 1200,
  userData: { name: 'Rahul', email: 'rahul@demo.com' },
  bankData: { bankHolderName: 'Rahul', bankAccountNo: '4111111111111111' },
  documentList: [{ documentId: 'd1', docType: 'GST', isVerified: false }],
});

const firstOf = (items: HTMLElement[]) => {
  const [first] = items;
  if (!first) throw new Error('no matching element');
  return first;
};

describe('VendorDetails', () => {
  beforeEach(() => {
    resetSeedStore();
    getVendorById.mockReset();
    getVendorRatings.mockReset();
    getVendorProducts.mockReset();
    getProducts.mockReset();
    getProductById.mockReset();
    verifyVendorDocument.mockReset();
    approveVendor.mockReset();
    updateVendorCommission.mockReset();
    rejectVendor.mockReset();
    suspendVendor.mockReset();
    getVendorById.mockResolvedValue({ status: true, message: 'ok', data: vendor });
    getVendorRatings.mockResolvedValue({
      status: true,
      message: 'ok',
      data: { average: 4.5, total: 8, breakdownList: [{ star: 5, count: 6, percent: 75 }] },
    });
    getProducts.mockResolvedValue({
      status: true,
      message: 'ok',
      data: {
        totalRecord: 1,
        currentPage: 1,
        limit: 10,
        itemList: [
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
      },
    });
  });

  afterEach(() => cleanup());

  it('shows the shop, the owner and the masked bank account', async () => {
    render(<VendorDetails vendorId="v1" />);

    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    expect(screen.getByText('rahul@demo.com')).toBeInTheDocument();
    expect(screen.getByText('•••• 1111')).toBeInTheDocument();
  });

  it('lists the products of the vendor', async () => {
    render(<VendorDetails vendorId="v1" />);

    expect(await screen.findByText('Demo Product')).toBeInTheDocument();
    expect(screen.getByText('₹999')).toBeInTheDocument();
  });

  it('keeps the loaded data when the screen is opened again', async () => {
    const { unmount } = render(<VendorDetails vendorId="v1" />);
    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    unmount();

    render(<VendorDetails vendorId="v1" />);

    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    expect(screen.getByText('•••• 1111')).toBeInTheDocument();
    expect(getVendorById).toHaveBeenCalledTimes(1);
  });

  it('opens the commission dialog and saves the new rate', async () => {
    updateVendorCommission.mockResolvedValue({ status: true, message: 'ok', data: vendor });
    render(<VendorDetails vendorId="v1" />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Vendor actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Commission' }));
    expect(await screen.findByRole('heading', { name: 'Update commission' })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Commission rate (%)'), { target: { value: '15' } });
    fireEvent.click(screen.getByRole('button', { name: 'Save commission' }));

    await waitFor(() =>
      expect(updateVendorCommission).toHaveBeenCalledWith('v1', { commissionRate: 15 }),
    );
  });

  it('verifies a KYC document from the details page', async () => {    verifyVendorDocument.mockResolvedValue({ status: true, message: 'ok', data: {} });
    render(<VendorDetails vendorId="v1" />);

    fireEvent.click(firstOf(await screen.findAllByRole('button', { name: 'Document actions' })));
    fireEvent.click(await screen.findByRole('menuitem', { name: 'Verify' }));
    fireEvent.click(await screen.findByRole('button', { name: 'Verify document' }));

    await waitFor(() =>
      expect(verifyVendorDocument).toHaveBeenCalledWith('d1', {
        isVerified: true,
        remark: undefined,
      }),
    );
  });
});
