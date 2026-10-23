import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { toKycDocumentList, toVendorList } from '@/types/vendor';
import { VendorPage } from './vendor-page';

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

const getVendors = vi.fn();
const getVendorDocuments = vi.fn();
const approveVendor = vi.fn();
const rejectVendor = vi.fn();
const suspendVendor = vi.fn();
const updateVendorCommission = vi.fn();
const verifyVendorDocument = vi.fn();

vi.mock('@/lib/api/api.service', () => ({
  apiService: {
    getVendors: (query: unknown) => getVendors(query),
    getVendorDocuments: (query: unknown) => getVendorDocuments(query),
    approveVendor: (id: string, body: unknown) => approveVendor(id, body),
    rejectVendor: (id: string, body: unknown) => rejectVendor(id, body),
    suspendVendor: (id: string, body: unknown) => suspendVendor(id, body),
    updateVendorCommission: (id: string, body: unknown) => updateVendorCommission(id, body),
    verifyVendorDocument: (id: string, body: unknown) => verifyVendorDocument(id, body),
  },
}));

describe('VendorPage', () => {
  beforeEach(() => {
    getVendors.mockReset();
    getVendorDocuments.mockReset();
    getVendors.mockResolvedValue({
      status: true,
      message: 'ok',
      data: toVendorList({
        totalRecord: 1,
        currentPage: 1,
        limit: 10,
        vendorList: [{ vendorId: 'v1', shopName: 'Demo Shop' }],
      }),
    });
    getVendorDocuments.mockResolvedValue({
      status: true,
      message: 'ok',
      data: toKycDocumentList({ totalRecord: 0 }),
    });
  });

  afterEach(() => cleanup());

  it('keeps the vendor list loaded when the tab is switched and switched back', async () => {
    render(<VendorPage />);

    expect(await screen.findByText('Demo Shop')).toBeInTheDocument();
    expect(getVendors).toHaveBeenCalledTimes(1);

    await userEvent.click(screen.getByRole('tab', { name: 'KYC documents' }));
    await waitFor(() => expect(getVendorDocuments).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('tab', { name: 'Vendors' }));

    expect(screen.getByText('Demo Shop')).toBeInTheDocument();
    expect(getVendors).toHaveBeenCalledTimes(1);
  });

  it('loads the KYC documents only once', async () => {
    render(<VendorPage />);

    await userEvent.click(screen.getByRole('tab', { name: 'KYC documents' }));
    await waitFor(() => expect(getVendorDocuments).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('tab', { name: 'Vendors' }));
    await userEvent.click(screen.getByRole('tab', { name: 'KYC documents' }));

    expect(getVendorDocuments).toHaveBeenCalledTimes(2);
  });
});
